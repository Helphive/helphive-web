import React, { useState, useEffect } from "react";
import "./MyOrderDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import {
  useGetProviderBookingByIdMutation,
  useStartBookingMutation,
} from "../../../../../providers/providerApiSlice";
import {
  useCompleteBookingMutation,
  useCancelBookingMutation,
} from "../../../../../Auth/authApiSlice";
import { getGcloudBucketHelphiveUsersUrl } from "../../../../../utils/gcloud-strings";
import services from "../../../../../utils/services";

import calendarIcon from "../../../../../../assets/icons/bookings/calendar.png";
import locationIcon from "../../../../../../assets/icons/bookings/location.png";
import backIcon from "../../../../../../assets/icons/bookings/back-icon.png";

const MyOrderDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isCompletingJob, setIsCompletingJob] = useState(false);
  const [isCancellingJob, setIsCancellingJob] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [getProviderBookingById, { data, error, isLoading: isBookingLoading }] =
    useGetProviderBookingByIdMutation();
  const [startBooking] = useStartBookingMutation();
  const [completeBooking] = useCompleteBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();

  const booking = data?.booking;
  const profile = getGcloudBucketHelphiveUsersUrl(booking?.userId?.profile);

  useEffect(() => {
    if (bookingId) {
      getProviderBookingById({ bookingId }).catch((err) => {
        console.error("Error fetching booking:", err);
        setSnackbarMessage(
          "An error occurred while fetching the booking details."
        );
      });
    }
  }, [bookingId]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching booking details:", error);
      setSnackbarMessage(
        "An error occurred while fetching the booking details."
      );
    }
  }, [error]);

  const handleStartJob = async () => {
    if (booking?.status === "pending") {
      setIsStartingJob(true);
      try {
        const result = await startBooking({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getProviderBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error starting booking:", err);
        setSnackbarMessage("An error occurred while starting the booking.");
      } finally {
        setIsStartingJob(false);
      }
    }
  };

  const handleCompleteJob = async () => {
    if (booking?.status === "in progress") {
      setIsCompletingJob(true);
      try {
        const result = await completeBooking({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getProviderBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error completing booking:", err);
        setSnackbarMessage("An error occurred while completing the booking.");
      } finally {
        setIsCompletingJob(false);
      }
    }
  };

  const handleCancelBooking = async () => {
    if (booking?.status === "pending") {
      setIsCancellingJob(true);
      try {
        const result = await cancelBooking({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getProviderBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error cancelling booking:", err);
        setSnackbarMessage("An error occurred while cancelling the booking.");
      } finally {
        setIsCancellingJob(false);
      }
    }
  };

  if (isBookingLoading || !booking) {
    return (
      <div className="order-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="order-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="Back" />
        </button>
        <h1 className="order-title">Order Status</h1>
      </div>

      <div className="order-status">{booking?.status}</div>

      <div className="service-details">
        {services.map((service) => {
          if (service.id === booking?.service?.id) {
            return (
              <div className="service-info" key={service.id}>
                <h2 className="service-name">{service.name}</h2>
                <p className="booking-id">#{booking?._id.slice(-6).toUpperCase()}</p>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="date-location-container">
        <div className="date-info">
          <img src={calendarIcon} alt="Calendar" className="icon" />
          <p className="date-text">{new Date(booking?.startDate).toLocaleString()}</p>
        </div>
        <div className="location-info">
          <img src={locationIcon} alt="Location" className="icon" />
          <p className="location-text">{booking?.address}</p>
        </div>
      </div>

      <div className="user-info-container">
        {booking?.userId?.profile ? (
          <img className="user-profile" src={profile} alt="User Profile" />
        ) : (
          <div className="default-profile">👤</div>
        )}
        <div className="user-details">
          <p className="user-name">
            {booking?.userId?.firstName} {booking?.userId?.lastName}
          </p>
          <p className="user-email">{booking?.userId?.email}</p>
        </div>
      </div>

      <div className="price-details-container">
        <h3 className="price-title">Price Details</h3>
        <div className="price-info">
          <p className="price-label">Rate</p>
          <p className="price-value">${booking?.rate || 0} / hour</p>
        </div>
        <div className="price-info">
          <p className="price-label">Hours</p>
          <p className="price-value">{booking?.hours || 0}</p>
        </div>
        <div className="price-info">
          <p className="price-label">Total</p>
          <p className="price-value">${(booking?.hours * booking?.rate).toFixed(2) || 0}</p>
        </div>
        <div className="price-info">
          <p className="price-label">Platform Fee (5%)</p>
          <p className="price-value">-${(booking?.hours * booking?.rate * 0.05).toFixed(2) || 0}</p>
        </div>
        <div className="price-info total-receivable">
          <p className="price-label">Total Receivable</p>
          <p className="price-value">${(booking?.hours * booking?.rate * 0.95).toFixed(2) || 0}</p>
        </div>
      </div>

      <div className="actions-container">
        {booking?.status === "pending" && (
          <>
            <Button
              className="start-job-button"
              onClick={handleStartJob}
              disabled={isStartingJob || booking?.userApprovalRequested}
            >
              Start Job
            </Button>
            <Button
              className="cancel-booking-button"
              onClick={handleCancelBooking}
              disabled={isCancellingJob}
            >
              Cancel Booking
            </Button>
          </>
        )}

        {booking?.status === "in progress" && (
          <Button
            className="complete-job-button"
            onClick={handleCompleteJob}
            disabled={isCompletingJob}
          >
            Complete Job
          </Button>
        )}
      </div>

      {snackbarMessage && <div className="snackbar">{snackbarMessage}</div>}
    </div>
  );
};

export default MyOrderDetails;
