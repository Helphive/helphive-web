import React from "react";
import './Active.css';
import Header from "../../Header/UserHead"; // Adjust the path based on your file structure

const BookingActive = () => {
  return (
    <div className="active-booking-container">
      <Header activeTab="bookings" onTabClick={() => {}} /> {/* Header component */}

      <div className="status-message">
        <h2>Waiting for providers to pick up your request</h2>
        <p>Your booking request has been sent. Providers will review and accept your request shortly. You’ll be notified when it’s picked up.</p>
      </div>

      <button className="cancel-booking-button" onClick={() => { /* Add cancellation logic */ }}>
        Cancel Booking
      </button>
    </div>
  );
};

export default BookingActive;
