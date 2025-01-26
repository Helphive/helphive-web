import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetBookingsQuery } from "../../../../providers/providerApiSlice";
import withAuthCheck from "../../../../hocs/withAuthCheck";
import OrderCard from "./Components/OrderCard";
import "./Order.css";

// Snackbar Component
const Snackbar = ({ visible, message, onDismiss }) => {
  if (!visible) return null;

  return (
    <div style={styles.snackbar}>
      <span>{message}</span>
      <button style={styles.snackbarCloseBtn} onClick={onDismiss}>
        &times;
      </button>
    </div>
  );
};

const Orders = () => {
  const { data: bookings, refetch, isFetching, error } = useGetBookingsQuery();
  const paidBookings = bookings?.paidBookings;
  const scrollViewRef = useRef(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      setSnackbarMessage("Failed to refresh bookings. Please try again.");
      setSnackbarVisible(true);
    }
  }, [error]);

  useEffect(() => {
    refetch();
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(0, 0); // Scroll to top on mount
    }
  }, [refetch]);

  const handleMyOrdersPress = () => {
    navigate("/my-orders");
  };

  return (
  
    <div>
      {/* My Orders Button */}
      <div style={styles.buttonContainer}>
        <button style={styles.myOrdersButton} onClick={handleMyOrdersPress}>
          My Orders
        </button>
      </div>

      <div className="o-scrollContainer" ref={scrollViewRef}>
        <div className="o-ordersList">
          {Array.isArray(paidBookings) && paidBookings.length > 0 ? (
            paidBookings.map((booking) => <OrderCard key={booking._id} booking={booking} />)
          ) : (
            <div className="o-noOrders">
              <p>No orders available</p>
              <p>Check back later for new orders</p>
            </div>
          )}
        </div>
      </div>
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </div>
  );
};

export default withAuthCheck(Orders);

const styles = {
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px",
    backgroundColor: "#f8f9fa",
  },
  myOrdersButton: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "Orange",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  },
  snackbar: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "16px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
  },
  snackbarCloseBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    marginLeft: "8px",
    cursor: "pointer",
  },
};
