import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login/Login';
import Signin from './component/sign-in-OTP/Signin';
import OTPVerification from './component/Verify-Otp/Verify-Otp';
import Dashboard from './component/Dashboard/Dashboard';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the default styling for toast notifications

function App() {
  return (
    <Router>
      {/* The ToastContainer should be placed inside the Router so it can work globally */}
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify-otp" element={<OTPVerification />} /> 
      </Routes>
    </Router>
  );
}

export default App;
