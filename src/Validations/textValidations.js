// src/utils/validation/textValidations.js

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };
  
  export const validateFirstName = (firstName) => {
    return firstName.length > 0 ? '' : 'First name is required';
  };
  
  export const validateLastName = (lastName) => {
    return lastName.length > 0 ? '' : 'Last name is required';
  };
  
  export const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one digit';
    }
    return '';
  };
  