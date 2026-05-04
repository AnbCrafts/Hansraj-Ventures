import { Calendar, Check, Clock, Copy, Link } from "lucide-react";
import { useCallback, useState } from "react";
import { axiosInstance } from "../../components/axiosInstance";

const Meeting = () => {
	const [name, setName] = useState("");
	const [roomId, setRoomId] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [generatedLink, setGeneratedLink] = useState("");
	const [interviewId, setInterviewId] = useState("");
	const [copied, setCopied] = useState(false);
	const getToken = async () => {
		try {
			const { data } = await axiosInstance.get(`/getToken?name=${name}&room=${roomId}`);
			return data;
		} catch (error) {
			console.error(error);
		}
	};



	const createLink = async () => {
		if (name.length == 0) {alert("Please enter your name"); return ;}
			const token = await getToken();
			// console.log("Generated token:", token);
			// const baseUrl = window.location.origin; // Auto-detects current domain
			// const link = `${baseUrl}/join?interviewId=${interviewId}`;
			const mail_url = import.meta.env.MAIL_URL|| "http://localhost:5995";
			
			const link = `${mail_url}/join?token=${token}&interviewId=${interviewId}`;
			console.log("Interview url portions - ", mail_url)
			console.log("Interview url portions - ", token)
			console.log("Interview url portions - ", interviewId)
			// const link = `${baseUrl}/join?token=${token}&interviewId=${interviewId}`;
			setGeneratedLink(link);

	};

	const copyLink = async () => {
		if (generatedLink) {
			try {
				await navigator.clipboard.writeText(generatedLink);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy link:", err);
			}
		}
	};

	const isFormValid = () => {
		return true;
	};

	const styles = {
		container: {
			height: "100vh",
			background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
			padding: "2rem",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			overflowY: "scroll",
		},
		card: {
			maxWidth: "450px",
			width: "100%",
			background: "white",
			borderRadius: "12px",
			boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
			padding: "2rem",
		},
		header: {
			textAlign: "center",
			marginBottom: "2rem",
		},
		title: {
			fontSize: "1.5rem",
			fontWeight: "bold",
			color: "#1f2937",
			marginBottom: "0.5rem",
		},
		subtitle: {
			color: "#6b7280",
			fontSize: "0.9rem",
		},
		formGroup: {
			marginBottom: "1.5rem",
		},
		label: {
			display: "block",
			fontSize: "0.875rem",
			fontWeight: "500",
			color: "#374151",
			marginBottom: "0.5rem",
		},
		input: {
			width: "100%",
			padding: "0.75rem 1rem",
			border: "2px solid #d1d5db",
			borderRadius: "8px",
			fontSize: "1rem",
			outline: "none",
			transition: "all 0.2s",
			boxSizing: "border-box",
		},
		inputFocus: {
			borderColor: "#4f46e5",
			boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
		},
		timeGroup: {
			display: "flex",
			flexDirection: "column",
			gap: "1rem",
		},
		button: {
			width: "100%",
			padding: "0.75rem 1rem",
			border: "none",
			borderRadius: "8px",
			fontSize: "1rem",
			fontWeight: "500",
			cursor: "pointer",
			transition: "all 0.2s",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "0.5rem",
			background: "#4f46e5",
			color: "white",
		},
		buttonDisabled: {
			background: "#d1d5db",
			cursor: "not-allowed",
		},
		buttonHover: {
			background: "#4338ca",
		},
		linkDisplay: {
			background: "#f9fafb",
			border: "2px solid #e5e7eb",
			borderRadius: "8px",
			padding: "1rem",
			marginTop: "1.5rem",
		},
		linkGroup: {
			display: "flex",
			gap: "0.5rem",
			marginBottom: "0.75rem",
		},
		linkInput: {
			flex: "1",
			padding: "0.5rem 0.75rem",
			border: "1px solid #d1d5db",
			borderRadius: "6px",
			fontSize: "0.875rem",
			background: "white",
			outline: "none",
			color: "#000",
		},
		copyButton: {
			padding: "0.5rem 0.75rem",
			background: "#4f46e5",
			color: "white",
			border: "none",
			borderRadius: "6px",
			cursor: "pointer",
			transition: "background 0.2s",
			display: "flex",
			alignItems: "center",
		},
		successMessage: {
			color: "#059669",
			fontSize: "0.875rem",
			display: "flex",
			alignItems: "center",
			gap: "0.25rem",
		},
		timeInfo: {
			background: "#f3f4f6",
			borderRadius: "6px",
			padding: "0.75rem",
			marginTop: "0.5rem",
			fontSize: "0.875rem",
			color: "#4b5563",
		},
		errorText: {
			color: "#dc2626",
			fontSize: "0.875rem",
			marginTop: "0.25rem",
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<div style={styles.header}>
					<Calendar size={48} color="#4f46e5" style={{ margin: "0 auto 1rem" }} />
					<h1 style={styles.title}>Interview Link Generator</h1>
					<p style={styles.subtitle}>Create a personalized interview link with schedule</p>
				</div>

				<div style={styles.formGroup}>
					<label htmlFor="name" style={styles.label}>
						Interviewer Name
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter interviewer name"
						style={styles.input}
						onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
						onBlur={(e) => Object.assign(e.target.style, styles.input)}
					/>
				</div>
				<div style={styles.formGroup}>
					<label htmlFor="interviewId" style={styles.label}>
						Interviewer ID
					</label>
					<input
						type="text"
						id="interviewId"
						value={interviewId}
						onChange={(e) => setInterviewId(e.target.value)}
						placeholder="Enter interviewer ID"
						style={styles.input}
						onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
						onBlur={(e) => Object.assign(e.target.style, styles.input)}
					/>
				</div>

				<div style={styles.formGroup}>
					<label htmlFor="roomId" style={styles.label}>
						Room Id
					</label>
					<input
						type="text"
						id="roomId"
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
						placeholder="Enter Room Id"
						style={styles.input}
						onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
						onBlur={(e) => Object.assign(e.target.style, styles.input)}
					/>
				</div>

				<button
					onClick={createLink}
					disabled={!isFormValid()}
					style={{
						...styles.button,
						...(isFormValid() ? {} : styles.buttonDisabled),
					}}
					onMouseEnter={(e) => {
						if (isFormValid()) {
							e.target.style.background = "#4338ca";
						}
					}}
					onMouseLeave={(e) => {
						if (isFormValid()) {
							e.target.style.background = "#4f46e5";
						}
					}}>
					<Link size={20} />
					Generate Interview Link
				</button>

				{generatedLink && (
					<div style={styles.linkDisplay}>
						<label style={styles.label}>Generated Interview Link</label>
						<div style={styles.linkGroup}>
							<input type="text" value={generatedLink} readOnly style={styles.linkInput} />
							<button
								onClick={copyLink}
								style={styles.copyButton}
								title="Copy link"
								onMouseEnter={(e) => (e.target.style.background = "#4338ca")}
								onMouseLeave={(e) => (e.target.style.background = "#4f46e5")}>
								{copied ? <Check size={16} /> : <Copy size={16} />}
							</button>
						</div>

						{copied && (
							<div style={styles.successMessage}>
								<Check size={16} />
								Interview link copied to clipboard!
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Meeting;
