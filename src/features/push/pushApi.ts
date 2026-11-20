import { apiSlice } from '@/store/api/apiSlice';

// Chat contract section 2 (push) and section 3: each session has its own OneSignal external id.
export const pushApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerPush: builder.mutation<{ provider: 'onesignal'; externalId: string }, void>({
            query: () => ({ url: '/auth/push/register', method: 'POST' }),
        }),
        unregisterPush: builder.mutation<void, void>({
            query: () => ({ url: '/auth/push/register', method: 'DELETE' }),
        }),
    }),
});
