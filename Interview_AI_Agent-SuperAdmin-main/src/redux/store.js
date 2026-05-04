import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import popupSlice from "./slices/popupSlice";
import profileSlice from "./slices/profileSlice";
import assignedJobSlice from "./slices/assignedJobSlice";


const store = configureStore({
	reducer: {
		auth: authSlice,
		popup: popupSlice,
		profile: profileSlice,
		assignedJob: assignedJobSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
