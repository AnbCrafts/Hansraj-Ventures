import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import More from "../../../assets/svg/More.svg?react";
import OrangeCalender from "../../../assets/svg/OrangeCalender.svg?react";
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
    const [fetchData, setFetchData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [activeIndex, setActiveIndex] = useState();

    useEffect(() => {
        setIsLoading(true);

        axios
            .get(`/interview/list`)
            .then(({ data }) => {
                console.log(data);

                setFetchData(data.data.items);
                const filtered = data.data.items.filter((item) => item.status === activeSection);
                setFilteredData(filtered);

                setIsLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, [reload]);

    

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

    useEffect(() => {
        console.log(activeSection);
        setFilteredData(fetchData.filter((item) => item.status === activeSection));
    }, [activeSection]);

    const handleDelete = (id) => {
        axios
            .delete(`/interview/${id}`)
            .then(({ data }) => {
                console.log(data);
                // toast.success(data?.msg);

                dispatch(setReload());
                setIsPopupOpen(false);
            })
            .catch((error) => {
                console.log("Error => ", error);
            });
    };
    return (
        <>
            <div className={styles.Header}>
                <p>Sl No</p>
                <p>Name</p>
                <p>Email </p>
                <p>Interview date & time</p>
                <p>Title</p>

                <p>Interview ID</p>
                <p>Score</p>
                <p>Action</p>
            </div>

            {isLoading ? (
                <Loading height="8rem" width="8rem" />
            ) : (
                <>
                    {filteredData?.length == 0 && <div className={styles.noData}>No data</div>}

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
                                        <p>{index + 1}</p>
                                    </div>
                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.name ? data?.candidate?.name : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.email ? data?.candidate?.email : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{formatDate(data?.scheduled_time)}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.title ? data?.title : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.candidate?.cand_id ? data?.candidate?.cand_id : "No data"}</p>
                                    </div>

                                    <div className={styles.Item}>
                                        <p>{data?.score}</p>
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
                                                <hr style={{ width: "80%", border: "1px solid var(--c2)", padding: 0,  opacity: 0.5 }} />
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
                </>
            )}
        </>
    );
};

export default Tab1;
