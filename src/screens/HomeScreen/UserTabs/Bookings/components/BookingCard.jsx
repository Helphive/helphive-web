import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import services from "../../../../../utils/services";
import { useDispatch } from "react-redux";
import "./BookingCard.css";
import { gsap } from "gsap";

import {
  setBookingId,
  setBookingInfo,
  setClientSecret,
  setPaymentIntentId,
  setPaymentStatus,
} from "../../../../../Booking/bookSlice";

const BookingCard = ({ tab, bookingsList }) => {
  useEffect(() => {
    gsap.fromTo(
      ".booking-card",
      { opacity: 0, y: 50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: { amount: 0.4, from: "center" }, // Animates from the center outwards
      }
    );
  }, [bookingsList]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBookingPress = (booking) => {
    if (tab === "scheduled") {
      dispatch(
        setBookingInfo({
          ...booking,
          startDate: booking.startDate,
          startTime: booking.startDate,
        })
      );
      const firstPayment = booking.payments[0];
      if (firstPayment) {
        dispatch(setBookingId(booking.id));
        dispatch(setPaymentIntentId(firstPayment.paymentIntentId));
        dispatch(setClientSecret(firstPayment.clientSecret));
        dispatch(setPaymentStatus(firstPayment.status));
      }
      if (firstPayment?.status === "completed") {
        console.log(
          "Navigating to booking-details with ID: ",
          booking.id || booking._id
        );
        navigate(`/booking-details/${booking.id || booking._id}`);
      } else {
        navigate("/booking-payment");
      }
    } else {
      console.log(
        "Navigating to booking-details with ID: ",
        booking.id || booking._id
      );
      navigate(`/booking-details/${booking.id || booking._id}`);
    }
  };

  return (
    <div className="booking-card-container">
      {bookingsList?.length > 0 ? (
        bookingsList.map((booking, index) => {
          const service = services.find((s) => s.id === booking.service.id);
          return (
            <button
              key={index}
              className="booking-card"
             
            onClick={() => handleBookingPress(booking)}
            >
              {(tab === "active" || tab === "history") && (
                <div className="statusContainer">
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(booking?.status),
                    }}
                  >
                    {booking?.status}
                  </span>
                </div>
              )}

              <div>
                {service && (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="serviceImage"
                  />
                )}
                <div className="textContainer">
                  <span>{service?.name}</span>
                  <span title={booking.address}>{booking.address}</span>
                </div>
                {tab === "scheduled" && (
                  <div style={styles.paymentStatus}>
                    <span
                      style={{
                        ...styles.paymentBadge,
                        backgroundColor: booking.payments.some(
                          (p) => p.status === "completed"
                        )
                          ? "#4CAF50"
                          : "#FFC107",
                      }}
                    >
                      {booking.payments.some((p) => p.status === "completed")
                        ? "Payment\nComplete"
                        : "Payment\nRequired"}
                    </span>
                  </div>
                )}
              </div>

              <div className="footorCard">
                <span>${Number(booking.rate * booking.hours).toFixed(2)}</span>
                <div>
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="noBookingsMessage">
          <span className="noBookingsText">
            {tab === "history" && "You've never made any bookings"}
            {tab === "active" && "No new bookings yet"}
            {tab === "scheduled" && "You haven't scheduled any bookings"}
          </span>
          <span className="checkBackText">
            Check back after your next trip
          </span>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "#4CAF50"; // Green
    case "cancelled":
      return "#F44336"; // Red
    case "pending":
    case "in progress":
      return "#FF9800"; // Orange
    default:
      return "#9E9E9E"; // Grey
  }
};

// Inline styles
const styles = {

  statusContainer: {
    marginBottom: "8px",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
  },
 
  
  paymentStatus: {
    marginTop: "8px",
    marginBottom: "8px",
  },
  paymentBadge: {
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "12px",
    color: "#fff",
    textAlign: "center",
  },


  
};

export default BookingCard;
