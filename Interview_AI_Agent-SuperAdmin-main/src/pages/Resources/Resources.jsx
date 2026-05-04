import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Filter from "../../assets/svg/Filter.svg?react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import ThreeDot from "../../assets/svg/ThreeDot.svg?react";
import { formatDate } from "../../components/Functions/dateFormate";
import axios from "../../components/Hooks/axios";
import Loading from "../../components/Hooks/Loading";
import ResourceDetails from "./ResourceDetails";
import styles from "./Resources.module.scss";

const Resources = () => {
	const [loading, setLoading] = useState(false);
	const [totalPage, setTotalPage] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [openResourceDetails, setOpenResourceDetails] = useState(false);
	const [resources, setResources] = useState([]);
	const [openedResource, setOpenedResource] = useState({});

	useEffect(() => {
		setLoading(true);
		axios
			.get(`/admin/resources`)
			.then(({ data }) => {
				setResources(data?.resources);
			})
			.catch((e) => {
				toast.error(e?.response?.data?.message || "Error getting added resources...");
			})
			.finally(() => setLoading(false));
	}, []);

	const handleOpenResourceDetails = (data) => {
		setOpenResourceDetails(true);
		setOpenedResource(data);
	};
	return (
		<>
			{openResourceDetails && <ResourceDetails {...{ setOpenResourceDetails, openedResource }} />}
			<div className={styles.Resources}>
				<div className={styles.Top}>
					<div className={styles.Buttons}></div>

					<div className={styles.Filters}>
						<p>Filter</p>
						<Filter />
					</div>
				</div>

				<div className={styles.Bottom}>
					<div className={styles.subHeading}>
						<p>S no</p>
						<p>Job Title</p>
						<p>Company Name</p>
						<p>Company Location</p>
						<p>Enrolled On</p>
						<p>Resume Enrolled</p>
						<p>More</p>
					</div>

					{loading ? (
						<Loading height="10rem" width="10rem" />
					) : (
						<div className={styles.UserCards}>
							{4 === 0 ? (
								<h1>No User's</h1>
							) : (
								resources?.map((data, index) => {
									return (
										<div className={styles.Card} key={index}>
											<div>{index + 1}</div>
											<div>{data?.jobId?.jobTittle}</div>
											<div>{data?.jobId?.companyName}</div>
											<div>{data?.jobId?.location}</div>
											<div>{formatDate(data?.createdAt)}</div>
											<div>{data?.applicationData?.length}</div>
											<div className={styles.More} onClick={() => handleOpenResourceDetails(data)}>
												<span>
													<ThreeDot />
												</span>
											</div>
										</div>
									);
								})
							)}
						</div>
					)}
				</div>

				<div className={styles.pagination}>
					<div className={styles.records}>Showing 1 to 100 users in {2} page</div>

					<div className={styles.pageButtons}>
						<button className={styles.leftArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
							<LeftArrow />
						</button>

						<div className={styles.pages}>
							{Array(totalPage)
								.fill("")
								.slice(0, 5)
								.map((data, index) => {
									return (
										<div className={`${styles.buttons} ${currentPage === index + 1 ? styles.active : ""}`} key={index}>
											0{index + 1}
										</div>
									);
								})}
						</div>

						<button
							className={styles.rightArrow}
							disabled={currentPage === totalPage}
							onClick={() => setCurrentPage(currentPage + 1)}>
							<RightArrow />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Resources;
