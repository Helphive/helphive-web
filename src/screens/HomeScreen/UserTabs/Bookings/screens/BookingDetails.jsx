import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";  
import { Button } from "react-bootstrap";  
import services from "../../../../../utils/services";
import { getGcloudBucketHelphiveUsersUrl } from "../../../../../utils/gcloud-strings";
import { useGetBookingByIdMutation, useApproveStartJobRequestMutation } from "../../../../../User/userApiSlice";
import { useCompleteBookingMutation, useCancelBookingMutation } from "../../../../../Auth/authApiSlice";
import logo from '../../../../../../assets/Logo/logo-light.png';

const BookingDetails = () => {
  const { bookingId } = useParams();  
  const navigate = useNavigate();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isCompletingBooking, setIsCompletingBooking] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);

  const [getBookingById, { data, error, isLoading: isBookingLoading }] = useGetBookingByIdMutation();
  const [approveStartJobRequest] = useApproveStartJobRequestMutation();
  const [completeBookingRequest] = useCompleteBookingMutation();
  const [cancelBookingRequest] = useCancelBookingMutation();

  const booking = data?.booking;
  const profile = getGcloudBucketHelphiveUsersUrl(booking?.providerId?.profile);

  useEffect(() => {
    if (bookingId) {
      getBookingById({ bookingId }).catch((err) => {
        console.error("Error fetching booking:", err);
        setSnackbarMessage("An error occurred while fetching the booking details.");
        setSnackbarVisible(true);
      });
    }
  }, [bookingId]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching booking details:", error);
      setSnackbarMessage("An error occurred while fetching the booking details.");
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleStartJob = async () => {
    if (booking?.status === "pending") {
      setIsStartingJob(true);
      try {
        const result = await approveStartJobRequest({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error starting booking:", err);
        setSnackbarMessage("An error occurred while starting the booking.");
        setSnackbarVisible(true);
      } finally {
        setIsStartingJob(false);
      }
    }
  };

  const handleCompleteJob = async () => {
    if (booking?.status === "in progress") {
      setIsCompletingBooking(true);
      try {
        const result = await completeBookingRequest({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error completing booking:", err);
        setSnackbarMessage("An error occurred while completing the booking.");
        setSnackbarVisible(true);
      } finally {
        setIsCompletingBooking(false);
      }
    }
  };

  const handleCancelBooking = async () => {
    if (booking?.status === "pending" || booking?.status === "in progress") {
      setIsCancellingBooking(true);
      try {
        const result = await cancelBookingRequest({ bookingId }).unwrap();
        if (result.error) {
          throw new Error(result.error);
        }
        await getBookingById({ bookingId }).unwrap();
      } catch (err) {
        console.error("Error cancelling booking:", err);
        setSnackbarMessage("An error occurred while cancelling the booking.");
        setSnackbarVisible(true);
      } finally {
        setIsCancellingBooking(false);
      }
    }
  };

  if (isBookingLoading || !booking) {
    return (
      <div style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
      <div style={{ paddingTop: 24, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", border: "none", background: "transparent" }}>
            <img src={logo} style={{ height: 32, width: 32, marginRight: 8 }} />
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>Order Status</span>
          </button>
        </div>
      </div>
      <div style={{ position: "relative", padding: 20, backgroundColor: "#fff", borderRadius: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: "500", color: booking?.status === "completed" ? "green" : booking?.status === "cancelled" ? "red" : "orange" }}>
            {booking?.status}
          </span>
        </div>
        <div style={{ marginBottom: 16 }}>
          {services.map((service) => {
            if (service.id === booking?.service?.id) {
              return (
                <div key={service.id} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ flex: 1, fontSize: 18, fontWeight: "600" }}>{service.name}</span>
                  <span>{`#${booking?._id.slice(-6).toUpperCase()}`}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span>
              {new Date(booking?.startDate).toLocaleString(undefined, {
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
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {booking?.address}
            </span>
          </div>
        </div>
        {(booking?.status === "pending" || booking?.status === "in progress") && booking.providerId && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Button onClick={handleStartJob} style={{ flex: 1, marginRight: 4 }} disabled={isStartingJob || !booking?.userApprovalRequested}>
              Call
            </Button>
            <Button onClick={() => {}} style={{ flex: 1, marginLeft: 4 }}>
              Chat
            </Button>
          </div>
        )}
      </div>

      <div style={{ padding: "16px 20px" }}>
        <span style={{ fontSize: 14, fontWeight: "600" }}>Actions</span>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <Button onClick={handleStartJob} disabled={isStartingJob || booking?.status !== "pending"} style={{ flex: 1, marginRight: 4 }}>
            {isStartingJob ? "Starting..." : "Start Job"}
          </Button>
          <Button onClick={handleCompleteJob} disabled={isCompletingBooking || booking?.status !== "in progress"} style={{ flex: 1, marginLeft: 4 }}>
            {isCompletingBooking ? "Completing..." : "Complete Job"}
          </Button>
          <Button onClick={handleCancelBooking} disabled={isCancellingBooking || booking?.status !== "pending"} style={{ flex: 1, marginLeft: 4 }}>
            {isCancellingBooking ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
