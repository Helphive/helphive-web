import React from "react";
import { useNavigate } from "react-router-dom";
import services from "../../../../../utils/services";

import calendarIcon from "../../../../../../assets/icons/bookings/calendar.png";
import locationIcon from "../../../../../../assets/icons/bookings/location.png";
import timeCircleIcon from "../../../../../../assets/icons/bookings/time-circle.png";

const OrderCard = ({ booking }) => {
  const navigate = useNavigate();
  const service = services.find((s) => s.id === booking.service.id);
  const totalPrice = (booking.rate * booking.hours).toFixed(2);

  const handlePress = () => {
    navigate(`/accept-order/${booking._id}`, { state: { booking } });
  };

  return (
    <div onClick={handlePress} style={styles.orderCard}>
      {service?.icon && (
        <img
          src={service.image}
          alt={service.name}
          style={styles.orderCardImage}
        />
      )}

      <div style={styles.orderCardContent}>
        <h3 style={styles.serviceName}>{service?.name}</h3>

        <div style={styles.infoRow}>
          <div style={styles.infoItem}>
            <img src={timeCircleIcon} alt="Time" style={styles.icon} />
            <span style={styles.infoText}>{booking.hours} hrs</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.priceText}>${totalPrice}</span>
          </div>
        </div>

        <div style={styles.infoRow}>
          <div style={styles.infoItem}>
            <img src={calendarIcon} alt="Calendar" style={styles.icon} />
            <span style={styles.infoText}>
              {new Date(booking.startDate).toLocaleString(undefined, {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>

        <div style={styles.infoRow}>
          <div style={styles.infoItem}>
            <img src={locationIcon} alt="Location" style={styles.icon} />
            <span style={styles.infoText}>{booking.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  orderCard: {
    display: "flex",
    flexDirection: "row",
    borderRadius: "12px",
    margin: "12px 0",
    padding: "12px",
    backgroundColor: "#FF8C00", // Vibrant orange
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s, box-shadow 0.2s",
    alignItems: "center",
  },
  orderCardImage: {
    width: "80px",
    height: "80px",
    marginRight: "16px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  orderCardContent: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
  },
  serviceName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "8px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    flex: "1",
    minWidth: "0",
  },
  icon: {
    width: "20px",
    height: "20px",
    marginRight: "8px",
  },
  infoText: {
    color: "#FFF5E1", // Light creamy white
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  priceText: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
  },
};

export default OrderCard;
