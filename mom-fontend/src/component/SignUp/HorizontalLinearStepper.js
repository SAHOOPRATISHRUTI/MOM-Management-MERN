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

  // OTP states
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [otpSentMessage, setOtpSentMessage] = React.useState(false);

  const isStepOptional = (step) => step === 1;
  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    let hasError = false;
    // Step 1 - Personal Information
    if (activeStep === 0) {
      if (!name) {
        setNameError('Name is required');
        hasError = true;
      } else {
        setNameError('');
      }
      if (!phone || phone.length !== 10) {
        setPhoneError('Mobile number must be 10 digits');
        hasError = true;
      } else {
        setPhoneError('');
      }
    }

    // Step 2 - Contact Information
    if (activeStep === 1) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailError('Invalid email address');
        hasError = true;
      } else {
        setEmailError('');
      }
      if (!address) {
        setAddressError('Address is required');
        hasError = true;
      } else {
        setAddressError('');
      }
    }

    // Step 3 - Password
    if (activeStep === 2) {
      if (!password || password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        hasError = true;
      } else {
        setPasswordError('');
      }
    }

    if (hasError) return;

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleSendOtp = async () => {
    setLoading(true);

    try {
      await sendOtp(email); // Assume sendOtp function exists
      setOtpSent(true);
      setOtpSentMessage(true);
      setLoading(false);

      setTimeout(() => {
        setOtpSentMessage(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
      toast.error(error.message); // Assume toast exists
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOtpforSignUp(email, otp); // Assume verifyOtpforSignUp function exists
      if (response.success) {
        setOtpVerified(true);
        toast.success(response.message); // Assume toast exists
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
      toast.success(response.message); // Assume toast exists
      setTimeout(() => {
        navigate('/'); // Navigate to home or login page
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
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleSubmit}>Finish</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>{steps[activeStep]}</Typography>
          <Box sx={{ mb: 3 }}>
            {activeStep === 0 && (
              <>
                <TextField
                  label="Name"
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) =>handleChange(e, 'name')}
                  sx={{ mt: 2 }}
                  error={Boolean(nameError)}
                  helperText={nameError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Mobile"
                  fullWidth
                  variant="outlined"
                  value={phone}
                  onChange={(e) =>handleChange(e, 'phone')}
                  sx={{ mt: 2 }}
                  error={Boolean(phoneError)}
                  helperText={phoneError}
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
                  sx={{ mt: 2 }}
                  error={Boolean(emailError)}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                    endAdornment: email && !otpVerified && /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email) && (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          onClick={handleSendOtp}
                          size="small"
                          style={{ padding: '2px 6px' }}
                        >
                          {loading ? <CircularProgress size={20} /> : 'Send OTP'}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                {otpSentMessage && !otpVerified && (
                  <Typography variant="body2" color="success.main" mt={2}>
                    OTP Sent Successfully to your email!
                  </Typography>
                )}
                {otpSent && !otpVerified && (
                  <TextField
                    label="Enter OTP"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="outlined"
                            onClick={handleVerifyOtp}
                            size="small"
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                          >
                            {loading ? <CircularProgress size={20} /> : 'Verify OTP'}
                          </Button>
                        </InputAdornment>
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
                  sx={{ mt: 2 }}
                  error={Boolean(addressError)}
                  helperText={addressError}
                 
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
              <>
                <TextField
                  label="Password"
                  fullWidth
                  variant="outlined"
                  type="password"
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
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Button onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
