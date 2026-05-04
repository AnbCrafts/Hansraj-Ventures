import React from "react";
import styles from "./AssignedJobUser.module.scss";

import Phone from "../../assets/svg/Phone.svg?react";
import Email from "../../assets/svg/Email.svg?react";
import Location from "../../assets/svg/Location.svg?react";

const AssignedJobUser = ({ setAssignedJobUser }) => {
  return (
    <div className={styles.Container} onClick={() => setAssignedJobUser(false)}>
      <div className={styles.Box} onClick={(e) => e.stopPropagation()}>
        <div className={styles.BoxTop}>
          <div className={styles.BoxTopLeft}>
            <img src="https://picsum.photos/50/50" alt="" />
            <div className={styles.TopRight}>
              <h1>Cody Fisher</h1>
              <h2>Codyfisher67@gmail.com</h2>
            </div>
          </div>
          <button>Back</button>
        </div>
        <div className={styles.BoxBottom}>
          <div className={styles.BoxBottomLeft}>
            <div className={styles.LeftName}>
              <label>Name</label>
              <div className={styles.Input}>
                <input type="text" placeholder={"Kevin Gilbert"} />
              </div>
            </div>
            <div className={styles.LeftProfession}>
              <label>Profession</label>
              <div className={styles.Input}>
                <input type="text" placeholder={"UI designer"} />
              </div>
            </div>
            <div className={styles.LeftExperience}>
              <label>Experience</label>
              <div className={styles.Input}>
                <input type="text" placeholder={"2 years"} />
              </div>
            </div>
            <div className={styles.LeftSkills}>
              <label>Skills</label>
              <div className={styles.Input}>
                <input
                  type="text"
                  placeholder={
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Senectus morbi eget at eu, porttitor potenti."
                  }
                />
              </div>
            </div>
            <div className={styles.LeftCV}>
              <label>CV</label>
              <div className={styles.Input}>
                <input type="text" placeholder={"Resume.pdf"} />
              </div>
            </div>
          </div>
          <div className={styles.BoxBottomRight}>
            <div className={styles.RightPhone}>
              <label>Phone</label>
              <div className={styles.Input}>
                <Phone />
                <input type="text" placeholder={"Phone Number"} />
              </div>
            </div>

            <div className={styles.RightEmail}>
              <label>Email</label>
              <div className={styles.Input}>
                <Email />
                <input type="email" defaultValue={"email number"} />
              </div>
            </div>

            <div className={styles.RightLocation}>
              <label>Address</label>
              <div className={styles.Input}>
                <Location />
                <input type="text" defaultValue={"Current location..."} />
              </div>
            </div>

            <div className={styles.RightRow1}>
              <div className={styles.RightCurrentPay}>
                <label>Current Pay</label>
                <div className={styles.Input}>
                  <input type="text" placeholder={"$5000"} />
                </div>
              </div>

              <div className={styles.RightExpectationPay}>
                <label>Expectation Pay</label>
                <div className={styles.Input}>
                  <input type="text" placeholder={"$8000"} />
                </div>
              </div>
            </div>

            <div className={styles.RightRow2}>
              <div className={styles.RightGender}>
                <label>Gender</label>
                <div className={styles.Input}>
                  <input type="text" placeholder={"Male"} />
                </div>
              </div>

              <div className={styles.RightDOB}>
                <label>DOB</label>
                <div className={styles.Input}>
                  <input type="text" placeholder={"15/12/1998"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AssignedJobUser;
