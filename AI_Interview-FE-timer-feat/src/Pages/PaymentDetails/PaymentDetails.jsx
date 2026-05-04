import React, { useState, useEffect } from "react";
import styles from "./PaymentDetails.module.scss";
import { axiosInstance2 } from "../../Components/axios/axiosInstance2";
import Navbar from "../../Components/Navbar/Navbar";

const PaymentDetails = () => {
    const [activeTab, setActiveTab] = useState("paid"); // 'paid' or 'failed'
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        totalTransactions: 0,
    });

    // Fetch transactions with chaining method using axios
    const fetchTransactions = (status, page = 1, limit = 10) => {
        setLoading(true);
        setError(null);

        axiosInstance2
            .get("/user/dashboard/transactions", {
                params: {
                    page: page,
                    limit: limit,
                    status: status,
                },
            })
            .then((response) => {
                const responseData = response.data.data;

                setTransactions(responseData.transactions || []);
                setPagination({
                    currentPage: responseData.page || page,
                    totalPages: Math.ceil((responseData.total_transactions || 0) / limit),
                    limit: responseData.limit || limit,
                    totalTransactions: responseData.total_transactions || 0,
                });
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.msg || err.message || "Failed to fetch transactions");
                setLoading(false);
                setTransactions([]);
            });
    };

    // Fetch data when tab changes
    useEffect(() => {
        fetchTransactions(activeTab, 1, pagination.limit);
    }, [activeTab]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        fetchTransactions(activeTab, newPage, pagination.limit);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Format amount
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return "$0.00";
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <div className={styles.paymentDetailsContainer}>
            <Navbar />
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Payment Details</h1>
                </div>

                {/* <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.tabButton} ${activeTab === "paid" ? styles.active : ""}`}
                        onClick={() => handleTabChange("paid")}
                    >
                        Payment Done
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === "failed" ? styles.active : ""}`}
                        onClick={() => handleTabChange("failed")}
                    >
                        Payment Failed
                    </button>
                </div> */}

                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.loading}>Loading transactions...</div>
                    ) : error ? (
                        <div className={styles.error}>
                            <p>Error: {error}</p>
                            <button
                                className={styles.retryBtn}
                                onClick={() => fetchTransactions(activeTab, pagination.currentPage, pagination.limit)}
                            >
                                Retry
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className={styles.noData}>No {activeTab} transactions found</div>
                    ) : (
                        <>
                            <div className={styles.tableWrapper}>
                                <h2 className={styles.tableTitle}>
                                    {/* {activeTab === "paid" ? "Payment Done" : "Payment Failed"} */}
                                    Transactions
                                    <span className={styles.totalCount}>
                                        ({pagination.totalTransactions}{" "}
                                        {pagination.totalTransactions === 1 ? "transaction" : "transactions"})
                                    </span>
                                </h2>
                                <table className={styles.paymentTable}>
                                    <thead>
                                        <tr>
                                            <th>Payment ID</th>
                                            <th>Order ID</th>
                                            <th>Amount</th>
                                            <th>Currency</th>
                                            <th>Transaction Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction, index) => (
                                            <tr key={transaction.payment_id || transaction.id || index}>
                                                <td className={styles.paymentId}>{transaction.payment_id || "N/A"}</td>
                                                <td className={styles.orderId}>{transaction.order_id || "N/A"}</td>
                                                <td className={styles.amount}>
                                                    {formatAmount(transaction.amount_usd || transaction.amount)}
                                                </td>
                                                <td className={styles.currency}>{transaction.currency || "USD"}</td>
                                                <td>{formatDate(transaction.created_at || transaction.date || transaction.createdAt)}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            transaction.status === "paid" || activeTab === "paid"
                                                                ? styles.statusCompleted
                                                                : styles.statusFailed
                                                        }
                                                    >
                                                        {transaction.status || activeTab}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1 || loading}
                                    >
                                        Previous
                                    </button>

                                    <span className={styles.pageInfo}>
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>

                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;
