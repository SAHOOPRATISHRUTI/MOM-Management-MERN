const authService = require('../service/userService');
const Responses = require('../helpers/response');
const messages = require('../constants/constMessage');
const validator = require('validator')

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await authService.login(email, password);

        // Validate email and password input
        if (!email || !password) {
            return Responses.failResponse(req, res, null, messages.emailpasswordRequired, 400); 
        }

        // If email is not registered, return the specific error
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // If incorrect password, return the specific error
        if (result.invalidPassword) {
            return Responses.failResponse(req, res, null, messages.incorrectPassword, 401);
        }

        // Return success response with user data (excluding password)
        return Responses.successResponse(req, res, {
            name: result.name,
            email: result.email,
            mobile: result.mobile,
            address: result.address
        }, 'Login successful', 200);

    } catch (error) {
        console.error('Login error:', error); // Log the error to the console for debugging

        // Return a more detailed error message
        const errorMessage = error.message || 'An unknown error occurred during login';

        // Default error response for login failure
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

        // Validate mobile number (simple check for 10 digits)
        const mobilePattern = /^[0-9]{10}$/;
        if (!mobilePattern.test(phone)) {
            return Responses.failResponse(req, res, null, messages.invalidMobile, 400);
        }

        // Call the signup service to register the user
        const result = await authService.signup(name, email, phone, password, address, role);

        // Check if user already exists (result should contain a flag or status)
        if (result.existingUser) {
            return Responses.failResponse(req, res, null, messages.userAlreadyExists, 400);
        }

        // Return success response with the user data (excluding password)
        return Responses.successResponse(req, res, {
            name, email, phone, address, role  // Exclude password for security
        }, messages.signupSuccess, 200);
    } catch (error) {
        console.error('Error during signup:', error);

        // Return generic error message if something went wrong
        return Responses.errorResponse(req, res, error.message || messages.GENERAL_ERROR, 500);
    }
};



// OTP Generation Logic (Modified)
const generateOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Generate OTP using the service function
        const result = await authService.generateAndSaveOtp(email);

        // If email is not registered, return the specific error
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // If max OTP requests are reached, return the specific error
        if (result.maxOtpReached) {
            return Responses.failResponse(req, res, null, messages.MAX_ATTEMPTS_REACHED, 429);
        }

        // If OTP generation is successful, return OTP and success message
        return Responses.successResponse(req, res, { otp: result.otp }, messages.OTP_GENERATION_SUCCESS, 200);

    } catch (error) {
        console.error('Error generating OTP:', error);

        // Default error response for OTP generation failure
        return Responses.errorResponse(req, res, new Error(messages.OTP_ERROR), 500, 'Error generating OTP');
    }
};



const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400);
        }

        if (!otp) {
            return Responses.failResponse(req, res, null, messages.otpRequired, 400);
        }

        // Optionally validate email format (basic example)
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return Responses.failResponse(req, res, null, messages.invalidEmailFormat, 400);
        }

        // Optionally validate OTP format (6-digit number)
        if (!/^\d{6}$/.test(otp)) {
            return Responses.failResponse(req, res, null, messages.invalidOtpFormat, 400);
        }

        // Call the OTP verification service
        const result = await authService.verifyOTP(email, otp);

        // Handle different failure scenarios for OTP verification
        if (result.success === false) {
            if (result.message === 'OTP has expired. Please request a new one.') {
                return Responses.failResponse(req, res, null, messages.otpExpired, 400);
            }

            if (result.invalidOtp) {
                return Responses.failResponse(req, res, null, messages.invalidOtp, 400);
            }
        }

        // Success scenario - OTP verified
        if (result.success && result.verified) {
            return Responses.successResponse(req, res, result, messages.otpVerificationSuccess, 200);
        }

        // If none of the above conditions are met, it means an unexpected state occurred
        return Responses.failResponse(req, res, null, messages.otpVerificationFailed, 400);

    } catch (error) {
        console.error('Error during OTP verification:', error);  // Log detailed error
        return Responses.errorResponse(req, res, error);  // Return a proper error response
    }
};


const verifyOtpAndResetPasswordController = async (req, res) => {
    try {
      const { email, otp, password } = req.body;
  
      if (!email || !otp || !password) {
        return res.status(400).json({ message: 'Email, OTP, and password are required' });
      }
  
      const result = await authService.verifyOtpAndResetPassword(email, otp, password);
  
  
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
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


const verifyOtpForLogin = async (req, res) => {
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
        const response = await authService.verifyOtpforLogin(email, otp);

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



module.exports = {
    login,
    signup,
    generateOtp,
    verifyOtp,
    verifyOtpAndResetPasswordController,
    sendOtp,
    verifyOtpForLogin

};
