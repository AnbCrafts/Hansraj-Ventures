import React, { useEffect, useRef, useState } from "react";
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
import styles from "./ManageUsers.module.scss";
import { toast } from "react-toastify";
import EditAdminPopup from "./EditAdminPopup/EditAdminPopup";

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
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        setLoading(true);

        axios
            .get(`/superAdmin/admins?page=${currentPage}&limit=${limit}`)
            .then(({ data }) => {
                console.log(data);
                setTotalPage(data.data.pages);
                // setCurrentPage(data.data.page);
                setUsersData(data.data.admins);
                setLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, [active, currentPage, reload, limit]);

    const handleDelete = (id) => {
        axios
            .delete(`/superAdmin/${id}`)
            .then(({ data }) => {
                toast.success(data.msg);
                setUsersData((prev) => prev.filter((user) => user.id !== id));
                // If deleting the last item on a page, go back one page
                if (usersData.length === 1 && currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                } else {
                    // Optional: Trigger a reload instead of manual filter to ensure sync
                    setUsersData((prev) => prev.filter((user) => user.id !== id));
                }
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

    const getPageNumbers = () => {
        const maxButtons = 5;
        // Calculate start page to center current page
        let start = Math.max(currentPage - Math.floor(maxButtons / 2), 1);
        // Adjust end page
        let end = start + maxButtons - 1;

        // If end exceeds total, pull back start
        if (end > totalPage) {
            end = totalPage;
            start = Math.max(end - maxButtons + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <>
            {isEditMode && <EditAdminPopup isEditMode={isEditMode} setIsEditMode={setIsEditMode} editData={editData} />}
            <div className={styles.ManageUsers}>
                <div className={styles.Top}>
                    <div className={styles.Buttons}>
                        {/* <button
						className={active === "jobSeeker" ? styles.active : ""}
						onClick={() => {
							setCurrentPage(1);
							setActive("jobSeeker");
						}}>
						job seeker
					</button>

					<button
						className={active === "individualRecruiter" ? styles.active : ""}
						onClick={() => {
							setCurrentPage(1);
							setActive("individualRecruiter");
						}}>
						Individual Recruiter
					</button>

					<button
						className={active === "companyRecruiter" ? styles.active : ""}
						onClick={() => {
							setCurrentPage(1);
							setActive("companyRecruiter");
						}}>
						Company Recruiter
					</button> */}
                        <button
                            className={styles.active}
                            onClick={() => {
                                dispatch(setCandidatePopup({ state: true, data: null }));
                            }}
                        >
                            Add Admin
                        </button>
                    </div>

                    {/* <div className={styles.Filters}>
                    <p>Filter</p>
                    <Filter />
                </div> */}
                </div>

                <div className={styles.Bottom}>
                    <div className={styles.subHeading}>
                        <p>S no</p>
                        <p>Username</p>
                        {/* <p>ID</p> */}
                        <p>Email</p>
                        <p>Registered Date</p>
                        <p>Role</p>
                        {/* <p>Mobile Number</p> */}
                        {/* <p>Profile complete</p> */}
                        <p>More</p>
                    </div>

                    {loading ? (
                        <Loading height="10rem" width="10rem" />
                    ) : (
                        <div className={styles.UserCards}>
                            {usersData && usersData?.length === 0 ? (
                                <h1>No Candidates</h1>
                            ) : (
                                usersData?.map((data, index) => {
                                    return (
                                        <div
                                            className={styles.Card}
                                            key={index}
                                            onClick={() => {
                                                // dispatch(setJobSeeker({ isActive: true, activeData: data }));
                                            }}
                                        >
                                            <div>{currentPage * limit - limit + index + 1}</div>
                                            <div className={styles.Profile}>
                                                {/* <img src={data.profileImage} alt="" /> */}
                                                <p>{data?.name ? data?.name : "No Name"}</p>
                                            </div>
                                            {/* <div>{data?.cand_id ? data?.cand_id : "No ID"}</div> */}
                                            <div>{data?.email ? data?.email : "No Email"}</div>
                                            <div>
                                                {new Date(data.created_at + "Z").toLocaleString("en-IN", {
                                                    timeZone: "Asia/Kolkata", // Converts from UTC to IST
                                                    dateStyle: "medium", // "31 Oct 2025"
                                                    timeStyle: "short", // "11:38 am"
                                                })}
                                            </div>
                                            <div>{data?.role ? data?.role.charAt(0).toUpperCase() + data?.role.slice(1) : "No Role"}</div>
                                            {/* <div>{data?.phone ? data?.phone : "No Phone Number"}</div> */}
                                            {/* <div>{data?.profileComplete}</div> */}
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
                                                        setIsEditMode(true);
                                                        setEditData(data);
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

                <div className={styles.pagination}>
                    <div className={styles.records}> Showing {usersData?.length || 0} records </div>

                    <div className={styles.pageButtons}>
                        <button className={styles.leftArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            <LeftArrow />
                        </button>

                        <div className={styles.pages}>
                            {getPageNumbers().map((pageNumber) => {
                                return (
                                    <div
                                        key={pageNumber}
                                        className={`${styles.buttons} ${currentPage === pageNumber ? styles.active : ""}`}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {pageNumber < 10 ? `0${pageNumber}` : pageNumber}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            className={styles.rightArrow}
                            disabled={currentPage === totalPage || totalPage === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            <RightArrow />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManageUsers;
