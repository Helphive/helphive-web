import React, { useState } from "react";
import './Approval.css';
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import { Button, Typography, CircularProgress } from "@mui/material";
import { useAccountApprovalScreenMutation } from "../../../providers/providerApiSlice"; // Corrected import path

const AccountApprovalScreen = ({ userDetails }) => {
  const navigate = useNavigate(); // useNavigate hook
  const [accountApproval, { isLoading }] = useAccountApprovalScreenMutation();
  const [accountApprovalError, setAccountApprovalError] = useState(null);

  const primaryColorHex = "#FF6600"; // Use basic color code
  const backgroundColor = "#F4F4F4"; // Background color
  const onBackgroundColor = "#333333"; // Text color
  const fontSemiBold = "Arial, sans-serif"; // Semi-bold font
  const fontRegular = "Arial, sans-serif"; // Regular font
  const bodyColor = "#666666"; // Body text color

  const xOctagon = import("../../../../assets/icons/approval-screens/check-circle.png");

  const beginYourJourney = async () => {
    setAccountApprovalError(null);
    try {
      await accountApproval().unwrap();
      navigate("/provider-home", { state: { userDetails } }); // Use navigate instead of history.push
    } catch (error) {
      console.error("Error: ", error);
      if (error?.status === "FETCH_ERROR") {
        setAccountApprovalError("Please check your internet connection.");
      } else {
        setAccountApprovalError("An error occurred while processing request.");
      }
    }
  };

  return (
    <div className="account-approval-screen">
      <div className="approval-content">
        <div className="approval-icon-container">
        <img src="../../assets/icon.png" alt="Logo" />
        </div>
        <Typography variant="h5" className="heading">
          Congratulations! Your profile has been approved! 🎉
        </Typography>
        <Typography variant="body1" className="description">
          Start accepting opportunities and connect with world's need today!
        </Typography>
        {accountApprovalError && (
          <Typography variant="body2" className="error-message">
            {accountApprovalError}
          </Typography>
        )}
        <Button
          onClick={beginYourJourney}
          variant="contained"
          color="primary"
          fullWidth
          className="approve-button"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Begin Your Journey"}
        </Button>
      </div>
    </div>
  );
};

export default AccountApprovalScreen;
