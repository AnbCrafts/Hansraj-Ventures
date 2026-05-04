import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import styles from "./ProfilePopup.module.scss";

// --- Reusable Sub-Component for the Progress Circles ---
const ProgressCircle = ({ value, label, color }) => {
    const data = [{ name: "progress", value, fill: color }];

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={30}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar background={{ fill: "rgba(255, 255, 255, 1)" }} dataKey="value" cornerRadius={10} />
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={1} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className={styles.chartText} style={{ color: color }}>
                    {value}%
                </div>
            </div>
            <p className={styles.chartLabel}>{label}</p>
        </div>
    );
};

// --- Reusable Sub-Component for List Items ---
const ActivityItem = ({ text, time, date, status }) => (
    <li className={styles.activityItem}>
        <div className={styles.statusDot} style={{ backgroundColor: status === "completed" ? "#00e0c6" : "#f87171" }} />
        <div>
            <p className={styles.activityText}>
                {text} at {time}
            </p>
            <p className={styles.activityDate}>{date}</p>
        </div>
    </li>
);

// --- Reusable Sub-Component for Stat Cards ---
const StatCard = ({ label, value, status }) => (
    <div className={styles.statCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className={styles.statusDot} style={{ backgroundColor: status === "completed" ? "#00e0c6" : "#f87171" }} />
            <p className={styles.statLabel}>{label}</p>
        </div>
        <p className={styles.statValue} style={{ color: status === "completed" ? "#00e0c6" : "#f87171" }}>
            {value}
        </p>
    </div>
);
const Activity = () => {
    return (
        <div className={styles.Activity}>
            <div className={styles.column}>
                {/* Today's Activities */}
                <section>
                    <h2 className={styles.header}>Today</h2>
                    <ul className={styles.activityList}>
                        <ActivityItem text="Interview completed" time="11:30" date="Sep 10, 2025" status="completed" />
                        <ActivityItem text="Interview Scheduled" time="4:30" date="Sep 10, 2025" status="completed" />
                    </ul>
                </section>

                {/* Yesterday's Activities */}
                <section className={{ marginTop: "2rem" }}>
                    <h2 className={styles.header}>Yesterday</h2>
                    <ul className={styles.activityList}>
                        <ActivityItem text="Interview completed" time="11:30" date="Sep 10, 2025" status="completed" />
                        <ActivityItem text="Interview incompleted" time="11:30" date="Sep 10, 2025" status="incomplete" />
                        <ActivityItem text="Test assessment completed" time="11:30" date="Sep 10, 2025" status="completed" />
                    </ul>
                </section>
            </div>

            <div className={styles.column}>
                {/* Progress Charts */}
                <div className={styles.chartsGrid}>
                    <ProgressCircle value={55} label="Communication" color="#00FFD1" />
                    <ProgressCircle value={35} label="Body Language" color="#00FFD1" />
                    <ProgressCircle value={70} label="Presentation" color="#00FFD1" />
                </div>

                {/* Stat Cards */}
                <div className={styles.statsContainer}>
                    <StatCard label="Roles Applied" value={5} status="completed" />
                    <StatCard label="Skipped Interview" value={3} status="incomplete" />
                </div>
            </div>
        </div>
    );
};

export default Activity;
