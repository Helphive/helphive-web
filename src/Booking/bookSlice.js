import { createSlice } from "@reduxjs/toolkit";


const initialState = {
	bookingInfo: {
		service: null,
		serviceName: null,
		rate: "20",
		hours: 1,
		startDate: null,
		startTime: null,
		address: "",
		latitude: null,
		longitude: null,
	},
	bookingId: null,
	paymentIntentId: null,
	clientSecret: null,
	paymentStatus: "pending",
};


const getServiceName = (service) => {
	switch (service) {
		case 1:
			return "Public Area Attendant";
		case 2:
			return "Room Attendant";
		case 3:
			return "Linen Porter";
		default:
			return null;
	}
};


const bookingSlice = createSlice({
	name: "booking",
	initialState,
	reducers: {
		setBookingId: (state, action) => {
			state.bookingId = action.payload;
		},
		setPaymentIntentId: (state, action) => {
			state.paymentIntentId = action.payload;
		},
		setClientSecret: (state, action) => {
			state.clientSecret = action.payload;
		},
		setBookingInfo: (state, action) => {
			state.bookingInfo = {
				...action.payload,
				serviceName: getServiceName(action.payload.service),
			};
		},
		setPaymentStatus: (state, action) => {
			state.paymentStatus = action.payload ?? state.paymentStatus;
		},
	},
});


export const { setBookingId, setPaymentIntentId, setClientSecret, setBookingInfo, setPaymentStatus } = bookingSlice.actions;
export default bookingSlice.reducer;


export const selectBookingId = (state) => state.booking.bookingId;
export const selectPaymentIntentId = (state) => state.booking.paymentIntentId;
export const selectBookingInfo = (state) => state.booking.bookingInfo;
export const selectClientSecret = (state) => state.booking.clientSecret;
export const selectPaymentStatus = (state) => state.booking.paymentStatus;
