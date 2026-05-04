import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import axios from "../../../components/Hooks/axios";
import styles from "./EditAdminPopup.module.scss";
import { setReload } from "../../../redux/slices/popupSlice";

// Props destructuring fixed
const EditAdminPopup = ({ editData , setIsEditMode}) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    // We only need password in state, other data comes from editData prop
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        // Validation
        if (!password) {
            toast.warn("Please enter a new password to update.");
            return;
        }

        try {
            setIsLoading(true);

            // Construct payload based on requirements
            const payload = {
                admin_id: editData?.id || editData?._id, // Ensure we get the ID correctly
                password: password,
            };

            // Use the Super Admin update endpoint
            axios
                .patch(`/admin/update`, payload)
                .then(({ data }) => {
                    toast.success(data.msg || "Admin password updated successfully!");
                    dispatch(setReload());
                    setIsEditMode(false);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error(error.response?.data?.msg || "Failed to update admin.");
                });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Failed to update admin.");
        } finally {
            setIsLoading(false);
        }
    };

    // Close handler
    const handleClose = () => {
        setIsEditMode(false);
    };

    return (
        <div className={styles.Container} onClick={handleClose}>
            <div
                className={styles.Box}
                onClick={(e) => e.stopPropagation()}
                style={{ height: "auto", maxHeight: "90vh" }} // Adjust height
            >
                <h2>Edit Admin</h2>
                <button className={styles.BackButton} onClick={handleClose}>
                    Back
                </button>

                <div className={styles.TopSection}>
                    <div className={styles.Col1}>
                        {/* Display Read-Only Info for Context */}
                        <div className={styles.Input}>
                            <label>Name (Read-only)</label>
                            <input type="text" value={editData?.name || ""} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                        </div>

                        <div className={styles.Input}>
                            <label>Email (Read-only)</label>
                            <input type="text" value={editData?.email || ""} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                        </div>

                        {/* Editable Password Field */}
                        <div className={styles.Input}>
                            <label htmlFor="password">New Password</label>
                            <input
                                type="text"
                                placeholder="Enter new password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button onClick={handleSubmit} disabled={isLoading} style={{ marginTop: "1rem" }}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAdminPopup;
