import ls from "localstorage-slim";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Star from "../../assets/svg/Star.svg?react";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { setActiveUser } from "../../redux/slices/authSlice";
import styles from "./Login.module.scss";
import { LuEye, LuEyeOff } from "react-icons/lu";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handelLogin = () => {
        if (userName === "" || password === "") return toast.warn("Please Fill all !");
        setLoading(true);

        const raw = { username: userName, password };
        axios
            .post(`/admin/login`, raw)
            .then(({ data }) => {
                toast.success(data.msg);
                dispatch(setActiveUser({ userData: data.data.user, token: data.data.token }));
                axios.defaults.headers.Authorization = `Bearer ${data.data.token}`;
                setLoading(false);
                navigate("/dashboard", { replace: true });
            })  
            .catch(({ response }) => {
                console.log("Error => ", response);
                toast.error(response.data.msg);
                setLoading(false);
            });
        //navigate("/dashboard", { replace: true });
    };

    useEffect(() => {
        if (ls.get("AI_token")) navigate("/dashboard", { replace: true });
    }, []);

    return (
        <div className={styles.Login}>
            <div className={styles.LeftSection}>
                <div className={styles.Top}>
                    <div className={styles.Rectangle}></div>
                    <div className={styles.Star}>
                        <Star />
                    </div>
                </div>
                <h1>Welcome to Interview AI Admin</h1>
                <p>
                    Lorem ipsum dolor sit amet consectetur. Ac dolor massa tincidunt maecenas. Cras erat eu scelerisque risus eu eu et sit
                    sodales sit elit.
                </p>
            </div>

            <div className={styles.RightSection}>
                <div className={styles.Content}>
                    <h3>
                        Sign <span>In</span>
                    </h3>
                    <p>Sign In Your Admin ID</p>

                    <div className={styles.InputWrapper}>
                        <label htmlFor="userName">Username</label>
                        <input
                            type="text"
                            id="userName"
                            placeholder="Enter Your Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <div className={styles.InputWrapper}>
                        <label htmlFor="Password*">Password</label>
                        <div className={styles.Input}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {showPassword ? (
                                <LuEye className={styles.Eye} onClick={() => setShowPassword(!showPassword)} />
                            ) : (
                                <LuEyeOff className={styles.Eye} onClick={() => setShowPassword(!showPassword)} />
                            )}
                        </div>
                    </div>

                    <button onClick={handelLogin}>{loading ? <Loading /> : "Sign In"}</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
