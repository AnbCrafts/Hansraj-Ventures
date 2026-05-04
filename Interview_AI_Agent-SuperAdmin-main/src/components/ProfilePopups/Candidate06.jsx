import React from "react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate06 = ({
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
}) => {
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
						<button onClick={()=>setPersonaPopup(false)}>Okay</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate06;
