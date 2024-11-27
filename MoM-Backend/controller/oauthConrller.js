const { oauth2client } = require('../Utills/googleConfig.js');
const axios = require('axios');
const Employee = require('../model/employeeModel');
const authMiddleware = require('../helpers/Middleware');
const MESSAGES = require('../constants/constMessage');
const googleAuthService = require('../service/oauthService');
const response = require('../helpers/response.js')

// Google Login Controller
const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;

    // Validate that the Google authorization code is provided
    if (!code) {
      return failResponse(req, res, null, MESSAGES.ERROR.BAD_REQUEST, 400);
    }

    console.log("Received Google Code:", code);

    // Step 1: Exchange the code for Google tokens
    const tokens = await googleAuthService.getGoogleTokens(code);
    console.log("Google Token Response:", tokens);

    // Step 2: Retrieve user information from Google
    const { email, name, picture } = await googleAuthService.getGoogleUserInfo(tokens.access_token);
    console.log("User Info from Google:", { email, name, picture });

    // Step 3: Check if the user exists and is active
    const user = await googleAuthService.findEmployeeByEmail(email);

    // Step 4: Generate and return a token for active users
    const token = await googleAuthService.generateAuthToken(user, name);

    // Send the successful response
    return response.successResponse(req, res, {
      _id: user._id,
      employeeName: name,
      email: user.email,
      token,
      profilePicture: picture,
    }, MESSAGES.USER.ACTIVE);

  } catch (err) {
    // Specific error handling based on the error type
    if (err.message === 'User not found or account is inactive') {
      return response.failResponse(req, res, null, MESSAGES.USER.NOT_FOUND, 403);
    }

    console.error('Google login error:', err.response ? err.response.data : err.message);
    return response.errorResponse(req, res, MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }
};



const googleSignUp = async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return response.failResponse(req, res, null,MESSAGES.GOOGLE_MISSING_CODE_MSG, 400);
      }
  
      console.log("Received Google Code for Signup---", code);
  
      const result = await googleAuthService.googleSignUpService(code);
  
   
      return response.successResponse(req, res, result.userData, MESSAGES.GOOGLE_SIGNUP_SUCCESS_MSG, 201);
  
    } catch (err) {
      console.error('Google signup controller error:', err.message);
  

      if (err.message === MESSAGES.GOOGLE_SIGNUP_FAIL_MSG) {
        return response.failResponse(req, res, null, MESSAGES.GOOGLE_SIGNUP_FAIL_MSG, 400);
      }
  
      if (err.message === MESSAGES.GOOGLE_ACCESS_TOKEN_FAIL_MSG || err.message === MESSAGES.GOOGLE_MISSING_CODE_MSG) {
        return response.failResponse(req, res, null, err.message, 400);
      }
  
      return response.errorResponse(res, MESSAGES.GOOGLE_SIGNUP_ERROR_MSG, 500);
    }
  };
  


module.exports = {
  googleLogin,
  googleSignUp
};
