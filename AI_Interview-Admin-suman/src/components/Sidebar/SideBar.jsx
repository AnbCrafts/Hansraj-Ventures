import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AssignedJobs from "../../assets/icons/AssignedJobs.svg?react";
import Dashboard from "../../assets/icons/Dashboard.svg?react";
import Group from "../../assets/icons/Group.svg?react";
import Interview from "../../assets/icons/Interview.svg?react";
import InterviewHistory from "../../assets/icons/InterviewHistory.svg?react";
import JobsTarget from "../../assets/icons/JobsTarget.svg?react";
import Logout from "../../assets/icons/Logout.svg?react";
import Request from "../../assets/icons/Requests.svg?react";
import Hexagonal from "../../assets/icons/Hexagonal.svg?react";
import Trash from "../../assets/icons/TrashCanIcon.svg?react";
import DownArrow from "../../assets/svg/DownArrow.svg?react";
import Logo from "../../assets/svg/HR Logo.svg?react";
import Profile from "../../assets/svg/Profile.svg?react";
import Setting from "../../assets/svg/setting.svg?react";
import { removeActiveUser } from "../../redux/slices/authSlice";
import styles from "./Sidebar.module.scss";
import brandLogo from "../../assets/images/logo.png";

const SideBar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isInterviewHistoryOpen, setIsInterviewHistoryOpen] = useState(false);

    useEffect(() => {
        if (pathname === "/interviews-history") setIsInterviewHistoryOpen(true);
    }, [pathname]);

    const handelLogout = () => {
        dispatch(removeActiveUser());
        navigate("/", { replace: true });
    };

    return (
        <div className={styles.Sidebar}>
            <div className={styles.Logo}>
                <img src={brandLogo} alt="logo" />
            </div>

            <div className={styles.Links}>
                <div
                    className={`${styles.LinkWrapper} ${pathname === "/dashboard" ? styles.active : ""}`}
                    onClick={() => navigate("/dashboard")}
                >
                    <Dashboard />
                    <p>Dashboard</p>
                </div>

                <div
                    className={`${styles.LinkWrapper} ${pathname === "/manage-candidate" ? styles.active : ""}`}
                    onClick={() => navigate("/manage-candidate")}
                >
                    <Group />
                    <p>Candidates</p>
                </div>
                <div
                    className={`${styles.LinkWrapper} ${pathname === "/interviews-history" ? styles.active : ""} ${
                        isInterviewHistoryOpen ? "" : styles.ih
                    }`}
                    onClick={() => navigate("/interviews-history")}
                >
                    <InterviewHistory />
                    <p>Interviews History</p>
                </div>

                <div
                    className={`${styles.LinkWrapper} ${pathname === "/scheduled-interviews" ? styles.active : ""}`}
                    onClick={() => navigate("/scheduled-interviews")}
                >
                    <Interview />
                    <p>All Interviews</p>
                </div>
                <div className={`${styles.LinkWrapper} ${pathname === "/resume" ? styles.active : ""}`} onClick={() => navigate("/resume")}>
                    <JobsTarget />
                    <p>Resume</p>
                </div>
                <div
                    className={`${styles.LinkWrapper} ${pathname === "/training" ? styles.active : ""}`}
                    onClick={() => navigate("/training")}
                >
                    {/* <Request /> */}
                    <Hexagonal />
                    <p>Training</p>
                </div>
                <div
                    className={`${styles.LinkWrapper} ${pathname === "/profile" ? styles.active : ""}`}
                    onClick={() => navigate("/profile")}
                >
                    {/* <Request /> */}
                    <Profile />
                    <p>Profile</p>
                </div>
                <div className={`${styles.LinkWrapper} ${pathname === "/trash" ? styles.active : ""}`} onClick={() => navigate("/trash")}>
                    {/* <Request /> */}
                    <Trash />
                    <p>Trash</p>
                </div>

                <div
                    className={`${styles.LinkWrapper} ${pathname === "/setting" ? styles.active : ""}`}
                    onClick={() => navigate("/setting")}
                >
                    {/* <Request /> */}
                    <Setting />
                    <p>Setting</p>
                </div>

                <div className={styles.LinkWrapper} onClick={handelLogout}>
                    <Logout />
                    <p>Log out</p>
                </div>
            </div>
            {/* <div
				className={`${styles.LinkWrapper} ${pathname === "/resources" ? styles.active : ""}`}
				onClick={() => navigate("/resources")}>
				<Group />
				<p>Resources</p>
			</div> */}

            {/* <div
				className={`${styles.LinkWrapper} ${
					pathname === "/assigned-jobs" || pathname === "/assigned-job-details" ? styles.active : ""
				}`}
				onClick={() => navigate("/assigned-jobs")}>
				<AssignedJobs />
				<p>Assigned Jobs</p>
			</div> */}

            {/* <div
				className={`${styles.LinkWrapper} ${pathname === "/interviews" ? styles.active : ""}`}
				onClick={() => navigate("/interviews")}>
				<Interview />
				<p>Interviews</p>

				<span
					className={isInterviewHistoryOpen ? styles.Active : ""}
					onClick={(e) => {
						e.stopPropagation();
						setIsInterviewHistoryOpen(!isInterviewHistoryOpen);
					}}>
					<DownArrow />
				</span>
			</div> */}

            {/* <div
				className={`${styles.LinkWrapper} ${pathname === "/jobs-target" ? styles.active : ""}`}
				onClick={() => navigate("/jobs-target")}>
				<JobsTarget />
				<p>Jobs Target</p>
			</div> */}
        </div>
    );
};

export default SideBar;
