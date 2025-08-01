// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullPageSpinner from './FullPageSpinner';

export default function PrivateRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
