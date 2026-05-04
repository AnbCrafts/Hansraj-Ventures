import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import TickIcon from "../../assets/icons/TickIcon.svg?react";
import axios from "../../components/Hooks/axios";
import AboutEditPopup from "../../components/ProfileUpdatePopups/AboutEditPopup";
import DocumentEditPopup from "../../components/ProfileUpdatePopups/DocumentEditPopup";
import EducationEditPopup from "../../components/ProfileUpdatePopups/EducationEditPopup";
import ExperienceEditPopup from "../../components/ProfileUpdatePopups/ExperienceEditPopup";
import PersonaEditPopup from "../../components/ProfileUpdatePopups/PersonaEditPopup";
import ProfilePopup from "../../components/ProfileUpdatePopups/ProfilePopup";
import ProjectEditPopup from "../../components/ProfileUpdatePopups/ProjectEditPopup";
import SkillsEditPopup from "../../components/ProfileUpdatePopups/SkillsEditPopup";
import { updateUser } from "../../redux/slices/profileSlice";
import styles from "./CandidateProfilePopup.module.scss";
// import Candidate08 from "../../../components/ProfilePopups/Candidate08";

const CandidateProfilePopup = ({ setOpenUserProfile, clickedCandidateData }) => {
	console.log(clickedCandidateData);

	const candidateId = clickedCandidateData?.candidateId?._id;
	const dispatch = useDispatch();

	const introVideoRef = useRef();
	const [introVideoFile, setIntroVideoFile] = useState(null);
	const [introVideoUrl, setIntroVideoUrl] = useState("");

	const imageRef = useRef();
	const [imageFile, setImageFile] = useState(null);
	const [imageUrl, setImageUrl] = useState("");
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [profession, setProfession] = useState("");
	const [profileComplete, setProfileComplete] = useState(0);
	// about
	const [about, setAbout] = useState(clickedCandidateData?.candidateId?.about);
	const [aboutMore, setAboutMore] = useState(false);
	// project
	const [project, setProject] = useState([]);
	const [projectShowMore, setProjectShowMore] = useState(false);
	// skills
	const [skills, setSkills] = useState([]);
	const [skillDetails, setSkillDetails] = useState([]);
	const [allSkillsOption, setAllSkillsOption] = useState([]);
	// education
	const [education, setEducation] = useState([]);
	const [educationShowMore, setEducationShowMore] = useState(false);
	// personal
	const [number, setNumber] = useState("");
	const [alternativeNumber, setAlternativeNumber] = useState("");
	const [email, setEmail] = useState("");
	const [location, setLocation] = useState("");
	const [gender, setGender] = useState("");
	const [dob, setDob] = useState("");
	const [ectc, setEctc] = useState("");
	const [ctc, setCtc] = useState("");
	const [resume, setResume] = useState("");
	const [coverLetter, setCoverLetter] = useState("");
	const [experience, setExperience] = useState("");

	// Popup States
	const [ProfileEditPopup, setProfileEditPopup] = useState(false);
	const [aboutPopup, setAboutPopup] = useState(false);
	const [projectPopup, setProjectPopup] = useState(false);
	const [skillPopup, setSkillPopup] = useState(false);
	const [educationPopup, setEducationPopup] = useState(false);
	const [experiencePopup, setExperiencePopup] = useState(false);
	const [personaPopup, setPersonaPopup] = useState(false);
	const [documentsPopup, setDocumentsPopup] = useState(false);

	const [pageLoading, setPageLoading] = useState(false);

	const [entryDate, setEntryDate] = useState("");
	const [immediateJoiner, setImmediateJoiner] = useState("");
	const [lastQualification, setLastQualification] = useState("");
	const [passoutYear, setPassoutYear] = useState("");
	const [withoutContactResume, setWithoutContactResume] = useState("");
	const [response, setResponse] = useState("");
	const [wfo, setWfo] = useState("");
	const [interested, setInterested] = useState("");
	const [callBy, setCallBy] = useState("");
	const [feedback, setFeedback] = useState("");
	const [source, setSource] = useState("");

	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(0);

	const [editable, setEditable] = useState(false);

	const handleVideoFileChange = (event) => {
		const file = event.target.files[0];
		const video = document.createElement("video");

		video.onloadedmetadata = function () {
			const duration = video.duration;
			if (Math.floor(duration) < 180) setIntroVideoFile(file);
			else toast.warn("Please upload a max 3min video !");
		};

		video.src = URL.createObjectURL(file);
		event.target.value = null;
	};

	useEffect(() => {
		setPageLoading(true);

		axios
			.get(`/user/user-adminSide?_id=${candidateId}`)
			.then(({ data }) => {
				setPageLoading(false);
				if (data.status) {
					dispatch(updateUser(data.userRecord));
					setIntroVideoUrl(data.userRecord?.videoUrl);
					setImageUrl(data.userRecord?.profileImage);
					setName(data.userRecord?.name);
					setProfession(data.userRecord?.profession);
					setProfileComplete(data.userRecord?.profileComplete);

					setNumber(data.userRecord?.phone);
					setAbout(data.userRecord?.about);
					setProject(data.userRecord?.projects);
					setSkills(data.userRecord?.skills);
					setSkillDetails(data.userRecord?.skillDetails);
					setEducation(data.userRecord?.education);

					setAlternativeNumber(data.userRecord?.alternativePhone);
					setEmail(data.userRecord?.email);
					setLocation(data.userRecord?.location);
					setGender(data.userRecord?.gender);
					setDob(data.userRecord?.dob);
					setEctc(data.userRecord?.expectationPay);
					setCtc(data.userRecord?.currentPay);
					setResume(data.userRecord?.resume);
					setCoverLetter(data.userRecord?.letter);
					setExperience(data.userRecord?.experience);

					setEntryDate(data.userRecord?.entryDate);
					setImmediateJoiner(data?.userRecord?.immediateJoiner);
					setLastQualification(data?.userRecord?.lastQualification);
					setPassoutYear(data?.userRecord?.passoutYear);
					setWithoutContactResume(data?.userRecord?.withoutContactResume);
					setResponse(data?.userRecord?.response);
					setWfo(data?.userRecord?.wfo);
					setInterested(data?.userRecord?.interested);
					setCallBy(data?.userRecord?.callBy);
					setFeedback(data?.userRecord?.feedback);
					setSource(data?.userRecord?.source);
				}
			})
			.catch((e) => console.log(e));
	}, [reload]);

	useEffect(() => {
		axios
			.get(`/skills/all`)
			.then(({ data }) => {
				setAllSkillsOption(data.data);
				console.log(data);
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	}, []);

	const [updating, setUpdating] = useState(false);
	const handleUpdate = () => {
		setEditable(false);

		const formData = new FormData();
		formData.append("entryDate", entryDate);
		formData.append("immediateJoiner", immediateJoiner);
		formData.append("lastQualification", lastQualification);
		formData.append("passoutYear", passoutYear);
		formData.append("withoutContactResume", withoutContactResume);
		formData.append("response", response);
		formData.append("wfo", wfo);
		formData.append("interested", interested);
		formData.append("callBy", callBy);
		formData.append("feedback", feedback);
		formData.append("source", source);

		setUpdating(true);
		axios
			.put(`/user/update-adminSide/${candidateId}`, formData)
			.then(({ data }) => {
				dispatch(updateUser(data?.user));
				setResume(data.user.resume);
				setCoverLetter(data.user.letter);
				setEntryDate(data.user.entryDate || "");
				setImmediateJoiner(data.user.immediateJoiner || "");
				setLastQualification(data.user.lastQualification || "");
				setPassoutYear(data.user.passoutYear || "");
				setWithoutContactResume(data.user.withoutContactResume || "");
				setResponse(data.user.response || "");
				setWfo(data.user.wfo || "");
				setInterested(data.user.interested || "");
				setCallBy(data.user.callBy || "");
				setFeedback(data.user.feedback || "");
				setSource(data.user.source || "");
				toast.success("User Profile Successfully Updated...");
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			})
			.finally(() => setUpdating(false));
	};

	return (
		<>
			{ProfileEditPopup && (
				<ProfilePopup
					{...{
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
						candidateId,
					}}
				/>
			)}
			{aboutPopup && <AboutEditPopup {...{ about, setAbout, setAboutPopup, candidateId }} />}
			{projectPopup && <ProjectEditPopup {...{ project, setProject, setProjectPopup, candidateId }} />}
			{skillPopup && (
				<SkillsEditPopup {...{ setSkillPopup, allSkillsOption, setSkills, skillDetails, setSkillDetails, candidateId }} />
			)}
			{educationPopup && <EducationEditPopup {...{ setEducationPopup, education, setEducation, candidateId }} />}

			{personaPopup && (
				<PersonaEditPopup
					{...{
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
					}}
				/>
			)}
			{experiencePopup && <ExperienceEditPopup {...{ setExperiencePopup, experience, setExperience, candidateId }} />}
			{documentsPopup && (
				<DocumentEditPopup
					{...{
						setDocumentsPopup,
						resume,
						setResume,
						coverLetter,
						setCoverLetter,
						candidateId,
					}}
				/>
			)}
			<div className={styles.CandidateProfilePopup} onClick={() => setOpenUserProfile(false)}>
				<div className={styles.Wrapper} onClick={(e) => e.stopPropagation()}>
					<div className={styles.Col1}>
						<div className={styles.Row1}>
							<div className={styles.LeftSection}>
								<div className={styles.ProfileImgWrapper}>
									<div className={styles.ProfileImg}>
										<img src={imageUrl} alt="" />
									</div>

									{introVideoUrl !== "" && (
										<div
											className={styles.PlayButton}
											id="canProfileIntroVideo"
											onClick={() => {
												if (introVideoUrl?.length > 2) dispatch(setVideoPlayer({ video: true, url: introVideoUrl }));
											}}>
											<PlayButton />
										</div>
									)}
								</div>

								<div className={styles.ContentWrapper}>
									<div className={styles.TextWrapper}>
										<h2>{name}</h2>
										<h3>{profession}</h3>
									</div>

									<div className={styles.ProfileCompleteBar} id="canProfileRow1ProfileComplete">
										<div className={styles.BarTop}>
											<p>Profile Completion</p>
											<p>{profileComplete}%</p>
										</div>

										<div className={styles.BarWrapper}>
											<div className={styles.Bar} style={{ width: `${profileComplete}%` }}></div>

											<span
												className={styles.Logo}
												style={{
													left: `calc(${profileComplete}% - 1rem)`,
												}}>
												<TickIcon />
											</span>
										</div>
									</div>
								</div>
							</div>

							<button
								className={styles.EditBtn}
								onClick={() => setProfileEditPopup(!ProfileEditPopup)}
								id="canProfileRow1EditBtn">
								Edit
							</button>

							<input
								type="file"
								ref={imageRef}
								accept="image/*"
								style={{ display: "none" }}
								onChange={(e) => {
									setImageFile(e.target.files[0]);
									e.target.value = null;
								}}
							/>
							<input
								type="file"
								ref={introVideoRef}
								accept="video/*"
								style={{ display: "none" }}
								onChange={handleVideoFileChange}
							/>
						</div>

						<div className={styles.Row2}>
							<button className={styles.EditBtn} onClick={() => setAboutPopup(!aboutPopup)} id="canProfileRow2EditBtn">
								Edit
							</button>

							<h2>About</h2>

							{/* <p>{about ? about : "No about added"}</p> */}

							<div className={styles.Content}>
								{aboutMore ? <p>{about ? about : "No about"}</p> : <p>{about ? about.slice(0, 100) : "No about"}</p>}
							</div>

							{about.length > 100 && (
								<button onClick={() => setAboutMore(!aboutMore)} className={styles.LessBtn}>
									{aboutMore ? "Show less" : "Show all"}
								</button>
							)}
						</div>

						<div className={styles.Row3}>
							<button className={styles.EditBtn} onClick={() => setProjectPopup(!projectPopup)} id="canProfileRow3EditBtn">
								Edit
							</button>

							<h2>Projects</h2>

							{project.length === 0 && <h5>No project data added</h5>}

							{projectShowMore
								? project?.map((data, index) => {
										return (
											<div key={index} className={styles.Content}>
												<h3>{data?.projectName}</h3>
												<p>{data?.desc}</p>
												<h5>
													{data?.startTime} — {data?.endTime}
												</h5>
											</div>
										);
								  })
								: project?.slice(0, 3).map((data, index) => {
										return (
											<div key={index} className={styles.Content}>
												<h3>{data?.projectName}</h3>
												<p>{data?.desc}</p>
												<h5>
													{data?.startTime} — {data?.endTime}
												</h5>
											</div>
										);
								  })}

							{project?.length > 3 && (
								<button onClick={() => setProjectShowMore(!projectShowMore)} className={styles.LessBtn}>
									{projectShowMore ? "Show less" : "Show all"}
								</button>
							)}
						</div>

						<div className={styles.Row4}>
							<button className={styles.EditBtn} onClick={() => setSkillPopup(!skillPopup)} id="canProfileRow4EditBtn">
								Edit
							</button>

							<h2>Skills</h2>

							{skills.length === 0 && <h5>No skills data added</h5>}

							<div className={styles.Content}>
								{skills.map((item, i) => {
									return <p key={i}>{item}</p>;
								})}
							</div>
						</div>

						<div className={styles.Row5}>
							<div className={styles.Row5Col1}>
								<div className={styles.Row5Col1Row1}>
									<button
										className={styles.EditBtn}
										onClick={() => setEducationPopup(!educationPopup)}
										id="canProfileRow5Col1EditBtn">
										Edit
									</button>

									<h2>Education</h2>

									{education.length === 0 && <h5>No education data added</h5>}

									{educationShowMore
										? education?.map((data, index) => {
												return (
													<div key={index} className={styles.Content}>
														<h3>{data?.name}</h3>
														<p>{data?.desc}</p>
														<h5>
															{data?.startTime} — {data?.endTime}
														</h5>
													</div>
												);
										  })
										: education?.slice(0, 4).map((data, index) => {
												return (
													<div key={index} className={styles.Content}>
														<h3>{data?.name}</h3>
														<p>{data?.desc}</p>
														<h5>
															{data?.startTime} — {data?.endTime}
														</h5>
													</div>
												);
										  })}

									{education?.length > 3 && (
										<button onClick={() => setEducationShowMore(!educationShowMore)} className={styles.LessBtn}>
											{educationShowMore ? "Show less" : "Show all"}
										</button>
									)}
								</div>

								<div className={styles.Row5Col1Row2}>
									<button
										className={styles.EditBtn}
										onClick={() => setExperiencePopup(!experiencePopup)}
										id="canProfileRow5Col2EditBtn">
										Edit
									</button>

									<h2>Experience</h2>
									{experience ? <p>{experience} Experience</p> : <p>No experience data added</p>}
								</div>
							</div>

							<div className={styles.Row5Col2}>
								<div className={styles.Row5Col2Row1}>
									<h2>Personal details</h2>

									<>
										<button
											className={styles.EditBtn}
											onClick={() => setPersonaPopup(!personaPopup)}
											id="canProfileRow6Col1EditBtn">
											Edit
										</button>

										<div className={styles.Content}>
											<div className={styles.WrapperCol}>
												<div className={styles.WrapperItem}>
													<p>Mobile Number</p>
													<p>{number ? number : "No number"}</p>
												</div>

												{/* <div className={styles.WrapperItem}>
													<p>Alternate Mobile Number</p>
													<p>{alternativeNumber ? alternativeNumber : "No alternative number"}</p>
												</div> */}

												<div className={styles.WrapperItem}>
													<p>Email</p>
													<p>{email ? email : "No email"}</p>
												</div>

												<div className={styles.WrapperItem}>
													<p>Location</p>
													<p>{location ? location : "No location"}</p>
												</div>
											</div>

											<div className={styles.WrapperCol}>
												<div className={styles.WrapperItem}>
													<p>Gender</p>
													<p>{gender ? gender : "No gender"}</p>
												</div>

												<div className={styles.WrapperItem}>
													<p>DOB</p>
													<p>{dob ? dob : "No dob"}</p>
												</div>
											</div>

											<div className={styles.WrapperCol}>
												<div className={styles.WrapperItem}>
													<p>ECTC</p>
													<p>{ectc ? `₹${ectc}` : "No ectc"}</p>
												</div>

												<div className={styles.WrapperItem}>
													<p>CTC</p>
													<p>{ctc ? `₹${ctc}` : "No ctc"}</p>
												</div>
											</div>
										</div>
									</>
								</div>

								<div className={styles.Row5Col2Row2}>
									<h2>Documents</h2>
									<button
										className={styles.EditBtn}
										onClick={() => setDocumentsPopup(!documentsPopup)}
										id="canProfileRow6Col2EditBtn">
										Edit
									</button>
									<div className={styles.InputWrapper}>
										<label htmlFor="entryDate">Resume</label>
										<input
											type="text"
											id="resume"
											placeholder="Resume (drive link)"
											value={resume}
											onChange={(e) => setResume(e.target.value)}
										/>
									</div>
									<div className={styles.InputWrapper}>
										<label htmlFor="coverLetter">Cover Letter</label>
										<input
											type="coverLetter"
											id="coverLetter"
											placeholder="Cover Letter"
											value={coverLetter}
											onChange={(e) => setCoverLetter(e.target.value)}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className={styles.Row6}>
							{editable ? (
								<button className={styles.EditBtn} onClick={handleUpdate}>
									Save
								</button>
							) : (
								<button className={styles.EditBtn} onClick={() => setEditable(true)}>
									Edit
								</button>
							)}

							<div className={styles.InputWrapper}>
								<label htmlFor="entryDate">Entry Date</label>
								<input
									type="date"
									id="entryDate"
									placeholder="Entry Date"
									value={entryDate}
									onChange={(e) => setEntryDate(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="immediateJoiner">Immediate Joiner</label>
								<input
									type="text"
									id="immediateJoiner"
									placeholder="Immediate Joiner"
									value={immediateJoiner}
									onChange={(e) => setImmediateJoiner(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="lastQualification">Last Qualification</label>
								<input
									type="text"
									id="lastQualification"
									placeholder="Last Qualification"
									value={lastQualification}
									onChange={(e) => setLastQualification(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="passoutYear">Passout Year</label>
								<input
									type="text"
									id="passoutYear"
									placeholder="Passout Year"
									value={passoutYear}
									onChange={(e) => setPassoutYear(e.target.value)}
									readOnly={!editable}
								/>
							</div>

							<div className={styles.InputWrapper}>
								<label htmlFor="withoutContactResume">Without Contact Resume</label>
								<input
									type="text"
									id="withoutContactResume"
									placeholder="Without Contact Resume"
									value={withoutContactResume}
									onChange={(e) => setWithoutContactResume(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="response">Response</label>
								<input
									type="text"
									id="response"
									placeholder="Response"
									value={response}
									onChange={(e) => setResponse(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="wfo">WFO</label>
								<input
									type="text"
									id="wfo"
									placeholder="WFO"
									value={wfo}
									onChange={(e) => setWfo(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="interested">Interested</label>
								<input
									type="text"
									id="interested"
									placeholder="Interested"
									value={interested}
									onChange={(e) => setInterested(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="callBy">Call By</label>
								<input
									type="text"
									id="callBy"
									placeholder="Call By"
									value={callBy}
									onChange={(e) => setCallBy(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="source">Source</label>
								<input
									type="text"
									id="source"
									placeholder="Source"
									value={source}
									onChange={(e) => setSource(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="feedback">Feedback</label>
								<textarea
									id="feedback"
									placeholder="Feedback"
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									readOnly={!editable}
								/>
							</div>
							<br />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CandidateProfilePopup;
