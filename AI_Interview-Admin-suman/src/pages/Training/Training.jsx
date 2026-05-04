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
import { MdDelete, MdEdit } from "react-icons/md";
import styles from "./Training.module.scss";
import { toast } from "react-toastify";
import QuestionPopup from "./QuestionsPopup";
import { setCandidatePopup, setReload, setTrainingPopup } from "../../redux/slices/popupSlice";
import { ThreeCircles } from "react-loader-spinner";

const Training = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);
    const { isTrainingShow } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [trainingList, setTrainingList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [editData, setEditData] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`/training/list`)
            .then(({ data }) => {
                setLoading(false);
                setTrainingList(data.data);
                setActiveItem(data.data[0]);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, [currentPage, active, currentPage, reload]);

    const handleDelete = (id) => {
        try {
            setLoading(true);
            axios
                .delete(`/training/${id}`)
                .then(({ data }) => {
                    toast.success(data.msg);
                    dispatch(setReload());
                })
                .catch(({ response }) => {
                    console.log("Error => ", response);
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (error) {
            console.log("Error => ", error);
        }
    };

    return (
        <>
            {isTrainingShow && <QuestionPopup onClose={() => setShowPopup(false)} editData={editData} trainingList={trainingList} />}
            <div className={styles.Container}>
                <div className={styles.Top}>
                    <button className={styles.AddTraining} onClick={() => dispatch(setTrainingPopup({ state: true, data: null }))}>
                        Add Training Data
                    </button>
                </div>
                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.Bottom}>
                        <div className={styles.Domains}>
                            {trainingList?.length > 0 && trainingList?.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveItem(item)}
                                    className={activeItem === item ? styles.active : ""}
                                >
                                    {item?.domain}
                                </button>
                            ))}
                        </div>
                        <div className={styles.DomainContainer}>
                           {activeItem && <div className={styles.DomainCard}>
                                <h2>{activeItem?.domain[0].toUpperCase() + activeItem?.domain.slice(1)}</h2>
                                <p>{activeItem?.last_updated.split("T")[0]}</p>
                                <div>
                                    {activeItem?.questions.map((question, qIndex) => (
                                        <div key={qIndex} className={styles.Question}>
                                            <p>
                                                {qIndex + 1}. {question.question}{" "}
                                                <span className={styles[question?.difficulty]}>{question?.difficulty}</span>
                                            </p>

                                            <div className={styles.Tags}>
                                                {question?.tags.map((tag, tIndex) => (
                                                    <span key={tIndex} className={styles.Tag}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className={styles.EditBtn}
                                    disabled={loading}
                                    onClick={() => dispatch(setTrainingPopup({ state: true, data: activeItem }))}
                                >
                                    {loading ? <ThreeCircles color="#ffffff" width="auto" height={20} /> : <MdEdit size={20} />}
                                </button>
                                <button className={styles.DeleteBtn} disabled={loading} onClick={() => handleDelete(activeItem.id)}>
                                    {loading ? <ThreeCircles color="#ffffff" width="auto" height={20} /> : <MdDelete size={20} />}
                                </button>
                            </div>}
                        </div>
                    </div>
                )}
                {/* <div className={styles.pagination}> ... */}
            </div>
        </>
    );
};

export default Training;
