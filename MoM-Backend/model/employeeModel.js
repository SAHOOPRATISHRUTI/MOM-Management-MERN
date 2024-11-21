const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // Assuming you're using bcrypt for password hashing

// Define the combined schema
const EmployeeUserSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
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
      sparse: true, // Allows for empty fields when unique index is used
    },
    phone: {
      type: String,
      sparse: true, // Ensures that the index is only applied to non-null phone numbers
      validate: {
        validator: function(v) {
          return v == null || /^[0-9]{10}$/.test(v);  // Allow null or validate 10-digit phone numbers
        },
        message: '{VALUE} is not a valid phone number. Please enter a valid phone number.',
      },
    },
    password: {
      type: String, // For user authentication
      // required: true, // Assuming password is required
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
      type: Boolean, // For user authentication status
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
      default: false, // Default is set to false, assuming normal user
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);



const EmployeeUser = mongoose.model('EmployeeUser', EmployeeUserSchema);

module.exports = EmployeeUser;
