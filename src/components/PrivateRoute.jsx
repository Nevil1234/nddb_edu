import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const auth = useAuth();
  
  // Check if auth is defined before destructuring
  if (!auth) {
    console.error("Auth context is undefined");
    return <Navigate to="/login" />;
  }
  
  const { isAuthenticated, loading } = auth;

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;