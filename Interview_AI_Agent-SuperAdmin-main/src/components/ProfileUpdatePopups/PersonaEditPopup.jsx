import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../redux/slices/profileSlice";
import axios from "../Hooks/axios";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const PersonaEditPopup = ({
	setPersonaPopup,
	number,
	setNumber,
	alternativeNumber,
	setAlternativeNumber,
	email,
	setEmail,
	location,
	setLocation,
	gender,
	setGender,
	dob,
	setDob,
	ctc,
	setCtc,
	ectc,
	setEctc,
	candidateId,
}) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const handelSave = () => {
		setLoading(true);
		const formData = new FormData();
		formData.append("phone", number);
		formData.append("alternativePhone", alternativeNumber);
		formData.append("email", email);
		formData.append("location", location);
		formData.append("gender", gender);
		formData.append("dob", dob);
		formData.append("currentPay", ctc);
		formData.append("expectationPay", ectc);

		axios
			.put(`/user/update-adminSide/${candidateId}`, formData)
			.then(({ data }) => {
				dispatch(updateUser(data?.user));
				setPersonaPopup(false);
				toast.success(data?.message || "Personal details updated successfully");
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			})
			.finally(setLoading(false));
	};

	return (
		<BackgroundWrapper
			close={() => {
				setPersonaPopup(false);
			}}
			height={"auto"}
			width={"28.5rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate06}`}>
				<div className={styles.Header}>
					<h2>Edit Personal Details</h2>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.Row}>
						<div className={styles.InputWrapper}>
							<label>Phone No.</label>

							<div className={styles.Input}>
								<input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
							</div>
						</div>

						<div className={styles.InputWrapper}>
							<label>Alternate Phone No.</label>

							<div className={styles.Input}>
								<input type="text" value={alternativeNumber} onChange={(e) => setAlternativeNumber(e.target.value)} />
							</div>
						</div>
					</div>

					<div className={styles.InputWrapper}>
						<label>Email</label>

						<div className={styles.Input}>
							<input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
					</div>

					<div className={styles.InputWrapper}>
						<label>Location</label>

						<div className={styles.Input}>
							<input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
						</div>
					</div>

					<div className={styles.Row}>
						<div className={styles.InputWrapper}>
							<label>Gender</label>

							<div className={styles.Input}>
								<select value={gender} onChange={(e) => setGender(e.target.value)}>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Other">Other</option>
								</select>
							</div>
						</div>

						<div className={styles.InputWrapper}>
							<label>dob</label>

							<div className={styles.Input}>
								<input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
							</div>
						</div>
					</div>

					<div className={styles.Row}>
						<div className={styles.InputWrapper}>
							<label>CTC</label>

							<div className={styles.Input}>
								<input type="text" value={ctc} onChange={(e) => setCtc(e.target.value)} />
							</div>
						</div>

						<div className={styles.InputWrapper}>
							<label>ECTC</label>

							<div className={styles.Input}>
								<input type="text" value={ectc} onChange={(e) => setEctc(e.target.value)} />
							</div>
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

export default PersonaEditPopup;
