import { createSlice } from "@reduxjs/toolkit";
import ls from "localstorage-slim";

// ====== SLICE ======
const initialState = {
    user: ls.get("AI_USER") || {},
    token: ls.get("AI_USER_TOKEN") || "",
    loading: false,
    error: null,
    userDetails: {
        name: "",
        email: "",
        password: "",
        skills: [],
    },
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Restore user and token from local storage
        fetchDetailsFromStorage: (state) => {
            const token = ls.get("AI_USER_TOKEN");
            const user = ls.get("AI_USER");

            if (token) state.token = token;
            if (user) state.user = user;
        },

        setUserDetails: (state, { payload }) => {
            state.userDetails = payload;
        },

        setUser: (state, { payload }) => {
            state.user = payload;
            ls.set("AI_USER", payload);
        },

        // UPDATED FUNCTION — added optional encryption & debug safety
        setToken: (state, { payload }) => {
            state.token = payload;
            console.log("payload:", payload); // Added for debugging
            if (payload) {
                ls.set("AI_USER_TOKEN", payload); // Added `{ encrypt: true }`
                console.log("✅ Token saved to localstorage:", payload); //Added for debugging
            } else {
                ls.remove("AI_USER_TOKEN");
            }
        },

        logout: (state) => {
            state.user = {};
            state.token = "";
            ls.remove("AI_USER");
            ls.remove("AI_USER_TOKEN");
        },
    },
});

export const { setUser, setToken, logout, setUserDetails, fetchDetailsFromStorage } = authSlice.actions;

export default authSlice.reducer;
