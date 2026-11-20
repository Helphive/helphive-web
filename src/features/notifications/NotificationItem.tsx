import { memo } from 'react';
import { Box, IconButton, ListItem, ListItemButton, Tooltip } from '@mui/material';
import type { Notification } from '@/types';
import { formatTimeAgo } from '@/utils/format';
import { color, font, hairline, hoverItem, inDark, radius, wash } from '@/theme/tokens';
import { srOnly } from '@/components/ui/status';
import { getNotificationMeta } from './notificationMeta';
import { DeleteIcon } from '@/components/ui/icons';

interface NotificationItemProps {
    notification: Notification;
    onOpen: (notification: Notification) => void;
    // Omit to hide the delete button (compact popover).
    onDelete?: (notification: Notification) => void;
}

// Row geometry. The type chip is top-aligned with the title's first line; the trailing cluster (unread
// dot, delete button) is one flex row centred on that same first line, so dot and bin share a centre.
const ROW_PAD_Y = 12;
const EDGE = 12; // the cluster's distance from the row's right edge
const TITLE_LINE = `calc(${font.size.md} * ${font.lineHeight.body})`; // the title's line box height
const DOT = 8;
const GAP = 8;
const DELETE = 32; // IconButton size="small"
const TEXT_GAP = 12; // space between the text and the cluster

function NotificationItem({ notification, onOpen, onDelete }: NotificationItemProps) {
    const meta = getNotificationMeta(notification.type);
    const unread = !notification.read;
    // Space reserved for the cluster, the same for read and unread rows so text wraps identically.
    const reserve = EDGE + TEXT_GAP + (onDelete ? DELETE + GAP + DOT : DOT);
    return (
        <ListItem
            disablePadding
            secondaryAction={
                (unread || onDelete) && (
                    <>
                        {unread && (
                            <Box
                                aria-hidden="true"
                                sx={{
                                    width: DOT,
                                    height: DOT,
                                    borderRadius: '50%',
                                    bgcolor: color.coral500,
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        {onDelete && (
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    aria-label={`Delete notification: ${notification.title}`}
                                    onClick={() => onDelete(notification)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )
            }
            sx={{
                borderTop: hairline,
                '&:first-of-type': { borderTop: 0 },
                '& .MuiListItemSecondaryAction-root': {
                    top: ROW_PAD_Y,
                    right: EDGE,
                    transform: 'none',
                    height: TITLE_LINE,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${GAP}px`,
                },
                '& > .MuiListItemButton-root': { pr: `${reserve}px` },
            }}
        >
            <ListItemButton
                onClick={() => onOpen(notification)}
                alignItems="flex-start"
                sx={{
                    gap: 1.5,
                    py: `${ROW_PAD_Y}px`,
                    pl: { xs: 2, sm: 2.5 },
                    borderRadius: 0,
                    bgcolor: unread ? color.subtle : 'transparent',
                    // Unread rows lift a little on dark (subtle is darker than the panel or popover there).
                    ...(unread && inDark({ bgcolor: wash(color.ink900, 0.035) })),
                    '&:hover': hoverItem,
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
                        className="notification-title"
                        sx={{
                            fontSize: font.size.md,
                            lineHeight: font.lineHeight.body,
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
            </ListItemButton>
        </ListItem>
    );
}

export default memo(NotificationItem);
