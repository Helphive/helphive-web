// Booking cards in the conversation (spec: scratch/chat-cards/spec.md, section B). An event message is not a bubble: it
// is a card that shows the booking as it is now (from the pair's bookings, loaded once and shared through context, never
// one request per card) plus what happened at this point in the conversation. Rules: ./bookingEvents.ts.
import { memo, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { Box, Skeleton } from '@mui/material';
import type { Booking } from '@/types';
import { formatDay } from '@/utils/format';
import { color, focusRing, font, hairline, radius } from '@/theme/tokens';
import { BOOKING_STATUS, BookingStatusPill, ServiceIcon } from '@/components/ui';
import { ChevronRightIcon } from '@/components/ui/icons';
import type { ChatMessage } from '../runtime/chatRuntime';
import { bookingPath, type Area } from './chatModel';
import { BookingCardsContext } from './bookingCardsContext';
import {
    displayStatusOf,
    EVENT_TITLE,
    LEGACY_ACCEPTED_TEXT,
    stagesOf,
    type EventLine,
    type StreamItem,
} from './bookingEvents';

export type EventItem = Extract<StreamItem<ChatMessage>, { type: 'event' }>;
export type LineItem = Extract<StreamItem<ChatMessage>, { type: 'line' }>;

const CARD_MAX_WIDTH = 420;
// Measured: a card with one line is 131px, each further line adds 22px (so a skeleton does not make the list jump).
const FULL_HEIGHT = 131;
const LINE_HEIGHT = 20;
const COMPACT_HEIGHT = 40;

const timeOf = (ms: number) => dayjs(ms).format('HH:mm');

/** One line's time; with the day when it is not the day of the group's first line. */
const lineTime = (line: EventLine, first: EventLine) =>
    dayjs(line.at).isSame(dayjs(first.at), 'day')
        ? timeOf(line.at)
        : `${dayjs(line.at).format('D MMM')}, ${timeOf(line.at)}`;

const linkSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    boxSizing: 'border-box',
    textAlign: 'left',
    fontFamily: font.family,
    color: color.ink900,
    textDecoration: 'none',
    bgcolor: color.surface,
    border: hairline,
    borderRadius: `${radius.md}px`,
    transition: 'border-color .15s',
    '&:hover': { borderColor: color.ink300 },
    '&:focus-visible': focusRing,
} as const;

function ServiceChip({ serviceId, size = 32 }: { serviceId?: number; size?: number }) {
    return (
        <Box
            aria-hidden="true"
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: `${radius.sm}px`,
                bgcolor: color.coral50,
                color: color.coral600,
            }}
        >
            <ServiceIcon serviceId={serviceId} size={Math.round(size * 0.58)} />
        </Box>
    );
}

function Progress({ booking }: { booking: Booking }) {
    return (
        <Box
            component="ol"
            aria-hidden="true"
            sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', alignItems: 'center', gap: 2 }}
        >
            {stagesOf(booking).map((st) => (
                <Box
                    component="li"
                    key={st.label}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        fontSize: font.size.xs,
                        fontWeight: st.state === 'current' ? 800 : 600,
                        whiteSpace: 'nowrap',
                        color:
                            st.state === 'cancelled'
                                ? color.red700
                                : st.state === 'todo'
                                  ? color.ink500
                                  : color.ink900,
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            boxSizing: 'border-box',
                            bgcolor:
                                st.state === 'todo'
                                    ? 'transparent'
                                    : st.state === 'cancelled'
                                      ? color.red500
                                      : color.green500,
                            border: st.state === 'todo' ? `1.5px solid ${color.ink300}` : 'none',
                        }}
                    />
                    {st.label}
                </Box>
            ))}
        </Box>
    );
}

const dateLine = (b: Booking) => {
    const start = dayjs(b.startDate);
    const end = start.add(b.hours || 0, 'hour');
    return `${formatDay(start)} · ${start.format('HH:mm')}–${end.format('HH:mm')} · ${b.hours} h`;
};

const cardLabel = (b: Booking, lines: EventLine[]) => {
    const start = dayjs(b.startDate);
    const status = BOOKING_STATUS[displayStatusOf(b)]?.label.toLowerCase() ?? '';
    const what = lines.map((l) => `${EVENT_TITLE[l.event]} at ${timeOf(l.at)}`).join(', ');
    return `${b.service?.name ?? 'Booking'}, ${start.format('dddd D MMMM HH:mm')}, ${status}. ${what}. Open booking.`;
};

function FullCard({ item, booking, area }: { item: EventItem; booking: Booking; area: Area }) {
    const first = item.lines[0];
    return (
        <Box
            component={RouterLink}
            to={bookingPath(area, booking._id)}
            aria-label={cardLabel(booking, item.lines)}
            sx={{ ...linkSx, p: 1.5, gap: 1.25 }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr) auto',
                    columnGap: 1.25,
                    alignItems: 'center',
                }}
            >
                <ServiceChip serviceId={booking.service?.id} />
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
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {dateLine(booking)}
                    </Box>
                </Box>
                <BookingStatusPill status={displayStatusOf(booking)} size="sm" />
            </Box>
            <Box sx={{ borderTop: hairline, pt: 1.25 }}>
                <Progress booking={booking} />
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    alignItems: 'end',
                    columnGap: 1,
                }}
            >
                <Box sx={{ display: 'grid', rowGap: 0.25, minWidth: 0 }}>
                    {item.lines.map((l) => (
                        <Box
                            key={l.key}
                            sx={{
                                fontSize: font.size.sm,
                                lineHeight: `${LINE_HEIGHT}px`,
                                color: color.ink600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            <Box component="span" sx={{ fontWeight: 600, color: color.ink900 }}>
                                {EVENT_TITLE[l.event]}
                            </Box>
                            {' · '}
                            {lineTime(l, first)}
                        </Box>
                    ))}
                </Box>
                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        lineHeight: `${LINE_HEIGHT}px`,
                        fontSize: font.size.sm,
                        fontWeight: 700,
                        color: color.coral600,
                    }}
                >
                    View
                    <ChevronRightIcon weight="bold" sx={{ fontSize: 14 }} />
                </Box>
            </Box>
        </Box>
    );
}

function CompactRow({ item, booking, area }: { item: EventItem; booking: Booking; area: Area }) {
    const last = item.lines[item.lines.length - 1];
    const text = `${EVENT_TITLE[last.event]} · ${booking.service?.name}, ${formatDay(booking.startDate)}`;
    return (
        <Box
            component={RouterLink}
            to={bookingPath(area, booking._id)}
            aria-label={`${text}. ${timeOf(last.at)}. Open booking.`}
            sx={{
                ...linkSx,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                height: COMPACT_HEIGHT,
                px: 1.25,
            }}
        >
            <ServiceChip serviceId={booking.service?.id} size={24} />
            <Box
                component="span"
                sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: font.size.sm,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {text}
            </Box>
            <Box
                component="span"
                sx={{ fontSize: font.size.xs, fontWeight: 600, color: color.ink500, flexShrink: 0 }}
            >
                {timeOf(last.at)}
            </Box>
            <ChevronRightIcon
                weight="bold"
                sx={{ fontSize: 14, color: color.ink500, flexShrink: 0 }}
            />
        </Box>
    );
}

const Row = ({ children }: { children: React.ReactNode }) => (
    <Box component="li" sx={{ display: 'flex', justifyContent: 'center' }}>
        {children}
    </Box>
);

/** The list item for a booking event group: the card, the compact row, or a skeleton of the same size while loading. */
export const BookingEventItem = memo(function BookingEventItem({ item }: { item: EventItem }) {
    const { area, bookings } = useContext(BookingCardsContext);
    const booking = bookings.get(item.bookingId);
    if (item.loading || !booking) {
        return (
            <Row>
                <Skeleton
                    variant="rounded"
                    role="status"
                    aria-label="Loading booking"
                    sx={{
                        width: '100%',
                        maxWidth: CARD_MAX_WIDTH,
                        height:
                            item.variant === 'full'
                                ? FULL_HEIGHT +
                                  (LINE_HEIGHT + 2) * Math.max(0, item.lines.length - 1)
                                : COMPACT_HEIGHT,
                        borderRadius: `${radius.md}px`,
                    }}
                />
            </Row>
        );
    }
    return (
        <Row>
            {item.variant === 'full' ? (
                <FullCard item={item} booking={booking} area={area} />
            ) : (
                <CompactRow item={item} booking={booking} area={area} />
            )}
        </Row>
    );
});

/** A neutral system line (unknown event or version, unmatched legacy text, a booking that cannot be loaded). */
export const SystemLine = memo(function SystemLine({ item }: { item: LineItem }) {
    return (
        <Box
            component="li"
            sx={{
                textAlign: 'center',
                fontSize: font.size.xs,
                fontWeight: 600,
                color: color.ink500,
                py: 0.5,
                overflowWrap: 'anywhere',
            }}
        >
            {LEGACY_ACCEPTED_TEXT} · {timeOf(item.m.sentAt)}
        </Box>
    );
});
