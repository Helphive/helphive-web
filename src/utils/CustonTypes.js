// ValidationError structure
// type: string
// value: string
// msg: string
// path: string
// location: string
export const ValidationError = {
    // Define the structure of a ValidationError
    type: "", // Placeholder for the error type
    value: "", // Placeholder for the value that caused the error
    msg: "", // Placeholder for the error message
    path: "", // Placeholder for the path where the error occurred
    location: "", // Placeholder for the location of the error
};

// CustomError structure
// status: number
// data: {
//   message: string;
//   errors?: Array<ValidationError>
// }
export const CustomError = {
    status: 0, // Placeholder for the status code
    data: {
        message: "", // Placeholder for the error message
        errors: [], // Placeholder for an array of ValidationError (optional)
    },
};

// RootStackParamList structure
// Contains various routes in the application
export const RootStackParamList = {
    Login: undefined, // Login screen
    Signup: undefined, // Signup screen
    ProviderSignup: undefined, // Provider signup screen
    ForgotPassword: undefined, // Forgot password screen
    Home: undefined, // Home screen
    ProviderDetails: undefined, // Provider details screen
    AccountApproval: undefined, // Account approval screen
    AccountRejected: undefined, // Account rejected screen
    AccountPending: undefined, // Account pending screen
    ProviderHome: undefined, // Provider home screen
    UserHome: null, // User home screen (using null as placeholder)
    BookingPayment: undefined, // Booking payment screen
};
