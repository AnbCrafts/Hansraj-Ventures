import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LockIcon from "../../assets/icons/LockIcon.svg?react";
import axios from "../../components/Hooks/axios";
import Candidate02 from "../../components/ProfilePopups/Candidate02";
import Candidate03 from "../../components/ProfilePopups/Candidate03";
import Candidate04 from "../../components/ProfilePopups/Candidate04";
import Candidate05 from "../../components/ProfilePopups/Candidate05";
import Candidate06 from "../../components/ProfilePopups/Candidate06";
import Candidate07 from "../../components/ProfilePopups/Candidate07";
import { setReloadAssignedJob } from "../../redux/slices/assignedJobSlice";
import styles from "./SingleUpload.module.scss";
// import Candidate08 from "../../../components/ProfilePopups/Candidate08";

const SingleUpload = ({ setOpenSingleUploadPopup, jobsData }) => {
	const dispatch = useDispatch();
	const { state } = useLocation();

	const introVideoRef = useRef();
	const [introVideoFile, setIntroVideoFile] = useState(null);
	const [introVideoUrl, setIntroVideoUrl] = useState("");

	const imageRef = useRef();
	const [imageFile, setImageFile] = useState(null);
	const [imageUrl, setImageUrl] = useState("");
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [profession, setProfession] = useState("");
	// about
	const [about, setAbout] = useState("");
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

	const handleUpload = () => {
		if (!number) return toast.warn("Phone is required");
		const jobId = jobsData?.job?._id;
		const userData = {
			name,
			phone: number,
			profession,
			about,
			project,
			education,
			alternativeNumber,
			email,
			location,
			gender,
			dob,
			ctc,
			ectc,
			experience,
			skillDetails,
			skills,
			resume,
			coverLetter,
			entryDate,
			immediateJoiner,
			lastQualification,
			passoutYear,
			withoutContactResume,
			response,
			wfo,
			interested,
			callBy,
			feedback,
			source,
		};
		setLoading(true);
		axios
			.post(`/job/singleUpload`, { jobId, userData })
			.then(({ data }) => {
				dispatch(setReloadAssignedJob());
				setOpenSingleUploadPopup(false);
				toast.success("Resume uploaded successfully and job Application created");
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
				toast.error(response?.data?.message || "Error in uploading resume");
			})
			.finally(() => setLoading(false));
	};

	return (
		<>
			{aboutPopup && <Candidate02 {...{ about, setAbout, setAboutPopup }} />}
			{projectPopup && <Candidate03 {...{ project, setProject, setProjectPopup }} />}
			{skillPopup && <Candidate04 {...{ setSkillPopup, allSkillsOption, setSkills, skillDetails, setSkillDetails }} />}
			{educationPopup && <Candidate05 {...{ setEducationPopup, education, setEducation }} />}

			{personaPopup && (
				<Candidate06
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
					}}
				/>
			)}
			{experiencePopup && <Candidate07 {...{ setExperiencePopup, experience, setExperience }} />}
			<div className={styles.SingleUpload} onClick={() => setOpenSingleUploadPopup(false)}>
				<div className={styles.Wrapper} onClick={(e) => e.stopPropagation()}>
					<div className={styles.Col1}>
						<div className={styles.Row1}>
							<div className={styles.LeftSection}>
								<div className={styles.ProfileImgWrapper}>
									<div className={styles.ProfileImg}>
										<img src={imageUrl} alt="" />
									</div>
								</div>

								<div className={styles.ContentWrapper}>
									<div className={styles.InputWrapper}>
										<label htmlFor="name">Name</label>
										<input type="text" id="name" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
									</div>
									<div className={styles.InputWrapper}>
										<label htmlFor="profession">profession</label>
										<input
											type="text"
											id="profession"
											placeholder="profession"
											value={profession}
											onChange={(e) => setProfession(e.target.value)}
										/>
									</div>
								</div>
							</div>

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

									{false ? (
										<div className={styles.LockWrapper}>
											<LockIcon />
											<h4>These details is private</h4>
											{/* <h5>Lorem Ipsum is simply dummy text of the printing and type setting industry. </h5> */}
										</div>
									) : (
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

													<div className={styles.WrapperItem}>
														<p>Alternate Mobile Number</p>
														<p>{alternativeNumber ? alternativeNumber : "No alternative number"}</p>
													</div>

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
									)}
								</div>

								<div className={styles.Row5Col2Row2}>
									<h2>Documents</h2>
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
										<label htmlFor="entryDate">Cover Letter</label>
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
							<div className={styles.InputWrapper}>
								<label htmlFor="entryDate">Entry Date</label>
								<input
									type="date"
									id="entryDate"
									placeholder="Entry Date"
									value={entryDate}
									onChange={(e) => setEntryDate(e.target.value)}
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
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="wfo">WFO</label>
								<input type="text" id="wfo" placeholder="WFO" value={wfo} onChange={(e) => setWfo(e.target.value)} />
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="interested">Interested</label>
								<input
									type="text"
									id="interested"
									placeholder="Interested"
									value={interested}
									onChange={(e) => setInterested(e.target.value)}
								/>
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="callBy">Call By</label>
								<input type="text" id="callBy" placeholder="Call By" value={callBy} onChange={(e) => setCallBy(e.target.value)} />
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="source">Source</label>
								<input type="text" id="source" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="feedback">Feedback</label>
								<textarea id="feedback" placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
							</div>
						</div>

						{loading ? (
							<button disabled className={styles.SubmitButton}>
								Submitting...
							</button>
						) : (
							<button onClick={handleUpload} className={styles.SubmitButton}>
								Submit
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default SingleUpload;
