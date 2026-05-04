import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TrashCanIcon from "../../assets/icons/TrashCanIcon.svg?react";
import axios from "../../components/Hooks/axios";
import Loading from "../../components/Hooks/Loading";
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

    // --- State: UI Loading ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- Constants ---
    const REQUIRED_PLACEHOLDERS = ["[CANDIDATE_NAME]", "[INTERVIEW_ID]", "[INTERVIEW_TITLE]", "[INTERVIEW_LINK]"];

    // --- State: Skills ---
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState({
        skill: "",
        num_questions: "",
    });

    // --- State: Mail Settings ---
    const [mailSettings, setMailSettings] = useState({
        email_from: "",
        subject: "",
        html: "",
        smtp_host: "",
        smtp_port: "",
        smtp_username: "",
        smtp_password: "",
        smtp_use_tls: true,
        smtp_use_ssl: false,
    });

    const [initialMailSettings, setInitialMailSettings] = useState({});

    // --- Fetch Data (Chained & Parallel) ---
    useEffect(() => {
        setLoading(true);

        const fetchGlobalSettings = axios.patch(`/admin/settings`, {});
        const fetchMailSettings = axios.patch(`/admin/mail-settings`, {});

        Promise.all([fetchGlobalSettings, fetchMailSettings])
            .then(([globalRes, mailRes]) => {
                // 1. Process Global Settings (Skills)
                const apiData = globalRes.data.data;
                const fetchedSkills = apiData?.admin_skills?.[0]?.skills || [];
                setSkills(fetchedSkills);
                dispatch(setAllSkills(fetchedSkills));

                // 2. Process Mail Settings
                const mailData = mailRes.data.data;

                const fetchedMailConfig = {
                    email_from: mailData?.email_from || "",
                    subject: mailData?.subject || "",
                    html: mailData?.html || "",
                    smtp_host: mailData?.smtp_host || "",
                    smtp_port: mailData?.smtp_port || "",
                    smtp_username: mailData?.smtp_username || "",
                    smtp_password: "",
                    smtp_use_tls: mailData?.smtp_use_tls ?? true,
                    smtp_use_ssl: mailData?.smtp_use_ssl ?? false,
                };

                setMailSettings(fetchedMailConfig);
                setInitialMailSettings(fetchedMailConfig);

                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching settings:", err);
                toast.error("Failed to load settings data");
                setLoading(false);
            });
    }, [reload, dispatch]);

    // --- Handlers: Mail Settings ---
    const handleMailChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMailSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleQuillChange = (content) => {
        setMailSettings((prev) => ({ ...prev, html: content }));
    };

    // --- Helper: Copy Tag ---
    const handleCopyTag = (tag) => {
        navigator.clipboard.writeText(tag);
        toast.info(`Copied ${tag} to clipboard!`);
    };

    // --- Handlers: Skills ---
    const handleNewSkillChange = (e) => {
        const { name, value } = e.target;
        if (name === "num_questions") {
            // ✅ Fix: Allow empty string OR digits. Don't force Number() here.
            if (/^\d*$/.test(value)) {
                setNewSkill((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
            return;
        }
        setNewSkill((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSkill = () => {
        if (newSkill.skill.trim() === "") {
            toast.warn("Please enter a skill");
            return;
        }

        // ✅ Fix: Convert to Number here. Default to 0 if empty.
        const skillToAdd = {
            ...newSkill,
            num_questions: newSkill.num_questions === "" ? 0 : Number(newSkill.num_questions),
        };

        const updatedSkills = [skillToAdd, ...skills];
        setSkills(updatedSkills);
        toast.info("Skill added. Click Save to persist changes.");

        setNewSkill({ skill: "", num_questions: "" }); // ✅ Reset to empty
    };

    const handleRemoveSkill = async (skillName) => {
        const updatedSkills = skills.filter((s) => s.skill !== skillName);
        setSkills(updatedSkills);

        try {
            await axios.delete(`/admin/delete-skills`, { data: { skill: skillName } });
            dispatch(setReload());
            toast.success("Skill removed");
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.msg || "Failed to delete skill");
            dispatch(setReload());
        }
    };

    const handleUpdateSkillInput = (index, field, value) => {
        const updatedSkills = [...skills];

        // ✅ Fix: Allow empty string during editing
        let newValue = value;
        if (field === "num_questions") {
            newValue = value === "" ? "" : Number(value);
        }

        updatedSkills[index] = {
            ...updatedSkills[index],
            [field]: newValue,
        };
        setSkills(updatedSkills);
    };

    // --- Logic: Calculate Changed Fields ---
    const getChangedFields = () => {
        const changes = {};

        Object.keys(mailSettings).forEach((key) => {
            if (key === "smtp_password") {
                if (mailSettings[key] && mailSettings[key].trim() !== "") {
                    changes[key] = mailSettings[key];
                }
            } else if (mailSettings[key] !== initialMailSettings[key]) {
                if (mailSettings[key] !== null && mailSettings[key] !== undefined) {
                    changes[key] = mailSettings[key];
                }
            }
        });
        return changes;
    };

    //Mail Validation
    const placeHolderValidation = (mailContent) => {
        const missingPlaceholders = REQUIRED_PLACEHOLDERS.filter((placeholder) => {
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

    // --- Main Save Handler ---
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const promises = [];

            // 1. Check & Prepare Mail Settings Patch
            const changedMailFields = getChangedFields();

            if (changedMailFields.html) {
                const result = placeHolderValidation(changedMailFields.html);
                if (!result.isValid) {
                    return toast.warn(`Missing placeholders: ${result.missing.join(", ")}`);
                }
            }

            let mailUpdated = false;

            if (Object.keys(changedMailFields).length > 0) {
                promises.push(
                    axios.patch(`/admin/mail-settings`, changedMailFields).then(() => {
                        mailUpdated = true;
                    })
                );
            }

            // 2. Check & Prepare Skills Update
            if (skills.length > 0) {
                // ✅ Fix: Ensure all num_questions are numbers before sending
                const skillsToSave = skills.map((s) => ({
                    ...s,
                    num_questions: s.num_questions === "" ? 0 : Number(s.num_questions),
                }));
                promises.push(axios.patch(`/admin/settings`, { skills: skillsToSave }));
            }

            // Execute all saves
            await Promise.all(promises);

            if (promises.length > 0) {
                toast.success("Settings saved successfully");
                if (mailUpdated) {
                    setInitialMailSettings({ ...mailSettings, smtp_password: "" });
                    setMailSettings((prev) => ({ ...prev, smtp_password: "" }));
                }
                dispatch(setReload());
            } else {
                toast.info("No changes detected");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || "Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Handler: Reset to Default Mail Template ---
    const handleResetMailTemplate = async () => {
        try {
            const { data } = await axios.post("/superAdmin/reset");
            if (data?.data) {
                setMailSettings((prev) => ({
                    ...prev,
                    html: data.data.html || "",
                    subject: data.data.subject || "",
                }));
            }
            toast.success(data?.msg || "Mail template reset to default!");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to reset mail template");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}></div>
                <button className={styles.SaveButton} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className={styles.Bottom}>
                {/* --- SKILLS SECTION --- */}
                <div className={`${styles.Container} ${styles.Skills}`}>
                    <h2>Skills</h2>
                    <div className={styles.Buttons}>
                        <div className={styles.InputWrapper}>
                            <input
                                className={styles.Input}
                                type="text"
                                name="skill"
                                value={newSkill.skill}
                                onChange={handleNewSkillChange}
                                placeholder="Add new skill"
                            />
                        </div>
                        <div className={`${styles.InputWrapper} ${styles.Questions}`}>
                            <input
                                className={`${styles.Input}`}
                                type="number"
                                name="num_questions"
                                value={newSkill.num_questions}
                                onChange={handleNewSkillChange}
                            />
                        </div>
                        <button className={styles.Button} onClick={handleAddSkill}>
                            Add
                        </button>
                    </div>

                    <div className={styles.SkillsWrapper}>
                        {skills.map((item, index) => (
                            <div className={styles.SkillItem} key={index}>
                                <div className={styles.Input}>
                                    <input
                                        type="text"
                                        value={item?.skill}
                                        onChange={(e) => handleUpdateSkillInput(index, "skill", e.target.value)}
                                    />
                                </div>
                                <div className={styles.Input}>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={item?.num_questions}
                                        onChange={(e) => {
                                            if (/^\d*$/.test(e.target.value)) {
                                                handleUpdateSkillInput(index, "num_questions", e.target.value);
                                            }
                                        }}
                                    />
                                </div>
                                <TrashCanIcon className={styles.DeleteButton} onClick={() => handleRemoveSkill(item?.skill)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- EMAIL CONFIGURATION SECTION --- */}
                <div className={styles.Container}>
                    <h2>SMTP Configuration</h2>

                    <div className={styles.Row}>
                        <div className={styles.InputWrapper}>
                            <label>SMTP Host</label>
                            <div className={styles.Input}>
                                <input
                                    type="text"
                                    name="smtp_host"
                                    value={mailSettings.smtp_host}
                                    onChange={handleMailChange}
                                    placeholder="eg. smtp.gmail.com"
                                />
                            </div>
                        </div>
                        <div className={styles.InputWrapper}>
                            <label>SMTP Port</label>
                            <div className={styles.Input}>
                                <input
                                    type="text"
                                    name="smtp_port"
                                    value={mailSettings.smtp_port}
                                    onChange={handleMailChange}
                                    placeholder="eg. 587"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.Row}>
                        <div className={styles.InputWrapper}>
                            <label>SMTP Username</label>
                            <div className={styles.Input}>
                                <input
                                    type="text"
                                    name="smtp_username"
                                    value={mailSettings.smtp_username}
                                    onChange={handleMailChange}
                                    autoComplete="off"
                                    readOnly
                                    onFocus={(e) => (e.target.readOnly = false)}
                                />
                            </div>
                        </div>
                        <div className={styles.InputWrapper}>
                            <label>SMTP Password</label>
                            <div className={styles.Input}>
                                <input
                                    type="password"
                                    name="smtp_password"
                                    value={mailSettings.smtp_password}
                                    onChange={handleMailChange}
                                    placeholder="Leave empty to keep current"
                                    autoComplete="off"
                                    readOnly
                                    onFocus={(e) => (e.target.readOnly = false)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.Row}>
                        <div className={styles.InputWrapper}>
                            <label>Sender Email (From)</label>
                            <div className={styles.Input}>
                                <input type="email" name="email_from" value={mailSettings.email_from} onChange={handleMailChange} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.CheckboxGroup} style={{ marginTop: "1rem", display: "flex", gap: "20px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input type="checkbox" name="smtp_use_tls" checked={mailSettings.smtp_use_tls} onChange={handleMailChange} />
                            Use TLS
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input type="checkbox" name="smtp_use_ssl" checked={mailSettings.smtp_use_ssl} onChange={handleMailChange} />
                            Use SSL
                        </label>
                    </div>
                </div>

                {/* --- MAIL CONTENT SECTION --- */}
                <div className={`${styles.Container} ${styles.MailContent}`}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2>Mail Template</h2>
                        <button type="button" className={styles.Button} onClick={handleResetMailTemplate} style={{ marginLeft: 16 }}>
                            Reset to Default
                        </button>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label>Email Subject</label>
                        <div className={styles.Input}>
                            <input
                                type="text"
                                name="subject"
                                value={mailSettings.subject}
                                placeholder="Enter email subject"
                                onChange={handleMailChange}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: "1rem", height: "fit-content" }}>
                        <label style={{ marginBottom: "0.5rem", display: "block" }}>Email Body (HTML)</label>
                        <ReactQuill
                            theme="snow"
                            value={mailSettings.html}
                            onChange={handleQuillChange}
                            className={styles.QuillEditor}
                            placeholder="Design your email content..."
                        />
                    </div>

                    {/* --- INSTRUCTION BOX ADDED HERE --- */}
                    <div className={styles.InstructionBox}>
                        <h4>⚠️ Required Placeholders</h4>
                        <p>
                            The following tags are required in the email body. The system will automatically replace them with the actual
                            candidate details.
                            <strong> Click a tag to copy it.</strong>
                        </p>
                        <div className={styles.TagsContainer}>
                            {REQUIRED_PLACEHOLDERS.map((tag) => (
                                <span key={tag} className={styles.Tag} onClick={() => handleCopyTag(tag)} title="Click to copy">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* ---------------------------------- */}
                </div>

                {/* --- AUDIO SECTION --- */}
                <div className={styles.Container}>
                    <h2>Agent Voices</h2>
                    <div
                        className={styles.AudioGrid}
                        // style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}
                    >
                        {[
                            { name: "Ash", src: ash },
                            { name: "Ballad", src: ballad },
                            { name: "Coral", src: coral },
                            { name: "Sage", src: sage },
                            { name: "Verse", src: verse },
                        ].map((audio) => (
                            <div className={styles.AudioWrapper} key={audio.name}>
                                <h4>{audio.name}</h4>
                                <audio
                                    controls
                                    // This disables the three dots menu options
                                    controlsList="nodownload noplaybackrate"
                                    // This disables right-click menu
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ width: "100%" }}
                                >
                                    <source src={audio.src} type="audio/mpeg" />
                                </audio>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
