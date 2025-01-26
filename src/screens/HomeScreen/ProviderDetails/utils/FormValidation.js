const NAME_REGEX = /^[a-zA-Z\xC0-\uFFFF]{2,}([ \-'][a-zA-Z\xC0-\uFFFF]{0,2})?[.]?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateFirstName = (firstName) => {
    if (!firstName.trim()) {
        return "First name is required";
    }
    if (!NAME_REGEX.test(firstName.trim())) {
        return "First name must contain at least 2 letters and no special characters";
    }
    return "";
};

export const validateLastName = (lastName) => {
    if (!lastName.trim()) {
        return "Last name is required";
    }
    if (!NAME_REGEX.test(lastName.trim())) {
        return "Last name must contain at least 2 letters and no special characters";
    }
    return "";
};

export const validateEmail = (email) => {
    if (!email.trim()) {
        return "Email is required";
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        return "Email is not valid";
    }
    return "";
};

export const validatePhone = (phone) => {
    if (!phone.trim()) {
        return "Phone number is required";
    }
    // Simplified phone validation for Pakistan
    if (!/^(0|\+?92)\d{10}$/.test(phone.trim())) {
        return "Phone number is not valid";
    }
    return "";
};

export const validateRequiredField = (fieldName, value) => {
    if (!value.trim()) {
        return `${fieldName} is required`;
    }
    return "";
};

// Generic file validation
export const validateFile = (file) => {
    if (!file) {
        return "File is required";
    }

    // Check if the file is of valid type
    const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const isValidType = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
        return "Invalid file format. Allowed formats: jpg, jpeg, png, pdf";
    }
    
    return "";
};

export const validateId = validateFile;
export const validateDbs = validateFile;
export const validateResume = validateFile;
export const validateProfile = validateFile;

export const validateJobTypes = (jobTypes) => {
    const jobTypesCount = ['publicAreaAttendant', 'roomAttendant', 'linenPorter'].filter(job => jobTypes[job]).length;
    if (jobTypesCount === 0) {
        return "Select at least 1 job";
    }
    return "";
};
