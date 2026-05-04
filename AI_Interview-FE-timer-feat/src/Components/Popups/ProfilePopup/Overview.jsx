import React, { useState, useEffect } from "react";
import styles from "./ProfilePopup.module.scss";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { IoMdCall } from "react-icons/io";
import { IoMail } from "react-icons/io5";
import { axiosInstance2 } from "../../axios/axiosInstance2";

// --- Profile Details Component ---
const ProfileDetails = ({ profile }) => {
  return (
    <div className={`${styles.card} ${styles.profileDetails}`}>
      <h3 className={styles.cardTitle}>Profile Details</h3>
      <div className={styles.detailItem}>
        <IoMdCall />
        <span>{profile?.phone || "No Phone"}</span>
      </div>
      <div className={styles.detailItem}>
        <IoMail />
        <span>{profile?.email || "No Email"}</span>
      </div>
    </div>
  );
};

// --- Skills Component ---
const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axiosInstance2.get("/user/me");
        if (response.data?.data?.skills) {
          setSkills(response.data.data.skills);
        }
      } catch (err) {
        console.error("❌ Error fetching skills:", err);
      }
    };
    fetchSkills();
  }, []);

  // API call to update skills
  const updateSkillsAPI = async (updatedSkills) => {
    setLoading(true);
    try {
      const response = await axiosInstance2.patch("/user/update", {
        skills: updatedSkills,
      });
      console.log("✅ Skills updated:", response.data);
    } catch (err) {
      console.error("❌ Error updating skills:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);

    // Update backend
    updateSkillsAPI(updatedSkills);
  };

  return (
    <div className={styles.card} style={{ marginTop: "1.5rem" }}>
      <h3 className={styles.cardTitle}>
        Skills {loading && <span className={styles.loading}>⏳</span>}
      </h3>
      <div className={styles.skillsGrid}>
        {skills.map((skill) => (
          <div key={skill} className={styles.skillTag}>
            <span>{skill}</span>
            {/* <button
              onClick={() => handleRemoveSkill(skill)}
              className={styles.removeButton}
            >
              &times;
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Progress Chart Component ---
const ProgressCircle = () => {
  const progress = 65;
  const data = [{ name: "Progress", value: progress, fill: "#00e0c6" }];

  return (
    <div className={styles.progressContainer}>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
            barSize={15}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              background={{ fill: "#ffffff" }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className={styles.chartText}>{progress}%</div>
      </div>
      <p className={styles.chartLabel}>My Progress</p>
    </div>
  );
};

// --- Main Overview Component ---
export default function Overview({ profile }) {
  return (
    <div className={styles.Overview}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        <ProfileDetails profile={profile} />
        <Skills />
      </div>
      {/* Right Column */}
      {/* <div className={styles.rightColumn}>
        <ProgressCircle />
      </div> */}
    </div>
  );
}
