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
import Bin from "../../assets/icons/TrashCanIcon.svg?react";

const Training = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);
    const { isTrainingShow } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [skillList, setSkillList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [editData, setEditData] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [Skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState({
        skill: "",
        num_questions: 0,
    });

    useEffect(() => {
        setLoading(true);
        axios
            .get(`/admin/list_skills`)
            .then(({ data }) => {
                setLoading(false);
                setSkillList(data.data.admin_skills);
                setActiveItem(data.data.admin_skills[0]);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, [currentPage, active, currentPage, reload]);

    const handleDelete = (skill) => {
        try {
            setLoading(true);
            axios
                .delete(`/admin/delete-skills`, { data: { skill } })
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

    const handleSkillChange = (e) => {
        const { name, value } = e.target;
        setNewSkill((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    console.log(activeItem);
    return (
        <>
            {isTrainingShow && <QuestionPopup onClose={() => setShowPopup(false)} editData={editData} />}
            <div className={styles.Container}>
                {/* <div className={styles.Top}>
                    <button className={styles.AddTraining} onClick={() => dispatch(setTrainingPopup({ state: true, data: null }))}>
                        Add Training Data
                    </button>
                </div> */}
                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.Bottom}>
                        <div className={styles.Domains}>
                            {skillList.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveItem(item)}
                                    className={activeItem === item ? styles.active : ""}
                                >
                                    {item?.name}
                                </button>
                            ))}
                        </div>
                        <div className={styles.DomainContainer}>
                            <div className={`${styles.Container} ${styles.Skills}`}>
                                {/* <h2>Skills</h2> */}
                                {/* <div className={styles.Buttons}>
                                    <div className={styles.InputWrapper}>
                                        <input
                                            className={styles.Input}
                                            type="text"
                                            name="skill"
                                            value={newSkill.skill}
                                            onChange={handleSkillChange}
                                            placeholder="Add new skill"
                                        />
                                    </div>

                                    <div className={`${styles.InputWrapper} ${styles.Questions}`}>
                                        <input
                                            className={`${styles.Input}`}
                                            type="number"
                                            value={newSkill.num_questions}
                                            onChange={handleSkillChange}
                                            name="num_questions"
                                        />
                                    </div>
                                    <button
                                        className={styles.Button}
                                        // onClick={() => {
                                        //     setSettingData((prevData) => ({
                                        //         ...prevData,
                                        //         skills: [newSkill, ...prevData.skills],
                                        //     }));
                                        //     setNewSkill({
                                        //         skill: "",
                                        //         num_questions: 0,
                                        //     });
                                        // }}
                                    >
                                        Add
                                    </button>
                                </div> */}
                                <div className={styles.SkillsWrapper}>
                                    {activeItem?.skills.map((item, index) => (
                                        <div className={styles.SkillItem} key={index}>
                                            <div className={styles.Input} key={index}>
                                                <input
                                                    type="text"
                                                    value={item?.skill}
                                                    name="skill"
                                                    // onChange={(e) => {
                                                    //     const updatedSkills = [...settingData.skills];
                                                    //     updatedSkills[index] = e.target.value;
                                                    //     setSettingData((prev) => ({
                                                    //         ...prev,
                                                    //         skills: updatedSkills,
                                                    //     }));
                                                    // }}
                                                />
                                            </div>
                                            <div className={`${styles.Input} `}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={item?.num_questions}
                                                    onChange={(e) => {
                                                        const test = /^\d*$/.test(e.target.value);
                                                        if (!test) return;
                                                        const newSkills = settingData.skills.map((skill, idx) => {
                                                            // If this isn't the item we want to update, return it as is
                                                            if (idx !== index) {
                                                                return skill;
                                                            }

                                                            // Otherwise, create a new object with the updated value
                                                            return {
                                                                ...skill, // Copy all old properties
                                                                num_questions: Number(e.target.value), // Overwrite the one we're changing
                                                            };
                                                        });

                                                        // Update the state with the new array
                                                        setSettingData((prev) => ({
                                                            ...prev,
                                                            skills: newSkills,
                                                        }));
                                                    }}
                                                    name="num_questions"
                                                />
                                            </div>
                                            <Bin onClick={() => handleDelete(item.skill)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* <div className={styles.pagination}> ... */}
            </div>
        </>
    );
};

export default Training;
