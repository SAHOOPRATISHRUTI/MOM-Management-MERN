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
        return Responses.successResponse(req, res, null, messages.signupSuccess, 201);
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error);
    }
};

// Controller function to generate OTP
const generateOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Call the function that generates and saves the OTP
        const otp = await authService.generateAndSaveOtp(email);

        // Send a success response with the OTP (for testing purposes)
        return Responses.successResponse(req, res, { otp }, messages.otpGenerationSuccess, 200);
    } catch (error) {
        console.error('Error generating OTP:', error);

        // Send error response
        return Responses.errorResponse(req, res, error.message, 500);
    }
};


const verifyOtp = async (req, res) => {
    const { otp, email } = req.body;
  
    try {
      // Call the service function to handle the OTP verification logic
      await authService.verifyotp(email, otp);
      
      // Respond with a success message if the OTP verification passes
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
      // Handle errors and respond with a failure message
      res.status(400).json({ success: false, message: error.message });
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
