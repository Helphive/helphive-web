import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    IconButton,
    List,
    Popover,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { NotificationsNoneOutlined } from '@mui/icons-material';
import { color, hairline } from '@/theme/tokens';
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
                    aria-haspopup="dialog"
                    aria-expanded={open}
                >
                    <Badge badgeContent={unreadCount} color="primary" max={99}>
                        <NotificationsNoneOutlined />
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
                    paper: {
                        role: 'dialog',
                        'aria-label': 'Recent notifications',
                        sx: {
                            width: { xs: 'calc(100vw - 24px)', sm: 380 },
                            mt: 1,
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: hairline,
                    }}
                >
                    <Typography variant="h6" component="h2">
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
                {isLoading ? (
                    <Box sx={{ p: 2.5 }} role="status" aria-label="Loading notifications">
                        {[0, 1, 2].map((i) => (
                            <Stack key={i} direction="row" spacing={1.5} sx={{ mb: i < 2 ? 2 : 0 }}>
                                <Skeleton variant="rounded" width={32} height={32} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="60%" />
                                    <Skeleton width="90%" />
                                </Box>
                            </Stack>
                        ))}
                    </Box>
                ) : isError ? (
                    <Box sx={{ p: 3, textAlign: 'center' }} role="alert">
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Could not load notifications.
                        </Typography>
                        <Button size="small" variant="outlined" onClick={() => refetch()}>
                            Try again
                        </Button>
                    </Box>
                ) : data && data.notifications.length > 0 ? (
                    <List
                        disablePadding
                        sx={{ maxHeight: 420, overflowY: 'auto', overflowX: 'hidden' }}
                    >
                        {data.notifications.slice(0, NOTIFICATIONS_PREVIEW_SIZE).map((n) => (
                            <NotificationItem
                                key={n._id}
                                notification={n}
                                onOpen={openNotification}
                            />
                        ))}
                    </List>
                ) : (
                    <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                        <NotificationsNoneOutlined
                            sx={{ fontSize: 28, color: color.ink300, mb: 1 }}
                        />
                        <Typography variant="subtitle2">You are all caught up</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Booking and payment updates will appear here.
                        </Typography>
                    </Box>
                )}
            </Popover>
        </>
    );
}
