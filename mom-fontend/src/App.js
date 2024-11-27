import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import the GoogleOAuthProvider
import Login from './component/Login/Login';
import ForgotPassword from './component/forgot-password/ForgotPassword';
import Signin from './component/sign-in-OTP/Signin';
import OTPVerification from './component/Verify-Otp/Verify-Otp';
import UserDashboard from './component/UserDashboard/UserDashboard';
import SignUp from './component/SignUp/SignUp';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import MeetingPage from './component/AdminDashboard/AdminDashboard';
import AuthGuard from './AuthGuard';
import Profile from './component/Profile/Profile';

function App() {
  const [profileOpen, setProfileOpen] = useState(true);

  const handleProfileOpen = () => {
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  return (
    <GoogleOAuthProvider clientId="32530723892-b87876uso7ooi2c8mrc3nh3305qo289p.apps.googleusercontent.com">
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signin" element={<Signin />} />
          <Route
            path="/user-dashboard"
            element={<UserDashboard handleProfileOpen={handleProfileOpen} />}
          />
          <Route
            path="/profile"
            element={<Profile open={profileOpen} handleClose={handleProfileClose} />}
          />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <MeetingPage />
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
