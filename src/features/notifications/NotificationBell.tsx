import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    List,
    Popover,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { Notifications as BellIcon, NotificationsNone as BellEmptyIcon } from '@mui/icons-material';
import {
    NOTIFICATIONS_PREVIEW_SIZE,
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
} from './notificationsApi';
import NotificationItem from './NotificationItem';
import { useNotificationActions } from './useNotificationActions';
import type { UserArea } from './notificationMeta';

const POLL_INTERVAL_MS = 60_000;

export default function NotificationBell({ area }: { area: UserArea }) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    // Poll every minute and refresh when the window regains focus.
    const { data: countData } = useGetUnreadCountQuery(undefined, {
        pollingInterval: POLL_INTERVAL_MS,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    const unreadCount = countData?.unreadCount ?? 0;

    const { data, isLoading, isError, refetch } = useGetNotificationsQuery(
        { filter: 'all', limit: NOTIFICATIONS_PREVIEW_SIZE },
        { skip: !open, refetchOnMountOrArgChange: 5 }
    );

    const close = useCallback(() => setAnchorEl(null), []);
    const { open: openNotification } = useNotificationActions(area, close);
    const notificationsPath = `/${area}/notifications`;

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                    sx={{ mr: 0.5 }}
                >
                    <Badge badgeContent={unreadCount} color="primary" max={99}>
                        <BellIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={close}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                slotProps={{
                    paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 380 }, mt: 1 } },
                }}
            >
                <Stack
                    direction="row"
                    sx={{ px: 2, py: 1.5, justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant="subtitle1" fontWeight={700}>
                        Notifications
                    </Typography>
                    <Button
                        component={RouterLink}
                        to={notificationsPath}
                        size="small"
                        onClick={close}
                    >
                        View all
                    </Button>
                </Stack>
                <Divider />
                {isLoading ? (
                    <Box sx={{ p: 2 }}>
                        {[0, 1, 2].map((i) => (
                            <Stack key={i} direction="row" spacing={1.5} sx={{ mb: 2 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="60%" />
                                    <Skeleton width="90%" />
                                </Box>
                            </Stack>
                        ))}
                    </Box>
                ) : isError ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            Could not load notifications
                        </Typography>
                        <Button size="small" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </Box>
                ) : data && data.notifications.length > 0 ? (
                    <List disablePadding sx={{ maxHeight: 420, overflowY: 'auto' }}>
                        {data.notifications.slice(0, NOTIFICATIONS_PREVIEW_SIZE).map((n) => (
                            <NotificationItem
                                key={n._id}
                                notification={n}
                                onOpen={openNotification}
                            />
                        ))}
                    </List>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        <BellEmptyIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography>You are all caught up</Typography>
                    </Box>
                )}
            </Popover>
        </>
    );
}
