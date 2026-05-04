import React, { useState, useEffect } from "react";
import styles from "./ProfilePopup.module.scss"; // Reusing your styles
import { axiosInstance2 } from "../../axios/axiosInstance2";
import { useDispatch } from "react-redux";
import { setReload } from "../../../Redux/Slices/PopupSlice";
import { toast } from "react-toastify";

export default function ProfileUpdate() {
    const dispatch = useDispatch();
    // --- State for Profile Form ---
    const [profileData, setProfileData] = useState({ name: "", phone: "" });
    const [profileLoading, setProfileLoading] = useState(false);
    // For success/error messages
    const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

    // --- State for Password Form ---
    const [passwordData, setPasswordData] = useState({ old_password: "", password: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    // For success/error messages
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

    // 1. Fetch existing user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance2.get("/user/me");
                const user = response.data.data;
                setProfileData({
                    name: user.name || "",
                    phone: user.phone || "",
                });
            } catch (error) {
                console.error("❌ Error fetching user data:", error);
                setProfileMessage({ type: "error", text: "Could not load user data." });
            }
        };

        fetchUserData();
    }, []);

    // 2. Handle simple input changes for both forms
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Handle Profile Update Submission
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: "", text: "" }); // Clear previous message

        // Start the promise chain
        axiosInstance2
            .patch("/user/update", {
                name: profileData.name,
                phone: profileData.phone,
            })
            .then((response) => {
                // --- Success Handling (replaces 'try' block) ---
                console.log("✅ Profile updated:", response.data);
                dispatch(setReload());

                // Note: Corrected 'data.msg' to 'response.data.msg'
                const successMsg = response.data.msg || "Profile updated successfully!";
                toast.success(successMsg);

                setProfileMessage({ type: "success", text: "Profile updated successfully!" });
            })
            .catch((error) => {
                // --- Error Handling (replaces 'catch' block) ---
                const errorMsg = error.response?.data?.msg || "Error updating profile. Please try again.";
                toast.error(errorMsg);

                setProfileMessage({ type: "error", text: "Error updating profile. Please try again." });
            })
            .finally(() => {
                // --- Cleanup (replaces 'finally' block) ---
                setProfileLoading(false);
            });
    };

    // 4. Handle Password Change Submission
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage({ type: "", text: "" }); // Clear previous message

        // Basic validation
        if (!passwordData.old_password || !passwordData.password) {
            setPasswordMessage({ type: "error", text: "Please fill in both fields." });
            setPasswordLoading(false);
            return;
        }

        // Start the promise chain
        axiosInstance2
            .patch("/user/update", {
                old_password: passwordData.old_password,
                password: passwordData.password,
            })
            .then((response) => {
                // --- Success Handling (from 'try' block) ---
                console.log("✅ Password updated:", response.data);
                setPasswordMessage({ type: "success", text: "Password changed successfully!" });
                setPasswordData({ old_password: "", password: "" }); // Clear form on success

                // Note: Corrected 'data.msg' to 'response.data.msg'
                const successMsg = response.data.msg || "Password changed successfully!";
                toast.success(successMsg);
            })
            .catch((error) => {
                // --- Error Handling (from 'catch' block) ---
                //  console.error("❌ Error updating password:", error);
                const errorText = error.response?.data?.msg || "Error changing password.";
                //  setPasswordMessage({ type: "error", text: errorText });
                toast.error(errorText);
            })
            .finally(() => {
                // --- Cleanup (from 'finally' block) ---
                setPasswordLoading(false);
            });
    };

    // Helper to display messages
    const Message = ({ message }) => {
        if (!message.text) return null;
        const messageClass = message.type === "success" ? styles.successMessage : styles.errorMessage;
        return <p className={messageClass}>{message.text}</p>;
    };

    return (
        // Using the same main wrapper class as your Skills component
        <div className={styles.Skills}>
            {/* --- Profile Update Form --- */}
            <form onSubmit={handleProfileSubmit} className={styles.updateForm}>
                <h2 className={styles.title}>Update Profile {profileLoading && <span className={styles.loading}>⏳</span>}</h2>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                        className={styles.input} // Reusing your input style
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                        className={styles.input} // Reusing your input style
                    />
                </div>

                {/* <Message message={profileMessage} /> */}

                <button type="submit" className={styles.saveButton} disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Profile"}
                </button>
            </form>

            {/* --- Password Change Form --- */}
            <form onSubmit={handlePasswordSubmit} className={styles.updateForm}>
                <h2 className={styles.title}>Change Password {passwordLoading && <span className={styles.loading}>⏳</span>}</h2>

                <div className={styles.formGroup}>
                    <label htmlFor="old_password">Old Password</label>
                    <input
                        type="password"
                        id="old_password"
                        name="old_password"
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your old password"
                        className={styles.input} // Reusing your input style
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className={styles.input} // Reusing your input style
                    />
                </div>

                {/* <Message message={passwordMessage} /> */}

                <button type="submit" className={styles.saveButton} disabled={passwordLoading}>
                    {passwordLoading ? "Saving..." : "Change Password"}
                </button>
            </form>
        </div>
    );
}
