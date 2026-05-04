import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CircleRoundCheck from "../../assets/icons/CircleRoundCheck.svg?react";
import TargetIcon from "../../assets/icons/TargetIcon.svg?react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";
import Calender from "../../assets/svg/Calender.svg?react";
import Clock from "../../assets/svg/Clock.svg?react";
import Company from "../../assets/svg/Company.svg?react";
import Dollar from "../../assets/svg/Dollar.svg?react";
import Dot from "../../assets/svg/Dot.svg?react";
import Hired from "../../assets/svg/Hired.svg?react";
import Interview from "../../assets/svg/Interview.svg?react";
import Map from "../../assets/svg/Map.svg?react";
import Person from "../../assets/svg/Person.svg?react";
import Plus from "../../assets/svg/Plus.svg?react";
import Remote from "../../assets/svg/Remote.svg?react";
import User from "../../assets/svg/User.svg?react";
import Work from "../../assets/svg/Work.svg?react";
import { formatDate, formatDate2 } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setJobTarge } from "../../redux/slices/popupSlice";
import styles from "./Dashboard.module.scss";
import { updateUser } from "../../redux/slices/authSlice";

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId, userData } = useSelector((s) => s.auth);
    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLongNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    // Today
    const [todayData, setTodayData] = useState([]);
    const [todayLoading, setTodayLoading] = useState(false);
    // State

    const [stateData, setStateData] = useState([]);
    const [dashboardData, setDashboardData] = useState({});

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear());
        setMonth(date.getMonth());
        setDay(date.getDate());
    }, []);

    useEffect(() => {
        axios
            .get(`/admin/dashboard_stats`)
            .then(({ data }) => {
                setDashboardData(data.data);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, []);

    // Interview bar chart using Recharts
function InterviewBarChart({ data }) {
    const chartData = [
        { name: "Scheduled", value: data?.scheduled_interviews || 0 },
        { name: "Completed", value: data?.completed_interviews || 0 },
        { name: "Cancelled", value: data?.cancelled_interviews || 0 },
        { name: "Total", value: data?.total_interviews || 0 },
    ];
    return (
        <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23294622" />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={13} />
                <YAxis stroke="#cbd5e1" fontSize={13} allowDecimals={false} />
                <Tooltip cursor={false} wrapperStyle={{ background: '#232946', border: 'none', borderRadius: 8, color: '#fff' }} contentStyle={{ background: '#232946', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="value" fill="#6C63FF" radius={[6, 6, 0, 0]} barSize={40}>
                    <LabelList dataKey="value" position="top" fill="#fff" fontSize={13} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// Candidate bar chart using Recharts
function CandidateBarChart({ data }) {
    const chartData = [
        { name: "Total", value: data?.total_candidates || 0 },
        { name: "Hired", value: data?.hired_candidates || 0 },
    ];
    return (
        <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23294622" />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={13} />
                <YAxis stroke="#cbd5e1" fontSize={13} allowDecimals={false} />
                <Tooltip cursor={false} wrapperStyle={{ background: '#232946', border: 'none', borderRadius: 8, color: '#fff' }} contentStyle={{ background: '#232946', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="value" fill="#00ffd1" radius={[6, 6, 0, 0]} barSize={40}>
                    <LabelList dataKey="value" position="top" fill="#fff" fontSize={13} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
    return (
        <div className={styles.Dashboard}>
            <div className={styles.Row1}>
                <div className={styles.Col1}>
                    <div className={styles.Top}>
                        <span>
                            <Work />
                        </span>
                        <div className={styles.Details}>
                            <p>Total Candidates</p>
                            <h3>{dashboardData?.total_candidates}</h3>
                        </div>
                    </div>

                    {/* <div className={styles.Bottom}>
						<div className={styles.Hike}>
							<p>28.5%</p>
							<Arrow />
						</div>
						<p>Since last week</p>
					</div> */}
                </div>

                <div className={styles.Col2}>
                    <div className={styles.Top}>
                        <span>
                            <User />
                        </span>
                        <div className={styles.Details}>
                            <p>Total Interviews</p>
                            <h3>{dashboardData?.total_interviews}</h3>
                        </div>
                    </div>
                    {/* <div className={styles.Bottom}>
						<div className={styles.Hike}>
							<p>28.5%</p>
							<Arrow />
						</div>
						<p>Since last week</p>
					</div> */}
                </div>

                <div className={styles.Col3}>
                    <div className={styles.Top}>
                        <span>
                            <Company />
                        </span>
                        <div className={styles.Details}>
                            <p>Completed Interviews</p>
                            <h3>{dashboardData?.completed_interviews}</h3>
                        </div>
                    </div>
                    {/* <div className={styles.Bottom}>
						<div className={`${styles.Hike} ${styles.Down}`}>
							<p>12.6%</p>
							<Arrow />
						</div>
						<p>Since last week</p>
					</div> */}
                </div>

                <div className={styles.Col4}>
                    <div className={styles.Top}>
                        <span>
                            <Interview />
                        </span>
                        <div className={styles.Details}>
                            <p>Scheduled Interview </p>
                            <h3>{dashboardData?.scheduled_interviews}</h3>
                        </div>
                    </div>

                    {/* <div className={styles.Bottom}>
						<div className={styles.Hike}>
							<p>28.5%</p>
							<Arrow />
						</div>
						<p>Since last week</p>
					</div> */}
                </div>

                <div className={styles.Col5}>
                    <div className={styles.Top}>
                        <span>
                            <Interview />
                        </span>
                        <div className={styles.Details}>
                            <p>Cancelled Interview</p>
                            <h3>{dashboardData?.cancelled_interviews}</h3>
                        </div>
                    </div>

                    {/* <div className={styles.Bottom}>
                        <div className={styles.Hike}>
                            <p>28.5%</p>
                            <Arrow />
                        </div>
                        <p>Since last week</p>
                    </div> */}
                </div>

                <div className={styles.Col6}>
                    <div className={styles.Top}>
                        <span>
                            <Hired />
                        </span>
                        <div className={styles.Details}>
                            <p>Total Hired</p>
                            <h3>{dashboardData?.hired_candidates}</h3>
                        </div>
                    </div>
                    {/* <div className={styles.Bottom}>
						<div className={styles.Hike}>
							<p>28.5%</p>
							<Arrow />
						</div>
						<p>Since last week</p>
					</div> */}
                </div>
            </div>

            <div className={styles.Row2}>
                <div className={styles.Col1}>
                    <h3 >Interview Stats</h3>
                    <InterviewBarChart data={dashboardData} />
                    <h3 >Candidate Stats</h3>
                    <CandidateBarChart data={dashboardData} />
                </div>

{/* 
                <div className={styles.Col2}>
                    <h2>Today Meetings</h2>
                    <h2>Lorem Ipsum dolor</h2>

                    {todayLoading ? (
                        <Loading height="5rem" width="5rem" />
                    ) : (
                        <div className={styles.Meetings}>
                            {todayData.slice(0, 4).map((data, index) => {
                                return (
                                    <div key={index} className={styles.MeetCard} onClick={() => navigate("/interviews")}>
                                        <div className={styles.LeftSection}>
                                            <img src={data?.jobId?.companyLogo} alt="" />

                                            <div className={styles.Details}>
                                                <h3>{data?.jobId?.jobTittle}</h3>

                                                <div className={styles.Date}>
                                                    <p>{formatDate2(data?.interviewsDate)}</p>
                                                    <p>{data?.interviewsTime}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.RightSection}>
                                            <h4>Interview With</h4>

                                            <div className={styles.Profile}>
                                                <img src={data?.applicantId?.profileImage} alt="" />

                                                <div className={styles.Details}>
                                                    <h5>{data?.applicantId?.name}</h5>
                                                    <p>{data?.applicantId?.profession}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div> */}
            </div>

            {/* <div className={styles.Row3}>
				<div className={styles.Col1}>
					<h3>Interviews Progress</h3>

					{stateLoading ? (
						<Loading height="4rem" width="4rem" />
					) : (
						<div className={styles.ContentWrapper}>
							<div className={styles.Left}>
								<div className={styles.Text}>
									<h2>
										{stateData?.done}/{stateData?.total}
									</h2>
									<p>Interviews Done</p>
								</div>

								<div className={styles.Bar}>
									<div style={{ width: `${(stateData?.done / stateData?.total) * 100}%` }} />
								</div>
							</div>

							<div className={styles.Right}>
								<div className={styles.W}>
									<div className={styles.I}></div>

									<div className={styles.T}>
										<span>Done</span>
										<p>{stateData?.done} Interviews</p>
									</div>
								</div>

								<div className={styles.W}>
									<div className={styles.I} style={{ opacity: ".4" }}></div>

									<div className={styles.T}>
										<span>inb Process</span>
										<p>{stateData?.inProcess} Interviews</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className={styles.Col2}>
					{targetLoading ? (
						<Loading height="4rem" width="4rem" />
					) : (
						<>
							<div className={styles.InnerRow1}>
								<Calender />
								<h2>
									{year} , {monthLongNames[month]}
								</h2>
								<span>Target</span>
							</div>

							<div className={styles.InnerRow2}>
								<div className={styles.progress} style={{ width: "80%" }}></div>
								<div
									className={styles.done}
									style={{ width: `${(targetData?.jobsDone / targetData?.jobsTarget) * 100}%` }}></div>
							</div>

							<div className={styles.InnerRow3}>
								<div className={styles.Left}>
									<div>
										<h3>{targetData?.jobsDone}</h3>
										<h4>Jobs Done</h4>
										<CircleRoundCheck />
									</div>

									<div>
										<h3>{targetData?.jobsTarget}</h3>
										<h4>Target</h4>
										<TargetIcon />
									</div>
								</div>

								<button
									className={styles.Right}
									onClick={() => dispatch(setJobTarge({ state: true, data: targetData }))}>
									View Jobs
								</button>
							</div>
						</>
					)}
				</div>
			</div> */}
        </div>
    );
};

export default Dashboard;
