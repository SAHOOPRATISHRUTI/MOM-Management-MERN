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

//router.put('/update-profile/:id', upload.single('profilePicture'), employeeController.editProfile); // Handles profile image upload for update

router.put('/profile/:id', upload.single('profilePicture'), async (req, res) => {
  // Now, when the request is made to /profile/:id, the id will be accessible in req.params
  const { id } = req.params;
  const updateData = req.body;

  if (req.file) {
    updateData.profilePicture = req.file.path; // Store the file path if a file is uploaded
  }

  try {
    const updatedEmployee = await employeeController.editProfile(req, res);  // Pass req and res to controller
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});



module.exports = router;
