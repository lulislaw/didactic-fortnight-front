// src/components/RequirePermission.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHasPermission } from '../hooks/useHasPermission';
import FullPageSpinner from './FullPageSpinner';

export default function RequirePermission({ permission, children }) {
  const { loading } = useAuth();
  const ok = useHasPermission(permission);

  if (loading) {
    return <FullPageSpinner />;
  }
  if (!ok) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
