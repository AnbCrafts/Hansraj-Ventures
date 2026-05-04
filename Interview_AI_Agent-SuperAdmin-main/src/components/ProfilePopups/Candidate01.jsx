import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import CameraIcon from "../../assets/icons/CameraIcon.svg?react";
import MP4 from "../../assets/icons/MP4.svg?react";
import DownloadIcon from "../../assets/svg/DownloadIcon.svg?react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate01 = ({
	setProfileEditPopup,
	imageRef,
	imageFile,
	setImageFile,
	imageUrl,
	setImageUrl,
	name,
	setName,
	profession,
	setProfession,
	introVideoRef,
	introVideoFile,
	setIntroVideoFile,
	introVideoUrl,
	setIntroVideoUrl,
}) => {
	const { state } = useLocation();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	return (
		<BackgroundWrapper
			close={() => {
				setImageFile(null);
				setProfileEditPopup(false);
			}}
			height={"auto"}
			width={"28.5rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate01}`}>
				<div className={styles.Header}>
					<h2>Edit Profile Details</h2>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.ImageWrapper}>
						<div className={styles.Img}>
							{imageFile ? <img src={URL.createObjectURL(imageFile)} alt="" /> : <img src={imageUrl} alt="" />}
						</div>

						<button onClick={() => imageRef.current.click()}>
							<CameraIcon />
						</button>
					</div>

					<div className={styles.InputWrapper}>
						<label>Name</label>

						<div className={styles.Input}>
							<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
					</div>

					<div className={styles.InputWrapper}>
						<label>Profession</label>

						<div className={styles.Input}>
							<input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} />
						</div>
					</div>

					<div className={styles.InputWrapper}>
						<label>Your Intro Video</label>

						<div className={styles.VideoWrapper} onClick={() => introVideoRef.current.click()}>
							<i>
								<DownloadIcon />
							</i>

							<div className={styles.Box}>
								<MP4 />

								<div>
									<h4>{introVideoFile ? introVideoFile.name : introVideoUrl}</h4>
									{introVideoFile && <h5>{Math.round(introVideoFile.size / 1024 / 1024)}mb</h5>}
								</div>
							</div>
						</div>
					</div>

					<span
						data-title="Please upload a proper, clear intro video within 3 minutes and under 200 MB."
						className={styles.PopupSpan}>
						i
					</span>

					<div className={styles.ButtonWrapper}>
						<button>Okay</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate01;
