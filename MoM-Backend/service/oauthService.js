const { oauth2client } = require('../Utills/googleConfig.js');
const axios = require('axios');
const Employee = require('../model/employeeModel');
const authMiddleware = require('../helpers/Middleware');

const googleAuthService = {
  async getGoogleTokens(code) {
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens || !googleRes.tokens.access_token) {
      throw new Error('Failed to get a valid access token from Google');
    }
    return googleRes.tokens;
  },

  async getGoogleUserInfo(accessToken) {
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
    );
    return userRes.data; 
  },

  async findEmployeeByEmail(email) {
    const user = await Employee.findOne({ email });
  console.log(user);
  
    // Check if the user exists and is active
    if (!user || !user.isActive) {
      throw new Error('User not found or account is inactive');
    }
    return user;
  },
  

  async generateAuthToken(user, name) {
    return await authMiddleware.generateToken({
      userId: user._id,
      employeeName: name,
      email: user.email,
    });
  },
};

const googleSignUpService = async (code) => {
    try {
      if (!code) {
        throw new Error('No code provided');
      }
  
      console.log("Received Google Code for Signup---", code);
  
      const googleRes = await oauth2client.getToken(code);
      oauth2client.setCredentials(googleRes.tokens);
  
      if (!googleRes.tokens || !googleRes.tokens.access_token) {
        throw new Error('Failed to get valid access token from Google');
      }
  
      console.log("Google Token Response:", googleRes.tokens);
  
      const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
  
      console.log("Google User Info:", userRes.data); // Log entire response to verify if `name` is present
      const { email, name, picture } = userRes.data; // Ensure `name` is correctly accessed
  
      let user = await Employee.findOne({ email });
  
      if (user) {
        throw new Error('User already exists. Please log in instead.');
      }
  
      const newUser = new Employee({
        employeeName: name,
        email,
        profilePicture: picture,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await newUser.save();
  
      console.log("New User Created:", newUser);
  
      // Generate a token for the new user
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
    } catch (err) {
      console.error('Google signup error:', err.message);
      throw new Error('Internal Server Error');
    }
  };
  

module.exports = { 
    googleAuthService,
    googleSignUpService
};
