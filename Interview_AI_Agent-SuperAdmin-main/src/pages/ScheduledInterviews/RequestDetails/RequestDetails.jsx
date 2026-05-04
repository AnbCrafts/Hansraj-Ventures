import React, { useState } from "react";
import CompanyPhoto from "../../../assets/images/CompanyPhoto.png?react";
import Calender from "../../../assets/svg/Calender.svg?react";
import Clock from "../../../assets/svg/Clock.svg?react";
import ClockGrey from "../../../assets/svg/ClockGrey.svg?react";
import Dot from "../../../assets/svg/Dot.svg?react";
import Email from "../../../assets/svg/Email.svg?react";
import Location from "../../../assets/svg/Location.svg?react";
import Phone from "../../../assets/svg/Phone.svg?react";
import { formatDate, formatDate2 } from "../../../components/Functions/dateFormate";
import styles from "./RequestDetails.module.scss";
import { FaCopy } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { setReload } from "../../../redux/slices/popupSlice";
import axios from "../../../components/Hooks/axios";
import { useDispatch } from "react-redux";

const RequestDetails = ({ setIsPopupOpen, setJobDetailsPopup, activeData, setRejectPopup }) => {
    const dispatch = useDispatch();
    const [copied, setCopied] = useState(false);
    console.log(activeData);

    const copyLink = async () => {
        // const link = formatLink(activeData?.link);
        const link = activeData?.link.replace("/api","");
        if (link) {
            try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (err) {
                console.error("Failed to copy link:", err);
            }
        }
    };

    const formatLink = (link) => {
        const formattedLink = "https://interview-ai-landing.netlify.app" + link?.split("/api")[1];
        return formattedLink;
    };
    return (
        <div className={styles.Container} onClick={() => setIsPopupOpen(false)}>
            <div className={styles.Box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.Main}>
                    <div className={styles.MainTop}>
                        <p>Details</p>
                        <div className={styles.BtnContainer}>
                            {/* <button className={styles.EditBtn}>
                                <MdEdit size={20} />
                            </button> */}
                            {/* <button className={styles.DeleteBtn} onClick={() => handleDelete(activeData.id)}>
                                <MdDelete size={20} />
                            </button> */}
                            <button onClick={() => setIsPopupOpen(false)}>Back</button>
                        </div>
                    </div>

                    <div className={styles.MainBottom}>
                        <div className={styles.Row1}>
                            <div className={styles.Row1Left}>
                                {/* <div className={styles.LeftImg}><img src={activeData?.jobId?.companyLogo}></img></div> */}

                                <div className={styles.LeftBio}>
                                    <h1>{activeData?.candidate?.name}</h1>
                                    {/* <h2>{activeData?.applierId?.companyType ? activeData?.applierId?.companyType : "No data"}</h2> */}

                                    {/* <p>
                                        <ClockGrey /> {formatDate(activeData?.scheduled_time)}
                                    </p> */}
                                </div>
                            </div>

                            {/* <div className={styles.Row1Right}>
								<h1>About Company</h1>
								<h2>{activeData?.applierId?.aboutCompany}</h2>
							</div> */}
                        </div>

                        <div className={styles.Row2}>
                            <div className={styles.Row2Left}>
                                {/* <div className={styles.LeftTop}>
                                    <p>Candidate Details</p>
                                </div> */}

                                <div className={styles.LeftBottom}>
                                    <div className={styles.LeftPhone}>
                                        <label>Candidate ID</label>
                                        <div className={styles.Input}>
                                            <input
                                                type="text"
                                                placeholder={"Phone Number"}
                                                readOnly
                                                defaultValue={activeData?.candidate?.cand_id}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.LeftPhone}>
                                        <label>Phone</label>
                                        <div className={styles.Input}>
                                            <Phone />
                                            <input
                                                type="text"
                                                placeholder={"Phone Number"}
                                                readOnly
                                                defaultValue={activeData?.candidate?.phone}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.LeftEmail}>
                                        <label>Email</label>
                                        <div className={styles.Input}>
                                            <Email />
                                            <input
                                                type="email"
                                                placeholder={"email number"}
                                                readOnly
                                                defaultValue={activeData?.candidate?.email}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.LeftEmail}>
                                        <label>Skills</label>
                                        <div className={styles.Input}>
                                            <input
                                                type="text"
                                                placeholder={"Skills"}
                                                readOnly
                                                defaultValue={activeData?.candidate?.skills?.join(", ")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.Row2Right}>
                                <div className={styles.RightRow1}>
                                    {/* <div>
										<img src={activeData?.applicantId?.profileImage}></img>
									</div> */}

                                    <div className={styles.RightName}>
                                        <h1>
                                            {activeData?.title
                                                ? activeData?.title[0].toUpperCase() + activeData?.title.slice(1)
                                                : "No Data"}
                                        </h1>
                                        <p>Interview ID : {activeData?.int_id}</p>
                                    </div>
                                </div>

                                <div className={styles.RightRow2}>
                                    {/* <div>
										<Location />
										<p>{activeData?.applicantId?.location}</p>
									</div> */}

                                    {/* <div>
                                        <Clock />
                                        <p>{formatDate(activeData?.scheduled_time)}</p>
                                    </div> */}
                                    {/* <Dot /> */}
                                    {/* <div>
                                        <Calender />
                                        <p>{formatDate(activeData?.candidate?.created_at)}</p>
                                    </div> */}
                                </div>

                                {/* <div className={styles.RightRow3}>
									<p>CTP ₹${activeData?.applicantId?.currentPay}</p>
									<Dot />
									<p>ETP ₹{activeData?.applicantId?.expectationPay}</p>
								</div> */}

                                <div className={styles.RightRow4}>
                                    <p>
                                        <span>Total Score : {activeData?.score} </span>
                                    </p>
                                </div>

                                <div className={styles.RightRow5}>
                                    {/* <div className={styles.buttonWrap}>
                                        <button className={styles.reject} onClick={() => setRejectPopup(true)}>
                                            Reject
                                        </button>
                                    </div> */}
                                </div>
                                <div className={styles.linkDisplay}>
                                    <label className={styles.label}>Generated Interview Link</label>
                                    <div className={styles.linkGroup}>
                                        <input


                                            type="text"
                                            value={activeData?.link.replace("/api","") || "No available link"}
                                            readOnly
                                            className={styles.linkInput}
                                        />
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
                        </div>

                        {activeData?.history.length > 0 && (
                            <div className={styles.Row3}>
                                <div className={styles.Row3Top}>
                                    <div className={styles.TopLeft}>
                                        <div>
                                            <h3>History</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.Row3Bottom}>
                                    {activeData?.history?.map((item, index) => (
                                        <div key={index}>
                                            <h1>
                                                {index + 1} . {item?.question}
                                            </h1>
                                            <p>Ans : {item?.answer}</p>
                                            <p className={styles.score}>
                                                Score: <span style={{ color: item?.score > 0 ? "green" : "red" }}>{item?.score}</span>{" "}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;
