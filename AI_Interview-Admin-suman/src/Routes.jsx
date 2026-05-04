import ls from "localstorage-slim";
import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./assets/scss/userWrapper.module.scss";
import { clearCacheData } from "./components/Hooks/clearCacheData";
import { fetchDetailsFromStorage } from "./redux/slices/authSlice";

import LoadingIndicator from "./components/Hooks/LoadingIndicator";
import ScrollToTop from "./components/Hooks/ScrollToTop";
import SideBar from "./components/Sidebar/SideBar";
import TopBar from "./components/TopBar/TopBar";

import Login from "./pages/Login/Login";
import Resources from "./pages/Resources/Resources";
import AddCandidate from "./components/Popups/AddCandidate";
import Resume from "./pages/Resume/Resume";
import Training from "./pages/Training/Training";
import Meeting from "./pages/Meeting/Meeting";
import Settings from "./pages/Settings/Settings";
import { setAllSkills, setVoicesList } from "./redux/slices/popupSlice";
import axios from "./components/Hooks/axios";
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Trash = lazy(() => import("./pages/Trash/Trash"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const AssignedJobs = lazy(() => import("./pages/AssignedJobs/AssignedJobs"));
const ManageUsers = lazy(() => import("./pages/ManageUsers/ManageUsers"));
const AssignedJobDetails = lazy(() => import("./pages/AssignedJobs/AssignedJobDetails"));
const Interviews = lazy(() => import("./pages/Interviews/Interviews"));
const InterviewsHistory = lazy(() => import("./pages/InterviewsHistory/InterviewsHistory"));
const ScheduledInterviews = lazy(() => import("./pages/ScheduledInterviews/ScheduledInterviews"));
const JobsTarget = lazy(() => import("./pages/JobsTarget/JobsTarget"));
const JobSeekerPopup = lazy(() => import("./components/Popups/CandidateDetailPopup"));
const CompanyPopup = lazy(() => import("./components/Popups/CompanyPopup"));
const InterviewPopup = lazy(() => import("./components/InterviewPopup/InterviewPopup"));
const Share = lazy(() => import("./components/InterviewPopup/Share"));
const JobTargetPopup = lazy(() => import("./components/JobTargetPopup/JobTargetPopup"));
const RescheduledInterview = lazy(() => import("./components/InterviewPopup/RescheduledInterview"));

const App = () => {
    const dispatch = useDispatch();

    clearCacheData(); 

    useEffect(() => {
        dispatch(fetchDetailsFromStorage());
    }, []);

    useEffect(() => {
        axios
            .get("/admin/list_skills")
            .then(({ data }) => {
                dispatch(setAllSkills(data?.data?.skills));
            })
            .catch((err) => {
                toast.error("Failed to fetch listed skills");
                console.log("Error => ", err);
            });
    });

    useEffect(() => {
        axios
            .get("/admin/listVoices")
            .then(({ data }) => {
                dispatch(setVoicesList(data?.data?.voices));
            })
            .catch((err) => {
                toast.error("Failed to fetch listed skills");
                console.log("Error => ", err);
            });
    });
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                limit={4}
                hideProgressBar={false}
                newestOnTop={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="dark"
            />

            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route element={<AnalyticsWrapper />}>
                        <Route path="/" element={<Login />} />
                        <Route path="/meeting" element={<Meeting />} />
                        <Route element={<UserWrapper />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/manage-candidate" element={<ManageUsers />} />
                            {/* <Route path="/assigned-jobs" element={<AssignedJobs />} />
							<Route path="/assigned-job-details" element={<AssignedJobDetails />} /> */}
                            {/* <Route path="/interviews" element={<Interviews />} /> */}
                            {/* <Route path="/resources" element={<Resources />} /> */}
                            {/* <Route path="/interviews-history" element={<InterviewsHistory />} /> */}
                            <Route path="/scheduled-interviews" element={<ScheduledInterviews />} />
                            <Route path="/jobs-target" element={<JobsTarget />} />
                            <Route path="/resume" element={<Resume />} />
                            <Route path="/training" element={<Training />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/trash" element={<Trash />} />
                            <Route path="/setting" element={<Settings />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
};

const AnalyticsWrapper = () => {
    // const { pathname } = useLocation();

    // useEffect(() => {
    // 	ReactGA.send({ hitType: "pageview", page: pathname, title: pathname });
    // }, [pathname]);

    return (
        <>
            <Outlet />
        </>
    );
};

const UserWrapper = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!ls.get("AI_token")) navigate("/", { replace: true });
    }, []);

    const { isJobSeekerShow, isCompanyShow, interviewPopup, sharePopup, rescheduledPopup, addCandidatePopup } = useSelector((s) => s.popup);

    return (
        <div className={styles.Wrapper}>
            <div className={styles.Circle1}></div>
            <div className={styles.Circle2}></div>
            <div className={styles.Circle3}></div>
            <div className={styles.Circle4}></div>

            <div className={styles.Sidebar}>
                <SideBar />
            </div>

            <div className={styles.Content}>
                <div className={styles.Top}>
                    <TopBar />
                </div>

                <Suspense fallback={<LoadingIndicator />}>
                    {isJobSeekerShow && <JobSeekerPopup />}
                    {isCompanyShow && <CompanyPopup />}
                    {interviewPopup && <InterviewPopup />}
                    {rescheduledPopup && <RescheduledInterview />}
                    {sharePopup && <Share />}
                    {addCandidatePopup && <AddCandidate />}
                    <JobTargetPopup />

                    <div className={styles.MainContent}>
                        <Outlet />
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default App;
