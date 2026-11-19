import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Booking, DisplayStatus } from '@/types';

dayjs.extend(relativeTime);

export const formatMoney = (amount?: number | null, currency = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
        Number(amount) || 0
    );

export const formatDate = (date?: string | Date | null) =>
    date ? dayjs(date).format('D MMM YYYY') : '—';

export const formatDateTime = (date?: string | Date | null) =>
    date ? dayjs(date).format('ddd D MMM YYYY, HH:mm') : '—';

/** Day of a shift, "Fri 24 Jan"; adds the year when it is not this year ("Fri 24 Jan 2025"). */
export const formatDay = (date?: string | Date | dayjs.Dayjs | null) => {
    if (!date) return '—';
    const d = dayjs(date);
    return d.format(d.isSame(dayjs(), 'year') ? 'ddd D MMM' : 'ddd D MMM YYYY');
};

export const formatTimeAgo = (date?: string | Date | null) => (date ? dayjs(date).fromNow() : '');

// Mirrors the backend's derived displayStatus for objects that lack it.
export const getDisplayStatus = (
    booking?: Pick<
        Booking,
        'status' | 'displayStatus' | 'userApprovalRequested' | 'providerId' | 'startDate'
    > | null
): DisplayStatus => {
    if (booking?.displayStatus) return booking.displayStatus;
    switch (booking?.status) {
        case 'completed':
            return 'completed';
        case 'cancelled':
            return 'cancelled';
        case 'in progress':
            return 'in_progress';
        default:
            if (booking?.userApprovalRequested) return 'awaiting_start_approval';
            if (booking?.providerId) return 'accepted';
            return booking?.startDate && dayjs(booking.startDate).isBefore(dayjs())
                ? 'expired'
                : 'scheduled';
    }
};

export type BookingBucket = 'active' | 'scheduled' | 'history';

export const getBucket = (status: DisplayStatus): BookingBucket => {
    if (status === 'completed' || status === 'cancelled' || status === 'expired') return 'history';
    if (status === 'scheduled') return 'scheduled';
    return 'active';
};

export const getErrorMessage = (err: unknown, fallback: string): string => {
    const message = (err as { data?: { message?: unknown } } | undefined)?.data?.message;
    return typeof message === 'string' && message ? message : fallback;
};

export const pluralHours = (hours?: number) => `${hours || 0} hour${(hours || 0) === 1 ? '' : 's'}`;

// Platform fee share taken from the booking subtotal (provider keeps the rest).
export const PLATFORM_FEE_RATE = 0.05;
