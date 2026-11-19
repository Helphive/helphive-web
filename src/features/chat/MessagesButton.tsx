// Top-bar Messages button with the unread badge, for phone layouts where the navigation has no room.
import { Link as RouterLink } from 'react-router-dom';
import { Badge, IconButton, type SxProps, type Theme } from '@mui/material';
import { ChatIcon } from '@/components/ui/icons';

export default function MessagesButton({
    to,
    unread,
    sx,
}: {
    to: string;
    unread: number;
    sx?: SxProps<Theme>;
}) {
    return (
        <IconButton
            component={RouterLink}
            to={to}
            sx={sx}
            aria-label={`Messages${unread ? `, ${unread > 99 ? '99+' : unread} unread` : ''}`}
        >
            <Badge badgeContent={unread || undefined} color="primary" max={99}>
                <ChatIcon />
            </Badge>
        </IconButton>
    );
}
