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

import styles from "./Skills.module.scss";

const Skills = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { reload } = useSelector((s) => s.popup);

    const [active, setActive] = useState("");
    const [usersData, setUsersData] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    

    // useEffect(() => {
    //     setLoading(true);

    //     axios
    //         .get(`/candidate/segregated?page=${currentPage}&limit=100`)
    //         .then(({ data }) => {
    //             console.log(data);
    //            
    //             setLoading(false);
    //         })
    //         .catch(({ response }) => {
    //             console.log("Error => ", response);
    //         });
    // }, [currentPage, currentPage, reload]);

  

    return (
        <div className={styles.ManageUsers}>
            <div className={styles.Top}>
                <div className={styles.Buttons}>
                    

                    <button
                        className={active === "cancelled" ? styles.active : ""}
                        onClick={() => {
                            setCurrentPage(1);
                            setActive("cancelled");
                        }}
                    >
                        All skills
                    </button>
                </div>
            </div>

            <div className={styles.Bottom}>
                
            </div>

           
        </div>
    );
};

export default Skills;
