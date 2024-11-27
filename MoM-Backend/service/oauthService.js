const { oauth2client } = require('../Utills/googleConfig.js');
const axios = require('axios');
const Employee = require('../model/employeeModel');
const authMiddleware = require('../helpers/Middleware');


const googleAuthService = {
  // Fetch tokens from Google using the code
  async getGoogleTokens(code) {
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens || !googleRes.tokens.access_token) {
      throw new Error('Failed to get a valid access token from Google');
    }
    return googleRes.tokens;
  },

  // Retrieve user info from Google API using the access token
  async getGoogleUserInfo(accessToken) {
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
    );
    return userRes.data;
  },

  // Find the employee by their email in the database
  async findEmployeeByEmail(email) {
    const user = await Employee.findOne({ email });
    if (!user || !user.isActive) {
      throw new Error('User not found or account is inactive');
    }
    return user;
  },

  // Generate authentication token
  async generateAuthToken(user, name) {
    return await authMiddleware.generateToken({
      userId: user._id,
      employeeName: name,
      email: user.email,
    });
  },

  // Handle Google Signup (create new user if doesn't exist)
  async googleSignUpService(code) {
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens || !googleRes.tokens.access_token) {
      throw new Error('Failed to get valid access token from Google');
    }

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    // Check if user already exists
    let user = await Employee.findOne({ email });
    if (user) {
      throw new Error('User already exists. Please log in instead.');
    }

    // Create a new user in the database
    const newUser = new Employee({
      employeeName: name,
      email,
      profilePicture: picture,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newUser.save();

    const token = await authMiddleware.generateToken({
      userId: newUser._id,
      employeeName: newUser.employeeName,
      email: newUser.email,
    });

    return {
      message: 'User successfully registered.',
      userData: {
        _id: newUser._id,
        employeeName: newUser.employeeName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        token,
      },
    };
  },
};





module.exports = { 
    googleAuthService,
 
};
