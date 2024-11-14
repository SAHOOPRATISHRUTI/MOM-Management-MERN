import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Typography, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom'; // Make sure to import Link from react-router-dom
import HorizontalLinearStepper from './HorizontalLinearStepper'; // Assuming the Stepper is in the same folder

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <section className="user-login">
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left side with Stepper */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <HorizontalLinearStepper /> {/* Your Stepper component */}
            </Box>
          </Grid>

          {/* Right side with SignUp form */}
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

export default SignUp;
