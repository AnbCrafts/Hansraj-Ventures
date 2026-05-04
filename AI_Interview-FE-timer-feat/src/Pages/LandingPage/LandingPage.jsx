import React from "react";
import { toast } from "react-toastify";
import Navbar from "../../Components/Navbar/Navbar";
import styles from "./LandingPage.module.scss";
import mic from "../../assets/SVG/mic.svg";
import { IoPlayOutline, IoStar } from "react-icons/io5";
import robot from "../../assets/Images/robot.png";
import { FiCheckCircle, FiUpload } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import adminDash from "../../assets/Images/adminDash.png";
import candidatePortal from "../../assets/Images/candidatePortal.png";
import { GrDocumentText } from "react-icons/gr";
import docs from "../../assets/SVG/docs.svg";
import link from "../../assets/SVG/link.svg";
import brain from "../../assets/SVG/brain.svg";
import shield from "../../assets/SVG/shield.svg";
import stats from "../../assets/SVG/stats.svg";
import bulk from "../../assets/SVG/bulk.svg";
import setting from "../../assets/SVG/setting.svg";
import diary from "../../assets/SVG/diary.svg";
import play from "../../assets/SVG/play.svg";
import Footer from "../../Components/Footer/Footer";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate()
    const cardData = [
        {
            id: 1,
            title: "Auto CV Extraction",
            description: "Parse name, email, phone from PDF/Doc instantly",
            icon: docs, // Placeholder for an icon, you can replace this with a component or SVG
        },
        {
            id: 2,
            title: "Unique Interview Links",
            description: "One click = one interview, no scheduling",
            icon: link, // Placeholder for an icon
        },
        {
            id: 3,
            title: "Smart Language AI",
            description: "Detects user language, accents auto-adjust",
            icon: brain, // Placeholder for an icon
        },
        {
            id: 4,
            title: "Face & Resume Validation",
            description: "AI compares spoken intro vs uploaded resume",
            icon: shield, // Placeholder for an icon
        },
        {
            id: 5,
            title: "AI-Generated Report",
            description: "Scores, flags, and role fit—automatically",
            icon: stats, // Placeholder for an icon
        },
        {
            id: 6,
            title: "HR Dashboard",
            description: "Bulk link generation, tracking, and re-sending",
            icon: bulk, // Placeholder for an icon
        },
    ];

    const adminHighlight = [
        {
            id: 1,
            title: "CV Tabs",
            description: "To be interviewed / Completed",
            icon: diary, // Placeholder for an icon, you can replace this with a component or SVG
            details: ["24 Pending", "156 Done"],
        },
        {
            id: 2,
            title: "AI Config Panel",
            description: "Language & Voice",
            icon: setting, // Placeholder for an icon
            details: ["US Female", "Auto-detect"],
        },
        {
            id: 3,
            title: "Link Generator",
            description: "With retry, preview",
            icon: link, // Placeholder for an icon
            details: ["Sent", "Retry"],
        },
        {
            id: 4,
            title: "Reports",
            description: "PDF download, Match %",
            icon: docs, // Placeholder for an icon
            details: ["92% Match", "PDF Ready"],
        },
    ];

    const testimonials = [
        {
            id: 1,
            rating: 5, // A numerical value for the star rating
            quote: "Used this for 500+ interviews in 10 days—saved 90% effort.",
            author: "Talent Head",
            authorCompany: "FinTechCo",
        },
        {
            id: 2,
            rating: 5,
            quote: "Incredibly simple for our non-tech candidates.",
            author: "Startup HR Manager",
            authorCompany: "TechStart",
        },
    ];

    const companies = ["TechCorp", "InnovateLab", "StartupHub", "GrowthCo", "FinTechCo", "DevStudio"];
    return (
        <div className={styles.container}>
            <Navbar className={styles.navbar} />
            <section className={styles.heroSection}>
                <h3>
                    <img src={mic} alt="" />
                    <span>AI-Powered Interviews</span>
                </h3>
                <h1>Smarter. Faster. Fairer.</h1>
                <p>
                    One link. One click. Complete candidate screening— <span className={styles.highlight1}>voice</span>,
                    <span className={styles.highlight2}>face</span>, and CV <br /> matched
                </p>
                <div className={styles.buttons}>
                    <button className={styles.demo} onClick={()=> navigate("dashboard")}>
                        {" "}
                        <IoPlayOutline />
                        Try Candidate Demo
                    </button>
                    <button className={styles.exploreHR} onClick={()=> navigate("dashboard")}>Explore HR Dashboard</button>
                </div>
                <div className={styles.robot}>
                    <img src={robot} alt="" />
                </div>
            </section>
            <section className={styles.whatItDoes}>
                <h1>What it does</h1>
                <p className={styles.description}>Split experience designed for both candidates and HR teams</p>
                <div className={styles.cards}>
                    <div className={` ${styles.card} ${styles.candidate}`}>
                        <div className={styles.top}>
                            <GoPeople className={styles.icon} />
                            <div className={styles.heading}>
                                <h2>For Candidates</h2>
                                <p>Interviewee Portal</p>
                            </div>
                        </div>
                        <p className={styles.cardDescription}>"The simplest interview you've ever done. Speak. Smile. Done."</p>
                        <div className={styles.list}>
                            {" "}
                            <FiUpload className={styles.icon} />
                            Upload CV → Get interview link
                        </div>
                        <div className={styles.list}>
                            {" "}
                            <LuBrain className={styles.icon} />
                            Face + voice + resume = verified
                        </div>
                        <div className={styles.list}>
                            <FiCheckCircle className={styles.icon} />
                            No time slots, no waiting
                        </div>
                        <div className={styles.progress}>
                            <div className={styles.percentage}>
                                <p>Process Flow</p>
                                <p>100%</p>
                            </div>
                            <div className={styles.bar}>
                                <div style={{ width: `${50}%` }} className={styles.fill}></div>
                            </div>
                            <div className={styles.steps}>
                                <p>Upload</p>
                                <p>Detection</p>
                                <p>Interview</p>
                                <p>Complete</p>
                            </div>
                        </div>
                    </div>
                    <div className={` ${styles.card} ${styles.hr}`}>
                        <div className={styles.top}>
                            <GoPeople className={styles.icon} />
                            <div className={styles.heading}>
                                <h2>For HR Team</h2>
                                <p>HR Dashboard</p>
                            </div>
                        </div>
                        <p className={styles.cardDescription}>"Screen 100s of applicants—without scheduling a single call"</p>
                        <div className={styles.list}>
                            {" "}
                            <FiUpload className={styles.icon} />
                            Manage candidates from a single screen
                        </div>
                        <div className={styles.list}>
                            {" "}
                            <LuBrain className={styles.icon} />
                            Configure languages, voices, accents
                        </div>
                        <div className={styles.list}>
                            <FiCheckCircle className={styles.icon} />
                            View full AI report and CV match analytics
                        </div>
                        <div className={styles.progress}>
                            <div className={styles.percentage}>
                                <p>Workflow</p>
                                <p>Automated</p>
                            </div>
                            <div className={styles.bar}>
                                <div style={{ width: `${80}%` }} className={styles.fill}></div>
                            </div>
                            <div className={styles.steps}>
                                <p>Links</p>
                                <p>Matching</p>
                                <p>Reports</p>
                                <p>Score</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.preview}>
                <h1>Product Preview</h1>
                <p className={styles.description}>See both sides of the platform in action</p>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <img src={candidatePortal} alt="" />
                    </div>
                    <div className={`${styles.card} ${styles.admin}`}>
                        <img src={adminDash} alt="" />
                    </div>
                </div>
            </section>
            <section className={styles.keyFeatures}>
                <h1>Key Features</h1>
                <p className={styles.description}>Everything you need for modern AI-powered recruitment</p>
                <div className={styles.cards}>
                    {cardData.map((data, index) => (
                        <div className={styles.card} key={index}>
                            <div className={styles.icon}>
                                <img src={data?.icon} alt="" />
                            </div>
                            <h4>{data?.title}</h4>
                            <p>{data?.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className={styles.adminPanel}>
                <h1>Admin Panel Highlights</h1>
                <p className={styles.description}>Powerful tools for HR teams to manage the entire interview process</p>
                <div className={styles.cards}>
                    {adminHighlight.map((data, index) => (
                        <div className={styles.card} key={index}>
                            <div className={styles.icon}>
                                <img src={data?.icon} alt="" />
                            </div>
                            <h4>{data?.title}</h4>
                            <p>{data?.description}</p>
                            {data?.details?.map((detail, index) => (
                                <h5 key={index} className={styles[`detail${index}`]}>
                                    {detail}
                                </h5>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.actionCard}>
                    <div className={styles.icon}>
                        <img src={play} alt="" />
                    </div>
                    <div>
                        <h2>See it in action</h2>
                        <p>Watch the complete walkthrough</p>
                    </div>
                </div>
            </section>
            <section className={styles.testimonials}>
                <h1>Testimonials</h1>
                <p className={styles.description}>Trusted by companies worldwide</p>
                <div className={styles.cards}>
                    {testimonials.map((data, index) => (
                        <div className={styles.card} key={index}>
                            <p>
                                {[...Array(data?.rating)].map((_, index) => (
                                    <IoStar key={index} className={styles.star} />
                                ))}
                            </p>
                            <p className={styles.quote}>{data?.quote}</p>
                            <div className={styles.author}>
                                <div className={styles.avatar}>
                                    {data?.author
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <p className={styles.name}>{data?.author}</p>
                                    <p className={styles.company}>{data?.authorCompany}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <h4>Trusted by these companies</h4>
                <h2 className={styles.companies}>
                    {companies.map((company, index) => (
                        <span key={index}>{company}</span>
                    ))}
                </h2>
            </section>
            <Footer />
        </div>
    );
}
