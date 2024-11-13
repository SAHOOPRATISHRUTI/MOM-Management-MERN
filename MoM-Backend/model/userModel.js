const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define user schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of the string
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures that the email is unique across the collection
  },
  password: {
    type: String,
    required: true, // The current password field
  },
  newPassword: {
    type: String, // Temporary field to store the new password during reset process
    required: false, // This is not a permanent field, so it doesn't need to be required
  },
  role: {
    type: String,
    default: 'user', // Default role for the user
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Export the model based on the schema
module.exports = mongoose.model('User', userSchema);
