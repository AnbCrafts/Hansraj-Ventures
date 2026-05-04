import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Search from "../../assets/icons/Search.svg?react";
import Calender from "../../assets/svg/Calender.svg?react";
import Clock from "../../assets/svg/Clock.svg?react";
import Dollar from "../../assets/svg/Dollar.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import Location from "../../assets/svg/Location.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Remote from "../../assets/svg/Remote.svg?react";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import styles from "./AssignNewJobPopup.module.scss";

const AssignNewJobPopup = ({ setAssignJobPopup, setReload }) => {
	const { userId } = useSelector((s) => s.auth);
	const [searchText, setSearchText] = useState("");
	const [location, setLocation] = useState("");
	const [serviceType, setServiceType] = useState("");
	const [jobData, setJobData] = useState([]);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [isAssigned, setIsAssigned] = useState(false);
	const [selectedJobIds, setSelectedJobIds] = useState([]);
	const [noData, setNoData] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		setSelectedJobIds([]);
		setNoData(false);

		axios
			.get(`/getUnassignedJobs?serviceType=${serviceType}&jobTitle=${""}&location=${""}&page=${page}`)
			.then(({ data }) => {
				setIsLoading(false);
				setJobData((pre) => [...pre, ...data.data]);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [serviceType, page]);

	const handelSearch = () => {
		setLocation("");
		setSearchText("");
	};

	const handelSelection = (data) => {
		const temp = [...selectedJobIds];

		if (!temp.includes(data._id)) temp.push(data._id);
		else {
			const index = temp.indexOf(data._id);
			temp.splice(index, 1);
		}

		setSelectedJobIds(temp);
	};

	const handelAssign = () => {
		setIsAssigned(true);
		const date = new Date();
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		const raw = {
			year: String(date.getFullYear()),
			month: monthNames[date.getMonth()],
			userId,
			jobIds: selectedJobIds,
		};

		axios
			.put(`/adminUser/assign-job`, raw)
			.then(({ data }) => {
				console.log(data)
				setSelectedJobIds([]);
				setIsAssigned(false);
				setAssignJobPopup(false);
				setReload(Math.random());
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
				setIsAssigned(false);
			});
	};

	return (
		<div className={styles.PopupBackground} onClick={() => setAssignJobPopup(false)}>
			<div
				className={styles.PopWrapper}
				onClick={(e) => e.stopPropagation()}
				onScroll={(e) => {
					if (e.target.scrollHeight - e.target.scrollTop - 1 <= e.target.clientHeight) setPage(page + 1);
				}}>
				<h2>
					Assign New <span>Jobs</span>
				</h2>

				<div className={styles.ButtonWrapper}>
					<button onClick={() => setAssignJobPopup(false)}>Back</button>
				</div>

				<div className={styles.Row1}>
					<div className={styles.InputWrapper}>
						<Search />
						<input
							type="search"
							placeholder="Search For Jobs Here"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</div>

					<div className={styles.InputWrapper}>
						<Map />
						<input
							type="search"
							placeholder="Search By Location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>
					</div>

					<div className={styles.SearchButton} onClick={handelSearch}>
						<Search />
					</div>
				</div>

				<div className={styles.Row2}>
					<p>{searchText}</p>

					{location && (
						<>
							<Location />
							<p>{location}</p>
						</>
					)}
				</div>

				<div className={styles.Row3}>
					<div className={styles.Top}>
						<div className={styles.Buttons}>
							<button
								className={serviceType === "Urgent" ? styles.active : ""}
								onClick={() => {
									setServiceType("Urgent");
									setJobData([]);
									setPage(1);
								}}>
								Urgent
							</button>

							<button
								className={serviceType === "Premium" ? styles.active : ""}
								onClick={() => {
									setServiceType("Premium");
									setJobData([]);
									setPage(1);
								}}>
								Premium
							</button>

							<button
								className={serviceType === "Immediate" ? styles.active : ""}
								onClick={() => {
									setServiceType("Immediate");
									setJobData([]);
									setPage(1);
								}}>
								Immediate
							</button>

							<button
								className={serviceType === "Contact Deal" ? styles.active : ""}
								onClick={() => {
									setServiceType("Contact Deal");
									setJobData([]);
									setPage(1);
								}}>
								Contact Deal
							</button>
						</div>

						<div className={styles.Right}>
							<p>{selectedJobIds.length} Selected</p>

							<button onClick={handelAssign} disabled={selectedJobIds.length === 0 || isAssigned}>
								{isAssigned ? <Loading height="2rem" width="2rem" /> : "Confirm & Assign"}
							</button>
						</div>
					</div>

					<div className={styles.Cards}>
						{jobData.map((data, index) => {
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
									className={`${styles.Card} ${selectedJobIds.includes(data._id) ? styles.Selected : ""}`}
									onClick={() => handelSelection(data)}>
									<img src={data?.companyLogo} alt="companyLogo" />

									<div className={styles.Details}>
										<div className={styles.Line1}>
											<div className={styles.Profile}>
												<h3>{data?.companyName}</h3>
												<p>{data?.jobTittle}</p>
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
												<span>Job Details :</span>{" "}
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

										{/* <div className={styles.Line6}>
												<button>Assigned</button>
												<div>
													<h3>Appliers</h3>
													<div className={styles.Appliers}>
														<div className={styles.ImageWrapper}>
															<div className={styles.img}>
																<img src={"https://picsum.photos/100/100 "} alt="" />
															</div>
															<div className={styles.img}>
																<img src={"https://picsum.photos/100/100 "} alt="" />
															</div>
															<div className={styles.img}>
																<img src={"https://picsum.photos/100/100 "} alt="" />
															</div>
															<div className={styles.img}>
																<img src={"https://picsum.photos/100/100 "} alt="" />
															</div>
														</div>
														<p>1500</p>
													</div>
												</div>
											</div> */}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className={styles.Row4}>
					{isLoading && <Loading height="4rem" width="4rem" />} {noData && <h4>No more jobs</h4>}
				</div>
			</div>
		</div>
	);
};

export default AssignNewJobPopup;
