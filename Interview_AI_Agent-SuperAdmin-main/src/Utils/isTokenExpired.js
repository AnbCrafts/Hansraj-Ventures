import { jwtDecode } from 'jwt-decode';

// Function to get the token from storage (e.g., localStorage)
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Function to check if the token is expired
export const isTokenExpired = (token) => {
  if (!token) {
    return true; // No token means it's "expired" for our purposes
  }
  try {

    const decodedToken = jwtDecode(token);
    console.log(decodedToken)

    const expirationTime = decodedToken.exp; // This is in seconds

    // Get the current time in seconds
    const currentTime = Date.now() / 1000;

    // Add a small buffer (e.g., 10 seconds) to be safe
    const buffer = 10; 
    
    return expirationTime < (currentTime + buffer);
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};