const { oauth2client } = require('../Utills/googleConfig.js');
const axios = require('axios');
const Employee = require('../model/employeeModel');
const authMiddleware = require('../helpers/Middleware');
const response = require('../helpers/response');


const googleSignUp = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'No code provided' });
    }

    console.log("Received Google Code for Signup---", code);

    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens || !googleRes.tokens.access_token) {
      return res.status(400).json({ message: 'Failed to get valid access token from Google' });
    }

    console.log("Google Token Response:", googleRes.tokens);

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

    console.log("Google User Info:", userRes.data); // Log entire response to verify if `name` is present
    const { email, name, picture } = userRes.data; // Ensure `name` is correctly accessed

    let user = await Employee.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists. Please log in instead.' });
    }


    const newUser = new Employee({
      employeeName:name,
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

    return res.status(201).json({
      message: 'User successfully registered.',
      userData: {
        _id: newUser._id,
        employeeName: newUser.employeeName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        token,
      },
    });
  } catch (err) {
    console.error('Google signup error:', err.response ? err.response.data : err.message);

    return response.error(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  googleSignUp
};
