const authService = require('../service/empService');
const Responses = require('../helpers/response');
const messages = require('../constants/constMessage');
const validator = require('validator')
const path = require('path');
const { response } = require('express');
const fs = require('fs');


const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return Responses.failResponse(req, res, null, messages.emailpasswordRequired, 400);
    }

    try {
        // Call the login service to authenticate user
        const result = await authService.login(email, password);

        // Check if email is not registered
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // Check if password is incorrect
        if (result.invalidPassword) {
            return Responses.failResponse(req, res, null, messages.incorrectPassword, 401);
        }

        // Return successful login response with user data and token
        return Responses.successResponse(req, res, {
            id: result.id,
            employeeName: result.employeeName,
            email: result.email,
            mobile: result.mobile,
            address: result.address,
            role:result.role,
            profilePicture:result.profilePicture,
            token: result.token 
        }, 'Login successful', 200);

    } catch (error) {
        // Log the error for debugging
        console.error('Login error:', error);

        // Send error response with a message and 500 status
        const errorMessage = error.message || 'An unknown error occurred during login';
        return Responses.errorResponse(req, res, errorMessage, 500);
    }
};




const signup = async (req, res) => {
    const { employeeName, email, phone, password, address, role, updatedAt } = req.body;
    let profilePicture;

    try {
        if (req.file) {
            profilePicture = req.file.path; 
        } else {
            profilePicture = null;
        }
        console.log(profilePicture);
        

        if (!employeeName) {
            return Responses.failResponse(req, res, null, messages.nameIsRequired, 400);
        }
        if (!email || !validator.isEmail(email)) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400);
        }
        if (!address) {
            return Responses.failResponse(req, res, null, messages.addressRequired, 400);
        }
        if (!password || password.length < 6) {
            return Responses.failResponse(req, res, null, messages.passwordRequired, 400);
        }

        const result = await authService.signup(
            employeeName,
            email,
            phone,
            password,
            address,
            role,
            updatedAt,
            profilePicture
        );

        if (result.existingUser) {
            return Responses.failResponse(req, res, null, messages.userAlreadyExists, 400);
        }

        return Responses.successResponse(req, res, {
            employeeName,
            email,
            phone,
            address,
            role,
            updatedAt: result.user.updatedAt,
            profilePicture: result.user.profilePicture, 
        }, messages.signupSuccess, 200);

    } catch (error) {
        console.error('Error during signup:', error); 

        return Responses.errorResponse(req, res, error.message || messages.GENERAL_ERROR, 500);
    }
};





const generateOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await authService.generateAndSaveOtp(email);

        // If email is not registered, return a failure response
        if (result.emailNotRegistered) {
            return Responses.failResponse(req, res, null, messages.emailnotRegister, 400);
        }

        // If maximum OTP attempts are reached and the OTP is still valid, return an error response
        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 429);  // Custom error from generateAndSaveOtp
        }

        // Return the OTP generation success response
        return Responses.successResponse(req, res, { 
            otp: result.otp, 
            otpAttempts: result.otpAttempts, 
            otpExpiry: result.otpExpiry 
        }, messages.OTP_GENERATION_SUCCESS, 200);

    } catch (error) {
        console.error('Error generating OTP:', error);
        return Responses.errorResponse(req, res, new Error(messages.OTP_ERROR), 500, 'Error generating OTP');
    }
};



const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400);
        }

        if (!otp) {
            return Responses.failResponse(req, res, null, messages.otpRequired, 400);
        }

        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return Responses.failResponse(req, res, null, messages.invalidEmailFormat, 400);
        }

        if (!/^\d{6}$/.test(otp)) {
            return Responses.failResponse(req, res, null, messages.invalidOtpFormat, 400);
        }

        const result = await authService.verifyOTP(email, otp);
        console.log(result);
        

        if (!result.success) {
            if (result.invalidOtp) {
                return Responses.failResponse(req, res, null, messages.invalidOtp, 400);
            }
            if (result.message) {
                return Responses.failResponse(req, res, null, result.message, 400);
            }
        }

        if (result.success && result.verified) {
            return Responses.successResponse(req, res, {
                token: result.token,
                role: result.role,
                employeeName:result.employeeName
            }, messages.otpVerificationSuccess, 200);
            
        }

        return Responses.failResponse(req, res, null, messages.otpVerificationFailed, 400);

    } catch (error) {
        console.error('Error during OTP verification:', error);
        return Responses.errorResponse(req, res, error);
    }
};



const verifyOtpAndResetPasswordController = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;

    try {
        const result = await authService.verifyOtpAndResetPassword(email, otp, password, confirmPassword);

        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 400);
        }

        return Responses.successResponse(req, res, result, result.success || messages.passwordResetSuccess, 200);
    } catch (error) {
        console.error('Error in controller:', error);
        return Responses.errorResponse(req, res, error.message || 'Internal server error');
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Validate email input
        if (!email || !email.trim()) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400); // Return error if email is missing
        }

        // Call sendOtp service to generate and send OTP
        const result = await authService.sendOtp(email);

        // Check if the email is already registered
        if (!result.success) {
            if (result.message === 'This email ID is already registered') {
                return Responses.failResponse(req, res, null, messages.emailAlreadyRegistered, 400); // Email is already registered
            } else {
                return Responses.failResponse(req, res, null, result.message, 400); // Handle other errors (e.g., invalid email format)
            }
        }

        // Return success response after OTP is sent successfully
        return Responses.successResponse(req, res, result, messages.otpSentSuccess, 200);

    } catch (error) {
        console.error('Error in OTP request:', error);

        // Default error response for OTP request failure
        return Responses.errorResponse(req, res, new Error(messages.GENERAL_ERROR), 500, 'Error sending OTP');
    }
};


const verifyOtpForSignUP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Validate email and OTP input
        if (!email || !email.trim()) {
            return Responses.failResponse(req, res, null, messages.emailRequired, 400); // Return error if email is missing
        }
        if (!otp || !otp.trim()) {
            return Responses.failResponse(req, res, null, messages.otpRequired, 400); // Return error if OTP is missing
        }

        // Validate email format using regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return Responses.failResponse(req, res, null, messages.invalidEmailFormat, 400); // Return error if email format is invalid
        }

        // Call the verifyOtp service to check if OTP is valid
        const response = await authService.verifyOtpForSignUP(email, otp);

        // If OTP verification fails (could include reasons like expiry or incorrect OTP)
        if (!response.success) {
            return Responses.failResponse(req, res, null, response.message || messages.invalidOtp, 400);
        }

        // Return success response after OTP is successfully verified
        return Responses.successResponse(req, res, response, messages.otpVerifiedSuccess, 200);

    } catch (error) {
        console.error('Error in OTP verification:', error);

        // Default error response for OTP verification failure
        return Responses.errorResponse(req, res, new Error(messages.GENERAL_ERROR), 500, 'Error verifying OTP');
    }
};

const logoutController = async (req, res) => {
    try {
   
        const result = await authService.logoutService(req);

        // Check if result is undefined or null
        if (!result) {
            return Responses.failResponse(req, res, null,messages.internalError, 400);
        }

        // If there's an error in the result, return failure response
        if (result.error) {
            return Responses.failResponse(req, res, null, result.error, 400);
        }
    
        return Responses.successResponse(req, res, result, messages.logoutSuccess , 200);
    } catch (error) {
        console.error('Error in logout controller:', error);
        if (!res.headersSent) {
            return Responses.errorResponse(req, res, error.message , 500);
        }
    }
};

const createEmployee = async (req, res) => {
    try {
        const result = await authService.createEmployee(req.body);
        console.log(result);
        if (result?.isDuplicateEmail) {
            return Responses.failResponse(req, res, null, messages.duplicateEmail, 200);
        }
        return Responses.successResponse(req, res, result, messages.createdSucess, 201);
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error.message);
    }
};



const listEmployee = async (req, res) => {
    try {
      
        const { 
            page = 1, 
            limit = 5, 
            designation, 
            department, 
            unit, 
            updatedAt, 
            order = '-1', 
            includeDeactivated = 'true', 
            searchKey 
        } = req.query;

        // Create a filter object based on query params
        const filters = {};

        // Add filters for designation, department, and unit if provided
        if (designation) filters.designation = designation;
        if (department) filters.department = department;
        if (unit) filters.unit = unit;

       
        if (updatedAt) {
            const date = new Date(updatedAt);
            if (!isNaN(date.getTime())) { 
                filters.updatedAt = { $gte: date }; 
            } else {
                return Responses.errorResponse(req, res, "Invalid date format for 'updatedAt'", 400);
            }
        }

        if (searchKey) {
            filters.$or = [
                { employeeName: { $regex: searchKey, $options: 'i' } },
                { employeeId: { $regex: searchKey, $options: 'i' } },
                { designation: { $regex: searchKey, $options: 'i' } },
                { department: { $regex: searchKey, $options: 'i' } },
                { unit: { $regex: searchKey, $options: 'i' } }
            ];
        }


        const includeDeactivatedFlag = includeDeactivated === 'true';


        const result = await authService.listEmployee(filters, parseInt(page), parseInt(limit), order, includeDeactivatedFlag);

        return Responses.successResponse(req, res, result, messages.fetchedSuccessfully, 200);
    } catch (error) {
        console.log(error);
        return Responses.errorResponse(req, res, error.message);
    }
};



const activateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;  

        if (!employeeId) {
            return Responses.failResponse(req, res, null, 'Employee ID is required', 400);
        }
        const result = await authService.activateEmployee(employeeId);

        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordsNotFound, 404);
        }

        return Responses.successResponse(req, res, result, messages.activated, 200);
    } catch (error) {
        console.error('Error activating employee:', error);
        return Responses.errorResponse(req, res, error);
    }
};

const deactivateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;  
        if (!employeeId) {
            return Responses.failResponse(req, res, null, 'Employee ID is required', 400);
        }
        const result = await authService.deactivateEmployee(employeeId);
        if (!result) {
            return Responses.failResponse(req, res, null, messages.recordsNotFound, 404);
        }

        return Responses.successResponse(req, res, result, messages.deactivated, 200);
    } catch (error) {
        console.error('Error deactivating employee:', error);
        return Responses.errorResponse(req, res, error);
    }
};

const editProfile = async (req, res) => {
    // Destructure the 'id' from req.params
    const { id } = req.params;
    const updateData = req.body;  // Get the fields to update from the request body
    console.log("Updating profile for employee with ID:", id);
    
    try {
      // Call the service to update the profile
      const updatedEmployee = await authService.updateEmployeeProfile(id, updateData);
  
      // Send the success response
      return Responses.successResponse(req, res, updatedEmployee, messages.UPDATED_SUCCESS, 200);
    } catch (err) {
      // Handle errors and send failure response
      return Responses.failResponse(req, res, null, messages.updateDatafail, 404);
    }
  };

  const getEmployeeDetails = async (req, res) => {
    const id = req.params.id; 
  
    try{
      const employee = await authService.getEmployeeById(id);
  
      res.json({
        employeeName: employee.employeeName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        profilePicture: employee.profilePicture,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
  
  const getEmployeeStatus = async (req, res) => {
    const { id } = req.params;
  
    try {
      const status = await authService.getStatus(id);
  
      const statusMessage = status.isActive ? "Status is Active" : "You have been deactivated by Admin";
      
      return Responses.successResponse(req, res, { message: statusMessage, status }, messages.successstaus, 200);
    } catch (error) {

      return Responses.errorResponse(req, res, null, messages.errorstatus, 500);
    }
  };
  
//   const uploadCsv = async (req, res) => {
//     try {
//         const file = req.file; 
//         console.log("file--------", file);
        
//         if (!file) {
//             return Responses.failResponse(req, res, null, messages.FILE_FETCHED_SUCCESS, 404); 
//         }

//         const filePath = path.resolve(__dirname, '../uploads', file.filename);
//         console.log("filePath--------", filePath);

//         // Call the service to process the CSV
//         const results = await authService.processCsv(filePath);
//         console.log("results--------", results);

//         Responses.successResponse(req, res, results, messages.FILE_FETCHED_SUCCESS, 200);
//     } catch (error) {
//         console.log("Error in uploadCsv:", error); // Log error details
//         return Responses.errorResponse(res, error.message);
//     }
// };

const uploadExcel = async (req, res) => {
    try {
        const file = req.file; 
        console.log("file--------", file);
        
        if (!file) {
            return Responses.failResponse(req, res, null, messages.FILE_NOT_FOUND, 404); 
        }

        const filePath = path.resolve(__dirname, '../uploads', file.filename);
        console.log("filePath--------", filePath);

        // Call the service to process the Excel file
        const results = await authService.processExcel(filePath);
        console.log("results--------", results);

        Responses.successResponse(req, res, results, messages.FILE_FETCHED_SUCCESS, 200);
    } catch (error) {
        console.log("Error in uploadExcel:", error); 
        return Responses.errorResponse(res, error.message || messages.GENERAL_ERROR);
    }
};



const downloadFile = (req, res) => {
    const { fileName } = req.params;

    try {
        // Sanitize the filename to prevent directory traversal
        const sanitizedFileName = path.basename(fileName);

        // Get the full file path from your service
        const filePath = authService.getFilePath(sanitizedFileName);

        // Log the file path where the file is located
        console.log('Attempting to download file from path:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return Responses.errorResponse(res, messages.FILE_NOT_FOUND);
        }

        // Trigger the file download
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err.message);
                return Responses.errorResponse(res, err.message || messages.GENERAL_ERROR);
            }
            // Log the success after download completes
            console.log('File downloaded successfully:', sanitizedFileName);
        });

    } catch (error) {
        // Log unexpected errors and return a general error response
        console.error('Unexpected error while processing download:', error.message);
        return Responses.errorResponse(res, error.message || messages.GENERAL_ERROR);
    }
};

// Download File API




  
module.exports = {
    // uploadCsv,
    downloadFile,
    uploadExcel,
    login,
    signup,
    generateOtp,
    verifyOtp,
    verifyOtpAndResetPasswordController,
    sendOtp,
    verifyOtpForSignUP,
    logoutController,
    createEmployee,
    listEmployee,
    activateEmployee,
    deactivateEmployee,
    editProfile,
    getEmployeeDetails,
    getEmployeeStatus

};
