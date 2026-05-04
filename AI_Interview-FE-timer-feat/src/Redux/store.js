import { configureStore } from "@reduxjs/toolkit";
import PopupSlice from "./Slices/PopupSlice";
import auth from "./Slices/authSlice";


export const store = configureStore({
    reducer: {
        popup: PopupSlice,
        auth: auth
        // language:languageSlice

    },
});
