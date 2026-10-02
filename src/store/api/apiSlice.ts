import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setCredentials, logout } from '@/features/auth/authSlice';

const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:8080' : 'https://api.helphive.projects.himaiz.com');

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

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

    const refreshResult = await baseQuery(
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
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 403 || result?.error?.status === 401) {
        if (!refreshInFlight) {
            refreshInFlight = refreshSession(api, extraOptions).finally(() => {
                refreshInFlight = null;
            });
        }
        if (await refreshInFlight) {
            result = await baseQuery(args, api, extraOptions);
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
