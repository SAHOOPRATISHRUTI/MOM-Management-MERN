const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 900 // 15 minutes expiry
    },
    attempts: {
        type: Number,
        default: 0
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP; 