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
import { validateAddress, validateEmail, validateMobile, validateName, validatePassword } from '../../validator/validator';
import { signupUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const steps = ['Personal Information', 'Contact Information', 'Create Password'];

export default function HorizontalLinearStepper() {

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const navigate = useNavigate();

  // Step 1 inputs
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');

  // Step 2 inputs
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');

  // Step 3 inputs
  const [password, setPassword] = React.useState('');

  // Error states
  const [nameError, setNameError] = React.useState('');
  const [mobileError, setMobileError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    // Validate form fields and set errors
    let hasError = false;
    if (activeStep === 0) {
      if (!validateName(name)) {
        setNameError('Name is required');
        hasError = true;
      } else {
        setNameError('');
      }
      if (!validateMobile(mobile)) {
        setMobileError('Mobile number must be 10 digits');
        hasError = true;
      } else {
        setMobileError('');
      }
    }

    if (activeStep === 1) {
      if (!validateEmail(email)) {
        setEmailError('Invalid email address');
        hasError = true;
      } else {
        setEmailError('');
      }
      if (!validateAddress(address)) {
        setAddressError('Address is required');
        hasError = true;
      } else {
        setAddressError('');
      }
    }

    if (activeStep === 2) {
      if (!validatePassword(password)) {
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

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };


  
    const handleSubmit = async () => {
      try {
        const response = await signupUser(name, mobile, email, address, password);
        console.log('Signup successful:', response);
        toast.success(response.message)
        
       
        navigate('/dashboard'); 
      } catch (error) {
        console.error('Signup failed:', error.message);
        toast.error( error.message)
      
      }
    };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
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
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            {steps[activeStep]}
          </Typography>
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
                  label="Mobile"
                  fullWidth
                  variant="outlined"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  sx={{ mt: 2 }}
                  error={Boolean(mobileError)}
                  helperText={mobileError}
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
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  error={Boolean(emailError)}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Address"
                  fullWidth
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  sx={{ mb: 2 }}
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
              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
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
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
