import axios from "axios";
import { isTokenExpired } from "../../Utils/isTokenExpired";
import { toast } from "react-toastify";

let token = localStorage.getItem("AI_SA_token");
if (token) token = JSON.parse(token);

if (isTokenExpired(token)) {
    toast.error("Session expired. Please log in again.");
    localStorage.removeItem("AI_SA_token");
    token = null;
} 

const Instance = axios.create({
	baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
	headers: {
		Authorization: `Bearer ${token}`,
	},
});

Instance.interceptors.request.use((config) => {
    let token = localStorage.getItem("AI_SA_token");
    if (token) {
        token = JSON.parse(token);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

Instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("AI_SA_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);


export default Instance;
