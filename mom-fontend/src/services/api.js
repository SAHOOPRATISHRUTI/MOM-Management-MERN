import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user'; 

// Login User
const loginUser = async (email, password) => {
  try {
    console.log("Sending login request with:", email, password); 
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during the login request');
    }
  }
};

// Generate OTP for login
const generateOTP = async (email) => {
  try {
    console.log("Sending OTP generation request for:", email);
    const response = await axios.post(`${API_URL}/generate-otp`, { email });
    return response.data;  
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to generate OTP');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP generation');
    }
  }
};

// Verify OTP for login
const verifyOTP = async (email, otp) => {
  try {
    console.log('Sending OTP verification request for:', email, otp);
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    
    console.log('OTP verification response:', response.data);
    
    // Return the response data from the server
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'OTP verification failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP verification');
    }
  }
};


// Forgot Password
const resetPassword = async (email, otp, password, confirmPassword) => {
  try {
    console.log("Sending forgot password request for:", email);
    const response = await axios.post(`${API_URL}/forgot-password`, { email, otp, password, confirmPassword });
    return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to send forgot password request');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during forgot password request');
    }
  }
};

// Send OTP for signup
const sendOtp = async (email) => {
  try {
    console.log("Sending OTP request for:", email);
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Failed to send OTP');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP sending');
    }
  }
};

// Verify OTP gor sign up
const verifyOtpforSignUp = async (email, otp) => {
  try {
    console.log('Sending OTP verification request for login:', email, otp);
    const response = await axios.post(`${API_URL}/verifyotp`, { email, otp });
    return response.data;
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'OTP verification failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during OTP verification');
    }
  }
};

// Signup User
const signupUser = async (name,  email,phone,password, address,role) => {
  try {
    console.log("Sending signup request with:", name,  email,phone,password, address,role); // Log request
    const response = await axios.post(`${API_URL}/signup`, { name,  email,phone,password, address,role});
    return response.data;  
  } catch (error) {
    // Log the error message
    if (error.response) {
      console.error('Server Error:', error.response.data.message);
      throw new Error(error.response.data.message || 'Signup failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error during request:', error.message);
      throw new Error('An error occurred during signup request');
    }
  }
};

export { loginUser, generateOTP, verifyOTP, signupUser, sendOtp, verifyOtpforSignUp ,resetPassword};
