const OTP = require('../model/otpModel')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;  
const MAX_REQUESTS = 3; 

const bcrypt = require('bcryptjs');  
const Users = require('../model/userModel'); 
const validator = require('validator');




const login = async (email, password) => {
   
    if (typeof password !== 'string') {
        password = String(password);  
    }

    const user = await Users.findOne({ email });
    
    if (!user) {
        throw new Error('Invalid email address. Please register first.');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
        throw new Error('Incorrect password. Please try again.');
    }
    return user;  
}


const signup = async (name,  email,phone,password, address,role,otp ) => {

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

    
    const existingUser = await Users.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        throw new Error('User already exists with the given email or mobile number');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
        name,  email,phone,password: hashedPassword, address,role,otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        
    });

    await newUser.save();

    
    return {
        message: 'User registered successfully!',
        user: {
            name: newUser.name,
            mobile: newUser.phone,
            email: newUser.email,
            address: newUser.address
        }
    };
};






const generateAndSaveOtp = async (email) => {
    // Check if the email exists in the users collection
    const user = await Users.findOne({ email });

    if (!user) {
        // If email doesn't exist in the users' database, return error
        return { emailNotRegistered: true };
    }

    const now = Date.now();  // Get the current timestamp
    let otpRecord = await Users.findOne({ email });  // Fetch OTP record from the database

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (otpRecord) {
        // Ensure expiresAt is a valid Date object or convert it to a timestamp
        const expiresAt = otpRecord.expiresAt ? otpRecord.expiresAt.getTime() : null;

        // Check if OTP expired
        const isExpired = expiresAt && now > expiresAt;  // Check expiration if expiresAt exists

        if (isExpired) {
            // OTP expired, reset attempts and set new OTP
            otpRecord.otp = newOtp;
            otpRecord.createdAt = now;  // Reset createdAt
            otpRecord.expiresAt = new Date(now + OTP_EXPIRATION_TIME);  // Reset expiresAt
            otpRecord.otpAttempts = 1;  // Reset OTP attempts
        } else if (otpRecord.otpAttempts >= MAX_REQUESTS) {
            // Max OTP requests reached
            return { maxOtpReached: true };
        } else {
            // Increment attempts if OTP not expired and not verified
            otpRecord.otp = newOtp;
            otpRecord.otpAttempts += 1;
        }
    } else {
        // If no OTP record found, create a new one
        otpRecord = new OTP({
            email,
            otp: newOtp,
            otpAttempts: 1,
            createdAt: now,
            expiresAt: new Date(now + OTP_EXPIRATION_TIME),  // Set expiry time
        });
    }

    // Save OTP record
    await otpRecord.save();

    // Send OTP via email
    const emailSubject = 'OTP to Verify Your Email';
    const mailData = `<p>Your OTP is <strong>${otpRecord.otp}</strong>. It will expire in 10 minutes.</p>`;
    await sendOtpEmail(email, emailSubject, mailData);

    // Return OTP details
    return { otp: otpRecord.otp, otpAttempts: otpRecord.otpAttempts, otpSent: true };
};



const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp) {
            return { success: false, message: 'Email and OTP are required' };
        }

        // Find the OTP record for the email using the Users model
        const otpRecord = await Users.findOne({ email });
        if (!otpRecord) {
            return { success: false, message: 'No OTP record found for this email' };
        }

        const currentTime = Date.now();

        // Ensure expiresAt is a valid Date object or convert it to a timestamp
        const expiresAt = otpRecord.expiresAt ? otpRecord.expiresAt.getTime() : null;

        // Check if OTP has expired using expiresAt
        if (expiresAt && currentTime > expiresAt) {  // Ensure expiresAt exists before checking
            await OTP.deleteOne({ email });  // Delete expired OTP record
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }

        // Check if OTP has exceeded maximum attempts (e.g., 3 attempts)
        if (otpRecord.otpAttempts >= 3) {
            // Reset OTP after 30 minutes (1800000 ms)
            const resetTime = otpRecord.otpAttemptResetTime ? otpRecord.otpAttemptResetTime.getTime() : null;
            
            // If 30 minutes have passed, reset OTP attempts and allow another OTP verification
            if (resetTime && currentTime - resetTime > 1800000) {  // 30 minutes in ms
                otpRecord.otpAttempts = 0;  // Reset OTP attempts
                otpRecord.otpAttemptResetTime = currentTime;  // Set reset time
                await otpRecord.save();
            } else {
                return { success: false, message: 'Maximum OTP attempts reached. Please try again after 30 minutes.' };
            }
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp) {
            otpRecord.otpAttempts += 1;  // Increment OTP attempts
            otpRecord.otpAttemptResetTime = currentTime;  // Update reset time when a wrong OTP is entered
            await otpRecord.save();  // Save updated attempts count
            return { success: false, invalidOtp: true, message: 'Invalid OTP' };
        }

        // OTP is valid, update verification status
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = currentTime;
        otpRecord.otpAttempts = 0;  // Reset OTP attempts after successful verification
        await otpRecord.save();

        return { success: true, verified: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: error.message || 'Internal server error' };
    }
};


const verifyOtpAndResetPassword = async (email, otp, password) => {
    try {
     
      const employee = await Users.findOne({ email });
  
      if (!employee) {
        throw new Error('Employee not found');
      }
  
      
      if (employee.otp !== otp) {
        throw new Error('Invalid OTP');
      }
  
      if (employee.otpExpiry < Date.now()) {
        throw new Error('OTP has expired');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      
      employee.password = hashedPassword;
      employee.isVerified = true; 
      employee.otp = null; 
      employee.otpAttempts = 0; 
      employee.otpExpiry = null; 
  
     
      await employee.save();
  
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(error.message || 'An error occurred while resetting password');
    }
  };


const sendOtp = async (email) => {
    try {
        // Validate email format using regular expression
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Invalid email format' }; // Invalid email format
        }

        // Check if the email is already registered in the Users collection
        const user = await Users.findOne({ email });
        if (user) {
            return { success: false, message: 'This email ID is already registered' }; // Email is already registered
        }

        // Check if OTP record already exists for the given email
        const otpRecord = await OTP.findOne({ email });

        if (otpRecord) {
            // If an OTP record exists, check if OTP has expired
            const currentTime = Date.now();
            if (otpRecord.otpExpiry < currentTime) {
                // OTP expired, reset it and generate a new one
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiry = new Date();
                otpExpiry.setMinutes(otpExpiry.getMinutes() + 1);  // Set new expiry time

                otpRecord.otp = otp;
                otpRecord.otpExpiry = otpExpiry;
                otpRecord.attempts = 0;  // Reset attempts
                await otpRecord.save();  // Save updated OTP record

                // Send new OTP via email
                const emailSubject = 'Your OTP Code';
                const mailData = `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`;
                await sendOtpEmail(email, emailSubject, mailData);

                return { success: true, message: 'OTP has expired. A new OTP has been sent to your email' };
            } else {
                return { success: false, message: 'An OTP has already been sent. Please wait for it to expire' };
            }
        } else {
            // If no OTP record exists, create a new one
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 1);  // Set expiry in 10 minutes

            const newOtpRecord = new OTP({
                email,
                otp,
                otpExpiry,
                attempts: 0,  // Start with 0 OTP attempts
            });

            // Save the new OTP record
            await newOtpRecord.save();

            // Send OTP via email
            const emailSubject = 'Your OTP Code';
            const mailData = `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`;
            await sendOtpEmail(email, emailSubject, mailData);

            return { success: true, message: 'OTP sent successfully' };
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
};


const verifyOtpforLogin = async (email, otp) => {
    try {
        if (!email || !otp) {
            return { success: false, message: 'Email and OTP are required' };
        }

        // Find the OTP record for the email
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
            return { success: false, invalidOtp: true, message: 'Invalid OTP' };
        }

        // OTP is valid, update verification status
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = currentTime;
        otpRecord.otp = null;  // Clear the OTP after successful verification
        otpRecord.otpExpiry = null;  // Clear the OTP expiry after successful verification
        await otpRecord.save();  // Save the updated OTP record

        return { success: true, verified: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: error.message || 'Internal server error' };
    }
};

module.exports = {
    login,
    signup,
    generateAndSaveOtp,
    verifyOTP,
    sendOtp,
    verifyOtpforLogin,verifyOtpAndResetPassword
}