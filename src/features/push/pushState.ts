// What this browser can do about notifications right now, as a tiny store the settings row and the soft prompt read.
// It never loads the SDK: permission comes from the browser, "opted in" is filled in by pushSession.ts.
import { useSyncExternalStore } from 'react';

export type PushSupport = 'ok' | 'ios-home-screen' | 'unsupported';

/** The words the UI uses. 'off' covers both "never asked" and "turned off here". */
export type PushStatus = 'unsupported' | 'ios-home-screen' | 'blocked' | 'off' | 'on' | 'checking';

export interface PushSnapshot {
    support: PushSupport;
    permission: NotificationPermission;
    /** true / false once known; null while the SDK has not reported yet (only when permission is granted). */
    optedIn: boolean | null;
    busy: boolean;
}

export function detectSupport(): PushSupport {
    if (typeof window === 'undefined') return 'unsupported';
    if (
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        window.isSecureContext
    ) {
        return 'ok';
    }
    // iPhone and iPad only offer web push to a site that was added to the Home Screen.
    const ua = navigator.userAgent;
    const ios =
        /iPhone|iPad|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios ? 'ios-home-screen' : 'unsupported';
}

const readPermission = (): NotificationPermission =>
    typeof Notification === 'undefined' ? 'default' : Notification.permission;

let snapshot: PushSnapshot = {
    support: detectSupport(),
    permission: readPermission(),
    optedIn: null,
    busy: false,
};
const listeners = new Set<() => void>();

export const pushStore = {
    get: () => snapshot,
    set(patch: Partial<PushSnapshot>) {
        const next = { ...snapshot, ...patch };
        if (
            next.support === snapshot.support &&
            next.permission === snapshot.permission &&
            next.optedIn === snapshot.optedIn &&
            next.busy === snapshot.busy
        ) {
            return;
        }
        snapshot = next;
        listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

/** Re-reads the browser permission (after a prompt, or when someone changes it in the site settings). */
export const refreshPermission = () => pushStore.set({ permission: readPermission() });

// The browser tells us when someone changes the permission in its site settings.
if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
    navigator.permissions
        .query({ name: 'notifications' })
        .then((status) => status.addEventListener('change', refreshPermission))
        .catch(() => undefined);
}

/** Resolves once the permission is no longer "default" (the person answered the browser's prompt). */
export const permissionDecided = () =>
    new Promise<void>((resolve) => {
        if (snapshot.permission !== 'default') return resolve();
        const stop = pushStore.subscribe(() => {
            if (snapshot.permission === 'default') return;
            stop();
            resolve();
        });
    });

export function statusOf(s: PushSnapshot): PushStatus {
    if (s.support !== 'ok') return s.support;
    if (s.permission === 'denied') return 'blocked';
    if (s.permission === 'default') return 'off';
    if (s.optedIn === null) return 'checking';
    return s.optedIn ? 'on' : 'off';
}

export function usePushSnapshot(): PushSnapshot {
    return useSyncExternalStore(pushStore.subscribe, pushStore.get);
}

export function usePushStatus(): PushStatus {
    return statusOf(usePushSnapshot());
}
