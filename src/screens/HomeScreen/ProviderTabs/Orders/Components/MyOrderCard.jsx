import React from "react";
import { useNavigate } from "react-router-dom";
import calendarIcon from "../../../../../../assets/icons/bookings/calendar.png";
import locationIcon from "../../../../../../assets/icons/bookings/location.png";
import timeCircleIcon from "../../../../../../assets/icons/bookings/time-circle.png";

const MyOrderCard = ({ booking }) => {
  const navigate = useNavigate();
  const totalPrice = (booking.rate * booking.hours).toFixed(2);

  const handlePress = () => {
    navigate(`/my-order-details/${booking._id}`);
  };

  return (
    <div
      onClick={handlePress}
      style={{
        borderRadius: "10px",
        margin: "16px 0",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#333",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        cursor: "pointer",
        overflow: "hidden",
        padding: "16px",
        color: "white",
        border: "2px solid #FF8C00",
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Status */}
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              backgroundColor:
                booking.status === "pending"
                  ? "#ffcc00"
                  : booking.status === "in progress"
                  ? "#ff9900"
                  : booking.status === "completed"
                  ? "#28a745"
                  : "#dc3545",
              padding: "4px 12px",
              borderRadius: "16px",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        {/* Service Name */}
        <h3 style={{ margin: "8px 0", fontWeight: "bold", color: "#FF8C00" }}>
          {booking.service?.name || "Service"}
        </h3>

        {/* Price and Hours */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "#FF8C00", fontWeight: "bold", fontSize: "16px" }}>
            ${totalPrice}
          </span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={timeCircleIcon}
              alt="Time"
              style={{
                height: "20px",
                width: "20px",
                marginRight: "4px",
                filter: "invert(61%) sepia(69%) saturate(722%) hue-rotate(15deg) brightness(100%) contrast(97%)",
              }}
            />
            <span style={{ fontSize: "14px" }}>{booking.hours} hrs</span>
          </div>
        </div>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <img
            src={calendarIcon}
            alt="Calendar"
            style={{
              height: "20px",
              width: "20px",
              marginRight: "4px",
              filter: "invert(61%) sepia(69%) saturate(722%) hue-rotate(15deg) brightness(100%) contrast(97%)",
            }}
          />
          <span style={{ fontSize: "14px", color: "#FF8C00" }}>
            {new Date(booking.startDate).toLocaleString(undefined, {
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>

        {/* Address */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <img
            src={locationIcon}
            alt="Location"
            style={{
              height: "20px",
              width: "20px",
              marginRight: "4px",
              filter: "invert(61%) sepia(69%) saturate(722%) hue-rotate(15deg) brightness(100%) contrast(97%)",
            }}
          />
          <span style={{ fontSize: "14px", color: "#ccc", flexShrink: 1 }}>
            {booking.address || "No Address Provided"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyOrderCard;
