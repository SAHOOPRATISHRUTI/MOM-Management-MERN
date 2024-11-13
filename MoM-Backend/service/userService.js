const OTP = require('../model/otpModel')
const Users = require('../model/userModel')
const bcrypt = require('bcrypt')
const { sendOtpEmail } = require('../eMailsetUp/mailSetUp')

//FUNCTION TO GENERATE A RANDOM 4-DIGIT OTP
const generateOTP = () => {
    Math.floor(1000 + Math.random() * 9000).toString();
}


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
    const user = await Users.findOne({ email });
    if (!user) {
        throw new Error("This email is not valid");
    }

    let otprecord = await OTP.findOne({ email });

    if (otprecord) {
        const timeDiff = (new Date() - new Date(otprecord.createdAt)) / (1000 * 60); // Time difference in minutes

        if (otprecord.attempts >= 3 && timeDiff < 15) {
            // Maximum attempts reached and within the 15-minute window
            throw new Error('Maximum attempts reached. Please try again later.');
        }

        if (timeDiff >= 15) {
            // If more than 15 minutes have passed, reset attempts and generate a new OTP
            otprecord.attempts = 0;
        }

        // Increment attempt count if attempts are less than 3
        otprecord.attempts += 1;

        // If time has expired or attempts need reset, generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a new 6-digit OTP

        otprecord.otp = otp;
        otprecord.createdAt = new Date(); // Reset creation time
        otprecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

        await otprecord.save(); // Save the updated OTP record

        return otp; // Return OTP for testing (only for testing, don't send OTP in production)
    } else {
        // If no OTP exists for the email, generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a new 6-digit OTP
        otprecord = new OTP({
            email,
            otp,
            attempts: 1, // First attempt
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
        });

        await otprecord.save(); // Save the new OTP record

        return otp; // Return OTP for testing (only for testing, don't send OTP in production)
    }
};



const verifyotp = async (email, otp) => {
    const otprecord = await OTP.findOne({ email, otp });
    if (!otprecord) {
        throw new Error('Invalid OTP')
    }
}

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
    verifyotp,
    resetPassword
}