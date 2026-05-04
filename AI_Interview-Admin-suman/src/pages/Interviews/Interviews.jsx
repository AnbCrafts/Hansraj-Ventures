import React, { useEffect, useState } from "react";
import { TfiReload } from "react-icons/tfi";
import { useDispatch, useSelector } from "react-redux";
import OrangeCalender from "../../assets/svg/OrangeCalender.svg?react";
import { formatDate2, getAllDays, getWeekNumber, getWeekNumberToDate } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setInterviewPopup, setReload, setRescheduledPopup, setSharePopup, setType } from "../../redux/slices/popupSlice";
import styles from "./Interviews.module.scss";
 
const Interviews = () => {
	const dispatch = useDispatch();
	const { userId } = useSelector((s) => s.auth);
	const { reload } = useSelector((s) => s.popup);

	const [activeInterview, setActiveInterview] = useState("interviews");
	const [currentWeek, setCurrentWeek] = useState("");
	const [startingDate, setStartingDate] = useState("");
	const [endingDate, setEndingDate] = useState("");
	const [days, setDays] = useState({
		mon: "",
		tue: "",
		wed: "",
		thu: "",
		fri: "",
		sat: "",
		monFull: "",
		tueFull: "",
		wedFull: "",
		thuFull: "",
		friFull: "",
		satFull: "",
	});
	const [interviewData, setInterviewData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const nowWeek = getWeekNumber();
	console.log(nowWeek)
	const { start, end } = getWeekNumberToDate(nowWeek);
	console.log(start,end)
	useEffect(() => {
		setCurrentWeek(nowWeek);
		setStartingDate(start);
		setEndingDate(end);
		setDays(getAllDays(nowWeek));
	}, []);
	console.log(days)
	useEffect(() => {
		if (userId === "") return;
		if (currentWeek === "") return;
		setIsLoading(true);
		console.log(startingDate,endingDate,userId,activeInterview)

		axios
			.get(
				`/jobApplication/interviews?startDate=${startingDate}&endDate=${endingDate}&hrId=${userId}&interviewField=${activeInterview}`
			)
			.then(({ data }) => {
				setInterviewData(data.data);
				setIsLoading(false);
				console.log(data)
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, activeInterview, currentWeek, reload]);

	const ItemBox = ({ currentData }) => {
		return (
			<div
				className={styles.ItemBox}
				onClick={() => {
					dispatch(setType(activeInterview));
					dispatch(setInterviewPopup({ state: true, data: currentData }));
					dispatch(setSharePopup({ state: false, data: null }));
					dispatch(setRescheduledPopup({ state: false, data: null }));
				}}>
				<div className={styles.BoxTop}>
					<div className={styles.TopLeft}>
						<h1>{currentData?.jobId?.jobTittle}</h1>
					</div>

					<div className={styles.TopRight}>
						<img src={currentData?.jobId?.companyLogo}></img>
						<p>{currentData?.jobId?.companyName}</p>
					</div>
				</div>

				<div className={styles.BoxBottom}>
					<div className={styles.BottomLeft}>
						<img src={currentData?.applicantId?.profileImage}></img>

						<div>
							<h1>{currentData?.applicantId?.name}</h1>
							<h2>{currentData?.applicantId?.profession}</h2>
						</div>
					</div>

					{currentData?.temp && (
						<div className={styles.BottomRight}>
							<div className={styles.RightSvg}>
								<OrangeCalender />
							</div>

							<p>{formatDate2(currentData?.temp?.newDate)}</p>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className={styles.Interviews}>
			<div className={styles.Content}>
				<div className={styles.Row1}>
					{/* <div className={styles.Row1Left}>
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
					</div> */}

					<div className={styles.Row1Mid}>
						<p>
							{`${startingDate.split("-")[2]}-${startingDate.split("-")[1]}-${startingDate.split("-")[0]} to ${
								endingDate.split("-")[2]
							}-${endingDate.split("-")[1]}-${endingDate.split("-")[0]}`}
						</p>
					</div>

					<div className={styles.Row1Right}>
						<input
							type="week"
							value={currentWeek}
							onChange={(e) => {
								setCurrentWeek(e.target.value);
								const { start, end } = getWeekNumberToDate(e.target.value);
								setStartingDate(start);
								setEndingDate(end);
								setDays(getAllDays(e.target.value));
							}}
						/>
					</div>
				</div>

				<div className={styles.Row2}>
					<div className={styles.DayRow}>
						<div className={styles.gridDay}></div>

						<div className={styles.gridDay}>
							<h1> Monday {days.mon} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>

						<div className={styles.gridDay}>
							<h1> Tuesday {days.tue} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>

						<div className={styles.gridDay}>
							<h1> Wednesday {days.wed} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>

						<div className={styles.gridDay}>
							<h1> Thursday {days.thu} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>

						<div className={styles.gridDay}>
							<h1> Friday {days.fri} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>

						<div className={styles.gridDay}>
							<h1> Saturday {days.sat} </h1>
							<h2>{activeInterview === "interview" ? "Interview 1" : "Interview 2"}</h2>
						</div>
					</div>

					{isLoading ? (
						<div className={styles.Loading}>
							<Loading height="10rem" width="10rem" />
						</div>
					) : (
						<>
							{interviewData.length === 0 && <h1 className={styles.noText}>No Interviews</h1>}
							<div className={styles.ContentWrapper}>
								{interviewData.map((data, index) => {
									return (
										<div key={index} className={styles.ContentRow}>
											<div className={styles.TimeGrid}>
												<p>{data?.interviewsTime}</p>
											</div>
											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.monFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>

											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.tueFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>

											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.wedFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>

											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.thuFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>

											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.friFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>

											<div className={styles.gridItem}>
												{data?.days_data?.interviewsDate === days?.satFull &&
													data?.days_data?.jobLists.map((item, i) => (
														<ItemBox key={i} currentData={item} />
													))}
											</div>
										</div>
									);
								})}
							</div>
							)
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Interviews;
