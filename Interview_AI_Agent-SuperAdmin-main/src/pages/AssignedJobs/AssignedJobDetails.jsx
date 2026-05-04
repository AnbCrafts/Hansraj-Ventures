import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Calender from "../../assets/svg/Calender.svg?react";
import Clock from "../../assets/svg/ClockGrey.svg?react";
import Dollar from "../../assets/svg/Dollar.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import Filter from "../../assets/svg/Filter.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import More from "../../assets/svg/More.svg?react";
import Remote from "../../assets/svg/Remote.svg?react";
import SchInterview from "../../assets/svg/SchInterview.svg?react";
import { formatDate } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setJobSeeker } from "../../redux/slices/popupSlice";
import styles from "./AssignedJobDetails.module.scss";
import AssignedJobUser from "./AssignedJobUser";
import BulkUpload from "./BulkUpload";
import SingleUpload from "./SingleUpload";

function AssignedJobDetails() {
	const dispatch = useDispatch();
	const id = useLocation()?.search?.split("?id=")[1];
	const { userData } = useSelector((s) => s.auth);

	const [assignedJobUser, setAssignedJobUser] = useState(false);
	const [jobsData, setJobsData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const [openSingleUploadPopup, setOpenSingleUploadPopup] = useState(false);
	const [openBulkUploadPopup, setOpenBulkUploadPopup] = useState(false);
	const { reloadAssignedJob } = useSelector((state) => state.assignedJob);

	useEffect(() => {
		if (userData === null) return;
		setIsLoading(true);

		axios
			.get(`/adminUser/getJobApplicationsHRdetails/${id}`)
			.then(({ data }) => {
				setIsLoading(false);
				setJobsData(data.data);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userData, reloadAssignedJob]);

	const givenDate = new Date(jobsData?.job?.updatedAt);
	const currentDate = new Date();
	const timeDifference = currentDate - givenDate;
	const seconds = Math.floor(timeDifference / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	return (
		<div className={styles.Container}>
			{assignedJobUser && <AssignedJobUser {...{ setAssignedJobUser }} />}

			{openSingleUploadPopup && <SingleUpload {...{ setOpenSingleUploadPopup, jobsData }} />}
			{openBulkUploadPopup && <BulkUpload {...{ setOpenBulkUploadPopup, jobsData }} />}

			<div className={styles.Container1}>
				<div className={styles.ManualUpload}>
					<p>Manual Candidate Assign</p>
					<button onClick={() => setOpenSingleUploadPopup(true)}>Single Upload</button>
					<button onClick={() => setOpenBulkUploadPopup(true)}>Bulk Upload</button>
				</div>
				<div className={styles.JobData}>
					<div className={styles.Container1Left}>
						<div className={styles.Line1}>
							<div className={styles.Profile}>
								<img src={jobsData?.job?.companyLogo} alt="companyLogo" />

								<div className={styles.Details}>
									<h3>{jobsData?.job?.companyName}</h3>
									<p>{jobsData?.job?.jobTittle}</p>
								</div>
							</div>
						</div>

						<div className={styles.Line2}>
							<div className={styles.Wrapper}>
								<Map />
								<p>{jobsData?.job?.location}</p>
							</div>

							<span>
								<Dot />
							</span>

							<div className={styles.Wrapper}>
								<Dollar />
								<p>{jobsData?.job?.pay}</p>
							</div>

							<span>
								<Dot />
							</span>

							<div className={styles.Wrapper}>
								<Remote />
								<p>
									{jobsData?.job?.jobType === "wfh" && "Remote"} {jobsData?.job?.jobType === "wfo" && "Office"}
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
								<p>{jobsData?.job?.experience}</p>
							</div>
						</div>

						<div className={styles.Line3}>
							<button>{jobsData?.job?.timePeriod}</button>
							{jobsData?.job?.availability && (
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
								<span>Job Details : </span> {jobsData?.job?.note}
							</p>
						</div>

						<div className={styles.Line5}>
							<p>
								<span>Skills : </span>
								{Array.isArray(jobsData?.job?.skills) ? jobsData?.job?.skills?.join(", ") : jobsData?.job?.skills}
							</p>
						</div>
					</div>

					<div className={styles.Container1Right}>
						<div className={styles.Container1RightTop}>
							<div className={styles.Col1}>
								<div className={styles.SVG}>
									<SchInterview />
								</div>

								<div className={styles.LeftSection}>
									<h3>Interview scheduled</h3>

									<div className={styles.Jobs}>
										<h4>{jobsData?.interviewScheduled}</h4>
									</div>

									{/* <div className={styles.Bottom}>
									<div className={`${styles.Hike} ${styles.Down}`}>
										<p>25.4%</p>
										<Arrow />
									</div>
									<p>Since last week</p>
								</div> */}
								</div>
							</div>

							<div className={styles.Col2}>
								<div className={styles.SVG}>
									<SchInterview />
								</div>

								<div className={styles.LeftSection}>
									<h3>Interview Taken</h3>

									<div className={styles.Jobs}>
										<h4>{jobsData?.interviewTaken}</h4>
									</div>

									{/* <div className={styles.Bottom}>
									<div className={`${styles.Hike} ${styles.Down}`}>
										<p>25.4%</p>
										<Arrow />
									</div>
									<p>Since last week</p>
								</div> */}
								</div>
							</div>

							<div className={styles.Col3}>
								<div className={styles.SVG}>
									<SchInterview />
								</div>

								<div className={styles.LeftSection}>
									<h3>Total Hired</h3>

									<div className={styles.Jobs}>
										<h4>{jobsData?.totalSelectedCandidates}</h4>
									</div>

									{/* <div className={styles.Bottom}>
									<div className={`${styles.Hike} ${styles.Down}`}>
										<p>25.4%</p>
										<Arrow />
									</div>
									<p>Since last week</p>
								</div> */}
								</div>
							</div>
						</div>

						<div className={styles.Container1RightBottom}>
							<div className={styles.Left}>
								<p>
									Meetings Done : {jobsData?.totalSelectedCandidates} / {jobsData?.totalCandidatesApplied}
								</p>
								<div className={styles.Line}>
									<div
										className={styles.Progress}
										style={{
											width: `${(jobsData?.totalSelectedCandidates / jobsData?.totalCandidatesApplied) * 100}%`,
										}}></div>
								</div>
							</div>

							<div className={styles.Right}>
								<h3>Appliers</h3>

								<div className={styles.Appliers}>
									<div className={styles.ImageWrapper}>
										{jobsData?.candidates?.slice(0, 4)?.map((data, index) => (
											<div key={index} className={styles.img}>
												<img src={data?.profileImage} alt="profileImage" />
											</div>
										))}
									</div>

									<p>{jobsData?.totalCandidatesApplied}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.Container2}>
				<div className={styles.Container2Top}>
					<p>Applied Candidates </p>

					<div className={styles.Filters}>
						<p>Filter</p>
						<Filter />
					</div>
				</div>

				<div className={styles.Container2Bottom}>
					<div className={styles.subHeading}>
						<p>User name</p>
						<p>USER ID</p>
						<p>Email</p>
						<p>Registered Date</p>
						<p>Location</p>
						<p>MOBILE NUMBER</p>
						<p>PROFESSION</p>
						<p>More</p>
					</div>

					<div className={styles.Body}>
						{isLoading ? (
							<Loading height="5rem" width="5rem" />
						) : (
							jobsData?.candidates?.map((data, index) => {
								return (
									<div
										key={index}
										className={styles.Box}
										onClick={() => dispatch(setJobSeeker({ isActive: true, activeData: data }))}>
										<div>
											<div className={styles.Image}>
												<img src={data?.profileImage} alt="profileImage" />
												<p>{data?.name ? data?.name : "No data"}</p>
											</div>
										</div>

										<div>{data?._id}</div>
										<div>{data?.email ? data?.email : "No data"}</div>
										<div>{formatDate(data?.createdAt)}</div>
										<div>{data?.location ? data?.location : "No data"}</div>
										<div>{data?.phone ? data?.phone : "No data"}</div>
										<div>{data?.profession ? data?.profession : "No data"}</div>

										<div>
											<div className={styles.dropDown}>
												<span className={styles.Three}>
													<More />
												</span>
											</div>
										</div>
									</div>
								);
							})
						)}
						;
					</div>
				</div>
			</div>
		</div>
	);
}

export default AssignedJobDetails;
