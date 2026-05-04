import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CircleRoundCheck from "../../assets/icons/CircleRoundCheck.svg?react";
import TargetIcon from "../../assets/icons/TargetIcon.svg?react";
import Calender from "../../assets/svg/Calender.svg?react";
import Clock from "../../assets/svg/Clock.svg?react";
import Dollar from "../../assets/svg/Dollar.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import Link from "../../assets/svg/Link.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Remote from "../../assets/svg/Remote.svg?react";
import { setJobTarge } from "../../redux/slices/popupSlice";
import Loading from "../Hooks/Loading";
import axios from "../Hooks/axios";
import styles from "./JobTargetPopup.module.scss";

const JobTargetPopup = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { jobTargetPopup, jobTargetData } = useSelector((s) => s.popup);
	const { userId } = useSelector((s) => s.auth);

	const [activeFilter, setActiveFilter] = useState("inProcess");
	const [jobsData, setJobsData] = useState([]);
	const [noData, setNoData] = useState(false);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [reload, setReload] = useState(0);

	useEffect(() => {
		if (userId === "") return;
		if (jobTargetData === null) return;
		setIsLoading(true);
		setNoData(false);
		setPage(1);
		setJobsData([]);

		axios
			.get(
				`/jobApplication/getMonthJobHR?adminId=${userId}&process=${activeFilter}&serviceType=&monthId=${jobTargetData._id}&page=${page}`
			)
			.then(({ data }) => {
				setIsLoading(false);
				setJobsData(data.data);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, jobTargetData, activeFilter, reload]);

	useEffect(() => {
		if (userId === null) return;
		if (jobTargetData === null) return;
		setIsLoading(true);
		setNoData(false);

		axios
			.get(
				`/jobApplication/getMonthJobHR?adminId=${userId}&process=${activeFilter}&serviceType=&monthId=${jobTargetData._id}&page=${page}`
			)
			.then(({ data }) => {
				setIsLoading(false);
				setJobsData((pre) => [...pre, ...data.data]);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [page]);

	return (
		<div
			className={`${styles.JobTargetPopupWrapper} ${jobTargetPopup ? styles.active : ""}`}
			onClick={() => dispatch(setJobTarge({ state: false, data: null }))}>
			<div
				className={styles.JobTargetPopup}
				onClick={(e) => e.stopPropagation()}
				onScroll={(e) => {
					if (e.target.scrollHeight - e.target.scrollTop - 1 <= e.target.clientHeight) setPage(page + 1);
				}}>
				<div className={styles.Row1}>
					<h2>This Month Job Target</h2>

					<button onClick={() => dispatch(setJobTarge({ state: false, data: null }))}>Back</button>
				</div>

				<div className={styles.Row2}>
					<div className={styles.InnerRow1}>
						<Calender />
						<h2>
							{jobTargetData?.year} , {jobTargetData?.month}
						</h2>
						<span>Target</span>
					</div>

					<div className={styles.InnerRow2}>
						{/* <div className={styles.progress} style={{ width: "80%" }}></div> */}
						<div
							className={styles.done}
							style={{ width: `${(jobTargetData?.jobsDone / jobTargetData?.jobsTarget) * 100}%` }}></div>
					</div>

					<div className={styles.InnerRow3}>
						<div className={styles.Left}>
							<div>
								<h3>{jobTargetData?.jobsDone}</h3>
								<h4>Jobs Done</h4>
								<CircleRoundCheck />
							</div>

							<div>
								<h3>{jobTargetData?.jobsTarget}</h3>
								<h4>Target</h4>
								<TargetIcon />
							</div>
						</div>
					</div>
				</div>

				<div className={styles.Row3}>
					<button
						className={activeFilter === "inProcess" ? styles.active : ""}
						onClick={() => setActiveFilter("inProcess")}>
						In Process
					</button>
					<button
						className={activeFilter === "completed" ? styles.active : ""}
						onClick={() => setActiveFilter("completed")}>
						Completed
					</button>
				</div>

				<div className={styles.Row4}>
					{jobsData.map((data, index) => {
						const givenDate = new Date(data?.updatedAt);
						const currentDate = new Date();
						const timeDifference = currentDate - givenDate;
						const seconds = Math.floor(timeDifference / 1000);
						const minutes = Math.floor(seconds / 60);
						const hours = Math.floor(minutes / 60);
						const days = Math.floor(hours / 24);

						return (
							<div
								key={index}
								className={styles.Card}
								onClick={() => navigate(`/assigned-job-details?id=${data?._id}`)}>
								<div className={styles.Line1}>
									<div className={styles.Profile}>
										<img src={data?.companyLogo} alt="CompanyLogo" />

										<div className={styles.Details}>
											<h3>{data?.companyName}</h3>
											<p>{data?.jobTittle}</p>
										</div>
									</div>

									<div className={styles.Progress}>
										<p>In Progress</p>
									</div>

									<div className={styles.Link}>
										<Link />

										<div className={styles.dropdownContent} onClick={(e) => e.stopPropagation()}>
											<p>{`https://www.hiringroof.com/job-card?id=${data._id}`}</p>
											<button
												onClick={() => {
													navigator.clipboard
														.writeText(`https://www.hiringroof.com/job-card?id=${data._id}`)
														.then(() => {
															toast.success("Job id copy to clipboard");
														})
														.catch((error) => {
															toast.error("Error copying text to clipboard");
														});
												}}>
												Copy id
											</button>
										</div>
									</div>
								</div>

								<div className={styles.Line2}>
									<div className={styles.Wrapper}>
										<Map />
										<p>{data?.location}</p>
									</div>

									<span>
										<Dot />
									</span>

									<div className={styles.Wrapper}>
										<Dollar />
										<p>{data?.pay}</p>
									</div>

									<span>
										<Dot />
									</span>

									<div className={styles.Wrapper}>
										<Remote />
										<p>
											{data?.jobType === "wfh" && "Remote"}
											{data?.jobType === "wfo" && "Office"}
										</p>
									</div>

									<span>
										<Dot />
									</span>

									<div className={styles.Wrapper}>
										<Calender />
										<p>{`${days > 0 ? days + "d" : ""} ${hours % 24 > 0 ? (hours % 24) + "h" : ""} ${
											days > 0 ? "" : (minutes % 60) + "m"
										}`}</p>
									</div>

									<span>
										<Dot />
									</span>

									<div className={styles.Wrapper}>
										<Clock />
										<p>{data?.experience}</p>
									</div>
								</div>

								<div className={styles.Line3}>
									<button>{data?.timePeriod}</button>
									{data?.availability && (
										<>
											<span>
												<Dot />
											</span>
											<button>Immediate</button>
										</>
									)}
								</div>

								<div className={styles.Line4}>
									<p>
										<span>Job Details : </span>{" "}
										{data?.note?.length < 120 ? data?.note : data?.note?.slice(0, 120) + "..."}
									</p>
								</div>

								<div className={styles.Line5}>
									<p>
										<span>Skills : </span>
										{Array.isArray(data?.skills)
											? data?.skills?.length < 6
												? data?.skills?.join(", ")
												: data?.skills?.slice(0, 6).join(", ") + "..."
											: data?.skills}
									</p>
								</div>

								<div className={styles.Line6}>
									<div className={styles.Left}>
										<p>Meetings Done : {` ${data?.totalSelectedCandidates}/${data?.interviewTaken}`}</p>
										<div className={styles.Line}>
											<div
												className={styles.Progress}
												style={{
													width: `${(data?.totalSelectedCandidates / data?.interviewTaken) * 100}%`,
												}}></div>
										</div>
									</div>

									<div className={styles.Right}>
										<h3>Appliers</h3>

										<div className={styles.Appliers}>
											<div className={styles.ImageWrapper}>
												{data?.profileImages.map((p, i) => (
													<div className={styles.img} key={i}>
														<img src={p} alt="" />
													</div>
												))}
											</div>

											<p>{data?.applicationCount}</p>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className={styles.noText}>
					{isLoading && <Loading height="3rem" width="3rem" />}

					{noData && "No data"}
				</div>
			</div>
		</div>
	);
};

export default JobTargetPopup;
