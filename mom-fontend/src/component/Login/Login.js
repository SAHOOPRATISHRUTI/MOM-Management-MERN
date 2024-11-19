import React, { useState } from 'react';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Grid, Typography, Box, FormControlLabel, Checkbox, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../validator/validator';
import { generateOTP } from '../../services/api'; 
import meeting from '../../assets/meeting.png'
import { Visibility, VisibilityOff } from '@mui/icons-material'; 

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

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
      console.log(response.data.token);
      localStorage.setItem('authToken', response.data.token);
      
      toast.success(response.message, { autoClose: 2000 });
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      console.log(email);
      
    } catch (error) {
      toast.error(error.message, { autoClose: 3000 });
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      toast.error('Please enter a valid email address for OTP.');
      return;
    }

    try {
      const response = await generateOTP(email); // Call the generateOTP API
      toast.success(response.message || 'OTP sent successfully!', { autoClose: 2000 });
      navigate('/forgot-password',{ state: { email: email }}); // Navigate to the forgot-password page
    } catch (error) {
      toast.error(error.message || 'Error generating OTP. Please try again.');
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
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    
                    error={!!errorMessage && !validatePassword(password)}
                    helperText={!!errorMessage && !validatePassword(password) && 'Password must be at least 8 characters long.'}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)} 
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />} {/* Show/hide eye icon */}
                        </IconButton>
                      ),
                    }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                  <Button
                    onClick={handleForgotPassword} // Trigger the forgot password functionality
                    style={{ textDecoration: 'none', color: '#3f51b5' }}
                  >
                    Forgot Password
                  </Button>
                </div>

                <Button variant="contained" color="primary" fullWidth type="submit" sx={{ marginTop: 2 }}>
                  Sign In
                </Button>

                <div className="account" style={{ marginTop: '15px' }}>
                  Don't have an account?
                </div>

                <Button variant="outlined" fullWidth href="/signup" sx={{ marginTop: 2 }}>
                  <Link to="/sign-up">Sign Up</Link>
                </Button>

                <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>
                  <div className="back">
                    <span><Link to="/signin">Back to Sign In</Link></span>
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
                  <img src={meeting} alt="Meeting" width="80%" />
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
