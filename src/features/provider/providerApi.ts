import { apiSlice } from '@/store/api/apiSlice';
import type { Booking, EarningsData, ProviderApplication } from '@/types';

interface UpdateAvailabilityRequest {
    isProviderAvailable: boolean;
    selectedJobTypes: number[];
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
}

interface StripeOnboardingResponse {
    url: string;
}

interface CreatePayoutRequest {
    amount: number;
}

interface PayoutResponse {
    success: boolean;
    message: string;
    payout?: {
        id: string;
        amount: number;
        status: string;
    };
}

interface GetBookingByIdResponse {
    booking: Booking;
    payment: {
        _id: string;
        amount: number;
        status: string;
    };
}

export const providerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        requestProviderAccount: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: '/auth/provider/request-provider-account',
                method: 'POST',
                body: formData,
            }),
        }),
        getAccountApprovalScreen: builder.query<ProviderApplication, void>({
            query: () => '/auth/provider/account-approval-screen',
            providesTags: ['Provider'],
        }),
        updateProviderAvailability: builder.mutation<void, UpdateAvailabilityRequest>({
            query: (body) => ({
                url: '/auth/provider/update-provider-availability',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        getAvailableBookings: builder.query<Booking[], void>({
            query: () => '/auth/provider/get-bookings',
            providesTags: ['Booking'],
        }),
        getProviderBookingById: builder.mutation<GetBookingByIdResponse, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/provider/get-booking-by-id',
                method: 'POST',
                body,
            }),
        }),
        acceptBooking: builder.mutation<Booking, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/provider/accept-booking',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Booking'],
        }),
        getMyOrders: builder.query<Booking[], void>({
            query: () => '/auth/provider/my-orders',
            providesTags: ['Booking'],
        }),
        startBooking: builder.mutation<Booking, { bookingId: string }>({
            query: (body) => ({
                url: '/auth/provider/start-booking',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Booking'],
        }),
        getStripeConnectOnboarding: builder.query<StripeOnboardingResponse, void>({
            query: () => '/auth/provider/stripe-connect-onboarding',
        }),
        getEarnings: builder.query<EarningsData, void>({
            query: () => '/auth/provider/get-earnings',
            providesTags: ['Earnings'],
        }),
        createPayout: builder.mutation<PayoutResponse, CreatePayoutRequest>({
            query: (body) => ({
                url: '/auth/provider/create-payout',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Earnings'],
        }),
        getStripeExpressLoginLink: builder.query<{ url: string }, void>({
            query: () => '/auth/provider/stripe-express-login-link',
        }),
    }),
});

export const {
    useRequestProviderAccountMutation,
    useGetAccountApprovalScreenQuery,
    useUpdateProviderAvailabilityMutation,
    useGetAvailableBookingsQuery,
    useGetProviderBookingByIdMutation,
    useAcceptBookingMutation,
    useGetMyOrdersQuery,
    useStartBookingMutation,
    useGetStripeConnectOnboardingQuery,
    useLazyGetStripeConnectOnboardingQuery,
    useGetEarningsQuery,
    useCreatePayoutMutation,
    useLazyGetStripeExpressLoginLinkQuery,
} = providerApi;
