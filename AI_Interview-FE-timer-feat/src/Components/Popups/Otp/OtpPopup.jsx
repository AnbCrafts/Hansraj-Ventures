import styles from "./OtpPopup.module.scss";
import { setActivePopup } from "../../../Redux/Slices/PopupSlice";
import { useDispatch, useSelector } from "react-redux";
import Phone from "../../../assets/SVG/phone.svg?react";
import Otp from "../../../assets/SVG/otp.svg?react";
import { useRef, useState } from "react";
import { axiosInstance2 } from "../../axios/axiosInstance2";
import { toast } from "react-toastify";
import { setToken, setUser } from "../../../Redux/Slices/authSlice";

const OtpPopup = () => {
    const dispatch = useDispatch();
    const { userDetails } = useSelector((state) => state.auth);
    // console.log("User Details from Redux:", userDetails);
    const [loading, setLoading] = useState(false);

    const length = 6; // number of OTP digits
    const [otp, setOtp] = useState(Array(length).fill(""));
    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        if (/^[0-9]$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input if digit is entered
            if (value && index < length - 1) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        axiosInstance2
            .post("/user/register", {
                name: userDetails.name,
                email: userDetails.email,
                password: userDetails.password,
                otp: otp.join(""),
            })
            .then(({ data }) => {
                console.log(data);
                toast.success("Registration Successful!");
                dispatch(setUser(data.data.user || { email: userData.email }));
                console.log("data.token:", data.data.token); // Added for debugging
                dispatch(setToken(data.data.token));
                dispatch(setActivePopup(""));
            })
            .catch((err) => {
                toast.error(err.response?.msg || "Something went wrong. Please try again.");
                console.log(err);
            })
            .finally(() => setLoading(false));
    };

    const handleResendOtp = () => {
        axiosInstance2
            .post("/user/request_otp", { email: userDetails.email })
            .then(({ data }) => {
                // --- This is the success logic ---
                console.log(data);
                toast.success("OTP : " + data.data.otp + " (For demo purposes)", {
                    autoClose: 15000,
                });
            })
            .catch((err) => {
                toast.error(err.response?.data?.msg || "Something went wrong. Please try again.");
                console.log(err);
            })
            .finally(() => setLoading(false));
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
                <main>
                    <i>
                        <Otp />
                    </i>
                    <p>Enter the 6 digit code sent to you Email</p>

                    <div className={styles.OtpConatianer}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                maxLength="1"
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>

                    <button onClick={handleSubmit}>{loading ? "Proccessing..." : "Submit"}</button>
                </main>
                <button onClick={handleResendOtp}>Resent Code</button> 
            </div>
        </div>
    );
};

export default OtpPopup;
