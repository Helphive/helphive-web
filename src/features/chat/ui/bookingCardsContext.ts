import { createContext } from 'react';
import type { Booking } from '@/types';
import type { Area } from './chatModel';

export interface BookingCardsShared {
    area: Area;
    bookings: ReadonlyMap<string, Booking>;
}

/** The pair's bookings, once for every card of the conversation. */
export const BookingCardsContext = createContext<BookingCardsShared>({
    area: 'user',
    bookings: new Map(),
});
