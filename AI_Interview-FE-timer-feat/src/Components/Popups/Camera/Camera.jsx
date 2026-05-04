import React from "react";
import styles from "./Camera.module.scss"; // Import CSS module

import { useDispatch } from "react-redux";
import Camera from "../../../assets/SVG/Camera.svg?react";
import { setActivePopup } from "../../../Redux/Slices/PopupSlice";

const CameraPopup = () => {
    const dispatch = useDispatch();
    return (
        <div className={styles.overlay} onClick={() => dispatch(setActivePopup(""))}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <i>
                    <Camera />
                </i>
                <h2>Enable Camera Access</h2>
                <p>We need your Permission to Access your Camera</p>
                <button onClick={() => dispatch(setActivePopup(""))}>Okay</button>
            </div>
        </div>
    );
};

export default CameraPopup;
