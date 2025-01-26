import { useState, useEffect,useRef } from "react";
import { Link, useNavigate,useLocation} from "react-router-dom";
import { useLogoutMutation } from "../../../Auth/authApiSlice";
import { gsap } from "gsap";
// import Icon from "../../../assets/icon.png";
import logo from "../../../assets/icon.png";
import "./UserHead.css";
// import bookings from '../UserTabs/Bookings/Bookings'
const Header = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef();
  const logoRef = useRef();
  const navRef = useRef();

  useEffect(() => {
    if (location.pathname === "/user-home") {
      setActiveTab("home");
    } else if (location.pathname === "/user-bookings") {
      setActiveTab("bookings");
    } else if (location.pathname === "/user-info") {
      setActiveTab("profile");
    } else if (location.pathname === "/ai-chat") {
      setActiveTab("Assistant");
    }
    const timeline = gsap.timeline();

    // Animate the header
    timeline.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }
    );

    // Animate the logo section
    timeline.fromTo(
      logoRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power4.out" },
      "-=0.5" // Overlap animations
    );

    // Animate the navigation links
    timeline.fromTo(
      navRef.current.children,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2, // Stagger animations for each link
        ease: "bounce.inOut",
      },
      "-=0.5"
    );
  }, [location.pathname]); 

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

//   const goBack = () => {
//     navigate(-1); // Navigate to the previous route
//   };

  return (
    <>
    <header ref={headerRef}>
      <div className="logoSection" ref={logoRef}>
        <img src={logo} alt="Logo" />
        <h3>HelpHive</h3>
      </div>
      <nav>
        <ul ref={navRef}>
          <li>
            <Link
              to="/user-home"
              className={activeTab === "home" ? "active" : ""}
              onClick={() => setActiveTab("home")}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/user-bookings"
              className={activeTab === "bookings" ? "active" : ""}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings
            </Link>
          </li>
          <li>
            <Link
              to="/user-info"
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/ai-chat"
              className={activeTab === "Assistant" ? "active" : ""}
              onClick={() => setActiveTab("Assistant")}
            >
              Assistant
            </Link>
          </li>
          <li>
            <Link
              to="#"
              className={activeTab === "logout" ? "active" : ""}
              onClick={handleLogout}
            >
              Logout
            </Link>
          </li>
        </ul>
      </nav>
    </header>
      {/* <header className="header">
            <div className="header-left">
      
        
        <div className="arrow-icon" onClick={goBack}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg> 
        </div>
          
        <div className="logo-container">
          <img src={Icon} alt="logo" className='bee' />
          <span className="brand-name">HelpHive</span>
          <h4>User</h4>
        </div>
      </div>
                <nav className="navbar">
                    <ul>
                        <li>
                            <Link 
                                to="/user-home" 
                                className={activeTab === "home" ? "active" : ""} 
                                onClick={() => setActiveTab("home")}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/user-bookings" 
                                className={activeTab === "bookings" ? "active" : ""} 
                                onClick={() => setActiveTab("bookings")}
                            >
                                Bookings
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/user-info" 
                                className={activeTab === "profile" ? "active" : ""} 
                                onClick={() => setActiveTab("profile")}
                            >
                                Profile
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/chat" 
                                className={activeTab === "chat" ? "active" : ""} 
                                onClick={() => setActiveTab("chat")}
                            >
                                Chats
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="#" 
                                className={activeTab === "logout" ? "active" : ""} 
                                onClick={handleLogout}
                            >
                                Logout
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header> */}
    </>
  );
};

export default Header;
