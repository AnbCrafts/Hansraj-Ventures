import React, { useEffect, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Dialer from "../../assets/svg/Dialer.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Message from "../../assets/svg/Message.svg?react";
import Pdf from "../../assets/svg/Pdf.svg?react";
import { setReloadAssignedJob } from "../../redux/slices/assignedJobSlice";
import { setJobSeeker, setReload } from "../../redux/slices/popupSlice";
import { formatDate, getCurrentDate } from "../Functions/dateFormate";
import axios from "../Hooks/axios";
import styles from "./CandidateDetailPopup.module.scss";
import { FaCopy } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const CandidateDetailPopup = () => {
    const dispatch = useDispatch();
    const {reload} = useSelector((s) => s.popup);
    const { activeData } = useSelector((s) => s.popup);
    const { voicesList } = useSelector((s) => s.popup);
    const [isLoadingI, setIsLoadingI] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [interviewList, setInterviewList] = useState([]);
    const [generatedLink, setGeneratedLink] = useState(
        activeData?.recent_interview?.id
            ? `${import.meta.env.VITE_LANDING_PAGE_URL}/join?interviewId=` + activeData?.recent_interview?.id
            : null
    );
    const [copied, setCopied] = useState(false);
    const [maxQuestionLimit, setMaxQuestionLimit] = useState(30);

    const agentVoice = ["ash", "ballad", "coral", "sage", "verse"];

    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 16); //only for current API, it will be removed later

    const [formData, setFormData] = useState({
        // about: activeData?.profile_summary || "No data",
        // name: activeData?.name || "",
        // email: activeData?.email || "",
        // phone: activeData?.phone || "",
        candidate_id: activeData?.id || "",
        agent_voice: "",
        title: "",
        cc: "",
        num_questions: 1,
        scheduled_time: null, //only for current API, it will be removed later
    });

    useEffect(() => {
        axios
            .patch("/admin/settings", {})
            .then(({ data }) => {
                // console.log(data.data.max_ques_limit)
                setMaxQuestionLimit(data.data.max_ques_limit);
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.response.data.msg || "Failed to fetch Max Question Limit");
            });
    }, [activeData]);

    useEffect(() => {
        axios
            .get(`/interview/list?candidate_id=${activeData?.id}`)
            .then(({ data }) => {
                console.log(data.data.items);
                setInterviewList(data?.data?.items);
            })
            .catch((error) => console.log(error));
    }, [reload, activeData]);

    const handelChange = (e) => {
    const { name, value } = e.target;

    if (name === "num_questions") {
        // Regex ensures only positive integers (prevents negative signs)
        const numericRegex = /^[0-9]*$/;

        if (numericRegex.test(value)) {
            // PREVENT 0: If value is strictly "0", do nothing (don't update state)
            if (value === "0") return;

            // Allow empty string (so user can delete everything)
            let numValue = value === "" ? "" : Number(value);

            // Check Max Limit
            if (numValue !== "" && numValue > maxQuestionLimit) {
                numValue = maxQuestionLimit;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: numValue,
            }));
        }
        return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
};

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const handelInterview = () => {
        if (!formData.title) return toast.warn("Please Enter job title");
        if (!formData.agent_voice) return toast.warn("Please select a agent voice");
        if (!isValidEmail(formData.cc)) return toast.warn("Please Enter a valid Email");
        setIsLoadingI(true);

        axios
            .post(`/interview/create`, formData)
            .then(({ data }) => {
                setIsLoadingI(false);
                toast.success(data.msg);
                // setGeneratedLink("https://interview-ai-landing.netlify.app" + data.data.link.split("/api")[1]);
                setGeneratedLink(data.data.link.replace("/api", ""));
                setFormData({ agent_voice: "", title: "", cc: "" });
                dispatch(setReload());
            })
            .catch((e) => console.log(e))
            .finally(() => setIsLoadingI(false));
    };

    const handelSave = () => {
        setEditMode(false);
    };

    const copyLink = async () => {
        if (generatedLink) {
            try {
                await navigator.clipboard.writeText(generatedLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy link:", err);
            }
        }
    };

    return (
        <div className={styles.PopupBackground} onClick={() => dispatch(setJobSeeker({ isActive: false, activeData: null }))}>
            <div className={styles.Wrapper} onClick={(e) => e.stopPropagation()}>
                <div className={styles.Row1}>
                    {/* <img src={activeData?.profileImage} alt="profileImage" /> */}

                    <div className={styles.Details}>
                        <h3>{activeData?.name}</h3>
                        <h4>{activeData?.email}</h4>
                    </div>
                </div>

                <div className={styles.Row2}>
                    <div className={styles.Left}>
                        <div className={styles.InputWrapper}>
                            <label htmlFor="about">About</label>

                            <textarea
                                id="about"
                                readOnly
                                value={activeData?.profile_summary ? activeData?.profile_summary : "No data"}
                                style={{ height: "14rem" }}
                            />
                        </div>
                        <div className={styles.InputWrapper}>
                            <label htmlFor="skill">Skills</label>
                            <textarea
                                id="skill"
                                readOnly
                                value={activeData?.skills?.length > 0 ? activeData?.skills?.join(", ") : "No data"}
                            />
                        </div>
                    </div>

                    <div className={styles.Right}>
                        <div className={styles.InputWrapper}>
                            <label htmlFor="prof">Register date and time</label>
                            <input
                                type="text"
                                id="prof"
                                readOnly
                                value={new Date(activeData?.created_at + "Z").toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata", // Converts from UTC to IST
                                    dateStyle: "medium", // "31 Oct 2025"
                                    timeStyle: "short", // "11:38 am"
                                })}
                            />
                        </div>

                        <div className={styles.InputWrapper1}>
                            <label htmlFor="phone">Phone</label>
                            <div className={styles.Input}>
                                <Dialer />
                                <input
                                    type="text"
                                    id="phone"
                                    placeholder="Phone Number"
                                    readOnly
                                    value={activeData?.phone ? activeData?.phone : "No data"}
                                />
                            </div>
                        </div>

                        {/* <div className={styles.InputWrapper1}>
                            <label htmlFor="phone">Alternative Phone</label>
                            <div className={styles.Input}>
                                <Dialer />

                                <input
                                    type="text"
                                    id="alternative-phone"
                                    placeholder="Phone Number"
                                    readOnly
                                    value={activeData?.alternativePhone ? activeData?.alternativePhone : "No data"}
                                />
                            </div>
                        </div> */}

                        <div className={styles.InputWrapper1}>
                            <label htmlFor="email">Email</label>
                            <div className={styles.Input}>
                                <Message />

                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Phone Number"
                                    readOnly
                                    value={activeData?.email ? activeData?.email : "No data"}
                                />
                            </div>
                        </div>

                        <div className={styles.CvWrapper}>
                            <label>Resume</label>
                            <div
                                className={styles.Cvcon}
                                onClick={() => {
                                    if (activeData?.resume_url === "") toast.info("No Resume !!");
                                    else window.open(activeData?.resume_url, "_blank");
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <Pdf />
                                <div className={styles.Details}>
                                    <h4>{activeData?.resume_url ? "Click Here" : "No Resume"}</h4>
                                </div>
                            </div>
                        </div>

                        {/* <div className={styles.InputWrapper}>
							<label>Profile Progress Bar: {activeData.profileComplete}%</label>

							<div className={styles.bar}>
								<span style={{ width: `${activeData.profileComplete}%` }}></span>
							</div>
						</div> */}
                    </div>
                </div>

                <div className={styles.ButtonWrapper}>
                    {/* <button
						onClick={() => handelBlockUser(activeData?.blocked_status)}
						disabled={isLoading}
						className={`${styles.BlockBtn} ${!activeData?.blocked_status ? styles.Active : ""}`}>
						{isLoading ? "Loading..." : !activeData?.blocked_status ? "Block user" : "Unblock User"}
					</button> */}

                    {/* <button onClick={() => (editMode ? handelSave() : setEditMode(true))} className={styles.BackBtn}>
                        {editMode ? "Save" : "Edit Interview"}
                    </button> */}

                    <button onClick={() => dispatch(setJobSeeker({ isActive: false, activeData: null }))} className={styles.BackBtn}>
                        Back
                    </button>
                </div>

                <hr style={{ opacity: 0.5, margin: 0, padding: 0 }} />

                <div className={styles.R2} id="ScheduleSection">
                    {/* {generatedLink && (
                        <div className={styles.linkDisplay}>
                            <label className={styles.label}>Generated Interview Link</label>
                            <div className={styles.linkGroup}>
                                <input type="text" value={generatedLink} readOnly className={styles.linkInput} />
                                <button onClick={copyLink} className={styles.copyButton} title="Copy link">
                                    {copied ? <IoCheckmarkDoneSharp size={16} /> : <FaCopy size={16} />}
                                </button>
                            </div>

                            {copied && (
                                <div className={styles.successMessage}>
                                    <IoCheckmarkDoneSharp size={16} />
                                    Interview link copied to clipboard!
                                </div>
                            )}
                        </div>
                    )} */}

                    {
                        <div className={styles.MainInputWrapper}>
                            <div className={styles.InputWrapper}>
                                <label htmlFor="phone">Job Title</label>
                                <div className={styles.Input}>
                                    {/* <Dialer /> */}
                                    <input
                                        type="text"
                                        id="job-title"
                                        name="title"
                                        placeholder="Enter Job Title"
                                        value={formData?.title}
                                        onChange={handelChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.InputWrapper}>
                                <label htmlFor="phone">Agent Voice</label>
                                <select name="agent_voice" id="agent_voice" value={formData?.agent_voice} onChange={handelChange}>
                                    <option value="" disabled>
                                        Select Agent Voice
                                    </option>

                                    {agentVoice.map((item, idx) => (
                                        <option key={idx} value={item}>
                                            {item.charAt(0).toUpperCase() + item.slice(1)} : {voicesList[item]?.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.InputWrapper}>
                                <label htmlFor="num_questions">Number Of Questions (Max {maxQuestionLimit})</label>
                                <div className={styles.Input}>
                                    <input
                                        type="text"
                                        id="num_questions"
                                        name="num_questions"
                                        placeholder="e.g., 10"
                                        value={formData?.num_questions}
                                        onChange={handelChange}
                                        min={1}
                                    />
                                </div>
                            </div>

                            {/* <div className={styles.InputWrapper}>
                                    <label>Date</label>
                                    <div className={styles.Input}>
                                        <input
                                            type="datetime-local"
                                            name="scheduled_time"
                                            min={formattedNow}
                                            value={formData?.scheduled_time}
                                            onChange={handelChange}
                                        />
                                    </div>
                                </div> */}

                            <div className={styles.InputWrapper}>
                                <label htmlFor="phone">CC</label>
                                <div className={styles.Input}>
                                    {/* <Dialer /> */}
                                    <input
                                        type="cc"
                                        id="cc"
                                        name="cc"
                                        placeholder="Enter a valid email"
                                        value={formData?.cc}
                                        onChange={handelChange}
                                    />
                                </div>
                            </div>

                            <button className={styles.Submit} onClick={handelInterview} disabled={isLoadingI} id="ScheduleSectionSubmitBtn">
                                {isLoadingI ? (
                                    <ThreeCircles
                                        height="2rem"
                                        width="13rem"
                                        color="#fff"
                                        visible={true}
                                        ariaLabel="three-circles-rotating"
                                    />
                                ) : (
                                    "Schedule Interview"
                                )}
                            </button>
                        </div>
                    }
                </div>
                <hr style={{ opacity: 0.5, margin: 0, padding: 0 }} />
                    
                {interviewList && interviewList.length > 0 && (
                    <div className={styles.InterviewListTable}>
                        <h3>Interview List</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Interview ID</th>
                                    <th>Title</th>
                                    <th>Created At</th>
                                    <th>Interview Status</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interviewList?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item?.int_id}</td>
                                        <td>{item?.title}</td>
                                        <td>{formatDate(item?.created_at)}</td>
                                        <td>{item?.status}</td>
                                        <td>
                                            <a href={item?.link} target="_blank" rel="noopener noreferrer">
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* {activeData?.recent_interview?.id ? (
                    <div className={styles.InterviewDetails}>
                        <h3>Interview Details</h3>
                        <h4>Interview ID : {activeData?.recent_interview?.int_id}</h4>
                        <h4>Title : {activeData?.recent_interview?.title || "No Data"}</h4>
                        
                        <p className={styles[activeData?.recent_interview?.status]}>Status: {activeData?.recent_interview?.status}</p>
                        <div className={styles.linkDisplay}>
                            <label className={styles.label}>Generated Interview Link</label>
                            <div className={styles.linkGroup}>
                                <input type="text" value={generatedLink} readOnly className={styles.linkInput} />
                                <button onClick={copyLink} className={styles.copyButton} title="Copy link">
                                    {copied ? <IoCheckmarkDoneSharp size={16} /> : <FaCopy size={16} />}
                                </button>
                            </div>

                            {copied && (
                                <div className={styles.successMessage}>
                                    <IoCheckmarkDoneSharp size={16} />
                                    Interview link copied to clipboard!
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.R2} id="ScheduleSection">
                        {generatedLink && (
                            <div className={styles.linkDisplay}>
                                <label className={styles.label}>Generated Interview Link</label>
                                <div className={styles.linkGroup}>
                                    <input type="text" value={generatedLink} readOnly className={styles.linkInput} />
                                    <button onClick={copyLink} className={styles.copyButton} title="Copy link">
                                        {copied ? <IoCheckmarkDoneSharp size={16} /> : <FaCopy size={16} />}
                                    </button>
                                </div>

                                {copied && (
                                    <div className={styles.successMessage}>
                                        <IoCheckmarkDoneSharp size={16} />
                                        Interview link copied to clipboard!
                                    </div>
                                )}
                            </div>
                        )}

                        {!generatedLink && (
                            <div className={styles.MainInputWrapper}>
                                <div className={styles.InputWrapper}>
                                    <label htmlFor="phone">Job Title</label>
                                    <div className={styles.Input}>
                                        
                                        <input
                                            type="text"
                                            id="job-title"
                                            name="title"
                                            placeholder="Enter Job Title"
                                            value={formData?.title}
                                            onChange={handelChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.InputWrapper}>
                                    <label htmlFor="phone">Agent Voice</label>
                                    <select name="agent_voice" id="agent_voice" value={formData?.agent_voice} onChange={handelChange}>
                                        <option value="" disabled>
                                            Select Agent Voice
                                        </option>

                                        {agentVoice.map((item, idx) => (
                                            <option key={idx} value={item}>
                                                {item.charAt(0).toUpperCase() + item.slice(1)} : {voicesList[item]?.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.InputWrapper}>
                                    <label htmlFor="phone">Number Of Questions (Max {maxQuestionLimit})</label>
                                    <div className={styles.Input}>
                                        <input
                                            type="text"
                                            id="num_questions"
                                            name="num_questions"
                                            placeholder="e.g., 10"
                                            value={formData?.num_questions}
                                            onChange={handelChange}
                                            min={1}
                                        />
                                    </div>
                                </div>

                                <div className={styles.InputWrapper}>
                                    <label htmlFor="phone">CC</label>
                                    <div className={styles.Input}>
                                     
                                        <input
                                            type="cc"
                                            id="cc"
                                            name="cc"
                                            placeholder="Enter a valid email"
                                            value={formData?.cc}
                                            onChange={handelChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    className={styles.Submit}
                                    onClick={handelInterview}
                                    disabled={isLoadingI}
                                    id="ScheduleSectionSubmitBtn"
                                >
                                    {isLoadingI ? (
                                        <ThreeCircles
                                            height="3rem"
                                            width="3rem"
                                            color="#fff"
                                            visible={true}
                                            ariaLabel="three-circles-rotating"
                                        />
                                    ) : (
                                        "Shedule Interview"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default CandidateDetailPopup;
