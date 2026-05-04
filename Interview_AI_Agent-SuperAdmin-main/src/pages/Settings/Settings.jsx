import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Hooks/Loading"; // Import is already here
import axios from "../../components/Hooks/axios";
import ash from "../../assets/audio/ash.mp3";
import ballad from "../../assets/audio/ballad.mp3";
import coral from "../../assets/audio/coral.mp3";
import sage from "../../assets/audio/sage.mp3";
import verse from "../../assets/audio/verse.mp3";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import styles from "./Settings.module.scss";
import { toast } from "react-toastify";
import { setAllSkills, setReload } from "../../redux/slices/popupSlice";

const Settings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(true); // FIX: Start loading as true immediately
    const [appPassword, setAppPassword] = useState("");
    const [settingData, setSettingData] = useState({
        email: "",
        subject: "",
        skills: [],
        html: "",
        master_key: "",
        max_ques_limit: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettingData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        setLoading(true);

        axios
            .patch(`/admin/settings`, {})
            .then(({ data }) => {
                setSettingData((prev) => ({
                    email: data.data?.email || "",
                    subject: data.data?.subject || prev.subject || "",
                    skills: data.data?.skills || [],
                    master_key: "",
                    html: data.data?.html || prev.html || "",
                    max_ques_limit: parseInt(data.data?.max_ques_limit) || 0,
                }));

                dispatch(setAllSkills(data?.data?.skills));
                setLoading(false); // Stop loading on success
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
                setLoading(false); // FIX: Stop loading even if error occurs, otherwise page hangs
            });
    }, [reload, dispatch]); // Added dispatch to dependency array for safety

    const handleResetMailContent = () => {
        axios
            .post("/superAdmin/reset")
            .then(({ data }) => {
                toast.success(data.msg);
                setSettingData((prev) => ({
                    ...prev,
                    html: data.data?.html ?? prev.html,
                    subject: data.data?.subject ?? prev.subject,
                }));
                dispatch(setReload());
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
                toast.error(response.data.msg);
            });
    };

    const placeHolderValidation = (mailContent) => {
        const placeholders = ["[CANDIDATE_NAME]", "[INTERVIEW_ID]", "[INTERVIEW_TITLE]", "[INTERVIEW_LINK]"];

        const missingPlaceholders = placeholders.filter((placeholder) => {
            return !mailContent.includes(placeholder);
        });
        if (missingPlaceholders.length > 0) {
            return {
                isValid: false,
                missing: missingPlaceholders,
            };
        }
        return {
            isValid: true,
            missing: [],
        };
    };

    const handleSave = () => {
        if (apiKey !== "") {
            settingData.openai_api_key = apiKey;
        }
        if (appPassword !== "") {
            settingData.password = appPassword;
        } else {
            delete settingData.password;
        }

        const result = placeHolderValidation(settingData.html);
        if (!result.isValid) {
            return toast.warn(`Mail content is missing placeholder(s): ${result.missing.join(", ")}`);
        }

        axios
            .patch(`/admin/settings`, settingData)
            .then(({ data }) => {
                toast.success(data.msg);
                dispatch(setReload());
                setApiKey("");
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    };

    // --- THE FIX: Block rendering if loading is true ---
    if (loading) {
        return (
            <div className={styles.ManageUsers} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loading />
            </div>
        );
    }

    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}></div>
                <button className={styles.SaveButton} onClick={handleSave}>
                    Save
                </button>
            </div>

            <div className={styles.Bottom}>
                <div className={styles.Container}>
                    <h2>Email Details</h2>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Email</label>
                        <div className={styles.Input}>
                            <input type="text" name="email" value={settingData.email || ""} placeholder="No Email Set" onChange={handleChange} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Password</label>
                        <div className={styles.Input}>
                            <input type="text" name="password" value={appPassword} placeholder="Enter to update password" onChange={(e) => setAppPassword(e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">API KEY</label>
                        <div className={styles.Input}>
                            <input type="text" value={apiKey} placeholder="Enter to update API Key" onChange={(e) => setApiKey(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Master Password</label>
                        <div className={styles.Input}>
                            <input type="text" name="master_key" value={settingData.master_key} onChange={handleChange} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Max Question Limit</label>
                        <div className={styles.Input}>
                            <input type="number" min={0} name="max_ques_limit" value={settingData.max_ques_limit} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <div className={styles.Container}>
                    <h2>Agent Voices</h2>
                    <div className={styles.AudioWrapper}>
                        <h4>Ash</h4>
                        <audio controls>
                            <source src={ash} type="audio/mpeg" />
                        </audio>
                    </div>
                    <div className={styles.AudioWrapper}>
                        <h4>Ballad</h4>
                        <audio controls>
                            <source src={ballad} type="audio/mpeg" />
                        </audio>
                    </div>
                    <div className={styles.AudioWrapper}>
                        <h4>Coral</h4>
                        <audio controls>
                            <source src={coral} type="audio/mpeg" />
                        </audio>
                    </div>
                    <div className={styles.AudioWrapper}>
                        <h4>Sage</h4>
                        <audio controls>
                            <source src={sage} type="audio/mpeg" />
                        </audio>
                    </div>
                    <div className={styles.AudioWrapper}>
                        <h4>Verse</h4>
                        <audio controls>
                            <source src={verse} type="audio/mpeg" />
                        </audio>
                    </div>
                </div>
                <div className={`${styles.Container} ${styles.MailContent}`}>
                    <div className={styles.Top}>
                        <h2>Mail Content</h2>
                        <button className={styles.Button} onClick={handleResetMailContent}>
                            Reset
                        </button>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Subject</label>
                        <div className={styles.Input}>
                            <input
                                type="text"
                                name="subject"
                                value={settingData.subject || ""}
                                placeholder="Subject"
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div>
                        <ReactQuill
                            theme="snow"
                            name="html"
                            value={settingData.html || ""}
                            onChange={(e) => setSettingData({ ...settingData, html: e })}
                            className={styles.QuillEditor}
                            placeholder="Edit Description with editor..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;