const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employeeController');
const authController = require('../controller/authController')
const Middleware = require('../helpers/Middleware'); // Import middleware
const Validator = require('../validator/employeeValidator')

// Define routes
router.post('/signup', employeeController.signup);
router.post('/login', employeeController.login); // No middleware required here
router.post('/generate-otp', employeeController.generateOtp); // Generate OTP, requires authentication
router.post('/verify-otp', employeeController.verifyOtp); // Verify OTP for login
router.post('/send-otp', employeeController.sendOtp); // Send OTP
router.post('/verifyotp', employeeController.verifyOtpForSignUP); // Verify OTP for sign-up
router.post('/forgot-password', employeeController.verifyOtpAndResetPasswordController); // Requires authentication

router.post('/logout', Middleware.authenticateToken, employeeController.logoutController); // Protected route for logout

router.post("/employee",Validator.createEmployee,employeeController.createEmployee)

router.get('/employees', 
 //Middleware.authenticateToken, // Optional, if authentication is needed
    employeeController.listEmployee
);
// activate employee
router.post('/activate/:employeeId', Middleware.authenticateToken, employeeController.activateEmployee);

// dectivate employee
router.post('/deactivate/:employeeId', Middleware.authenticateToken, employeeController.deactivateEmployee);

router.put('/update-profile/:id', employeeController.updateEmployeeProfileController);

router.get('/google',authController.googleLogin)

module.exports = router;
