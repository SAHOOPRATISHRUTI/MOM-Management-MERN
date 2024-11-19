const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const Middleware = require('../helpers/Middleware'); // Import middleware
//const authService = require('../services/authService'); // Import the logout service

// Define routes
router.post('/signup', userController.signup);
router.post('/login', userController.login); // No middleware required here
router.post('/generate-otp', userController.generateOtp); // Generate OTP, requires authentication
router.post('/verify-otp', userController.verifyOtp); // Verify OTP for login
router.post('/send-otp', userController.sendOtp); // Send OTP
router.post('/verifyotp', userController.verifyOtpForSignUP); // Verify OTP for sign-up
router.post('/forgot-password', userController.verifyOtpAndResetPasswordController); // Requires authentication

// Logout route
router.post('/logout', Middleware.authenticateToken, userController.logoutController); // Protected route for logout

// Protected route (example)
router.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
