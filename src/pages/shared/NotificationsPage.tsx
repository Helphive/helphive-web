import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, List, Tab, Tabs, Typography } from '@mui/material';
import { DoneAll, NotificationsNoneOutlined } from '@mui/icons-material';
import {
    NOTIFICATIONS_PAGE_SIZE,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    type NotificationFilter,
} from '@/features/notifications/notificationsApi';
import NotificationItem from '@/features/notifications/NotificationItem';
import { groupNotifications, type UserArea } from '@/features/notifications/notificationMeta';
import { useNotificationActions } from '@/features/notifications/useNotificationActions';
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from '@/components/ui';
import TabLabel from '@/components/common/TabLabel';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useAutoLoadMore } from '@/hooks/useAutoLoadMore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { layout } from '@/theme/tokens';

export default function NotificationsPage({ area }: { area: UserArea }) {
    useDocumentTitle('Notifications');
    const snackbar = useSnackbar();
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery(
        { filter, limit: NOTIFICATIONS_PAGE_SIZE, cursor },
        { refetchOnMountOrArgChange: 30 }
    );
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
    const { open, remove } = useNotificationActions(area);

    const notifications = data?.notifications;
    const groups = useMemo(() => groupNotifications(notifications ?? []), [notifications]);
    const hasMore = !!data?.hasMore && !!data.nextCursor;

    const sentinelRef = useAutoLoadMore(
        () => {
            if (data?.nextCursor) setCursor(data.nextCursor);
        },
        hasMore && !isFetching && !isError
    );

    const handleFilter = (_: unknown, value: NotificationFilter) => {
        setFilter(value);
        setCursor(undefined);
    };

    const handleMarkAll = async () => {
        try {
            await markAllRead().unwrap();
            snackbar.success('All notifications marked as read');
        } catch {
            snackbar.error('Could not mark notifications as read');
        }
    };

    const unreadCount = data?.unreadCount ?? 0;

    return (
        <Box sx={{ maxWidth: layout.narrowMaxWidth + 40 }}>
            <PageHeader
                title="Notifications"
                subtitle="Updates about your bookings, payments and account."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={isMarkingAll ? <CircularProgress size={16} /> : <DoneAll />}
                        onClick={handleMarkAll}
                        disabled={isMarkingAll || unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                }
            />

            <Tabs
                value={filter}
                onChange={handleFilter}
                aria-label="Filter notifications"
                sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab value="all" label="All" />
                <Tab
                    value="unread"
                    label={<TabLabel label="Unread" count={unreadCount || undefined} />}
                />
            </Tabs>

            {isLoading ? (
                <ListSkeleton rows={5} withHeader={false} label="Loading notifications" />
            ) : isError && !notifications?.length ? (
                <ErrorState
                    title="Could not load notifications"
                    message="Check your connection and try again."
                    onRetry={() => refetch()}
                />
            ) : groups.length === 0 ? (
                <EmptyState
                    icon={<NotificationsNoneOutlined />}
                    title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    description={
                        filter === 'unread'
                            ? 'You are all caught up.'
                            : 'Booking, payment and account updates will show up here.'
                    }
                />
            ) : (
                <Box sx={{ display: 'grid', gap: 3 }}>
                    {groups.map((group) => (
                        <Box
                            component="section"
                            key={group.label}
                            aria-labelledby={`group-${group.label}`}
                        >
                            <Typography
                                id={`group-${group.label}`}
                                variant="subtitle2"
                                component="h2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                {group.label}
                            </Typography>
                            <Panel flush sx={{ overflow: 'hidden' }}>
                                <List disablePadding>
                                    {group.items.map((n) => (
                                        <NotificationItem
                                            key={n._id}
                                            notification={n}
                                            onOpen={open}
                                            onDelete={remove}
                                        />
                                    ))}
                                </List>
                            </Panel>
                        </Box>
                    ))}
                    <Box ref={sentinelRef} sx={{ height: 1 }} />
                    {isFetching && !!cursor && (
                        <ListSkeleton
                            rows={2}
                            withHeader={false}
                            label="Loading more notifications"
                        />
                    )}
                    {isError && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button variant="outlined" onClick={() => refetch()}>
                                Could not load more. Try again
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
