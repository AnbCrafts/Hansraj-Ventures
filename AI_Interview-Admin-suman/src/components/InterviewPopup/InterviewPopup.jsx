import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Calender from "../../assets/svg/Calender.svg?react";
import ClockGrey from "../../assets/svg/ClockGrey.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import DownArrow from "../../assets/svg/DownArrow.svg?react";
import Location from "../../assets/svg/Location.svg?react";
import Members from "../../assets/svg/Members.svg?react";
import Share from "../../assets/svg/Share.svg?react";
import { setInterviewPopup, setRescheduledPopup, setSharePopup, setType } from "../../redux/slices/popupSlice";
import { formatDate2 } from "../Functions/dateFormate";
import Loading from "../Hooks/Loading";
import axios from "../Hooks/axios";
import styles from "./InterviewPopup.module.scss";

const InterviewPopup = () => {
	const dispatch = useDispatch();
	const { userData } = useSelector((s) => s.auth);
	const { activeInterviewData, type } = useSelector((s) => s.popup);
	const { pathname } = useLocation();

	const [showDetails, setShowDetails] = useState(true);
	const [feedBackBtnShow, setFeedBackBtnShow] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [doneButton, setDoneButton] = useState(false);

	console.log(activeInterviewData)

	useEffect(() => {
		const date = new Date();
		const currentDate = `${date.getFullYear()}-${
			date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
		}-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
		console.log(currentDate , activeInterviewData?.interviewsDate)
		if (currentDate >= activeInterviewData?.interviewsDate) setFeedBackBtnShow(true);

		if (type === "interviews") setDoneButton(activeInterviewData?.interviewStatus?.interviewPending);
		else setDoneButton(activeInterviewData?.interviewStatus?.interview2Pending);
	}, []);

	const handelDonePopup = () => {
		setIsLoading(true);
		const raw = {
			adminID: userData._id,
			jobApplicationID: activeInterviewData?._id,
			interview_type: type,
		};

		axios
			.post(`/adminUser/updateInterviewStatus`, raw)
			.then(({ data }) => {
				setIsLoading(false);
				if (type === "interviews") setDoneButton(data.data?.interviewStatus?.interviewPending);
				else setDoneButton(data.data?.interviewStatus?.interview2Pending);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div
			className={styles.Container}
			onClick={() => {
				dispatch(setInterviewPopup({ state: false, data: null }));
				dispatch(setType(""));
			}}>
			<div className={styles.Box} onClick={(e) => e.stopPropagation()}>
				<button className={styles.BackButton} onClick={() => dispatch(setInterviewPopup({ state: false, data: null }))}>
					Back
				</button>

				<div className={styles.TopSection}>
					<div className={styles.Col1}>
						<div className={styles.Row1}>
							<h1>{activeInterviewData?.jobId?.jobTittle}</h1>
							<div>
								<p>Interview :</p>
								<div className={styles.LeftRight}>
									<ClockGrey />
									<p>
										{formatDate2(activeInterviewData?.interviewsDate)}, {activeInterviewData?.interviewsTime}
									</p>
								</div>
							</div>
						</div>

						<div className={styles.Row2}>
							{/* FIXME: */}
							{/* <button>2 Days Left</button> */}

							<div className={styles.Row2Top}>
								<div className={styles.Row2TopLeft}>
									<div className={styles.LeftSVG}>
										<Members />
									</div>
									<p>3 Members</p>
								</div>

								<div className={styles.Row2TopRight}>
									<img src={activeInterviewData?.applicantId?.profileImage}></img>

									<span
										className={showDetails ? styles.active : ""}
										onClick={() => setShowDetails(!showDetails)}>
										<DownArrow />
									</span>
								</div>
							</div>

							<div className={`${styles.Row2Bottom} ${showDetails ? styles.active : ""}`}>
								<div className={styles.BoxRow}>
									<img src={activeInterviewData?.applicantId?.profileImage}></img>
									<div>
										<h1>{activeInterviewData?.applicantId?.name}</h1>
										<h2>{activeInterviewData?.applicantId?.profession}</h2>
									</div>
								</div>

								<div className={styles.BoxRow}>
									<img src={activeInterviewData?.applierId?.companyLogo}></img>
									<div>
										<h1>{activeInterviewData?.applierId?.companyName}</h1>
										<h2>{activeInterviewData?.applierId?.companyType}</h2>
									</div>
								</div>

								<div className={styles.BoxRow}>
									<img src={userData?.profileImage}></img>
									<div>
										<h1>You</h1>
										<h2>Admin </h2>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className={styles.Col2}>
						<div className={styles.Row1}>
							<h1>Job Details</h1>
							<h2>ID : {activeInterviewData?.jobId?._id}</h2>
						</div>

						<div className={styles.Row2}>
							<div className={styles.RightRow1}>
								<div>
									<img src={activeInterviewData?.applicantId?.companyLogo}></img>
								</div>

								<div className={styles.RightName}>
									<h1>{activeInterviewData?.applicantId?.companyName}</h1>
									<p>{activeInterviewData?.jobId?.jobTittle}</p>
								</div>
							</div>

							<div className={styles.RightRow2}>
								<div>
									<Location />
									<p>{activeInterviewData?.jobId?.location}</p>
								</div>
								<Dot />
								<div>
									<ClockGrey />
									<p>{activeInterviewData?.jobId?.experience} Experience</p>
								</div>
								<Dot />
								<div>
									<Calender />
									<p>{formatDate2(activeInterviewData?.jobId?.createdAt)}</p>
								</div>
							</div>

							<div className={styles.RightRow3}>
								<p>{activeInterviewData?.jobId?.workType}</p>
								<Dot />
								{activeInterviewData?.jobId?.availability && (
									<>
										<p>{activeInterviewData?.jobId?.availability ? "Immediate" : ""}</p>
										<Dot />
									</>
								)}
								<p>₹{activeInterviewData?.jobId?.pay}</p>
							</div>

							<div className={styles.RightRow4}>
								<p>
									<span>Skills : </span>
									{Array.isArray(activeInterviewData?.jobId?.skills)
										? activeInterviewData?.jobId?.skills.join(", ")
										: activeInterviewData?.jobId?.skills}
								</p>
							</div>
						</div>
					</div>

					{activeInterviewData?.rescheduledInterviews.length > 0 && (
						<div className={styles.Col3}>
							<div className={styles.Row1}>
								<p>Previous Interview Schedules</p>
							</div>

							<div className={styles.Row2}>
								{activeInterviewData?.rescheduledInterviews.map((data, index) => {
									return (
										<div key={index}>
											<p className={styles.LastPrevious}>{data?.interviewType} :</p>
											<div className={styles.PreviousRow2}>
												<ClockGrey />
												<p>
													{formatDate2(data?.originalDate)} , {data?.originalTime}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
{console.log(activeInterviewData)}
				{pathname !== "/interviews-history" && (
					<div className={styles.BottomSection}>
						<div className={styles.BottomSectionTop}>
							{feedBackBtnShow && (
								<div
									className={`${styles.ShareButton} ${
										activeInterviewData?.feedback?.experience.length >= 1 ? styles.Disable : ""
									}`}
									onClick={() => {
										
										if (activeInterviewData?.feedback?.experience?.length <= 1 || !activeInterviewData.feedback) {
											dispatch(setSharePopup({ state: true, data: activeInterviewData }));
											dispatch(setInterviewPopup({ state: false, data: null }));
										} else toast.info("Feedback already shared !");
									}}>
									<Share />{" "}
									<p>
										{activeInterviewData?.feedback?.experience?.length >= 1
											? "Feedback already shared"
											: "Share Your Feedback to Super admin"}
									</p>
								</div>
							)}

							{activeInterviewData?.temp && (
								<div
									className={styles.RescheduledButton}
									onClick={() => {
										dispatch(setRescheduledPopup({ state: true, data: activeInterviewData }));
										dispatch(setInterviewPopup({ state: false, data: null }));
									}}>
									<div className={styles.Left}>
										<div>
											<h6>Time : </h6>
											<span>
												<Calender />
											</span>
											<p>
												{formatDate2(activeInterviewData?.temp?.newDate)},
												{activeInterviewData?.temp?.newTime}
											</p>
										</div>

										<div>
											<h6>Description : </h6>
											<p>{activeInterviewData?.temp?.reason}</p>
										</div>
									</div>

									<div className={styles.Right}>
										<span>
											<Calender />
										</span>

										<p>Rescheduled An interview</p>
									</div>
								</div>
							)}
						</div>

						<div className={styles.BottomSectionBottom}>
							{!doneButton && (
								<button className={styles.DoneButton} disabled={isLoading} onClick={handelDonePopup}>
									{isLoading ? <Loading height="2rem" width="2rem" /> : "Done"}
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default InterviewPopup;
