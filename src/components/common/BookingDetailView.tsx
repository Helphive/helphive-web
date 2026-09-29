import type { ReactNode } from 'react';
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CalendarMonth,
    AccessTime,
    LocationOn,
    Email,
    Phone,
    Person,
    ReceiptLong,
    Star,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Booking, DisplayStatus, User } from '@/types';
import { SERVICE_ICONS } from '@/utils/serviceIcons';
import { STATUS_META, formatDateTime, getDisplayStatus, pluralHours } from '@/utils/format';
import InfoRow from './InfoRow';
import StatusChip from './StatusChip';
import StatusTimeline from './StatusTimeline';

const HERO_TEXT: Record<DisplayStatus, string> = {
    scheduled: 'Waiting for a provider to accept this booking.',
    accepted: 'A provider has accepted. They will start the job on the day.',
    awaiting_start_approval: 'The provider is ready to start and needs approval.',
    in_progress: 'The job is currently in progress.',
    completed: 'This job has been completed.',
    cancelled: 'This booking was cancelled.',
    expired: 'No provider accepted before the start time.',
};

interface CounterpartProps {
    title: string;
    person?: User | string | null;
    // Shown when there is no person yet (e.g. no provider assigned).
    emptyText?: string;
}

function CounterpartCard({ title, person, emptyText }: CounterpartProps) {
    const user = person && typeof person === 'object' ? person : null;
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {title}
                </Typography>
                {user ? (
                    <>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                            <Avatar
                                src={user.profile}
                                sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                            >
                                {user.firstName?.[0]}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} noWrap>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                {!!user.rating && (
                                    <Stack
                                        direction="row"
                                        spacing={0.5}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {user.rating.toFixed(1)}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>
                        </Stack>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <Email fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                    {user.email}
                                </Typography>
                            </Stack>
                            {user.phone && (
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                    <Phone fontSize="small" color="action" />
                                    <Typography variant="body2">{user.phone}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    </>
                ) : (
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'grey.200', color: 'text.secondary' }}>
                            <Person />
                        </Avatar>
                        <Typography color="text.secondary">
                            {emptyText ?? 'Not available'}
                        </Typography>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

interface BookingDetailViewProps {
    booking: Booking;
    counterpart: CounterpartProps;
    // Price / earnings card.
    priceCard: ReactNode;
    // Primary action buttons (confirm dialogs live in the page).
    actions?: ReactNode;
    // Route of the receipt page for this booking.
    receiptPath?: string;
}

export default function BookingDetailView({
    booking,
    counterpart,
    priceCard,
    actions,
    receiptPath,
}: BookingDetailViewProps) {
    const status = getDisplayStatus(booking);
    const meta = STATUS_META[status];
    const icon = SERVICE_ICONS[booking.service?.id];

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Box
                    sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: 2,
                        bgcolor: meta.background,
                        border: '1px solid',
                        borderColor: `${meta.color}33`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {icon && <Box component="img" src={icon} alt="" sx={{ width: 32 }} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
                        >
                            <Typography variant="h5" fontWeight={700}>
                                {booking.service?.name || 'Service'}
                            </Typography>
                            <StatusChip status={status} size="medium" />
                        </Stack>
                        <Typography sx={{ color: meta.color, mt: 0.5 }}>
                            {HERO_TEXT[status]}
                        </Typography>
                        {status === 'cancelled' && booking.cancellationReason && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Reason: {booking.cancellationReason}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                                Job details
                            </Typography>
                            <Stack spacing={2.5}>
                                <InfoRow icon={<CalendarMonth />} label="Date">
                                    {dayjs(booking.startDate).format('dddd, MMMM D, YYYY')}
                                </InfoRow>
                                <InfoRow icon={<AccessTime />} label="Time and duration">
                                    {dayjs(booking.startDate).format('h:mm A')} ·{' '}
                                    {pluralHours(booking.hours)}
                                </InfoRow>
                                <InfoRow icon={<LocationOn />} label="Location">
                                    {booking.address}
                                </InfoRow>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                                Progress
                            </Typography>
                            <StatusTimeline booking={booking} />
                        </CardContent>
                    </Card>

                    <CounterpartCard {...counterpart} />
                </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
                    {priceCard}
                    {(actions || receiptPath) && (
                        <Card>
                            <CardContent>
                                <Stack spacing={1.5}>
                                    {actions}
                                    {receiptPath && (
                                        <Button
                                            component={RouterLink}
                                            to={receiptPath}
                                            variant="outlined"
                                            color="inherit"
                                            fullWidth
                                            startIcon={<ReceiptLong />}
                                        >
                                            View receipt
                                        </Button>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        Booked {formatDateTime(booking.createdAt)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
}
