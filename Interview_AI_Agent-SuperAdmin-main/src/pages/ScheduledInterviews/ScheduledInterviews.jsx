import React, { useState } from "react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import JobDetails from "./JobDetails/JobDetails";
import RequestDetails from "./RequestDetails/RequestDetails";
import RejectPopup from "./RejectPopup/RejectPopup";
import styles from "./ScheduledInterviews.module.scss";
import Tab1 from "./Tabs/Tab1";
import Tab2 from "./Tabs/Tab2";

const ScheduledInterviews = () => {
    const [activeSection, setActiveSection] = useState("scheduled"); //
    const [page, setPage] = useState(1);
    const [noData, setNoData] = useState(false);
    const [rejectPopup, setRejectPopup] = useState(false);
    const [activeData, setActiveData] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [jobDetailsPopup, setJobDetailsPopup] = useState(false);

    return (
        <div className={styles.ScheduledInterviews}>
            {rejectPopup && <RejectPopup {...{ setRejectPopup, activeData, activeSection,setJobDetailsPopup }} />}
            {isPopupOpen && <RequestDetails {...{ setIsPopupOpen, activeData, setJobDetailsPopup, setRejectPopup }} />}
            {jobDetailsPopup && <JobDetails {...{ setJobDetailsPopup, activeData }} />}

            <div className={styles.Content}>
                <div className={styles.Row1}>
                    <div className={styles.Left}>
                        <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("scheduled");
                            }}
                            className={activeSection === "scheduled" ? styles.active : ""}
                        >
                            Scheduled
                        </button>

                        <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("cancelled");
                            }}
                            className={activeSection === "cancelled" ? styles.active : ""}
                        >
                            Cancelled
                        </button>

                        <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("in_progress");
                            }}
                            className={activeSection === "in_progress" ? styles.active : ""}
                        >
                            In Progress
                        </button>

                        <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("completed");
                            }}
                            className={activeSection === "completed" ? styles.active : ""}
                        >
                            Completed
                        </button>

                        {/* <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("CompanyBlocked");
                            }}
                            className={activeSection === "CompanyBlocked" ? styles.active : ""}
                        >
                            Blocked Company
                        </button>

                        <button
                            onClick={() => {
                                setPage(1);
                                setNoData(false);
                                setActiveSection("blockedJob");
                            }}
                            className={activeSection === "blockedJob" ? styles.active : ""}
                        >
                            Blocked Job Post
                        </button> */}
                    </div>

                    {/* <div className={styles.Right}>
						<div className={styles.AllHR}>
							<div className={styles.Images}>
								<img id="img1" src={Dp}></img>
							</div>

							<div>
								<p>All HR's</p>
							</div>

							<DownArrow />
						</div>
					</div> */}
                </div>

                <div className={styles.Row2}>
                    <Tab1 {...{ activeSection, page, noData, setNoData, setRejectPopup,setJobDetailsPopup, setActiveData, setIsPopupOpen }} />

                    {/* {activeSection === "blockedJob" && <Tab2 {...{ activeSection, page, noData, setNoData }} />} */}
                </div>

                <div className={styles.Row3}>
                    <div className={styles.left}></div>

                    <div className={styles.right}>
                        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                            <LeftArrow />
                        </button>

                        <div>
                            <p onClick={() => setPage(1)} className={page === 1 ? styles.active : ""}>
                                01
                            </p>
                            {/* <p onClick={() => setPage(2)} className={page === 2 ? styles.active : ""}>
                                02
                            </p>
                            <p onClick={() => setPage(3)} className={page === 3 ? styles.active : ""}>
                                03
                            </p>
                            <p onClick={() => setPage(4)} className={page === 4 ? styles.active : ""}>
                                04
                            </p>
                            <p onClick={() => setPage(5)} className={page === 5 ? styles.active : ""}>
                                05
                            </p> */}
                        </div>

                        <button onClick={() => setPage(page + 1)} disabled={noData}>
                            <RightArrow />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduledInterviews;
