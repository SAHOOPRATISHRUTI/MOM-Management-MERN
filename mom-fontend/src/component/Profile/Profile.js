import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Avatar,
  IconButton,
} from '@mui/material';
import { AccountCircle, Email, Phone, Home, Work, Business, PhotoCamera } from '@mui/icons-material';
import './Profile.css';

function Profile({ open, handleClose }) {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    department: '',
    unit: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      sx={{ '& .MuiDialog-paper': { width: '80%', maxWidth: '900px' } }}
    >
      <DialogTitle>Update Profile</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} className="custom-grid-spacing">
          {/* Profile Picture Section */}
          <Grid item xs={12} className="profile-picture-section">
            <Avatar
              src={preview || 'https://via.placeholder.com/150'}
              alt="Profile Picture"
              sx={{ width: 100, height: 100, margin: 'auto' }}
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
                sx={{ display: 'block', margin: 'auto', marginTop: 1 }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Grid>

          {/* First Row (Two Columns) */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee Name"
              variant="outlined"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
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
              label="Employee ID"
              variant="outlined"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Second Row (Two Columns) */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              variant="outlined"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              size="small"
              className="custom-textfield"
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
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Third Row (Single Column for Address) */}
          <Grid item xs={12}>
            <TextField
              label="Address"
              variant="outlined"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Fourth Row (Two Columns) */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Designation"
              variant="outlined"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Department"
              variant="outlined"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Fifth Row (Single Column for Unit) */}
          <Grid item xs={12}>
            <TextField
              label="Unit"
              variant="outlined"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              size="small"
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => alert('Profile Updated')} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Profile;
