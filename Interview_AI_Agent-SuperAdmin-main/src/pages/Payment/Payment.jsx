import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeftArrow from "../../assets/svg/LeftArrow.svg?react";
import RightArrow from "../../assets/svg/RightArrow.svg?react";
import Loading from "../../components/Hooks/Loading";
import axios from "../../components/Hooks/axios";
// Assuming this component uses the same styles as Resume.js
import styles from "./Payment.module.scss"; 

const Payments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get 'reload' from Redux, just like in your Resume component
    const { reload } = useSelector((s) => s.popup);

    // State for payments
    const [paymentsData, setPaymentsData] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0); // For "Showing X of Y"
    const [loading, setLoading] = useState(false);
    
    // API data fetching
    useEffect(() => {
        setLoading(true);

        axios
            .get(`/superAdmin/recent_payments?page=${currentPage}&limit=10`)
            .then(({ data }) => {
                console.log(data);
                // Set data from the API response
                setPaymentsData(data.data.payments);
                // Set pagination info
                setTotalPage(data.data.pagination_info.total_pages);
                setCurrentPage(data.data.pagination_info.current_page);
                setTotalRecords(data.data.pagination_info.total_records);
            })
            .catch(({ response }) => {
                console.log("Error => ", response);
                // Handle error (e.g., show a toast)
            })
            .finally(() => {
                setLoading(false);
            });
    // Dependency array to refetch when page or reload changes
    }, [currentPage, reload]);

    // Calculate record numbers for display
    const startRecord = (currentPage - 1) * 10 + 1;
    const endRecord = startRecord + paymentsData.length - 1;

    return (
        <div className={styles.ManageUsers}>
            {/* This component doesn't have the top filter buttons 
              as it only shows one list of recent payments.
            */}
            
            <div className={styles.Bottom}>
                {/* Updated Headers for Payments Table */}
                <div className={styles.subHeading}>
                    <p>S no</p>
                    <p>Name</p>
                    <p>Email</p>
                    <p>Amount</p>
                    <p>Status</p>
                    <p>Payment ID</p>
                    <p>Date</p>
                </div>

                {loading ? (
                    <Loading height="10rem" width="10rem" />
                ) : (
                    <div className={styles.UserCards}>
                        {paymentsData?.length === 0 ? (
                            <h1>No Payments Found</h1>
                        ) : (
                            paymentsData.map((payment, index) => {
                                // Calculate serial number based on page
                                const serialNumber = (currentPage - 1) * 10 + index + 1;
                                
                                return (
                                    <div
                                        className={styles.Card}
                                        key={payment.id} // Use a unique ID from the data
                                    >
                                        <div>{serialNumber}</div>
                                        <div>{payment.user?.name || "No Name"}</div>
                                        <div>{payment.user?.email || "No Email"}</div>
                                        <div>
                                            {/* Format amount and currency */}
                                            {payment.amount} {payment.currency}
                                        </div>
                                        <div>
                                            {/* Added status pill for better UI (see CSS below) */}
                                            <span className={`${styles.status} ${payment.status === 'paid' ? styles.statusPaid : styles.statusFailed}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                        <div>{payment.razorpay_payment_id || "N/A"}</div>
                                        <div>
                                            {/* Re-used your IST date formatting */}
                                            {new Date(payment.created_at + "Z").toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Pagination (copied from Resume.js, with updated text) */}
            <div className={styles.pagination}>
                <div className={styles.records}>
                    Showing {startRecord} to {endRecord} of {totalRecords} payments
                </div>

                <div className={styles.pageButtons}>
                    <button className={styles.leftArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        <LeftArrow />
                    </button>

                    <div className={styles.pages}>
                        {Array(totalPage)
                            .fill("")
                            .slice(0, 5) // Shows first 5 pages
                            .map((data, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <div 
                                        className={`${styles.buttons} ${currentPage === pageNumber ? styles.active : ""}`} 
                                        key={index}
                                        onClick={() => setCurrentPage(pageNumber)} // Make pages clickable
                                    >
                                        0{pageNumber}
                                    </div>
                                );
                            })}
                    </div>

                    <button
                        className={styles.rightArrow}
                        disabled={currentPage === totalPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        <RightArrow />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payments;