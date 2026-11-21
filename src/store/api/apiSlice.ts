import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setCredentials, logout } from '@/features/auth/authSlice';
import { API_URL, getDeviceId, getClientPass, forceReattest } from './clientPass';

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: async (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // Optional client details for analytics; a failure here must never block the request.
        headers.set('X-App-Platform', 'web');
        try {
            headers.set('X-App-Version', __APP_VERSION__);
        } catch {
            // Not defined (e.g. a tool that skips the Vite build): leave the header out.
        }
        const deviceId = getDeviceId();
        if (deviceId) headers.set('X-Device-Id', deviceId);
        const pass = await getClientPass();
        if (pass) headers.set('X-Client-Pass', pass);
        return headers;
    },
});

// The API answers 428 CLIENT_PASS_REQUIRED when the client pass is missing or stale: attest again and retry
// once. 428 is not an auth failure, so it never reaches the token refresh below.
const sendWithPass: typeof baseQuery = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    const error = result.error;
    const passRequired =
        error?.status === 428 &&
        (error.data as { code?: string } | undefined)?.code === 'CLIENT_PASS_REQUIRED';
    if (!passRequired || !(await forceReattest())) return result;
    return baseQuery(args, api, extraOptions);
};

// Only one refresh at a time: when the access token expires, parallel requests all get a 401, and refreshing
// once per request replayed the same single-use refresh token and signed the user out.
let refreshInFlight: Promise<boolean> | null = null;

const refreshSession = async (
    api: Parameters<BaseQueryFn>[1],
    extraOptions: Parameters<BaseQueryFn>[2]
): Promise<boolean> => {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (!refreshToken) {
        api.dispatch(logout());
        return false;
    }

    const refreshResult = await sendWithPass(
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions
    );

    if (refreshResult?.data) {
        const data = refreshResult.data as {
            accessToken: string;
            refreshToken: string;
            user: unknown;
        };
        api.dispatch(
            setCredentials({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: data.user,
            })
        );
        return true;
    }

    // Only a definitive rejection ends the session; a network blip keeps the user signed in.
    const status = refreshResult?.error?.status;
    if (status === 401 || status === 403) api.dispatch(logout());
    return false;
};

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
    let result = await sendWithPass(args, api, extraOptions);

    if (result?.error?.status === 403 || result?.error?.status === 401) {
        if (!refreshInFlight) {
            refreshInFlight = refreshSession(api, extraOptions).finally(() => {
                refreshInFlight = null;
            });
        }
        if (await refreshInFlight) {
            result = await sendWithPass(args, api, extraOptions);
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Booking', 'Provider', 'Earnings', 'NotificationCount'],
    endpoints: () => ({}),
});
