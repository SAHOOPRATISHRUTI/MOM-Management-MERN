// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './component/Login/Login';
import ForgotPassword from './component/forgot-password/ForgotPassword';
import Signin from './component/sign-in-OTP/Signin';
import OTPVerification from './component/Verify-Otp/Verify-Otp';
import Dashboard from './component/Dashboard/Dashboard';
import SignUp from './component/SignUp/SignUp';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

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
          path="/dashboard"
          element={

            <Dashboard />

          }
        />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>

  );
}

export default App;
