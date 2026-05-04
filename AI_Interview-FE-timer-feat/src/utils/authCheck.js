import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ls from 'localstorage-slim';

/**
 * A custom hook to protect routes.
 * Checks for a user token. If not found, it shows an error toast 
 * and navigates to the homepage.
 * * @returns {boolean | null} - `true` if authenticated, `false` if not, 
 * `null` while checking.
 */
export const useAuthCheck = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = pending check
    const navigate = useNavigate();

    useEffect(() => {
        // Get the token from local storage
        // Make sure "AI_USER_TOKEN" is your correct key
        const token = ls.get("AI_USER_TOKEN"); 

        // Check if the token does NOT exist
        if (!token) {
            // Show an error toast
            toast.error("You must be logged in to view that page.");
            
            // Redirect to the homepage
            navigate("/", { replace: true });
            
            // Set auth status to false
            setIsAuthenticated(false);
        } else {
            // Token exists, user is authenticated
            setIsAuthenticated(true);
        }

        // This effect runs only once when the component mounts
    }, [navigate]);

    // Return the authentication status
    return isAuthenticated;
};

