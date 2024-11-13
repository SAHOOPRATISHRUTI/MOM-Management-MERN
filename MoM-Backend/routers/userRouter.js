const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');  // Assuming the correct path to userController

// Define your routes for signup and login
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/generate-otp', userController.generateOtp); 
router.post('/verify-otp',  userController.verifyOtp);
router.post('/reset-password',userController.resetPassword)

module.exports = router;
