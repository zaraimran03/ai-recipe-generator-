import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, accessToken, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-label-md">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If there's no user or token, redirect to login
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not verified, redirect to OTP
  if (!user.isVerified) {
    return <Navigate to="/verify-otp" state={{ email: user.email }} replace />;
  }

  // If page is gated for admin only — check role OR legacy is_superuser
  if (adminOnly && user.role !== 'admin' && !user.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
