import React from "react";
import './Pending.css';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "../../../Auth/AuthSlice";
import { useLogoutMutation } from "../../../Auth/authApiSlice";
import { getRefreshToken } from "../../../secureStore/secureStoreUtility";

// Static import of image
import xOctagon from "../../../../assets/icons/approval-screens/paper.png";

const AccountPendingScreen = () => {
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const [logout, { error }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            const refreshToken = await getRefreshToken();
            await logout({ refreshToken: refreshToken }).unwrap();
            dispatch(logOut());
            navigate("/Login");
        } catch (err) {
            console.error("Logout failed", err || error);
        }
    };

    return (
        <div className="pending-container">
                <div className="pending-content">    
                        <img src="../../assets/icon.png" alt="Logo" />
                    <h2>Your profile is submitted for review</h2>
                    <p>
                        Please wait for up to 3 business days for the confirmation
                    </p>
                    <div className="pending-button-container">
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
                </div>
        </div>
    );
};

export default AccountPendingScreen;
