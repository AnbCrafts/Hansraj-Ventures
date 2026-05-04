import React from "react";
import styles from "./PopupStyles.module.scss";

const BackgroundWrapper = ({ children, close, height, width }) => {
	return (
		<div className={styles.BackgroundWrapper} onClick={close}>
			<div className={styles.Background} style={{ height: height, width: width }} onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
};

export default BackgroundWrapper;
