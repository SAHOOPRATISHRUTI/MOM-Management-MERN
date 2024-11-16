import React, { useState } from 'react';
import './ForgotPassword.css'; // Create and style this CSS file as needed
import { Container, Grid, Typography, Box, TextField, Button, Link } from '@mui/material';
import { resetPassword } from '../../services/api'; // Import the API method
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const location = useLocation();
  const [Otp, setOtp] = useState(new Array(6).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { email } = location.state || {}; 
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; 
    const newOtp = [...Otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus on the next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const otp = Otp.join('');

    // Check if OTP, password and confirmPassword are valid
    if (!otp || password !== confirmPassword) {
      setError("OTP or passwords do not match.");
      return;
    }

    try {
      // Call resetPassword API with OTP and password
      const response = await resetPassword(email, otp, password, confirmPassword);
      toast.success(response.message, { autoClose: 2000 });
      setTimeout(() => {
        navigate('/');
      }, 3000);

      if (response.success) {
        setSuccessMessage("Password reset successfully.");
        setError('');
      } else {
        setError("Failed to reset password.");
      }
    } catch (err) {
      console.log('Error:', err);
      setError(err.message || "An error occurred while resetting the password.");
    }
  };

  return (
    <section className="forgot-password">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="forgot-password-container" sx={{ padding: 3 }}>
              <Typography variant="h4" gutterBottom>
                Welcome to Meeting Plus
              </Typography>
              <Typography variant="h6" gutterBottom>
                Set Password
              </Typography>
              <form onSubmit={handleOtpVerify} noValidate>
                <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                  Enter Your 6 Digit OTP *
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  {Otp.map((digit, index) => (
                    <TextField
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      variant="outlined"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                      sx={{ width: '40px' }}
                    />
                  ))}
                </Box>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button variant="contained" color="primary" fullWidth type="submit" sx={{ marginTop: 2 }}>
                  OTP Verify
                </Button>

                {/* Display error or success message */}
                {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
                {successMessage && <Typography color="primary" sx={{ marginTop: 2 }}>{successMessage}</Typography>}

                <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                  <Link href="/signin" sx={{ marginRight: 2 }}>Back to Sign In</Link>
                  <Link href="/resend-otp">Resend OTP</Link>
                </Box>
              </form>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }} className="blue-box">
              <Typography variant="h2" color="primary">
                Meeting Plus
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
                Where Meetings Become Meaningful
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img src="https://demo2.ntspl.co.in/assets/images/meeting.png" alt="Meeting" width="80%" />
              </Box>
              <p className="copyright" style={{ textAlign: 'center', marginTop: 3 }}>
                © 2024 NTSPL All Rights Reserved
              </p>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
}

export default ForgotPassword;
