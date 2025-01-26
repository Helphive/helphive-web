// UserDetails.js
import React, { useState, useEffect, useCallback } from "react";
import { Toast } from "react-bootstrap";
import { getGcloudBucketHelphiveUsersUrl } from "../../../../utils/gcloud-strings";
import { useUpdateProviderAvailabilityMutation } from "../../../../providers/providerApiSlice";
import verifiedIcon from "../../../../../assets/icons/verified.png";
import startIcon from "../../../../../assets/icons/star.png";
import profileWhite from "../../../../../assets/icons/profile-icon-white.png";
import "./UserDetails.css";

const UserDetails = ({ userDetails }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [updateProviderAvailability] = useUpdateProviderAvailabilityMutation();

  const email = userDetails?.email || "";
  const truncatedEmail = email.length > 25 ? `${email.substring(0, 27)}...` : email;
  const profile = userDetails?.profile ? getGcloudBucketHelphiveUsersUrl(userDetails.profile) : profileWhite;

  const fetchLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => alert("Permission to access location was denied.")
      );
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    const sendAvailability = async () => {
      try {
        await updateProviderAvailability({
          isProviderAvailable: isAvailable,
          currentLocation: { latitude, longitude },
        }).unwrap();
      } catch (error) {
        setShowSnackbar(true);
      }
    };

    sendAvailability();
  }, [isAvailable, latitude, longitude, updateProviderAvailability]);

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-details-box">
      <div className="user-info">
        <img src={profile || verifiedIcon} alt="profile" className="profile-img" />
        <h3>{userDetails.firstName} {userDetails.lastName}</h3>
        <p>{truncatedEmail}</p>
      </div>
      <div className="user-rating">
        <img src={startIcon} alt="rating" className="star-icon" />
        <span>{userDetails.rating ? userDetails.rating.toFixed(1) : "4.0"}</span>
      </div>
      <div className="availability-section">
        <p>Availability: {isAvailable ? "Available" : "Unavailable"}</p>
        <label className="switch">
          <input type="checkbox" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)} />
          <span className="slider"></span>
        </label>
      </div>

      {showSnackbar && (
        <Toast
          onClose={() => setShowSnackbar(false)}
          show={showSnackbar}
          delay={3000}
          autohide
        >
          <Toast.Body>Error updating availability. Please try again.</Toast.Body>
        </Toast>
      )}
    </div>
  );
};

export default UserDetails;
