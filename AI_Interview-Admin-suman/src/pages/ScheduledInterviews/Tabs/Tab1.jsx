import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import More from "../../../assets/svg/More.svg?react";
import OrangeCalender from "../../../assets/svg/OrangeCalender.svg?react";
import LeftArrow from "../../../assets/svg/LeftArrow.svg?react"; // Imported
import RightArrow from "../../../assets/svg/RightArrow.svg?react"; // Imported
import Loading from "../../../components/Hooks/Loading";
import axios from "../../../components/Hooks/axios";
import { setReload, setRescheduledPopup } from "../../../redux/slices/popupSlice";
import styles from "./Tab1.module.scss";
import { toast } from "react-toastify";
import ThreeDot from "../../../assets/svg/ThreeDot.svg?react";
import { formatDate } from "../../../components/Functions/dateFormate";

const Tab1 = ({ activeSection, page, noData, setNoData, setRejectPopup, setJobDetailsPopup, setActiveData, setIsPopupOpen }) => {
    const dispatch = useDispatch();
    const { userId } = useSelector((s) => s.auth);
    const { reload } = useSelector((s) => s.popup);
    
    const optionsRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [activeIndex, setActiveIndex] = useState();

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        setIsLoading(true);

        // Updated API call to include page and limit
        axios
            .get(`/interview/list?status=${activeSection}&page=${currentPage}&limit=${limit}`)
            .then(({ data }) => {
                console.log(data);

                // Assuming backend returns paginated items directly based on status
                setFilteredData(data.data.items);
                
                // Set pagination data from response
                setTotalPage(data.data.total_pages || 1);
                // If the backend returns the current page, sync it, otherwise keep local state
                if (data.data.page) setCurrentPage(data.data.page);

                setIsLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
                setIsLoading(false);
            });
    }, [reload, activeSection, currentPage, limit]);

    // Reset page to 1 when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSection]);

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

    const handleDelete = (id) => {
        axios
            .delete(`/interview/${id}`)
            .then(({ data }) => {
                console.log(data);
                dispatch(setReload());
                setIsPopupOpen(false);
            })
            .catch((error) => {
                console.log("Error => ", error);
            });
    };

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
        <>
            <div className={styles.Header}>
                <p>Sl No</p>
                <p>Name</p>
                <p>Email </p>
                <p>Created At</p>
                <p>Title</p>
                <p>Interview ID</p>
                <p>Score</p>
                <p>Action</p>
            </div>

            {isLoading ? (
                <Loading height="8rem" width="8rem" />
            ) : (
                <>
                    {filteredData?.length === 0 && <div className={styles.noData}>No data</div>}

                    <div className={styles.Body}>
                        {filteredData.map((data, index) => {
                            return (
                                <div
                                    key={index}
                                    className={styles.Box}
                                    onClick={() => {
                                        setIsPopupOpen(true);
                                        setActiveData(data);
                                    }}
                                >
                                    <div className={styles.Item}>
                                        {/* Calculate Serial Number based on page */}
                                        <p>{limit * (currentPage - 1) + index + 1}</p>
                                    </div>
                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.name ? data?.candidate?.name : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.email ? data?.candidate?.email : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>
                                            {new Date(data?.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.title ? data?.title : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.cand_id ? data?.candidate?.cand_id : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.score}/5</p>
                                    </div>
                                    <div
                                        className={styles.Item}
                                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                    >
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
                                                        setJobDetailsPopup(true);
                                                        setActiveData(data);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <hr style={{ width: "80%", border: "1px solid var(--c2)", padding: 0, opacity: 0.5 }} />
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
                                </div>
                            );
                        })}
                    </div>

                    {/* --- PAGINATION SECTION --- */}
                    {filteredData.length > 0 && (
                        <div className={styles.pagination}>
                            <div className={styles.records}>
                                Page {currentPage} of {totalPage}
                            </div>

                            <div className={styles.pageButtons}>
                                <button 
                                    className={styles.leftArrow} 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    <LeftArrow />
                                </button>

                                <div className={styles.pages}>
                                    {getPaginationGroup().map((item, index) => (
                                        <div 
                                            key={index}
                                            className={`${styles.buttons} ${currentPage === item ? styles.active : ""}`} 
                                            onClick={() => setCurrentPage(item)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {item < 10 ? `0${item}` : item}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className={styles.rightArrow}
                                    disabled={currentPage === totalPage}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    <RightArrow />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Tab1;