import styles from "./ProfilePopup.module.scss";
import { setActivePopup } from "../../../Redux/Slices/PopupSlice";
import { useDispatch, useSelector } from "react-redux";
import defaultProfile from "../../../assets/SVG/profile.png";
import Phone from "../../../assets/SVG/phone.svg?react";
import Resume from "../../../assets/SVG/resume.svg?react";
import { useEffect, useState } from "react";
import { axiosInstance2 } from "../../axios/axiosInstance2";
import Skills from "./Skills";
import Activity from "./Activity";
import Overview from "./Overview";
import ProfileUpdate from "./ProfileUpdate";

const ProfilePopup = () => {
    const dispatch = useDispatch();
    const { reload } = useSelector((state) => state.popup);
    const { token } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("Overview");
    const [profile, setProfile] = useState(null);

    //Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axiosInstance2.get("/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(data.data);
            } catch (err) {
                console.log("Error fetching profile:", err);
            }
        };

        if (token) fetchProfile();
    }, [token, reload]);

    return (
        <div className={styles.overlay} onClick={() => dispatch(setActivePopup(""))}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <header>
                    <div className={`${styles.Box} ${styles.profile}`}>
                        <img src={profile?.profileImage || defaultProfile} alt="Profile" />
                        <div>
                            <h1>{profile?.name || "User Name"}</h1>
                            <p className={styles.id}>ID: {profile?.id || "N/A"}</p>
                        </div>
                        <i>
                            <Resume />
                        </i>
                    </div>

                    <div className={styles.Box}>
                        <h1>Resume</h1>
                        <p className={styles.value}>{profile?.resumes?.length || 0}</p>
                    </div>
                    {/* <div className={styles.Box}>
            <h1>Overall Rating</h1>
            <p className={styles.value}>3</p>
          </div> */}
                </header>
                <div className={styles.divider}>
                    <hr className={styles.line} />
                </div>
                <div className={styles.tabs}>
                    <button onClick={() => setActiveTab("Overview")}>Overview</button>
                    <button onClick={() => setActiveTab("Skills")}>Skills</button>
                    <button onClick={() => setActiveTab("Update")}>Update</button>
                    {/* <button onClick={() => setActiveTab("Activity")}>Activities</button> */}
                </div>
                <div className={styles.divider}>
                    <hr className={styles.line} />
                </div>
                <main>
                    {activeTab === "Overview" && <Overview profile={profile} />}
                    {activeTab === "Skills" && <Skills />}
                    {activeTab === "Update" && <ProfileUpdate />}
                    {/* {activeTab === "Activity" && <Activity />} */}
                </main>
            </div>
        </div>
    );
};

export default ProfilePopup;
