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
import { sendOtp, verifyOtpforSignUp, signupUser } from '../../services/api'; // Adjust API service paths
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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
  const [role, setRole] = React.useState('user'); // Default role is "User"

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
      // Send OTP API call
      await sendOtp(email);
      setOtpSent(true);
      setOtpSentMessage(true);
      setLoading(false);

      // Clear OTP sent message after 3 seconds
      setTimeout(() => {
        setOtpSentMessage(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOtpforSignUp(email, otp);
      if (response.success) {
        setOtpVerified(true);
        toast.success('OTP verified successfully');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      toast.error('OTP verification failed');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await signupUser(name, email, phone, password, address, role);  // Include role in the signupUser API call
      toast.success(response.message);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleMobileKeyPress = (e) => {
    const key = e.key;
    // Allow only numbers and prevent any other key press
    if (!/^[0-9]$/.test(key)) {
      e.preventDefault();
    }

    // Check if the length of the value exceeds 10 digits
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  };


  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = <Typography variant="caption">Optional</Typography>;
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleSubmit}>Finish</Button> {/* Finish button triggers submit */}
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
                  onChange={(e) => setName(e.target.value)}
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
                  id="mobile"
                  label="Mobile Number"
                  type="tel"
                  name="mobile"
                  //value={formData.mobile}
                  onKeyPress={handleMobileKeyPress}  // Apply the key press handler here
                  //onChange={hand}
                  inputProps={{ maxLength: 10 }}  // Restrict input length to 10
                  placeholder="Enter Your Mobile Number*"
                  error={Boolean(phoneError)} 
                  helperText={phoneError}  
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ marginBottom: "16px" }}
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
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(emailError)}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                    endAdornment: email && !otpVerified && (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          onClick={handleSendOtp}
                          size="small"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
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
                  />
                )}
                {otpSent && !otpVerified && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyOtp}
                    sx={{ mt: 2 }}
                  >
                    Verify OTP
                  </Button>
                )}
                <TextField
                  label="Address"
                  fullWidth
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(passwordError)}
                  helperText={passwordError}
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
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 1 }}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
