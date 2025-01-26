import React from "react";
import "./Footer.css"; // You can add your styles here
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import logo from "../../assets/icon.png"; // Logo path (update as needed)

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Column: Logo and About Us */}
        <div className="footer-left">
          <img src={logo} alt="HelpHive Logo" className="footer-logo" />
          <p className="footer-about">
            HelpHive is your trusted platform for seamless collaboration and service
            provider connections. Whether you are looking to hire a service provider or
            become one, we offer a reliable platform for smooth interaction and service fulfillment.
          </p>
        </div>

        {/* Middle Column: Quick Links */}
       

        {/* Right Column: Contact Information */}
        <div className="footer-contact">
          
          <ul className="footer-contact-list">
            <li><strong>Contact Us</strong></li>
            <li><strong>Phone:</strong> (123) 456-7890</li>
            <li><strong>Email:</strong> contact@helphive.com</li>
            <li><strong>Address:</strong> 123 Service Road, City, Country</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: Social Media and Copyright */}
      <div className="footer-bottom">
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={24} />
          </a>
        </div>

        <div className="footer-copyright">
          <p>&copy; 2025 HelpHive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
