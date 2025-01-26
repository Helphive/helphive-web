import React from "react";
import './BookingInfo.css';
import { useNavigate } from "react-router-dom";
import Header from "../../Header/UserHead"; // Import Header component

const BookingInfo = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const bookingData = JSON.parse(sessionStorage.getItem('bookingData')); // Retrieve booking data from session storage

  const handleReturnHome = () => {
    navigate('/user-home'); // Redirect to the user home page
  };

  return (
    <div className="bi-pageContainer">
      <Header activeTab="bookings" onTabClick={() => {}} />

      <div className="bi-contentContainer">
        <h5 className="bi-heading">Booking Information</h5>
        {bookingData ? (
          <div className="bi-infoContainer">
            <div className="bi-infoItem">
              <strong>Start Date:</strong> {new Date(bookingData.startDate).toLocaleDateString()}
            </div>
            <div className="bi-infoItem">
              <strong>Start Time:</strong> {new Date(bookingData.startTime).toLocaleTimeString()}
            </div>
            <div className="bi-infoItem">
              <strong>Hours Needed:</strong> {bookingData.hours}
            </div>
            <div className="bi-infoItem">
              <strong>Address:</strong> {bookingData.address}
            </div>
            <div className="bi-infoItem">
              <strong>Total Charges:</strong> ${bookingData.totalCharges.toFixed(2)}
            </div>
            <div className="bi-paymentStatusContainer">
              <span className="bi-paymentLabel">Payment:</span>
              <span className="bi-paymentStatus">Confirmed</span>
            </div>
            <div className="bi-buttonContainer">
              <button onClick={handleReturnHome} className="bi-returnButton">
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <div>No booking information available.</div>
        )}
      </div>
    </div>
  );
};

// Styling for the BookingInfo page
const styles = {
  pageContainer: {
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(45deg, #FF8C00, #FF4F00)", // Double gradient (45 degrees)
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    marginTop: "80px", // Adjust this to control the distance below the header
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  infoContainer: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  infoItem: {
    marginBottom: "12px",
    fontSize: "16px",
    color: "#555",
  },
  paymentStatusContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "16px",
  },
  paymentLabel: {
    marginRight: "8px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  paymentStatus: {
    color: "green",
    fontWeight: "bold",
    fontSize: "16px",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
  },
  returnButton: {
    backgroundColor: "#FF8C00",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  },
};

export default BookingInfo;
