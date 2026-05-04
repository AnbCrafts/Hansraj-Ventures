import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Filter from "../../assets/svg/Filter.svg?react";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import ThreeDot from "../../assets/svg/ThreeDot.svg?react";
import { formatDate } from "../../components/Functions/dateFormate";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
import { LuEye, LuEyeOff } from "react-icons/lu";

import styles from "./Profile.module.scss";
import { toast } from "react-toastify";

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [profile, setProfile] = useState();
    const [show, setShow] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        setLoading(true);

        axios
            .get(`/admin/me`)
            .then(({ data }) => {
                console.log(data);
                setProfile(data);
                setLoading(false);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
            });
    }, [reload]);

    function validatePassword(password) {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Password must contain at least one special character";
        }

        return false;
    }

    const handlePasswordChange = async () => {
        try {
            setIsUpdatingPassword(true);
            if (!passwords.confirmPassword || !passwords.newPassword || !passwords.oldPassword) return toast.warn("Fill all the details");
            if (passwords.newPassword !== passwords.confirmPassword) return toast.warn("New Password and Confirm Password do not match");
            // if (validatePassword(passwords.newPassword)) return toast.warn(validatePassword(passwords.newPassword));

            console.log(passwords);
            axios
                .patch(`/admin/update`, {
                    old_password: passwords.oldPassword,
                    password: passwords.newPassword,
                    admin_id: profile.id,
                })
                .then(({ data }) => {
                    console.log(data);
                    toast.success(data.msg);
                    setPasswords({
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    });
                })
                .catch((err) => {
                    toast.error(err.response.data.msg);
                    console.log("Error => ", err);
                })
                .finally(() => {
                    setIsUpdatingPassword(false);
                });
        } catch (error) {}
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        console.log(profile);
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);
            profile.admin_id = profile.id;
            axios
                .patch(`/admin/update`, profile)
                .then(({ data }) => {
                    console.log(data);
                    toast.success(data.msg);
                    setProfile(data.data);
                })
                .catch((err) => {
                    toast.error(err.response.data.msg);
                    console.log("Error => ", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (error) {}
    };

    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}>
                    {/* <button
                        className={active === "cancelled" ? styles.active : ""}
                        onClick={() => {
                            // setCurrentPage(1);
                            setActive("cancelled");
                        }}
                    >
                        All skills
                    </button> */}
                </div>
            </div>

            <div className={styles.Bottom}>
                <div className={styles.Profile}>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Full Name</label>
                        <div className={styles.Input}>
                            <input type="text" name="name" value={profile?.name || "No Full Name"} onChange={handleProfileChange} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Username</label>
                        <div className={styles.Input}>
                            {" "}
                            <input type="text" name="username" onChange={handleProfileChange} value={profile?.username} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Email</label>
                        <div className={styles.Input}>
                            {" "}
                            <input type="text" name="email" onChange={handleProfileChange} value={profile?.email || "No Email"} />
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Phone</label>
                        <div className={styles.Input}>
                            {" "}
                            <input
                                type="text"
                                name="phone"
                                onChange={handleProfileChange}
                                value={profile?.phone}
                                autoComplete="off"
                                readOnly
                                onFocus={(e) => (e.target.readOnly = false)}
                            />
                        </div>
                    </div>
                    {/* <div className={styles.InputWrapper}>
                        <label htmlFor="">Password</label>
                        <div className={styles.Input}>
                            {" "}
                        <input type={show ? "text" : "password"} name="old_password" onChange={handleProfileChange} value={profile?.old_password || "" } />
                             {show ? (
                                <LuEyeOff onClick={() => setShow(false)} />
                            ) : (
                                <LuEye onClick={() => setShow(true)} />
                            )}
                        </div>
                    </div> */}
                    <button onClick={handleProfileUpdate}>Update</button>
                </div>
                <div className={styles.Password}>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Old Password</label>
                        <div className={styles.Input}>
                            {" "}
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={passwords.oldPassword}
                                onChange={handleChange}
                            />
                            {showOldPassword ? (
                                <LuEyeOff onClick={() => setShowOldPassword(false)} />
                            ) : (
                                <LuEye onClick={() => setShowOldPassword(true)} />
                            )}
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">New Password</label>
                        <div className={styles.Input}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleChange}
                            />
                            {showPassword ? (
                                <LuEyeOff onClick={() => setShowPassword(false)} />
                            ) : (
                                <LuEye onClick={() => setShowPassword(true)} />
                            )}
                        </div>
                    </div>
                    <div className={styles.InputWrapper}>
                        <label htmlFor="">Confirm Password</label>
                        <div className={styles.Input}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                            />
                            {showConfirmPassword ? (
                                <LuEyeOff onClick={() => setShowConfirmPassword(false)} />
                            ) : (
                                <LuEye onClick={() => setShowConfirmPassword(true)} />
                            )}
                        </div>
                    </div>
                    <button onClick={handlePasswordChange} disabled={loading}>
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
