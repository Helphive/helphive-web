import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  useGetEarningsQuery,
  useStripeConnectOnboardingQuery,
  useCreatePayoutMutation,
  useGetStripeExpressLoginLinkQuery,
} from "../../../../providers/providerApiSlice";
import transactions from "../../../../utils/transactions";
import withAuthCheck from "../../../../hocs/withAuthCheck";
import { useNavigate } from 'react-router-dom';
import { Bar } from "react-chartjs-2"; // Importing the Bar chart component
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Balance = ({ userDetails }) => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const {
    data: onboardingData,
    error: onboardingError,
    isLoading: onboardingLoading,
    refetch: refetchOnboarding,
  } = useStripeConnectOnboardingQuery();
  const navigate = useNavigate();
  const {
    data: earningsData,
    error: earningsError,
    isLoading: earningsLoading,
    refetch: refetchEarnings,
  } = useGetEarningsQuery();

  const [createPayout, { isLoading: isCreatingPayout }] = useCreatePayoutMutation();
  const { refetch: refetchStripeExpressLoginLink } = useGetStripeExpressLoginLinkQuery();

  useEffect(() => {
    if (earningsError) {
      setSnackbarMessage("Error fetching earnings: " + earningsError);
      setSnackbarVisible(true);
    }
  }, [earningsError]);

  const handleAddBankAccount = async () => {
    const result = await refetchOnboarding();

    if (result.error) {
      setSnackbarMessage("Error fetching account link: " + result.error);
      setSnackbarVisible(true);
      return;
    }

    if (result.data && result.data.connectedAccountOnboardingLink) {
      const accountLink = result.data.connectedAccountOnboardingLink;
      window.open(accountLink, "_blank");
    }
  };

  const handleCreatePayout = () => {
    setDialogVisible(true);
  };

  const confirmPayout = async () => {
    try {
      await createPayout({ amount: parseFloat(payoutAmount) }).unwrap();
      setDialogVisible(false);
      await refetchEarnings();
      await refetchOnboarding();
    } catch (error) {
      setSnackbarMessage("Failed to process payout: " + error);
      setSnackbarVisible(true);
    }
  };

  const handleViewStripeDashboard = async () => {
    const result = await refetchStripeExpressLoginLink();

    if (result.error) {
      setSnackbarMessage("Error fetching Stripe login link: " + result.error);
      setSnackbarVisible(true);
      return;
    }

    if (result.data && result.data.loginLink) {
      window.open(result.data.loginLink.url, "_blank");
    }
  };

  const handleViewEarningDetails = () => {
    navigate('/earnings');
  };

  // Data for Bar Chart (replace with actual data from earnings or history)
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Earnings",
        data: [1200, 1500, 800, 2200, 1700, 1900, 2500],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceContainer}>
        {/* Left section: Total Earnings */}
        <div style={styles.leftSection}>
          <div style={styles.balanceCard}>
            <div style={styles.balanceHeader}>
              <h2>Total Earnings</h2>
              <button style={styles.linkButton} onClick={handleAddBankAccount}>
                Withdraw Methods
              </button>
            </div>
            <h3 style={styles.balanceAmount}>
              ${earningsData?.availableBalance?.toFixed(2) || "0.00"}
            </h3>
            <button
              style={styles.button}
              onClick={handleCreatePayout}
              disabled={!userDetails?.user?.stripeConnectedAccountId}
            >
              Withdraw
            </button>
            <button
              style={styles.button}
              onClick={handleViewStripeDashboard}
              disabled={!userDetails?.user?.stripeConnectedAccountId}
            >
              View Stripe Dashboard
            </button>
            <button style={styles.desiBtn} onClick={handleViewEarningDetails}>
              View Upcoming Earnings
            </button>
          </div>
        </div>

        {/* Right section: Payout History */}
        <div style={styles.rightSection}>
          <h2>Payout History</h2>
          {transactions.length === 0 ? (
            <p>No Payouts Yet. Information will appear here once available.</p>
          ) : (
            <ul style={styles.transactionList}>
              {transactions.map((transaction, index) => (
                <li key={index} style={styles.transactionItem}>
                  <div>{transaction.withdrawMethod}</div>
                  <div>{transaction.amount} {transaction.currency}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bar Chart Section */}
      <div style={styles.chartSection}>
        <h2>Monthly Earnings</h2>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      {dialogVisible && (
        <div style={styles.dialog}>
          <h3>Enter Payout Amount</h3>
          <input
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button} onClick={confirmPayout} disabled={isCreatingPayout}>
            {isCreatingPayout ? "Processing..." : "Confirm"}
          </button>
          <button style={styles.outlinedButton} onClick={() => setDialogVisible(false)}>
            Cancel
          </button>
        </div>
      )}

      {snackbarVisible && (
        <div style={styles.snackbar}>
          {snackbarMessage}
          <button onClick={() => setSnackbarVisible(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Roboto', sans-serif",
    margin: "0 auto",
    padding: "20px",
    maxWidth: "1200px",
    backgroundColor: "#f4f4f4",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  balanceContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  leftSection: {
    flex: "1",
    marginRight: "20px",
  },
  rightSection: {
    flex: "1",
  },
  chartSection: {
    marginTop: "40px",
  },
  balanceCard: {
    background: "linear-gradient(145deg, #333, #FF6F00)",
    color: "#fff",
    padding: "30px 20px",
    borderRadius: "12px",
    marginBottom: "30px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  balanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  linkButton: {
    color: "#FF6F00",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  balanceAmount: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginTop: "20px",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#FF6F00",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px",
    width: "100%",
    transition: "all 0.3s ease-in-out",
  },
  desiBtn: {
    border: "1px solid #FF6F00",
    color: "#fff",
    background: "none",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  transactionList: {
    listStyle: "none",
    padding: "0",
  },
  transactionItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  dialog: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    zIndex: "1000",
  },
  input: {
    padding: "10px",
    marginBottom: "20px",
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  outlinedButton: {
    backgroundColor: "transparent",
    border: "1px solid #FF6F00",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  snackbar: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
  },
};

export default withAuthCheck(Balance);
