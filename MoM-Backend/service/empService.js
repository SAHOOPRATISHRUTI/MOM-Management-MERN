const OTP = require('../model/otpModel')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
const MAX_REQUESTS = 3;
const MAX_OTP_ATTEMPTS = 3;
const bcrypt = require('bcryptjs');
const EmployeeUser = require('../model/employeeModel');
const validator = require('validator');
const messages = require('../constants/constMessage');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose')
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); 





const login = async (email, password) => {
    const user = await EmployeeUser.findOne({ email });

    if (!user) {
        return { emailNotRegistered: true };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return { invalidPassword: true };
    }

    const token = jwt.sign(
        {
            id: user._id, email: user.email,
            employeeName: user.employeeName,
            email: user.email,
            phone: user.phone,
            address: user.address,
        },
        process.env.JWT_USER_SECRET,
        { expiresIn: '1h' }
    );

    return {
        id: user._id,
        employeeName: user.employeeName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profilePicture: user.profilePicture,
        token
    };
};



const signup = async (employeeName, email, phone, password, address, role, otp, profilePicture) => {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }

    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(phone)) {
        throw new Error('Invalid mobile number format');
    }
    if (typeof password !== 'string') {
        password = String(password);
    }
    if (password.length < 6) {
        throw new Error('Password should be at least 6 characters long');
    }
    const existingUser = await EmployeeUser.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        throw new Error('User already exists with the given email or mobile number');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpExpiry = Date.now() + 10 * 60 * 1000;


    const newUser = new EmployeeUser({
        employeeName,
        email,
        phone,
        password: hashedPassword,
        role,
        address,
        otp,
        profilePicture: profilePicture,
        otpExpiry,
    });

    try {
        await newUser.save();
    } catch (error) {
        throw new Error('Error saving user to the database: ' + error.message);
    }

    return {
        message: 'User registered successfully!',
        user: {
            employeeName: newUser.employeeName,
            phone: newUser.phone,
            email: newUser.email,
            address: newUser.address,
            role: newUser.role,
            updatedAt: newUser.updatedAt,
            profilePicture: newUser.profilePicture,
        },
    };
};


const generateAndSaveOtp = async (email) => {
    const user = await EmployeeUser.findOne({ email });

    if (!user) {
        return { emailNotRegistered: true };
    }

    const now = Date.now();
    let otpRecord = await EmployeeUser.findOne({ email });  // Make sure OTP is queried from the OTP collection

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // If OTP record doesn't exist, create a new one
    if (!otpRecord) {
        otpRecord = new user({
            email,
            otp: newOtp,
            otpAttempts: 1,
            createdAt: now,
            otpExpiry: new Date(now + OTP_EXPIRATION_TIME),
        });
    } else {
        // If OTP attempts exceed the max or OTP is expired, reset OTP
        const otpExpiryTime = new Date(now + OTP_EXPIRATION_TIME);

        // Check if OTP attempts are more than the max allowed and OTP is still valid
        if (otpRecord.otpAttempts >= MAX_REQUESTS && otpRecord.otpExpiry > now) {
            return { error: 'OTP has been sent 3 times, Please try again later.' };
        }

        // If OTP has expired or attempts have been reset, generate a new OTP
        if (otpRecord.otpAttempts >= MAX_REQUESTS || otpRecord.otpExpiry <= now) {
            otpRecord.otp = newOtp;
            otpRecord.createdAt = now;
            otpRecord.otpExpiry = otpExpiryTime;
            otpRecord.otpAttempts = 1;  // Reset attempts
        } else {
            // Otherwise, increment attempts if OTP is still valid
            otpRecord.otp = newOtp;
            otpRecord.otpExpiry = otpExpiryTime;
            otpRecord.otpAttempts += 1;
        }
    }

    await otpRecord.save();
    console.log("OTP Expiry: ", otpRecord.otpExpiry);

    // Send OTP via email
    const emailSubject = 'OTP to Verify Your Email';
    const mailData = `<p>Your OTP is <strong>${otpRecord.otp}</strong>. It will expire in 10 minutes.</p>`;
    await sendOtpEmail(email, emailSubject, mailData);

    const localOtpExpiry = otpRecord.otpExpiry.toLocaleString();
    const localCreatedAt = otpRecord.createdAt.toLocaleString();
    const localUpdatedAt = otpRecord.updatedAt.toLocaleString();

    console.log("Local OTP Expiry: ", localOtpExpiry);
    console.log("Local Created At: ", localCreatedAt);
    console.log("Local Updated At: ", localUpdatedAt);

    return { otp: otpRecord.otp, otpAttempts: otpRecord.otpAttempts, otpSent: true, otpExpiry: otpRecord.otpExpiry };

};



const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp) {
            return { success: false, message: 'Email and OTP are required' };
        }

        const otpRecord = await EmployeeUser.findOne({ email });
        if (!otpRecord) {
            return { success: false, message: 'No OTP record found for this email' };
        }

        const currentTime = Date.now();
        const expiresAt = otpRecord.expiresAt ? otpRecord.expiresAt.getTime() : null;

        if (expiresAt && currentTime > expiresAt) {
            await OTP.deleteOne({ email });
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }

        if (otpRecord.otpAttempts >= 3) {
            const resetTime = otpRecord.otpAttemptResetTime ? otpRecord.otpAttemptResetTime.getTime() : null;
            if (resetTime && currentTime - resetTime > 1800000) {
                otpRecord.otpAttempts = 0;
                otpRecord.otpAttemptResetTime = currentTime;
                await otpRecord.save();
            } else {
                return { success: false, message: 'Maximum OTP attempts reached. Please try again after 30 minutes.' };
            }
        }


        if (otpRecord.otp !== otp) {
            otpRecord.otpAttempts += 1;
            otpRecord.otpAttemptResetTime = currentTime;
            await otpRecord.save();
            return { success: false, invalidOtp: true, message: 'Invalid OTP' };
        }

        otpRecord.isVerified = true;
        otpRecord.verifiedAt = currentTime;
        otpRecord.otpAttempts = 0;
        await otpRecord.save();


        const payload = {
            email: otpRecord.email,
            userId: otpRecord._id,
            role: otpRecord.role,
            employeeName: otpRecord.employeeName
        };
        const token = jwt.sign(payload, process.env.JWT_USER_SECRET, { expiresIn: '1h' });
        const role = otpRecord.role;
        const employeeName = otpRecord.employeeName
        return { success: true, verified: true, message: 'OTP verified successfully', token, role, employeeName };
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: error.message || 'Internal server error' };
    }
};


const verifyOtpAndResetPassword = async (email, otp, password, confirmPassword) => {
    try {
        // Check if email is provided
        if (!email) {
            return { error: messages.emailRequired };
        }

        // Check if password or confirmPassword is provided
        if (!password || !confirmPassword) {
            return { error: messages.passwordRequired };
        }

        // Check if the password and confirmPassword match
        if (password !== confirmPassword) {
            return { error: messages.passwordMismatch };
        }

        console.log('New Password (Plain):', password);

        // Find the user by email
        const user = await EmployeeUser.findOne({ email });

        // Check if user exists
        if (!user) {
            return { error: messages.emailNotFound };
        }

        console.log('User found:', user); // Debugging: Check user object

        // Check if the OTP matches
        if (user.otp !== otp) {
            return { error: messages.invalidOtp };
        }

        // Check if OTP is expired
        if (user.otpExpiry < Date.now()) {
            return { error: messages.otpExpired };
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Hashed Password:', hashedPassword); // Debugging: Check the hashed password

        // Ensure hashed password is valid
        if (!hashedPassword) {
            return { error: messages.passwordHashError };
        }

        // Update the user fields
        user.password = hashedPassword;
        user.isVerified = true;
        user.otp = null;
        user.otpAttempts = 0;
        user.otpExpiry = null;

        // Save the updated user data
        const updatedUser = await user.save();

        // Check if the save operation was successful
        if (!updatedUser) {
            return { error: messages.passwordUpdateFailed };
        }

        console.log('Updated User:', updatedUser); // Debugging: Check the updated user object

        // Return success message
        return { success: messages.passwordResetSuccess };

    } catch (error) {
        console.error('Error during password reset:', error); // Log the error to see more details
        return { error: error.message || messages.passwordResetError };
    }
};


const sendOtp = async (email) => {
    try {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Invalid email format' };
        }

        const user = await EmployeeUser.findOne({ email });
        if (user) {
            return { success: false, message: 'This email ID is already registered' }; d
        }


        const otpRecord = await OTP.findOne({ email });

        if (otpRecord) {

            const currentTime = Date.now();
            if (otpRecord.otpExpiry < currentTime) {

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiry = new Date();
                otpExpiry.setMinutes(otpExpiry.getMinutes() + 1);

                otpRecord.otp = otp;
                otpRecord.otpExpiry = otpExpiry;
                otpRecord.attempts = 0;
                await otpRecord.save();

                const emailSubject = 'Your OTP Code';
                const mailData = `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`;
                await sendOtpEmail(email, emailSubject, mailData);

                return { success: true, message: 'OTP has expired. A new OTP has been sent to your email' };
            } else {
                return { success: false, message: 'An OTP has already been sent. Please wait for it to expire' };
            }
        } else {

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 1);

            const newOtpRecord = new OTP({
                email,
                otp,
                otpExpiry,
                attempts: 0,
            });


            await newOtpRecord.save();

            // Send OTP via email
            const emailSubject = 'Your OTP Code';
            const mailData = `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`;
            await sendOtpEmail(email, emailSubject, mailData);

            return { success: true, email: newOtpRecord.email, otp: newOtpRecord.otp, attempts: newOtpRecord.attempts, otpExpiry: newOtpRecord.otpExpiry };
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
};


const verifyOtpForSignUP = async (email, otp) => {

    try {

        if (!email || !otp) {
            return { success: false, message: 'Email and OTP are required' };
        }


        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return { success: false, message: 'No OTP record found for this email' };
        }

        // Check if OTP and otpExpiry are set in the record
        if (!otpRecord.otp || !otpRecord.otpExpiry) {
            return { success: false, message: 'OTP or OTP expiry is missing in the record' };
        }

        // Check if OTP has expired
        const currentTime = Date.now();
        if (otpRecord.otpExpiry < currentTime) {
            return { success: false, message: 'OTP has expired' };
        }

        // Compare OTP from request with stored OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;  // Increment OTP attempts on failure
            await otpRecord.save();    // Save the updated attempts count

            if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
                return { success: false, message: 'Maximum OTP attempts reached. Please try again later.' };
            }

            return { success: false, invalidOtp: true, message: 'Invalid OTP' };
        }

        // OTP is valid, update verification status
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = currentTime;
        otpRecord.otp = null;  // Clear the OTP after successful verification
        otpRecord.otpExpiry = null;  // Clear the OTP expiry after successful verification
        otpRecord.attempts = 0; // Reset attempts on successful verification
        await otpRecord.save();  // Save the updated OTP record

        return { success: true, verified: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: error.message || 'Internal server error' };
    }
};

const logoutService = (req) => {
    return new Promise((resolve, reject) => {
        try {
            // Check if the session exists
            if (!req.session) {
                console.log('Session does not exist.');
                return resolve({ error: 'Session not found.' });
            }

            // If a token exists, nullify it
            if (req.session.token) {
                req.session.token = null;
                console.log('Token removed from session.');
            }

            // Destroy the session to log the user out
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return resolve({ error: 'Failed to logout. Session destruction error.' });
                }


                resolve({ message: 'Logout successful. Session cleared.' });
            });
        } catch (error) {
            console.error('Error during logout operation:', error);
            reject({ error: 'Internal server error during logout.' });
        }
    });
};

const createEmployee = async (data) => {
    try {
        if (!data.email) {
            throw new Error('Email is required');
        }

        const emailDetails = await checkDuplicateEmail(data.email);

        if (emailDetails) {
            return { isDuplicateEmail: true };
        }

        const inputData = {
            employeeName: data.employeeName,
            employeeId: data.employeeId,
            email: data.email,
            designation: data.designation,
            department: data.department,
            unit: data.unit,
        };

        const empData = new EmployeeUser(inputData);
        const result = await empData.save();
        return result;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw new Error('Error creating employee');
    }
}


const checkDuplicateEmail = async (email) => {
    try {
        const employee = await EmployeeUser.findOne(
            { email, isActive: true },
            { _id: 1, email: 1, employeeName: 1, isActive: 1 }
        );
        return employee;
    } catch (error) {
        console.error('Error checking duplicate email:', error);
        throw new Error('Error checking duplicate email');
    }
}

const listEmployee = async (filters = {}, page = 1, limit = 10, order = '1', includeDeactivated = false) => {
    try {
        const skip = (page - 1) * limit;

        const query = includeDeactivated ? filters : { isActive: true, ...filters };


        let sortOrder = 1;
        if (order === '-1') {
            sortOrder = -1;
        }

        const employeeData = await EmployeeUser.find(query)
            .skip(skip)
            .limit(limit)
            .select('_id employeeName employeeId email designation department unit isActive profilePicture updatedAt')
            .sort({ updatedAt: sortOrder });


        const totalEmployees = await EmployeeUser.countDocuments(query);

        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalEmployees / limit);

        return {
            currentPage: page,
            totalPages: totalPages,
            totalEmployees: totalEmployees,
            employeeData: employeeData,
        };
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw new Error('Error fetching employees');
    }
};

const verifyEmployee = async (employeeId) => {
    try {
        return await EmployeeUser.findOne(
            { employeeId: employeeId },
            {
                _id: 1,
                email: 1,
                employeeName: 1,
                employeeId: 1,
                designation: 1,
                department: 1,
                unit: 1,
            }
        );
    } catch (error) {
        console.error('Error verifying employee:', error);
        throw new Error('Error verifying employee');
    }
}

const activateEmployee = async (employeeId) => {
    const result = await EmployeeUser.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(employeeId) },
        { $set: { isActive: true } },
        { new: true }
    );
    return result;
};

const deactivateEmployee = async (employeeId) => {
    const result = await EmployeeUser.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(employeeId) },
        { $set: { isActive: false } },
        { new: true }
    );
    return result;
};

const updateEmployeeProfile = async (id, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid EmployeeId');
        }


        const updatedEmployee = await EmployeeUser.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updateData },
            { new: true, runValidators: true }
        );


        if (!updatedEmployee) {
            throw new Error('Employee not found');
        }

        return updatedEmployee;
    } catch (err) {
        console.error('Error updating employee profile:', err.message);
        throw new Error(err.message);
    }
};


const getEmployeeById = async (id) => {
    try {
        const employee = await EmployeeUser.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    } catch (error) {
        throw new Error(error.message || 'Error fetching employee');
    }
};

const getStatus = async (id) => {
    try {
        const employee = await EmployeeUser.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return { isActive: employee.isActive };
    } catch (error) {
        console.error('Error in getStatus:', error.message);
        throw new Error(error.message || 'Error getting status');
    }
};






const processExcel = async (filePath) => {
    const results = [];
    const skippedData = [];

    return new Promise((resolve, reject) => {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            Promise.all(
                sheetData.map(async (data) => {
                    if (data.password) {
                        const hashedPassword = await bcrypt.hash(data.password, 10);
                        data.password = hashedPassword;
                    }

                    const existingUser = await EmployeeUser.findOne({ email: data.email });
                    if (existingUser) {
                        data.skippedReason = 'User mail id already exists';
                        skippedData.push(data);
                        return;
                    }

                    results.push(data);
                })
            )
                .then(async () => {
                    if (results.length > 0) {
                        try {
                            const insertedData = await EmployeeUser.insertMany(results);

                            const skippedSheet = xlsx.utils.json_to_sheet(skippedData);
                            const newWorkbook = xlsx.utils.book_new();
                            xlsx.utils.book_append_sheet(newWorkbook, skippedSheet, 'Skipped Data');

                            const fileDirectory = path.dirname(filePath);
                            const skippedFileName = `${path.basename(filePath, '.xlsx')}_skipped.xlsx`;
                            const skippedFilePath = path.join(fileDirectory, skippedFileName);

                            xlsx.writeFile(newWorkbook, skippedFilePath);

                            skippedData.forEach((item) => {
                                item.skippedFilePath = skippedFilePath;
                            });

                            resolve({
                                insertedData,
                                skippedData,
                                skippedFilePath,
                                message: 'The skipped file is ready for download.',
                            });
                        } catch (dbError) {
                            reject(`Failed to save data to the database: ${dbError.message}`);
                        }
                    } else {
                        reject('No valid data found in the Excel file');
                    }
                })
                .catch((error) => {
                    reject(`Error processing rows: ${error.message}`);
                })
                .finally(() => {
                    fs.unlinkSync(filePath);
                });
        } catch (error) {
            reject(`Error processing Excel file: ${error.message}`);
        }
    });
};


const getFilePath = (fileName) => {
    const filePath = path.join(__dirname, '../uploads', fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
    }
    return filePath;
};




// for upload text file
// const processCsv = async (filePath) => {
//     const results = [];
    
//     return new Promise((resolve, reject) => {
//         const fileStream = fs.createReadStream(filePath);
        
//         let rawData = ''; 

  
//         fileStream.on('data', (chunk) => {
//             rawData += chunk.toString(); // Accumulate data as text
//         });

//         fileStream.on('end', async () => {
//             // Split the data into lines
//             const lines = rawData.split('\n').filter(line => line.trim() !== ''); // Ignore empty lines
//             const parsedData = {};

//             lines.forEach(line => {
//                 const [key, value] = line.split(':').map(part => part.trim()); // Split by ':'
//                 if (key && value) {
//                     parsedData[key] = value;
//                 }
//             });

//             console.log("Parsed key-value pairs:", parsedData);

//             // Handle password hashing asynchronously
//             if (parsedData.password) {
//                 try {
//                     parsedData.password = await bcrypt.hash(parsedData.password, 10);
//                 } catch (err) {
//                     return reject(`Error hashing password: ${err.message}`);
//                 }
//             }

//             results.push(parsedData);

//             // Insert into the database if results are populated
//             if (results.length > 0) {
//                 try {
//                     const insertedData = await EmployeeUser.insertMany(results);
//                     console.log("Inserted Data:", insertedData);
//                     resolve(insertedData);
//                 } catch (dbError) {
//                     reject(`Failed to save data to the database: ${dbError.message}`);
//                 }
//             } else {
//                 reject('No valid data found in the file.');
//             }

//             // Cleanup: remove the file after processing
//             fs.unlinkSync(filePath);
//         });

//         fileStream.on('error', (error) => {
//             reject(`Error reading file: ${error.message}`);
//         });
//     });
// };


module.exports = {
    // processCsv,
    getFilePath,
    processExcel,
    login,
    signup,
    generateAndSaveOtp,
    verifyOTP,
    sendOtp,
    verifyOtpForSignUP,
    verifyOtpAndResetPassword,
    logoutService,
    createEmployee,
    listEmployee,
    activateEmployee,
    deactivateEmployee,
    updateEmployeeProfile,
    getEmployeeById,
    getStatus
}