const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');  

// Define your routes for signup and login
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/generate-otp', userController.generateOtp); //for login
router.post('/verify-otp',  userController.verifyOtp);

router.post('/send-otp',userController.sendOtp)
router.post('/verifyotp',userController.verifyOtpForSignUP);//verifyotp for login
router.post('/forgot-password',userController.verifyOtpAndResetPasswordController);

module.exports = router;
