import React, { useEffect, useState } from "react";
import { TfiReload } from "react-icons/tfi";
import { useDispatch, useSelector } from "react-redux";
import OrangeCalender from "../../assets/svg/OrangeCalender.svg?react";
import { formatDate2, getMonthNumber, getMonthNumberToDate } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setInterviewPopup, setReload, setRescheduledPopup, setSharePopup, setType } from "../../redux/slices/popupSlice";
import styles from "./InterviewsHistory.module.scss";

const InterviewsHistory = () => {
	const dispatch = useDispatch();
	const { userId } = useSelector((s) => s.auth);
	const { reload } = useSelector((s) => s.popup);

	const [activeInterview, setActiveInterview] = useState("interviews");
	const [currentMonth, setCurrentMonth] = useState("");
	const [startingDate, setStartingDate] = useState("");
	const [endingDate, setEndingDate] = useState("");
	const [interviewData, setInterviewData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const nowMonth = getMonthNumber();
	const { start, end } = getMonthNumberToDate(nowMonth);
	useEffect(() => {
		setCurrentMonth(nowMonth);
		setStartingDate(start);
		setEndingDate(end);
	}, []);

	useEffect(() => {
		if (userId === "") return;
		if (currentMonth === "") return;
		setIsLoading(true);

		axios
			.get(
				`/jobApplication/past_interviews?hrId=${userId}&interviewField=${activeInterview}&month=${
					currentMonth.split("-")[1]
				}`
			)
			.then(({ data }) => {
				setInterviewData(data.data);
				setIsLoading(false);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, activeInterview, currentMonth, reload]);

	const ItemBox = ({ data }) => {
		return (
			<div
				className={styles.ItemBox}
				onClick={() => {
					dispatch(setType(activeInterview));
					dispatch(setInterviewPopup({ state: true, data: data }));
					dispatch(setSharePopup({ state: false, data: null }));
					dispatch(setRescheduledPopup({ state: false, data: null }));
				}}>
				<div className={styles.BoxTop}>
					<div className={styles.TopLeft}>
						<h1>{data?.jobId?.jobTittle}</h1>

						{/* <button>2 Days Left</button> */}
					</div>

					<div className={styles.TopRight}>
						<img src={data?.jobId?.companyLogo}></img>

						<p>{data?.jobId?.companyName}</p>
					</div>
				</div>

				<div className={styles.BoxBottom}>
					<div className={styles.BottomLeft}>
						<img src={data?.applicantId?.profileImage}></img>

						<div>
							<h1>{data?.applicantId?.name}</h1>

							<h2>{data?.applicantId?.profession}</h2>
						</div>
					</div>

					<div className={styles.BottomRight}>
						<div className={styles.RightSvg}>
							<OrangeCalender />
						</div>

						<p>{formatDate2(data?.interviewsDate)} </p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className={styles.Interviews}>
			<div className={styles.Content}>
				<div className={styles.Row1}>
					<div className={styles.Row1Left}>
						<button
							className={activeInterview === "interviews" ? styles.Active : ""}
							onClick={() => setActiveInterview("interviews")}>
							Interview <span>1</span>
						</button>

						<button
							className={activeInterview === "interviews2" ? styles.Active : ""}
							onClick={() => setActiveInterview("interviews2")}>
							Interview <span>2</span>
						</button>

						<button className={styles.Reload} onClick={() => dispatch(setReload())}>
							<TfiReload />
						</button>
					</div>

					<div className={styles.Row1Mid}>
						<p>{`${startingDate} to ${endingDate}`}</p>
					</div>

					<div className={styles.Row1Right}>
						<input
							type="month"
							value={currentMonth}
							onChange={(e) => {
								console.log(e.target.value);
								setCurrentMonth(e.target.value);
								const { start, end } = getMonthNumberToDate(e.target.value);
								setStartingDate(start);
								setEndingDate(end);
							}}
						/>
					</div>
				</div>

				{isLoading ? (
					<div className={styles.Loading}>
						<Loading height="10rem" width="10rem" />
					</div>
				) : (
					<>
						{interviewData.length === 0 && <h1 className={styles.noText}>No Interviews</h1>}
						<div className={styles.Row2}>
							{interviewData.map((data, index) => {
								return <ItemBox key={index} data={data} />;
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default InterviewsHistory;
