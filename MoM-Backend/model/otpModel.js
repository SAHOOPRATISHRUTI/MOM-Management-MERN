const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
      
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: { 
        type: Date 
    }, 
    otpExpiry: { 
        type: Date,  // Field to store the OTP expiry time
       
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },  
    attempts: {
        type: Number,
        default: 0
    },  
}, {
    timestamps: true  // Automatically creates 'createdAt' and 'updatedAt'
});

const OTP = mongoose.model('EmployeeOTP', otpSchema);

module.exports = OTP;
