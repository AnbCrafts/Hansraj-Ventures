import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    activePopup: "",
    activemode: "signin",
    reload: 0,
};

const PopupSlice = createSlice({
    name: "PopupSlice",
    initialState,
    reducers: {
        setActivePopup: (state, { payload }) => {
            state.activePopup = payload;
        },
        setReload: (state, { payload }) => {
            state.reload = Math.random();
        },
        setActiveMode: (state, { payload }) => {
            state.activemode = payload;
        },
    },
});

export const { setActivePopup, setReload, setActiveMode } = PopupSlice.actions;

export default PopupSlice.reducer;
