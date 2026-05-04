import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import TrashCanIcon from "../../assets/icon/TrashCanIcon.svg?react";
import BackgroundWrapper from "./BackgroundWrapper";
import styles from "./PopupStyles.module.scss";

const SkillAdd = ({ setSkillPopup, allSkillsOption, setSkills, skillDetails, setSkillDetails }) => {
	const [loading, setLoading] = useState(false);
	const [skillsAddPopup, setSkillsAddPopup] = useState(skillDetails.length === 0 ? true : false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [main, setMain] = useState("");
	const [sub, setSub] = useState("");
	const [skill, setSkill] = useState([]);

	const addInMainObj = () => {
		const obj = { main: "", sub: "", skills: [] };
		obj.main = main;
		obj.sub = sub;
		obj.skills = skill;

		const temp = [...skillDetails];
		temp.push(obj);
		setSkillDetails(temp);

		setMain("");
		setSub("");
		setSkill([]);
		setSkillsAddPopup(false);
	};

	const removeSkillSet = (index) => {
		let newData = [...skillDetails];
		newData.splice(index, 1);
		setSkillDetails([...newData]);
	};

	const handelSave = () => {
		if (skillDetails.length === 0) return toast.error("Please add some skills !!");
		let skills = [];

		skillDetails.map((data) => {
			data.skills.map((skill) => {
				if (!skills.includes(skill)) skills.push(skill);
			});
		});
		setSkills(skills);
		setSkillPopup(false);
	};

	return (
		<BackgroundWrapper
			close={() => {
				setSkillPopup(false);
			}}
			height={"auto"}
			width={skillsAddPopup ? "40rem" : "45rem"}>
			<div className={`${styles.WrapperMain} ${styles.Candidate04}`}>
				{skillsAddPopup ? (
					<>
						<div className={styles.Header}>
							<h2>Add Skills</h2>
						</div>

						<div className={styles.PopupContainer}>
							{main === "" ? (
								<div className={styles.InputWrapper}>
									<label>Select Main Category</label>

									<div className={styles.Input}>
										<select value={main} onChange={(e) => setMain(e.target.value)}>
											<option value="" disabled>
												Select Main Category
											</option>
											{allSkillsOption.mainCategories.map((item, index) => (
												<option key={index} value={item}>
													{item}
												</option>
											))}
										</select>
									</div>
								</div>
							) : (
								<>
									<div className={styles.InputWrapper}>
										<label>Select Sub Category</label>

										<div className={styles.Input}>
											<select value={sub} onChange={(e) => setSub(e.target.value)}>
												<option value="" disabled>
													Select Sub Category
												</option>

												{allSkillsOption.subcategories.map((item, index) => {
													if (item.mainCategory === main)
														return (
															<option key={index} value={item.subCategory}>
																{item.subCategory}
															</option>
														);
												})}
											</select>
										</div>
									</div>

									{sub !== "" && (
										<div className={styles.InputWrapper}>
											<label>Select Skills</label>

											<div className={styles.SelectWrapper}>
												{allSkillsOption.allSkills.map((data, index) => {
													if (data.mainCategory === main && data.subCategory === sub) {
														return data.skills.map((s, i) => {
															return (
																<div key={i}>
																	<input
																		type="checkbox"
																		id={s}
																		onChange={(e) => {
																			let temp = [...skill];
																			if (e.target.checked) temp.push(s);
																			else temp = temp.filter((item) => item !== s);
																			setSkill(temp);
																		}}
																	/>
																	<label htmlFor={s}>{s}</label>
																</div>
															);
														});
													}
												})}
											</div>
										</div>
									)}

									{sub !== "" && skill.length > 0 && (
										<div className={styles.ButtonWrapper}>
											<button onClick={addInMainObj}>Add</button>
										</div>
									)}
								</>
							)}
						</div>
					</>
				) : (
					<>
						<div className={styles.Header}>
							<h2>Edit Skills</h2>

							<button className={styles.AddMoreBtn} onClick={() => setSkillsAddPopup(true)}>
								<span>+</span>Add New Skills
							</button>
						</div>

						<div className={styles.Wrapper}>
							<div className={styles.BoxWrapper}>
								{skillDetails.length === 0 && <h4>No skills present</h4>}

								{skillDetails.map((data, index) => {
									return (
										<div className={styles.Box} key={index}>
											<button className={styles.DeleteBtn} onClick={() => removeSkillSet(index)}>
												<TrashCanIcon />
											</button>

											<div className={styles.TopSection}>
												<p>
													{data.main}
													<span>{data.sub}</span>
												</p>
											</div>

											<div className={styles.BottomSection}>
												{data.skills.map((data, index) => {
													return (
														<div key={index}>
															<input type="checkbox" id={data} checked={true} readOnly />
															<label htmlFor={data}>{data}</label>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>

							<div className={styles.ButtonWrapper}>
								<button onClick={handelSave} disabled={loading}>
									{loading ? "Loading..." : "Update"}
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</BackgroundWrapper>
	);
};

export default SkillAdd;
