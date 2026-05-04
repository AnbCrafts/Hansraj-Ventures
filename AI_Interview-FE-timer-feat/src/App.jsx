import ls from "localstorage-slim"; // Assuming you still use this from the previous example
import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import "../src/assets/index.scss";
 
// Components
import Loading from "./Components/Loading/Loading";
import CameraPopup from "./Components/Popups/Camera/Camera";
import OtpPopup from "./Components/Popups/Otp/OtpPopup";
import ProfilePopup from "./Components/Popups/ProfilePopup/ProfilePopup";
import PurchaseCreditsPopup from "./Components/Popups/PurchaseCreditsPopup/PurchaseCreditsPopup";
import SignUpPopup from "./Components/Popups/SignupPopup";
import { setActivePopup } from "./Redux/Slices/PopupSlice";
import { useAuthCheck } from "./utils/authCheck";
import ForgotPasswordPopup from "./Components/Popups/ForgotPassword/ForgotPasswordPopup";

// --- Lazy Load all Page Components ---
const LandingPage = lazy(() => import("./Pages/LandingPage/LandingPage"));
const Join = lazy(() => import("./Pages/Join/Join"));
const AddResume = lazy(() => import("./Pages/AddResume/AddResume"));
const PaymentDetails = lazy(() => import("./Pages/PaymentDetails/PaymentDetails"));

// --- Main App Component ---
function App() { 
    return (
        <BrowserRouter>
            <Routes>
                {/* GlobalLayout contains popups, toast, and suspense wrapper */}
                <Route element={<GlobalLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/join" element={<Join />} />

                    {/* Protected Routes: These routes require a login */}
                    <Route element={<ProtectedLayout />}>
                        <Route path="/dashboard" element={<AddResume />} />
                        <Route path="/payment-details" element={<PaymentDetails />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

// --- Global Layout Component ---
// Renders popups, toast, and suspense for all pages
const GlobalLayout = () => {
    const { activePopup } = useSelector((state) => state.popup);

    return (
        <div className="main-container" id="Body">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                limit={4}
                hideProgressBar={false}
                newestOnTop={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="dark"
            />

            {/* Popup conditionals */}
            {activePopup === "signin" && <SignUpPopup />}
            {activePopup === "camera" && <CameraPopup />}
            {activePopup === "otp" && <OtpPopup />}
            {activePopup === "profile" && <ProfilePopup />}
            {activePopup === "buy-credits" && <PurchaseCreditsPopup />}
            {activePopup === "forgot-password" && <ForgotPasswordPopup />}

            {/* Suspense fallback renders Loading component */}
            <Suspense fallback={<Loading />}>
                {/* Outlet renders the active route (LandingPage, Join, AddResume, etc.) */}
                <Outlet />
            </Suspense>
        </div>
    );
};

// --- Protected Layout Component ---
// Checks for auth token and protects child routes
const ProtectedLayout = () => {
    // This hook now returns the auth status
    const isAuthenticated = useAuthCheck();

    if (isAuthenticated === null) {
        return null; // You could also return <Loading /> here
    }

    // If auth is false, the hook has already redirected, but we return null
    // just in case to prevent rendering the Outlet.
    if (isAuthenticated === false) {
        return null;
    }

    // If the check passes (isAuthenticated is true), render the child route.
    return <Outlet />;
};

export default App;
