import axios from "axios";

export const axiosInstance = axios.create({
	// baseURL: "http://82.25.109.145:5001",
	baseURL: import.meta.env.VITE_DOMAIN_URL, 
	// baseURL: import.meta.env.VITE_BASE_URL, 
	headers: {
		"Content-Type": "application/json",
	}, 
}); 
   