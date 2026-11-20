// The bookings row under the conversation header (spec: scratch/chat-cards/spec.md, section C): the most relevant
// booking with this person in one fixed-height row that never scrolls sideways, and an "All bookings (N)" timeline
// (a popover on desktop, a bottom sheet on phones). Ordering rules: ./bookingEvents.ts.
import { useId, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Box,
    Button,
    Drawer,
    IconButton,
    Popover,
    Skeleton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import type { Booking } from '@/types';
import { formatDay } from '@/utils/format';
import { color, focusRing, font, hairline, hoverRow, radius } from '@/theme/tokens';
import { BookingStatusPill, ServiceIcon, TONE_BAR_DARK } from '@/components/ui';
import { BOOKING_STATUS } from '@/components/ui/status';
import { ChevronDownIcon, ChevronRightIcon, CloseIcon } from '@/components/ui/icons';
import { bookingPath, type Area } from './chatModel';
import { displayStatusOf, mostRelevantBooking, timelineGroups } from './bookingEvents';

export const HEADER_ROW_HEIGHT = 44;

const range = (b: Booking) => {
    const start = dayjs(b.startDate);
    return `${start.format('HH:mm')}–${start.add(b.hours || 0, 'hour').format('HH:mm')}`;
};

const when = (b: Booking) => `${formatDay(b.startDate)}, ${dayjs(b.startDate).format('HH:mm')}`;

const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

const rowLink = {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    color: color.ink900,
    textDecoration: 'none',
    fontFamily: font.family,
    '&:focus-visible': focusRing,
} as const;

function TimelineRow({
    booking,
    area,
    onNavigate,
}: {
    booking: Booking;
    area: Area;
    onNavigate: () => void;
}) {
    const status = displayStatusOf(booking);
    const tone = BOOKING_STATUS[status]?.tone ?? 'grey';
    return (
        <Box component="li" sx={{ position: 'relative' }}>
            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    left: -22,
                    top: 20,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: TONE_BAR_DARK[tone],
                    // A halo in the sheet colour cuts the rail around the dot.
                    boxShadow: `0 0 0 3px ${color.raised}`,
                }}
            />
            <Box
                component={RouterLink}
                to={bookingPath(area, booking._id)}
                onClick={onNavigate}
                aria-label={`${booking.service?.name}, ${formatDay(booking.startDate)} ${range(booking)}, ${BOOKING_STATUS[status]?.label.toLowerCase()}. Open booking.`}
                sx={{
                    ...rowLink,
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr) auto 14px',
                    columnGap: 1.25,
                    py: 1.25,
                    pr: 0.5,
                    borderRadius: `${radius.sm}px`,
                    '&:hover': hoverRow,
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 32,
                        height: 32,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: `${radius.sm}px`,
                        bgcolor: color.coral50,
                        color: color.coral600,
                    }}
                >
                    <ServiceIcon serviceId={booking.service?.id} size={18} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            fontSize: font.size.md,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {booking.service?.name}
                    </Box>
                    <Box
                        sx={{
                            fontSize: font.size.sm,
                            color: color.ink600,
                            lineHeight: 1.35,
                        }}
                    >
                        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                            {formatDay(booking.startDate)}
                        </Box>{' '}
                        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                            {range(booking)}
                        </Box>
                    </Box>
                </Box>
                <BookingStatusPill status={status} size="sm" />
                <ChevronRightIcon weight="bold" sx={{ fontSize: 14, color: color.ink500 }} />
            </Box>
        </Box>
    );
}

function TimelineGroup({
    title,
    bookings,
    area,
    onNavigate,
}: {
    title: string;
    bookings: Booking[];
    area: Area;
    onNavigate: () => void;
}) {
    if (!bookings.length) return null;
    return (
        <Box component="section" sx={{ '& + &': { mt: 1.5 } }}>
            <Box
                component="h3"
                sx={{
                    m: 0,
                    mb: 0.5,
                    fontSize: font.size.xs,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: color.ink500,
                }}
            >
                {title}
            </Box>
            <Box
                component="ol"
                sx={{
                    listStyle: 'none',
                    m: 0,
                    p: 0,
                    pl: '22px',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 4,
                        top: 24,
                        bottom: 24,
                        width: 2,
                        bgcolor: color.line,
                    },
                }}
            >
                {bookings.map((b) => (
                    <TimelineRow key={b._id} booking={b} area={area} onNavigate={onNavigate} />
                ))}
            </Box>
        </Box>
    );
}

function Timeline({
    bookings,
    area,
    firstName,
    titleId,
    onClose,
    now,
}: {
    bookings: Booking[];
    area: Area;
    firstName: string;
    titleId: string;
    onClose: () => void;
    now: number;
}) {
    const groups = useMemo(() => timelineGroups(bookings, now), [bookings, now]);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: 'inherit' }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    pl: 2,
                    pr: 1,
                    py: 1,
                    borderBottom: hairline,
                    flexShrink: 0,
                }}
            >
                <Box
                    component="h2"
                    id={titleId}
                    sx={{ m: 0, fontSize: font.size.lg, fontWeight: 700, minWidth: 0 }}
                >
                    Bookings with {firstName}
                </Box>
                <IconButton aria-label="Close bookings" onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box
                sx={{
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    px: 2,
                    py: 1.5,
                    minHeight: 0,
                }}
            >
                <TimelineGroup
                    title="Active and upcoming"
                    bookings={groups.active}
                    area={area}
                    onNavigate={onClose}
                />
                <TimelineGroup
                    title="Past"
                    bookings={groups.past}
                    area={area}
                    onNavigate={onClose}
                />
            </Box>
        </Box>
    );
}

export default function BookingsHeader({
    bookings,
    area,
    firstName,
    loading = false,
}: {
    bookings: Booking[];
    area: Area;
    firstName: string;
    /** The bookings are still loading: a placeholder row of the same height, so nothing jumps when they arrive. */
    loading?: boolean;
}) {
    const theme = useTheme();
    const phone = useMediaQuery(theme.breakpoints.down('sm'));
    const button = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const now = Date.now();
    const current = mostRelevantBooking(bookings, now);
    if (!current) {
        return loading ? (
            <Box
                role="status"
                aria-label="Loading bookings"
                sx={{
                    height: HEADER_ROW_HEIGHT,
                    boxSizing: 'border-box',
                    px: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: hairline,
                    bgcolor: color.subtle,
                }}
            >
                <Skeleton variant="rounded" height={22} sx={{ width: '60%', maxWidth: 360 }} />
            </Box>
        ) : null;
    }

    const status = displayStatusOf(current);
    const many = bookings.length > 1;
    const close = () => setOpen(false);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                height: HEADER_ROW_HEIGHT,
                boxSizing: 'border-box',
                px: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
                borderBottom: hairline,
                bgcolor: color.subtle,
            }}
        >
            <Box
                component={RouterLink}
                to={bookingPath(area, current._id)}
                aria-label={`${current.service?.name}, ${when(current)}, ${BOOKING_STATUS[status]?.label.toLowerCase()}. Open booking.`}
                sx={{ ...rowLink, flex: 1, gap: 1, height: '100%' }}
            >
                <Box sx={{ color: color.coral600, display: 'grid', flexShrink: 0 }}>
                    <ServiceIcon serviceId={current.service?.id} size={20} />
                </Box>
                <Box
                    component="span"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: font.size.sm,
                        color: color.ink600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {/* One line from sm up; two lines on phones, each with its own ellipsis. */}
                    <Box
                        component="span"
                        sx={{
                            ...clip,
                            display: { xs: 'block', sm: 'inline' },
                            fontWeight: 700,
                            color: color.ink900,
                        }}
                    >
                        {current.service?.name}
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {' · '}
                    </Box>
                    <Box
                        component="span"
                        sx={{
                            ...clip,
                            display: { xs: 'block', sm: 'inline' },
                            fontSize: { xs: font.size.xs, sm: 'inherit' },
                        }}
                    >
                        {when(current)}
                    </Box>
                </Box>
                <BookingStatusPill status={status} size="sm" />
            </Box>
            {many && (
                <>
                    <Button
                        ref={button}
                        size="small"
                        color="inherit"
                        onClick={() => setOpen(true)}
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        aria-label={`All bookings (${bookings.length})`}
                        endIcon={<ChevronDownIcon weight="bold" />}
                        sx={{
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            fontWeight: 700,
                            minWidth: 0,
                            px: 1,
                            color: color.ink900,
                        }}
                    >
                        <Box
                            component="span"
                            aria-hidden="true"
                            sx={{ display: { xs: 'none', sm: 'inline' } }}
                        >
                            All bookings
                        </Box>
                        <Box
                            component="span"
                            aria-hidden="true"
                            sx={{ display: { xs: 'inline', sm: 'none' } }}
                        >
                            All
                        </Box>
                        <Box component="span" aria-hidden="true">
                            &nbsp;({bookings.length})
                        </Box>
                    </Button>
                    {phone ? (
                        <Drawer
                            anchor="bottom"
                            open={open}
                            onClose={close}
                            aria-labelledby={titleId}
                            PaperProps={{
                                sx: {
                                    maxHeight: '85dvh',
                                    borderTopLeftRadius: radius.lg,
                                    borderTopRightRadius: radius.lg,
                                    display: 'flex',
                                    flexDirection: 'column',
                                },
                            }}
                        >
                            <Timeline
                                bookings={bookings}
                                area={area}
                                firstName={firstName}
                                titleId={titleId}
                                onClose={close}
                                now={now}
                            />
                        </Drawer>
                    ) : (
                        <Popover
                            open={open}
                            anchorEl={button.current}
                            onClose={close}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    'aria-labelledby': titleId,
                                    role: 'dialog',
                                    sx: {
                                        width: 440,
                                        maxWidth: 'calc(100vw - 32px)',
                                        maxHeight: 'min(70vh, 520px)',
                                        mt: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    },
                                } as object,
                            }}
                        >
                            <Timeline
                                bookings={bookings}
                                area={area}
                                firstName={firstName}
                                titleId={titleId}
                                onClose={close}
                                now={now}
                            />
                        </Popover>
                    )}
                </>
            )}
        </Box>
    );
}
