const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employeeController');
const authController = require('../controller/authController')
const Middleware = require('../helpers/Middleware'); 
const Validator = require('../validator/employeeValidator')

// Define routes
router.post('/signup', employeeController.signup);
router.post('/login', employeeController.login); 
router.post('/generate-otp', employeeController.generateOtp); 
router.post('/verify-otp', employeeController.verifyOtp); // Verify OTP for login
router.post('/send-otp', employeeController.sendOtp); // Send OTP
router.post('/verifyotp', employeeController.verifyOtpForSignUP); // Verify OTP for sign-up
router.post('/forgot-password', employeeController.verifyOtpAndResetPasswordController); 

router.post('/logout', Middleware.authenticateToken, employeeController.logoutController); 

router.post("/employee",Validator.createEmployee,employeeController.createEmployee)

router.get('/employees', 
 //Middleware.authenticateToken, /
    employeeController.listEmployee
);
// activate employee
router.post('/activate/:employeeId', Middleware.authenticateToken, employeeController.activateEmployee);

// dectivate employee
router.post('/deactivate/:employeeId', Middleware.authenticateToken, employeeController.deactivateEmployee);

router.put('/update-profile/:id', employeeController.updateEmployeeProfileController);

// router.get('/google',authController.googleLogin)
// router.post('/google-signup',authController.googleSignUp)

module.exports = router;
