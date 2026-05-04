import React, { useState, useEffect, use } from "react";
import styles from "./AddResume.module.scss";
import { axiosInstance2 } from "../../Components/axios/axiosInstance2";
import { toast } from "react-toastify";
import InterviewPopup from "../../Components/Schedule_Interview/interviewpopup";
import HistoryPopup from "../../Components/interview_history/history";
import PaymentButton from "../../Components/Payment/PaymentButton";
import { useDispatch, useSelector } from "react-redux";
import { setActivePopup, setReload } from "../../Redux/Slices/PopupSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";

export default function AddResume() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { reload } = useSelector((state) => state.popup);
    const [resumes, setResumes] = useState([]);
    const [showSummary, setShowSummary] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [selectedInterviewId, setSelectedInterviewId] = useState(null);

    // 🆕 Toggle between Resume and Interview views
    const [showResumes, setShowResumes] = useState(true);
    const [showInterviews, setShowInterviews] = useState(false);

    // 🆕 Dashboard Summary State
    const [dashboardSummary, setDashboardSummary] = useState({
        average_score: 0,
        last_interview_date: "",
        most_used_agent_voice: "",
        remaining_balance_usd: 0,
        total_interviews: 0,
        total_invested_usd: 0,
        total_resumes_uploaded: 0,
        user_name: "",
    });

    // 🟢 Fetch data on component mount
    useEffect(() => {
        fetchResumes();
        fetchInterviews();
        fetchDashboardSummary();
    }, [reload]);

    // 🆕 Fetch Dashboard Summary
    const fetchDashboardSummary = () => {
        axiosInstance2
            .get("/user/dashboard/summary")
            .then((res) => {
                console.log("Dashboard summary fetched:", res.data);
                const summaryData = res.data?.data || {};
                setDashboardSummary(summaryData);
            })
            .catch((err) => {
                console.error("Fetch Dashboard Summary Error:", err);
                toast.error("Failed to fetch dashboard summary.");
            });
    };

    // 🆕 Fetch existing resumes
    const fetchResumes = () => {
        setIsLoading(true);

        axiosInstance2
            .get("/user/dashboard/resumes")
            .then((res) => {
                console.log("Resumes fetched:", res.data);
                const resumesData = res.data?.data?.resumes || [];

                // Map the API response to your resume state structure
                const formattedResumes = Array.isArray(resumesData)
                    ? resumesData.map((resume) => ({
                          id: resume.resume_id,
                          filename: extractFilenameFromUrl(resume.file) || "Resume",
                          summary: resume.summary || "No summary provided.",
                          fileUrl: resume.file || "",
                      }))
                    : [];

                setResumes(formattedResumes);
            })
            .catch((err) => {
                console.error("Fetch Resumes Error:", err);
                toast.error("Failed to fetch resumes.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if(showResumes)
        fetchResumes();
    }, [showResumes]);

    // 🆕 Helper function to extract filename from Google Drive URL
    const extractFilenameFromUrl = (url) => {
        if (!url) return "Resume";

        // Extract file ID from Google Drive URL
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `Resume_${match[1].substring(0, 8)}.pdf`;
        }

        return "Resume.pdf";
    };

    // 🟢 Fetch all interviews
    const fetchInterviews = () => {
        setIsLoading(true);

        axiosInstance2
            .get("/mockInterview/list")
            .then((res) => {
                console.log("Interviews fetched:", res.data);
                const interviewsData = res.data?.data?.items || [];
                setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
            })
            .catch((err) => {
                console.error("Fetch Interviews Error:", err);
                toast.error("Failed to fetch interviews.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if(showInterviews)
        fetchInterviews();
    }, [showInterviews]);


    const [selectedFile, setSelectedFile] = useState(null);

    // 🟢 Upload Resume (API call using chain method)
    const handleFileUpload = () => {
        // e.preventDefault();
        const file = selectedFile;
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file);

        setIsUploading(true);

        axiosInstance2
            .post("/user/add_resume", formData
            , 
                {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )
            .then((res) => {
                toast.success("Resume uploaded successfully!");
                console.log("Response:", res.data);
                dispatch(setReload());

                // 🆕 Refresh both resumes and dashboard summary after upload
                fetchResumes();
                fetchDashboardSummary();
            })
            .catch((err) => {
                console.error("Upload Error:", err);
                toast.error(err.response?.data?.msg || "Failed to upload resume.");
            })
            .finally(() => setIsUploading(false));
    };

    const handleFileSelection = (e)=>{
            e.preventDefault();
             const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
            }

    }

    // 🔴 Delete Resume
    const handleDelete = (id) => {
        // if (!window.confirm("Are you sure you want to delete this resume?")) {
        //   return;
        // }

        console.log("Attempting to delete resume with ID:", id);
        setIsLoading(true);

        axiosInstance2
            .delete(`/user/delete_resume?resume_id=${id}`)
            .then((res) => {
                console.log("Delete success:", res.data);
                toast.info(res.data?.msg || "Resume deleted successfully!");

                // 🆕 Refresh both resumes and dashboard summary after delete
                fetchResumes();
                fetchDashboardSummary();
            })
            .catch((err) => {
                console.error("Delete Error:", err.response?.data || err.message);
                console.error("Full error:", err);
                toast.error(err.response?.data?.msg || "Failed to delete resume.");
            })
            .finally(() => setIsLoading(false));
    };

    // 🟢 Toggle Summary
    const toggleSummary = (id) => {
        setShowSummary((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // 🆕 Toggle Functions for View Switching
    const handleShowResumes = () => {
        setShowResumes(true);
        setShowInterviews(false);
    };

    const handleShowInterviews = () => {
        setShowResumes(false);
        setShowInterviews(true);
    };

    // ✅ Open Interview Popup
    const handleScheduleInterview = () => {
        if (resumes.length === 0) {
            toast.warning("Please upload at least one resume first!");
            return;
        }
        setIsPopupOpen(true);
    };

    // ✅ Close Interview Popup
    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    // ✅ Open History Popup
    const handleOpenHistory = () => {
        setIsHistoryOpen(true);
    };

    // ✅ Close History Popup
    const handleCloseHistory = () => {
        setIsHistoryOpen(false);
    };

    // 🆕 Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                {/* Header Section */}
                <div className={styles.header}>
                    {/* Upload Resume Card */}
                    <div className={styles.actionCard}>
                        <div className={styles.iconWrapper}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <h2>Upload Resume</h2>
                        <label htmlFor="resumeUpload" className={styles.uploadLabel}>
                            {isUploading ? "Uploading..." : "Choose File"}
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelection}
                            className={styles.fileInput}
                            id="resumeUpload"
                            disabled={isUploading}
                        />

                {selectedFile && (
                    <p>Selected File: {selectedFile.name}</p>
                )}
                    </div>
                   

                    {/* Schedule Interview */}
                    <div className={styles.actionCard} onClick={handleScheduleInterview} style={{ cursor: "pointer" }}>
                        <div className={styles.iconWrapper}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h2>Schedule Interview</h2>
                    </div>

                    {/* History */}
                    {/* <div className={styles.actionCard} onClick={handleOpenHistory} style={{ cursor: "pointer" }}>
                    <div className={styles.iconWrapper}>
                        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2>History</h2>
                </div> */}
                    <div
                        className={styles.actionCard}
                        onClick={() => dispatch(setActivePopup("buy-credits"))}
                        style={{ cursor: "pointer" }}
                    >
                        <button>Buy Credit</button>
                    </div>


                    

                </div>

                <div className={styles.uploadFileButton}>

                 {selectedFile && (
    <button onClick={handleFileUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Resume"}
    </button>
)}
                </div>


                {/* 🆕 Stats Bar - Now with Dynamic Data */}
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Avg Score</div>
                        <div className={styles.statValue}>{dashboardSummary.average_score.toFixed(1)}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Last Interview</div>
                        <div className={styles.statValue}>{formatDate(dashboardSummary.last_interview_date)}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Agent Voice</div>
                        <div className={styles.statValue}>{dashboardSummary.most_used_agent_voice || "N/A"}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Balance</div>
                        <div className={styles.statValue}>${dashboardSummary.remaining_balance_usd.toFixed(2)}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Total Interviews</div>
                        <div className={styles.statValue}>{dashboardSummary.total_interviews}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Invested</div>
                        <div className={styles.statValue}>${dashboardSummary.total_invested_usd.toFixed(2)}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Resumes</div>
                        <div className={styles.statValue}>{dashboardSummary.total_resumes_uploaded}</div>
                    </div>
                </div>

                {/* 🆕 Toggle Buttons for Resume/Interview View */}
                {/* 🆕 Simplified Toggle Buttons for Resume/Interview View */}
                <div className={styles.toggleContainer}>
                    <button className={`${styles.toggleBtn} ${showResumes ? styles.activeToggle : ""}`} onClick={handleShowResumes}>
                        Show Resumes ({resumes.length})
                    </button>

                    <button className={`${styles.toggleBtn} ${showInterviews ? styles.activeToggle : ""}`} onClick={handleShowInterviews}>
                        Interview Overview ({interviews.length})
                    </button>
                </div>

                {/* 🆕 Conditional Rendering: Resume List */}
                {showResumes && (
                    <div className={styles.resumeList}>
                        {resumes.length === 0 ? (
                            <p>No resumes uploaded yet.</p>
                        ) : (
                            resumes.map((resume, index) => {
                                const isExpanded = showSummary[resume.id];
                                const shortText =
                                    resume.summary.length > 200 ? resume.summary.substring(0, 200).trim() + "..." : resume.summary;

                                return (
                                    <div key={resume.id} className={styles.resumeItem}>
                                        <div className={styles.resumeHeader}>
                                            <span className={styles.resumeNumber}>{index + 1}.</span>
                                            <div className={styles.resumeInfo}>
                                                <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                    />
                                                </svg>
                                                <span className={styles.filename}>{resume.filename}</span>
                                                {resume.fileUrl && (
                                                    <a
                                                        href={resume.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.viewLink}
                                                        title="View Resume"
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            style={{ width: "18px", height: "18px", marginLeft: "8px" }}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(resume.id)}
                                                aria-label="Delete resume"
                                                disabled={isLoading}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className={styles.summarySection}>
                                            <span className={styles.summaryLabel}>Summary:</span>
                                            <span className={styles.summaryText}>{isExpanded ? resume.summary : shortText}</span>
                                            {resume.summary.length > 200 && (
                                                <button
                                                    type="button"
                                                    className={styles.readMoreBtn}
                                                    onClick={() => toggleSummary(resume.id)}
                                                >
                                                    Read {isExpanded ? "less" : "more"}...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* 🆕 Conditional Rendering: Interview Table */}
                {showInterviews && (
                    <div className={styles.tableContainer}>
                        <h3 className={styles.tableTitle}>Interview Overview</h3>
                        <div className={styles.tableWrapper}>
                            <table className={styles.resumeTable}>
                                <thead>
                                    <tr>
                                        <th>S No.</th>
                                        <th>Interview ID</th>
                                        <th>Title</th>
                                        {/* <th>Skills</th> */}
                                        <th>Link</th>
                                        <th>Questions</th>
                                        <th>Resume Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className={styles.emptyMessage}>
                                                No interviews scheduled yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        interviews.map((interview, index) => (
                                            <tr
                                                key={interview.id}
                                                onClick={() => {
                                                    setSelectedInterviewId(interview.id);
                                                    setIsHistoryOpen(true);
                                                }}
                                            >
                                                <td>{index + 1}</td>
                                                <td>{interview.int_id || "N/A"}</td>
                                                <td>{interview.title || "N/A"}</td>
                                                {/* <td>
                                                    <div className={styles.skillsList}>
                                                        {interview.skills && interview.skills.length > 0
                                                            ? interview.skills.join(", ")
                                                            : "N/A"}
                                                    </div>
                                                </td> */}
                                                <td
                                                    className={styles.interviewLink}
                                                    // onClick={() => navigate(`/join?interviewId=${interview.id}&type=mock`)}
                                                >
                                                    <a 
                                                        href={`${window.location.origin}/join?interviewId=${interview.id}&type=mock`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"  
                                                    >
                                                        Interview Link
                                                    </a>
                                                </td>
                                                <td>{interview.num_questions || 0}</td>
                                                <td>
                                                    {interview.resume?.file ? (
                                                        <a
                                                            href={interview.resume.file}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.resumeLink}
                                                        >
                                                            View Resume
                                                        </a>
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Interview Popup */}
            {isPopupOpen &&<InterviewPopup isOpen={isPopupOpen} onClose={handleClosePopup} resumes={resumes} />}

            {/* History Popup */}
            <HistoryPopup isOpen={isHistoryOpen} onClose={handleCloseHistory} id={selectedInterviewId} />
        </div>
    );
}
