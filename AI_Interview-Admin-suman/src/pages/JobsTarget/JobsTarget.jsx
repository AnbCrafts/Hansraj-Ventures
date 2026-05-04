import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CircleRoundCheck from "../../assets/icons/CircleRoundCheck.svg?react";
import TargetIcon from "../../assets/icons/TargetIcon.svg?react";
import Calender from "../../assets/svg/Calender.svg?react";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setJobTarge } from "../../redux/slices/popupSlice";
import styles from "./JobsTarget.module.scss";

const JobsTarget = () => {
	const dispatch = useDispatch();
	const { userId } = useSelector((s) => s.auth);
	const monthLongNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const [year, setYear] = useState("");
	const [month, setMonth] = useState("");
	const [filterYear, setFilterYear] = useState("");
	const [currentData, setCurrentData] = useState([]);
	const [otherData, setOtherData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const date = new Date();
		setYear(date.getFullYear());
		setMonth(date.getMonth());
		setFilterYear(date.getFullYear());
	}, []);

	useEffect(() => {
		if (userId === "") return;
		if (year === "") return;

		axios
			.get(`/jobApplication/getJobTargetsByMonthAndYear?hrId=${userId}&month=${monthShortNames[month]}&year=${year}`)
			.then(({ data }) => {
				setCurrentData(data.data);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, year]);

	useEffect(() => {
		if (userId === "") return;
		if (filterYear === "") return;
		setIsLoading(true);

		axios
			.get(
				`/jobApplication/getJobTargetsByMonthAndYear?hrId=${userId}&month=${monthShortNames[month]}&year=${year}&filterYear=${filterYear}`
			)
			.then(({ data }) => {
				setIsLoading(false);
				setOtherData(data.newData);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, filterYear]);

	return (
		<div className={styles.JobsTarget}>
			<div className={styles.TopWrapper}>
				<h2>This Month Job Target</h2>

				<div className={styles.BoxWrapper}>
					<div className={styles.Row1}>
						<Calender />
						<h2>
							{year} , {monthLongNames[month]}
						</h2>
						<span>Target</span>
					</div>

					<div className={styles.Row2}>
						{/* <div className={styles.progress} style={{ width: "80%" }}></div> */}
						<div
							className={styles.done}
							style={{ width: `${(currentData?.jobsDone / currentData?.jobsTarget) * 100}%` }}></div>
					</div>

					<div className={styles.Row3}>
						<div className={styles.Left}>
							<div>
								<h3>{currentData?.jobsDone}</h3>
								<h4>Jobs Done</h4>
								<CircleRoundCheck />
							</div>

							<div>
								<h3>{currentData?.jobsTarget}</h3>
								<h4>Target</h4>
								<TargetIcon />
							</div>
						</div>

						<button
							className={styles.Right}
							onClick={() => dispatch(setJobTarge({ state: true, data: currentData }))}>
							View Jobs
						</button>
					</div>
				</div>
			</div>

			<div className={styles.BottomWrapper}>
				<div className={styles.Top}>
					<h2>Previous Month Job Target</h2>

					<input type="month" value={`${year}-01`} onChange={(e) => setFilterYear(e.target.value.split("-")[0])} />
				</div>

				{isLoading ? (
					<div>
						<Loading height="5rem" width="5rem" />
					</div>
				) : (
					<>
						{otherData.length === 0 && <h3 className={styles.NoData}>No data</h3>}

						<div className={styles.GridWrapper}>
							{otherData.map((data, index) => {
								return (
									<div key={index} className={styles.BoxWrapper}>
										<div className={styles.Row1}>
											<Calender />
											<h2>
												{data?.year} , {data?.month}
											</h2>
											<span>Target</span>
										</div>

										<div className={styles.Row2}>
											{/* <div className={styles.progress} style={{ width: "80%" }}></div> */}
											<div
												className={styles.done}
												style={{
													width: `${(data?.jobsDone / data?.jobsTarget) * 100}%`,
												}}></div>
										</div>

										<div className={styles.Row3}>
											<div className={styles.Left}>
												<div>
													<h3>{data?.jobsDone}</h3>
													<h4>Jobs Done</h4>
													<CircleRoundCheck />
												</div>

												<div>
													<h3>{data?.jobsTarget}</h3>
													<h4>Target</h4>
													<TargetIcon />
												</div>
											</div>

											<button
												className={styles.Right}
												onClick={() => dispatch(setJobTarge({ state: true, data: data }))}>
												View Jobs
											</button>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default JobsTarget;
