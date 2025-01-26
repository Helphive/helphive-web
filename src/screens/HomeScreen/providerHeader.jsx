// src/components/ProviderHeader.js

import React, { useState, useEffect } from "react";
import "./providerHeader.css"; // Separate CSS file for header styling
import Icon from "../../../assets/icon.png";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ProviderHeader = ({ activeTab, setActiveTab, tabs }) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Navigate to the previous route
  };
  const handleLogOut=()=>{
    navigate("/login");
  }

  return (
    <header className="pro-header">
      <div className="pro-header-left">
        {/* <div className="pro-arrow-icon" onClick={goBack}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg> 
        </div> */}
        {/* Logo Section */}
        <div className="pro-logo-container">
          <img src={Icon} alt="logo" className="pro-bee" />
          <span className="pro-brand-name">HelpHive</span>
          {/* <span className="pro-band-sub">Provider</span> */}
        </div>
      </div>
      {/* <div className="pro-logo">Helphive</div> */}
      <nav className="pro-nav">
        {tabs.map((tab) => (
          <div key={tab} className="pro-tab" onClick={() => setActiveTab(tab)}>
            <span className={activeTab === tab ? "active-label" : "pro-label"}>
              {tab}
            </span>
          </div>
        ))}
        <span className="log" onClick={handleLogOut}>Log Out</span>
      </nav>
    </header>
  );
};

export default ProviderHeader;
