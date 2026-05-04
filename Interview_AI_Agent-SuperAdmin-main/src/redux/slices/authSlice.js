import { createSlice } from "@reduxjs/toolkit";
import ls from "localstorage-slim";

const initialState = {
	token: null,
	userId: null,
	userData: null,
};

const authSlice = createSlice({
	name: "authSlice",
	initialState,
	reducers: {
		fetchDetailsFromStorage: (state) => {
			const token = ls.get("AI_SA_token");
			const userData = ls.get("AI_SA_userData");

			if (token) state.token = token;
			if (userData) state.userData = userData;
			if (userData) state.userId = userData._id;
		},
		setActiveUser: (state, { payload }) => {
			state.token = payload.token;
			state.userData = payload.userData;
			state.userId = payload.userData._id;


			ls.set("AI_SA_token", payload.token);
			ls.set("AI_SA_userData", payload.userData);
		},
		updateUser: (state, { payload }) => {
			state.userData = payload;
			ls.set("AI_SA_userData", payload);
		},
		removeActiveUser: (state) => {
			state.token = "";
			state.userData = null;
			state.userId = "";

			ls.remove("AI_SA_token");
			ls.remove("AI_SA_userData");
		},
	},
});

export const { fetchDetailsFromStorage, setActiveUser, updateUser, removeActiveUser } = authSlice.actions;

export default authSlice.reducer;
