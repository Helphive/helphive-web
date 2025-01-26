import React, { useEffect } from "react";
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider as StoreProvider } from "react-redux";
import store from "./store";
import { initializeOneSignal } from "./utils/OneSingleSetup";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import SignupScreen from "./screens/SignupScreen/SignupScreen";
import ProviderSignupScreen from "./screens/ProviderSingupScreen/ProviderSignupScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import ProviderDetailsScreen from "./screens/HomeScreen/ProviderDetails/ProviderDetailsScreen";
import AccountApprovalScreen from "./screens/HomeScreen/ProviderDetails/AccountApprovalScreen";
import AccountRejectedScreen from "./screens/HomeScreen/ProviderDetails/AccountRejectedScreen";
import AccountPendingScreen from "./screens/HomeScreen/ProviderDetails/AccountPendingScreen";
import ProviderHomeScreen from "./screens/HomeScreen/ProviderHomeScreen";
import UserHomeScreen from "./screens/HomeScreen/UserHomeScreen";
import BookingPayment from "./screens/HomeScreen/UserTabs/Home/screens/BookingPayment";
//import BookingPayment from './screens/HomeScreen/UserTabs/Bookings/screens/BookingPayment';
import withAuthCheck from "./hocs/withAuthCheck";
import LandingPage from "./screens/Landing/Landing";
import BookingDetails from "./screens/HomeScreen/UserTabs/Bookings/screens/BookingDetails";
import BookingInfo from "./screens/HomeScreen/UserTabs/Bookings/BookingInfo";
import UserInfo from "./screens/HomeScreen/UserTabs/Userinfo";
import history from "./screens/HomeScreen/UserTabs/Bookings/history";
import Active from "./screens/HomeScreen/UserTabs/Bookings/Active";
import getBookings from "./screens/HomeScreen/ProviderTabs/Orders/Order";
import AcceptOrd from "./screens/HomeScreen/ProviderTabs/Orders/Screens/AcceptOrders";
import userbook from "./screens/HomeScreen/UserTabs/Bookings/Bookings";
import myorders from "./screens/HomeScreen/ProviderTabs/Orders/Screens/MyOrders";
import orderDetails from "./screens/HomeScreen/ProviderTabs/Orders/Screens/MyOrderDetails";
import WebView from "./screens/HomeScreen/ProviderTabs/Balance/screens/WebViewScreen"
import EarningScreen from "./screens/HomeScreen/ProviderTabs/Balance/screens/EarningsScreen" 
//import AiChat from "./screens/AiChat/aiChat"
import AiChat from "./screens/AiChat/azureChat"

const App = () => {
  // // Initialize OneSignal for notifications
  // useEffect(() => {
  //     OneSignal.init({appId:'ed2df7dd-cdce-4640-b040-53656c312a40'});
  // });

  // const onHandleTag = (tag) =>{
  //     console.log("tagging");
  //     OneSignal.sendTag('tech',tag).then(()=>{
  //         console.log('Tagged');
  //     });
  // }

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  return (
    <StoreProvider store={store}>

      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/provider-signup" element={<ProviderSignupScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route
            path="/home"
            element={React.createElement(withAuthCheck(HomeScreen))}
          />
          <Route
            path="/provider-details"
            element={React.createElement(withAuthCheck(ProviderDetailsScreen))}
          />
          <Route
            path="/account-approval"
            element={React.createElement(withAuthCheck(AccountApprovalScreen))}
          />
          <Route
            path="/account-rejected"
            element={React.createElement(withAuthCheck(AccountRejectedScreen))}
          />
          <Route
            path="/account-pending"
            element={React.createElement(withAuthCheck(AccountPendingScreen))}
          />
          <Route
            path="/provider-home"
            element={React.createElement(withAuthCheck(ProviderHomeScreen))}
          />
          <Route
            path="/user-home"
            element={React.createElement(withAuthCheck(UserHomeScreen))}
          />
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/booking-payment"
            element={React.createElement(withAuthCheck(BookingPayment))}
          />
          <Route
            path="/booking-details/:bookingId"
            element={React.createElement(withAuthCheck(BookingDetails))}
          />
          <Route
            path="/booking-info"
            element={React.createElement(withAuthCheck(BookingInfo))}
          />
          <Route
            path="/User-info"
            element={React.createElement(withAuthCheck(UserInfo))}
          />
          <Route
            path="/bookings/schedule"
            element={React.createElement(withAuthCheck(BookingInfo))}
          />
          <Route
            path="/bookings/history"
            element={React.createElement(withAuthCheck(history))}
          />
          <Route
            path="/bookings/active"
            element={React.createElement(withAuthCheck(Active))}
          />
          <Route
            path="/get-bookings"
            element={React.createElement(withAuthCheck(getBookings))}
          />
          <Route
            path="/accept-order/:bookingId"
            element={React.createElement(withAuthCheck(AcceptOrd))}
          />
          <Route
            path="/user-bookings"
            element={React.createElement(withAuthCheck(userbook))}
          />
          <Route
            path="/my-orders"
            element={React.createElement(withAuthCheck(myorders))}
          />
          <Route
            path="/my-order-details/:bookingId"
            element={React.createElement(withAuthCheck(orderDetails))}
          />
          <Route
            path="/WebView"
            element={React.createElement(withAuthCheck(WebView))}
          />
          <Route
            path="/earnings"
            element={React.createElement(withAuthCheck(EarningScreen))}
          />
          <Route
            path="/ai-chat"
            element={React.createElement(withAuthCheck(AiChat))}
          />


        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
