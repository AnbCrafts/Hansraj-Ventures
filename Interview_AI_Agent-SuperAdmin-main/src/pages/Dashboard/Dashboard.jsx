import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CircleRoundCheck from "../../assets/icons/CircleRoundCheck.svg?react";
import TargetIcon from "../../assets/icons/TargetIcon.svg?react";
import graph from "../../assets/images/graph.png";
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

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, XAxis, YAxis, Bar } from "recharts";

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
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        axios
            .get(`/superAdmin/dashboard/overview`)
            .then(({ data }) => {
                console.log(data.data);
                setDashboardData(data.data);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const interviewStatus = dashboardData?.interviews?.status_distribution || {};

    // We process the raw data into the format Recharts expects: an array of objects.
    const data = Object.entries(interviewStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
        value: count,
    }));

    // --- Colors ---
    // A color palette for the chart slices.
    // The colors will be applied in the order of the data array.
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#6C63FF"];
    return (
        <div className={styles.Dashboard}>
            <div className={styles.Row1}>
                <div className={styles.Col1}>
                    <div className={styles.Top}>
                        <span>
                            <Work />
                        </span>
                        <div className={styles.Details}>
                            <p>Active Admin</p>
                            <h3>{dashboardData?.admins?.total}</h3>
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
                            <p>Deleted Admins</p>
                            <h3>{dashboardData?.admins?.deleted}</h3>
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
                            <h3>{dashboardData?.interviews?.status_distribution?.completed}</h3>
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
                            <p>Interview scheduled</p>
                            <h3>{dashboardData?.interviews?.status_distribution?.scheduled}</h3>
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
                            <p>Cancelled Interviews</p>
                            <h3>{dashboardData?.interviews?.status_distribution?.cancelled}</h3>
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
                            <p>Total Interview</p>
                            <h3>{dashboardData?.interviews?.total}</h3>
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
                    {/* <img src={graph} alt="" />
                    <div>*/}
                    <h2>Interview Status</h2>

                    <ResponsiveContainer height={350}>
                        <PieChart>
                            {/* --- Tooltip --- */}
                            {/* This component shows data when you hover over a slice */}
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                offset={50}
                                contentStyle={{
                                    backgroundColor: "#374151", // bg-gray-800
                                    border: "1px solid #9ca3af", // border-gray-700
                                    borderRadius: "0.75rem", // rounded-xl

                                    // width: '5rem',
                                    // height: "2.5rem",
                                }}
                                labelStyle={{ color: "#9ca3af" }} // text-gray-400
                                itemStyle={{ color: "#e5e7eb" }} // text-gray-200
                            />

                            {/* --- Legend --- */}
                            {/* This component displays the name for each colored slice */}
                            <Legend iconType="circle" />

                            {/* --- Pie / Donut --- */}
                            {/* This is the main component for the circular chart */}
                            <Pie
                                data={data}
                                cx="50%" // Center X
                                cy="50%" // Center Y
                                innerRadius={80} // Creates the "donut" hole
                                outerRadius={120} // The outer edge of the pie
                                fill="#8884d8" // A default fill color
                                //paddingAngle={5} // Adds spacing between slices
                                dataKey="value" // The key in our data object that holds the value
                                nameKey="name" // The key for the label
                                // cornerRadius={8} // Rounds the corners of each slice
                            >
                                {/* --- Cells --- */}
                                {/* We map over our data to create a <Cell> for each slice. */}
                                {/* This allows us to assign a unique color to each one. */}
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.Col2}>
                    {/* <h2>Today Meetings</h2> */}
                    <h2>Agent Voice Distribution</h2>

                    {isLoading ? (
                        <Loading height="5rem" width="5rem" />
                    ) : (
                        <div className={styles.Meetings}>
                            {dashboardData?.agent_voices?.distribution ? (
                                <>
                                    <div style={{ marginBottom: "1rem", color: "#ffffff" }}>
                                        <strong>Most Used:</strong> {dashboardData.agent_voices.most_used} (
                                        {dashboardData.agent_voices.most_used_count})
                                    </div>
                                    {(() => {
                                        const voiceData = Object.entries(dashboardData.agent_voices.distribution).map(([voice, count]) => ({
                                            name: voice.charAt(0).toUpperCase() + voice.slice(1),
                                            value: count,
                                            isMostUsed: dashboardData.agent_voices.most_used === voice,
                                        }));
                                        return (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={voiceData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                                    <XAxis dataKey="name" stroke="#aaffee" tick={{ fontSize: 14 }} />
                                                    <YAxis allowDecimals={false} stroke="#a29dff" />
                                                    <Tooltip
                                                        cursor={{ fill: "transparent" }}
                                                        contentStyle={{
                                                            backgroundColor: "#374151",
                                                            border: "1px solid #9ca3af",
                                                            borderRadius: "0.75rem",
                                                            color: "#e5e7eb",
                                                        }}
                                                        labelStyle={{ color: "#9ca3af" }}
                                                        itemStyle={{ color: "#e5e7eb" }}
                                                    />
                                                    <Bar dataKey="value">
                                                        {voiceData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.isMostUsed ? "#6C63FF" : "#00C49F"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        );
                                    })()}
                                </>
                            ) : (
                                <p>No Data</p>
                            )}
                        </div>
                    )}
                </div>
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
