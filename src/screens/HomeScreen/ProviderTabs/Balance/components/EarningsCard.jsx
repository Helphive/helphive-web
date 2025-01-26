import React from "react";

const EarningsCard = ({ earning }) => {
  const handlePress = () => {
    alert(`Navigating to details for Booking ID: ${earning.bookingId}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Upcoming";
      case "completed":
        return "Processed";
      default:
        return "Error";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#fbbd08", color: "#ffffff" };
      case "completed":
        return { backgroundColor: "#21ba45", color: "#ffffff" };
      case "cancelled":
        return { backgroundColor: "#db2828", color: "#ffffff" };
      default:
        return {};
    }
  };

  const completionDate = new Date(earning.date);
  const paymentDeliveryDate = new Date(completionDate);
  paymentDeliveryDate.setDate(completionDate.getDate() + 5);

  return (
    <div className="earnings-card" onClick={handlePress}>
      <style>{`
        .earnings-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 16px;
          cursor: pointer;
          background-color: #fff;
          transition: box-shadow 0.2s ease;
        }
        .earnings-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }
        .earnings-amount {
          font-size: 20px;
          font-weight: bold;
          margin-right: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
        }
        .icon {
          margin-right: 8px;
          width: 20px;
          height: 20px;
        }
      `}</style>

      <div className="info-row">
        <div
          className="status-badge"
          style={getStatusStyle(earning.status)}
        >
          {getStatusText(earning.status)}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="earnings-amount">${earning.amount.toFixed(2)}</span>
          {earning.status === "pending" && "⏳"}
          {earning.status === "completed" && "✔️"}
          {earning.status === "cancelled" && "❌"}
        </div>
      </div>

      <div className="info-row">
        <span className="info-label">Booking ID:</span>
        <span>#{earning.bookingId.slice(-6).toUpperCase()}</span>
      </div>

      <div className="info-row">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/path-to-calendar-icon.png"
            alt="Calendar"
            className="icon"
          />
          <span>Completion Date:</span>
        </div>
        <span>
          {completionDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      </div>

      <div className="info-row">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/path-to-calendar-icon.png"
            alt="Calendar"
            className="icon"
          />
          <span>Expected Payment On:</span>
        </div>
        <span>
          {paymentDeliveryDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default EarningsCard;
