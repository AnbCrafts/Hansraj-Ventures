import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	profileEditPopup: false,
	userData: null,
};

const profileSlice = createSlice({
	name: "profileSlice",
	initialState,
	reducers: {
		setProfileEditPopup: (state, { payload }) => {
			state.profileEditPopup = payload;
		},
		updateUser: (state, { payload }) => {
			state.userData = payload;
			localStorage.setItem("H_userData", JSON.stringify(payload));
		},
	},
});

export const { setProfileEditPopup, updateUser } = profileSlice.actions;

export default profileSlice.reducer;
