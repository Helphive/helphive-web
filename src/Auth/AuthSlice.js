
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    refreshTokenExpiry: null, 
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, refreshToken, refreshTokenExpiry } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.refreshTokenExpiry = refreshTokenExpiry; 
            console.log("User credentials set in authSlice.js");
        },
        logOut: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.refreshTokenExpiry = null; 
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

// Selectors for accessing state
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentAccessToken = (state) => state.auth.accessToken;
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken;
export const selectRefreshTokenExpiry = (state) => state.auth.refreshTokenExpiry;
