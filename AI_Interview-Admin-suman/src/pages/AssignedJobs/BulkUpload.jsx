import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "../../components/Hooks/axios";
import { setReloadAssignedJob } from "../../redux/slices/assignedJobSlice";
import styles from "./BulkUpload.module.scss";

const BulkUpload = ({ setOpenBulkUploadPopup, jobsData }) => {
	const [file, setFile] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const inputRef = useRef(null);

	// Handle file selection
	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		validateFile(selectedFile);
	};

	// Drag & Drop Handling
	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const droppedFile = e.dataTransfer.files[0];
		validateFile(droppedFile);
	};

	// Validate File Type
	const validateFile = (selectedFile) => {
		if (selectedFile) {
			const allowedTypes = [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
				"application/vnd.ms-excel", // .xls
			];

			if (allowedTypes.includes(selectedFile.type)) {
				setFile(selectedFile);
				setError("");
			} else {
				setError("Only Excel files (.xls, .xlsx) are allowed.");
				setFile(null);
			}
		}
	};

	const handleUpload = () => {
		const formData = new FormData();
		formData.append("jobId", jobsData?.job?._id);
		formData.append("excelSheet", file);
		setLoading(true);
		axios
			.post(`/job/bulkUpload`, formData)
			.then(({ data }) => {
				dispatch(setReloadAssignedJob());
				setOpenBulkUploadPopup(false);
				toast.success("Resume uploaded successfully and job Application created");
			})
			.catch((e) => {
				console.log("Error => ", e);
				toast.error(e?.response?.data?.message || "Error in uploading resume");
			})
			.finally(() => setLoading(false));
	};

	return (
		<div className={styles.BulkUpload} onClick={() => setOpenBulkUploadPopup(false)}>
			<div className={styles.Wrapper} onClick={(e) => e.stopPropagation()} onDragOver={handleDragOver} onDrop={handleDrop}>
				<h2 className={styles.Title}>Upload Excel File</h2>

				<div className={styles.FileInput} onClick={() => inputRef.current.click()}>
					<input type="file" accept=".xls,.xlsx" onChange={handleFileChange} ref={inputRef} style={{ display: "none" }} />
					<p>
						Drag & Drop or <span>Click</span> to Upload
					</p>
				</div>

				{error && <p className={styles.Error}>{error}</p>}

				{file && <p className={styles.FileName}>Selected File: {file.name}</p>}

				{!loading ? (
					<button className={styles.UploadBtn} disabled={!file} onClick={handleUpload}>
						Upload
					</button>
				) : (
					<button className={styles.UploadBtn} disabled>
						Uploading ...
					</button>
				)}
			</div>
		</div>
	);
};

export default BulkUpload;
