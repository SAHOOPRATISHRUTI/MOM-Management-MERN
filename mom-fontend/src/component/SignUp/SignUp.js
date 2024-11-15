import React, { useState } from 'react';
import {  Container, Grid, Typography, Box } from '@mui/material';
import HorizontalLinearStepper from './HorizontalLinearStepper';
import './SignUp.css'

function SignUp() {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');

  return (
    <section className="user-login" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '40px 0' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          {/* Left side with Stepper */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
              <HorizontalLinearStepper />
            </Box>
          </Grid>

          {/* Right side with SignUp form */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
              <div className="blue-box">
                <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold' }}>
                  Meeting Plus
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
                  Where Meetings Become Meaningful
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src="https://demo2.ntspl.co.in/assets/images/meeting.png"
                    alt="Meeting"
                    width="80%"
                    style={{ borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                  />
                </Box>
              </div>
              <Typography variant="body2" color="textSecondary" sx={{ marginTop: 3 }}>
                © 2024 NTSPL All Rights Reserved
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
}

export default SignUp;
