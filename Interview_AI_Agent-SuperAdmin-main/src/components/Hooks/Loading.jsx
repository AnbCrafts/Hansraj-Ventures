import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Loading = ({ height = "3rem", width = "3rem", color = "#fff" }) => {
	return (
		<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
			<RotatingLines
				visible={true}
				height={height}
				width={width}
				strokeColor={color}
				strokeWidth="5"
				animationDuration="0.75"
				ariaLabel="rotating-lines-loading"
				wrapperStyle={{}}
				wrapperClass=""
			/>
		</div>
	);
};

export default Loading;
