const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employeeController');
const Middleware = require('../helpers/Middleware');
const Validator = require('../validator/employeeValidator');
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
  
const upload = multer({ storage: storage })



// Define routes
router.post('/signup', upload.single('profilePicture'), employeeController.signup);
router.post('/login', employeeController.login);
router.post('/generate-otp', employeeController.generateOtp);
router.post('/verify-otp', employeeController.verifyOtp); // Verify OTP for login
router.post('/send-otp', employeeController.sendOtp); // Send OTP
router.post('/verifyotp', employeeController.verifyOtpForSignUP); // Verify OTP for sign-up
router.post('/forgot-password', employeeController.verifyOtpAndResetPasswordController);

router.post('/logout', Middleware.authenticateToken, employeeController.logoutController);

router.post('/employee', Validator.createEmployee, employeeController.createEmployee);

router.get('/employees', employeeController.listEmployee);

router.post('/activate/:employeeId', Middleware.authenticateToken, employeeController.activateEmployee);
router.post('/deactivate/:employeeId', Middleware.authenticateToken, employeeController.deactivateEmployee);

router.put('/update-profile/:id', upload.single('profileimage'), employeeController.updateEmployeeProfileController); // Handles profile image upload for update

module.exports = router;
