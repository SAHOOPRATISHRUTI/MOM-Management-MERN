const OTP = require('../model/otpModel')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')
const OTP_EXPIRATION_TIME = process.env.OTP_EXPIRATION_TIME || 5 * 60 * 1000; 
const OTP_COOLDOWN_PERIOD = process.env.OTP_COOLDOWN_PERIOD || 15 * 60 * 1000; 
const MAX_REQUESTS = process.env.MAX_REQUESTS || 3; 
const bcrypt = require('bcryptjs');  
const Users = require('../model/userModel'); 
const validator = require('validator');
const crypto = require('crypto');



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



const updatePassword = async (email, newPassword) => {
    // Validate new password (you can add more checks)
    if (typeof newPassword !== 'string') {
        throw new Error('Password should be a string');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find user by email and update the password
    const updatedUser = await Users.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true } // This ensures the updated user object is returned
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return { message: 'Password updated successfully!' };
};



const generateAndSaveOtp = async (email) => {
    // Check if the email exists in the users collection
    const user = await Users.findOne({ email });
    
    if (!user) {
        // If email doesn't exist in the users' database, return error
        return { emailNotRegistered: true };
    }

    const now = Date.now();
    let otpRecord = await OTP.findOne({ email });

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (otpRecord) {
        // Check if OTP expired
        const isExpired = now - otpRecord.expiresAt > 0; // Check if OTP has expired based on expiresAt

        if (isExpired) {
            // OTP expired, reset attempts and set new OTP
            otpRecord.otp = newOtp;
            otpRecord.createdAt = now;  // Reset createdAt
            otpRecord.expiresAt = new Date(now + OTP_EXPIRATION_TIME); // Reset expiresAt
            otpRecord.attempts = 1; // Reset attempts
        } else if (otpRecord.attempts >= MAX_REQUESTS) {
            // Max OTP requests reached
            return { maxOtpReached: true };
        } else {
            // Increment attempts if OTP not expired and not verified
            otpRecord.otp = newOtp;
            otpRecord.attempts += 1;
        }
    } else {
        // If no OTP record found, create a new one
        otpRecord = new OTP({
            email,
            otp: newOtp,
            attempts: 1,
            createdAt: now,
            expiresAt: new Date(now + OTP_EXPIRATION_TIME),  // Set expiry time
        });
    }

    // Save OTP record
    await otpRecord.save();

    // Send OTP via email
    const emailSubject = 'OTP to Verify Your Email to Schedule a Demo with MinutesVault';
    const mailData = `<p>Thank you for your interest. Your OTP is <strong>${otpRecord.otp}</strong>. It will expire in 10 minutes.</p>`;
    await sendOtpEmail(email, emailSubject, mailData);

    // Return OTP details
    return { otp: otpRecord.otp, attempts: otpRecord.attempts, otpSent: true };
};



const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp) {
            return { success: false, message: 'Email and OTP are required' };
        }

        // Find the OTP record for the email
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return { success: false, message: 'No OTP record found for this email' };
        }

        const currentTime = Date.now();

        // Check if OTP has expired
        if (currentTime - otpRecord.expiresAt > 0) {  // Using expiresAt for expiry check
            await OTP.deleteOne({ email });
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return { success: false, invalidOtp: true, message: 'Invalid OTP' };
        }

        // OTP is valid
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = currentTime;
        await otpRecord.save();

        return { success: true, verified: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: error.message || 'Internal server error' };
    }
};




const resetPassword = async (email, otp, password, nwpassword) => {
    // Ensure that both password and new password are strings
    if (typeof password !== 'string') {
        password = String(password);
    }
    if (typeof nwpassword !== 'string') {
        nwpassword = String(nwpassword);
    }

    try {
        // Find the user by email
        const user = await Users.findOne({ email });
        if (!user) {
            throw new Error(messages.userNotFound); // Use predefined message
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            throw new Error(messages.invalidOTP); // Use predefined message
        }

        // Check if new passwords match
        if (password !== nwpassword) {
            throw new Error(messages.passwordMismatch); // Use predefined message
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(nwpassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return messages.passwordResetSuccess; // Use predefined success message
    } catch (error) {
        // Throw the error to be handled by the controller
        throw new Error(error.message || messages.passwordUpdateFailed); // Use predefined message
    }
};


const sendOtp = async (email) => {
    try {
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Get the current date and time for OTP expiry (10 minutes from now)
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);  // Expiry in 10 minutes

        // Find if an OTP record already exists for the given email
        let otpRecord = await OTP.findOne({ email });

        if (otpRecord) {
            // If OTP exists, reset OTP attempts and update expiry time
            otpRecord.otp = otp;
            otpRecord.otpExpiry = otpExpiry;
            otpRecord.attempts += 1; // Reset OTP attempts
        } else {
            // If no OTP record exists, create a new one
            otpRecord = new OTP({
                email,
                otp,
                otpExpiry,
                attempts: 0,  // Start with 0 OTP attempts
            });
        }

        // Save or update the OTP record in the OTP schema
        await otpRecord.save();

        // Send OTP via email
        const emailSubject = 'Your OTP Code';
        const mailData = `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`;
        
        // Use your existing sendOtpEmail function to send the OTP email
        await sendOtpEmail(email, emailSubject, mailData);

        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
};

const verifyOtpforLogin = async (email, otpInput) => {
    try {
        // Find the OTP record for the given email
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            // If no OTP record found for the email
            throw new Error('OTP record not found for this email');
        }

        // Check if the OTP has expired
        const currentTime = new Date();
        if (currentTime > otpRecord.otpExpiry) {
            throw new Error('OTP has expired');
        }

        // Check if the entered OTP matches the stored OTP
        if (otpRecord.otp !== otpInput) {
            // If OTP doesn't match, increment the attempt count
            otpRecord.attempts += 1;
            await otpRecord.save();

            // If attempts exceed limit (e.g., 3 attempts), lock the OTP for this email
            if (otpRecord.attempts >= 3) {
                throw new Error('Too many incorrect attempts. Please request a new OTP.');
            }

            throw new Error('Invalid OTP');
        }

        // If OTP is valid, reset OTP attempts and mark the user as verified
        otpRecord.attempts = 0;  // Reset attempts after successful OTP
        otpRecord.isVerified = true;  // Mark the OTP record as verified
        await otpRecord.save();

        // Optionally, update user verification status here (if you have a User schema)
        const Otp = await OTP.findOne({ email });
        if (Otp) {
            Otp.isVerified = true; // Optionally mark user as verified in the User schema
            await Otp.save();
        }

        return { success: true, message: 'OTP verified successfully' };

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, message: error.message || 'Failed to verify OTP' };
    }
};


module.exports = {
    login,
    signup,
    generateAndSaveOtp,
    verifyOTP,
    resetPassword,
    updatePassword,
    sendOtp,
    verifyOtpforLogin
}