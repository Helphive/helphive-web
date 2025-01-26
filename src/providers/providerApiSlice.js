import { apiSlice } from "../Api/ApiSlice";

export const providerApiSlice = apiSlice.injectEndpoints({
	overrideExisting: true,
	endpoints: (builder) => ({
		requestProviderAccount: builder.mutation({
			query: (formData) => ({
				url: "provider/request-provider-account",
				method: "POST",
				formData: true,
				body: formData,
			}),
		}),
		accountApprovalScreen: builder.mutation({
			query: () => ({
				url: "provider/account-approval-screen",
				method: "GET",
			}),
		}),
		updateProviderAvailability: builder.mutation({
			query: (data) => ({
				url: "provider/update-provider-availability",
				method: "PUT",
				body: data,
			}),
		}),
		getBookings: builder.query({
			query: () => ({
				url: "provider/get-bookings",
				method: "GET",
			}),
		}),
		getProviderBookingById: builder.mutation({
			query: ({ bookingId }) => ({
				url: "provider/get-booking-by-id",
				method: "POST",
				body: { bookingId },
			}),
		}),
		acceptBooking: builder.mutation({
			query: ({ bookingId }) => ({
				url: "provider/accept-booking",
				method: "POST",
				body: { bookingId },
			}),
		}),
		getMyOrders: builder.query({
			query: () => ({
				url: "provider/my-orders",
				method: "GET",
			}),
		}),
		startBooking: builder.mutation({
			query: ({ bookingId }) => ({
				url: "provider/start-booking",
				method: "POST",
				body: { bookingId },
			}),
		}),
		stripeConnectOnboarding: builder.query({
			query: () => ({
				url: "provider/stripe-connect-onboarding",
				method: "GET",
			}),
		}),
		getEarnings: builder.query({
			query: () => ({
				url: "provider/get-earnings",
				method: "GET",
			}),
		}),
		createPayout: builder.mutation({
			query: ({ amount }) => ({
				url: "provider/create-payout",
				method: "POST",
				body: { amount },
			}),
		}),
		getStripeExpressLoginLink: builder.query({
			query: () => ({
				url: "provider/stripe-express-login-link",
				method: "GET",
			}),
		}),
	}),
});

export const {
	useRequestProviderAccountMutation,
	useAccountApprovalScreenMutation,
	useUpdateProviderAvailabilityMutation,
	useGetBookingsQuery,
	useGetProviderBookingByIdMutation,
	useAcceptBookingMutation,
	useGetMyOrdersQuery,
	useStartBookingMutation,
	useStripeConnectOnboardingQuery,
	useGetEarningsQuery,
	useCreatePayoutMutation,
	useGetStripeExpressLoginLinkQuery,
} = providerApiSlice;
