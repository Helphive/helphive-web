import dayjs from 'dayjs';
import type { Booking, EarningsData } from '@/types';
import { PLATFORM_FEE_RATE, getDisplayStatus } from '@/utils/format';

/** Gross order value: hourly rate times hours. */
export const orderTotal = (b: Pick<Booking, 'rate' | 'hours'>) => (b.rate || 0) * (b.hours || 0);

/** What the provider keeps after the platform fee. */
export const orderEarnings = (b: Pick<Booking, 'rate' | 'hours'>) =>
    orderTotal(b) * (1 - PLATFORM_FEE_RATE);

/** Short reference shown to people, the same one the earnings table uses. */
export const orderCode = (id: string) => `HH-${id.slice(-8).toUpperCase()}`;

/** Venue name or street: the part of the address before the first comma. */
export const venueName = (address?: string) => (address ?? '').split(',')[0]?.trim() || 'Address';

export const startMs = (b: Pick<Booking, 'startDate'>) => new Date(b.startDate).getTime();

export const byStartAsc = (a: Booking, b: Booking) => startMs(a) - startMs(b);

export const timeRange = (b: Pick<Booking, 'startDate' | 'hours'>) => {
    const start = dayjs(b.startDate);
    return `${start.format('HH:mm')} to ${start.add(b.hours || 0, 'hour').format('HH:mm')}`;
};

const MONTHS_SHOWN = 6;

/**
 * Totals and the monthly chart series, derived from the earning rows the API returns.
 * Older API versions send pre-computed aggregates, which win when present.
 */
export function summarizeEarnings(data?: EarningsData) {
    const rows = data?.earnings ?? [];
    const totalEarnings =
        data?.totalEarnings ??
        rows.filter((e) => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
    const pendingBalance =
        data?.pendingBalance ??
        rows.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const monthlyEarnings =
        data?.monthlyEarnings ??
        Array.from({ length: MONTHS_SHOWN }, (_, i) =>
            dayjs().subtract(MONTHS_SHOWN - 1 - i, 'month')
        ).map((m) => ({
            month: m.format('MMM'),
            amount: rows
                .filter((e) => e.status !== 'cancelled' && dayjs(e.date).isSame(m, 'month'))
                .reduce((sum, e) => sum + e.amount, 0),
        }));
    return { totalEarnings, pendingBalance, monthlyEarnings };
}

/** Index of the bar for the current month; falls back to the last bar (series are chronological). */
export function currentMonthIndex(data: { month: string }[]) {
    const idx = data.findIndex((m) => m.month === dayjs().format('MMM'));
    return idx >= 0 ? idx : data.length - 1;
}

/** Best month and the average across the months shown, for the chart footer. */
export function monthlyStats(data: { month: string; amount: number }[]) {
    if (data.length === 0 || data.every((d) => d.amount <= 0)) return null;
    const best = data.reduce((a, b) => (b.amount > a.amount ? b : a));
    const average = data.reduce((sum, d) => sum + d.amount, 0) / data.length;
    return { best, average };
}

/** The provider's jobs that start today (not cancelled or expired), earliest first. */
export function jobsToday(orders: Booking[] | undefined): Booking[] {
    return (orders ?? [])
        .filter((b) => {
            const status = getDisplayStatus(b);
            return (
                status !== 'cancelled' &&
                status !== 'expired' &&
                dayjs(b.startDate).isSame(dayjs(), 'day')
            );
        })
        .sort(byStartAsc);
}
