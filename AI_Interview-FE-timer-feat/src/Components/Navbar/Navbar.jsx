import React, { useState } from "react";
import styles from "./Navbar.module.scss";
import logo from "../../assets/Images/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveMode, setActivePopup } from "../../Redux/Slices/PopupSlice";
import { logout } from "../../Redux/Slices/authSlice";
import profileAvatar from "../../assets/SVG/Profile1.png";
import { HiMenu, HiX } from "react-icons/hi"; // Import hamburger/close icons

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { activePopup } = useSelector((state) => state.popup);
    const { token, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        closeMobileMenu(); // Close menu on logout
        navigate("/")
    };

    const handleScrollToFooter = () => {
        const footerElement = document.getElementById("footer");
        if (footerElement) {
            footerElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // A handler to combine scrolling and closing the menu
    const handleScrollAndClose = () => {
        navigate("/");

        handleScrollToFooter();
        closeMobileMenu();
    };

    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    // We define the links and auth buttons once to reuse them
    const navLinks = (
        <>
            <div>
                <Link to="/" onClick={closeMobileMenu} className={isActiveLink("/") ? styles.active : ""}>
                    Home
                </Link>
            </div>
            {/* <div>
                <a href="https://admin.ndtctc.com/" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>
                    Admin
                </a>
            </div> */}
            {/* <div>
                <a onClick={handleScrollAndClose} style={{ cursor: "pointer" }}>
                    Contact
                </a>
            </div> */}
            {token && (
                <>
                    <div>
                        <Link to="/dashboard" onClick={closeMobileMenu} className={isActiveLink("/dashboard") ? styles.active : ""}>
                            Dashboard
                        </Link>
                    </div>
                    <div>
                        <Link
                            to="/payment-details"
                            onClick={closeMobileMenu}
                            className={isActiveLink("/payment-details") ? styles.active : ""}
                        >
                            Payment Details
                        </Link>
                    </div>
                </>
            )}
        </>
    );

    const authButtons = (
        <>
            {token ? (
                <div className={styles.userSection}>
                    <div
                        onClick={() => {
                            dispatch(setActivePopup("profile"));
                            closeMobileMenu();
                        }}
                    >
                        <img src={user?.profileImage || profileAvatar} alt="Profile" className={styles.profileImage} />
                    </div>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            ) : (
                <>
                    <button
                        className={styles.signIn}
                        onClick={() => {
                            dispatch(setActivePopup("signin"));
                            dispatch(setActiveMode("signin"));
                            closeMobileMenu();
                        }}
                    >
                        Sign in
                    </button>
                    <button
                        className={styles.getStarted}
                        onClick={() => {
                            dispatch(setActivePopup("signin"));
                            dispatch(setActiveMode("signup"));
                            closeMobileMenu();
                        }}
                    >
                        Get Started
                    </button>
                </>
            )}
        </>
    );

    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <Link to="/">
                    <img src={logo} alt="Logo" />
                </Link>
            </div>

            {/* --- Desktop Navigation (Hidden on mobile) --- */}
            <div className={styles.desktopNav}>
                <div className={styles.middle}>{navLinks}</div>
                <div className={styles.right}>{authButtons}</div>
            </div>

            {/* --- Hamburger Icon (Visible on mobile) --- */}
            <div className={styles.hamburgerIcon} onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <HiX size={30} /> : <HiMenu size={30} />}
            </div>

            {/* --- Mobile Menu (Fullscreen Overlay) --- */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuLinks}>{navLinks}</div>
                    <div className={styles.mobileMenuAuth}>{authButtons}</div>
                </div>
            )}
        </nav>
    );
}
