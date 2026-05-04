import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./TopBar.module.scss";
import Avatar3 from "../../assets/images/Avatar3.png";

const TopBar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const { userData } = useSelector((s) => s.auth);

    return (
        <div className={styles.TopBar}>
            <div className={styles.LeftSection}>
                <h2>
                    {pathname === "/dashboard" && "Dashboard"}
                    {pathname === "/manage-admin" && "Manage Admins"}
                    {(pathname === "/assigned-jobs" || pathname === "/assigned-job-details") && "Assigned Jobs"}
                    {pathname === "/interviews" && "Interviews"}
                    {pathname === "/interviews-history" && "Interviews History"}
                    {pathname === "/recent-interviews" && "Recent Interviews"}
                    {pathname === "/jobs-target" && "Jobs Target"}
                    {pathname === "/skills" && "Skill Sets By Admin"}
                    {pathname === "/resume" && "Resume"}
                    {pathname === "/profile" && "Admin Details"}
                    {pathname === "/sills" && "Skills"}
                    {pathname === "/trash" && "Deleted Admins"}
                    {pathname === "/setting" && "Settings"}
                    {pathname === "/users" && "User Overview"}
                    {pathname === "/payments" && "Payments"}
                </h2>
                <h3>{pathname === "/dashboard" && "Welcome to Interview AI SuperAdmin"}</h3>
            </div>

            <div className={styles.RightSection}>
                {/* <div className={styles.SearchWrapper}>
					<input type="search" />

					<Search />
				</div> */}

                <div className={styles.Profile} onClick={() => navigate("/profile")}>
                    <img src={userData?.profileImage || Avatar3} alt="profileImage" />

                    <div className={styles.Details}>
                        <h4>{userData?.username}</h4>

                        <h5>{userData?.role.toUpperCase()}</h5>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
