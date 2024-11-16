const OTP = require('../model/otpModel')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;  
const MAX_REQUESTS = 3; 
const MAX_OTP_ATTEMPTS =3;
const bcrypt = require('bcryptjs');  
const Users = require('../model/userModel'); 
const validator = require('validator');
const messages = require('../constants/constMessage');



const login = async (email, password) => {
   
    const user = await Users.findOne({ email });//check this email id present or not

    if (!user) {
        throw new Error(messages.registerplz); // if not register send this msg in console
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
        throw new Error(messages.incorrectPassword);//checkpassword is correct or not
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
    const user = await Users.findOne({ email });

    if (!user) {
        return { emailNotRegistered: true };
    }

    const now = Date.now(); 
    let otpRecord = await Users.findOne({ email });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

   
    if (!otpRecord) {
        otpRecord = new OTP({
            email,
            otp: newOtp,
            otpAttempts: 1,
            createdAt: now,
            otpExpiry: new Date(now + OTP_EXPIRATION_TIME),  
        });
    } else {
        // If otpExpiry is missing or expired, reset OTP and set new expiry time
        const otpExpiryTime =new Date(now + OTP_EXPIRATION_TIME)
        console.log(otpExpiryTime);
        
        
        // If OTP attempts exceed the max or OTP is expired, reset OTP
        if (otpRecord.otpAttempts >= MAX_REQUESTS ) {
            otpRecord.otp = newOtp;
            otpRecord.createdAt = now;
            otpRecord.otpExpiry = otpExpiryTime;  // New expiry time
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

    return { otp: otpRecord.otp, otpAttempts: otpRecord.otpAttempts, otpSent: true, otpExpiry:otpRecord.otpExpiry };
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

const verifyOtpAndResetPassword = async (email, otp, password, confirmPassword) => {
    try {
        // Check if email is provided
        if (!email) {
            return { emailNotFound: true };
        }

        // Check if password or confirmPassword is provided
        if (!password || !confirmPassword) {
            return { passwordRequired: true };
        }

        // Check if the password and confirmPassword match
        if (password !== confirmPassword) {
            return { error: messages.passwordMismatch };
        }

        console.log('New Password (Plain):', password);

        // Find the user by email
        const user = await Users.findOne({ email });
        
        // Check if user exists
        if (!user) {
            return { emailNotFound: true };
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

        const user = await Users.findOne({ email });
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

            return { success: true, email:newOtpRecord.email,otp:newOtpRecord.otp,attempts:newOtpRecord.attempts,otpExpiry:newOtpRecord.otpExpiry };
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


module.exports = {
    login,
    signup,
    generateAndSaveOtp,
    verifyOTP,
    sendOtp,
    verifyOtpForSignUP,
    verifyOtpAndResetPassword
}