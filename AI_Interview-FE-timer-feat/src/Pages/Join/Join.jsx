import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../Components/axios/axiosInstance";
import Video from "../../Components/Video/Video";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";

const Join = () => {
    const params = useLocation();
    const searchParams = new URLSearchParams(params?.search);
 
    const [token, setToken] = useState(null);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const type = searchParams.get("type");
    // console.log("searchParams:", searchParams)
    // console.log("type:", type)

    const handleStart = () => {
        const raw = {
            interviewId: searchParams.get("interviewId"),
            // room: searchParams.get("roomId"),
        };
        setIsLoading(true);
        let url;
        if (type === "mock") {
            url = "/startMockAgent";
        } else {
            url = "/startAgent";
        }
        axiosInstance
            .post(url, raw)
            .then(({ data }) => {
                console.log(data);
                setToken(data.token);
                setTotalQuestions(data.num_questions);
                setIsStarted(true);
            })
            .catch((err) => {
                console.log(err.message);
                toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // useEffect(() => {
    //     const tokenFromParams = searchParams.get("token");
    //     if (tokenFromParams) {
    //         setToken(tokenFromParams);
    //     } else {
    //         console.error("Token not found in URL parameters");
    //     }
    // }, [searchParams]);

    const styles = {
        container: {
            height: "100vh",
            width: "100%",
            background: "var(--bg2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            fontFamily: "Arial, sans-serif",
        },
        card: {
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            padding: "32px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
        },
        iconContainer: {
            width: "64px",
            height: "64px",
            backgroundColor: "#00000",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
        },
        icon: {
            width: "32px",
            height: "32px",
            color: "white",
        },
        title: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "32px",
        },
        label: {
            fontSize: "18px",
            color: "#6b7280",
            marginBottom: "16px",
        },
        nameSection: {
            marginBottom: "24px",
        },
        nameLabel: {
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "8px",
        },
        nameDisplay: {
            fontSize: "20px",
            fontWeight: "600",
            color: "#4f46e5",
            backgroundColor: "#f8fafc",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
        },
        timeContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            // justifyContent: "center",
            backgroundColor: "#f3f4f6",
            border: `2px solid #4f46e5`,
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
        },
        timeText: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "#4f46e5",
        },
        startButton: {
            width: "100%",
            backgroundColor: "#4f46e5",
            color: "white",
            fontWeight: "600",
            fontSize: "16px",
            padding: "16px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: "scale(1)",
        },
        startButtonHover: {
            backgroundColor: "#3730a3",
            transform: "scale(1.02)",
        },
        startedContainer: {
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "500",
        },
        checkIcon: {
            width: "20px",
            height: "20px",
            marginRight: "8px",
        },
        startedText: {
            color: "#6b7280",
            marginTop: "16px",
            fontSize: "14px",
        },
        footer: {
            marginTop: "24px",
            fontSize: "12px",
            color: "#9ca3af",
        },
    };

    return (
        <div style={styles.container}>
            {isStarted ? (
                <Video token={token} totalQuestions={totalQuestions}/>
            ) : (
                <div style={styles.card}>
                    <div>
                        <div style={styles.iconContainer}>
                            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 style={styles.title}>Interview Schedule</h2>
                    </div>

                    {!isStarted ? (
                        <button
                            style={styles.startButton}
                            disabled={isLoading}
                            onClick={handleStart}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = styles.startButtonHover.backgroundColor;
                                e.target.style.transform = styles.startButtonHover.transform;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = styles.startButton.backgroundColor;
                                e.target.style.transform = styles.startButton.transform;
                            }}
                        >
                            {isLoading ? <BeatLoader color="#ffffff" /> : "Start Interview"}
                        </button>
                    ) : (
                        <div>
                            <div style={styles.startedContainer}>
                                <svg style={styles.checkIcon} fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Interview Started
                            </div>
                            <p style={styles.startedText}>Good luck with your interview!</p>
                        </div>
                    )}

                    <div style={styles.footer}>
                        <p>Please be ready 5 minutes before your scheduled time</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Join;
