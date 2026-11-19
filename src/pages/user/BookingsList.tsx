import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import {
    CalendarTodayOutlined,
    EventAvailable,
    LocationOnOutlined,
    ScheduleOutlined,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    BOOKING_STATUS,
    BookingStatusPill,
    EmptyState,
    ErrorState,
    ListSkeleton,
    Money,
    Panel,
    TONE_STYLES,
} from '@/components/ui';
import type { Booking } from '@/types';
import { color, font, hairline } from '@/theme/tokens';
import { getDisplayStatus, pluralHours, formatDay } from '@/utils/format';

export type ListTab = 'active' | 'scheduled' | 'history';

const COPY: Record<ListTab, { title: string; empty: string; emptyHint: string }> = {
    active: {
        title: 'Active bookings',
        empty: 'No active bookings',
        emptyHint: 'Bookings a provider has accepted will show up here.',
    },
    scheduled: {
        title: 'Scheduled bookings',
        empty: 'Nothing scheduled',
        emptyHint: 'Bookings waiting for a provider to accept them will show up here.',
    },
    history: {
        title: 'Booking history',
        empty: 'No booking history yet',
        emptyHint: 'Completed, cancelled and expired bookings will show up here.',
    },
};

const PAGE_SIZE = 20;

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                alignItems: 'center',
                minWidth: 0,
                color: color.ink600,
                fontSize: font.size.sm,
                '& svg': { fontSize: 15, color: color.ink500, flexShrink: 0 },
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

function BookingRow({ booking, first }: { booking: Booking; first: boolean }) {
    const status = getDisplayStatus(booking);
    const start = dayjs(booking.startDate);
    const total = (booking.rate || 0) * (booking.hours || 0);
    return (
        <Box
            component={RouterLink}
            to={`/user/booking/${booking._id}`}
            sx={{
                display: 'grid',
                gridTemplateColumns: '4px minmax(0, 1fr) auto',
                gap: { xs: 1.5, sm: 2 },
                alignItems: 'center',
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderTop: first ? 0 : hairline,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { bgcolor: color.subtle },
            }}
        >
            <Box
                aria-hidden="true"
                sx={{
                    alignSelf: 'stretch',
                    borderRadius: '2px',
                    bgcolor: TONE_STYLES[BOOKING_STATUS[status].tone].fg,
                }}
            />
            <Box sx={{ minWidth: 0 }}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5, mb: 0.5 }}
                >
                    <Typography variant="subtitle2" component="h3" noWrap>
                        {booking.service?.name || 'Service'}
                    </Typography>
                    <BookingStatusPill status={status} />
                </Stack>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 0.25, sm: 2 }}
                    sx={{ minWidth: 0 }}
                >
                    <Meta icon={<CalendarTodayOutlined />}>{formatDay(start)}</Meta>
                    <Meta icon={<ScheduleOutlined />}>
                        {start.format('HH:mm')}, {pluralHours(booking.hours)}
                    </Meta>
                    <Meta icon={<LocationOnOutlined />}>{booking.address}</Meta>
                </Stack>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" component="p">
                    Total
                </Typography>
                <Money amount={total} size="lg" />
            </Box>
        </Box>
    );
}

interface BookingsListProps {
    tab: ListTab;
    bookings: Booking[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onBook: () => void;
}

/** One Panel of rows per tab, with skeleton, empty and error states. */
export default function BookingsList({
    tab,
    bookings,
    loading,
    error,
    onRetry,
    onBook,
}: BookingsListProps) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const copy = COPY[tab];

    if (loading) return <ListSkeleton rows={3} label="Loading bookings" />;
    if (error) {
        return (
            <ErrorState title="Could not load your bookings" message={error} onRetry={onRetry} />
        );
    }

    const shown = bookings.slice(0, visible);
    return (
        <Panel
            title={copy.title}
            flush
            actions={
                bookings.length > 0 ? (
                    <span>
                        {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
                    </span>
                ) : undefined
            }
        >
            {bookings.length === 0 ? (
                <EmptyState
                    bare
                    icon={<EventAvailable />}
                    title={copy.empty}
                    description={copy.emptyHint}
                    action={
                        <Button variant="contained" onClick={onBook}>
                            Book a service
                        </Button>
                    }
                />
            ) : (
                <>
                    {shown.map((b, i) => (
                        <BookingRow key={b._id} booking={b} first={i === 0} />
                    ))}
                    {bookings.length > shown.length && (
                        <Box sx={{ p: 1.5, borderTop: hairline, textAlign: 'center' }}>
                            <Button variant="text" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                                Show more
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </Panel>
    );
}
