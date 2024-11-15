const mongoose = require('mongoose');
const validator = require('validator');

// Employee schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email. Please enter a valid email'
    },
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  address: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  otp: {
    type: String,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true 
});

// Model
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
