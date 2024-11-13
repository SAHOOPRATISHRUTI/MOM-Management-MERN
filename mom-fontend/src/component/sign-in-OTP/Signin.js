import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Grid, Container } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for routing
import { generateOTP } from '../../services/api'; // Assuming generateOTP is a function to send OTP
import './Sign.css'

const Signin = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); // Initialize the navigate function

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if the email is valid before attempting to generate OTP
        if (!email || !email.includes('@')) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        try {
            // Call the API function to generate OTP
            const response = await generateOTP(email);

            // Debugging: Log the response
            console.log("API Response: ", response);

            // Check if the response status is 200 (success)
            if (response.success === true) {
                setSuccessMessage('OTP sent successfully! Please check your email.');
                localStorage.setItem('email', email);
                navigate('/verify-otp');
            } else {
                setErrorMessage('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP error:', error);
            setErrorMessage('An error occurred while sending OTP. Please try again.');
        }
    };

    return (
        <section className="sign-in">
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    {/* Left Side */}
                    <Grid item xs={12} md={6} className="form-container">
                        <Box className="loginform-container" sx={{ padding: 3 }}>
                            <Typography variant="h4" align="left" gutterBottom>
                                Welcome to Meeting Plus
                            </Typography>
                            <Typography variant="body1" align="left" paragraph>
                                Enter your email id to log in to your account
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                {/* Flex layout for input and button stacked vertically */}
                                <Box mb={2}>
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        InputProps={{
                                            startAdornment: <EmailIcon />,
                                        }}
                                        required
                                        error={Boolean(errorMessage)}
                                        helperText={errorMessage}
                                        fullWidth
                                    />
                                </Box>

                                {/* Success message */}
                                {successMessage && (
                                    <Box mb={2} textAlign="center" color="success.main">
                                        <Typography variant="body2">{successMessage}</Typography>
                                    </Box>
                                )}

                                {/* "Send OTP" Button */}
                                <Box mb={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        fullWidth
                                    >
                                        Send OTP
                                    </Button>
                                </Box>

                                <Box mt={2} textAlign="center">
                                    <Typography variant="body2">or</Typography>
                                    <Link href="/user-login" underline="hover">
                                        <Button variant="outlined" color="primary">
                                            Sign In With Password
                                        </Button>
                                    </Link>
                                </Box>

                                <Box mt={2} textAlign="center">
                                    <Link href="/reset-password" underline="hover">
                                        Set Password
                                    </Link>
                                </Box>
                            </form>
                        </Box>
                    </Grid>



                    {/* Right Side */}
                    <Grid item xs={12} md={6} className="image-container">
                        <Box sx={{ textAlign: 'center' }}>
                            <div className="blue-box">
                                <Typography variant="h2" color="primary" gutterBottom>
                                    Meeting Plus
                                </Typography>
                                <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
                                    Where Meetings Become Meaningful
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        src="https://demo2.ntspl.co.in/assets/images/meeting.png"
                                        alt="Meeting"
                                        className="meeting-image"
                                    />
                                </Box>
                            </div>
                            <Typography variant="body2" align="center" sx={{ marginTop: 3 }}>
                                © 2024 NTSPL All Rights Reserved
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </section>
    );
};

export default Signin;
