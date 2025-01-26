import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../../../../providers/providerApiSlice";
import MyOrderCard from "../Components/MyOrderCard";
import "./MyOrders.css";
import Footer from "../../../Header/footer";

// Import assets
const vector1 = import("../../../../../../assets/cloud vectors/vector-1.png");
const vector2 = import("../../../../../../assets/cloud vectors/vector-2.png");
const logo = import("../../../../../../assets/Logo/logo-light.png");

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To track location changes
  const { data: bookings, refetch, isFetching, error } = useGetMyOrdersQuery();
  const scrollViewRef = useRef(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    // Refetch data when component mounts
    refetch();
    scrollViewRef.current?.scrollTo(0, 0);
  }, [refetch, location]); // Re-run when location changes

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleRefresh = () => {
    refetch();
    scrollViewRef.current?.scrollTo(0, 0);
  };

  return (
    <div className="mo-container">
       <div className="mo-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button onClick={() => navigate(-1)} className="mo-backButton">
            ←
          </button>
          {/* <img src="../../../../../assets/icon.png" alt="Logo" /> */}
          {/* <span className="mo-title">My Orders</span> */}
        </div>
      </div>

      {/* <div className="mo-imageBackground1">
        <img src={vector1} alt="Background Vector" />
      </div>
      <div className="mo-imageBackground2">
        <img src={vector2} alt="Background Vector" />
      </div> */}

      <div className="mo-scrollView" ref={scrollViewRef}>
        {/* <button onClick={handleRefresh} className="mo-refreshButton">
          Refresh Orders
        </button> */}
        {Array.isArray(bookings) && bookings.length > 0 ? (
          bookings.map((booking) => (
            <MyOrderCard key={booking._id} booking={booking} />
          ))
        ) : (
          <div className="mo-noOrders">
            <span className="mo-noOrdersText">
              You haven't had any orders yet. Don't worry! You can start
              accepting new orders now.
            </span>
          </div>
        )}
      </div>

      {snackbarVisible && (
        <div className="mo-snackbar visible">
          Failed to refresh bookings. Please try again.
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default Orders;
