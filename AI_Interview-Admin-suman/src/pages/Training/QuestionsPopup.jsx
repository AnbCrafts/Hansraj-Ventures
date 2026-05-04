import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import styles from "./QuestionsPopup.module.scss";
import { setAllSkills, setReload, setTrainingPopup } from "../../redux/slices/popupSlice";
import { ThreeCircles } from "react-loader-spinner";
import Select from "react-select";

const QuestionPopup = ({ trainingList = [] }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const { editData } = useSelector((s) => s.popup);
    const { allSkills } = useSelector((s) => s.popup);
    const [imageFile, setImageFile] = useState(null);
    const { pathname } = useLocation();

    const isEditMode = Boolean(editData);

    const [isLoading, setIsLoading] = useState(false);
    const [domain, setDomain] = useState(editData?.domain || "");

    const [questions, setQuestions] = useState(editData?.questions || [{ question: "", difficulty: "", tags: [], tagInput: "" }]);

    console.log(editData);

    useEffect(() => {
        if (allSkills.length === 0) {
            dispatch(setAllSkills([]));
            axios
                .get("/admin/list_skills")
                .then(({ data }) => {
                    dispatch(setAllSkills(data?.data?.skills));
                })
                .catch((err) => {
                    toast.error("Failed to fetch listed skills");
                    console.log("Error => ", err || "");
                });
        }
    }, [allSkills]);
    // console.log(allSkills)
    console.log(trainingList);

    const safeTrainingList = Array.isArray(trainingList) ? trainingList : [];

    // Now this line is safe
    const trainingDomains = new Set(safeTrainingList.map((s) => s.domain));
    const allDomains = allSkills.map((s) => s.skill).filter((v) => !trainingDomains.has(v));
    console.log(allDomains);

    const addQuestion = () => {
        setQuestions([...questions, { question: "", difficulty: "", tags: [], tagInput: "" }]);
    };

    const deleteQuestion = (idx) => {
        setQuestions((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
    };

    const handleQuestionChange = (idx, field, value) => {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== idx) return q;
                if (field === "tags") {
                    // Not used, tags handled separately
                    return q;
                }
                if (field === "tagInput") {
                    return { ...q, tagInput: value };
                }
                return { ...q, [field]: value };
            })
        );
    };

    const handleTagKeyDown = (idx, e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = questions[idx].tagInput.trim();
            if (val && !questions[idx].tags.includes(val)) {
                setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, tags: [...q.tags, val], tagInput: "" } : q)));
            }
        }
    };

    const handleTagRemove = (qIdx, tagIdx) => {
        setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, tags: q.tags.filter((_, t) => t !== tagIdx) } : q)));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            // Detailed validation with specific messages
            const errors = [];
            if (!domain) errors.push("Domain is required.");

            questions.forEach((q, idx) => {
                const missing = [];
                if (!q.question || !q.question.trim()) missing.push("question");
                if (!q.difficulty) missing.push("difficulty");
                if (!q.tags || q.tags.length === 0) missing.push("tags.(After adding tags, press Enter)");
                if (missing.length) {
                    errors.push(`Question ${idx + 1}: missing ${missing.join(", ")}`);
                }
            });

            if (errors.length) {
                setIsLoading(false);
                toast.info(
                    <div>
                        <strong>Please fix the following:</strong>
                        <ul style={{ margin: "0.5rem 0 0 1.2rem" }}>
                            {errors.map((err, i) => (
                                <li key={i} style={{ marginBottom: "0.25rem" }}>
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>,
                    { autoClose: true }
                );
                return;
            }
            console.log(questions);

            const raw = {
                domain,
                questions: questions.map(({ tagInput, ...rest }) => rest),
            };

            // API call based on mode
            const url = isEditMode ? `/training/${editData.id}` : "/training/create";
            const method = isEditMode ? "put" : "post";

            await axios[method](url, raw);

            toast.success(`User ${isEditMode ? "updated" : "added"} successfully!`);
            setQuestions([{ question: "", difficulty: "", tags: [], tagInput: "" }]);
            setDomain("");
            dispatch(setReload());
            dispatch(setTrainingPopup({ state: false, data: null }));
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.Container} onClick={() => dispatch(setTrainingPopup({ state: false, data: null }))}>
            <div className={styles.Box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.Header}>
                    <h2>{isEditMode ? "Edit Data" : "Add New Data"}</h2>
                    <button className={styles.BackButton} onClick={() => dispatch(setTrainingPopup({ state: false, data: null }))}>
                        Back
                    </button>
                </div>
                <form className={styles.domainForm} onSubmit={(e) => handleSubmit(e)}>
                    {isEditMode ? (
                        <p className={styles.error}>Domain Can't be Edited</p>
                    ) : allDomains.length === 0 ? (
                        <p className={styles.error}>No domain available, please add new Skill from the setting page to continue</p>
                    ) : null}
                    <div className={styles.formGroup}>
                        <label htmlFor="domain">Domain</label>
                        {/* <input
                            type="text"
                            id="domain"
                            name="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Enter domain (e.g., backend)"
                            required
                            className={styles.input}
                        /> */}
                        <Select
                            options={allDomains.map((d) => ({ value: d, label: d }))}
                            // Fix 1: Handle null value
                            value={domain ? { value: domain, label: domain } : null}
                            onChange={(e) => setDomain(e.value)}
                            placeholder="Select domain"
                            isDisabled={isEditMode}
                            required
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: "transparent",
                                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                                    borderWidth: "2px",
                                    boxShadow: state.isFocused ? "#bfdbfe" : "none",
                                    "&:hover": { borderColor: "#3b82f6" },
                                    padding: "0rem",
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: "#f9fafb", // Light text when typing
                                }),

                                // Fix 2: Style placeholder and selected value
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#f9fafb", // Light text for selected value
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#9ca3af", // Light text for placeholder
                                }),
                            }}
                        />
                    </div>
                    <div className={styles.questionsSection}>
                        <label>Questions</label>
                        {questions.map((q, idx) => (
                            <div key={idx} className={styles.questionBlock}>
                                <input
                                    type="text"
                                    placeholder="Question"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <select
                                    value={q.difficulty}
                                    onChange={(e) => handleQuestionChange(idx, "difficulty", e.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Difficulty</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <div className={styles.tagsInputWrap}>
                                    <div className={styles.tagsChips}>
                                        {q.tags.map((tag, tagIdx) => (
                                            <span key={tagIdx} className={styles.tagChip}>
                                                {tag}
                                                <button
                                                    type="button"
                                                    className={styles.deleteTagBtn}
                                                    onClick={() => handleTagRemove(idx, tagIdx)}
                                                    title="Remove tag"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add tag and press Enter"
                                        value={q.tagInput || ""}
                                        onChange={(e) => handleQuestionChange(idx, "tagInput", e.target.value)}
                                        onKeyDown={(e) => handleTagKeyDown(idx, e)}
                                        className={styles.input}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.deleteQuestionBtn}
                                    onClick={() => deleteQuestion(idx)}
                                    title="Delete Question"
                                    disabled={questions.length === 1}
                                >
                                    <span>-</span>
                                </button>
                            </div>
                        ))}
                        <button type="button" className={styles.addQuestionBtn} onClick={addQuestion} title="Add Question">
                            <span>Add a question</span>
                        </button>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <ThreeCircles color="#ffffff" width={100} height={20} /> : isEditMode ? "Update" : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QuestionPopup;
