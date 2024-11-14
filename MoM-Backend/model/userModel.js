const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true, 
  },
  mobile: {
    type: Number,
    required: true, 
    unique: true, 
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true, 
  },
  address: {
    type: String,
    required: true, 
  },
  password: {
    type: String,
    required: true, 
  },
  newPassword: {
    type: String, 
    required: false, 
  },
  role: {
    type: String,
    default: 'user', 
  },
}, {
  timestamps: true, 
});


module.exports = mongoose.model('User', userSchema);
