import React, { useState } from "react";
import axios from "../Hooks/axios";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/profileSlice";
import { toast } from "react-toastify";

const AboutEditPopup = ({ setAboutPopup, about, setAbout, candidateId }) => {
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const handelSave = () => {
		setLoading(true);
		const formData = new FormData();
		formData.append("about", about);

		axios
			.put(`/user/update-adminSide/${candidateId}`, formData)
			.then(({ data }) => {
				setLoading(false);
				setAbout(data?.user?.about);
				dispatch(updateUser(data?.user));
				setAboutPopup(false);
				toast.success(data?.message || "about updated successfully");
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			})
			.finally(() => setLoading(false));
	};

	return (
		<BackgroundWrapper
			close={() => {
				setAboutPopup(false);
			}}
			height={"30rem"}
			width={"40rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate02}`}>
				<div className={styles.Header}>
					<h2>Edit About us</h2>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.InputWrapper}>
						<label>Name</label>

						<div className={styles.Input}>
							<textarea value={about} onChange={(e) => setAbout(e.target.value)}></textarea>
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

export default AboutEditPopup;
