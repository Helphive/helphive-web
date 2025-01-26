import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetResetPasswordMutation } from "../../Email/emailApiSlice";
import './ForgetPasswirdScreen.css'; // Import any necessary CSS styles


const ForgotPasswordScreen = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(null); // Removed TypeScript type
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(null); // Removed TypeScript type
    const [resetPasswordError, setResetPasswordError] = useState(null); // Removed TypeScript type
    const [getResetPassword, { isLoading }] = useGetResetPasswordMutation();

    const handleEmailChange = (e) => { // Removed TypeScript type
        setEmail(e.target.value);
        setEmailError(null);
        setResetPasswordError(null);
    };

    const handleForgotPassword = async () => {
        if (!email.includes('@')) { // Basic email validation
            setEmailError("Please enter a valid email address.");
            return;
        }

        setEmailError(null);
        setResetPasswordError(null);

        try {
            const credentials = { email: email.trim() };
            await getResetPassword(credentials).unwrap();
            setResetPasswordSuccess("An email has been sent. Reset your password through the link provided.");
            setResetPasswordError(null);
            setEmail("");
        } catch (error) {
            console.log("Forgot password error:", error?.data?.message || error?.message || error);
            setResetPasswordError(getErrorMessage(error));
        }
    };

    const getErrorMessage = (error) => { // Removed TypeScript type
        if (error?.error?.includes("Network request failed")) {
            return "Network error. Please check your internet connection and try again.";
        } else if (error?.status === 400) {
            return "Invalid email.";
        } else if (error?.status === 404) {
            return "No associated user found with the provided email address.";
        } else if (error?.status >= 500) {
            return "Internal server error. Please try again later.";
        } else {
            return "An unexpected error occurred. Please try again later.";
        }
    };

    return (
        <div className="forgetpassword-screen">
        <div className="forgot-password-container">
        <img src="../../assets/icon.png" alt="Logo" />
            <button className="back-button" onClick={() => navigate("/login")}>
                Back to Login
            </button>
            <h1>Can't remember your password?</h1>
            <p>Don't worry! We'll send you an email to reset it.</p>
            <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className={`email-input ${emailError ? "error" : ""}`}
            />
            {emailError && <p className="error-message">{emailError}</p>}
            <button onClick={handleForgotPassword} disabled={isLoading} className="reset-password-button">
                {isLoading ? "Loading..." : "Reset Password"}
            </button>

            {resetPasswordSuccess && (
                <div className="dialog">
                    <h2>Check your inbox</h2>
                    <p>{resetPasswordSuccess}</p>
                    <button onClick={() => setResetPasswordSuccess(null)}>Close</button>
                </div>
            )}
            {resetPasswordError && (
                <div className="dialog">
                    <h2>Error</h2>
                    <p>{resetPasswordError}</p>
                    <button onClick={() => setResetPasswordError(null)}>Try Again</button>
                </div>
            )}
        </div>

        </div>
    );
};

export default ForgotPasswordScreen;
