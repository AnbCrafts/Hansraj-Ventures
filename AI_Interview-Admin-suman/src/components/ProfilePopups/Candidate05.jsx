import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate05 = ({ setEducationPopup, education, setEducation }) => {
	const { state } = useLocation();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [item, setItem] = useState(
		education.length > 0
			? [...education]
			: [
					{
						name: "",
						desc: "",
						startTime: "",
						endTime: "",
					},
					{
						name: "",
						desc: "",
						startTime: "",
						endTime: "",
					},
			  ]
	);

	const addMore = () => {
		const data = {
			name: "",
			desc: "",
			startTime: "",
			endTime: "",
		};
		const temp = [...item];
		temp.push(data);
		setItem(temp);
	};

	const handelOnChange = (e, index, key) => {
		const value = e.target.value;
		let tempItem = [...item];
		let updatedItem = { ...tempItem[index] };
		updatedItem[key] = value;
		tempItem[index] = updatedItem;
		setItem(tempItem);
		setEducation(tempItem);
	};

	return (
		<BackgroundWrapper
			close={() => {
				setEducationPopup(false);
			}}
			height={"auto"}
			width={"auto"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate05}`}>
				<div className={styles.Header}>
					<h2>Edit Education</h2>

					<button className={styles.AddMoreBtn} onClick={addMore}>
						Add New field
					</button>
				</div>

				<div className={styles.Wrapper}>
					<div className={styles.InnerWrapper}>
						<div className={styles.BoxWrapper}>
							{item.map((data, index) => {
								return (
									<div className={styles.Box} key={index}>
										<span>{index + 1}</span>
										<div className={styles.InputWrapper}>
											<label>Name</label>

											<div className={styles.Input}>
												<input type="text" value={data.name} onChange={(e) => handelOnChange(e, index, "name")} />
											</div>
										</div>

										<div className={styles.InputWrapper}>
											<label>Write some thing about education</label>

											<div className={styles.Input} style={{ height: "5rem" }}>
												<textarea value={data.desc} onChange={(e) => handelOnChange(e, index, "desc")}></textarea>
											</div>
										</div>

										<div className={styles.Row}>
											<div className={styles.InputWrapper}>
												<label>Starting year</label>

												<div className={styles.Input}>
													<input type="text" value={data.startTime} onChange={(e) => handelOnChange(e, index, "startTime")} />
												</div>
											</div>

											<div className={styles.InputWrapper}>
												<label>Ending Year</label>

												<div className={styles.Input}>
													<input type="text" value={data.endTime} onChange={(e) => handelOnChange(e, index, "endTime")} />
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className={styles.ButtonWrapper}>
						<button disabled={loading} onClick={()=>setEducationPopup(false)} className={styles.CancelBtn}>
							Okay
						</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate05;
