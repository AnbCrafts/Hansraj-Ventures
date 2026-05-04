import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { setAllSkills, setCandidatePopup, setReload } from "../../redux/slices/popupSlice";

import axios from "../Hooks/axios";
import styles from "./AddCandidate.module.scss";

import Select from "react-select";

const AddCandidate = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const { editData } = useSelector((s) => s.popup);
    const { allSkills } = useSelector((s) => s.popup);
    // console.log(editData);
    const { activeInterviewData, type } = useSelector((s) => s.popup);
    const [image, setImage] = useState(editData?.profileImage || "");
    const [imageFile, setImageFile] = useState(null);
    const { pathname } = useLocation();

    const isEditMode = Boolean(editData);

    const [isLoading, setIsLoading] = useState(false);
    const [doneButton, setDoneButton] = useState(false);

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const inputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: editData?.name || "",
        email: editData?.email || "",
        username: editData?.username || "",
        password: "",
        phone: editData?.phone || "",
        profile_summary: editData?.profile_summary || "",

        resume_url: editData?.resume_url || "",
        skills:
            editData?.skills?.map((skill) => ({
                value: skill,
                label: skill,
            })) || [],
    });

    // const options = allSkills.map((item) => ({
    //     value: item.skill,
    //     label: item.skill,
    // }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     setImageFile(file); // keep the file for upload
    //     setImage(URL.createObjectURL(file)); // preview only
    // };

    // const handleFileChange = (e) => {
    //     const selectedFile = e.target.files[0];
    //     validateFile(selectedFile);
    // };

    // Drag & Drop Handling
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        validateFile(droppedFile);
    };

    // const validateFile = (selectedFile) => {
    //     if (selectedFile) {
    //         const allowedTypes = [
    //             "application/pdf", // .pdf
    //             // "application/msword", // .doc
    //             // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    //         ];

    //         if (allowedTypes.includes(selectedFile.type)) {
    //             setFile(selectedFile);
    //             setError("");
    //         } else {
    //             setError("Only .pdf files are allowed.");
    //             setFile(null);
    //         }
    //     }
    // };
    // console.log(formData.skills.map((s) => s.value).join(","));
    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const UserNameRegex = /^[a-zA-Z0-9_]*$/;
            const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!EmailRegex.test(formData.email)) return toast.warn("Please enter a valid email address.");
            if (!UserNameRegex.test(formData.username)) return toast.warn("Username can only contain letters, numbers, and underscores.");
            
            if (!formData.name || !formData.email || !formData.username || !formData.password) {
                toast.info("Please fill all the details");
                return;
            }
            // if (!file && !editData.resume_url) {
            //     toast.info("Please upload a resume");
            //     return;
            // }
            // if (!formData.skills.length) {
            //     toast.info("Please add some skills");
            //     return;
            // }
            // Build form‑data
            // const payload = new FormData();
            // Object.entries(formData).forEach(([key, val]) => {
            //     if (key === "skills") {
            //         console.log("skills");
            //         payload.append("skills", val.map((s) => s.value).join(","));
            //     } else {
            //         payload.append(key, val);
            //     }
            // });
            // payload.append("resume", file);

            // payload.delete("resume_url");

            // if (isEditMode) {
            //     payload.delete("email");
            // }

            // payload.forEach((value, key) => {
            //     console.log(key, value);
            // });
            // return;

            const payload = {
                name: formData.name,
                email: formData.email,
                username: formData.username,
                password: formData.password,
            };

            // API call based on mode
            const url = isEditMode ? `/candidate/${editData.id}` : "/superAdmin/add";
            const method = isEditMode ? "put" : "post";

            await axios[method](url, payload);

            toast.success(`User ${isEditMode ? "updated" : "added"} successfully!`);
            dispatch(setReload());
            dispatch(setCandidatePopup({ state: false }));
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };
    // console.log(skills.join(","));
    return (
        <div
            className={styles.Container}
            onClick={() => {
                //dispatch(setCandidatePopup({ state: false }));
            }}
        >
            <div
                className={styles.Box}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <h2>{isEditMode ? "Edit Admin" : "Add New Admin"}</h2>
                <button className={styles.BackButton} onClick={() => dispatch(setCandidatePopup({ state: false }))}>
                    Back
                </button>

                <div className={styles.TopSection}>
                    <div className={styles.Col1}>
                        {/* <div className={styles.ProfilePic}>
                            <div className={styles["image-upload-wrapper"]}>
                                <label className={styles["circle-box"]} htmlFor="imageInput">
                                    {!image ? (
                                        <span id="placeholderText">Click to Upload</span>
                                    ) : (
                                        <img id="previewImage" src={image} alt="preview" />
                                    )}
                                </label>
                                <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div> */}
                        <div className={styles.Input}>
                            <label htmlFor="">Name</label>
                            <input type="text" placeholder="Enter Full Name" name="name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className={styles.Row}>
                            {/* <div className={styles.Input}>
                                <label htmlFor="">Gender</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div> */}
                        </div>
                        <div className={styles.Input}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                placeholder="Enter a valid email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Input}>
                            <label htmlFor="">Username</label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Input}>
                            <label htmlFor="">Password</label>
                            <input
                                type="text"
                                placeholder="Enter password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* <div className={styles.Input}>
                            <label htmlFor="">Bio</label>
                            <textarea
                                name="profile_summary"
                                id=""
                                placeholder="Write Something.."
                                value={formData.profile_summary}
                                onChange={handleChange}
                            ></textarea>
                        </div> */}
                        <button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? "Processing..." : isEditMode ? "Update Admin" : "Add Admin"}
                        </button>
                    </div>
                    {/* <div className={styles.Col1}>
                        <div className={styles.FileInput} onClick={() => inputRef.current.click()}>
                            <input type="file" accept=".pdf" onChange={handleFileChange} ref={inputRef} style={{ display: "none" }} />
                            <p>
                                Drag & Drop or <span>Click</span> to Upload (Only PDF files)
                            </p>
                        </div>

                        {error && <p className={styles.Error}>{error}</p>}

                        {file && <p className={styles.FileName}>Selected File: {file.name}</p>}
                        <div className={styles.Input}>
                            <label htmlFor="">Skills</label>

                            <Select
                                options={options}
                                isMulti
                                name="colors"
                                className="basic-multi-select"
                                classNamePrefix="select"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e })}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        backgroundColor: "transparent", // 🔹 transparent bg
                                        borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                                        borderWidth: "2px",
                                        boxShadow: state.isFocused ? "#bfdbfe" : "none",
                                        "&:hover": { borderColor: "#3b82f6" },
                                        padding: "0rem",
                                    }),
                                }}
                            />
                        </div>

                        
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default AddCandidate;
