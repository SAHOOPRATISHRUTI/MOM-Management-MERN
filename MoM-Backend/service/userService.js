const OTP = require('../model/otpModel')
const Users = require('../model/userModel')
const bcrypt = require('bcrypt')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')

const OTP_EXPIRATION_TIME = process.env.OTP_EXPIRATION_TIME || 5 * 60 * 1000; // 5 minutes by default
const OTP_COOLDOWN_PERIOD = process.env.OTP_COOLDOWN_PERIOD || 15 * 60 * 1000; // 15 minutes by default
const MAX_REQUESTS = process.env.MAX_REQUESTS || 3; // Max 3 requests by default



//FUNCTION TO LOGIN USING EMAIL & PASSWORD
const login = async (email, password) => {
    if (typeof password !== 'string') {
        password = String(password); // Ensure password is a string
    }

    // Find the user by email
    const user = await Users.findOne({ email });

    // If user does not exist, throw an error for incorrect email
    if (!user) {
        throw new Error('Invalid email address. Please register first.');
    }

    // If password is incorrect, throw an error for incorrect password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error('Incorrect password. Please try again.');
    }

    return user;  // Return user if email and password are correct
}


const signup = async (name, email, password) => {
    if (typeof password !== 'string') {
        password = String(password) //ENSURE THAT PASSWORD IS STRING
    }

    const exitingUser = await Users.findOne({ email })
    if (exitingUser) {
        throw new Error('User Already Exists')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = new Users({ name, email, password: hashPassword })
    await newUser.save()

}

const generateAndSaveOtp = async (email) => {
    // Check if the email exists in the users collection
    const user = await Users.findOne({ email });
    
    if (!user) {
        // If email doesn't exist in users' database, return error
        return { emailNotRegistered: true, };
    }

    const now = Date.now();
    let otpRecord = await OTP.findOne({ email });

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (otpRecord) {
        const isExpired = now - otpRecord.createdAt > OTP_EXPIRATION_TIME; // Check if OTP expired
        const currentTime = Date.now();

        if (isExpired) {
            // OTP expired, reset attempts and set new OTP
            otpRecord.otp = newOtp;
            otpRecord.createdAt = currentTime;
            otpRecord.attempts = 1;
        
        } else if (otpRecord.attempts >= MAX_REQUESTS) {
            // Max OTP requests reached
            return { maxOtpReached: true };
        } else {
            // Increment attempts if not expired and not verified
            otpRecord.otp = newOtp;
            otpRecord.attempts += 1;
        }
    } else {
        // If no OTP record found, create new one
        otpRecord = new OTP({
            email,
            otp: newOtp,
            attempts: 1,
            createdAt: now,
            expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
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
        if (currentTime - otpRecord.createdAt > OTP_EXPIRATION_TIME) {
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


module.exports = {
    login,
    signup,
    generateAndSaveOtp,
    verifyOTP,
    resetPassword
}