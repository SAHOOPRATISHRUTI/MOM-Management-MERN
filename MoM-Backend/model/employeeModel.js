const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // Assuming you're using bcrypt for password hashing

// Define the combined schema
const EmployeeUserSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      // required: true,
      trim: true,
      index: true,
    },
    employeeId: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email. Please enter a valid email.',
      },
      sparse: true, 
    },
    phone: {
      type: String,
      sparse: true, 
      validate: {
        validator: function(v) {
          return v == null || /^[0-9]{10}$/.test(v);  
        },
        message: '{VALUE} is not a valid phone number. Please enter a valid phone number.',
      },
    },
    password: {
      type: String, 
    },
    address: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: 'user',
    },
    designation: {
      type: String,
    },
    department: {
      type: String,
    },
    unit: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAuthenticated: {
      type: Boolean, 
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, 
  }
);



const EmployeeUser = mongoose.model('EmployeeUser', EmployeeUserSchema);

module.exports = EmployeeUser;
