const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employeeController');
const Middleware = require('../helpers/Middleware');
const Validator = require('../validator/employeeValidator');
const multer = require('multer')
const service = require('../service/empService')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
  
const upload = multer({ storage: storage })

const uploadfile = multer({
  dest:"uploads/",
  fileFilter:(req,file,cb)=>{
      if(file.mimetype === 'text/csv'){
          cb(null,true)
      }else{
          cb(new Error('Only CSV files are allowed'),false)
      }
  },
  limits:{fileSize:2*1024*1024}
})

// Define routes
router.post('/upload-csv',uploadfile.single('file'), employeeController.uploadCsv);
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


router.put('/profile/:id', upload.single('profilePicture'), async (req, res) => {
  const { id } = req.params;
  console.log('Backend received ID:', id); // Add this to check if the ID is valid
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

router.get('/employees/:id', employeeController.getEmployeeDetails);

router.get('/idstatus/:id',employeeController.getEmployeeStatus)


module.exports = router;


