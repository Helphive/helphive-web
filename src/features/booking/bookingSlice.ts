import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Booking } from '@/types';

interface BookingFormData {
    serviceId: number | null;
    serviceName: string;
    rate: number;
    hours: number;
    startDate: string | null;
    startTime: string | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
}

interface BookingState {
    formData: BookingFormData;
    currentBooking: Booking | null;
    paymentIntentId: string | null;
    clientSecret: string | null;
}

const initialState: BookingState = {
    formData: {
        serviceId: null,
        serviceName: '',
        rate: 20,
        hours: 1,
        startDate: null,
        startTime: null,
        address: '',
        latitude: null,
        longitude: null,
    },
    currentBooking: null,
    paymentIntentId: null,
    clientSecret: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
            state.currentBooking = action.payload;
        },
        setPaymentInfo: (
            state,
            action: PayloadAction<{ paymentIntentId: string; clientSecret: string }>
        ) => {
            state.paymentIntentId = action.payload.paymentIntentId;
            state.clientSecret = action.payload.clientSecret;
        },
        resetBookingForm: (state) => {
            state.formData = initialState.formData;
            state.paymentIntentId = null;
            state.clientSecret = null;
        },
        resetBookingState: () => initialState,
    },
});

export const {
    setFormData,
    setCurrentBooking,
    setPaymentInfo,
    resetBookingForm,
    resetBookingState,
} = bookingSlice.actions;

export const selectBookingFormData = (state: { booking: BookingState }) => state.booking.formData;
export const selectCurrentBooking = (state: { booking: BookingState }) =>
    state.booking.currentBooking;
export const selectPaymentInfo = (state: { booking: BookingState }) => ({
    paymentIntentId: state.booking.paymentIntentId,
    clientSecret: state.booking.clientSecret,
});

export default bookingSlice.reducer;
