import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	reloadAssignedJob: 0,
};

const assignedJobSlice = createSlice({
	name: "assignedJobSlice",
	initialState,
	reducers: {
		setReloadAssignedJob: (state) => {
			state.reloadAssignedJob = Math.random();
		},
	},
});

export const { setReloadAssignedJob } = assignedJobSlice.actions;

export default assignedJobSlice.reducer;
