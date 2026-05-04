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
import { setCandidatePopup, setCompany, setJobSeeker, setReload } from "../../redux/slices/popupSlice";
import styles from "./Trash.module.scss";
import { toast } from "react-toastify";

const Trash = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [fetchedData, setFetchedData] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLoading(true);
        setFetchedData([]);
        axios
            .get(`/candidate/deleted?page=${currentPage}&limit=100`)
            .then(({ data }) => {
               
                if (data.data.length) setFetchedData(data?.data);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [active, reload]);

    const handleDelete = (id) => {
        setIsDeleting(true);
        axios
            .delete(`/candidate/hard_delete/${id}`)
            .then(({ data }) => {
                toast.success(data.msg);
                dispatch(setReload());
            })
            .catch((error) => {
                console.log("Error => ", error);
            })
            .finally(() => setIsDeleting(false));
    };

    const handleRestore = (id) => {
        setIsDeleting(true);
        const formData = new FormData();
        formData.append("deleted", false);
        axios
            .put(`/candidate/${id}`, formData)
            .then(({ data }) => {
                console.log(data)
                toast.success(data.msg);
                dispatch(setReload());
            })
            .catch((error) => {
                console.log("Error => ", error);
            })
            .finally(() => setIsDeleting(false));
    };
    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}>
                    <button
                        className={active === "" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("");
                        }}
                    >
                        Candidates
                    </button>
                    {/* <button
                        className={active === "Interviews" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("Interviews");
                        }}
                    >
                        Interviews
                    </button> */}
                </div>

                {/* <div className={styles.Filters}>
                    <p>Filter</p>
                    <Filter />
                </div> */}
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
                    {/* <p>Profile complete</p> */}
                    <p>More</p>
                </div>

                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.UserCards}>
                        {fetchedData.length === 0 ? (
                            <h1>{!active ? "No Candidates" : "No Interviews"}</h1>
                        ) : (
                            fetchedData?.map((data, index) => {
                                return (
                                    <div
                                        className={styles.Card}
                                        key={index}
                                        //onClick={() => dispatch(setJobSeeker({ isActive: true, activeData: data }))}
                                    >
                                        <div>{index + 1}</div>
                                        <div className={styles.Profile}>
                                            {/* <img src={data.profileImage} alt="" /> */}
                                            <p>{data?.name ? data?.name : "No Name"}</p>
                                        </div>
                                        <div>{data?.cand_id ? data?.cand_id : "No ID"}</div>
                                        <div>{data?.email ? data?.email : "No Email"}</div>
                                        <div>{new Date(data?.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata", // Converts from UTC to IST
                                                dateStyle: "medium", // "31 Oct 2025"
                                                timeStyle: "short", // "11:38 am"
                                            })}</div>
                                        <div>
                                            {data?.resume_url ? (
                                                <a href={data?.resume_url} target="_blank">
                                                    View Resume
                                                </a>
                                            ) : (
                                                "No Resume"
                                            )}
                                        </div>
                                        <div>{data?.phone ? data?.phone : "No Phone Number"}</div>
                                        <div className={styles.More}>
                                            <button className={styles.Restore} onClick={() => handleRestore(data?.id)}>
                                                Restore
                                            </button>{" "}
                                            <button className={styles.Delete} onClick={() => handleDelete(data?.id)} disabled={isDeleting}>
                                                Delete
                                            </button>{" "}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <div className={styles.pagination}>
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
            </div>
        </div>
    );
};

export default Trash;
