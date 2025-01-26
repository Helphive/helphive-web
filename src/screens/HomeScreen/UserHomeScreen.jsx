import React from "react";
import "./UserHomeScreen.css";
import Home from "./UserTabs/Home/Home";
import Bookings from "./UserTabs/Bookings/Bookings";
import Chat from "./UserTabs/Chat";
import Profile from "./UserTabs/Profile";
import bookingInfo from "../HomeScreen/UserTabs/Bookings/BookingInfo";
import Header from "../HomeScreen/Header/UserHead";
import Footer from "../HomeScreen/Header/footer";

const UserHomeScreen = () => {
  return (
    <div className="UserHomeScreen">
      <Header />
      <Home />
      {/* <Footer/> */}
    </div>
  );
};

export default UserHomeScreen;
