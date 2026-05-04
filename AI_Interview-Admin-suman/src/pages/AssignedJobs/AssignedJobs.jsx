import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Calender from "../../assets/svg/Calender.svg?react";
import Clock from "../../assets/svg/Clock.svg?react";
import Dollar from "../../assets/svg/Dollar.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import JobDone from "../../assets/svg/JobDone.svg?react";
import JobProgress from "../../assets/svg/JobProgress.svg?react";
import JobAssigned from "../../assets/svg/JobsAssigned.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Plus from "../../assets/svg/Plus.svg?react";
import Remote from "../../assets/svg/Remote.svg?react";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import Link from "../../assets/svg/Link.svg?react";
import AssignNewJobPopup from "./AssignNewJobPopup";
import styles from "./AssignedJobs.module.scss";

const AssignedJobs = () => {
	const navigate = useNavigate();
	const { userData } = useSelector((s) => s.auth);

	const [active, setActive] = useState("inProcess");
	const [serviceType, setServiceType] = useState("");
	const [assignJobPopup, setAssignJobPopup] = useState(false);
	const [jobsData, setJobsData] = useState([]);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoading2, setIsLoading2] = useState(false);
	const [noData, setNoData] = useState(false);
	const [reload, setReload] = useState(0)

	useEffect(() => {
		if (userData === null) return;
		setIsLoading(true);
		setNoData(false);
		setPage(1);

		axios
			.get(`/getJobHRdetails?adminId=${userData._id}&process=${active}&serviceType=${serviceType}&page=${page}&limit=20`)
			.then(({ data }) => {
				setIsLoading(false);
				setJobsData(data.data);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userData, active, serviceType, reload]);

	useEffect(() => {
		if (userData === null) return;
		if (page === 1) return;

		setNoData(false);
		setIsLoading2(true);
		axios
			.get(`/getJobHRdetails?adminId=${userData._id}&process=${active}&serviceType=${serviceType}&page=${page}&limit=20`)
			.then(({ data }) => {
				setJobsData((pre) => [...pre, ...data.data]);
				setIsLoading2(false);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [page]);

	return (
		<>
			{assignJobPopup && <AssignNewJobPopup {...{ setAssignJobPopup, setReload }} />}

			<div
				className={styles.AssignedJobs}
				onScroll={(e) => {
					if (e.target.scrollHeight - e.target.scrollTop - 1 <= e.target.clientHeight) setPage(page + 1);
				}}>
				<div className={styles.Row1}>
					<div className={styles.Col1}>
						<div className={styles.LeftSection}>
							<h3>Total jobs Assigned</h3>

							<div className={styles.Jobs}>
								<h4>{userData?.totalJobsAssigned}</h4>
								<p>jobs</p>
							</div>

							{/* <div className={styles.Bottom}>
								<div className={`${styles.Hike} ${styles.Down}`}>
									<p>12.6%</p>
									<Arrow />
								</div>

								<p>Since last week</p>
							</div> */}
						</div>

						<JobAssigned />
					</div>

					<div className={styles.Col2}>
						<div className={styles.LeftSection}>
							<h3>Jobs Done</h3>

							<div className={styles.Jobs}>
								<h4>{userData?.jobsDone}</h4>
								<p>jobs</p>
							</div>

							{/* <div className={styles.Bottom}>
								<div className={`${styles.Hike} `}>
									<p>12.6%</p>
									<Arrow />
								</div>
								<p>Since last week</p>
							</div> */}
						</div>

						<JobDone />
					</div>

					<div className={styles.Col3}>
						<div className={styles.LeftSection}>
							<h3>jobs In Progress</h3>

							<div className={styles.Jobs}>
								<h4>{userData?.jobsInProgress}</h4>
								<p>jobs</p>
							</div>

							{/* <div className={styles.Bottom}>
								<div className={`${styles.Hike} `}>
									<p>12.6%</p>
									<Arrow />
								</div>

								<p>Since last week</p>
							</div> */}
						</div>

						<JobProgress />
					</div>
				</div>

				<div className={styles.Row2}>
					<h2>Assigned jobs</h2>

					<div className={styles.Actions}>
						<div className={styles.Left}>
							<button
								className={active === "inProcess" ? styles.active : ""}
								onClick={() => setActive("inProcess")}>
								In Progress
							</button>

							<button
								className={active === "completed" ? styles.active : ""}
								onClick={() => setActive("completed")}>
								Completed
							</button>
						</div>

						<div className={styles.Right}>
							<div className={styles.Action}>
								<p
									className={`${serviceType === "Urgent" ? styles.Active : ""}`}
									onClick={() => {
										if (serviceType === "Urgent") setServiceType("");
										else setServiceType("Urgent");
									}}>
									Urgent
								</p>

								<p
									className={`${serviceType === "Premium" ? styles.Active : ""}`}
									onClick={() => {
										if (serviceType === "Premium") setServiceType("");
										else setServiceType("Premium");
									}}>
									Premium
								</p>

								<p
									className={`${serviceType === "Immediate" ? styles.Active : ""}`}
									onClick={() => {
										if (serviceType === "Immediate") setServiceType("");
										else setServiceType("Immediate");
									}}>
									Immediate
								</p>

								<p
									className={`${serviceType === "Contact Deal" ? styles.Active : ""}`}
									onClick={() => {
										if (serviceType === "Contact Deal") setServiceType("");
										else setServiceType("Contact Deal");
									}}>
									Contact Deal
								</p>
							</div>

							<div className={styles.Assign} onClick={() => setAssignJobPopup(true)}>
								<Plus />
								<p>Assign New Jobs</p>
							</div>
						</div>
					</div>

					{isLoading ? (
						<Loading height="10rem" width="10rem" />
					) : (
						<>
							<div className={styles.Cards}>
								{jobsData.map((data, index) => {
									const givenDate = new Date(data.updatedAt);
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
																	.writeText(
																		`https://www.hiringroof.com/job-card?id=${data._id}`
																	)
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
													<p>{`${days > 0 ? days + "d" : ""} ${
														hours % 24 > 0 ? (hours % 24) + "h" : ""
													} ${days > 0 ? "" : (minutes % 60) + "m"}`}</p>
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
													<p>
														Meetings Done :{" "}{console.log(data)}
														{` ${data?.totalSelectedCandidates}/${data?.applicationCount}`}
													</p>
													<div className={styles.Line}>
														<div
															className={styles.Progress}
															style={{
																width: `${
																	(data?.totalSelectedCandidates /
																		data?.applicationCount) *
																	100
																}%`,
															}}></div>
													</div>
												</div>

												<div className={styles.Right}>
													<h3>Appliers</h3>

													<div className={styles.Appliers}>
														<div className={styles.ImageWrapper}>
															{data?.profileImages.map((img, index) => (
																<div className={styles.img} key={index}>
																	<img src={img} alt="" />
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
								{isLoading2 && <Loading height="3rem" width="3rem" />}

								{noData && "No data"}
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default AssignedJobs;
