import { memo } from 'react';
import { Box, IconButton, ListItem, ListItemButton, Tooltip, Typography } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import type { Notification } from '@/types';
import { formatTimeAgo } from '@/utils/format';
import { getNotificationMeta } from './notificationMeta';

interface NotificationItemProps {
    notification: Notification;
    onOpen: (notification: Notification) => void;
    // Omit to hide the delete button (compact popover).
    onDelete?: (notification: Notification) => void;
}

function NotificationItem({ notification, onOpen, onDelete }: NotificationItemProps) {
    const meta = getNotificationMeta(notification.type);
    return (
        <ListItem
            disablePadding
            secondaryAction={
                onDelete && (
                    <Tooltip title="Delete">
                        <IconButton
                            edge="end"
                            size="small"
                            aria-label="Delete notification"
                            onClick={() => onDelete(notification)}
                        >
                            <DeleteOutline fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )
            }
            sx={{ '& .MuiListItemSecondaryAction-root': { top: 16, transform: 'none' } }}
        >
            <ListItemButton
                onClick={() => onOpen(notification)}
                alignItems="flex-start"
                sx={{
                    gap: 1.5,
                    py: 1.5,
                    pr: onDelete ? 7 : 2,
                    bgcolor: notification.read ? 'transparent' : 'rgba(255, 87, 64, 0.05)',
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: meta.background,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        '& svg': { fontSize: 20 },
                    }}
                >
                    {meta.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="subtitle2"
                        fontWeight={notification.read ? 500 : 700}
                        sx={{ wordBreak: 'break-word' }}
                    >
                        {notification.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                        }}
                    >
                        {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        {formatTimeAgo(notification.createdAt)}
                    </Typography>
                </Box>
                {!notification.read && (
                    <Box
                        aria-label="Unread"
                        sx={{
                            width: 8,
                            height: 8,
                            mt: 1,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                        }}
                    />
                )}
            </ListItemButton>
        </ListItem>
    );
}

export default memo(NotificationItem);
