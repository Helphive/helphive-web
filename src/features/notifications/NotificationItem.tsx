import { memo } from 'react';
import { Box, IconButton, ListItem, ListItemButton, Tooltip } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import type { Notification } from '@/types';
import { formatTimeAgo } from '@/utils/format';
import { color, font, hairline, radius } from '@/theme/tokens';
import { srOnly } from '@/components/ui/status';
import { getNotificationMeta } from './notificationMeta';

interface NotificationItemProps {
    notification: Notification;
    onOpen: (notification: Notification) => void;
    // Omit to hide the delete button (compact popover).
    onDelete?: (notification: Notification) => void;
}

function NotificationItem({ notification, onOpen, onDelete }: NotificationItemProps) {
    const meta = getNotificationMeta(notification.type);
    const unread = !notification.read;
    return (
        <ListItem
            disablePadding
            secondaryAction={
                onDelete && (
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            aria-label={`Delete notification: ${notification.title}`}
                            onClick={() => onDelete(notification)}
                        >
                            <DeleteOutline fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )
            }
            sx={{
                borderTop: hairline,
                '&:first-of-type': { borderTop: 0 },
                '& .MuiListItemSecondaryAction-root': { top: 12, right: 12, transform: 'none' },
            }}
        >
            <ListItemButton
                onClick={() => onOpen(notification)}
                alignItems="flex-start"
                sx={{
                    gap: 1.5,
                    py: 1.5,
                    pl: { xs: 2, sm: 2.5 },
                    pr: onDelete ? 7 : 2.5,
                    borderRadius: 0,
                    bgcolor: unread ? color.subtle : 'transparent',
                    '&:hover': { bgcolor: color.canvas },
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: `${radius.sm}px`,
                        bgcolor: meta.background,
                        color: meta.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        '& svg': { fontSize: 18 },
                    }}
                >
                    {meta.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                        sx={{
                            fontSize: font.size.md,
                            fontWeight: unread ? 700 : 600,
                            color: color.ink900,
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {unread && (
                            <Box component="span" sx={srOnly}>
                                Unread:{' '}
                            </Box>
                        )}
                        {notification.title}
                    </Box>
                    <Box
                        sx={{
                            fontSize: font.size.sm,
                            color: color.ink600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {notification.message}
                    </Box>
                    <Box
                        sx={{
                            mt: 0.5,
                            fontSize: font.size.xs,
                            fontWeight: 600,
                            color: color.ink500,
                        }}
                    >
                        {formatTimeAgo(notification.createdAt)}
                    </Box>
                </Box>
                {unread && (
                    <Box
                        aria-hidden="true"
                        sx={{
                            width: 8,
                            height: 8,
                            mt: 0.75,
                            borderRadius: '50%',
                            bgcolor: color.coral500,
                            flexShrink: 0,
                        }}
                    />
                )}
            </ListItemButton>
        </ListItem>
    );
}

export default memo(NotificationItem);
