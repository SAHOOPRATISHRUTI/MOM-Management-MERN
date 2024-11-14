import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation after OTP verification
import { verifyOTP } from '../../services/api';
import './Verify.css'; // Import the CSS

import { ToastContainer,toast } from 'react-toastify';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState({
    otp1: '',
    otp2: '',
    otp3: '',
    otp4: '',
    otp5: '',
    otp6: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // For page redirection

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setErrorMessage('Email not found. Please try again.');
    }
  }, []);


  const handleOtpChange = (e, nextField, prevField) => {
    const { name, value } = e.target;
  
    // Update the OTP state
    setOtp((prevOtp) => ({
      ...prevOtp,
      [name]: value
    }));
  
    // Move focus to the next field if one character is entered
    if (value.length === 1 && nextField) {
      document.getElementsByName(nextField)[0].focus();
    } 
    // Move focus back to the previous field if Backspace is pressed and the current field is empty
    else if (e.key === 'Backspace' && value.length === 0 && prevField) {
      document.getElementsByName(prevField)[0].focus();
    }
  };
  
  // Add an event listener to detect 'Backspace' specifically
  const handleKeyDown = (e, prevField) => {
    if (e.key === 'Backspace' && prevField && e.target.value.length === 0) {
      document.getElementsByName(prevField)[0].focus();
    }
  };
  


  
  const verifyOTPHandler = async (e) => {
    e.preventDefault();
  
    const otpValue = Object.values(otp).join('');
    let errorMessage = '';
 
    if (!email) {
      errorMessage = 'Email not found. Please check your email.';
      setErrorMessage(errorMessage);
      toast.error(errorMessage, { autoClose: 2000 });
      return;
    }
  
    try {
      
      const result = await verifyOTP(email, otpValue);
  
      if (result.success) {
        toast.success(result.message , { autoClose: 2000 });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        errorMessage = result.message ;
        toast.error(errorMessage, { autoClose: 2000 });
      }
    } catch (error) {
      errorMessage = error.message ;
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };
  
  

  return (
    <section className="sign-in">
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
            <div className="loginform-container">
              <img className="ntspl-logo" src="https://demo2.ntspl.co.in/assets/images/ntspl_logo.png" alt="NTSPL Logo" />
              <form onSubmit={verifyOTPHandler}>
                <div className="text">
                  <h4>Welcome to Meeting Plus</h4>
                  <p>Check your email for OTP</p>
                </div>
                <div className="form-group">
                  <label className="mb-1">Enter Your 6 Digit OTP <span>*</span></label>
                  <div className="pincode">
                    {['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'].map((digit, index) => (
                      <div className="digit" key={digit}>
                        <input
                          type="text"
                          name={digit}
                          value={otp[digit]}
                          maxLength="1"
                          onChange={(e) => handleOtpChange(e, ['otp2', 'otp3', 'otp4', 'otp5', 'otp6'][index], ['otp1', 'otp2', 'otp3', 'otp4', 'otp5'][index])}
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button type="submit" className="btn1">Verify</button>
                <div className="back-resend back-arrow">
                  <a href="/" className="back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0b77e8" viewBox="0 0 16 16" className="bi bi-arrow-left">
                      <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>
                    <span>Back to Sign In</span>
                  </a>
                  <div className="resend">
                    <a href="#!" >Resend OTP</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
            <div className="blue-box-cont">
              <div className="blue-box">
                <div className="slider-cont">
                  <h2>Meeting Plus</h2>
                  <h6>Where Meeting Become Meaningful</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default VerifyOTP;
