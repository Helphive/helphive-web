import { apiSlice } from '@/store/api/apiSlice';
import type { AuthResponse, User } from '@/types';

interface LoginRequest {
    email: string;
    password: string;
}

interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface ProviderSignupRequest extends SignupRequest {
    phone?: string;
}

// GET /auth/user-info returns the stored user document plus a few derived fields.
export interface UserInfoResponse {
    user: User & {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        createdAt?: string;
    };
    email: string;
    firstName: string;
    lastName: string;
    profile?: string;
    status?: User['providerStatus'];
    rejectReason?: string;
    /** Services the provider is approved for, keyed publicAreaAttendant / roomAttendant / linenPorter. */
    jobTypes?: Record<string, boolean>;
}

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        signup: builder.mutation<{ message: string }, SignupRequest>({
            query: (userData) => ({
                url: '/auth/signup',
                method: 'POST',
                body: userData,
            }),
        }),
        providerSignup: builder.mutation<{ message: string }, ProviderSignupRequest>({
            query: (userData) => ({
                url: '/auth/provider-signup',
                method: 'POST',
                body: userData,
            }),
        }),
        logout: builder.mutation<void, { refreshToken: string }>({
            query: (body) => ({
                url: '/auth/logout',
                method: 'POST',
                body,
            }),
        }),
        getUserInfo: builder.query<UserInfoResponse, void>({
            query: () => '/auth/user-info',
            providesTags: ['User'],
        }),
        // POST /auth/profile (multipart): firstName, lastName, phone, street, city, state, country,
        // and a `profile` image file. Empty values are ignored by the backend. Responds { message }.
        updateProfile: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: '/auth/profile',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
        getEmailVerification: builder.mutation<{ message: string }, { email: string }>({
            query: (body) => ({
                url: '/email/get-email-verification',
                method: 'POST',
                body,
            }),
        }),
        getPasswordReset: builder.mutation<{ message: string }, { email: string }>({
            query: (body) => ({
                url: '/email/get-password-reset',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useProviderSignupMutation,
    useLogoutMutation,
    useGetUserInfoQuery,
    useUpdateProfileMutation,
    useGetEmailVerificationMutation,
    useGetPasswordResetMutation,
} = authApi;
