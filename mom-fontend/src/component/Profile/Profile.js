import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Grid, InputAdornment, Avatar, IconButton, Typography } from '@mui/material';
import { AccountCircle, Email, Phone, Home, PhotoCamera } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';

import { updateEmployeeProfile } from '../../services/api';
import './Profile.css';

function Profile({ open, handleClose }) {
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);
      setEmployeeId(decodedToken.id);  // Assuming 'id' is in the JWT payload
      fetchUserDetails(decodedToken.id);
    } else {
      console.log('No token found');
    }
  }, []);
  
  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(`/employees/${id}`);
      console.log(response);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
  
      setFormData({
        employeeName: data.employeeName,  
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      
      setPreview(data.profilePicture); // Assuming the response includes a profile picture URL
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  
  

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
      alert('User ID is not available');
      return;
    }
  
    try {
      const updatedData = {
        employeeName: formData.employeeName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };
  
      console.log("Data being sent:", updatedData);
  
      // Call the API to update the profile
      const response = await updateEmployeeProfile(employeeId, updatedData, profilePicture);
      alert('Profile updated successfully!');
      console.log(response);
      handleClose();  // Close the dialog on success
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
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
              onChange={handleInputChange}
              size="small"
              fullWidth
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
              disabled // Disable the email field to prevent updates
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
              onChange={handleInputChange}
              type="tel"
              size="small"
              fullWidth
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
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Profile;
