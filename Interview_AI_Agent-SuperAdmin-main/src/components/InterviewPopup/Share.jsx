import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DownArrow from "../../assets/svg/DownArrow.svg?react";
import { setReload, setSharePopup } from "../../redux/slices/popupSlice";
import axios from "../Hooks/axios";
import styles from "./Share.module.scss";

const Share = () => {
	const dispatch = useDispatch();
	const { shareData } = useSelector((s) => s.popup);

	const [experience, setExperience] = useState("");
	const [comments, setComments] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handelShareFeedBack = () => {
		if (experience === "") return toast.warn("Please select experience !");

		setIsLoading(true);
		const raw = {
			jobId: shareData?._id,
			experience,
			comments,
		};
		axios
			.post(`/jobApplication/addFeedback`, raw)
			.then(({ data }) => {
				setIsLoading(false);
				toast.success("Feedback share successfully !");
				dispatch(setReload());
				dispatch(setSharePopup({ state: false, data: null }));
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div className={styles.Container} onClick={() => dispatch(setSharePopup({ state: false, data: null }))}>
			<div className={styles.Box} onClick={(e) => e.stopPropagation()}>
				<div className={styles.Main}>
					<div className={styles.MainTop}>
						<p>
							Share Your Feedback to <span>Super admin</span>
						</p>

						<button onClick={() => dispatch(setSharePopup({ state: false, data: null }))}>Back</button>
					</div>

					<div className={styles.MainBottom}>
						<div className={styles.MainRow1}>
							<p>Interview Experience</p>

							<div className={styles.ReasonScroll}>
								<p>{experience}</p>
								<DownArrow className={styles.Arrow} />

								<div className={styles.dropdownContent}>
									<p onClick={() => setExperience("Excellent")}>Excellent</p>
									<p onClick={() => setExperience("Good")}>Good</p>
									<p onClick={() => setExperience("Average")}>Average</p>
									<p onClick={() => setExperience("Very Poor")}>Very Poor</p>
								</div>
							</div>
						</div>

						<div className={styles.MainRow2}>
							<p>
								Feedback* <span>(Optional)</span>
							</p>

							<textarea value={comments} onChange={(e) => setComments(e.target.value)}></textarea>
						</div>
					</div>
				</div>

				<button onClick={handelShareFeedBack} disabled={isLoading}>
					Submit
				</button>
			</div>
		</div>
	);
};

export default Share;
