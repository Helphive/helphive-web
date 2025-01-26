import React, { useEffect, useState } from "react";
import axios from "axios";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";
import dayjs from "dayjs";
import { gsap } from "gsap";
import SelectLocationModal from "./select-location";
// import Typography from "@mui/material/Typography";
import "./step2.css";

const Step2Content = ({
  onPrevious,
  setSnackbarVisible,
  setSnackbarMessage,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  selectedService,
  rate,
  hours,
  setHours,
  address,
  setAddress,
  dateError,
  setDateError,
  addressError,
  setAddressError,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  handleBooking,
  isBookingLoading,
}) => {
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 31.5497,
    longitude: 74.3436,
  });
  const [isLocationModalVisible, setLocationModalVisibility] = useState(false);
  const[visibility,setVisibility]=useState(false);
  const fetchAddressFromLatLng = async (latitude, longitude) => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results.length > 0) {
        setAddress(response.data.results[0].formatted_address);
        setVisibility(true);
      } else {
        setLatitude(null);
        setLongitude(null);
        setAddress("");
        setSnackbarMessage("No address found for this location.");
        setSnackbarVisible(true);
      }
    } catch (error) {
      setLatitude(null);
      setLongitude(null);
      setAddress("");
      setSnackbarMessage("Failed to fetch address. Please try again.");
      setSnackbarVisible(true);
    }
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setCurrentRegion({ latitude, longitude });
    } else {
      navigator.geolocation.getCurrentPosition((location) => {
        setCurrentRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      });
    }
  }, [latitude, longitude]);
  useEffect(() => {
    // Animation for the container
    gsap.fromTo(
      ".s2-container",
      { opacity: 0, y: -50 }, // Starting state
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" } // Ending state
    );
  
    // Staggered animation for rows
    gsap.fromTo(
      ".s2-inputRow",
      { opacity: 0, x: -50 }, // Starting state
      { opacity: 1, x: 0, duration: 1, stagger: 0.2, ease: "power3.out" } // Ending state
    );
  
    // Animation for the header
    gsap.fromTo(
      ".s2-header",
      { opacity: 0, scale: 0.9 }, // Starting state
      { opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: "elastic.out(1, 0.5)" } // Ending state
    );
  
    // Animation for labels
    gsap.fromTo(
      ".s2-label",
      { opacity: 0, y: 20 }, // Starting state
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" } // Ending state
    );
  
    // Animation for buttons
    gsap.fromTo(
      ".s2-button",
      { opacity: 0, y: 30 }, // Starting state
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.4, ease: "back.out(1.7)" } // Ending state
    );
  
    // Add hover effects for buttons
    gsap.utils.toArray(".s2-button").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, { scale: 1.1, duration: 0.2 });
      });
      button.addEventListener("mouseleave", () => {
        gsap.to(button, { scale: 1, duration: 0.2 });
      });
    });
  }, []);
  

  const handleConfirmStartDateTime = (date) => {
    const minAllowedTime = dayjs().add(3, "hour"); // Minimum 3 hours after current time

    if (date.isBefore(minAllowedTime)) {
      setDateError(
        "Starting time must be at least 3 hours later than the current time."
      );
      setStartDate(null);
      setStartTime(null);
    } else {
      setStartDate(date);
      setStartTime(date);
      setDateError(null);
    }
  };

  const handleBook = () => {
    let valid = true;

    if (!startDate || !startTime) {
      setDateError("Please select a valid start date and time.");
      valid = false;
    } else {
      setDateError(null);
    }

    if (!address) {
      setLatitude(null);
      setLongitude(null);
      setAddressError("Please enter a valid address.");
      valid = false;
    } else {
      setAddressError(null);
    }

    if (latitude === null || longitude === null) {
      setSnackbarMessage("Please select a valid location.");
      setSnackbarVisible(true);
      valid = false;
    }

    if (valid) {
      const bookingData = {
        startDate,
        startTime,
        selectedService,
        rate,
        hours,
        address,
        latitude,
        longitude,
        totalCharges: rate * hours,
      };
      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
      handleBooking();
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((location) => {
      const { latitude, longitude } = location.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      fetchAddressFromLatLng(latitude, longitude);
    });
  };

  const minDateTime = dayjs().add(3, "hour"); // Restrict minimum selectable time

  return (
    <div className="s2-container">
      <h3 className="s2-header">Enter Booking Info</h3>
      <div className="s2-inputRow">
        <label className="s2-label">Start Date & Time:</label>
        {/* <div
          onClick={() => setStartDatePickerVisibility(true)}
          className="s2-picker"
        >
          <span>📅</span>
          <span>
            {startDate
              ? startDate.format("YYYY-MM-DD HH:mm")
              : "Select Start Date & Time"}
          </span>
        </div> */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Select Start Date & Time"
            value={startDate || minDateTime}
            onChange={handleConfirmStartDateTime}
            minDateTime={minDateTime}
            renderInput={(props) => <TextField {...props} />}
          />
        </LocalizationProvider>
      <p className="para">
      ⓘ Starting time must be 3 hours later than the current time
          </p>
        {dateError && <div className="s2-errorMessage">{dateError}</div>}
      </div>

      <div className="s2-inputRow">
        <label className="s2-label">Hours Needed:</label>
        <input
          type="number"
          className="styled-number-input"
          placeholder="Enter hours"
          value={hours.toString()}
          onChange={(e) => setHours(Number(e.target.value))}
        />
        <div className="s2-totalCharges">
        <p> Total Charges: ${(rate * hours).toFixed(2)}</p> 
        </div>
      </div>

      <div className="s2-inputRow">
        <label className="s2-label" >Booking Address</label>
        <input
          type="text"
          className={`s2-inputField ${visibility?"":"hidden"}`}
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          readOnly
        
        />
        {addressError && <div className="s2-errorMessage">{addressError}</div>}
      </div>

      <div className="s2-buttonContainer">
        <button
          className="s2-button"
          onClick={() => setLocationModalVisibility(true)}
        >
          Choose on Map
        </button>
        <button className="s2-button" onClick={useCurrentLocation}>
          Use Current Location
        </button>
      </div>

      <SelectLocationModal
        visible={isLocationModalVisible}
        onClose={() => setLocationModalVisibility(false)}
        onSelectLocation={({ latitude, longitude }) => {
          setLatitude(latitude);
          setLongitude(longitude);
          fetchAddressFromLatLng(latitude, longitude);
          setLocationModalVisibility(false);
        }}
      />

      {/* <div className="buttonContainer"> */}

      <button
        className="s2-button bookButton"
        onClick={handleBook}
        disabled={isBookingLoading}
      >
        {isBookingLoading ?"Wait...":"Book Now"}
      </button>
    </div>
  );
};

export default Step2Content;
