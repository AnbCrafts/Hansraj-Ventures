import React from "react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate07 = ({ setExperiencePopup, experience, setExperience }) => {
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
						<button onClick={() => setExperiencePopup(false)}>Okay</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate07;
