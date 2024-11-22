// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
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

function App() {
  return (
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
          element={
            <AuthGuard>
              <UserDashboard />
            </AuthGuard>
          }
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
  );
}

export default App;
