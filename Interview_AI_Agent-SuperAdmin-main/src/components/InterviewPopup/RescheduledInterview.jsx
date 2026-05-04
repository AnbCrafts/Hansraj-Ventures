import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setReload, setRescheduledPopup } from "../../redux/slices/popupSlice";
import { convert12to24 } from "../Functions/dateFormate";
import axios from "../Hooks/axios";
import styles from "./RescheduledInterview.module.scss";

const RescheduledInterview = () => {
	const dispatch = useDispatch();
	const { rescheduledData } = useSelector((s) => s.popup);

	const [time, setTime] = useState(convert12to24(rescheduledData?.temp?.newTime));
	const [date, setDate] = useState(rescheduledData?.temp?.newDate);
	const [desc, setDesc] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handelSubmit = () => {
		if (date === "" || time === "") return toast.warn("Please select date & time !");
		setIsLoading(true);
		const raw = {
			_id: rescheduledData._id,
			decision: "accept",
			newDate: rescheduledData?.temp?.newDate,
			newTime: rescheduledData?.temp?.newTime,
			link: desc,
		};

		axios
			.post(`/jobApplication/accept-reject-reschedule`, raw)
			.then(({ data }) => {
				console.log(data)
				toast.success("Interview time has been successfully changed!");
				setIsLoading(false);
				dispatch(setReload());
				dispatch(setRescheduledPopup({ state: false, data: null }));
			})
			.catch(({ response }) => {
				console.log("Error => ", response);
			});
	};

	return (
		<div className={styles.Container} onClick={() => dispatch(setRescheduledPopup({ state: false, data: null }))}>
			<div className={styles.Box} onClick={(e) => e.stopPropagation()}>
				<div className={styles.Main}>
					<div className={styles.MainTop}>
						<p>
							<span>Rescheduled </span>An {rescheduledData?.temp?.interviewType}
						</p>

						<button onClick={() => dispatch(setRescheduledPopup({ state: false, data: null }))}>
							Back
						</button>
					</div>

					<div className={styles.MainBottom}>
						<div className={styles.MainRow1}>
							<div>
								<p>Time</p>
								<input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
							</div>

							<div>
								<p>Date</p>
								<input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
							</div>
						</div>

						<div className={styles.MainRow2}>
							<p>
								link* <span>(Optional)</span>
							</p>

							<textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
						</div>
					</div>
				</div>

				<button className={styles.Submit} onClick={handelSubmit} disabled={isLoading}>
					Submit
				</button>
			</div>
		</div>
	);
};

export default RescheduledInterview;
