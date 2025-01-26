import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useProviderSignupMutation } from "../../Auth/authApiSlice";
import "./ProviderSignup.css";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../../utils/textValidations";

const ProviderSignup = () => {
  useEffect(() => {
    gsap.fromTo(
      ".signUpContainer h1",
      { opacity: 0, scale: 0.7, rotateX: -45, y: -50 },
      { opacity: 1, scale: 1, rotateX: 0, y: 0, duration: 1.2, ease: "power4.out" }
    );
    gsap.fromTo(
      ".signUpContainer p",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: "bounce.out" }
    );
    gsap.fromTo(
      ".signUpContainer form input",
      { opacity: 0, x: -150, rotateY: -30 },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 0.9,
        stagger: 0.2,
        delay: 1.1,
        ease: "expo.out",
      }
    );
    gsap.fromTo(
      ".signUpContainer form button",
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1.1, y: 0, duration: 0.8, delay: 1.8, ease: "elastic.out(1, 0.75)" }
    );
  }, []);

  const navigate = useNavigate();
  const [providerSignup, { isLoading }] = useProviderSignupMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState(null);

  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Input validations
    if (validateFirstName(firstName).length > 0) {
      setFirstNameError(validateFirstName(firstName));
      return;
    }
    if (validateLastName(lastName).length > 0) {
      setLastNameError(validateLastName(lastName));
      return;
    }
    if (validateEmail(email).length > 0) {
      setEmailError(validateEmail(email));
      return;
    }
    if (validatePassword(password).length > 0) {
      setPasswordError(validatePassword(password));
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      const trimmedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
      };

      await providerSignup(trimmedData).unwrap();

      alert("We've sent you a verification email. Please check your inbox!");
      navigate("/login");
    } catch (error) {
      console.error("Provider Signup error:", error);

      if (
        error?.data?.message &&
        error.data.message.includes("already exists")
      ) {
        setSignupError("An account with this email already exists. Please log in.");
      } else {
        setSignupError("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <div className="signUpContainer">
      <div>
        <h1>
          Become a Provider <br />
          Empower Your Skills with Us!
        </h1>
        <p>
          Got skills? Get paid! Sign up as a provider and let’s make your
          expertise go viral (in a good way). Join the hive and start buzzing
          with opportunities!
        </p>
      </div>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="First Name:"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            setFirstNameError(validateFirstName(e.target.value));
          }}
        />
        {firstNameError && <span className="error">{firstNameError}</span>}
        <input
          type="text"
          placeholder="Last Name:"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            setLastNameError(validateLastName(e.target.value));
          }}
        />
        {lastNameError && <span className="error">{lastNameError}</span>}
        <input
          type="email"
          placeholder="E-Mail:"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value));
          }}
        />
        {emailError && <span className="error">{emailError}</span>}
        <input
          type="password"
          placeholder="Password:"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(validatePassword(e.target.value));
          }}
        />
        {passwordError && <span className="error">{passwordError}</span>}
        <input
          type="password"
          placeholder="Confirm Password:"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmPasswordError(
              e.target.value !== password ? "Passwords do not match" : null
            );
          }}
        />
        {confirmPasswordError && (
          <span className="error">{confirmPasswordError}</span>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
        {signupError && <p className="error">{signupError}</p>}
        <p>
          Already Have An Account?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default ProviderSignup;
