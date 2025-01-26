import { baseURL } from "./baseURL";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../Auth/AuthSlice";
import { getRefreshToken, storeRefreshToken, deleteRefreshToken } from "../secureStore/secureStoreUtility";



const baseQuery = fetchBaseQuery({
    baseUrl: `${baseURL}/auth/`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const accessToken = getState().auth.accessToken;
        if (accessToken) {
            headers.set("authorization", `Bearer ${accessToken}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 403 || result?.error?.status === 401) {
        console.log("Access token expired. Trying to refresh...");

        const refreshToken = await getRefreshToken();
        if (refreshToken) {
            const refreshResult = await baseQuery(
                { url: "/refresh", method: "POST", body: { refreshToken: refreshToken } },
                api,
                extraOptions,
            );

            if (refreshResult?.data) {
                const { user, accessToken, refreshToken: newRefreshToken } = refreshResult.data;
                await storeRefreshToken(newRefreshToken);
                api.dispatch(setCredentials({ user, accessToken, refreshToken: newRefreshToken }));
                result = await baseQuery(args, api, extraOptions);
            } else {
                console.log("Refresh token invalid or expired. Logging out...");
                await deleteRefreshToken();
                api.dispatch(logOut());
            }
        } else {
            console.log("No refresh token found. Logging out...");
            api.dispatch(logOut());
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
});
