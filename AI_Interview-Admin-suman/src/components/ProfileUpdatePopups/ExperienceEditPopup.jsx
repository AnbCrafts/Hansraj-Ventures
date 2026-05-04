import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { updateUser } from "../../redux/slices/profileSlice";
import axios from "../Hooks/axios";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";
import { toast } from "react-toastify";

const ExperienceEditPopup = ({ setExperiencePopup, experience, setExperience, candidateId }) => {
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);

	const handelSave = () => {
		setLoading(true);
		const formData = new FormData();
		formData.append("experience", experience);

		axios
			.put(`/user/update-adminSide/${candidateId}`, formData)
			.then(({ data }) => {
				dispatch(updateUser(data?.user));
				setExperiencePopup(false);
				toast.success("User's Experience updated successfully..")
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			})
			.finally(() => setLoading(false));
	};

	return (
		<BackgroundWrapper
			close={() => {
				setExperiencePopup(false);
			}}
			height={"auto"}
			width={"28.5rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate07}`}>
				<div className={styles.Header}>
					<h2>Edit Experience</h2>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.InputWrapper}>
						<label>Experience</label>

						<div className={styles.Input}>
							<input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} />
						</div>
					</div>

					<div className={styles.ButtonWrapper}>
						<button onClick={handelSave} disabled={loading}>
							{loading ? "Loading..." : "Save"}
						</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default ExperienceEditPopup;
