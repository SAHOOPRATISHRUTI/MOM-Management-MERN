import React, { useState } from 'react';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Grid, Typography, Box, Alert } from '@mui/material'; // Material UI imports
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { validateEmail,validatePassword } from '../../validator/validator';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Form submit handler
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error message
    setErrorMessage('');

    // Validate email and password
    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || !validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      console.log('Login successful:', response);
      toast.success(response.message, {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message, {
        autoClose: 3000,
      });
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <section className="user-login">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="loginform-container" sx={{ padding: 3 }}>
              <Typography variant="h4" gutterBottom>
                Welcome to Meeting Plus
              </Typography>
              <Typography variant="body1" paragraph>
                Enter email &amp; password to log in to your account
              </Typography>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    error={!!errorMessage && !validateEmail(email)}
                    helperText={!!errorMessage && !validateEmail(email) && 'Please enter a valid email address.'}
                  />
                </div>
                <div className="form-group">
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    error={!!errorMessage && !validatePassword(password)}
                    helperText={!!errorMessage && !validatePassword(password) && 'Password must be at least 8 characters long.'}
                  />
                </div>

                {/* ///{errorMessage && <Alert severity="error" sx={{ marginBottom: 2 }}>{errorMessage}</Alert>} */}

                <Button variant="contained" color="primary" fullWidth type="submit" sx={{ marginTop: 2 }}>
                  Sign In
                </Button>

                <div className="account" style={{ marginTop: '15px' }}>
                  Don't have an account?
                </div>

                <Button variant="outlined" fullWidth href="/signup" sx={{ marginTop: 2 }}>
                  Sign Up
                </Button>

                <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>
                  <div className="back">
                    <span><Link to ="/signin">Back to Sign In</Link></span>
                  </div>
                </a>
              </form>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <div className="blue-box">
                <Typography variant="h2" color="primary">
                  Meeting Plus
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
                  Where Meetings Become Meaningful
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img src="https://demo2.ntspl.co.in/assets/images/meeting.png" alt="Meeting" width="80%" />
                </Box>
              </div>
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

export default Login;
