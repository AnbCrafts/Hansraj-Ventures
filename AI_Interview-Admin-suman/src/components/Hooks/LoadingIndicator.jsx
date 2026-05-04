import React from "react";
import styles from "./LoadingIndicator.module.scss";
import { ThreeCircles } from "react-loader-spinner";

const LoadingIndicator = () => {
	return (
		<div className={styles.LoadingIndicator}>
			<ThreeCircles height="10rem" width="10rem" color="#fff" visible={true} ariaLabel="three-circles-rotating" />
		</div>
	);
};

export default LoadingIndicator;
