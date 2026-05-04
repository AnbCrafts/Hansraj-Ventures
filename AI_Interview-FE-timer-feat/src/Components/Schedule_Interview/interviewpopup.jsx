import React, { useEffect, useState } from "react";
import styles from "./interviewpopup.module.scss";
import { axiosInstance2 } from "../axios/axiosInstance2";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "../../Redux/Slices/PopupSlice";
import Select from "react-select";

export default function InterviewPopup({ isOpen, onClose, resumes }) {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        agentVoice: "",
        title: "",
        skills: [],
        numberOfQuestions: "",
        resumeId: "",
    });
    const [allSkills, setAllSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axiosInstance2
            .get("/user/me")
            .then(({ data }) => {
                setAllSkills(data.data.skills);
                console.log(data.data.skills);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const options = allSkills?.map((item) => ({
        value: item,
        label: item,
    }));

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "numberOfQuestions") {
            const numericRegex = /^[0-9]*$/;
            if (numericRegex.test(value)) {
                let numValue = value === "" ? "" : Number(value);
                if (numValue > 10) {
                    numValue = 10;
                }
                setFormData((prev) => ({
                    ...prev,
                    [name]: numValue,
                }));
            }
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSkillInputChange = (e) => {
        setSkillInput(e.target.value);
    };

    const handleSkillInputKeyDown = (e) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData((prev) => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()],
                }));
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((skill) => skill !== skillToRemove),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.agentVoice || !formData.title || formData.skills.length === 0 || !formData.numberOfQuestions || !formData.resumeId) {
            toast.error("Please fill in all required fields");
            return;
        }

        // ✅ NEW: Validate number of questions
        const numQuestions = parseInt(formData.numberOfQuestions);
        if (numQuestions < 1) {
            toast.error("Number of questions must be at least 1");
            return;
        }

        // ✅ NEW: Transform formData to match API requirements (camelCase to snake_case)
        const apiPayload = {
            agent_voice: formData.agentVoice,
            title: formData.title,
            skills: formData.skills.map((skill) => skill.value),
            num_questions: numQuestions, // Convert to number
            resume_id: formData.resumeId,
        };

        console.log("Sending API payload:", apiPayload); // ✅ NEW: Debug log

        setIsSubmitting(true);

        axiosInstance2
            .post("/mockInterview/create", apiPayload) // ✅ MODIFIED: Changed endpoint from /user/schedule-interview to /mockInterview/create
            .then((res) => {
                console.log("Interview created successfully:", res.data); // ✅ NEW: Debug log

                // ✅ MODIFIED: Extract data from response
                const responseData = res.data?.data;

                // ✅ NEW: Show success message with interview details
                toast.success(res.data?.msg || "Interview created successfully!");
                dispatch(setReload());

                console.log("Failed to copy link");

                // ✅ NEW: Show credits used
                if (responseData?.credit_used) {
                    console.log(`Credits used: ${responseData.credit_used}`);
                }

                // Close popup and reset form
                onClose();
                setFormData({
                    agentVoice: "",
                    title: "",
                    skills: [],
                    numberOfQuestions: "",
                    resumeId: "",
                });
                setSkillInput("");
            })
            .catch((err) => {
                console.error("Interview creation error:", err);
                console.error("Error details:", err.response?.data); // ✅ NEW: Additional error logging
                toast.error(
                    err.response?.data?.msg || "Failed to create interview" // ✅ MODIFIED: Changed from 'message' to 'msg'
                );
            })
            .finally(() => setIsSubmitting(false));
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.popup}>
                <div className={styles.header}>
                    <h2>Schedule Interview</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close popup">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={styles.instructionBox}>
                    <p>
                        <strong>Note:</strong> Please ensure relevant Skills are added to your <strong>Profile</strong> before selecting them here.
                        Additionally, select a <strong>Resume</strong> that aligns with the chosen skills for best results.
                    </p>
                </div>
                

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Title */}
                    <div className={styles.formGroup}>
                        <label htmlFor="title">
                            Title <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter interview title..."
                            required
                            className={styles.input}
                        />
                    </div>

                    {/* Agent Voice */}
                    <div className={styles.formGroup}>
                        <label htmlFor="agentVoice">
                            Agent Voice <span className={styles.required}>*</span>
                        </label>

                        <select
                            id="agentVoice"
                            name="agentVoice"
                            value={formData.agentVoice}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        >
                            <option value="">-- Select a Voice --</option>
                            <option value="ash">Ash – Warm, friendly male voice</option>
                            <option value="ballad">Ballad – Smooth, melodic female voice</option>
                            <option value="coral">Coral – Bright, energetic female voice</option>
                            <option value="sage">Sage – Calm, wise neutral voice</option>
                            <option value="verse">Verse – Poetic, expressive neutral voice</option>
                        </select>
                    </div>

                    {/* Skills */}
                    <div className={styles.formGroup}>
                        <label htmlFor="skills">
                            Skills <span className={styles.required}>*</span>
                        </label>
                        {console.log(options)}

                        <Select
                            options={options}
                            isMulti
                            name="colors"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e })}
                            noOptionsMessage={({ inputValue }) => (!inputValue ? "No skill found. Please add it to your Profile first." : "No results found")}
                            styles={{   
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: "transparent",
                                    borderColor: state.isFocused ? "#3b82f6" : "#4b5563", // Darker border
                                    borderWidth: "2px",
                                    boxShadow: state.isFocused ? "0 0 0 2px #bfdbfe" : "none", // Adjusted shadow
                                    "&:hover": { borderColor: "#3b82f6" },
                                    padding: "0rem",
                                }),

                                // --- ADDED FOR DARK MODE ---

                                // --- Main dropdown menu container ---
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: "#1f2937", // Dark menu background
                                    borderRadius: "8px",
                                    border: "1px solid #4b5563", // Dark border
                                }),

                                // --- Individual dropdown options ---
                                option: (base, state) => ({
                                    ...base,
                                    // Set option background color
                                    backgroundColor: state.isFocused
                                        ? "#374151" // Hover/focus background
                                        : state.isSelected
                                        ? "#3b82f6" // Selected background
                                        : "transparent", // Default background

                                    // Set option text color
                                    color: state.isSelected ? "#ffffff" : "#f9fafb", // Light text

                                    "&:active": {
                                        backgroundColor: "#374151", // Click background
                                    },
                                }),

                                // --- Text inside the input box (e.g., "Select...") ---
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#9ca3af", // Light placeholder text
                                }),

                                // --- Text for the *selected* value (before tags) ---
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#f9fafb", // Light text
                                }),

                                // --- The "Type here" input field ---
                                input: (base) => ({
                                    ...base,
                                    color: "#f9fafb", // Light text when typing
                                }),

                                // --- Style for the multi-select tags ---
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: "#374151", // Dark tag background
                                }),

                                // --- Text inside the tags ---
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: "#f9fafb", // Light text on tag
                                }),

                                // --- 'x' button on the tags ---
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: "#9ca3af",
                                    "&:hover": {
                                        backgroundColor: "#ef4444", // Red background on hover
                                        color: "#ffffff",
                                    },
                                }),
                            }}
                        />
                    </div>

                    {/* Number of Questions */}
                    <div className={styles.formGroup}>
                        <label htmlFor="numberOfQuestions">
                            Number of questions <span className={styles.required}>* (Max 10)</span>
                        </label>
                        <input
                            type="number"
                            id="numberOfQuestions"
                            name="numberOfQuestions"
                            value={formData.numberOfQuestions}
                            onChange={handleChange}
                            placeholder="Enter number of questions..."
                            required
                            min="1"
                            max="30"
                            className={styles.input}
                        />
                    </div>

                    {/* Resume */}
                    <div className={styles.formGroup}>
                        <label htmlFor="resumeId">
                            Resume <span className={styles.required}>*</span> (Add resume according to selected skills)
                        </label>
                        <select
                            id="resumeId"
                            name="resumeId"
                            value={formData.resumeId}
                            onChange={handleChange}
                            required
                            className={styles.select}
                        >
                            <option value="">Choose a resume...</option>
                            {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>
                                    {resume.filename}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className={styles.actions}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting......" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
