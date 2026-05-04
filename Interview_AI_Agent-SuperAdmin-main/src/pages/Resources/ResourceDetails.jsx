import React, { useState } from "react";
import { FaPen } from "react-icons/fa";
import CandidateProfilePopup from "./CandidateProfilePopup";
import styles from "./ResourceDetails.module.scss";

const ResourceDetails = ({ setOpenResourceDetails, openedResource }) => {
	console.log(openedResource);
	const [openUserProfile, setOpenUserProfile] = useState(false);
	const [clickedCandidateData, setClickedCandidateData] = useState({});

	const handleOpenCandidateDetails = (data) => {
		setClickedCandidateData(data);
		setOpenUserProfile(true);
	};

	return (
		<>
			{openUserProfile && <CandidateProfilePopup {...{ setOpenUserProfile ,clickedCandidateData}} />}
			<div className={styles.ResourceDetails} onClick={() => setOpenResourceDetails(false)}>
				<div className={styles.Wrapper} onClick={(e) => e.stopPropagation()}>
					<h2>Added Resources In Job</h2>
					<h3>Job Details</h3>
					<div className={styles.Row1}>
						<div className={styles.Row}>
							<div className={styles.InputWrapper}>
								<label htmlFor="prof">Job Title</label>
								<input type="text" id="prof" readOnly value={openedResource?.jobId?.jobTittle} />
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="prof">Job Location</label>
								<input type="text" id="prof" readOnly value={openedResource?.jobId?.location} />
							</div>
						</div>
						<div className={styles.Row}>
							<div className={styles.InputWrapper}>
								<label htmlFor="prof">Company Name</label>
								<input type="text" id="prof" readOnly value={openedResource?.jobId?.companyName} />
							</div>
							<div className={styles.InputWrapper}>
								<label htmlFor="prof">Job Type</label>
								<input
									type="text"
									id="prof"
									readOnly
									value={openedResource?.jobId?.jobType ? "Work from Office" : "Work From Home"}
								/>
							</div>
						</div>
						<div className={styles.InputWrapper}>
							<label htmlFor="prof">Job Description</label>
							<textarea id="about" readOnly value={openedResource?.jobId?.note} style={{ height: "9rem" }} />
						</div>
					</div>

					{/* <h3>Enrolled By : Akash Mittal</h3> */}

					<h3>Resumes Enrolled </h3>
					<div className={styles.Head}>
						<p>Name</p>
						<p>Phone</p>
						<p>Link to Drive</p>
						<p>Edit</p>
					</div>
					{openedResource?.applicationData?.map((item, i) => (
						<div key={i} className={styles.Card}>
							<p>{item?.candidateId?.name}</p>
							<p>{item?.candidateId?.phone}</p>
							<a href={item?.candidateId?.resume} target="_blank">
								Resume Link
							</a>
							<p className={styles.Edit} onClick={() => handleOpenCandidateDetails(item)}>
								<FaPen />
							</p>
						</div>
					))}

					<div className={styles.ButtonWrapper}>
						<button className={styles.BackBtn} onClick={() => setOpenResourceDetails(false)}>
							Back
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default ResourceDetails;
