import axios from "axios";
import ls from "localstorage-slim";

export const axiosInstance2 = axios.create({
  // baseURL: "http://82.25.109.145:5001",
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }, 
});   

// automatically attach token
axiosInstance2.interceptors.request.use(
  (config) => {
    const token = ls.get("AI_USER_TOKEN"); // 🟢 Get token securely
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 🟢 Attach token to request
    }
    return config;
  },
  (error) => Promise.reject(error)
);
