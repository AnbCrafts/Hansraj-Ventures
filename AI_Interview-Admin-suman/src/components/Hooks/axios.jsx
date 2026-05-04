import axios from "axios";
import { isTokenExpired } from "../../Utils/isTokenExpired";
import { toast } from "react-toastify";

let token = localStorage.getItem("AI_token");
if (token) token = JSON.parse(token);

if (isTokenExpired(token)) {
    toast.error("Session expired. Please log in again.");
    localStorage.removeItem("AI_token");
    token = null;
}

const Instance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export default Instance;
