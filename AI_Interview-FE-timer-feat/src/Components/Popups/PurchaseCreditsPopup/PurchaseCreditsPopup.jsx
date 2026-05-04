import React, { useEffect, useState } from "react";
import styles from "./PurchaseCreditsPopup.module.scss"; // Import CSS module

import { useDispatch } from "react-redux";
import { setActivePopup } from "../../../Redux/Slices/PopupSlice";

// We import the PaymentButton component we created earlier
import PaymentButton from "../../Payment/PaymentButton";
import { axiosInstance2 } from "../../axios/axiosInstance2";

// A simple inline SVG for a credit coin icon
const CreditIcon = () => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.icon}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
    </svg>
);

const PurchaseCreditsPopup = () => {
    const dispatch = useDispatch();
    // State to manage the number of credits
    const [credits, setCredits] = useState(5);
    const [isFirstPayment, setIsFirstPayment] = useState();
    const [transactions, setTransactions] = useState([]);
    const [minValue, setMinValue] = useState(5);

    const handleCreditChange = (e) => {
        let value = Math.max(minValue, Math.floor(Number(e.target.value)));
        // value = Math.min(100, value);
        console.log(value);
        setCredits(value);
    };

    const increment = () => setCredits((prev) =>  prev + 5);
    const decrement = () => setCredits((prev) => Math.max(minValue, prev - 5));

    useEffect(() => {
        axiosInstance2.get("/user/dashboard/transactions?page=1&limit=10&status=paid").then(({ data }) => {
            console.log(data.data.transactions);
            if (data.data.transactions.length > 0) {
                setIsFirstPayment(false);
                setTransactions(data.data.transactions);
                setMinValue(1);
            } else {
                setIsFirstPayment(true);
                setMinValue(5);
            }
        });
    }, []);

    return (
        <div className={styles.overlay} onClick={() => dispatch(setActivePopup(""))}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <i>
                    <CreditIcon />
                </i>
                <h2>Purchase Credits</h2>
                <p>Each credit costs $1.00. Select the amount you wish to purchase (Max 100).</p>

                {/* Credit Selector */}
                <div className={styles.creditSelector}>
                    <button onClick={decrement} className={styles.adjustBtn}>
                        -
                    </button>
                    <input type="number" value={credits}  onChange={handleCreditChange} min="1" className={styles.creditInput} />
                    <button onClick={increment} className={styles.adjustBtn}>
                        +
                    </button>
                </div>

                {/* Total Price Display */}
                {/* {isFirstPayment && transactions.length === 0 && <p>Minimum purchase is 5 credits</p>} */}
                <p>Minimum purchase is 5 credits</p>
                <h3 className={styles.totalPrice}>Total: ${credits.toFixed(2)}</h3>

                {/* Action Buttons */}
                <div className={styles.buttonContainer}>
                    <button className={styles.cancelButton} onClick={() => dispatch(setActivePopup(""))}>
                        Cancel
                    </button>
                    {/* This is our Razorpay component.
                      We pass the number of credits as the 'amount'.
                      It will handle its own loading and payment logic.
                    */}
                    <PaymentButton amount={credits} />
                </div>
            </div>
        </div>
    );
};

export default PurchaseCreditsPopup;
