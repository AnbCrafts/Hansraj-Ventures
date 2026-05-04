import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Dialer from "../../assets/svg/Dialer.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Message from "../../assets/svg/Message.svg?react";
import { setCompany, setReload } from "../../redux/slices/popupSlice";
import axios from "../Hooks/axios";
import styles from "./CompanyPopup.module.scss";

const CompanyPopup = () => {
	const dispatch = useDispatch();
	const { activeData } = useSelector((s) => s.popup);
	const [isLoading, setIsLoading] = useState(false);

	const handelBlockUser = (status) => {
		setIsLoading(true);

		const raw = {
			id: activeData._id,
			block: !status,
			reason: "",
		};
		axios
			.put(`/user/block-unblock`, raw)
			.then(({ data }) => {
				toast.success(data.msg);
				setIsLoading(false);
				dispatch(setCompany({ isActive: true, activeData: data.data }));
				dispatch(setReload());
			})
			.catch((response) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div className={styles.PopupBackground} onClick={() => dispatch(setCompany({ isActive: false, activeData: null }))}>
			<div className={styles.Wrapper} onClick={(e) => e.stopPropagation()}>
				{/* back button */}
				<div className={styles.ButtonWrapper}>
					<button
						onClick={() => handelBlockUser(activeData?.blocked_status)}
						disabled={isLoading}
						className={`${styles.BlockBtn} ${!activeData?.blocked_status ? styles.Active : ""}`}>
						{isLoading ? "Loading..." : !activeData?.blocked_status ? "Block user" : "Unblock User"}
					</button>

					<button
						onClick={() => dispatch(setCompany({ isActive: false, activeData: null }))}
						className={styles.BackBtn}>
						Back
					</button>
				</div>

				<div className={styles.Row1}>
					<img src={activeData.profileImage} alt="" />
					<div className={styles.Details}>
						<h3>{activeData?.name}</h3>
						<h4>{activeData?.email}</h4>
					</div>
				</div>

				<h2>Personal Details</h2>

				<div className={styles.InputWrapper}>
					<label htmlFor="phone">Phone</label>
					<input type="text" id="phone" readOnly placeholder="phone" value={activeData?.phone} />
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="alternativePhone">Alternative Phone</label>
					<input
						type="text"
						id="alternativePhone"
						readOnly
						placeholder="alternativePhone"
						value={activeData?.alternativePhone}
					/>
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="dob">DOB</label>
					<input type="text" id="dob" readOnly placeholder="dob" value={activeData?.dob} />
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="about">About</label>
					<textarea
						id="about"
						readOnly
						placeholder="About"
						value={activeData?.about}
						style={{ height: "10rem" }}></textarea>
				</div>

				<h2 style={{ marginTop: "1rem" }}>Company Contact Info</h2>

				<div className={styles.InputWrapper}>
					<label htmlFor="name">Company Name</label>
					<input type="text" id="name" readOnly placeholder="Company Name" value={activeData?.companyName} />
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="about">About Company</label>
					<textarea
						id="about"
						readOnly
						placeholder="About Company"
						value={activeData?.aboutCompany}
						style={{ height: "10rem" }}
					/>
				</div>

				<div className={styles.InputWrapper1}>
					<label htmlFor="companyPhone">Company Phone</label>
					<div className={styles.Input}>
						<Dialer />
						<input
							type="text"
							id="companyPhone"
							placeholder="Company Phone"
							readOnly
							value={activeData?.companyPhone}
						/>
					</div>
				</div>

				<div className={styles.InputWrapper1}>
					<label htmlFor="companyAlternativePhone">Company Alternative Phone</label>
					<div className={styles.Input}>
						<Dialer />
						<input
							type="text"
							id="companyAlternativePhone"
							placeholder="Company Alternative Phone Number"
							readOnly
							value={activeData?.companyAlternativePhone}
						/>
					</div>
				</div>

				<div className={styles.InputWrapper1}>
					<label htmlFor="companyEmail">Company Email</label>
					<div className={styles.Input}>
						<Message />
						<input
							type="companyEmail"
							id="companyEmail"
							placeholder="Phone Number"
							readOnly
							value={activeData?.companyEmail}
						/>
					</div>
				</div>

				<div className={styles.InputWrapper1}>
					<label htmlFor="address">Address</label>
					<div className={styles.Input}>
						<Map />
						<input type="text" id="address" placeholder="Current Location..." readOnly value={activeData?.location} />
					</div>
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="companyType">Company Type</label>
					<input type="text" id="companyType" readOnly placeholder="companyType" value={activeData?.companyType} />
				</div>

				<div className={styles.InputWrapper}>
					<label htmlFor="createdAt">Register Date & Time</label>
					<input type="text" id="createdAt" readOnly placeholder="createdAt" value={activeData?.createdAt} />
				</div>

				<div className={styles.InputWrapper1}>
					<label htmlFor="address">Company Logo</label>
					<img src={activeData.companyLogo} alt="" />
				</div>

				<div className={styles.InputWrapper}>
					<label>Profile Progress Bar: {activeData.profileComplete}%</label>

					<div className={styles.bar}>
						<span style={{ width: `${activeData.profileComplete}%` }}></span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompanyPopup;
