import React from "react";
import { Puff, RotatingTriangles } from "react-loader-spinner";
import styles from "./Loading.module.scss";

const Loading = ({ height = "8rem", width = "8rem", className }) => {
    return (
        <div className={`${className} ${styles.Loader}`}>
            {/* <MutatingDots
				visible={true}
				height={height}
				width={width}
				color="#4fa94d"
				secondaryColor="#4fa94d"
				radius="1.2rem"
				ariaLabel="mutating-dots-loading"
				wrapperStyle={{}}
				wrapperClass=""
			/> */}
            {/* <RotatingTriangles
                visible={true}
                height={height}
                width={width}
                color="#4fa94d"
                ariaLabel="rotating-triangles-loading"
                wrapperStyle={{}}
                wrapperClass=""
            /> */}
            <Puff visible={true} height="80" width="80" color="#00c9ff" ariaLabel="puff-loading" wrapperStyle={{}} wrapperClass="" />
        </div>
    );
};

export default Loading;
