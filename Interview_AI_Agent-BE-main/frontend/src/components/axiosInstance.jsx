import axios from "axios";

export const axiosInstance = axios.create({
	// baseURL: "http://82.25.109.145:5001",
	baseURL: import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:5001",
	headers: {   
		"Content-Type": "application/json",
	}, 
});
