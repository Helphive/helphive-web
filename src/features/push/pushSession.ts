// Ties this browser's push subscription to the signed-in HelpHive session (chat contract sections 2, 3 and 8), the
// way the mobile app does: POST /auth/push/register -> OneSignal.login(externalId); sign-out -> OneSignal.logout().
//
// It watches the auth store, so it covers sign-in, a restored session, a different account in the same browser, a
// sign-out and a session the server ended, without touching any of that code. It never loads the SDK for someone who
// has not allowed notifications, never blocks sign-in or sign-out (everything runs in a queue, every wait is bounded,
// errors are swallowed and logged without personal data) and never calls the browser's permission prompt by itself.
import { store } from '@/store';
import { apiSlice } from '@/store/api/apiSlice';
import { notificationsApi } from '@/features/notifications/notificationsApi';
import { chatUnreadApi } from '@/features/chat/chatUnread';
import {
    isOneSignalLoaded,
    loadOneSignal,
    withTimeout,
    type ClickEvent,
    type ForegroundEvent,
    type OneSignalApi,
} from './oneSignal';
import { pushApi } from './pushApi';
import { internalPath, openConversationUid } from './pushPaths';
import { detectSupport, permissionDecided, pushStore, refreshPermission } from './pushState';

const BOUND_KEY = 'hh-push-bound'; // user id this browser's subscription was last attached to
const OFF_PREFIX = 'hh-push-off:'; // this person turned notifications off in this browser
const LOAD_MS = 8000;
const CALL_MS = 5000;

const log = (what: string, error?: unknown) => {
    // Never the payload, an id or a message: only what failed and a status code or name.
    const status = (error as { status?: number } | undefined)?.status;
    console.warn(`[push] ${what}`, status ?? (error instanceof Error ? error.message : ''));
};

const store$ = {
    get: (key: string) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key: string, value: string | null) => {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch {
            // Storage blocked: the browser state is still right, we just cannot remember it.
        }
    },
};

const signedInUserId = (): string | null => {
    const { user, accessToken } = store.getState().auth;
    return accessToken ? (user?._id ?? null) : null;
};

/* One thing at a time, in order: sign-out, sign-in and the buttons never race each other. */
let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const result = queue.then(task);
    queue = result.catch(() => undefined);
    return result;
};

/** This session's external id from the server, or null (409 push_session_unknown is expected and quiet). */
async function registerWithServer(): Promise<string | null> {
    try {
        const answer = await store.dispatch(pushApi.endpoints.registerPush.initiate()).unwrap();
        return answer.externalId;
    } catch (error) {
        if ((error as { status?: number })?.status !== 409) log('register failed', error);
        return null;
    }
}

/* What the page does when a push arrives or is clicked (the SDK reports both while a HelpHive tab is open). */
let navigateTo: ((path: string) => void) | null = null;
export const setPushNavigator = (navigate: ((path: string) => void) | null) => {
    navigateTo = navigate;
};

/** Refreshes the bell's list and badge and the Messages badge, so nothing waits for the next poll. */
export function refreshNotificationData() {
    const { dispatch, getState } = store;
    dispatch(apiSlice.util.invalidateTags(['NotificationCount']));
    const lists = [
        { filter: 'all', limit: 20 },
        { filter: 'unread', limit: 20 },
        { filter: 'all', limit: 5 },
    ] as const;
    for (const args of lists) {
        const cached = notificationsApi.endpoints.getNotifications.select(args)(getState());
        if (cached.status !== 'uninitialized') {
            dispatch(
                notificationsApi.endpoints.getNotifications.initiate(args, {
                    forceRefetch: true,
                    subscribe: false,
                })
            );
        }
    }
    if (
        chatUnreadApi.endpoints.getChatUnreadCount.select()(getState()).status !== 'uninitialized'
    ) {
        dispatch(
            chatUnreadApi.endpoints.getChatUnreadCount.initiate(undefined, {
                forceRefetch: true,
                subscribe: false,
            })
        );
    }
}

function onForeground(event: ForegroundEvent) {
    refreshNotificationData();
    const data = event.notification.additionalData ?? {};
    // A message from the person whose conversation is open and in front: no notification on top of it. (The server
    // already holds these back while the open conversation is reporting itself as viewed.)
    if (
        data.type === 'chat_message' &&
        document.visibilityState === 'visible' &&
        document.hasFocus() &&
        typeof data.senderUid === 'string' &&
        openConversationUid(window.location.pathname) === data.senderUid
    ) {
        try {
            event.preventDefault();
        } catch (error) {
            log('could not hold back a notification', error);
        }
    }
}

function onClick(event: ClickEvent) {
    const raw = event.result?.url ?? event.notification?.launchURL;
    const path = internalPath(raw, window.location.origin, import.meta.env.DEV);
    if (!path) return;
    if (path === window.location.pathname + window.location.search) return;
    if (navigateTo) navigateTo(path);
    else window.location.assign(path);
}

const wired = new WeakSet<OneSignalApi>();
function wire(sdk: OneSignalApi) {
    if (wired.has(sdk)) return;
    wired.add(sdk);
    sdk.Notifications.addEventListener('foregroundWillDisplay', onForeground);
    sdk.Notifications.addEventListener('click', onClick);
    sdk.User.PushSubscription.addEventListener('change', (event) => {
        if (signedInUserId() && event.current?.optedIn !== undefined) {
            pushStore.set({ optedIn: !!event.current.optedIn });
        }
    });
}

const isOff = (userId: string) => store$.get(OFF_PREFIX + userId) === '1';

/** Detaches this browser from whoever it was signed in as. Safe to call when nothing is attached. */
async function detach() {
    if (!isOneSignalLoaded() && store$.get(BOUND_KEY) === null) return;
    try {
        const sdk = await withTimeout(loadOneSignal(), LOAD_MS);
        await withTimeout(sdk.logout(), CALL_MS);
        store$.set(BOUND_KEY, null);
    } catch (error) {
        // Offline or blocked: the marker stays, so the next page load tries again before anything else.
        log('could not sign out of push', error);
    }
}

/** Attaches this browser to the session: register on the server, then OneSignal.login(externalId). */
async function attach(userId: string): Promise<OneSignalApi | null> {
    const sdk = await withTimeout(loadOneSignal(), LOAD_MS);
    const externalId = await registerWithServer();
    if (!externalId || signedInUserId() !== userId) return null;
    await withTimeout(sdk.login(externalId), CALL_MS);
    store$.set(BOUND_KEY, userId);
    wire(sdk);
    return sdk;
}

/** After sign-in, a restored session or an account switch. Quiet when notifications are not allowed. */
async function bindSession(userId: string) {
    pushStore.set({ permission: refreshedPermission(), optedIn: null });
    if (pushStore.get().support !== 'ok') return;
    if (isOff(userId)) {
        await detach();
        pushStore.set({ optedIn: false });
        return;
    }
    if (pushStore.get().permission !== 'granted') {
        await detach();
        return;
    }
    try {
        const sdk = await attach(userId);
        if (sdk && signedInUserId() === userId) {
            pushStore.set({ optedIn: !!sdk.User.PushSubscription.optedIn });
        }
    } catch (error) {
        log('could not attach to push', error);
        pushStore.set({ optedIn: false });
    }
}

function refreshedPermission(): NotificationPermission {
    refreshPermission();
    return pushStore.get().permission;
}

async function onUserChanged(previous: string | null, next: string | null) {
    if (previous) await detach();
    if (next) await bindSession(next);
    else pushStore.set({ optedIn: null });
}

/** Turn notifications on for this browser. Call it from the button's click handler. */
export async function enablePush(): Promise<'on' | 'blocked' | 'dismissed' | 'error'> {
    const userId = signedInUserId();
    if (!userId || detectSupport() !== 'ok') return 'error';
    pushStore.set({ busy: true });
    try {
        // The browser's own prompt comes first, straight from the click, because some browsers only allow it then.
        if (Notification.permission === 'default') {
            // Some browsers answer through the permission change rather than the returned promise.
            await Promise.race([Notification.requestPermission(), permissionDecided()]);
            refreshPermission();
        }
        const permission = pushStore.get().permission;
        if (permission === 'denied') return 'blocked';
        if (permission !== 'granted') return 'dismissed';
        return await enqueue(async () => {
            store$.set(OFF_PREFIX + userId, null);
            const sdk = await attach(userId);
            if (!sdk) return 'error' as const;
            if (!sdk.User.PushSubscription.optedIn)
                await withTimeout(sdk.User.PushSubscription.optIn(), CALL_MS);
            pushStore.set({ optedIn: !!sdk.User.PushSubscription.optedIn });
            return sdk.User.PushSubscription.optedIn ? ('on' as const) : ('error' as const);
        });
    } catch (error) {
        log('could not turn on', error);
        return 'error';
    } finally {
        pushStore.set({ busy: false });
    }
}

/** Turn notifications off for this browser only: opt out here, then tell the server (DELETE /auth/push/register). */
export async function disablePush(): Promise<boolean> {
    const userId = signedInUserId();
    if (!userId) return false;
    pushStore.set({ busy: true });
    store$.set(OFF_PREFIX + userId, '1');
    try {
        return await enqueue(async () => {
            let sdk: OneSignalApi | null = null;
            try {
                sdk = await withTimeout(loadOneSignal(), LOAD_MS);
                await withTimeout(sdk.User.PushSubscription.optOut(), CALL_MS);
            } catch (error) {
                log('could not opt out', error);
            }
            let serverOk = true;
            try {
                await store.dispatch(pushApi.endpoints.unregisterPush.initiate()).unwrap();
            } catch (error) {
                serverOk = false;
                log('unregister failed', error);
            }
            if (sdk) {
                try {
                    await withTimeout(sdk.logout(), CALL_MS);
                    store$.set(BOUND_KEY, null);
                } catch (error) {
                    log('could not detach', error);
                }
            }
            pushStore.set({ optedIn: false });
            return serverOk && sdk !== null;
        });
    } finally {
        pushStore.set({ busy: false });
    }
}

/* Start: bind the session we start with, and follow every change of who is signed in. */
let current = signedInUserId();
store.subscribe(() => {
    const next = signedInUserId();
    if (next === current) return;
    const previous = current;
    current = next;
    void enqueue(() => onUserChanged(previous, next)).catch((error) =>
        log('session change failed', error)
    );
});
if (typeof window !== 'undefined') {
    // A signed-out browser that still holds a subscription from the last person (offline sign-out, closed tab) is
    // detached first, before anyone can sign in.
    void enqueue(() => (current ? bindSession(current) : detach())).catch((error) =>
        log('start failed', error)
    );
}
