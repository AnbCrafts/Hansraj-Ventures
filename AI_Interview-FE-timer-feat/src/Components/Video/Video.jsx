import { LiveKitRoom, VideoConference, formatChatMessageLinks } from "@livekit/components-react";
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs";
import { ExternalE2EEKeyProvider, LogLevel, VideoPresets } from "livekit-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Ensure you have this installed
import { DebugMode } from "./Debug";
import "./globals.css";
import { SettingsMenu } from "./SettingsMenu";
import { useSetupE2EE } from "./useSetupE2EE";
import { axiosInstance2 } from "../axios/axiosInstance2";
import axios from "axios";

const Video = ({
    token, // Ideally remove hardcoded token
    codec = "vp8",
    totalQuestions = 5,
}) => {
    const navigate = useNavigate();
    const params = useLocation();
    const searchParams = new URLSearchParams(params?.search);
    const type = searchParams.get("type");
    const interviewId = searchParams.get("interviewId");

    // --- E2EE Logic ---
    const keyProvider = useMemo(() => new ExternalE2EEKeyProvider(), []);
    const { worker, e2eePassphrase } = useSetupE2EE();
    const e2eeEnabled = !!(e2eePassphrase && worker);
    const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false);

    useEffect(() => {
        if (e2eeEnabled) {
            keyProvider.setKey(e2eePassphrase).then(() => {
                setE2eeSetupComplete(true);
            });
        } else {
            setE2eeSetupComplete(true);
        }
    }, [e2eeEnabled, e2eePassphrase, keyProvider]);

    // --- Timer Logic ---
    const [timeLeft, setTimeLeft] = useState(totalQuestions * 60);
    const timeLeftRef = useRef(timeLeft); // FIX: Ref to track time inside intervals
    const alertShownRef = useRef(false);

    useEffect(() => {
        // Sync ref with state
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);


    const baseUrl = import.meta.env.VITE_API_BASE_URL;
   
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    if (!alertShownRef.current) {
                        alertShownRef.current = true;
                        toast.info("Time is up! Redirecting to homepage...");

                        const url = `${baseUrl}/api/api/${type === "mock" ? "mockInterview" : "interview"}/agent/${interviewId}`;

                        axios
                            .put(
                                url,
                                { status: "completed" },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )
                            .then(() => {
                                toast.success("Interview marked as completed.");
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        setTimeout(() => {
                            navigate("/");
                        }, 3000);
                    }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const TOTAL_TIME = totalQuestions * 60;
    const percentLeft = Math.max(0, Math.min(100, Math.round((timeLeft / TOTAL_TIME) * 100)));

    // --- OpenAI Ping Logic (Fixed) ---
    const [pingResponse, setPingResponse] = useState(null);
    const [pingError, setPingError] = useState(null);
    const [pingStatus, setPingStatus] = useState("idle");

    useEffect(() => {
        let cancelled = false;

        const pingOnce = async () => {
            if (timeLeftRef.current <= 0) return;
            try {
                setPingStatus("idle");
                setPingError(null);
                const res = await axiosInstance2.post("/candidate/ping-openai");
                if (cancelled) return;
                const resp = res?.data?.data?.response || null;
                setPingResponse(resp);
                setPingStatus("ok");
            } catch (err) {
                if (cancelled) return;
                setPingError(err?.response?.data?.msg || err.message || "Request failed");
                setPingStatus("error");
            }
        };

        pingOnce();
        const pingInterval = setInterval(pingOnce, 10000);
        return () => {
            cancelled = true;
            clearInterval(pingInterval);
        };
    }, []);

    // --- Room Configuration ---
    const roomOptions = useMemo(() => {
        return {
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
                red: !e2eeEnabled,
                videoCodec: codec,
            },
            adaptiveStream: { pixelDensity: "screen" },
            dynacast: true,
            e2ee: e2eeEnabled ? { keyProvider, worker } : undefined,
        };
    }, [e2eeEnabled, codec, keyProvider, worker]);

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            {/* Top Bar with Timer & Ping Status */}
            <div className={`timerContainer`} aria-live="polite">
                <div className={`timer ${timeLeft <= 30 ? "low" : ""}`}>
                    <div className="timerLabel">Time</div>
                    <div className="timerValue">{formatTime(timeLeft)}</div>
                </div>
                <div className="timerBar">
                    <div className="timerFill" style={{ width: `${percentLeft}%` }} />
                </div>

                {/* Ping Status UI */}
                <div
                    className="pingBox"
                    role="status"
                    aria-live="polite"
                    style={{ marginLeft: "20px", display: "flex", alignItems: "center", gap: "8px", color: "white" }}
                >
                    <span
                        className={`statusDot ${pingStatus}`}
                        style={{
                            height: "10px",
                            width: "10px",
                            borderRadius: "50%",
                            backgroundColor: pingStatus === "ok" ? "#4ade80" : pingStatus === "error" ? "#ef4444" : "#fbbf24",
                        }}
                    />
                    <span className="pingText" style={{ fontSize: "0.9rem" }}>
                        {pingStatus === "idle" && "Checking AI..."}
                        {pingStatus === "ok" && (pingResponse || "AI Ready")}
                        {pingStatus === "error" && "AI Connection Error"}
                    </span>
                </div>
            </div>

            {/* Modern LiveKit Implementation */}
            <LiveKitRoom
                serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                token={token}
                connect={e2eeSetupComplete}
                options={roomOptions}
                video={true}
                audio={true}
                data-lk-theme="default"
                style={{ height: "100%" }}
                onDisconnected={() => {
                    console.log("Room disconnected");
                    navigate("/"); // Redirects to home page
                }}
            >
                <VideoConference
                    chatMessageFormatter={formatChatMessageLinks}
                    SettingsComponent={import.meta.env.VITE_SHOW_SETTINGS_MENU === "true" ? SettingsMenu : undefined}
                />
                <DebugMode logLevel={LogLevel.debug} />
            </LiveKitRoom>
        </div>
    );
};

export default Video;
