import { apiSlice } from '@/store/api/apiSlice';
import type { Notification } from '@/types';

export type NotificationFilter = 'all' | 'unread';

export const NOTIFICATIONS_PAGE_SIZE = 20;
export const NOTIFICATIONS_PREVIEW_SIZE = 5;

export interface NotificationsArgs {
    filter: NotificationFilter;
    limit: number;
    cursor?: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    nextCursor: string | null;
    hasMore: boolean;
    unreadCount: number;
}

// Every cached list variant the UI can hold, so optimistic patches reach all of them.
const LIST_VARIANTS: Omit<NotificationsArgs, 'cursor'>[] = [
    { filter: 'all', limit: NOTIFICATIONS_PAGE_SIZE },
    { filter: 'unread', limit: NOTIFICATIONS_PAGE_SIZE },
    { filter: 'all', limit: NOTIFICATIONS_PREVIEW_SIZE },
];

type ListDraft = NotificationsResponse;

// Applies `patch` to every cached list variant plus the unread badge; rolls back on failure.
// `patch` returns true when it changed an unread item (used to adjust the badge count).
async function optimistic(
    {
        dispatch,
        queryFulfilled,
    }: {
        dispatch: (action: unknown) => unknown;
        queryFulfilled: Promise<unknown>;
    },
    patch: (draft: ListDraft, variant: Omit<NotificationsArgs, 'cursor'>) => boolean,
    setCountTo?: number
): Promise<void> {
    const undos: { undo: () => void }[] = [];
    let touchedUnread = false;
    for (const variant of LIST_VARIANTS) {
        undos.push(
            dispatch(
                notificationsApi.util.updateQueryData('getNotifications', variant, (draft) => {
                    if (patch(draft, variant)) touchedUnread = true;
                })
            ) as { undo: () => void }
        );
    }
    undos.push(
        dispatch(
            notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
                if (setCountTo !== undefined) draft.unreadCount = setCountTo;
                else if (touchedUnread) draft.unreadCount = Math.max(0, draft.unreadCount - 1);
            })
        ) as { undo: () => void }
    );
    try {
        await queryFulfilled;
    } catch {
        undos.forEach((p) => p.undo());
    }
    // Reconcile the badge with the server (covers items outside the cached pages).
    dispatch(apiSlice.util.invalidateTags(['NotificationCount']));
}

export const notificationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationsResponse, NotificationsArgs>({
            query: ({ filter, limit, cursor }) => ({
                url: '/auth/notifications',
                params: { filter, limit, ...(cursor ? { cursor } : {}) },
            }),
            // Pages of the same filter/limit share a single cache entry.
            serializeQueryArgs: ({ queryArgs }) => `${queryArgs.filter}-${queryArgs.limit}`,
            merge: (current, incoming, { arg }) => {
                if (!arg.cursor) {
                    // First page (initial load or refetch) replaces the cache.
                    return incoming;
                }
                const seen = new Set(current.notifications.map((n) => n._id));
                current.notifications.push(
                    ...incoming.notifications.filter((n) => !seen.has(n._id))
                );
                current.nextCursor = incoming.nextCursor;
                current.hasMore = incoming.hasMore;
                current.unreadCount = incoming.unreadCount;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
        }),
        getUnreadCount: builder.query<{ unreadCount: number }, void>({
            query: () => '/auth/notifications/unread-count',
            providesTags: ['NotificationCount'],
        }),
        markNotificationRead: builder.mutation<{ message?: string }, { notificationId: string }>({
            query: (body) => ({
                url: '/auth/mark-notification-read',
                method: 'POST',
                body,
            }),
            onQueryStarted: ({ notificationId }, api) =>
                optimistic(api, (draft, variant) => {
                    const item = draft.notifications.find((n) => n._id === notificationId);
                    const wasUnread = !!item && !item.read;
                    if (item) item.read = true;
                    if (variant.filter === 'unread') {
                        draft.notifications = draft.notifications.filter(
                            (n) => n._id !== notificationId
                        );
                    }
                    if (wasUnread) draft.unreadCount = Math.max(0, draft.unreadCount - 1);
                    return wasUnread;
                }),
        }),
        markAllNotificationsRead: builder.mutation<{ modifiedCount: number }, void>({
            query: () => ({
                url: '/auth/notifications/mark-all-read',
                method: 'POST',
            }),
            onQueryStarted: (_arg, api) =>
                optimistic(
                    api,
                    (draft, variant) => {
                        const hadUnread = draft.unreadCount > 0;
                        draft.notifications.forEach((n) => {
                            n.read = true;
                        });
                        if (variant.filter === 'unread') draft.notifications = [];
                        draft.unreadCount = 0;
                        return hadUnread;
                    },
                    0
                ),
        }),
        deleteNotification: builder.mutation<{ message: string }, { notificationId: string }>({
            query: ({ notificationId }) => ({
                url: `/auth/notifications/${notificationId}`,
                method: 'DELETE',
            }),
            onQueryStarted: ({ notificationId }, api) =>
                optimistic(api, (draft) => {
                    const item = draft.notifications.find((n) => n._id === notificationId);
                    const wasUnread = !!item && !item.read;
                    draft.notifications = draft.notifications.filter(
                        (n) => n._id !== notificationId
                    );
                    if (wasUnread) draft.unreadCount = Math.max(0, draft.unreadCount - 1);
                    return wasUnread;
                }),
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useDeleteNotificationMutation,
} = notificationsApi;
