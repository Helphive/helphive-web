import React from "react";
import './history.css';
import Header from "../../Header/UserHead"; // Adjust the path based on your project structure

const BookingHistory = () => {
  // Placeholder for booking data (empty array means no bookings)
  const bookingHistory = [];

  return (
    <div className="h-page-container">
      <Header activeTab="history" onTabClick={() => {}} /> {/* Pass activeTab to highlight the current tab if needed */}
      <h2 className="h-header">Booking History</h2>
      {bookingHistory.length === 0 ? (
        <div className="h-no-bookings">
          <p>No bookings in history currently.</p>
        </div>
      ) : (
        <div className="h-booking-list">
          {bookingHistory.map((booking, index) => (
            <div key={index} className="h-booking-item">
              <h3>{booking.serviceName}</h3>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Total Cost:</strong> ${booking.totalCost.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Inline styles for the component
const styles = {
  pageContainer: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
    textAlign: "center",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginTop: "20px",
    marginBottom: "20px",
  },
  noBookings: {
    fontSize: "18px",
    color: "#888",
    padding: "40px 20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  bookingList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  bookingItem: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
};

export default BookingHistory;
