import React from "react";
import { useNavigate } from "react-router-dom";
import './Rejected.css';

// Define a simple theme directly in the component
const theme = {
    colors: {
        primary: "#6200ee", // Replace with your primary color
        background: "#ffffff", // Background color
        onBackground: "#000000", // Text color on background
        bodyColor: "#333333", // Body text color
        error: "#b00020", // Error text color
        buttonText: "#ffffff", // Button text color
        fontSemiBold: "Arial, sans-serif", // Replace with your desired font
        fontRegular: "Arial, sans-serif", // Replace with your desired font
        fontBold: "Arial, sans-serif", // Replace with your desired font
    },
};

const AccountRejectedScreen = ({ userDetails }) => {
    const navigate = useNavigate();
    const primaryColorHex = theme.colors.primary;

    // Parse the hex color string into RGB components
    const r = parseInt(primaryColorHex.substring(1, 3), 16);
    const g = parseInt(primaryColorHex.substring(3, 5), 16);
    const b = parseInt(primaryColorHex.substring(5, 7), 16);

    const xOctagon = import("../../../../assets/icons/approval-screens/x-octagon.png");
    const infoSquare = import("../../../../assets/icons/info-square.png");

    return (
            <div className="reject-content-wrapper">
                <div className="reject-content">
                        <img src="../../assets/icon.png" alt="Logo" />
                    <h2>Sorry, your submission was rejected</h2>
                    <p>
                        Please find the reason on the memo from our reviewer below. You can always revise and resubmit
                        your profile anytime.
                    </p>
                    {/* <div className="reason-container">
                        <img src={infoSquare} alt="Info Icon" className="info-icon" />
                        <span className="reason-text">
                            {userDetails?.rejectReason || "No reason provided"}
                        </span>
                    </div> */}
                    <button
                        onClick={() => navigate("/ProviderDetails", { state: { userDetails } })}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
    );
};

export default AccountRejectedScreen;
