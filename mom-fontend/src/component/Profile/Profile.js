import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Grid, InputAdornment, Avatar, IconButton, Typography } from '@mui/material';
import { AccountCircle, Email, Phone, Home, PhotoCamera } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import { updateEmployeeProfile } from '../../services/api';
import './Profile.css';

function Profile({ open, handleClose, employeeData }) {
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [errors, setErrors] = useState({
    employeeName: '',
    phone: '',
  });

  useEffect(() => {
    if (employeeData) {
      setFormData({
        employeeName: employeeData.employeeName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        address: employeeData.address || '',
      });
      setPreview(employeeData.profilePicture || null);
      if (!employeeId) {
        setEmployeeId(employeeData.id || employeeData._id || null);
      }
    }
  }, [employeeData, employeeId]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setEmployeeId(decoded.id);
        } else {
          console.warn('ID not found in token payload');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    } else {
      console.warn('No auth token found in local storage');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    if (!employeeId) {
      console.error('Employee ID is null or undefined. Unable to update profile.');
      alert('Employee ID is missing. Please try again.');
      return;
    }

    try {
      const updatedData = {
        employeeName: formData.employeeName,
        phone: formData.phone,
        address: formData.address,
      };

      const response = await updateEmployeeProfile(employeeId, updatedData, profilePicture);
      console.log('Profile updated successfully:', response);
      alert('Profile updated successfully!');
      handleClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const validateEmployeeName = (value) => {
    if (value.length <= 3) {
      setErrors((prev) => ({ ...prev, employeeName: 'Employee name must be greater than 3 characters.' }));
    } else {
      setErrors((prev) => ({ ...prev, employeeName: '' }));
    }
  };

  const validatePhone = (value) => {
    const regex = /^[0-9]{10}$/;
    if (!regex.test(value)) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number must be 10 digits.' }));
    } else {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          padding: '16px',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold" align="center">
          Update Profile
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Profile Picture Section */}
          <Grid item xs={12} align="center">
            <Avatar
              src={preview || 'https://via.placeholder.com/150'}
              alt="Profile Picture"
              sx={{
                width: 120,
                height: 120,
                margin: 'auto',
                border: '2px solid #1976d2',
              }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-profile-picture"
              type="file"
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="upload-profile-picture">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                sx={{ marginTop: 1 }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee Name"
              variant="outlined"
              name="employeeName"
              value={formData.employeeName}
              onChange={(e) => {
                handleInputChange(e);
                validateEmployeeName(e.target.value);
              }}
              size="small"
              fullWidth
              error={!!errors.employeeName}
              helperText={errors.employeeName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              variant="outlined"
              name="email"
              value={formData.email}
              disabled // Disable email to prevent editing
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              variant="outlined"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                handleInputChange(e);
                validatePhone(e.target.value);
              }}
              type="tel"
              size="small"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              variant="outlined"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="error"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateProfile}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
          disabled={!!errors.employeeName || !!errors.phone}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Profile;
