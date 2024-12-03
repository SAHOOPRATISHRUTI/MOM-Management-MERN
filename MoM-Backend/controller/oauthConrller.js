const { googleAuthService } = require('../service/oauthService');
const response = require('../helpers/response.js');
const messages = require('../constants/constMessage');


// Google Login Controller
const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return response.failResponse(req, res, null, messages.BAD_REQUEST, 400);
    }

    console.log("Received Google Code:", code);

  
    const tokens = await googleAuthService.getGoogleTokens(code);
    console.log("Google Token Response:", tokens);


    const { email, name, picture } = await googleAuthService.getGoogleUserInfo(tokens.access_token);
    console.log("User Info from Google:", { email, name, picture });

    
    const user = await googleAuthService.findEmployeeByEmail(email);
   
    const token = await googleAuthService.generateAuthToken(user, name);

    return response.successResponse(req, res, {
      _id: user._id,
      employeeName: name,
      email: user.email,
      token,
      profilePicture: picture,
    }, messages.ACTIVE);
  } catch (err) {
    console.error('Google login error:', err.message);
    return response.errorResponse(req, res, messages.INTERNAL_SERVER_ERROR, 500);
  }
};

// Google SignUp Controller
const googleSignUp = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return response.failResponse(req, res, null, messages.GOOGLE_MISSING_CODE_MSG, 400);
    }

    console.log("Received Google Code for Signup:", code);

    const result = await googleAuthService.googleSignUpService(code);

    return response.successResponse(req, res, result.userData, messages.GOOGLE_SIGNUP_SUCCESS_MSG, 201);
  } catch (err) {
    console.error('Google signup controller error:', err.message);

    if (err.message === 'User already exists. Please log in instead.') {
      return response.failResponse(req, res, null, messages.GOOGLE_SIGNUP_FAIL_MSG, 400);
    }

    if (err.message === 'Failed to get valid access token from Google') {
      return response.failResponse(req, res, null, messages.GOOGLE_ACCESS_TOKEN_FAIL_MSG, 400);
    }

    return response.errorResponse(res, messages.GOOGLE_SIGNUP_ERROR_MSG, 500);
  }
};

module.exports = {
  googleLogin,
  googleSignUp,
};
