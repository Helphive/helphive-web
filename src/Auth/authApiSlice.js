import { apiSlice } from "../Api/ApiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    signup: builder.mutation({
      query: (credentials) => ({
        url: "signup",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    providerSignup: builder.mutation({
      query: (credentials) => ({
        url: "provider-signup",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    logout: builder.mutation({
      query: (credentials) => ({
        url: "logout",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    fetchUserDetails: builder.query({
      query: () => "user-info",
    }),
    completeBooking: builder.mutation({
      query: ({ bookingId }) => ({
        url: "/complete-booking",
        method: "POST",
        body: { bookingId },
      }),
    }),
    cancelBooking: builder.mutation({
      query: ({ bookingId }) => ({
        url: "/cancel-booking",
        method: "POST",
        body: { bookingId },
      }),
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "/profile",
        method: "POST",
        body: formData,
      }),
    }),
    
    generativeChat: builder.mutation({
      query: (chatInput) => ({
        url: "/generative-chat",
        method: "POST",
        body: chatInput,
      }),
    }),
    
    azureChat: builder.mutation({
      query: (chatInput) => ({
        url: "/openai-chat",
        method: "POST",
        body: chatInput,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useProviderSignupMutation,
  useLogoutMutation,
  useFetchUserDetailsQuery,
  useCompleteBookingMutation,
  useCancelBookingMutation,
  useUpdateProfileMutation,
  useGenerativeChatMutation, 
  useAzureChatMutation, 
} = authApiSlice;
