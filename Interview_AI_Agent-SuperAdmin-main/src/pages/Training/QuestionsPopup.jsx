import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import styles from "./QuestionsPopup.module.scss";
import { setReload, setTrainingPopup } from "../../redux/slices/popupSlice";
import { ThreeCircles } from "react-loader-spinner";

const QuestionPopup = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const { editData } = useSelector((s) => s.popup);
    const [imageFile, setImageFile] = useState(null);
    const { pathname } = useLocation();

    const isEditMode = Boolean(editData);

    const [isLoading, setIsLoading] = useState(false);
    const [domain, setDomain] = useState(editData?.domain || "");

    const [questions, setQuestions] = useState(editData?.questions || [{ question: "", difficulty: "", tags: [], tagInput: "" }]);

    console.log(editData);

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

            if (!domain || questions.some((q) => !q.question || !q.difficulty || !q.tags.length)) {
                toast.info("Please fill all the details");
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
                    <div className={styles.formGroup}>
                        <label htmlFor="domain">Domain</label>
                        <input
                            type="text"
                            id="domain"
                            name="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Enter domain (e.g., backend)"
                            required
                            className={styles.input}
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
