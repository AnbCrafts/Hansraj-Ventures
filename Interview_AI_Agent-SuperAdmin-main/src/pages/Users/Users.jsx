import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Filter from "../../assets/svg/Filter.svg?react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import ThreeDot from "../../assets/svg/ThreeDot.svg?react";
import { formatDate, formatDate2 } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setCandidatePopup, setCompany, setJobSeeker } from "../../redux/slices/popupSlice";
import styles from "./Users.module.scss";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Users = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // State for all API data
    const [overview, setOverview] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [topUsers, setTopUsers] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentLoading, setRecentLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [topUsersLoading, setTopUsersLoading] = useState(false);

    // Pagination for recent users
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // Effect for data that loads ONCE on component mount
    useEffect(() => {
        setOverviewLoading(true);
        setPaymentLoading(true);
        setTopUsersLoading(true);

        axios
            .get("/superAdmin/stats/overview")
            .then(({ data }) => setOverview(data.data))
            .catch(() => {})
            .finally(() => setOverviewLoading(false));

        axios
            .get("/superAdmin/stats/payment-status")
            .then(({ data }) => setPaymentStatus(data.data))
            .catch(() => {})
            .finally(() => setPaymentLoading(false));

        axios
            .get("/superAdmin/stats/top-users")
            .then(({ data }) => setTopUsers(data.data))
            .catch(() => {})
            .finally(() => setTopUsersLoading(false));
    }, []); // Empty dependency array means this runs only once

    // Effect for paginated data that re-loads when 'currentPage' changes
    useEffect(() => {
        setRecentLoading(true);

        axios
            .get(`/superAdmin/stats/user-recent?page=${currentPage}`)
            .then(({ data }) => {
                setRecentUsers(data.data);
                setTotalPage(data.pagination?.total_pages || 1);
            })
            .catch(() => {})
            .finally(() => setRecentLoading(false));
    }, [currentPage]); // This effect depends on 'currentPage'

    return (
        <div className={styles.ManageUsers}>
            {/* --- Overview Stats --- */}
            <div className={styles.OverviewStats}>
                {overviewLoading ? (
                    <Loading height="3rem" width="3rem" />
                ) : (
                    overview && (
                        <div className={styles.StatsGrid}>
                            <div>
                                <h4>Total Users</h4>
                                <p>{overview.total_users}</p>
                            </div>
                            <div>
                                <h4>Total Revenue</h4>
                                <p>$ {overview.total_revenue}</p>
                            </div>
                            <div>
                                <h4>Average Revenue/User</h4>
                                <p>$ {overview.average_revenue_per_user}</p>
                            </div>
                            <div>
                                <h4>Total Payments</h4>
                                <p>{overview.total_payments}</p>
                            </div>
                            <div>
                                <h4>Failed Transactions</h4>
                                <p>{overview.failed_transactions}</p>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* --- Payment Status Bar Chart --- */}
            {console.log(paymentStatus)}
            <div className={styles.PaymentStatusChart}>
                {paymentLoading ? (
                    <Loading height="3rem" width="3rem" />
                ) : (
                    paymentStatus && (
                        <>
                            <h3>Payment Status Summary</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    data={Object.entries(paymentStatus).map(([key, value]) => ({
                                        name: key.charAt(0).toUpperCase() + key.slice(1),
                                        value,
                                    }))}
                                >
                                    <XAxis dataKey="name" stroke="#374151" tick={{ fontSize: 14 }} />
                                    <YAxis allowDecimals={false} stroke="#374151" />
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
                                    <Bar dataKey="value" fill="#6C63FF" />
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    )
                )}
            </div>

            {/* --- Top Users Table --- */}
            <div className={styles.TopUsersSection}>
                <h3>Top Users</h3>
                {topUsersLoading ? (
                    <Loading height="3rem" width="3rem" />
                ) : (
                    <table className={styles.TopUsersTable}>
                        <thead>
                            <tr>
                                <th className={styles.colSNo}>S no</th>
                                <th className={styles.colName}>Name</th>
                                <th className={styles.colEmail}>Email</th>
                                <th className={styles.colNumeric}>Credits</th>
                                <th className={styles.colNumeric}>Total Spent</th>
                                <th className={styles.colDate}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.slice(0, 5).map((user, idx) => (
                                <tr key={idx}>
                                    <td className={styles.colSNo}>{idx + 1}</td>
                                    <td className={styles.colName} title={user.name}>
                                        {user.name}
                                    </td>
                                    <td className={styles.colEmail} title={user.email}>
                                        {user.email}
                                    </td>
                                    <td className={styles.colNumeric}>{user.credits}</td>
                                    <td className={styles.colNumeric}>{user.total_spent}</td>
                                    <td className={styles.colDate}>{formatDate2(user.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Recent Users List (MODIFIED) --- */}
            {/* Using TopUsersSection class for consistent wrapper styling */}
            <div className={styles.TopUsersSection}>
                <h3>All Users</h3>

                {/* Removed the old div-based subHeading */}

                {recentLoading ? (
                    // Using consistent Loading component size
                    <Loading height="3rem" width="3rem" />
                ) : (
                    // Replaced div structure with table structure
                    // Using TopUsersTable class for consistent table styling
                    <table className={styles.TopUsersTable}>
                        <thead>
                            <tr>
                                <th className={styles.colSNo}>S no</th>
                                <th className={styles.colName}>Name</th>
                                <th className={styles.colEmail}>Email</th>
                                <th className={styles.colNumeric}>Credits</th>
                                <th className={styles.colNumeric}>Total Spent</th>
                                <th className={styles.colDate}>Joined</th>

                                {/* <th>Phone</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers?.length === 0 ? (
                                // Added a proper "No Users" row
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>
                                        No Users
                                    </td>
                                </tr>
                            ) : (
                                // Mapping data to <tr> and <td>
                                recentUsers.map((user, index) => (
                                    <tr key={index}>
                                        <td className={styles.colSNo}>
                                            {currentPage === 1 ? index + 1 : (currentPage - 1) * 10 + index + 1}
                                        </td>
                                        <td className={styles.colName} title={user.name}>
                                            {user.name}
                                        </td>
                                        <td className={styles.colEmail} title={user.email}>
                                            {user.email}
                                        </td>
                                        <td className={styles.colNumeric}>{user.credits}</td>
                                        <td className={styles.colNumeric}>{user.total_spent}</td>
                                        <td className={styles.colDate}>{new Date(user.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata", // Converts from UTC to IST
                                                dateStyle: "medium", // "31 Oct 2025"
                                                timeStyle: "short", // "11:38 am"
                                            })}</td>
                                        {/* <td>{user.phone || "-"}</td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Pagination (Unchanged) --- */}
            <div className={styles.pagination}>
                <div className={styles.records}>
                    Showing {recentUsers?.length || 0} users in page {currentPage || 1}{" "}
                </div>
                <div className={styles.pageButtons}>
                    <button className={styles.leftArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        <LeftArrow />
                    </button>
                    <div className={styles.pages}>
                        {Array(totalPage)
                            .fill("")
                            .slice(0, 5)
                            .map((data, index) => (
                                <div className={`${styles.buttons} ${currentPage === index + 1 ? styles.active : ""}`} key={index} onClick={() => setCurrentPage(index + 1)}>
                                    0{index + 1}
                                </div>
                            ))}
                    </div>
                    <button
                        className={styles.rightArrow}
                        disabled={currentPage === totalPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        <RightArrow />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Users;
