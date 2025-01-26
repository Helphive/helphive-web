import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
  active: [],
  scheduled: [],
};

const bookingsListSlice = createSlice({
  name: "bookingsList",
  initialState,
  reducers: {
    setBookings(state, action) {
      state.history = action.payload.history;
      state.active = action.payload.active;
      state.scheduled = action.payload.scheduled;
    },
  },
});

export const { setBookings } = bookingsListSlice.actions;

export const selectBookingList = (state) => state.bookingsList;

export default bookingsListSlice.reducer;
