import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { sendOtp, verifyOtpforSignUp, signupUser } from '../../services/api';

const steps = ['Personal Information', 'Contact Information', 'Create Password'];

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const navigate = useNavigate();

  // Step 1 inputs
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  // Step 2 inputs
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [role, setRole] = React.useState('user');

  // Step 3 inputs
  const [password, setPassword] = React.useState('');

  // Error states
  const [nameError, setNameError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

    // Email Verified state
    const [emailVerified, setEmailVerified] = React.useState(false);

  // OTP states
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [otpSentMessage, setOtpSentMessage] = React.useState(false);

  const isStepOptional = (step) => step === 1;
  const isStepSkipped = (step) => skipped.has(step);


  const handleNext = () => {
    let hasError = false;

    // Step 1 - Personal Information validation
    if (activeStep === 0) {
      if (!name || name.length < 3) {
        setNameError('Name must be at least 3 characters.');
        hasError = true;
      } else {
        setNameError('');
      }
      if (!phone || !/^\d{10}$/.test(phone)) {
        setPhoneError('Phone number must be 10 digits.');
        hasError = true;
      } else {
        setPhoneError('');
      }
    }

    // Step 2 - Contact Information validation
    if (activeStep === 1) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailError('Invalid email address.');
        hasError = true;
      } else {
        setEmailError('');
      }
      if (!address) {
        setAddressError('Address is required.');
        hasError = true;
      } else {
        setAddressError('');
      }

      if (!otpVerified) {
        toast.warn('Please verify your email before proceeding.');
        hasError = true;
      }
    }

    // Step 3 - Password validation
    if (activeStep === 2) {
      if (!password || password.length < 8) {
        setPasswordError('Password must be at least 8 characters.');
        hasError = true;
      } else {
        setPasswordError('');
      }
    }

    if (hasError) return;

    // Proceed to next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleSendOtp = async () => {
    setLoading(true);

    try {
      const response = await sendOtp(email)
      toast.success(response.success.message);
      console.log(response.success.message);
      
      setOtpSent(true);
      setOtpSentMessage(true);
      setLoading(false);

      setTimeout(() => {
        setOtpSentMessage(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };


  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOtpforSignUp(email, otp); 
      if (response.success) {
        setOtpVerified(true);
        toast.success(response.message); 
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleSubmit = async () => {
    try {
      const response = await signupUser(name, email, phone, password, address, role); // Assume signupUser function exists
      toast.success(response.message); 
      setTimeout(() => {
        navigate('/'); 
      }, 3000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (event, type) => {
    const value = event.target.value;
  
    if (type === 'name') {
      setName(value);
      // Check if name is empty or less than 4 characters
      if (!value) {
        setNameError('This field is required');
      } else if (value.length <= 3) {
        setNameError('Name must be greater than 3 characters');
      } else {
        setNameError('');
      }
    }
  
    if (type === 'phone') {
      setPhone(value);
      // Check if phone number is empty or not 10 characters
      if (!value) {
        setPhoneError('This field is required');
      } else if (value.length !== 10) {
        setPhoneError('Mobile number must be 10 digits');
      } else {
        setPhoneError('');
      }
    }
  
    if (type === 'email') {
      setEmail(value);
      // Check if email is valid
      if (/\S+@\S+\.\S+/.test(value)) {
        setEmailError('');
      } else {
        setEmailError('Invalid email address');
      }
    }
  
    if (type === 'address') {
      setAddress(value);
      // Check if address is empty
      if (!value) {
        setAddressError('This field is required');
      } else {
        setAddressError('');
      }
    }
  
    if (type === 'password') {
      setPassword(value);
      // Check if password is at least 8 characters
      if (value.length >= 8) {
        setPasswordError('');
      } else {
        setPasswordError('Password must be at least 8 characters');
      }
    }
  };
  

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length ? (
        <Box>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
          <Button onClick={handleSubmit}>Finish</Button>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ mt: 2, mb: 1 }}>{steps[activeStep]}</Typography>

          {activeStep === 0 && (
            <>
              <TextField
                label="Name"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) =>handleChange(e, 'name')}
                error={Boolean(nameError)}
                helperText={nameError}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone"
                fullWidth
                variant="outlined"
                value={phone}
                onChange={(e) =>handleChange(e, 'phone')}
                error={Boolean(phoneError)}
                helperText={phoneError}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          {activeStep === 1 && (
            <>
              <TextField
                label="Email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) =>handleChange(e, 'email')}
                error={Boolean(emailError)}
                helperText={emailError}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                  endAdornment: email && !otpVerified && (
                    <InputAdornment position="end">
                      <Button onClick={handleSendOtp} disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Send OTP'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              {otpSent && !otpVerified && (
                <TextField
                  label="OTP"
                  fullWidth
                  variant="outlined"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mt: 2 }}
                  InputProps={{
                    endAdornment: (
                      <Button onClick={handleVerifyOtp}>Verify OTP</Button>
                    ),
                  }}
                />
              )}
              <TextField
                label="Address"
                fullWidth
                variant="outlined"
                value={address}
                onChange={(e) =>handleChange(e, 'address')}
                error={Boolean(addressError)}
                helperText={addressError}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          {activeStep === 2 && (
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(passwordError)}
              helperText={passwordError}
              sx={{ mt: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
