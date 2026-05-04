import React, { useState } from "react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const Candidate03 = ({ setProjectPopup, project, setProject }) => {
	const [item, setItem] = useState(
		project.length > 0
			? [...project]
			: [
					{
						projectName: "",
						desc: "",
						startTime: "",
						endTime: "",
					},
					{
						projectName: "",
						desc: "",
						startTime: "",
						endTime: "",
					},
			  ]
	);

	const addMore = () => {
		const data = {
			projectName: "",
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
		setProject(tempItem);
	};

	return (
		<BackgroundWrapper
			close={() => {
				setProjectPopup(false);
			}}
			height={"auto"}
			width={"auto"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate03}`}>
				<div className={styles.Header}>
					<h2>Edit Projects</h2>

					<button className={styles.AddMoreBtn} onClick={addMore}>
						Add More
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
											<label>Project Name</label>

											<div className={styles.Input}>
												<input type="text" value={data.projectName} onChange={(e) => handelOnChange(e, index, "projectName")} />
											</div>
										</div>

										<div className={styles.InputWrapper}>
											<label>Write some thing about project</label>

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
						<button onClick={()=>setProjectPopup(false)}>Okay</button>
					</div>
				</div>
			</div>
		</BackgroundWrapper>
	);
};

export default Candidate03;
