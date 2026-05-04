import React, { useState, useEffect } from "react";
import styles from "./history.module.scss";
import { axiosInstance2 } from "../axios/axiosInstance2";
import { toast } from "react-toastify";

export default function HistoryPopup({ isOpen, onClose, id }) {
    const [interview, setInterview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch history data when popup opens
    useEffect(() => {
        if (isOpen) {
            fetchHistoryData();
        }
    }, [isOpen]);

    const fetchHistoryData = () => {
        setIsLoading(true);

        axiosInstance2
            .get(`/mockInterview/${id}`)
            .then((response) => {
                const data = response.data && response.data.data ? response.data.data : null;
                setInterview(data);
            })
            .catch((error) => {
                console.error("Error fetching history:", error);
                toast.error("Failed to load interview history");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, ".");
    };

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
                        <h2>Interview Details</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : !interview ? (
                        <div className={styles.noData}>No interview history found</div>
                    ) : (
                        <div className={styles.content}>
                            <div className={styles.infoGrid}>
                                <div className={styles.leftCol}>
                                    <h3 className={styles.interviewTitle}>{interview.title || "-"}</h3>
                                    <div className={styles.metaRow}>
                                        <span className={styles.label}>Interview ID:</span>
                                        <span className={styles.value}>{interview.int_id || interview.id || "-"}</span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <span className={styles.label}>Created:</span>
                                        <span className={styles.value}>
                                            {interview.created_at ? formatDate(interview.created_at) : "-"}
                                        </span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <span className={styles.label}>Status:</span>
                                        <span className={styles.value}>{interview.status ? interview.status : "-"}</span>
                                    </div>
                                    <div className={styles.badges}>
                                        <span className={styles.badge}>Score: {interview.score ?? "-"}</span>
                                        <span className={styles.badge}>Credits: {interview.credit_used ?? "-"}</span>
                                        <span className={styles.badge}>
                                            Questions: {interview.num_questions ?? interview.history?.length ?? 0}
                                        </span>
                                    </div>

                                    <div className={styles.skills}>
                                        {(interview.skills || []).map((s, i) => (
                                            <span key={i} className={styles.skill}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.rightCol}>
                                    <div className={styles.resumeSection}>
                                        <div className={styles.resumeHeader}>Resume</div>
                                        {interview.resume ? (
                                            <>
                                                {interview.resume.summary && (
                                                    <p className={styles.resumeSummary}>{interview.resume.summary}</p>
                                                )}
                                                {interview.resume.file && (
                                                    <a
                                                        className={styles.actionBtn}
                                                        href={interview.resume.file}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View Resume
                                                    </a>
                                                )}
                                            </>
                                        ) : (
                                            <p className={styles.smallMuted}>No resume available</p>
                                        )}
                                    </div>

                                    <div className={styles.linkRow}>
                                        {interview.link &&
                                            (interview.status === "scheduled" ? (
                                                <a
                                                    className={styles.actionBtn}
                                                    href={`${interview.link}&type=mock`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Join Link
                                                </a>
                                            ) : (
                                                <span className={`${styles.actionBtn} ${styles.disabledBtn}`}>Join Link</span>
                                            ))}
                                        <div className={styles.smallMuted}>Room: {interview.room_id || "-"}</div>
                                    </div>

                                    <div className={styles.technicalMeta}>
                                        <div>
                                            <strong>Agent Voice:</strong> {interview.agent_voice || "-"}
                                        </div>
                                        <div>
                                            <strong>User:</strong> {interview.user || "-"}
                                        </div>
                                        <div>
                                            <strong>Topic Covered:</strong> {interview.topic_covered ?? 0}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.qaSection}>
                                <h4>Conversation</h4>
                                {interview.history && interview.history.length > 0 ? (
                                    <div className={styles.qaList}>
                                        {interview.history.map((h, idx) => (
                                            <div key={idx} className={styles.qaItem}>
                                                <div className={styles.question}>
                                                    <strong>Agent : </strong> {h.question}
                                                </div>
                                                <div className={styles.answer}>
                                                    <strong>You : </strong> {h.answer}
                                                </div>
                                                <div className={styles.qaMeta}>Score: {`${h.score}/5` ?? "-"}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.smallMuted}>No Q&A available</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
