const authService = require('../service/userService');
const Responses = require('../helpers/response');
const messages = require('../constants/constMessage');
const validator = require('validator')

const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return Responses.failResponse(req, res, null, messages.emailpasswordRequired, 400);
    }

    try {
        // Call the login service to authenticate user
        const result = await authService.login(email, password);

        // Check if email is not registered
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // Check if password is incorrect
        if (result.invalidPassword) {
            return Responses.failResponse(req, res, null, messages.incorrectPassword, 401);
        }

        // Return successful login response with user data and token
        return Responses.successResponse(req, res, {
            id: result.id,
            name: result.name,
            email: result.email,
            mobile: result.mobile,
            address: result.address,
            token: result.token // Include token
        }, 'Login successful', 200);

    } catch (error) {
        // Log the error for debugging
        console.error('Login error:', error);

        // Send error response with a message and 500 status
        const errorMessage = error.message || 'An unknown error occurred during login';
        return Responses.errorResponse(req, res, errorMessage, 500);
    }
};




const signup = async (req, res) => {
    const { name, email, phone, password, address, role } = req.body;

    try {
        // Validate input fields
        if (!name) {
            return Responses.failResponse(req, res, null, messages.nameisrequired, 400);
        }
        if (!email || !validator.isEmail(email)) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400);
        }
        if (!address) {
            return Responses.failResponse(req, res, null, messages.addressRequired, 400);
        }
        if (!password || password.length < 6) {
            return Responses.failResponse(req, res, null, messages.passwordRequired, 400);
        }


        const mobilePattern = /^[0-9]{10}$/;
        if (!mobilePattern.test(phone)) {
            return Responses.failResponse(req, res, null, messages.invalidMobile, 400);
        }


        const result = await authService.signup(name, email, phone, password, address, role);


        if (result.existingUser) {
            return Responses.failResponse(req, res, null, messages.userAlreadyExists, 400);
        }


        return Responses.successResponse(req, res, {
            name, email, phone, address, role
        }, messages.signupSuccess, 200);
    } catch (error) {
        console.error('Error during signup:', error);


        return Responses.errorResponse(req, res, error.message || messages.GENERAL_ERROR, 500);
    }
};



// OTP Generation Logic for Login
const generateOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await authService.generateAndSaveOtp(email);

        // If email is not registered, return a failure response
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // If maximum OTP attempts are reached and the OTP is still valid, return an error response
        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 429);  // Custom error from generateAndSaveOtp
        }

        // Return the OTP generation success response
        return Responses.successResponse(req, res, { 
            otp: result.otp, 
            otpAttempts: result.otpAttempts, 
            otpExpiry: result.otpExpiry 
        }, messages.OTP_GENERATION_SUCCESS, 200);

    } catch (error) {
        console.error('Error generating OTP:', error);
        return Responses.errorResponse(req, res, new Error(messages.OTP_ERROR), 500, 'Error generating OTP');
    }
};



const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if email and OTP are provided
        if (!email) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400);
        }

        if (!otp) {
            return Responses.failResponse(req, res, null, messages.otpRequired, 400);
        }

        // Validate email format
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return Responses.failResponse(req, res, null, messages.invalidEmailFormat, 400);
        }

        // Validate OTP format (e.g., 6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return Responses.failResponse(req, res, null, messages.invalidOtpFormat, 400);
        }

        // Call the service to verify the OTP
        const result = await authService.verifyOTP(email, otp);

        if (!result.success) {
            // Handle OTP verification failure
            if (result.invalidOtp) {
                return Responses.failResponse(req, res, null, messages.invalidOtp, 400);
            }
            if (result.message) {
                return Responses.failResponse(req, res, null, result.message, 400);
            }
        }

        // If OTP is verified successfully, return the token
        if (result.success && result.verified) {
            return Responses.successResponse(req, res, {
                token: result.token // The token is already included in the service response
            }, messages.otpVerificationSuccess, 200);
        }

        // If OTP verification failed for some reason
        return Responses.failResponse(req, res, null, messages.otpVerificationFailed, 400);

    } catch (error) {
        console.error('Error during OTP verification:', error);
        return Responses.errorResponse(req, res, error);
    }
};




const verifyOtpAndResetPasswordController = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;

    try {
        // Call the service to verify OTP and reset password
        const result = await authService.verifyOtpAndResetPassword(email, otp, password, confirmPassword);

        // If there's an error in the result, return failure response
        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 400);
        }

        // If everything is successful, return success response
        return Responses.successResponse(req, res, result, result.success || messages.passwordResetSuccess, 200);
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in controller:', error);
        return Responses.errorResponse(req, res, error.message || 'Internal server error');
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Validate email input
        if (!email || !email.trim()) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400); // Return error if email is missing
        }

        // Call sendOtp service to generate and send OTP
        const result = await authService.sendOtp(email);

        // Check if the email is already registered
        if (!result.success) {
            if (result.message === 'This email ID is already registered') {
                return Responses.failResponse(req, res, null, messages.emailAlreadyRegistered, 400); // Email is already registered
            } else {
                return Responses.failResponse(req, res, null, result.message, 400); // Handle other errors (e.g., invalid email format)
            }
        }

        // Return success response after OTP is sent successfully
        return Responses.successResponse(req, res, result, messages.otpSentSuccess, 200);

    } catch (error) {
        console.error('Error in OTP request:', error);

        // Default error response for OTP request failure
        return Responses.errorResponse(req, res, new Error(messages.GENERAL_ERROR), 500, 'Error sending OTP');
    }
};


const verifyOtpForSignUP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Validate email and OTP input
        if (!email || !email.trim()) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400); // Return error if email is missing
        }
        if (!otp || !otp.trim()) {
            return Responses.failResponse(req, res, null, messages.otpRequired, 400); // Return error if OTP is missing
        }

        // Validate email format using regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return Responses.failResponse(req, res, null, messages.invalidEmailFormat, 400); // Return error if email format is invalid
        }

        // Call the verifyOtp service to check if OTP is valid
        const response = await authService.verifyOtpForSignUP(email, otp);

        // If OTP verification fails (could include reasons like expiry or incorrect OTP)
        if (!response.success) {
            return Responses.failResponse(req, res, null, response.message || messages.invalidOtp, 400);
        }

        // Return success response after OTP is successfully verified
        return Responses.successResponse(req, res, response, messages.otpVerifiedSuccess, 200);

    } catch (error) {
        console.error('Error in OTP verification:', error);

        // Default error response for OTP verification failure
        return Responses.errorResponse(req, res, new Error(messages.GENERAL_ERROR), 500, 'Error verifying OTP');
    }
};

const logoutController = async (req, res) => {
    try {
        // Ensure to call the correct logoutService directly and await the result
        const result = await authService.logoutService(req);

        // Check if result is undefined or null
        if (!result) {
            return Responses.failResponse(req, res, null, 'Logout failed: No result from service', 400);
        }

        // If there's an error in the result, return failure response
        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 400);
        }

        // If everything is successful, return success response
        return Responses.successResponse(req, res, result, messages.logoutSuccess || 'Successfully logged out', 200);
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in logout controller:', error);
        if (!res.headersSent) {
            return Responses.errorResponse(req, res, error.message || 'Internal server error', 500);
        }
    }
};



module.exports = {
    login,
    signup,
    generateOtp,
    verifyOtp,
    verifyOtpAndResetPasswordController,
    sendOtp,
    verifyOtpForSignUP,
    logoutController

};
