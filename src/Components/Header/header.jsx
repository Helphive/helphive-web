import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { logout } from '../../Auth/AuthSlice'; 
import './Header.css';
import Icon from '../../assets/icon.png'; 

const Header = () => {
  const [scroll, setScroll] = useState(false);
  const navigate = useNavigate(); 
  const dispatch = useDispatch(); 

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to navigate to the previous page
  const goBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Logout function
  const handleLogout = () => {
    // Call the logout action
    dispatch(logout());
    // Navigate to the login page or home page after logout
    navigate('/login');
  };

  return (
   
    <header className={`header ${scroll ? 'header-scroll' : ''}`}>
      <div className="header-left">
        {/* Arrow icon for back navigation */}
        <div className="arrow-icon" onClick={goBack}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>

        {/* Logo Section */}
        <div className="logo-container">
          <img src={Icon} alt="logo" className='bee' />
          <span className="brand-name">HelpHive</span>
        </div>
      </div>

      <nav className="navbar">
        <ul className="nav-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/jobs">Jobs</a></li>
          <li><a href="/contact">Contact Us</a></li>
          {/* Logout Link */}
          <li>
            <span className="nav-link" onClick={handleLogout}>Logout</span>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
