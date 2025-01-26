import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icon.png";
import "./Landing.css";
import gsap from "gsap";
import img1 from "../../assets/cleaner.png";
import Carousel from "../../Components/Crousal/Crousal "; 
//import slide1 from "../../assets/ani2.jpg"; 
import playStoreIcon from "../../assets/plays.png"; 
import iosStoreIcon from "../../assets/apple.png"; 
import sectionImage from "../../assets/don.png"; 
import whyChooseImg from "../../assets/why1.png"; 
import Footer from "../../Components/Footer/Footer"; 
import houseIcon from "../../assets/home.png"; 
import hotelIcon from "../../assets/hotel.png"; 

const LandingPage = () => {
  const navigate = useNavigate(); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const timeline = gsap.timeline();
    timeline
      .fromTo(
        ".main h1",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
      )
      .fromTo(
        ".main h2",
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, duration: 1, ease: "elastic.out(1, 0.5)" },
        "-=0.5"
      )
      .fromTo(
        ".main p",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.5)" },
        "-=0.5"
      )
      .fromTo(
        ".Navbar img",
        { opacity: 0, rotation: -45, scale: 0.8 },
        {
          opacity: 1,
          rotation: 0,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.5"
      );
    return () => timeline.kill();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const slides = [
    {
      image: "  https://leapscholar.com/blog/wp-content/uploads/2022/02/shutterstock_654521482-min-1024x576.jpg",
      caption: "Discover amazing services on HelpHive!",
    },
    {
      image: "https://5.imimg.com/data5/SELLER/Default/2023/12/368302418/OX/BI/ZV/203603353/housekeeping-service-500x500.jpg",
      caption: "Connect with trusted service providers.",
    },
    {
      image: "https://servicon.com/wp-content/uploads/2023/08/housekeeping-services-tm.jpg",
      caption: "Seamless collaboration, effortless solutions.",
    },
  ];

  return (
    <div className="landingScreen">
      <div className="hero">
        <nav className={`Navbar ${scrolled ? "scrolled" : ""}`}>
          <img src={logo} alt="logo" />
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Home
            </button>
            <button
              className="nav-btn"
              onClick={() => document.getElementById("footer-section").scrollIntoView({ behavior: "smooth" })}
            >
              About
            </button>
            <button
              className="nav-btn"
              onClick={() => document.getElementById("our-services-section").scrollIntoView({ behavior: "smooth" })}
            >
              Services
            </button>
            <button
              className="nav-btn"
              onClick={() => document.getElementById("why-choose-section").scrollIntoView({ behavior: "smooth" })}
            >
              Privacy Policy
            </button>
            <button
              className="nav-btn"
              onClick={() => document.getElementById("footer-section").scrollIntoView({ behavior: "smooth" })}
            >
              Contact
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="main">
            <h1>HELPHIVE</h1>
            <h2>Service Sphere</h2>
            <p>
              HelpHive is your trusted solution for seamless collaboration and efficient problem-solving. We provide a
              platform that empowers teams to communicate and tackle challenges together.
            </p>

            <div className="buttons-container">
              <button className="login-btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <div className="signup-dropdown">
                <button onClick={toggleDropdown} className="signup-btn">
                  Sign Up
                </button>
                {dropdownOpen && (
                  <div className="dropdown-options">
                    <button className="option-btn" onClick={() => navigate("/signup")}>
                      Sign up as User
                    </button>
                    <button className="option-btn" onClick={() => navigate("/provider-signup")}>
                      Sign up as Provider
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-number">232</span>
                <p>Trusted Customers</p>
              </div>
              <div className="stat-item">
                <span className="stat-number">1453</span>
                <p>Completed Orders</p>
              </div>
              <div className="stat-item">
                <span className="stat-number">32</span>
                <p>Service Providers</p>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src={img1} alt="Hero Image" />
          </div>
        </div>
      </div>

      <div className="styled-heading">
  <span className="line"></span>
  <h2>Our Main Services</h2>
  <span className="line"></span>
</div>

      <div className="services-row">
  {/* Service 1: Home Services */}
  <div className="service-card">
    <div className="service-card-icon">
      <img src={houseIcon} alt="Home Services Icon" />
    </div>
    <div className="service-card-text">
      <h3>Home Services</h3>
      <p>
        We have solutions to all your home problems. HelpHive provides quality
        home services without any hassle.
      </p>
      <div><a href="/login">Learn more</a></div>
    </div>
  </div>

  {/* Service 2: Hotel Management */}
  <div className="service-card">
    <div className="service-card-icon">
      <img src={hotelIcon} alt="Hotel Management Icon" />
    </div>
    <div className="service-card-text">
      <h3>Hotel Management</h3>
      <p>
        We provide efficient hotel management services with an emphasis on
        quality and Customer
      </p>
      <div><a href="/login">Learn more</a></div>
    </div>
  </div>
</div>

<div className="styled-heading">
  <span className="line"></span>
  <h2>Services</h2>
  <span className="line"></span>
</div>
      <div id="our-services-section" className="carousel-section">
        <Carousel slides={slides} />
      </div>
      <div className="styled-heading">
  <span className="line"></span>
  <h2>Get Service at Ease</h2>
  <span className="line"></span>
</div>
      <div className="download-section">
        <div className="download-container">
          <div className="download-image">
            <img src={sectionImage} alt="App Image" />
          </div>
          <div className="download-content">
            <h2>Download the App</h2>
            <p>
              Get the HelpHive app now and stay connected to all your services easily, whether you are a user or a provider.
            </p>

            <div className="download-buttons">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <button className="download-btn playstore-btn">
                  <img src={playStoreIcon} alt="Play Store" />
                  Download from Play Store
                </button>
              </a>
              <a href="https://apps.apple.com/us/app" target="_blank" rel="noopener noreferrer">
                <button className="download-btn ios-btn">
                  <img src={iosStoreIcon} alt="iOS Store" />
                  Download from iOS
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="styled-heading">
  <span className="line"></span>
  <h2>Why Helphive?</h2>
  <span className="line"></span>
</div>
      <div id="why-choose-section" className="why-choose-container">
        <div className="why-choose-content">
          <div className="why-choose-text">
            <h2>Why Choose HelpHive?</h2>
            <ul>
              <li>♦Seamless collaboration with trusted professionals</li>
              <li>♦Efficient project management tools for your team</li>
              <li>♦High-quality service providers across various domains</li>
              <li>♦Easy-to-use platform for quick and reliable solutions</li>
              <li>♦24/7 customer support to ensure smooth experience</li>
            </ul>
          </div>

          <div className="why-choose-image">
            <img src={whyChooseImg} alt="Why Choose HelpHive" />
          </div>
        </div>
      </div>
      

      <div id="footer-section">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
