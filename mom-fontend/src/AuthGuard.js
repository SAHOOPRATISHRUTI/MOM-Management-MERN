
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from './component/AuthService/Authservice';


const AuthGuard = ({ children }) => {
  if (!AuthService.isLoggedIn()) {

    return <Navigate to="/" />;
  }
  return children; 
};

export default AuthGuard;
