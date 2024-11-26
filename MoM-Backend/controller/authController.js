const { oauth2client } = require('../Utills/googleConfig');
const axios = require('axios');
const Employee = require('../model/employeeModel');
const authMiddleware = require('../helpers/Middleware');
const response = require('../helpers/response'); 

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'No code provided' });
    }

    console.log("Received Google Code---", code);


    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens || !googleRes.tokens.access_token) {
      return res.status(400).json({ message: 'Failed to get valid access token from Google' });
    }

    console.log("Google Token Response:", googleRes.tokens);

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    const { email, name } = userRes.data;

    console.log("User Info from Google:", userRes.data);

    let user = await Employee.findOne({ email });

    if (user) {
      if (user.isActive) {
        return res.status(200).json({
          message: 'User already exists and is active.',
          userData: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      } else {
        return res.status(403).json({ message: 'User is not active. Please contact the administrator.' });
      }
    }

    user = new Employee({
      email,
      name,
      isActive: true, 
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    await user.save();
    console.log('New user created:', user);

    const token = await authMiddleware.generateToken({
      userId: user._id,
      name: user.name,
      email: user.email,
    });


    return res.status(200).json({
      message: 'Google login successful',
      userData: {
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.response ? err.response.data : err.message); 

    return response.error(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  googleLogin,
};
