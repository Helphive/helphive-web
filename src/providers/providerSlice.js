import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isAvailable: false,
	jobTypes: {
		publicAreaAttendant: true,
		roomAttendant: true,
		linenPorter: true,
	},
	currentLocation: {
		latitude: null,
		longitude: null,
	},
};

const providerSlice = createSlice({
	name: "provider",
	initialState,
	reducers: {
		setAvailability(state, action) {
			state.isAvailable = action.payload;
		},
		setJobTypes(state, action) {
			state.jobTypes = action.payload;
		},
		setCurrentLocation(state, action) {
			state.currentLocation = action.payload;
		},
	},
});

export const { setAvailability, setJobTypes, setCurrentLocation } = providerSlice.actions;

export const selectAvailability = (state) => {
	return state.provider?.isAvailable ?? false;
};

export const selectJobTypes = (state) => {
	return state.provider?.jobTypes;
};

export const selectCurrentLocation = (state) => {
	return state.provider?.currentLocation;
};

export default providerSlice.reducer;
