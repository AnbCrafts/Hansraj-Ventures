import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../../../components/Hooks/Loading";
import axios from "../../../components/Hooks/axios";
import { setReload } from "../../../redux/slices/popupSlice";
import styles from "./Tab2.module.scss";

const Tab2 = ({ activeSection, page, noData, setNoData }) => {
	const dispatch = useDispatch();
	const { userId } = useSelector((s) => s.auth);
	const { reload } = useSelector((s) => s.popup);

	const [isLoading, setIsLoading] = useState(false);
	const [fetchData, setFetchData] = useState([]);
	const [btnLoading, setBtnLoading] = useState(false);

	useEffect(() => {
		if (userId === "") return;
		setIsLoading(true);
		setNoData(false);

		axios
			.get(`/jobApplication/findBlockedJobsByHR?hrId=${userId}`)
			.then(({ data }) => {
				console.log(data);
				setFetchData(data.data);
				setIsLoading(false);
				if (data.data.length === 0) setNoData(true);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, [userId, page, reload]);

	const handelUnBBockJob = (data) => {
		setBtnLoading(true);
		const raw = {
			jobId: data?._id,
			block: false,
			reason: "",
			blockedBy: userId,
		};

		axios
			.post(`/job/blockUnblockJob`, raw)
			.then(({ data }) => {
				setBtnLoading(false);
				toast.success(data.msg);
				dispatch(setReload());
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div className={styles.Wrapper}>
			{isLoading ? (
				<Loading height="8rem" width="8rem" />
			) : (
				<>
					{noData && <div className={styles.noData}>No data</div>}

					<div className={styles.Body}>
						{fetchData.map((data, index) => {
							return (
								<div key={index} className={styles.Box}>
									<img src={data?.companyLogo} alt="" />

									<div className={styles.Wrap}>
										<h2>{data?.companyName}</h2>

										<h1>{data?.jobTittle}</h1>

										<div className={styles.Note}>
											<span>Job Details :</span> {data?.note}
										</div>

										<div className={styles.Skills}>
											<span>Skills:</span> {data?.skills.join(", ")}
										</div>

										<div className={styles.ButtonWrap}>
											<button
												className={styles.Unblock}
												onClick={() => handelUnBBockJob(data)}
												disabled={btnLoading}>
												Unblock
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
};

export default Tab2;
