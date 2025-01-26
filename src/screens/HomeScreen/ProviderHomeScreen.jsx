

import React, { useState } from "react";
import ProviderHeader from "./providerHeader"; 
import Home from "./ProviderTabs/Home/Home";
import Orders from "./ProviderTabs/Orders/Order";
import Balance from "./ProviderTabs/Balance/Balance";
import Chat from "./ProviderTabs/Chat";

import "./ProviderHomeScreen.css";

const ProviderHomeScreen = ({ userDetails }) => {
  const [activeTab, setActiveTab] = useState("Home");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return <Home userDetails={userDetails} />;
      case "Orders":
        return <Orders />;
      case "Balance":
        return <Balance />;
      case "Assistant":
        return <Chat />;
      default:
        return null;
    }
  };

  const tabs = ["Home", "Orders", "Balance", "Assistant"];

  return (
    <div className="provider-home-screen">
      <ProviderHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />
      <main className="pro-main-content">{renderTabContent()}</main>
     
    </div>
  );
};

export default ProviderHomeScreen;
