import React, { useState, useEffect } from "react";
import styles from "./ProfilePopup.module.scss";
import { axiosInstance2 } from "../../axios/axiosInstance2";
import { useDispatch } from "react-redux";
import { setReload } from "../../../Redux/Slices/PopupSlice";
import { toast } from "react-toastify";

export default function Skills() {
    const dispatch = useDispatch();
    const [skills, setSkills] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserSkills = async () => {
            try {
                const response = await axiosInstance2.get("/user/me");
                setSkills(response.data.data.skills || []); // load existing skills
            } catch (error) {
                console.error("❌ Error fetching user skills:", error);
            }
        };

        fetchUserSkills();
    }, []);

    // 🔄 Function to call API for updating skills
    const updateSkillsAPI = async (updatedSkills) => {
        setLoading(true); // Start loader before API call

        axiosInstance2
            .patch("/user/update", { skills: updatedSkills })
            .then((response) => {
                console.log("✅ Skills updated:", response.data);
                toast.success("Skills updated successfully!");
                dispatch(setReload());
            })
            .catch((error) => {
                console.error("❌ Error updating skills:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Add new skill or show default ones
    const handleAddSkill = async (e) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();

        let updatedSkills = [...skills];

        if (!trimmedInput) {
            // If input is empty, merge default skills (unique)
            updatedSkills = [...new Set([...skills])];
        } else if (!skills.includes(trimmedInput)) {
            // Add new custom skill
            updatedSkills = [...skills, trimmedInput];
        }

        setSkills(updatedSkills);
        setInputValue("");

        // 🔄 Update API
        await updateSkillsAPI(updatedSkills);
    };

    // ❌ Remove skill
    const handleRemoveSkill = async (skillToRemove) => {
        // ✅ CHECK: Prevent deleting if only 1 skill remains
        if (skills.length <= 1) {
            toast.warn("At least one skill is required.");
            return;
        }

        const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
        setSkills(updatedSkills);

        // 🔄 Update API
        await updateSkillsAPI(updatedSkills);
    };

    return (
        <div className={styles.Skills}>
            <h2 className={styles.title}>Add Skills {loading && <span className={styles.loading}>⏳</span>}</h2>

            {/* --- Input Form --- */}
            <form onSubmit={handleAddSkill}>
                <div className={styles.formContainer}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a skill..."
                        className={styles.input}
                    />
                    <button type="submit" className={styles.addButton} aria-label="Add skill">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* --- Display Skills --- */}
            <div className={styles.skillsGrid}>
                {skills.map((skill) => (
                    <div key={skill} className={styles.skillTag}>
                        <span>{skill}</span>
                        <button onClick={() => handleRemoveSkill(skill)} className={styles.removeButton} aria-label={`Remove ${skill}`}>
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* ✅ NOTE: Instruction at the bottom */}
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#888", textAlign: "center", fontStyle: "italic" }}>
                * A minimum of one skill is required in your profile.
            </p>
        </div>
    );
}