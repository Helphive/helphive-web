// Unread badge for Messages (main bundle; no chat library). Live count from the chat runtime while it is loaded,
// otherwise GET /auth/chat/unread-count every 60 s while the tab is visible (contract section 7).
import { useEffect, useSyncExternalStore } from 'react';
import { apiSlice } from '@/store/api/apiSlice';
import { liveUnreadStore } from './chatBridge';

const POLL_MS = 60_000;

export const chatUnreadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getChatUnreadCount: builder.query<{ unreadCount: number; conversations: number }, void>({
            query: () => '/auth/chat/unread-count',
        }),
    }),
});

const subscribeVisibility = (cb: () => void) => {
    document.addEventListener('visibilitychange', cb);
    return () => document.removeEventListener('visibilitychange', cb);
};
const isVisible = () => document.visibilityState !== 'hidden';

/** Unread chat messages, or null when chat is not available (hide the badge). */
export function useChatUnread(enabled = true): number | null {
    const visible = useSyncExternalStore(subscribeVisibility, isVisible);
    const live = useSyncExternalStore(liveUnreadStore.subscribe, liveUnreadStore.get);
    const { data, error } = chatUnreadApi.useGetChatUnreadCountQuery(undefined, {
        skip: !enabled,
        pollingInterval: visible && live === null ? POLL_MS : 0,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    // Polling pauses while the tab is hidden; RTK's focus listener (visibilitychange) refetches on return.
    if (!enabled) return null;
    if (live !== null) return live;
    const status = (error as { status?: number } | undefined)?.status;
    if (status === 503) return null; // chat_not_configured: hide chat

    return data?.unreadCount ?? 0;
}

const PREFIX = /^\(\d+\+?\)\s/;

/** Prefixes the document title with the unread count, "(3) Bookings | HelpHive", whatever page sets the title. */
export function useUnreadTitle(count: number | null) {
    useEffect(() => {
        const apply = () => {
            const base = document.title.replace(PREFIX, '');
            const next = count ? `(${count > 99 ? '99+' : count}) ${base}` : base;
            if (document.title !== next) document.title = next;
        };
        apply();
        const titleEl = document.querySelector('title');
        if (!titleEl) return;
        const observer = new MutationObserver(apply);
        observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
        return () => {
            observer.disconnect();
            document.title = document.title.replace(PREFIX, '');
        };
    }, [count]);
}
