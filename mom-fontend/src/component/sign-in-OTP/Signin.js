import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Box, Link, Container, CircularProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';
import { generateOTP } from '../../services/api';
import { validateEmail } from '../../validator/validator';
import { ToastContainer, toast } from 'react-toastify';
import './Sign.css';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await generateOTP(email);

      if (response.success) {
        localStorage.setItem('email', email);
        toast.success(response.message, { autoClose: 2000 });

        setTimeout(() => navigate('/verify-otp'), 3000);
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      toast.error(error.message, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="sign-in">
      <Container maxWidth="lg">
        <Grid container spacing={2} sx={{ height: '100vh', alignItems: 'center' }}>
          {/* Left Side: Form Section */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box sx={{ maxWidth: 400, width: '100%', padding: 3, textAlign: 'left' }}>
              <Box sx={{ marginBottom: 3 }}>
                <img src="https://demo2.ntspl.co.in/assets/images/ntspl_logo.png" alt="Logo" width={150} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                Welcome to Meeting Plus
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 3 }}>
                Enter your email id to log in to your account
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ marginBottom: 2 }}
                />
                {loading ? (
                  <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      type="submit"
                      sx={{ borderRadius: '5px', padding: '5px', marginBottom: 2 }}
                    >
                      Send OTP
                    </Button>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                        or
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#f1f1f1',
                          },
                        }}
                        fullWidth
                        onClick={() => navigate('/')}
                      >
                        Sign In With Password
                      </Button>
                    </Box>
                    <Box sx={{ textAlign: 'left', marginTop: 2 }}>
                      <Link href="/reset-password" variant="body2" color="textSecondary">
                        Set Password
                      </Link>
                    </Box>
                  </>
                )}
              </form>
            </Box>
          </Grid>

          {/* Right Side: Image Section */}
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
                  src="https://demo2.ntspl.co.in/assets/images/meeting.png"
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
      </Container>
      <ToastContainer />
    </section>
  );
};

export default Signin;
