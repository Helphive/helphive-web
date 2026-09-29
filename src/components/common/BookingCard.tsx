import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { PLATFORM_FEE_RATE, formatMoney, getDisplayStatus, pluralHours } from '@/utils/format';
import { SERVICE_ICONS } from '@/utils/serviceIcons';
import StatusChip from './StatusChip';

interface BookingCardProps {
    booking: Booking;
    // Where the card links to.
    to: string;
    // Provider cards show the payout (after platform fee) instead of the total.
    role: 'user' | 'provider';
    // Replaces the status chip (e.g. an "Available" chip on the open-orders list).
    badge?: React.ReactNode;
}

function BookingCard({ booking, to, role, badge }: BookingCardProps) {
    const total = (booking.rate || 0) * (booking.hours || 0);
    const amount = role === 'provider' ? total * (1 - PLATFORM_FEE_RATE) : total;

    return (
        <Card
            sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                },
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={to}
                sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
            >
                <CardContent sx={{ width: '100%' }}>
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'center', minWidth: 0 }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {SERVICE_ICONS[booking.service?.id] && (
                                    <Box
                                        component="img"
                                        src={SERVICE_ICONS[booking.service.id]}
                                        alt=""
                                        sx={{ width: 24, height: 24 }}
                                    />
                                )}
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {booking.service?.name || 'Service'}
                            </Typography>
                        </Stack>
                        {badge ?? <StatusChip status={getDisplayStatus(booking)} />}
                    </Stack>

                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {dayjs(booking.startDate).format('ddd, MMM D, YYYY')}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {dayjs(booking.startDate).format('h:mm A')} ·{' '}
                                {pluralHours(booking.hours)} · {formatMoney(booking.rate)}/hr
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {booking.address}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {role === 'provider' ? 'You earn' : 'Total'}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                            {formatMoney(amount)}
                        </Typography>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default memo(BookingCard);

export function BookingCardSkeleton() {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                    <Skeleton variant="rounded" width={40} height={40} />
                    <Skeleton width="50%" />
                    <Box sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" width={72} height={24} />
                </Stack>
                <Skeleton width="60%" />
                <Skeleton width="75%" />
                <Skeleton width="85%" />
                <Skeleton width="40%" sx={{ mt: 2 }} height={32} />
            </CardContent>
        </Card>
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
            <Grid container spacing={2.5}>
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
        <Grid container spacing={2.5}>
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
