import React, { useState, useEffect, useCallback } from "react";
import "./Home.css";
import Map from "./Components/Map";
import { Modal } from "react-bootstrap";
import { getGcloudBucketHelphiveUsersUrl } from "../../../../utils/gcloud-strings";
import providerScreenImage from "../../../../assets/providerScreen.jpeg";

import vector1 from "../../../../../assets/cloud vectors/vector-1.png";
import vector2 from "../../../../../assets/cloud vectors/vector-2.png";
import logo from "../../../../../assets/Logo/logo-light.png";
import profileWhite from "../../../../../assets/icons/profile-icon-white.png";
import notificationWhite from "../../../../../assets/icons/notification-white.png";
import verifiedIcon from "../../../../../assets/icons/verified.png";
import startIcon from "../../../../../assets/icons/star.png";

// Hardcode the images for each job type
import publicAreaAttendantImage from "../../../../../assets/icons/user-tabs/home/public-area-attendant.jpeg";
import roomAttendantImage from "../../../../../assets/icons/user-tabs/home/room-attendant.jpeg";
import linenPorterImage from "../../../../../assets/icons/user-tabs/home/linen-porter.jpg";

const Home = ({ userDetails }) => {
  // Initialize jobTypes state, checking if userDetails and jobTypes are defined
  const [jobTypes, setJobTypes] = useState(userDetails?.jobTypes || {});
  const [isAvailable, setIsAvailable] = useState(false);
  const [online, setOnline] = useState("Online");

  const handleOnline = () => {
    setOnline((prev) => {
      return prev === "Online" ? "Offline" : "Online";
    });
    if (online == "Online") {
      alert("You are Online Now");
    } else {
      alert("You are Offline Now");
    }
  };

  // Declare state for latitude and longitude
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // State for showing the error modal
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Check if email and profile are available
  const email = userDetails?.email || "";
  const truncatedEmail =
    email.length > 25 ? `${email.substring(0, 27)}...` : email;
  const profile = userDetails?.profile
    ? `${getGcloudBucketHelphiveUsersUrl(userDetails.profile)}`
    : "";

  // Toggle the job type selection
  const toggleJobType = (serviceName) => {
    setJobTypes((prevJobTypes) => ({
      ...prevJobTypes,
      [serviceName]: !prevJobTypes[serviceName],
    }));
  };

  // Fetch user location if geolocation is available
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

  // Check for undefined userDetails early and display loading if necessary
  if (!userDetails) {
    return <div>Loading...</div>; // or any loading indicator
  }

  return (
    <div className="home">
      <div className="landing">
        <div>
          <h1>
            <span>HelpHive Partners</span>
            <span>Elevate Your Cleaning Business</span>
          </h1>
          <p>
            Join HelpHive and take your cleaning services to the next level.We
            connect skilled providers with clients who value quality and
            reliability.
          </p>
        </div>
        <div className="map-container">
          <Map />
        </div>
      </div>
      {/* <div className="banner">
        <img src={vector1} alt="vector1" className="vector vector1" />
        <img src={vector2} alt="vector2" className="vector vector2" />
      </div> */}

      <div className="content">
        <div className="provider-info">
          <div className="user-card">
            <div className="user-info">
              <div className="user-profile">
                {profile && (
                  <img
                    src={verifiedIcon}
                    alt="verified"
                    className="verified-icon"
                  />
                )}
                <img
                  src={profile || verifiedIcon}
                  alt="profile"
                  className="profile-img"
                />
              </div>

              <div className="user-details">
                <h3>
                  {userDetails.firstName} {userDetails.lastName}
                </h3>
                <p>{truncatedEmail}</p>
              </div>
            </div>

            <div className="user-rating">
              <img src={startIcon} alt="rating" className="star-icon" />
              <span>
                {userDetails.rating ? userDetails.rating.toFixed(1) : "4.0"}
              </span>
            </div>
          </div>

          <div className="job-types-section">
            <div className="jobButtonDiv">
              <p className="job-title">What job(s) are you taking?</p>
              <button onClick={handleOnline}>{online.toUpperCase()}</button>
            </div>

            <div className="job-types">
              {/* Job types with hardcoded images */}
              <div
                className={`job-type ${
                  jobTypes["PublicAreaAttendant"] ? "active" : ""
                }`}
                onClick={() => toggleJobType("PublicAreaAttendant")}
              >
                <img
                  src={publicAreaAttendantImage}
                  alt="Public Area Attendant"
                  className="service-icon"
                />
                <p>Public Area Attendant</p>
              </div>
              <div
                className={`job-type ${
                  jobTypes["RoomAttendant"] ? "active" : ""
                }`}
                onClick={() => toggleJobType("RoomAttendant")}
              >
                <img
                  src={roomAttendantImage}
                  alt="Room Attendant"
                  className="service-icon"
                />
                <p>Room Attendant</p>
              </div>
              <div
                className={`job-type ${
                  jobTypes["LinenPorter"] ? "active" : ""
                }`}
                onClick={() => toggleJobType("LinenPorter")}
              >
                <img
                  src={linenPorterImage}
                  alt="Linen Porter"
                  className="service-icon"
                />
                <p>Linen Porter</p>
              </div>
            </div>
          </div>
        </div>

    
      </div>

      {/* Error Modal */}
      <Modal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Error updating availability. Please try again.</p>
        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary" onClick={() => setShowErrorModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>

    // <div className="home">

    // </div>
  );
};

export default Home;
