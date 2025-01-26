import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar, Button, Tabs, Tab, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useGetUserBookingsQuery } from "../../../../User/userApiSlice";
import { selectBookingList } from "../../../../Booking/bookingsListSlice";
import BookingCard from "../Bookings/components/BookingCard";
import withAuthCheck from "../../../../hocs/withAuthCheck";

import Header from "../../Header/UserHead";
import "./Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const tabs = ["history", "active", "scheduled"];
  const { error, refetch, isFetching } = useGetUserBookingsQuery();
  const bookingsList = useSelector(selectBookingList);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleTabChange = (event, newTab) => {
    setActiveTab(newTab);
    refetch();
  };

  const handleRetry = () => {
    navigate("/login");
  };

  return (
    <div className="bu-bookingPage">
      <Header />

      <div className="bu-tabsContainer">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="white"
          centered
        >
          {tabs.map((tab) => (
            <Tab
              key={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              value={tab}
            />
          ))}
        </Tabs>
      </div>

      <div className="bu-bookingsContent">
        <div className="loaderDiv">{isFetching && <CircularProgress />}</div>

        {tabs.map((tab) => (
          <div key={tab} hidden={activeTab !== tab}>
            <BookingCard
              tab={tab}
              bookingsList={
                bookingsList && bookingsList[tab] ? bookingsList[tab] : []
              }
              refreshing={isFetching}
            />
          </div>
        ))}
      </div>
      <Snackbar
        open={snackbarVisible}
        onClose={() => setSnackbarVisible(false)}
        message="Failed to load bookings. As you are logged out. Please login again."
        action={
          <Button className="bu-btn" onClick={handleRetry}>
            Login
          </Button>
        }
        className="bu-snackbarMessage"
      />
    </div>
  );
};

export default withAuthCheck(Bookings);
