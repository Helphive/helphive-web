import { useCallback, useEffect, useRef, useState } from 'react';
import type { Booking } from '@/types';
import { getErrorMessage } from '@/utils/format';

export interface BookingPayment {
    amount: number;
    status: string;
    refundStatus?: string | null;
    refundAmount?: number;
}

interface BookingResult {
    booking: Booking;
    payment?: BookingPayment | null;
}

type BookingFetcher = (arg: { bookingId: string }) => { unwrap: () => Promise<BookingResult> };

// Loads a single booking through one of the get-booking-by-id mutations.
// `reload` refreshes in the background without flashing the loading state.
export function useBookingLoader(bookingId: string | undefined, fetcher: BookingFetcher) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [payment, setPayment] = useState<BookingPayment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    const reload = useCallback(async () => {
        if (!bookingId) return;
        try {
            const result = await fetcherRef.current({ bookingId }).unwrap();
            setBooking(result.booking);
            setPayment(result.payment ?? null);
            setError(null);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load details'));
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        setLoading(true);
        setBooking(null);
        void reload();
    }, [reload]);

    return { booking, payment, error, loading, reload };
}
