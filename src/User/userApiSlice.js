import { apiSlice } from "../Api/ApiSlice";
import { setBookings } from "../Booking/bookingsListSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (data) => ({
        url: "user/create-booking",
        method: "POST",
        body: { ...data },
      }),
    }),
    getUserBookings: builder.query({
      query: () => ({
        url: "user/bookings",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setBookings(data));
        } catch (error) {
          console.error("Failed to fetch user bookings:", error);
        }
      },
    }),
    getBookingById: builder.mutation({
      query: ({ bookingId }) => ({
        url: `user/get-booking-by-id`,
        method: "POST",
        body: { bookingId },
      }),
    }),
    approveStartJobRequest: builder.mutation({
      query: ({ bookingId }) => ({
        url: "user/approve-start-job-request",
        method: "POST",
        body: { bookingId },
      }),
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useGetBookingByIdMutation,
  useApproveStartJobRequestMutation,
} = userApiSlice;
