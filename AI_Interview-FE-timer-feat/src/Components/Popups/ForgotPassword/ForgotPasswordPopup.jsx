import React, { useState } from "react";
import styles from "./ForgotPasswordPopup.module.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { setActivePopup } from "../../../Redux/Slices/PopupSlice";
import { useDispatch } from "react-redux";
import Phone from "../../../assets/SVG/phone.svg?react";
import { axiosInstance2 } from "../../axios/axiosInstance2";
import { toast } from "react-toastify";

const ForgotPasswordPopup = () => {
    const dispatch = useDispatch();

    // Steps: 1 = Enter Email, 2 = Enter OTP & New Password
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [userData, setUserData] = useState({
        email: "",
        otp: "",
        new_password: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // --- API 1: Request OTP ---
    const handleRequestOtp = (e) => {
        e.preventDefault();
        setLoading(true);

        axiosInstance2
            .post("/user/request_otp", { 
                email: userData.email, 
                reason: "forgot" // Required by backend
            })
            .then(({ data }) => {
                toast.success(data.msg || "OTP sent successfully!");
                // For demo/dev purposes only:
                if(data.data?.otp) {
                     toast.info("OTP: " + data.data.otp, { autoClose: 10000 });
                }
                setStep(2); // Move to Step 2
            })
            .catch((err) => {
                console.error(err);
                toast.error(err.response?.data?.msg || "Failed to send OTP");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // --- API 2: Reset Password ---
    const handleResetPassword = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email: userData.email,
            otp: userData.otp,
            new_password: userData.new_password
        };

        axiosInstance2
            .post("/user/forgot_password", payload)
            .then(({ data }) => {
                toast.success(data.msg || "Password reset successfully!");
                // Redirect user to Sign In popup after success
                dispatch(setActivePopup("signin")); 
            })
            .catch((err) => {
                console.error(err);
                toast.error(err.response?.data?.msg || "Failed to reset password");
            })
            .finally(() => {
                setLoading(false);
            });
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
                    <h2 className={styles.title}>
                        {step === 1 ? "Forgot Password?" : "Reset Password"}
                    </h2>
                    <p style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
                        {step === 1 
                            ? "Enter your email to receive a verification code." 
                            : `Enter the OTP sent to ${userData.email}`}
                    </p>

                    <form 
                        className={styles.form} 
                        onSubmit={step === 1 ? handleRequestOtp : handleResetPassword}
                    >
                        {/* Email Field - Always visible but disabled in Step 2 */}
                        <input
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            className={styles.input}
                            onChange={handleInputChange}
                            value={userData.email}
                            disabled={step === 2} // Lock email in step 2
                            required
                        />

                        {/* Step 2 Fields: OTP and New Password */}
                        {step === 2 && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    name="otp"
                                    className={styles.input}
                                    onChange={handleInputChange}
                                    value={userData.otp}
                                    required
                                />

                                <div className={styles.password}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        name="new_password"
                                        className={styles.input}
                                        onChange={handleInputChange}
                                        value={userData.new_password}
                                        required
                                    />
                                    {showPassword ? (
                                        <FaEye 
                                            className={styles.eyeIcon} 
                                            onClick={() => setShowPassword(!showPassword)} 
                                        />
                                    ) : (
                                        <FaEyeSlash 
                                            className={styles.eyeIcon} 
                                            onClick={() => setShowPassword(!showPassword)} 
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        <button 
                            type="submit" 
                            className={styles.signUpButton} 
                            disabled={loading}
                        >
                            {loading 
                                ? "Processing..." 
                                : step === 1 ? "Get OTP" : "Reset Password"
                            }
                        </button>

                        {/* Allow user to go back to email entry if they made a typo */}
                        {/* {step === 2 && !loading && (
                            <button 
                                type="button" 
                                className={styles.socialButton} 
                                style={{marginTop: '10px', justifyContent: 'center'}}
                                onClick={() => setStep(1)}
                            >
                                Change Email
                            </button>
                        )} */}
                    </form>
                </main>

                <footer className={styles.footer}>
                    <p>
                        Remember your password?{" "}
                        <span onClick={() => dispatch(setActivePopup("signin"))}>
                            Sign In
                        </span>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPasswordPopup;