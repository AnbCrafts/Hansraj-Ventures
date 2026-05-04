import React from "react";
import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";
import logo from "../../assets/Images/logo.png";
import mail from "../../assets/SVG/mail.svg";

export default function Footer() {
    return (
        <div className={styles.container} id="footer">
            <div className={styles.footer}>
                <div className={styles.Links}>
                    <h2>Company</h2>
                    <div>
                        <Link to="/">About</Link>
                    </div>
                    <div>
                        <Link to="/">Career</Link>
                    </div>
                    <div>
                        <Link to="/">Privacy</Link>
                    </div>
                </div>
                <div className={styles.Links}>
                    <h2>Features</h2>
                    <div>
                        <Link to="/">Candidate UI</Link>
                    </div>
                    <div>
                        <Link to="/">Admin Panel</Link>
                    </div>
                    <div>
                        <Link to="/">AI Reports</Link>
                    </div>
                </div>
                <div className={styles.Links}>
                    <h2>Contacts</h2>
                    <div className={styles.contact}>
                        <span className={styles.icon}>
                            <img src={mail} alt="" />
                        </span>
                        hello@aiinterview.io
                    </div>
                </div>
                <div className={styles.info}>
                    <div className={styles.logo}>
                        <img src={logo} alt="" />
                    </div>
                    <p>AI-Powered Interviews. Smarter. Faster. Fairer.</p>
                </div>
            </div>

            <hr />

            <p className={styles.copyright}>© 2024 InterviewAI. All rights reserved.</p>
        </div>
    );
}
