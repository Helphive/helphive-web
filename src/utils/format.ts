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
    date ? dayjs(date).format('D MMM YYYY, h:mm A') : '—';

export const formatTimeAgo = (date?: string | Date | null) => (date ? dayjs(date).fromNow() : '');

// Colors mirror the mobile app's STATUS_META.
export const STATUS_META: Record<
    DisplayStatus,
    { label: string; color: string; background: string }
> = {
    scheduled: { label: 'Scheduled', color: '#B54708', background: '#FFFAEB' },
    accepted: { label: 'Accepted', color: '#175CD3', background: '#EFF8FF' },
    awaiting_start_approval: {
        label: 'Awaiting approval',
        color: '#6941C6',
        background: '#F4F3FF',
    },
    in_progress: { label: 'In progress', color: '#FF5740', background: '#FFF1EE' },
    completed: { label: 'Completed', color: '#067647', background: '#ECFDF3' },
    cancelled: { label: 'Cancelled', color: '#B42318', background: '#FEF3F2' },
    expired: { label: 'Expired', color: '#475467', background: '#F2F4F7' },
};

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
