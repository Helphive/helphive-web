// "Message" action on booking and order details. Uses the server's answer for the booking (contract section 4)
// and links to the conversation; it does not load the chat library.
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton } from '@mui/material';
import { color, font } from '@/theme/tokens';
import { ChatIcon } from '@/components/ui/icons';
import { formatDay } from '@/utils/format';
import { useGetBookingConversationQuery } from './chatApi';

export default function BookingChatAction({
    bookingId,
    area,
}: {
    bookingId: string;
    area: 'user' | 'provider';
}) {
    const { data, isLoading, error } = useGetBookingConversationQuery(bookingId, {
        refetchOnMountOrArgChange: 30,
    });
    const note = (text: string) => (
        <Box sx={{ fontSize: font.size.sm, color: color.ink600, lineHeight: 1.45 }}>{text}</Box>
    );

    if (isLoading) return <Skeleton variant="rounded" height={40} aria-label="Loading chat" />;
    // 503 (chat not configured) or 403 (chat off for this account): no chat entry point.
    if (error || !data) return null;

    const c = data.conversation;
    if (!c) {
        return (
            <Box sx={{ display: 'grid', gap: 0.75 }}>
                <Button variant="outlined" fullWidth startIcon={<ChatIcon />} disabled>
                    Message
                </Button>
                {note(data.message || 'Chat opens when a provider accepts the booking.')}
            </Box>
        );
    }
    const first = c.counterparty.firstName || (area === 'user' ? 'your provider' : 'the customer');
    const to = `/${area}/messages/${encodeURIComponent(c.withUid)}`;
    return (
        <Box sx={{ display: 'grid', gap: 0.75 }}>
            <Button
                component={RouterLink}
                to={to}
                variant="outlined"
                fullWidth
                startIcon={<ChatIcon />}
            >
                {c.open ? `Message ${first}` : 'View messages'}
            </Button>
            {!c.open && note('This chat has closed. You can still read it.')}
            {c.open && c.until && note(`Chat closes on ${formatDay(c.until)}.`)}
        </Box>
    );
}
