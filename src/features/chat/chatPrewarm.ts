// Gets chat ready in the background once someone is signed in, so Messages opens with content instead of waiting
// for the chat library, its sign-in and the first lists. Main bundle; holds no chat library itself.
import { store } from '@/store';

type Connection = { saveData?: boolean; effectiveType?: string };

const whenIdle = (run: () => void) => {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 3000 });
    } else {
        setTimeout(run, 1200);
    }
};

const signedInUser = () => {
    const { user, accessToken } = store.getState().auth;
    return accessToken ? (user?._id ?? null) : null;
};

let warmedFor: string | null = null;

function prewarm() {
    const uid = signedInUser();
    if (!uid) {
        warmedFor = null;
        return;
    }
    if (warmedFor === uid) return;
    // People on a metered or very slow connection load chat when they open it, as before.
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return;
    warmedFor = uid;
    whenIdle(async () => {
        try {
            void import('./ui/MessagesPage');
            const { chatRuntime } = await import('./runtime/chatRuntime');
            if (signedInUser() !== uid) return;
            await chatRuntime.start();
            if (signedInUser() === uid) await chatRuntime.prefetch();
        } catch {
            // Messages loads itself when opened.
            if (warmedFor === uid) warmedFor = null;
        }
    });
}

if (typeof window !== 'undefined') {
    store.subscribe(prewarm);
    prewarm();
}
