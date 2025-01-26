// store.js

import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./Api/ApiSlice";
import { emailApiSlice } from "./Email/emailApiSlice";
import authSlice from "./Auth/AuthSlice";
import bookingSlice from "./Booking/bookSlice";
import bookingsListSlice from "./Booking/bookingsListSlice";
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [emailApiSlice.reducerPath]: emailApiSlice.reducer,
        auth: authSlice,
        booking: bookingSlice,
        bookingsList: bookingsListSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware).concat(emailApiSlice.middleware),
    devTools: true,
});

export default store;
