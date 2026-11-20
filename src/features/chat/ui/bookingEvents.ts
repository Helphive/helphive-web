// Booking events in the conversation: the pure rules (no React, no SDK, no dates library), so they can be run on their
// own. Contract: scratch/chat-cards/contract.md. A booking event is a text message whose metadata
// `helphive = { v: 1, kind: "booking_event", event, bookingId }` marks it for a card.
import type { Booking, DisplayStatus } from '@/types';

export const BOOKING_EVENTS = ['accepted', 'started', 'completed', 'cancelled'] as const;
export type BookingEvent = (typeof BOOKING_EVENTS)[number];

/** The only version this client can read; a newer one is shown as the neutral line with the fallback text. */
export const KNOWN_VERSION = 1;

/** What the server sent as text for "accepted" before the metadata existed (people's history still has it). */
export const LEGACY_ACCEPTED_TEXT = 'A booking was accepted.';
export const LEGACY_MATCH_WINDOW_MS = 5 * 60 * 1000;

const OBJECT_ID = /^[a-f\d]{24}$/i;

export interface EventMessage {
    key: string;
    id?: number;
    sentAt: number;
    kind: string;
    text?: string;
    /** `metadata.helphive` of the message, as it came (unchecked). */
    helphive?: unknown;
}

/** What an event message points at, once its metadata (or legacy text) is understood. */
export type EventRef =
    | { type: 'booking'; event: BookingEvent; bookingId: string; legacy: boolean }
    | { type: 'neutral' };

const isEvent = (v: unknown): v is BookingEvent =>
    (BOOKING_EVENTS as readonly unknown[]).includes(v);

/** Whether the message is a booking event message (any version), or the legacy accepted text. */
export const isEventMessage = (m: EventMessage): boolean =>
    (m.helphive as { kind?: unknown } | undefined)?.kind === 'booking_event' ||
    (m.kind === 'text' && !m.helphive && m.text === LEGACY_ACCEPTED_TEXT);

/** The booking whose acceptance time is closest to the message, within the window; null when none is. */
export const matchLegacyAccepted = (
    sentAt: number,
    bookings: readonly Pick<Booking, '_id' | 'acceptedAt'>[]
): string | null => {
    let best: { id: string; gap: number } | null = null;
    for (const b of bookings) {
        const at = b.acceptedAt ? Date.parse(b.acceptedAt) : NaN;
        if (!Number.isFinite(at)) continue;
        const gap = Math.abs(at - sentAt);
        if (gap <= LEGACY_MATCH_WINDOW_MS && (!best || gap < best.gap)) best = { id: b._id, gap };
    }
    return best?.id ?? null;
};

/**
 * Reads one message. `null` means it is not a booking event message at all (an ordinary bubble). An unknown event or a
 * newer version, or a legacy text with no matching booking, is `neutral`.
 */
export const readEventRef = (
    m: EventMessage,
    bookings: readonly Pick<Booking, '_id' | 'acceptedAt'>[]
): EventRef | null => {
    const h = m.helphive as
        | { v?: unknown; kind?: unknown; event?: unknown; bookingId?: unknown }
        | undefined;
    if (h && typeof h === 'object' && h.kind === 'booking_event') {
        if (
            h.v === KNOWN_VERSION &&
            isEvent(h.event) &&
            typeof h.bookingId === 'string' &&
            OBJECT_ID.test(h.bookingId)
        ) {
            return { type: 'booking', event: h.event, bookingId: h.bookingId, legacy: false };
        }
        return { type: 'neutral' };
    }
    if (m.kind === 'text' && !h && m.text === LEGACY_ACCEPTED_TEXT) {
        const id = matchLegacyAccepted(m.sentAt, bookings);
        return id
            ? { type: 'booking', event: 'accepted', bookingId: id, legacy: true }
            : { type: 'neutral' };
    }
    return null;
};

/* ---------- The stream: what the message list renders ---------- */

export interface EventLine {
    key: string;
    event: BookingEvent;
    at: number;
}

export type StreamItem<M extends EventMessage> =
    | { type: 'message'; key: string; m: M }
    /** A neutral system line: unknown event or version, unmatched legacy text, or a booking that cannot be loaded. */
    | { type: 'line'; key: string; m: M }
    | {
          type: 'event';
          key: string;
          bookingId: string;
          /** full: the card; compact: one row (a later event of a booking that already has its card). */
          variant: 'full' | 'compact';
          lines: EventLine[];
          /** Where the day heading goes: the first message of the group. */
          first: M;
          loading: boolean;
      };

/**
 * Turns the loaded messages into render items. Consecutive event messages of one booking (nothing else between them)
 * become one item with one line per event; only the first item of a booking in the loaded history is a full card,
 * later ones are compact rows. `known` is the ids of the pair's bookings, or null while they are loading (cards show a
 * skeleton, legacy texts wait); a booking that is not in it once loaded becomes a neutral line.
 */
export const buildStream = <M extends EventMessage>(
    messages: readonly M[],
    bookings: readonly Pick<Booking, '_id' | 'acceptedAt'>[],
    loaded: boolean
): StreamItem<M>[] => {
    const known = new Set(bookings.map((b) => b._id));
    const out: StreamItem<M>[] = [];
    const carded = new Set<string>();
    let open: Extract<StreamItem<M>, { type: 'event' }> | null = null;
    for (const m of messages) {
        const legacyWaiting =
            !loaded && m.kind === 'text' && !m.helphive && m.text === LEGACY_ACCEPTED_TEXT;
        const ref = legacyWaiting ? null : readEventRef(m, bookings);
        if (!ref && !legacyWaiting) {
            open = null;
            out.push({ type: 'message', key: m.key, m });
            continue;
        }
        if (legacyWaiting) {
            // Which booking it belongs to is not known until the bookings are: a skeleton card of its own.
            open = null;
            out.push({
                type: 'event',
                key: m.key,
                bookingId: '',
                variant: 'full',
                lines: [],
                first: m,
                loading: true,
            });
            continue;
        }
        if (!ref || ref.type === 'neutral' || (loaded && !known.has(ref.bookingId))) {
            open = null;
            out.push({ type: 'line', key: m.key, m });
            continue;
        }
        const line: EventLine = { key: m.key, event: ref.event, at: m.sentAt };
        if (open && open.bookingId === ref.bookingId) {
            open.lines.push(line);
            continue;
        }
        open = {
            type: 'event',
            key: m.key,
            bookingId: ref.bookingId,
            variant: carded.has(ref.bookingId) ? 'compact' : 'full',
            lines: [line],
            first: m,
            loading: !loaded,
        };
        carded.add(ref.bookingId);
        out.push(open);
    }
    return out;
};

/* ---------- Wording ---------- */

export const EVENT_TITLE: Record<BookingEvent, string> = {
    accepted: 'Booking accepted',
    started: 'Job started',
    completed: 'Job completed',
    cancelled: 'Booking cancelled',
};

/** Conversation list preview of an event message: "Booking accepted · Public Area Attendant". */
export const eventPreview = (
    event: BookingEvent | null,
    service?: string | null,
    fallback = ''
) => {
    if (!event) return fallback;
    return service ? `${EVENT_TITLE[event]} · ${service}` : EVENT_TITLE[event];
};

/* ---------- Booking display status, order and groups ---------- */

const HOUR = 3_600_000;

export type BookingLike = Pick<
    Booking,
    | '_id'
    | 'status'
    | 'displayStatus'
    | 'startDate'
    | 'hours'
    | 'userApprovalRequested'
    | 'completedAt'
    | 'cancelledAt'
    | 'startedAt'
    | 'acceptedAt'
>;

/** The server's displayStatus; for a booking without it, derived from the stored status like the server does. */
export const displayStatusOf = (
    b: Pick<Booking, 'status' | 'displayStatus' | 'userApprovalRequested'>
): DisplayStatus => {
    if (b.displayStatus) return b.displayStatus;
    if (b.status === 'completed') return 'completed';
    if (b.status === 'cancelled') return 'cancelled';
    if (b.status === 'in progress') return 'in_progress';
    return b.userApprovalRequested ? 'awaiting_start_approval' : 'accepted';
};

const start = (b: Pick<Booking, 'startDate'>) => Date.parse(b.startDate);
const end = (b: Pick<Booking, 'startDate' | 'hours'>) => start(b) + (b.hours || 0) * HOUR;
const finishedAt = (b: Pick<Booking, 'startDate' | 'completedAt' | 'cancelledAt'>) =>
    Math.max(
        b.completedAt ? Date.parse(b.completedAt) : 0,
        b.cancelledAt ? Date.parse(b.cancelledAt) : 0,
        start(b) || 0
    );

/**
 * The booking the header row shows: in progress, then accepted and still to come (soonest first), then awaiting start
 * approval, then the most recently finished (completed, cancelled; also an accepted booking whose shift is over).
 */
export const mostRelevantBooking = <B extends BookingLike>(
    bookings: readonly B[],
    now: number
): B | null => {
    const rank = (b: B) => {
        const s = displayStatusOf(b);
        if (s === 'in_progress') return 0;
        if (s === 'accepted' && end(b) > now) return 1;
        if (s === 'awaiting_start_approval') return 2;
        return 3;
    };
    const sorted = [...bookings].sort((a, b) => {
        const ra = rank(a);
        const rb = rank(b);
        if (ra !== rb) return ra - rb;
        if (ra === 1 || ra === 2) return start(a) - start(b);
        if (ra === 0) return start(b) - start(a);
        return finishedAt(b) - finishedAt(a);
    });
    return sorted[0] ?? null;
};

/** The timeline's two groups, each newest first: "Active and upcoming" then "Past". */
export const timelineGroups = <B extends BookingLike>(bookings: readonly B[], now: number) => {
    const active: B[] = [];
    const past: B[] = [];
    for (const b of bookings) {
        const s = displayStatusOf(b);
        const isActive =
            s === 'in_progress' ||
            s === 'awaiting_start_approval' ||
            (s === 'accepted' && end(b) > now);
        (isActive ? active : past).push(b);
    }
    const newest = (a: B, b: B) => start(b) - start(a);
    return { active: active.sort(newest), past: past.sort(newest) };
};

export type StageState = 'done' | 'current' | 'todo' | 'cancelled';

/** The booking's stages for the progress line: filled up to where it is now; cancelled ends in a red state. */
export function stagesOf(b: Booking): { label: string; state: StageState }[] {
    const s = displayStatusOf(b);
    if (s === 'cancelled') {
        return [
            { label: 'Accepted', state: 'done' },
            ...(b.startedAt ? [{ label: 'Started', state: 'done' as const }] : []),
            { label: 'Cancelled', state: 'cancelled' },
        ];
    }
    const at = s === 'completed' ? 3 : s === 'in_progress' ? 2 : 1;
    return ['Accepted', 'Started', 'Completed'].map((label, i) => ({
        label,
        state: i + 1 < at ? 'done' : i + 1 === at ? (at === 3 ? 'done' : 'current') : 'todo',
    }));
}
