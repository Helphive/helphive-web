import { apiSlice } from '@/store/api/apiSlice';
import type { Booking } from '@/types';

interface CreateBookingRequest {
    service: { id: number; name: string };
    rate: number;
    hours: number;
    startDate: string;
    startTime: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface CreateBookingResponse {
    booking: Booking;
    paymentIntentId: string;
    clientSecret: string;
}

interface BookingsResponse {
    history: Booking[];
    active: Booking[];
    scheduled: Booking[];
}

interface GetBookingByIdResponse {
    booking: Booking;
    payment: {
        _id: string;
        amount: number;
        status: string;
    };
}

export const bookingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
            query: (bookingData) => ({
                url: '/auth/user/create-booking',
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['Booking'],
        }),
        getUserBookings: builder.query<BookingsResponse, void>({
            query: () => '/auth/user/bookings',
            providesTags: ['Booking'],
        }),
        getBookingById: builder.mutation<GetBookingByIdResponse, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/user/get-booking-by-id',
                method: 'POST',
                body,
            }),
        }),
        completeBooking: builder.mutation<Booking, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/complete-booking',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Booking'],
        }),
        cancelBooking: builder.mutation<Booking, { bookingId: string; reason?: string }>({
            query: (body) => ({
                url: '/auth/cancel-booking',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Booking'],
        }),
        approveStartJobRequest: builder.mutation<Booking, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/user/approve-start-job-request',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Booking'],
        }),
    }),
});

export const {
    useCreateBookingMutation,
    useGetUserBookingsQuery,
    useGetBookingByIdMutation,
    useCompleteBookingMutation,
    useCancelBookingMutation,
    useApproveStartJobRequestMutation,
} = bookingApi;
