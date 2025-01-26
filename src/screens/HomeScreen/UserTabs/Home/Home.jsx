import { useState, useEffect } from "react";
import cleaner from "../../../../assets/cleaner.png";
import publicArea from "../../../../assets/publicArea.jpg";

import { gsap } from "gsap";
import {
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import {
  setBookingInfo,
  setBookingId,
  setClientSecret,
  setPaymentIntentId,
} from "../../../../Booking/bookSlice";
import { useCreateBookingMutation } from "../../../../User/userApiSlice";
import { useNavigate } from "react-router-dom";
import Step1Content from "./components/step1";
import Step2Content from "./components/step2";
import "./Home.css";

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [rate, setRate] = useState("20");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [createBookingSuccess, setCreateBookingSuccess] = useState(null);
  const [createBookingError, setCreateBookingError] = useState(null);

  const dispatch = useDispatch();

  // State to store image imports
  const [publicAreaAttendantImage, setPublicAreaAttendantImage] =
    useState(null);
  const [roomAttendantImage, setRoomAttendantImage] = useState(null);
  const [linenPorterImage, setLinenPorterImage] = useState(null);

  useEffect(() => {
    import(
      "../../../../../assets/icons/user-tabs/home/public-area-attendant.jpeg"
    ).then((module) => setPublicAreaAttendantImage(module.default));
    import(
      "../../../../../assets/icons/user-tabs/home/room-attendant.jpeg"
    ).then((module) => setRoomAttendantImage(module.default));
    import("../../../../../assets/icons/user-tabs/home/linen-porter.jpg").then(
      (module) => setLinenPorterImage(module.default)
    );
  }, []);
  useEffect(() => {
    const delayTime = 2;

    gsap.fromTo(
      "h1",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, delay: delayTime, ease: "power3.out" }
    );

    gsap.fromTo(
      "#heroP",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: delayTime + 0.5,
        ease: "power3.out",
      }
    );

    gsap.fromTo(
      "button",
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: delayTime + 1,
        ease: "bounce.out",
      }
    );

    gsap.fromTo(
      ".cleaner",
      { opacity: 0, scale: 1.2 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: delayTime + 0.5,
        ease: "power3.out",
      }
    );
  }, []);

  const services = [
    {
      id: 1,
      name: "Public Area Attendant",
      image: publicArea,
      description:
        "Ensure the highest standards of cleanliness and order in public areas.",
      averageRate: "$45/hour",
    },
    {
      id: 2,
      name: "Room Attendant",
      image: roomAttendantImage,
      description:
        "Maintain guest rooms to the highest standards of cleanliness and comfort.",
      averageRate: "$35/hour",
    },
    {
      id: 3,
      name: "Linen Porter",
      image: linenPorterImage,
      description:
        "Efficiently manage and distribute linens to ensure smooth operations.",
      averageRate: "$60/hour",
    },
  ];

  const isRateValid = (rate) => {
    const rateNumber = parseFloat(rate);
    return (
      !isNaN(rateNumber) &&
      rateNumber >= 20 &&
      rateNumber <= 200 &&
      rateNumber % 1 === 0
    );
  };

  const handleNext = () => {
    if (currentStep < 2 && selectedService !== null && isRateValid(rate)) {
      setCurrentStep(currentStep + 1);
    } else {
      setSnackbarMessage(
        "Please select a service and ensure the rate is between $20 and $200."
      );
      setSnackbarVisible(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const handleBooking = async () => {
    const bookingInfo = {
      service: selectedService,
      rate: Number(rate),
      hours: Number(hours),
      startDate,
      startTime,
      address: address.trim(),
      latitude,
      longitude,
    };

    try {
      const { bookingId, paymentIntentId, clientSecret } = await createBooking(
        bookingInfo
      ).unwrap();

      dispatch(
        setBookingInfo({
          ...bookingInfo,
          startDate: startDate?.toISOString(),
          startTime: startTime?.toISOString(),
        })
      );
      dispatch(setBookingId(bookingId));
      dispatch(setPaymentIntentId(paymentIntentId));
      dispatch(setClientSecret(clientSecret));

      setCreateBookingSuccess(
        "Booking successfully created. Go to Payment screen to make the booking available for service providers to accept."
      );
    } catch (error) {
      console.error("Error while creating a booking:", error);

      if (error?.originalStatus === 403 && error?.data === "Forbidden") {
        setCreateBookingError(
          "Access Forbidden: You do not have permission to create a booking."
        );
      } else if (error?.status === "FETCH_ERROR") {
        setCreateBookingError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error?.status === 400) {
        setStartDate(null);
        setStartTime(null);
        setCreateBookingError(
          error?.data?.message ||
            "The selected start date & time has passed. Please try again."
        );
      } else {
        setCreateBookingError(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const hideDialog = () => setCreateBookingError(null);
  const hideSuccessDialog = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setRate("20");
    setStartDate(null);
    setStartTime(null);
    setHours(1);
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    setCreateBookingSuccess(null);
    navigate("/booking-payment");
  };

  return (
    <div className="userHome">
      <div className="userHero">
        <div>
          <h1>
            Top-Notch Service <br /> No Tricks <br /> Just Flicks!
          </h1>
          <p id="heroP">
            Welcome to HelpHive, your one-stop platform for reliable and instant
            services. Manage bookings, chat with professionals, and get tailored
            support right at your fingertips.
          </p>
        </div>
        <img src={cleaner} alt="" className="cleaner" />
      </div>
      <div>
        {currentStep === 1 && (
          <Step1Content
            onNext={handleNext}
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            rate={rate}
            setRate={setRate}
            disableNext={selectedService === null || !isRateValid(rate)}
          />
        )}
        {currentStep === 2 && (
          <Step2Content
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            selectedService={selectedService}
            rate={rate}
            hours={hours}
            setHours={setHours}
            address={address}
            setAddress={setAddress}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            setDateError={setDateError}
            setAddressError={setAddressError}
            handleBooking={handleBooking}
            isLoading={isLoading}
          />
        )}
      </div>
           <div className="mc-step-buttons">
            <Button
              onClick={() => setCurrentStep(1)}
              variant={currentStep === 1 ? "contained" : "outlined"}
              className={`mc-step-button ${currentStep === 1 ? "mc-active-button" : ""}`}
            >
             Step  {currentStep > 1 ? "✔" : "01"} 
            </Button>
            <Button
              onClick={() => {
                if (selectedService !== null && isRateValid(rate)) {
                  setCurrentStep(2);
                } else {
                  setSnackbarMessage("Please enter valid details.");
                  setSnackbarVisible(true);
                }
              }}
              variant={currentStep === 2 ? "contained" : "outlined"}
              className={`mc-step-button ${currentStep === 2 ? "mc-active-button" : ""}`}
            >
              Next
            </Button>
          </div>
             <Snackbar
        open={snackbarVisible}
        onClose={() => setSnackbarVisible(false)}
        message={snackbarMessage}
        autoHideDuration={3000}
      />
      
       <Dialog open={createBookingSuccess !== null} onClose={hideSuccessDialog}>
         <DialogTitle>Booking Created</DialogTitle>
         <DialogContent>
           <p>{createBookingSuccess}</p>
         </DialogContent>
         <DialogActions>
           <Button onClick={hideSuccessDialog} color="primary" variant="contained">
             Go to Payment
           </Button>
         </DialogActions>
       </Dialog>

       <Dialog open={createBookingError !== null} onClose={hideDialog}>
         <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <p>{createBookingError}</p>
       </DialogContent>
       <DialogActions>
          <Button onClick={hideDialog} color="primary" variant="contained">
           Close
         </Button>
       </DialogActions>
     </Dialog>
    </div>

    // <div className="mc-container">
    //     <div className="mc-step-content">
    //       {currentStep === 1 && (
    //         <Step1Content
    //           onNext={handleNext}
    //           services={services}
    //           selectedService={selectedService}
    //           setSelectedService={setSelectedService}
    //           rate={rate}
    //           setRate={setRate}
    //           disableNext={selectedService === null || !isRateValid(rate)}
    //         />
    //       )}
    //       {currentStep === 2 && (
    //         <Step2Content
    //           startDate={startDate}
    //           setStartDate={setStartDate}
    //           startTime={startTime}
    //           setStartTime={setStartTime}
    //           selectedService={selectedService}
    //           rate={rate}
    //           hours={hours}
    //           setHours={setHours}
    //           address={address}
    //           setAddress={setAddress}
    //           latitude={latitude}
    //           setLatitude={setLatitude}
    //           longitude={longitude}
    //           setLongitude={setLongitude}
    //           setDateError={setDateError}
    //           setAddressError={setAddressError}
    //           handleBooking={handleBooking}
    //           isLoading={isLoading}
    //         />
    //       )}

    //       {/* Step Buttons within mc-step-content */}
    //       <div className="mc-step-buttons">
    //         <Button
    //           onClick={() => setCurrentStep(1)}
    //           variant={currentStep === 1 ? "contained" : "outlined"}
    //           className={`mc-step-button ${currentStep === 1 ? "mc-active-button" : ""}`}
    //         >
    //           {currentStep > 1 ? "✔" : "01"} Step 1
    //         </Button>
    //         <Button
    //           onClick={() => {
    //             if (selectedService !== null && isRateValid(rate)) {
    //               setCurrentStep(2);
    //             } else {
    //               setSnackbarMessage("Please enter valid details.");
    //               setSnackbarVisible(true);
    //             }
    //           }}
    //           variant={currentStep === 2 ? "contained" : "outlined"}
    //           className={`mc-step-button ${currentStep === 2 ? "mc-active-button" : ""}`}
    //         >
    //           02 Step 2
    //         </Button>
    //       </div>
    //   </div>
    //   <Snackbar
    //     open={snackbarVisible}
    //     onClose={() => setSnackbarVisible(false)}
    //     message={snackbarMessage}
    //     autoHideDuration={3000}
    //   />

    //   <Dialog open={createBookingSuccess !== null} onClose={hideSuccessDialog}>
    //     <DialogTitle>Booking Created</DialogTitle>
    //     <DialogContent>
    //       <p>{createBookingSuccess}</p>
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={hideSuccessDialog} color="primary" variant="contained">
    //         Go to Payment
    //       </Button>
    //     </DialogActions>
    //   </Dialog>

    //   <Dialog open={createBookingError !== null} onClose={hideDialog}>
    //     <DialogTitle>Error</DialogTitle>
    //     <DialogContent>
    //       <p>{createBookingError}</p>
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={hideDialog} color="primary" variant="contained">
    //         Close
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    // </div>
  );
};

//     <div className="container">
//       <div className="main-content">
//         <div className="step-buttons" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
//           <Button
//             onClick={() => setCurrentStep(1)}
//             variant={currentStep === 1 ? "contained" : "outlined"}
//             sx={{
//               backgroundColor: currentStep === 1 ? "orange" : "transparent",
//               color: currentStep === 1 ? "white" : "orange",
//               borderColor: "orange",
//               "&:hover": {
//                 backgroundColor: "orange",
//                 color: "white",
//               },
//               marginRight: "20px",
//             }}
//           >
//             {currentStep > 1 ? "✔" : "01"} Step 1
//           </Button>
//           <Button
//             onClick={() => {
//               if (selectedService !== null && isRateValid(rate)) {
//                 setCurrentStep(2);
//               } else {
//                 setSnackbarMessage("Please enter valid details.");
//                 setSnackbarVisible(true);
//               }
//             }}
//             variant={currentStep === 2 ? "contained" : "outlined"}
//             sx={{
//               backgroundColor: currentStep === 2 ? "orange" : "transparent",
//               color: currentStep === 2 ? "white" : "orange",
//               borderColor: "orange",
//               "&:hover": {
//                 backgroundColor: "orange",
//                 color: "white",
//               },
//             }}
//           >
//             02 Step 2
//           </Button>
//         </div>

//         <div style={{ flex: 1, padding: "1rem" }}>
//           {currentStep === 1 && (
//             <Step1Content
//               onNext={handleNext}
//               services={services}
//               selectedService={selectedService}
//               setSelectedService={setSelectedService}
//               rate={rate}
//               setRate={setRate}
//               disableNext={selectedService === null || !isRateValid(rate)}
//             />
//           )}
//           {currentStep === 2 && (
//             <Step2Content
//               onPrevious={handlePrevious}
//               setSnackbarVisible={setSnackbarVisible}
//               setSnackbarMessage={setSnackbarMessage}
//               startDate={startDate}
//               setStartDate={setStartDate}
//               startTime={startTime}
//               setStartTime={setStartTime}
//               selectedService={selectedService}
//               rate={rate}
//               hours={hours}
//               setHours={setHours}
//               address={address}
//               setAddress={setAddress}
//               latitude={latitude}
//               setLatitude={setLatitude}
//               longitude={longitude}
//               setLongitude={setLongitude}
//               setDateError={setDateError}
//               setAddressError={setAddressError}
//               handleBooking={handleBooking}
//               isLoading={isLoading}
//             />
//           )}
//         </div>

//         <Snackbar
//           open={snackbarVisible}
//           onClose={() => setSnackbarVisible(false)}
//           message={snackbarMessage}
//           autoHideDuration={3000}
//         />

//         <Dialog open={createBookingSuccess !== null} onClose={hideSuccessDialog}>
//           <DialogTitle>Booking Created</DialogTitle>
//           <DialogContent>
//             <p>{createBookingSuccess}</p>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={hideSuccessDialog} color="primary" variant="contained">
//               Go to Payment
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={createBookingError !== null} onClose={hideDialog}>
//           <DialogTitle>Error</DialogTitle>
//           <DialogContent>
//             <p>{createBookingError}</p>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={hideDialog} color="primary" variant="contained">
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

export default Home;
