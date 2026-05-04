import React, { useState } from "react";
import styles from "./SignupPopup.module.scss";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeDropper, FaEyeSlash } from "react-icons/fa";
import { setActivePopup } from "../../Redux/Slices/PopupSlice";
import { useDispatch, useSelector } from "react-redux";
import Phone from "../../assets/SVG/phone.svg?react";
import { axiosInstance2 } from "../axios/axiosInstance2";
import { toast } from "react-toastify";
import { setUserDetails, setUser, setToken } from "../../Redux/Slices/authSlice";
  
const SignUpPopup = () => {
    const dispatch = useDispatch();
    const { activemode } = useSelector((state) => state.popup);

    const [mode, setMode] = useState(activemode || "signup");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        otp: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // This is the corrected function. Paste this over your existing handleSubmit.

    const handleSubmit = (e) => {
        // <-- Removed 'async'
        e.preventDefault();
        setLoading(true);
        setError("");

        // The try...catch...finally block has been removed,
        // as it was causing the error.

        if (mode === "signup") {
            // ✅ Signup: Request OTP
            axiosInstance2
                .post("/user/request_otp", { email: userData.email, reason: "signup" })
                .then(({ data }) => {
                    // --- This is the success logic ---
                    console.log(data);
                    toast.success("OTP : " + data.data.otp + " (For demo purposes)", {
                        autoClose: 15000,
                    });

                    // ✅ Store entered details temporarily in Redux
                    dispatch(
                        setUserDetails({
                            token: data.token,
                            name: userData.name,
                            email: userData.email,
                            password: userData.password,
                        })
                    );

                    dispatch(setActivePopup("otp"));
                })
                .catch((err) => {
                    console.error(err);
                    toast.error(err.response?.data?.msg || "Failed to request OTP");
                    setError(err.response?.data?.msg || "Failed to request OTP"); // Also set the local error state
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (mode === "signin") {
            // ✅ Signin: Login user
            axiosInstance2
                .post("/user/login", {
                    email: userData.email,
                    password: userData.password,
                })
                .then(({ data }) => {
                    // --- This is the success logic ---
                    console.log("Login Response:", data);

                    // ✅ Save user & token
                    dispatch(setUser(data.data.user || { email: userData.email }));
                    dispatch(setToken(data.data.token));

                    // ✅ Close popup and show success
                    dispatch(setActivePopup(""));
                    toast.success("Login Successful!");
                })
                .catch((err) => {
                    // --- This is the error logic ---
                    console.error(err);
                    const msg = err.response?.data?.msg || "Login failed";
                    toast.error(msg);
                    setError(msg); // Also set the local error state
                })
                .finally(() => {
                    // --- THIS IS THE FIX ---
                    // This finally() is part of the promise chain
                    // and runs *after* .then() or .catch()
                    setLoading(false);
                });
        }
    };

    return (
        <div className={styles.overlay} onClick={() => dispatch(setActivePopup(""))}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <div className={styles.logoContainer}>
                        <Phone className={styles.logoIcon} />
                        <span>Candidate Portal</span>
                    </div>
                    <div className={styles.windowControls}>
                        <div className={`${styles.dot} ${styles.red}`}></div>
                        <div className={`${styles.dot} ${styles.yellow}`}></div>
                        <div className={`${styles.dot} ${styles.green}`}></div>
                    </div>
                </header>

                <main className={styles.formBody}>
                    <h2 className={styles.title}>{mode === "signup" ? "Create your account" : "Welcome Back"}</h2>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {mode === "signup" && (
                            <input
                                type="text"
                                value={userData.name}
                                placeholder="User Name"
                                className={styles.input}
                                name="name"
                                onChange={handleInputChange}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className={styles.input}
                            onChange={handleInputChange}
                            value={userData.email}
                            required
                        />
                        <div className={styles.password}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                name="password"
                                className={styles.input}
                                onChange={handleInputChange}
                                value={userData.password}
                                required
                            />
                            {showPassword ? (
                                <FaEye className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)} />
                            ) : (
                                <FaEyeSlash className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)} />
                            )}
                        </div>
                        {console.log(loading)}
                        <button type="submit" className={styles.signUpButton} disabled={loading}>
                            {loading ? (mode === "signup" ? "Signing Up..." : "Signing In...") : mode === "signup" ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    {/* {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>} */}

                    {/* <div className={styles.divider}>
                        <hr className={styles.line} />
                        <span>OR</span>
                        <hr className={styles.line} />
                    </div>

                    <div className={styles.socialLogins}>
                        <button className={styles.socialButton}>
                            <FcGoogle size={22} /> Continue with Google
                        </button>
                        <button className={styles.socialButton}>
                            <FaApple size={22} color="#000" /> Continue with IOS
                        </button>
                    </div> */}
                </main>

                <footer className={styles.footer}>
                    <p>
                        {mode === "signup" ? "Already have an Account ? " : "Don't have an Account ? "}

                        <span onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
                            {mode === "signup" ? "Sign In" : "Sign Up"}
                        </span>
                    </p>
                    <span className={styles.forgotPassword} onClick={() => dispatch(setActivePopup("forgot-password"))}>
                        Forget Password?
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default SignUpPopup;
