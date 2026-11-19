// The only chat code in the main bundle besides the unread badge. It holds no chat library: the CometChat
// runtime (a lazy chunk) registers itself here, so sign-out can run the contract's order (chat first, then
// POST /auth/logout) and the badge can use the live count while the library is loaded.
import { store } from '@/store';

export interface ChatRuntimeHandle {
    /** Contract section 3, steps 1 and 2: viewing null, then CometChat.logout(). Never throws. */
    signOut: (reason: 'signout' | 'switched') => Promise<void>;
}

let runtime: ChatRuntimeHandle | null = null;
export const registerChatRuntime = (handle: ChatRuntimeHandle) => {
    runtime = handle;
};

// sessionStorage: set while this tab's CometChat SDK holds a signed-in session (the SDK itself stores its session
// in sessionStorage too). Holds the server-issued appId/region so sign-out can reach the SDK after a reload.
const MARK_KEY = 'hh-chat-session';
const DRAFT_PREFIX = 'hh-chat-draft:';

export interface ChatMark {
    appId: string;
    region: string;
}

export const readChatMark = (): ChatMark | null => {
    try {
        const raw = sessionStorage.getItem(MARK_KEY);
        return raw ? (JSON.parse(raw) as ChatMark) : null;
    } catch {
        return null;
    }
};

export const writeChatMark = (mark: ChatMark | null) => {
    try {
        if (mark) sessionStorage.setItem(MARK_KEY, JSON.stringify(mark));
        else sessionStorage.removeItem(MARK_KEY);
    } catch {
        // Storage blocked: sign-out still works while the page stays open.
    }
};

export const draftKey = (me: string, withUid: string) => `${DRAFT_PREFIX}${me}:${withUid}`;

const clearDrafts = () => {
    try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(DRAFT_PREFIX)) sessionStorage.removeItem(key);
        }
    } catch {
        // Nothing stored.
    }
};

/* Live unread count from the chat library; null while it is not loaded (the badge polls the server then). */
let liveUnread: number | null = null;
const unreadListeners = new Set<() => void>();
export const liveUnreadStore = {
    get: () => liveUnread,
    set: (value: number | null) => {
        if (value === liveUnread) return;
        liveUnread = value;
        unreadListeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
        unreadListeners.add(listener);
        return () => unreadListeners.delete(listener);
    },
};

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
    Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);

let signingOut: Promise<void> | null = null;

/**
 * Signs this tab out of chat. Call it before POST /auth/logout. Loads the runtime only when this tab has a chat
 * session from before a reload. Bounded so a slow chat service never blocks the app's own sign-out.
 */
export function signOutChat(reason: 'signout' | 'switched' = 'signout'): Promise<void> {
    if (signingOut) return signingOut;
    signingOut = (async () => {
        try {
            let handle = runtime;
            if (!handle && readChatMark()) {
                handle = (await withTimeout(import('./runtime/chatRuntime'), 4000)).chatRuntime;
            }
            if (handle) await withTimeout(handle.signOut(reason), 4000);
        } catch {
            // The server revokes the chat token on POST /auth/logout whatever happens here.
        } finally {
            writeChatMark(null);
            clearDrafts();
            liveUnreadStore.set(null);
            signingOut = null;
        }
    })();
    return signingOut;
}

/* The tab's user changed: sign out of chat (a 401 that ended the session, sign-out, or a different account). */
const userIdOf = (state: ReturnType<typeof store.getState>) => state.auth.user?._id ?? null;
let lastUserId = userIdOf(store.getState());
store.subscribe(() => {
    const uid = userIdOf(store.getState());
    if (uid === lastUserId) return;
    const previous = lastUserId;
    lastUserId = uid;
    if (previous) void signOutChat();
});

// Another tab signed out or signed in as someone else: this tab's chat must not stay signed in as the old user.
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key !== 'helphive-auth' && event.key !== null) return;
        let storedUid: string | null = null;
        try {
            const raw = localStorage.getItem('helphive-auth');
            storedUid = raw
                ? ((JSON.parse(raw) as { user?: { _id?: string } }).user?._id ?? null)
                : null;
        } catch {
            storedUid = null;
        }
        if (lastUserId && storedUid !== lastUserId) void signOutChat('switched');
    });
}
