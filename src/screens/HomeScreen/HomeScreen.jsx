import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

const HomeScreen = ({ userDetails }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!userDetails) return; 

        if (userDetails?.roles?.Provider) {
            switch (userDetails.status) {
                case "inactive":
                    navigate("/provider-details");
                    break;
                case "approved":
                    navigate(userDetails?.accountApprovalScreen ? "/provider-home" : "/account-approval");
                    break;
                case "rejected":
                    navigate("/account-rejected");
                    break;
                case "pending":
                    navigate("/account-pending");
                    break;
                default:
                    break;
            }
        } else if (userDetails?.roles?.User) {
            navigate("/user-home");
        }
    }, [userDetails, navigate]);

    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            
        </div>
    );
};

export default HomeScreen;
