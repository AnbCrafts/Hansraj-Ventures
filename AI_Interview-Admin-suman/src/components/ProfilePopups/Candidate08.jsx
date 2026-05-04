import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import PDF from "../../assets/icon/PDF.svg?react";
import DownloadIcon from "../../assets/svg/DownloadIcon.svg?react";
import { updateUser } from "../../redux/slices/dataSlice";
import axios from "../Hooks/axios";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";
import { endLoading, startLoading } from "../../redux/slices/tempSlice";

const Candidate08 = ({ setDocumentsPopup, resume, setResume, coverLetter, setCoverLetter }) => {
	const { state } = useLocation();
	const dispatch = useDispatch();

	const resumeRef = useRef();
	const coverLetterRef = useRef();
	const [resumeFile, setResumeFile] = useState(null);
	const [coverLetterFile, setCoverLetterFile] = useState(null);

	const [loading, setLoading] = useState(false);

	const handelSave = () => {
		setLoading(true);
		const formData = new FormData();
		formData.append("resume", resumeFile);
		formData.append("letter", coverLetterFile);
		dispatch(startLoading());
		
		axios
		.put(`/user/update/${state}`, formData)
		.then(({ data }) => {
			setLoading(false);
			dispatch(updateUser(data?.user));
			setDocumentsPopup(false);
			setResumeFile(null);
			setCoverLetterFile(null);
			setResume(data?.user.resume);
			setCoverLetter(data?.user.letter);
			dispatch(endLoading());
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<BackgroundWrapper
			close={() => {
				setDocumentsPopup(false);
			}}
			height={"auto"}
			width={"36.5rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate08}`}>
				<div className={styles.Header}>
					<h2>Edit Documents</h2>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.RowWrapper}>
						<div className={styles.Box}>
							<label>Resume</label>

							<div className={styles.BoxInner} onClick={() => resumeRef.current.click()}>
								<i>
									<DownloadIcon />
								</i>

								<input
									type="file"
									ref={resumeRef}
									style={{ display: "none" }}
									accept=".pdf"
									onChange={(e) => {
										setResumeFile(e.target.files[0]);
										e.target.value = null;
									}}
								/>

								<div>
									<PDF />
									{resumeFile ? <p>{resumeFile.name}</p> : <p>Resume</p>}
								</div>
							</div>
						</div>

						<div className={styles.Box}>
							<label>Cover Letter</label>

							<div className={styles.BoxInner} onClick={() => coverLetterRef.current.click()}>
								<i>
									<DownloadIcon />
								</i>

								<input
									type="file"
									ref={coverLetterRef}
									style={{ display: "none" }}
									accept=".pdf, .doc, .docx"
									onChange={(e) => {
										setCoverLetterFile(e.target.files[0]);
										e.target.value = null;
									}}
								/>

								<div>
									<PDF />
									{coverLetterFile ? <p>{coverLetterFile.name}</p> : <p>Cover Letter</p>}
								</div>
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

export default Candidate08;
