import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAcceptBookingMutation, useGetProviderBookingByIdMutation } from "../../../../../providers/providerApiSlice";
import { getGcloudBucketHelphiveUsersUrl } from "../../../../../utils/gcloud-strings";
import services from "../../../../../utils/services";

import calendarIcon from "../../../../../../assets/icons/bookings/calendar.png";
import locationIcon from "../../../../../../assets/icons/bookings/location.png";
import timeCircleIcon from "../../../../../../assets/icons/bookings/time-circle.png";

const AcceptOrder = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [getProviderBookingById, { data, error, isLoading: isBookingLoading }] = useGetProviderBookingByIdMutation();
  const [acceptBooking, { isLoading }] = useAcceptBookingMutation();

  const booking = data?.booking;

  useEffect(() => {
    if (bookingId) {
      getProviderBookingById({ bookingId }).catch((err) => {
        console.error("Error fetching booking:", err);
        setSnackbarMessage("An error occurred while fetching the booking details.");
        setSnackbarVisible(true);
      });
    }
  }, [bookingId]);

  const profile = getGcloudBucketHelphiveUsersUrl(booking?.userId?.profile);

  useEffect(() => {
    if (error) {
      console.error("Error fetching booking details:", error);
      setSnackbarMessage("An error occurred while fetching the booking details.");
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleAccept = async () => {
    try {
      await acceptBooking({ bookingId: booking._id }).unwrap();
      navigate(-1);
    } catch (error) {
      console.error("Error accepting booking:", error);
      if (error.status === 400 && error.data?.message) {
        setSnackbarMessage(error.data.message);
      } else {
        setSnackbarMessage("An error occurred while accepting the booking.");
      }
      setSnackbarVisible(true);
    }
  };

  const handleDecline = () => {
    navigate(-1);
  };

  const handleBack = () => {
    navigate("/provider-home"); // Navigate to the Orders tab
  };

  if (isBookingLoading || !booking) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <ArrowBackIcon style={styles.backIcon} onClick={handleBack} />
          {/* <Typography variant="h6" style={styles.title}>
            My Order
          </Typography> */}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.bookingInfo}>
          {services.map((service) => {
            if (service.id === booking?.service?.id) {
              return (
                <div key={service.id} style={styles.bookingHeader}>
                  <span style={styles.serviceName}>{service.name}</span>
                  <span style={styles.bookingId}>#{booking?._id.slice(-6).toUpperCase()}</span>
                </div>
              );
            }
            return null;
          })}
          <div style={styles.bookingDetails}>
            <div style={styles.detailRow}>
              <img src={calendarIcon} alt="Calendar" style={styles.iconImage} />
              <span>{new Date(booking?.startDate).toLocaleString()}</span>
            </div>
            <div style={styles.detailRow}>
              <img src={locationIcon} alt="Location" style={styles.iconImage} />
              <span>{booking?.address}</span>
            </div>
            <div style={styles.detailRow}>
              <img src={timeCircleIcon} alt="Time" style={styles.iconImage} />
              <span>{booking?.hours} hrs @ ${booking?.rate}/hr</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.total}>Total: ${(booking?.rate * booking?.hours).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={styles.buttons}>
          <Button
            variant="contained"
            onClick={handleAccept}
            disabled={isLoading}
            style={styles.acceptButton}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            onClick={handleDecline}
            style={styles.declineButton}
          >
            Decline
          </Button>
        </div>
      </div>

      {snackbarVisible && (
        <div style={styles.snackbar}>
          <span>{snackbarMessage}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#FFF", // Dark background color
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffb84d", // Emerald green background for header
    padding: "15px 25px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  backIcon: {
    fontSize: "1.5rem",
    color: "#fff",
    marginRight: "10px",
    cursor: "pointer",
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: "1.2rem",
  },
  content: {
    backgroundColor: "#ECF0F1", // Light grey content background
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: "20px",
  },
  bookingInfo: {
    marginBottom: "20px",
  },
  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  serviceName: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#2C3E50", // Dark text for service name
  },
  bookingId: {
    fontSize: "0.9rem",
    color: "#333", // Grey for booking ID
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  iconImage: {
    width: "20px",
    height: "20px",
    marginRight: "12px",
  },
  total: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#27AE60", // Highlight total with green
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  acceptButton: {
    flex: "1",
    marginRight: "12px",
    backgroundColor: "#27AE60", // Green for Accept button
    color: "#fff",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#2ECC71", // Darker green on hover
    },
  },
  declineButton: {
    flex: "1",
    borderColor: "#E74C3C", // Red border for Decline button
    color: "#E74C3C",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#E74C3C", // Red background on hover
      color: "#fff",
    },
  },
  snackbar: {
    position: "fixed",
    bottom: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#34495E", // Dark background for snackbar
    color: "#fff",
    padding: "12px",
    borderRadius: "5px",
    zIndex: "1000",
    fontSize: "1rem",
  },
};


export default AcceptOrder;
