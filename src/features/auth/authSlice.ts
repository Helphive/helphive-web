import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const STORAGE_KEY = 'helphive-auth';

const loadAuthState = (): AuthState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Invalid stored data
    }
    return {
        user: null,
        accessToken: null,
        refreshToken: null,
    };
};

const saveAuthState = (state: AuthState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage error
    }
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: unknown;
                accessToken: string;
                refreshToken: string;
            }>
        ) => {
            state.user = action.payload.user as User;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            saveAuthState(state);
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                saveAuthState(state);
            }
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.accessToken;

export default authSlice.reducer;
