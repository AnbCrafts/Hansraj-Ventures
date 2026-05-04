import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Filter from "../../assets/svg/Filter.svg?react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import ThreeDot from "../../assets/svg/ThreeDot.svg?react";
import { formatDate } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setCandidatePopup, setCompany, setJobSeeker } from "../../redux/slices/popupSlice";
import styles from "./RecentInterviews.module.scss";

const RecentInterviews = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [usersData, setUsersData] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        axios
            .get(`/superAdmin/dashboard/recent-interviews`)
            .then(({ data }) => {
                console.log(data);
                setUsersData(data.data);
                setLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, []);

    return (
        <div className={styles.ManageUsers}>
            {/* <div className={styles.Top}>
                <div className={styles.Buttons}>
                    <button
                        className={active === "" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("");
                        }}
                    >
                        No Interview
                    </button>
                    <button
                        className={active === "scheduled" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("scheduled");
                        }}
                    >
                        Scheduled Interview
                    </button>

                    <button
                        className={active === "completed" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("completed");
                        }}
                    >
                        Completed Interview
                    </button>

                    <button
                        className={active === "cancelled" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("cancelled");
                        }}
                    >
                        Cancelled Interview
                    </button>
                </div>

                <div className={styles.Filters}>
                    <p>Filter</p>
                    <Filter />
                </div>
            </div> */}

            <div className={styles.Bottom}>
                <div className={styles.subHeading}>
                    <p>S no</p>
                    <p>Candidate Name</p>
                    <p>ID</p>
                    <p>Title</p>
                    <p>Created On</p>
                    <p>Agent Voice</p>
                    <p>Score</p>
                    <p>Admin</p>
                    <p>Selected</p>
                    {/* <p>Profile complete</p> */}
                    {/* <p>More</p> */}
                </div>

                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.UserCards}>
                        {usersData?.length === 0 ? (
                            <h1>No Candidates</h1>
                        ) : (
                            usersData.map((data, index) => {
                                return (
                                    <div
                                        className={styles.Card}
                                        key={index}
                                        //onClick={() => dispatch(setJobSeeker({ isActive: true, activeData: data }))}
                                    >
                                        <div>{index + 1}</div>
                                        <div className={styles.Profile}>
                                            {/* <img src={data.profileImage} alt="" /> */}
                                            <p>{data?.candidate_name ? data?.candidate_name : "No Name"}</p>
                                        </div>
                                        <div>{data?.int_id ? data?.int_id : "No ID"}</div>
                                        <div>{data?.title ? data?.title : "No Title"}</div>
                                        <div>{new Date(data?.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata", // Converts from UTC to IST
                                                dateStyle: "medium", // "31 Oct 2025"
                                                timeStyle: "short", // "11:38 am"
                                            })}</div>
                                        <div>{data?.agent_voice ? data?.agent_voice : "No Data"}</div>
                                        <div>{data?.score !== null ? (data?.score >= 0 ? data?.score : "No Score") : "No Score"}</div>
                                        <div>{data?.admin ? data?.admin : "No Data"}</div>
                                        <div>{data?.selected ? "Yes" : "No"}</div>
                                        {/* <div>{data?.profileComplete}</div> */}
                                        {/* <div
                                            className={styles.More}
                                            onClick={(e) => {
                                                e.stopPropagation;

                                                // if (data.userType === "jobSeeker") {
                                                //     console.log(data);
                                                //     dispatch(setJobSeeker({ isActive: true, activeData: data }));
                                                // } else {
                                                //     dispatch(setCompany({ isActive: true, activeData: data }));
                                                // }
                                            }}
                                        >
                                            <span>
                                                <ThreeDot />
                                            </span>
                                        </div> */}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* <div className={styles.pagination}>
                <div className={styles.records}>Showing 1 to 100 users in {totalPage} page</div>

                <div className={styles.pageButtons}>
                    <button className={styles.leftArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        <LeftArrow />
                    </button>

                    <div className={styles.pages}>
                        {Array(totalPage)
                            .fill("")
                            .slice(0, 5)
                            .map((data, index) => {
                                return (
                                    <div className={`${styles.buttons} ${currentPage === index + 1 ? styles.active : ""}`} key={index}>
                                        0{index + 1}
                                    </div>
                                );
                            })}
                    </div>

                    <button
                        className={styles.rightArrow}
                        disabled={currentPage === totalPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        <RightArrow />
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default RecentInterviews;
