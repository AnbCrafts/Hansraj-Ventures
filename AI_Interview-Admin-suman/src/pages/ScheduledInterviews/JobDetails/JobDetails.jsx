import React, { useState } from "react";

import { formatDate2 } from "../../../components/Functions/dateFormate";
import styles from "./JobDetails.module.scss";
import { toast } from "react-toastify";
import axios from "../../../components/Hooks/axios";
import { useDispatch } from "react-redux";
import { setReload } from "../../../redux/slices/popupSlice";

const JobDetails = ({ setJobDetailsPopup, activeData }) => {
    const dispatch = useDispatch();
    const agentVoice = ["ash", "ballad", "coral", "sage", "verse"];

    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 16);
    console.log(activeData)

    const [editData, setEditData] = useState({
        scheduled_time: new Date(activeData?.scheduled_time).toISOString() || "",
        title: activeData?.title || "",
        agent_voice: activeData?.agent_voice || "",

        // link: activeData?.link || "",
        // history: activeData?.history || "",
        score: activeData?.score || 0,

        status: activeData?.status || "completed",
        selected: activeData?.selected || "",
        feedback: activeData?.feedback || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = () => {
        try {
            const raw = {};

            if (editData.status === "completed") {
                raw.status = editData.status;
                raw.score = Number(editData.score);
                
            } else {
                raw.title = editData.title;
                if (editData.scheduled_time) raw.scheduled_time = editData.scheduled_time;
                raw.agent_voice = editData.agent_voice;
                raw.status = editData.status;
            }
            raw.selected = editData.selected === "true" ? true : editData.selected === "false" ? false : null;
            if (editData.feedback) raw.feedback = editData.feedback;

            console.log(raw);
            axios
                .put(`/interview/${activeData.id}`, raw)
                .then((response) => {
                    console.log(response.data);

                    toast.success("Interview details saved successfully");
                    dispatch(setReload());
                    setJobDetailsPopup(false);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to save interview details");
                });
        } catch (error) {
            console.log(error);
        }
    };

    console.log(activeData);
    return (
        <div className={styles.Container} onClick={() => setJobDetailsPopup(false)}>
            <div className={styles.Box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.BoxTop}>
                    <h1>Edit Interview Details</h1>

                    <div className={styles.Btns}>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setJobDetailsPopup(false)}>Back</button>
                    </div>
                </div>
                <div className={styles.BoxContent}>
                    <div className={styles.Field}>
                        <label htmlFor="status">Status</label>
                        <select name="status" value={editData.status} onChange={handleChange}>
                            <option value="scheduled">Scheduled</option>
                            {/* <option value="in_progress">In Progress</option> */}
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {editData.status !== "completed" && (
                        <>
                            <div className={styles.Field}>
                                <label htmlFor="title">Title</label>
                                <input type="text" name="title" placeholder="Enter title" value={editData.title} onChange={handleChange} />
                            </div>
                            {/* <div className={styles.Field}>
                                <label htmlFor="scheduled_time">Scheduled Time</label>
                                <input
                                    type="datetime-local"
                                    name="scheduled_time"
                                    min={formattedNow}
                                    value={editData.scheduled_time}
                                    onChange={handleChange}
                                />
                            </div> */}
                            <div className={styles.Field}>
                                <label htmlFor="agent_voice">Agent Voice</label>
                                <select name="agent_voice" value={editData.agent_voice} onChange={handleChange}>
                                    <option value="" disabled>
                                        --Select--
                                    </option>
                                    {agentVoice.map((voice) => (
                                        <option key={voice} value={voice}>
                                            {voice}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    {editData.status === "completed" && (
                        <>
                            <div className={styles.Field}>
                                <label htmlFor="score">Score</label>
                                <input
                                    type="number"
                                    name="score"
                                    placeholder="Enter score"
                                    value={editData.score}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.Field}>
                                <label htmlFor="selected">Selected</label>
                                <select name="selected" value={editData.selected} onChange={handleChange}>
                                    <option value="" disabled>
                                        --Select--
                                    </option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className={styles.Field}>
                        <label htmlFor="feedback">Feedback</label>
                        <input type="text" name="feedback" placeholder="Enter feedback" value={editData.feedback} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
