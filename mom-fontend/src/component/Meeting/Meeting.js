import React from 'react';
import './MeetingPage.css';
import { logoutUser } from '../../services/api';
import logo1 from '../../assets/logo1.png';
import { toast } from 'react-toastify';

const MeetingPage = () => {
  const handleLogout = async () => {
    try {
      const result = await logoutUser();  // Call the logout API
      toast.success(result.message);  // Show success toast message
      // Optionally, redirect to login or home page
      window.location.href = '/';  // Redirect to login page after successful logout
    } catch (error) {
      toast.error(error.message);  // Show error toast message if logout fails
    }
  };

  return (
    <>
      <header className="navbar-container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container">
            {/* Logo Section */}
            <a className="navbar-brand" href="#">
              <img src="assets/images/Ntspl-Logo-white.png" alt="Logo" className="logo-img" />
            </a>

            {/* Navbar toggle button for mobile */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navbar Items */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active">
                  <a className="nav-link" href="#">
                    <i className="bi bi-house-door"></i>
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-clock"></i>
                    Timeline
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-person-circle"></i>
                    Profile
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-gear"></i>
                    Settings
                  </a>
                </li>
                {/* Profile Dropdown */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img src="/assets/images/profile-image.jpg" alt="Profile" className="profile-avatar" />
                    Priyanka
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a className="dropdown-item" href="#">Account</a></li>
                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="sidebar">
        <div className="logo">
          <img src={logo1} alt="Logo" />
        </div>

        <ul className="navbar-nav me-auto mt-5">
          <li className="nav-item">
            <a className="nav-link text-white d-flex gap-2 align-items-center">
              <img src="assets/images/meeting.png" alt="Meetings" />
              <span className="nav-link-label">Meetings</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white d-flex gap-2 align-items-center">
              <img src="assets/images/clipboard.png" alt="Action" />
              <span className="nav-link-label">Action</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white d-flex gap-2 align-items-center">
              <img src="assets/images/settings.png" alt="Manage" />
              <span className="nav-link-label">Manage</span>
            </a>
          </li>
        </ul>
      </div>

    </>
  );
};

export default MeetingPage;
