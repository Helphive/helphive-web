import { useState } from "react";
import "./LoginScreen.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import gsap from "gsap";
// import { Button, TextField, Typography, CircularProgress } from "@mui/material";

import { setCredentials } from "../../Auth/AuthSlice";
import { useLoginMutation } from "../../Auth/authApiSlice";
import { useGetEmailVerificationMutation } from "../../Email/emailApiSlice";
import { storeRefreshToken } from "../../secureStore/secureStoreUtility";
import { validateEmail } from "../../utils/textValidations";

const LoginScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    gsap.fromTo(
      ".signUpContainer h1",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1 }
    );

    gsap.fromTo(
      ".signUpContainer p",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5 }
    );

    gsap.fromTo(
      ".signUpContainer form input",
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, delay: 1 }
    );

    gsap.fromTo(
      ".signUpContainer form button",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.5 }
    );

    gsap.fromTo(
      ".signUpContainer form p span",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.6, delay: 2 }
    );
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [emailVerificationError, setEmailVerificationError] = useState(null);

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [getEmailVerification, { isLoading: isEmailVerificationLoading }] =
    useGetEmailVerificationMutation();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(null);
    setLoginError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(null);
    setLoginError(null);
  };

  //   const togglePasswordVisibility = () => {
  //     setShowPassword(!showPassword);
  //   };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = !password ? "Password is required" : "";

    if (emailError || passwordError) {
      setEmailError(emailError || null);
      setPasswordError(passwordError || null);
      return;
    }

    setEmailError(null);
    setPasswordError(null);
    setLoginError(null);

    try {
      const trimmedData = {
        email: email.trim(),
        password: password.trim(),
      };
      const userData = await login(trimmedData).unwrap();
      dispatch(
        setCredentials({
          user: userData?.user,
          accessToken: userData?.accessToken,
          refreshToken: userData?.refreshToken,
        })
      );
      await storeRefreshToken(userData?.refreshToken);
      setEmail("");
      setPassword("");
      setEmailError(null);
      setPasswordError(null);
      navigate("/home");
    } catch (error) {
      console.log(
        "Login error:",
        error?.data?.message || error?.message || error
      );

      if (error?.status === "FETCH_ERROR") {
        setLoginError(
          "Network error. Please check your internet connection and try again."
        );
        alert(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error?.status === 400) {
        setLoginError("Invalid email or password.");
        alert("Invalid email or password.");
      } else if (error?.status === 401) {
        setLoginError(
          "Authentication failed. Email or password was not correct."
        );
        alert("Authentication failed. Email or password was not correct.");
      } else if (error?.status === 403) {
        setEmailVerificationError(
          "We already sent you an email with the verification link. Please verify your email before logging in."
        );
        alert(
          "We already sent you an email with the verification link. Please verify your email before logging in."
        );
      } else if (error?.status >= 500) {
        setLoginError("Internal server error. Please try again later.");
        alert("Internal server error. Please try again later.");
      } else {
        setLoginError("An unexpected error occurred. Please try again later.");
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

//   const resendVerificationEmail = async () => {
//     try {
//       const credentials = { email: email.trim() };
//       await getEmailVerification(credentials).unwrap();
//       setEmailVerificationError(null);
//     } catch (err) {
//       console.error("Failed to verify email:", err);
//     }
//   };

  return (
    <div className="signUpContainer">
      <div>
        <h1>
          Welcome Back! <br />
          Log In to Continue.
        </h1>
        <p>
          Ready to dive back in? Log in and access all your saved preferences
          and services. Let’s make your home better, one click at a time!
        </p>
      </div>

      <form>
        <input
          type="text"
          placeholder="E-Mail:"
          onChange={handleEmailChange}
          label="Email"
          value={email}
        />
        {emailError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {emailError}
          </span>
        )}
        <input
          type="password"
          placeholder="Password:"
          label="Password"
          onChange={handlePasswordChange}
        />
        {passwordError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {passwordError}
          </span>
        )}

        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Loading..." : "Login"}
        </button>
        <p>
          Don't Have An Account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
        <div className="forgot-password">
          <p onClick={() => navigate("/forgot-password")}>Forgot Password</p>
        </div>
      </form>
    </div>

    // <div className="login-page">
    //     <div className="login-container">
    //         <img src="../../assets/icon.png" alt="Logo" />
    //         <Typography variant="h4" className="login-title">
    //             Welcome
    //         </Typography>
    //         <TextField
    //             label="Email"
    //             value={email}
    //             onChange={handleEmailChange}
    //             variant="outlined"
    //             fullWidth
    //             error={!!emailError}
    //             helperText={emailError}
    //             className="login-input"

    //         />
    //         <TextField
    //             label="Password"
    //             type={showPassword ? "text" : "password"}
    //             value={password}
    //             onChange={handlePasswordChange}
    //             variant="outlined"
    //             fullWidth
    //             error={!!passwordError}
    //             helperText={passwordError}
    //             className="login-input"
    //             InputProps={{
    //                 endAdornment: (
    //                     <Button onClick={togglePasswordVisibility}>
    //                         <span role="img" aria-label="show-password">
    //                             👁️
    //                         </span>
    //                     </Button>
    //                 ),
    //             }}
    //         />
    //         <Typography
    //             className="forgot-password-link"
    //             onClick={() => navigate("/forgot-password")}
    //         >
    //             Forgot Password?
    //         </Typography>
    //         <Button
    //             onClick={handleLogin}
    //             variant="contained"
    //             className="login-button"
    //             disabled={isLoading}
    //         >
    //             {isLoading ? <CircularProgress size={24} /> : "Login"}
    //         </Button>
    //         <Typography className="login-signup-container">
    //             Don’t have an account?{" "}
    //             <span
    //                 className="signup-link"
    //                 onClick={() => navigate("/signup")}
    //             >
    //                 Sign Up
    //             </span>
    //         </Typography>
    //     </div>
    // </div>
  );
};

export default LoginScreen;
