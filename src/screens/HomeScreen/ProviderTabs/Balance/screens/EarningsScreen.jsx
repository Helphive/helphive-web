import React, { useCallback, useEffect, useRef, useState } from "react";
import EarningsCard from "../components/EarningsCard";
import withAuthCheck from "../../../../../hocs/withAuthCheck";
import { useGetEarningsQuery } from "../../../../../providers/providerApiSlice";

const EarningsScreen = () => {
  const { data: earningsData, refetch, isFetching, error } = useGetEarningsQuery();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const scrollViewRef = useRef(null);

  const earnings = earningsData?.earnings || [];

  const handleRefresh = useCallback(() => {
    refetch();
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = 0;
    }
  }, [refetch]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  return (
    <div style={styles.container}>
      <style>
        {`
          .snackbar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            display: none;
          }
          .snackbar.show {
            display: block;
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={() => window.history.back()}
          style={styles.backButton}
        >
          {"<"}
        </button>
        <h1 style={styles.title}>Your Earnings</h1>
      </div>

      {/* Main Content */}
      <div
        style={styles.scrollView}
        ref={scrollViewRef}
      >
        {isFetching ? (
          <p style={styles.loadingText}>Loading earnings...</p>
        ) : earnings.length > 0 ? (
          earnings.map((earning) => (
            <div key={earning._id} style={styles.cardContainer}>
              <EarningsCard earning={earning} />
            </div>
          ))
        ) : (
          <div style={styles.noData}>
            <p>You haven't completed any orders yet.</p>
            <p>
              Don't worry! Once you complete an order, you will see the
              upcoming amount here.
            </p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button onClick={handleRefresh} style={styles.refreshButton}>
        Refresh
      </button>

      {/* Snackbar */}
      <div className={`snackbar ${snackbarVisible ? "show" : ""}`}>
        Failed to refresh earnings. Please try again.
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    background: "#f9f9f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
  },
  header: {
    background: "linear-gradient(145deg, #333, #FF6F00)",
    color: "white",
    width: "100%",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
  },
  backButton: {
    fontSize: "20px",
    marginRight: "16px",
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: "white",
  },
  title: {
    margin: 0,
  },
  scrollView: {
    marginTop:"20px",
    width: "100%",
    maxWidth: "600px",
    background: "white",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
  },
  cardContainer: {
    marginBottom: "16px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "16px",
  },
  noData: {
    textAlign: "center",
    color: "#777",
  },
  refreshButton: {
    marginTop: "16px",
    padding: "8px 16px",
    background: "linear-gradient(145deg, #333, #FF6F00)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    color: "#777",
  },
};

export default withAuthCheck(EarningsScreen);
