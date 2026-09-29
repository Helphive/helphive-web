import { useMemo } from 'react';
import type { Booking } from '@/types';
import { getBucket, getDisplayStatus, type BookingBucket } from '@/utils/format';

// Splits bookings into Active / Scheduled / History by their display status.
export function useBucketedBookings(bookings: Booking[] | undefined) {
    return useMemo(() => {
        const buckets: Record<BookingBucket, Booking[]> = {
            active: [],
            scheduled: [],
            history: [],
        };
        for (const booking of bookings ?? []) {
            buckets[getBucket(getDisplayStatus(booking))].push(booking);
        }
        const byStart = (a: Booking, b: Booking) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        buckets.active.sort(byStart);
        buckets.scheduled.sort(byStart);
        buckets.history.sort((a, b) => byStart(b, a));
        return buckets;
    }, [bookings]);
}
