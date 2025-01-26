import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useStripe } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";  // Updated import
import { selectBookingId, selectClientSecret, selectBookingInfo, selectPaymentStatus, setPaymentStatus } from "../../../../../Booking/bookSlice";
import infoSquare from "../../../../../../assets/icons/info-square.png";

const BookingPayment = ({ userDetails }) => {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();  // Updated to useNavigate
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const bookingId = useSelector(selectBookingId);
  const clientSecret = useSelector(selectClientSecret);
  const bookingInfo = useSelector(selectBookingInfo);
  const paymentStatus = useSelector(selectPaymentStatus);

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Helphive",
    });
    if (error) {
      setSnackbarMessage("Error initializing payment sheet: " + error.message);
      setSnackbarVisible(true);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      setSnackbarMessage("Payment failed: " + error.message);
      setSnackbarVisible(true);
    } else {
      dispatch(setPaymentStatus("completed"));
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await openPaymentSheet();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Payment failed: An error occurred while processing the payment.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    bookingPayment: {
      fontFamily: "Arial, sans-serif",
    },
    header: {
      padding: "20px",
      backgroundColor: "#6200ea",
      display: "flex",
      alignItems: "center",
    },
    backButton: {
      background: "none",
      border: "none",
      display: "flex",
      alignItems: "center",
      color: "white",
      fontSize: "18px",
    },
    headerText: {
      marginLeft: "10px",
      color: "white",
      fontSize: "18px",
    },
    paymentDetails: {
      padding: "20px",
    },
    invoice: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    invoiceTitle: {
      textAlign: "center",
    },
    paymentStatus: {
      padding: "10px",
      borderRadius: "20px",
      textAlign: "center",
    },
    completedStatus: {
      backgroundColor: "green",
      color: "white",
    },
    pendingStatus: {
      backgroundColor: "yellow",
      color: "black",
    },
    paymentButton: {
      padding: "10px 20px",
      backgroundColor: "#6200ea",
      color: "white",
      border: "none",
      borderRadius: "4px",
    },
    disabledButton: {
      backgroundColor: "#ccc",
    },
    infoMessage: {
      display: "flex",
      alignItems: "center",
    },
    infoImage: {
      width: "20px",
      height: "20px",
      marginRight: "8px",
    },
    snackbar: {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#333",
      color: "white",
      padding: "10px 20px",
      borderRadius: "4px",
      fontSize: "14px",
      zIndex: 1000,
      display: snackbarVisible ? "block" : "none",
      opacity: snackbarVisible ? 1 : 0,
      transition: "opacity 0.5s ease",
    },
  };

  return (
    <div style={styles.bookingPayment}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>  {/* Updated onClick handler */}
          <span className="material-icons">chevron_left</span>
          <span style={styles.headerText}>Payment Details</span>
        </button>
      </div>

      <div style={styles.paymentDetails}>
        <div style={styles.invoice}>
          <h2 style={styles.invoiceTitle}>Invoice</h2>
          <div className="booking-details">
            <p>Booking ID: {bookingId.slice(-8).toUpperCase()}</p>
            <p>Hourly Rate: USD {parseFloat(bookingInfo.rate).toFixed(2)}</p>
            <p>Number of Hours: {bookingInfo.hours}</p>
            <p>Amount: USD {(bookingInfo.rate * bookingInfo.hours).toFixed(2)}</p>
            <p>Service: {bookingInfo.serviceName}</p>
            <p>Start Date: {new Date(bookingInfo.startDate).toLocaleDateString()}</p>
            <p>Start Time: {new Date(bookingInfo.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>

          <div className="payer-info">
            <p>User: {userDetails.firstName} {userDetails.lastName}</p>
            <p>Email: {userDetails.email.length > 32 ? `${userDetails.email.slice(0, 31)}...` : userDetails.email}</p>
          </div>

          <div style={{ ...styles.paymentStatus, ...(paymentStatus === "completed" ? styles.completedStatus : styles.pendingStatus) }}>
            <span>{paymentStatus === "completed" ? "Payment Complete" : "Payment Required"}</span>
          </div>
        </div>

        {paymentStatus === "pending" && (
          <div style={styles.infoMessage}>
            <img src={infoSquare} alt="info" style={styles.infoImage} />
            <p>Our pros can't accept your booking unless you pay.</p>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="payment-button">
            <button onClick={handlePayment} disabled={loading} style={{ ...styles.paymentButton, ...(loading && styles.disabledButton) }}>
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        )}
      </div>

      {/* Snackbar */}
      <div style={styles.snackbar}>{snackbarMessage}</div>
    </div>
  );
};

export default BookingPayment;
