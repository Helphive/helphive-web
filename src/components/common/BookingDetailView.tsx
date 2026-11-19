import type { ReactNode } from 'react';
import { Avatar, Box, Button, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Booking, DisplayStatus, User } from '@/types';
import { formatDateTime, formatMoney, getDisplayStatus, formatDay } from '@/utils/format';
import { getInitials, getProfileImageUrl } from '@/utils/profileImage';
import { color, font } from '@/theme/tokens';
import Panel from '@/components/ui/Panel';
import ServiceIcon from '@/components/ui/ServiceIcon';
import { ShiftRuler } from '@/components/ui/ShiftRuler';
import { DataList, DataRow } from '@/components/ui/DataList';
import { BookingStatusPill } from '@/components/ui/StatusPill';
import StatusTimeline from './StatusTimeline';
import {
    EmailIcon,
    ExternalLinkIcon,
    PersonIcon,
    PhoneIcon,
    RatingIcon,
    ReceiptIcon,
} from '@/components/ui/icons';

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

function CounterpartPanel({ title, person, emptyText }: CounterpartProps) {
    const user = person && typeof person === 'object' ? person : null;
    return (
        <Panel title={title}>
            {user ? (
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                            src={getProfileImageUrl(user.profile)}
                            alt=""
                            sx={{ width: 44, height: 44 }}
                        >
                            {getInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                                {user.firstName} {user.lastName}
                            </Typography>
                            {!!user.rating && (
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                    <RatingIcon
                                        weight="fill"
                                        sx={{ fontSize: 14, color: color.amber500 }}
                                    />
                                    <Typography variant="caption">
                                        {user.rating.toFixed(1)}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                    <Stack spacing={1} sx={{ '& svg': { fontSize: 16, color: color.ink500 } }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <EmailIcon weight="bold" />
                            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                                {user.email}
                            </Typography>
                        </Stack>
                        {user.phone && (
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <PhoneIcon weight="bold" />
                                <Typography variant="body2">{user.phone}</Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                        sx={{
                            bgcolor: color.canvas,
                            color: color.ink500,
                            border: '1px solid',
                            borderColor: color.line,
                        }}
                    >
                        <PersonIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                        {emptyText ?? 'Not available'}
                    </Typography>
                </Stack>
            )}
        </Panel>
    );
}

interface BookingDetailViewProps {
    booking: Booking;
    counterpart: CounterpartProps;
    // Price / earnings panel.
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
    const start = dayjs(booking.startDate);
    const end = start.add(booking.hours || 0, 'hour');
    const hasPin = !!booking.latitude && !!booking.longitude;
    // When the customer typed their own address, say where the pin is too.
    const pinAddress =
        booking.location?.customAddress && booking.location.formattedAddress !== booking.address
            ? booking.location.formattedAddress
            : null;

    return (
        <Box
            sx={{
                display: 'grid',
                gap: { xs: 2.5, md: 3 },
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                alignItems: 'start',
            }}
        >
            <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                <Panel flush aria-label="Job details">
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', px: { xs: 2, sm: 2.5 }, py: 2 }}
                    >
                        <ServiceIcon serviceId={booking.service?.id} variant="tile" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
                            >
                                <Typography variant="h5" component="h2">
                                    {booking.service?.name || 'Service'}
                                </Typography>
                                <BookingStatusPill status={status} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {HERO_TEXT[status]}
                            </Typography>
                            {status === 'cancelled' && booking.cancellationReason && (
                                <Typography variant="body2" color="text.secondary">
                                    Reason: {booking.cancellationReason}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                        <DataList variant="grid" columns={4}>
                            <DataRow label="Date" value={formatDay(start)} />
                            <DataRow label="Start" value={start.format('HH:mm')} />
                            <DataRow label="Hours" value={booking.hours || 0} />
                            <DataRow label="Rate" value={`${formatMoney(booking.rate)}/hr`} />
                        </DataList>
                    </Box>
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
                        <ShiftRuler
                            blocks={[
                                {
                                    start: booking.startDate,
                                    hours: booking.hours || 1,
                                    // A shift that will not happen is drawn soft, not in focus.
                                    tone:
                                        status === 'cancelled' || status === 'expired'
                                            ? 'soft'
                                            : 'coral',
                                },
                            ]}
                        />
                        <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                            {booking.address}
                        </Typography>
                        <Typography variant="caption">
                            {start.format('dddd D MMMM YYYY')}, {start.format('HH:mm')} to{' '}
                            {end.format('HH:mm')}
                        </Typography>
                        {pinAddress && (
                            <Typography variant="caption" component="p">
                                Map pin: {pinAddress}
                            </Typography>
                        )}
                        {hasPin && (
                            <Link
                                href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    mt: 1,
                                }}
                            >
                                Open in Google Maps
                                <ExternalLinkIcon size={16} aria-hidden="true" />
                            </Link>
                        )}
                    </Box>
                </Panel>

                <Panel title="Progress">
                    <StatusTimeline booking={booking} />
                </Panel>

                <CounterpartPanel {...counterpart} />
            </Stack>

            <Stack spacing={2.5} sx={{ position: { md: 'sticky' }, top: { md: 24 }, minWidth: 0 }}>
                {priceCard}
                {(actions || receiptPath) && (
                    <Panel>
                        <Stack spacing={1.5}>
                            {actions}
                            {receiptPath && (
                                <Button
                                    component={RouterLink}
                                    to={receiptPath}
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<ReceiptIcon />}
                                >
                                    View receipt
                                </Button>
                            )}
                            <Box
                                sx={{
                                    fontSize: font.size.xs,
                                    fontWeight: 600,
                                    color: color.ink500,
                                }}
                            >
                                Booked {formatDateTime(booking.createdAt)}
                            </Box>
                        </Stack>
                    </Panel>
                )}
            </Stack>
        </Box>
    );
}
