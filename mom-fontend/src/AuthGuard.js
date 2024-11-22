
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from './component/AuthService/Authservice';

// AuthGuard component to protect routes
const AuthGuard = ({ children }) => {
  if (!AuthService.isLoggedIn()) {
    // If not logged in, redirect to login
    return <Navigate to="/" />;
  }
  return children; // If logged in, render children components (protected routes)
};

export default AuthGuard;
