import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, generateOTP } from '../../services/api';
import { TextField, Button, IconButton, Box, Typography, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './Verify.css';
import meeting from '../../assets/meeting.png'

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
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

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
    setOtp((prevOtp) => ({
      ...prevOtp,
      [name]: value
    }));

    if (value.length === 1 && nextField) {
      document.getElementsByName(nextField)[0].focus();
    }
  };

  const handleKeyDown = (e, prevField) => {
    if (e.key === 'Backspace' && prevField && e.target.value.length === 0) {
      document.getElementsByName(prevField)[0].focus();
    }
  };

  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    const otpValue = Object.values(otp).join('');
    let errorMessage = '';


    try {
      const result = await verifyOTP(email, otpValue);
      console.log('result------',result);
      

      const userRole = result.data.role;
      console.log(userRole)

  
      setTimeout(() => {
        if (userRole === 'user') {
          toast.success(result.message);
          navigate('/user-dashboard');
        } else {
          toast.success(result.message);
          navigate('/dashboard');
        }
      }, 0);

      // if (result.success) {
      //   toast.success(result.message);
      //   setTimeout(() => {
      //     navigate('/dashboard');
      //   },0);
      // } else {
      //   errorMessage = result.message;
      //   toast.error(errorMessage);
      // }
    } catch (error) {
      errorMessage = error.message;
      toast.error(errorMessage);
    }
  };

  const resendOTPHandler = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      const result = await generateOTP(email);
      if (result.success) {
        toast.success(result.message);
      } else {

        toast.error(result.message);
      }
    } catch (error) {

      toast.error(error.message);
    }

    setTimeout(() => {
      setIsResending(false);
    },0);
  };


  return (
    <section className="sign-in">
      <div className="container-fluid">
        <Grid container spacing={3} height="100vh">
          {/* Left Side: OTP Verification Form */}
          <Grid item xs={12} md={6}>
            <Box className="loginform-container" width={400} padding={3} boxShadow={3} borderRadius={2}>
              <img
                className="ntspl-logo"
                src="https://demo2.ntspl.co.in/assets/images/ntspl_logo.png"
                alt="NTSPL Logo"
                width="100%"
              />
              <Typography variant="h4" align="center" marginBottom={2}>
                Welcome to Meeting Plus
              </Typography>
              <Typography variant="body1" align="center" marginBottom={4}>
                Check your email for OTP
              </Typography>

              <form onSubmit={verifyOTPHandler}>
                <Box display="flex" justifyContent="space-between">
                  {['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'].map((digit, index) => (
                    <TextField
                      key={digit}
                      name={digit}
                      value={otp[digit]}
                      onChange={(e) => handleOtpChange(e, ['otp2', 'otp3', 'otp4', 'otp5', 'otp6'][index], ['otp1', 'otp2', 'otp3', 'otp4', 'otp5'][index])}
                      onKeyDown={(e) => handleKeyDown(e, ['otp1', 'otp2', 'otp3', 'otp4', 'otp5'][index])}
                      inputProps={{ maxLength: 1 }}
                      variant="outlined"
                      size="small"
                      sx={{ width: '50px' }}
                      autoFocus={index === 0}
                    />
                  ))}
                </Box>

                {errorMessage && <Typography color="error" align="center" marginTop={2}>{errorMessage}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 3 }}
                >
                  Verify
                </Button>

                <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                  <IconButton
                    href="/"
                    color="primary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ArrowBack sx={{ marginRight: 1 }} />
                    <Typography variant="body2" sx={{ textDecoration: 'none' }}>
                      Back to Sign In
                    </Typography>
                  </IconButton>

                  <Typography variant="body2">
                    <a
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        resendOTPHandler();
                      }}
                      style={{ cursor: 'pointer', textDecoration: 'none' }}
                    >
                      {isResending ? 'Resending...' : 'Resend OTP'}
                    </a>
                  </Typography>
                </Box>
              </form>
            </Box>
          </Grid>

          {/* Right Side: Image and Text Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', padding: 3 }}>
              <Typography variant="h2" color="primary" sx={{ marginBottom: 2 }}>
                Meeting Plus
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 3 }}>
                Where Meetings Become Meaningful
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={meeting}
                  alt="Meeting"
                  style={{ maxWidth: '80%', borderRadius: '12px' }}
                />
              </Box>
              <p className="copyright" style={{ textAlign: 'center', marginTop: 20, color: '#B0B0B0' }}>
                © 2024 NTSPL All Rights Reserved
              </p>
            </Box>
          </Grid>
        </Grid>
      </div>

      <ToastContainer />
    </section>
  );
};

export default VerifyOTP;
