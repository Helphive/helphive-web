import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    List,
    Paper,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { DoneAll, NotificationsNone, Refresh } from '@mui/icons-material';
import {
    NOTIFICATIONS_PAGE_SIZE,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    type NotificationFilter,
} from '@/features/notifications/notificationsApi';
import NotificationItem from '@/features/notifications/NotificationItem';
import { groupNotifications, type UserArea } from '@/features/notifications/notificationMeta';
import { useNotificationActions } from '@/features/notifications/useNotificationActions';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import TabLabel from '@/components/common/TabLabel';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useAutoLoadMore } from '@/hooks/useAutoLoadMore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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
        <>
            <PageHeader
                title="Notifications"
                subtitle="Updates about your bookings, payments and account"
                actions={
                    <Button
                        variant="outlined"
                        startIcon={
                            isMarkingAll ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <DoneAll />
                            )
                        }
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
                sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Tab value="all" label="All" />
                <Tab
                    value="unread"
                    label={<TabLabel label="Unread" count={unreadCount || undefined} />}
                />
            </Tabs>

            {isLoading ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Stack key={i} direction="row" spacing={1.5} sx={{ mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton width="40%" />
                                <Skeleton width="80%" />
                            </Box>
                        </Stack>
                    ))}
                </Paper>
            ) : isError && !notifications?.length ? (
                <EmptyState
                    icon={<Refresh />}
                    title="Could not load notifications"
                    action={
                        <Button variant="contained" onClick={() => refetch()}>
                            Try again
                        </Button>
                    }
                />
            ) : groups.length === 0 ? (
                <EmptyState
                    icon={<NotificationsNone />}
                    title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    description={
                        filter === 'unread'
                            ? 'You are all caught up.'
                            : 'Booking, payment and account updates will show up here.'
                    }
                />
            ) : (
                <Stack spacing={2.5}>
                    {groups.map((group) => (
                        <Box key={group.label}>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}
                            >
                                {group.label}
                            </Typography>
                            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
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
                            </Paper>
                        </Box>
                    ))}
                    <Box ref={sentinelRef} sx={{ height: 1 }} />
                    {isFetching && (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {isError && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button onClick={() => refetch()}>Failed to load more. Retry</Button>
                        </Box>
                    )}
                </Stack>
            )}
        </>
    );
}
