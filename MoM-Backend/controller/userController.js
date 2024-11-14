const authService = require('../service/userService');
const Responses = require('../helpers/response');
const messages = require('../constants/constMessage');



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        return Responses.successResponse(req, res, result, messages.loginSuccess, 200);
    } catch (error) {
        console.error(error)

        let errorMessage = messages.unexpectedError;  

        if (error.message === messages.invalidEmail) {
            errorMessage = messages.emailRequired;
        } else if (error.message === messages.passwordRequired) {
            errorMessage = messages.passwordRequired;
        }

        return Responses.errorResponse(req, res, { message: errorMessage });
    }
};


// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await authService.signup(name, email, password);
        return Responses.successResponse(req, res, {name,email,password}, messages.signupSuccess, 201);
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
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
            return Responses.failResponse(req, res, null, messages.emailnotRegister,500);
        }

        // If max attempts reached, return the specific error
        if (result.maxOtpReached) {
            return Responses.failResponse(req, res, null, messages.MAX_ATTEMPTS_REACHED, 429);
        }

        // If OTP generation is successful, return OTP and success message
        return Responses.successResponse(req, res, { otp: result.otp }, messages.OTP_GENERATION_SUCCESS, 200);

    } catch (error) {
        console.error('Error generating OTP:', error);

        // Default error response for OTP generation failure
        return Responses.failResponse(req, res, new Error(messages.OTP_ERROR), 500, 'Error generating OTP');
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
        if (result.OtpExpired) {
            return Responses.failResponse(req, res, null, messages.otpExpired, 400);
        }

        if (result.invalidOtp) {
            return Responses.failResponse(req, res, null, messages.invalidOtp, 400);
        }


        // Success scenario - OTP verified
        if (result.verified) {
            return Responses.successResponse(req, res, result, messages.otpVerificationSuccess, 200);
        }

        // If none of the above conditions are met, it means an unexpected state occurred
        return Responses.failResponse(req, res, null, messages.otpVerificationFailed, 400);

    } catch (error) {
        console.error('Error during OTP verification:', error);  // Log detailed error
        return Responses.errorResponse(req, res, error);  // Return a proper error response
    }
};


  const resetPassword = async (req, res) => {
    const { email, otp, password, nwpassword } = req.body;

    try {
        // Call the service to reset the password
        const result = await authService.resetPassword(email, otp, password, nwpassword);

        // If successful, send the success response
        return Responses.successResponse(req, res, null, result, 200);
    } catch (error) {
        // If there's an error, send the error response with the appropriate message
        return Responses.errorResponse(req, res, error.message, 400);
    }
};


module.exports = {
    login,
    signup,
    generateOtp,
    verifyOtp,
    resetPassword
};
