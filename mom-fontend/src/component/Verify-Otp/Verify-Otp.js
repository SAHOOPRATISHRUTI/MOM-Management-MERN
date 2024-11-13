import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation after OTP verification
import { verifyOTP } from '../../services/api';
import './Verify.css'; // Import the CSS

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

  // Use effect to get the email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setErrorMessage('Email not found. Please try again.');
    }
  }, []);

  // Handle OTP input change
  const handleOtpChange = (e, nextField, prevField) => {
    const { name, value } = e.target;
    setOtp((prevOtp) => ({
      ...prevOtp,
      [name]: value
    }));

    // Move focus to the next or previous field
    if (value.length === 1 && nextField) {
      document.getElementsByName(nextField)[0].focus();
    } else if (value.length === 0 && prevField) {
      document.getElementsByName(prevField)[0].focus();
    }
  };

  // Verify OTP handler
  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    const otpValue = Object.values(otp).join('');
    
    if (!email) {
      setErrorMessage('Email not found. Please check your email.');
      return;
    }

    if (otpValue.length === 6) {
      try {
        // Call the backend API to verify OTP
        const result = await verifyOTP(email, otpValue);

        // Handle successful OTP verification
        if (result.success === true) {
          setSuccessMessage('OTP verified successfully!');
          navigate('/dashboard');  // Redirect to a success page or another route
        } else {
          setErrorMessage('OTP verification failed. Please try again.');
        }
      } catch (error) {
        console.error('OTP verification failed:', error.message);
        setErrorMessage('An error occurred while verifying OTP. Please try again.');
      }
    } else {
      setErrorMessage('Please enter a valid 6-digit OTP.');
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
    </section>
  );
};

export default VerifyOTP;
