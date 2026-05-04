import React, { useState } from "react";
import axios from "axios"; // npm install axios
import { axiosInstance2 } from "../axios/axiosInstance2";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setActivePopup, setReload } from "../../Redux/Slices/PopupSlice";

function PaymentButton({ amount }) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // 1. Create Order
            const { data } = await axiosInstance2.post("/user/create-order", {
                amount: amount, // Send amount (e.g., 5 for ₹5)
            });

            const { key, order } = data.data;
            console.log(key, order);

            // 2. Configure Razorpay Options
            const options = {
                key: key,
                amount: order.amount, // Amount in paise
                currency: "INR",
                name: "Your Company Name",
                description: "Test Transaction",
                order_id: order.id,
                // 3. Set up Handler function
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        const verifyRes = await axiosInstance2.post("/user/verify-payment", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.success(verifyRes.data.msg); // Show success message
                        dispatch(setReload());
                        dispatch(setActivePopup(""));
                    } catch (verifyErr) {
                        console.error(verifyErr);
                        toast.error("Payment verification failed.");
                    }
                    setIsLoading(false);
                },
                prefill: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
                // Handle modal close (user cancels payment)
                modal: {
                    ondismiss: function () {
                        console.log("Payment modal dismissed");
                        setIsLoading(false);
                    },
                },
            };

            // 5. Open Razorpay Modal
            // We use window.Razorpay because the script is loaded globally
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Error in payment process:", err);
            toast.error("Error initiating payment.");
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? "Processing..." : `Pay $ ${amount}`}
        </button>
    );
}

export default PaymentButton;
