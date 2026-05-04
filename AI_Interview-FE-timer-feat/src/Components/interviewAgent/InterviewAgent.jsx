import React, { useState, useEffect } from "react";
import styles from "./InterviewAgent.module.scss";
import { axiosInstance2 } from "../axios/axiosInstance2";
import { toast } from "react-toastify";

export default function InterviewAgent({ isOpen, onClose, id }) {
    const [interview, setInterview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch history data when popup opens
    // useEffect(() => {
    //     if (isOpen) {
    //         fetchHistoryData();
    //     }
    // }, [isOpen]);

    // const fetchHistoryData = () => {
    //     setIsLoading(true);

    //     axiosInstance2
    //         .get(`/mockInterview/${id}`)
    //         .then((response) => {
    //             const data = response.data && response.data.data ? response.data.data : null;
    //             setInterview(data);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching history:", error);
    //             toast.error("Failed to load interview history");
    //         })
    //         .finally(() => {
    //             setIsLoading(false);
    //         });
    // };

    // Helper function to format date

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <svg className={styles.historyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2>Agent Status</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
