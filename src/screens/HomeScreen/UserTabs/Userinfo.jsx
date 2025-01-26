import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGcloudBucketHelphiveUsersUrl } from "../../../utils/gcloud-strings";
import Header from "../Header/UserHead"; // Adjust import path as needed
import verifiedIcon from "../../../../assets/icons/user-tabs/profile.png";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Profile = ({ userDetails }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(userDetails?.firstName || "");
  const [lastName, setLastName] = useState(userDetails?.lastName || "");
  const [email, setEmail] = useState(userDetails?.email || "");
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [successMessage, setSuccessMessage] = useState("");

  // Logout function to clear user data and navigate to the login page
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Adjust if using session storage or different token key
    navigate("/login");
  };

  // Handle profile update
  const handleUpdateProfile = () => {
    // Simulate profile update logic here (e.g., API call to update profile)
    console.log("Profile updated with:", { firstName, lastName, email, phone });

    // Display success message
    setSuccessMessage("Your profile is updated successfully!");

    // Optionally, clear the success message after a few seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const profile = userDetails?.profile
    ? `${getGcloudBucketHelphiveUsersUrl(userDetails.profile)}`
    : "";

  // Random data for the user engagement chart
  const randomData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "User Engagement",
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)), // Random values
        backgroundColor: "#fc4a1a",
        borderColor: "#f7b733",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Engagement (Monthly)",
      },
    },
  };

  // Simulating order categories with random data
  const orderStats = {
    complete: 2,
    active: 0,
    scheduled: 6,
  };

  // Check for undefined userDetails early and display loading if necessary
  if (!userDetails) {
    return <div>Loading...</div>; // or any loading indicator
  }

  return (
    <div className="profile-page">
      {/* Header component */}
      <Header />

      {/* Profile Content */}
      <div className="profile-content">
        {/* Left Section: Profile Image and Form */}
        <div className="left-section">
          <div className="profile-image-container">
            <img
              src={profile || verifiedIcon}
              alt="profile"
              className="profile-img"
            />
          </div>

          <div className="profile-form">
            <div className="input-field">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div className="input-field">
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="update-button" onClick={handleUpdateProfile}>
              Update Profile
            </button>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
          </div>
        </div>

        {/* Right Section: Orders Count and Activity Chart */}
        <div className="right-section">
          <div className="orders-section">
            <h3>Number of Orders</h3>
            <div className="order-status">
              <div className="order-category">
                <h4>Complete</h4>
                <p>{orderStats.complete}</p>
              </div>
              <div className="order-category">
                <h4>Active</h4>
                <p>{orderStats.active}</p>
              </div>
              <div className="order-category">
                <h4>Scheduled</h4>
                <p>{orderStats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="activity-chart">
            <h3>User Activity</h3>
            <Bar data={randomData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Inline CSS */}
      <style>
        {`
          .profile-page {
            background: linear-gradient(120deg, #f7b733, #fc4a1a);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2%;
            box-sizing: border-box;
          }

          .profile-page > header {
            width: 100%;
            z-index: 10;
            background-color: #fc4a1a;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .profile-content {
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 1200px;
            margin-top: 120px;
            padding: 30px;
            box-sizing: border-box;
          }

          .left-section,
          .right-section {
            width: 48%;
            background-color: #333; /* Dark background */
            color: #fff; /* White text */
            border-radius: 15px;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            padding: 30px;
            animation: slideIn 0.5s ease-in-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .profile-image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
          }

          .profile-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid #f7b733;
            object-fit: cover;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          }

          .profile-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .input-field {
            display: flex;
            flex-direction: column;
          }

          .input-field label {
            font-size: 1.1rem;
            color: #FFF;
            margin-bottom: 8px;
          }

          .input-field input {
            padding: 12px;
            font-size: 1rem;
            border:none;
            border-bottom:2px solid white;
            background:none;
            transition: all 0.3s ease;
            color:#ccc;
          }

          .input-field input:focus {
            outline: none;
            border-color: #f7b733;
            box-shadow: 0 0 5px rgba(247, 183, 51, 0.5);
          }

          .update-button {
            padding: 12px 25px;
            background-color: #fc4a1a;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            align-self: center;
          }

          .update-button:hover {
            background-color: #f7b733;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .success-message {
            margin-top: 20px;
            padding: 15px;
            background-color: rgba(72, 239, 128, 0.2);
            color: #28a745;
            border: 1px solid #28a745;
            border-radius: 8px;
            font-size: 1rem;
            text-align: center;
          }

          .orders-section,
          .activity-chart {
            margin-top: 20px;
            padding: 15px;
            background-color: #444;
            border-radius: 10px;
            text-align: center;
          }

          .orders-section h3,
          .activity-chart h3 {
            color: #fff;
          }

          .order-status {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
          }

          .order-category h4 {
            margin: 0;
            color: #black;
          }

          .order-category p {
            font-size: 1.5rem;
            color: #fff;
          }

          .activity-img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-top: 10px;
          }

          @media (max-width: 768px) {
            .profile-content {
              flex-direction: column;
              align-items: center;
              padding: 15px;
            }

            .left-section,
            .right-section {
              width: 100%;
              margin-bottom: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;
