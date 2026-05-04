import React, { useState } from "react";
import { toast } from "react-toastify";
import DownArrow from "../../../assets/svg/DownArrow.svg?react";
import Loading from "../../../components/Hooks/Loading";
import styles from "./RejectPopup.module.scss";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../../components/Hooks/axios";
import { setReload } from "../../../redux/slices/popupSlice";

const RejectPopup = ({ setRejectPopup, activeData, activeSection }) => {
	const dispatch = useDispatch()
	const { userId } = useSelector((s) => s.auth);
	const [reason, setReason] = useState("");
	const [desc, setDesc] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handelSubmit = () => {
		if (reason === "" || desc === "") return toast.warn("Please fill !!");
		setIsLoading(true);
		
		const raw = {
			jobApplicationId: activeData._id,
			interviewType: activeSection === "Interview1" ? "interviews" : "interviews2",
			rejectedReason: reason,
			desc: desc,
			rejectedBy: userId,
		};
		
		axios
		.post(`/adminUser/rejectInterview`, raw)
		.then(({ data }) => {
				setIsLoading(false);
				dispatch(setReload());
				setRejectPopup(false);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div className={styles.Container} onClick={() => setRejectPopup(false)}>
			<div className={styles.Box} onClick={(e) => e.stopPropagation()}>
				<div className={styles.Main}>
					<div className={styles.MainTop}>
						<p>Rejection Reason</p>
						<button onClick={() => setRejectPopup(false)}>Back</button>
					</div>

					<div className={styles.MainBottom}>
						<div className={styles.MainReason}>
							<p>Reason</p>

							<div className={styles.ReasonScroll}>
								<p>{reason}</p>
								<DownArrow className={styles.Arrow} />

								<div className={styles.dropdownContent}>
									<p onClick={() => setReason("Good")}>Good</p>
									<p onClick={() => setReason("Bad")}>Bad</p>
									<p onClick={() => setReason("Spam")}>Spam</p>
									<p onClick={() => setReason("None")}>None</p>
								</div>
							</div>
						</div>

						<div className={styles.MainDesc}>
							<p>Description</p>

							<textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
						</div>
					</div>
				</div>

				<button onClick={handelSubmit} disabled={isLoading}>
					{isLoading ? <Loading height="2rem" width="2rem" /> : "Submit"}
				</button>
			</div>
		</div>
	);
};

export default RejectPopup;
