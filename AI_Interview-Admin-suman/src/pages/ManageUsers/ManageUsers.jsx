import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Filter from "../../assets/svg/Filter.svg?react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import ThreeDot from "../../assets/svg/ThreeDot.svg?react";
// import { formatDate } from "../../components/Functions/dateFormate"; // Unused in this snippet
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setCandidatePopup, setJobSeeker } from "../../redux/slices/popupSlice";
import styles from "./ManageUsers.module.scss";
import { toast } from "react-toastify";

const ManageUsers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const optionsRef = useRef(null);

    const [active, setActive] = useState("jobSeeker");
    const [usersData, setUsersData] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [limit, setLimit] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0); // To store total count

    useEffect(() => {
        setLoading(true);

        axios
            .get(`/candidate/list?page=${currentPage}&limit=${limit}`)
            .then(({ data }) => {
                console.log(data);
                setTotalPage(data.data.pages);
                setCurrentPage(data.data.page);
                setUsersData(data.data.items);
                // Assuming the API returns total count. If not, remove setTotalRecords
                setTotalRecords(data.data.total || 0); 
                setLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
                setLoading(false);
            });
    }, [currentPage, active, limit, reload]); // Removed duplicate currentPage

    const handleDelete = (id) => {
        axios
            .delete(`/candidate/${id}`)
            .then(({ data }) => {
                toast.success(data.msg);
                setUsersData((prev) => prev.filter((user) => user.id !== id));
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    };

    // Close options when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
                setActiveIndex(null);
            }
        }
        if (showOptions) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showOptions]);

    // Helper to generate page numbers (Sliding Window Logic)
    const getPaginationGroup = () => {
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPage, start + 4);

        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        
        const pages = [];
        for (let i = start; i <= end; i++) {
            if(i > 0) pages.push(i);
        }
        return pages;
    };

    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}>
                    {/* ... (Previous buttons commented out in your code) ... */}
                    <button
                        className={styles.active}
                        onClick={() => {
                            dispatch(setCandidatePopup({ state: true, data: null }));
                        }}
                    >
                        Add Candidate
                    </button>
                </div>
            </div>

            <div className={styles.Bottom}>
                <div className={styles.subHeading}>
                    <p>S no</p>
                    <p>Candidate Name</p>
                    <p>ID</p>
                    <p>Email</p>
                    <p>Registered Date</p>
                    <p>Resume</p>
                    <p>Mobile Number</p>
                    <p>More</p>
                </div>

                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.UserCards}>
                        {usersData.length === 0 ? (
                            <h1>No Candidates</h1>
                        ) : (
                            usersData.map((data, index) => {
                                return (
                                    <div
                                        className={styles.Card}
                                        key={index}
                                        onClick={() => {
                                            dispatch(setJobSeeker({ isActive: true, activeData: data }));
                                        }}
                                    >
                                        <div>{limit * (currentPage - 1) + index + 1}</div>
                                        <div className={styles.Profile}>
                                            <p>{data?.name ? data?.name : "No Name"}</p>
                                        </div>
                                        <div>{data?.cand_id ? data?.cand_id : "No ID"}</div>
                                        <div>{data?.email ? data?.email : "No Email"}</div>
                                        <div>
                                            {new Date(data.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </div>
                                        <div>
                                            {data?.resume_url ? (
                                                <a href={data?.resume_url} target="_blank" rel="noopener noreferrer">
                                                    View Resume
                                                </a>
                                            ) : (
                                                "No Resume"
                                            )}
                                        </div>
                                        <div>{data?.phone ? data?.phone : "No Phone Number"}</div>
                                        <div
                                            className={styles.More}
                                            ref={activeIndex === index ? optionsRef : null}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowOptions(!showOptions);
                                                setActiveIndex(index);
                                            }}
                                        >
                                            <span>
                                                <ThreeDot />
                                            </span>
                                            <div
                                                className={styles.Options}
                                                style={{ display: showOptions && activeIndex === index ? "flex" : "none" }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        dispatch(setCandidatePopup({ state: true, data: data }));
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <hr style={{ width: "80%", border: "1px solid ", padding: 0, opacity: 0.5 }} />
                                                <button
                                                    onClick={() => {
                                                        handleDelete(data.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* --- PAGINATION SECTION --- */}
            <div className={styles.pagination}>
                <div className={styles.records}> 
                   {/* Shows current range vs total pages */}
                   Page {currentPage} of {totalPage} 
                </div>

                <div className={styles.pageButtons}>
                    {/* Previous Button */}
                    <button 
                        className={styles.leftArrow} 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        <LeftArrow />
                    </button>

                    <div className={styles.pages}>
                        {getPaginationGroup().map((item, index) => {
                            return (
                                <div 
                                    className={`${styles.buttons} ${currentPage === item ? styles.active : ""}`} 
                                    key={index}
                                    onClick={() => setCurrentPage(item)}
                                    style={{cursor: 'pointer'}} // Ensure it looks clickable
                                >
                                    {/* Format numbers < 10 with a leading zero */}
                                    {item < 10 ? `0${item}` : item}
                                </div>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                        className={styles.rightArrow}
                        disabled={currentPage === totalPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        <RightArrow />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;