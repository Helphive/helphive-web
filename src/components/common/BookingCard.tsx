import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CalendarTodayOutlined, LocationOnOutlined, ScheduleOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { PLATFORM_FEE_RATE, formatMoney, getDisplayStatus, pluralHours } from '@/utils/format';
import { color, font, hairline, radius } from '@/theme/tokens';
import ServiceIcon from '@/components/ui/ServiceIcon';
import { ShiftRuler } from '@/components/ui/ShiftRuler';
import StatusChip from './StatusChip';

interface BookingCardProps {
    booking: Booking;
    // Where the card links to.
    to: string;
    // Provider cards show the payout (after platform fee) instead of the total.
    role: 'user' | 'provider';
    // Replaces the status pill (e.g. an "Available" pill on the open-orders list).
    badge?: React.ReactNode;
}

const cardSx = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    bgcolor: color.surface,
    border: hairline,
    borderRadius: `${radius.md}px`,
    color: 'inherit',
    textDecoration: 'none',
    transition: 'border-color .15s',
    '&:hover': { borderColor: color.ink300 },
} as const;

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Stack
            direction="row"
            spacing={0.75}
            sx={{
                alignItems: 'center',
                minWidth: 0,
                color: color.ink600,
                fontSize: font.size.sm,
                '& svg': { fontSize: 16, color: color.ink500 },
            }}
        >
            {icon}
            <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
                {children}
            </Box>
        </Stack>
    );
}

function BookingCard({ booking, to, role, badge }: BookingCardProps) {
    const total = (booking.rate || 0) * (booking.hours || 0);
    const amount = role === 'provider' ? total * (1 - PLATFORM_FEE_RATE) : total;
    const start = dayjs(booking.startDate);

    return (
        <Box component={RouterLink} to={to} sx={cardSx}>
            <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2.5 }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <ServiceIcon serviceId={booking.service?.id} variant="tile" size={36} />
                    <Typography variant="subtitle2" component="h3" noWrap>
                        {booking.service?.name || 'Service'}
                    </Typography>
                </Stack>
                {badge ?? <StatusChip status={getDisplayStatus(booking)} />}
            </Stack>

            <Stack spacing={0.75} sx={{ px: 2.5, pt: 2 }}>
                <Meta icon={<CalendarTodayOutlined />}>{start.format('ddd D MMM YYYY')}</Meta>
                <Meta icon={<ScheduleOutlined />}>
                    {start.format('HH:mm')}, {pluralHours(booking.hours)} at{' '}
                    {formatMoney(booking.rate)}/hr
                </Meta>
                <Meta icon={<LocationOnOutlined />}>{booking.address}</Meta>
            </Stack>

            <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
                <ShiftRuler
                    blocks={[{ start: booking.startDate, hours: booking.hours || 1 }]}
                    hideScale
                />
            </Box>

            <Stack
                direction="row"
                sx={{
                    mt: 'auto',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    px: 2.5,
                    py: 1.5,
                    borderTop: hairline,
                    bgcolor: color.subtle,
                    borderRadius: `0 0 ${radius.md}px ${radius.md}px`,
                }}
            >
                <Typography variant="caption">
                    {role === 'provider' ? 'You earn' : 'Total'}
                </Typography>
                <Box
                    sx={{
                        fontSize: font.size.xl,
                        fontWeight: 800,
                        letterSpacing: font.tracking.head,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {formatMoney(amount)}
                </Box>
            </Stack>
        </Box>
    );
}

export default memo(BookingCard);

export function BookingCardSkeleton() {
    return (
        <Box sx={{ ...cardSx, p: 2.5 }} aria-hidden="true">
            <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Skeleton variant="rounded" width={36} height={36} />
                <Skeleton width="45%" />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={72} height={22} />
            </Stack>
            <Skeleton width="55%" />
            <Skeleton width="75%" />
            <Skeleton width="85%" />
            <Skeleton variant="rounded" height={28} sx={{ mt: 2 }} />
        </Box>
    );
}

interface BookingGridProps {
    bookings: Booking[];
    loading?: boolean;
    role: 'user' | 'provider';
    // Builds the link for a booking id.
    getLink: (bookingId: string) => string;
    empty: React.ReactNode;
    badge?: React.ReactNode;
}

// Responsive card grid with skeleton and empty states.
export function BookingGrid({ bookings, loading, role, getLink, empty, badge }: BookingGridProps) {
    if (loading) {
        return (
            <Grid
                container
                spacing={2}
                role="status"
                aria-busy="true"
                aria-label="Loading bookings"
            >
                {[0, 1, 2].map((i) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                        <BookingCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    }
    if (bookings.length === 0) return <>{empty}</>;
    return (
        <Grid container spacing={2}>
            {bookings.map((booking) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={booking._id}>
                    <BookingCard
                        booking={booking}
                        to={getLink(booking._id)}
                        role={role}
                        badge={badge}
                    />
                </Grid>
            ))}
        </Grid>
    );
}
