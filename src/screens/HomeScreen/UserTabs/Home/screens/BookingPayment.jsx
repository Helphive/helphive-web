import './BookingPayment.css';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import {
  selectBookingId,
  selectClientSecret,
  selectBookingInfo,
} from "../../../../../Booking/bookSlice";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PropTypes from "prop-types";
import Header from "../../../Header/UserHead"; // Import Header component

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BookingPaymentForm = ({ userDetails }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const bookingId = useSelector(selectBookingId);
  const clientSecret = useSelector(selectClientSecret);
  const bookingInfo = useSelector(selectBookingInfo);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const amount = (bookingInfo && bookingInfo.rate && bookingInfo.hours)
    ? bookingInfo.rate * bookingInfo.hours
    : 0;

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userDetails?.name || "Anonymous",
            email: userDetails?.email || "",
          },
        },
      });

      if (error) {
        alert(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === "succeeded") {
        setSuccess(true);
        alert("Payment succeeded!");
        setTimeout(() => {
          navigate("/booking-info");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing the payment.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Animate the payment container
    gsap.fromTo(
      ".payment-container",
      { opacity: 0, y: -50 }, // Starting state
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" } // Ending state
    );
  
    // Animate the header
    gsap.fromTo(
      ".payment-container h3",
      { opacity: 0, scale: 0.9 }, // Starting state
      { opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: "elastic.out(1, 0.5)" } // Ending state
    );
  
    // Animate the payment details
    gsap.fromTo(
      ".payment-details",
      { opacity: 0, x: -50 }, // Starting state
      { opacity: 1, x: 0, duration: 1, stagger: 0.2, ease: "power3.out" } // Ending state
    );
  
    // Animate the form elements
    gsap.fromTo(
      ".card-element, .payment-button",
      { opacity: 0, y: 30 }, // Starting state
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)" } // Ending state
    );
  
    // Animate success message (if visible)
    gsap.fromTo(
      ".payment-success",
      { opacity: 0, scale: 0.8 }, // Starting state
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: "power3.out" } // Ending state
    );
  }, []);
  

  return (
    <div className='BookingPayemnt-screen'>
    <div className="payment-container">
      <h3>Payment Information</h3>
      <p className="payment-details">Booking ID: {bookingId}</p>
      <p className="payment-details">Amount: ${amount.toFixed(2)}</p>
      <form onSubmit={handlePayment}>
        <div className="card-element">
        <CardElement
  options={{
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d', // Text color
        letterSpacing: '0.025em', // Spacing between characters
        fontFamily: '"Roboto", sans-serif', // Font family
        backgroundColor: 'transparent', // Background color for the input
        padding: '30', // Padding inside the card element
        border: '1px solid #ccc', // Border color
        borderRadius: '14px', // Border radius for rounded corners
        ':focus': {
          borderColor: '#5e72e4', // Border color on focus
          // backgroundColor: 'rgba(255, 255, 255, 0.6)',
        },
        '::placeholder': {
          color: '#f1f1f1', 
        },
      },
    },
  }}
/>
        </div>
        <button type="submit" disabled={!stripe || loading} className="payment-button">
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
      {success && <div className="payment-success">Your payment is successful!</div>}
    </div>
    </div>
  );
};

BookingPaymentForm.propTypes = {
  userDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

const BookingPayment = (props) => (
  <div className='mainContainer'>
    <Header className="headerMain" />
    <Elements stripe={stripePromise}>
      <BookingPaymentForm {...props} />
    </Elements>
    
  </div>
);

export default BookingPayment;

