import React, { useState } from "react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate02 = ({ setAboutPopup, about, setAbout }) => {
	const [loading, setLoading] = useState(false);

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
						<button onClick={() => setAboutPopup(false)}>Okay</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate02;
