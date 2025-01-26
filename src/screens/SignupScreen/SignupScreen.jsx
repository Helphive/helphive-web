import { useState } from "react";
import { useEffect } from "react";
import gsap from "gsap";
import "./signup.css";
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../Auth/authApiSlice";
import CustomDialog from "../../Components/CustomDialogues";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
} from "../../utils/textValidations";
// import {
//   TextField,
//   Typography,
//   Button,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";

const UserSignup = () => {
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
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);

  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [signupError, setSignupError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(null);

  const [signup, { isLoading }] = useSignupMutation();

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setFirstNameError(validateFirstName(e.target.value));
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    setLastNameError(validateLastName(e.target.value));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(
      e.target.value !== password ? "ⓘ Passwords do not match" : null
    );
  };

  // const togglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
    let errorFound = false;
    if (validateFirstName(firstName).length > 0) {
      setFirstNameError(validateFirstName(firstName));
      errorFound = true;
    }
    if (validateLastName(lastName).length > 0) {
      setLastNameError(validateLastName(lastName));
      errorFound = true;
    }
    if (validateEmail(email).length > 0) {
      setEmailError(validateEmail(email));
      errorFound = true;
    }
    if (validatePassword(password).length > 0) {
      setPasswordError(validatePassword(password));
      errorFound = true;
    }
    if (
      validatePassword(confirmPassword).length > 0 ||
      password !== confirmPassword
    ) {
      setConfirmPasswordError("Passwords do not match");
      errorFound = true;
    }
    if (errorFound) return;

    try {
      const trimmedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
      };
      await signup(trimmedData).unwrap();
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstNameError(null);
      setLastNameError(null);
      setEmailError(null);
      setPasswordError(null);
      setConfirmPasswordError(null);
      setSignupSuccess(
        "We've sent you an email with the verification link. Please verify your email."
      );
    } catch (error) {
      console.log(
        "Signup error:",
        error?.data?.message || error?.message || error
      );

      if (error?.status === "FETCH_ERROR") {
        setSignupError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error?.status === 400) {
        setSignupError("Invalid credentials.");
      } else if (error?.status === 409) {
        setSignupError(
          error?.data?.message ||
            "An account already exists on this email. Please use a different one."
        );
      } else if (error?.status >= 500) {
        setSignupError("Internal server error. Please try again later.");
      } else {
        setSignupError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const hideDialog = () => setSignupError(null);
  const hideSuccessDialog = () => {
    setSignupSuccess(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    navigate("/login");
  };

  return (
    <div className="signUpContainer">
      <div>
        <h1>
          Join the Hive <br />
          Sign Up for Seamless Service!
        </h1>
        <p>
          Need help? We’ve got you! Sign up and let us connect you with the best
          pros for all your home needs. It’s like having a superhero team, but
          for your house!
        </p>
      </div>

      <form>
        <input
          type="text"
          placeholder="First Name:"
          onChange={handleFirstNameChange}
        />
        {firstNameError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {firstNameError}
          </span>
        )}
        <input
          type="text"
          placeholder="Last Name:"
          onChange={handleLastNameChange}
        />
        {lastNameError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {lastNameError}
          </span>
        )}
        <input type="text" placeholder="E-Mail:" onChange={handleEmailChange} />
        {emailError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {emailError}
          </span>
        )}
        <input
          type="password"
          placeholder="Password:"
          onChange={handlePasswordChange}
        />
        {passwordError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {passwordError}
          </span>
        )}
        <input
          type="password"
          placeholder="Confirm Password:"
          onChange={handleConfirmPasswordChange}
        />
        {confirmPasswordError && (
          <span style={{ color: "#cecece", fontSize: "12px" }}>
            {confirmPasswordError}
          </span>
        )}
        <button onClick={handleSignup} disabled={isLoading}>
          {isLoading ? "Loading..." : "Sign up"}
        </button>
        <p>
          Already Have An Account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
      <CustomDialog
        title="Error"
        message={signupError}
        buttonText="Try Again"
        icon="alert-circle-outline"
        iconColor="red"
        hideDialog={hideDialog}
      />
      <CustomDialog
        title="You're all set!"
        message={signupSuccess}
        buttonText="Login"
        icon="check-circle-outline"
        iconColor="green"
        hideDialog={hideSuccessDialog}
      />
    </div>
  );
};

export default UserSignup;
