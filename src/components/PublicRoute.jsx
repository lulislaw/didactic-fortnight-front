// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullPageSpinner from './FullPageSpinner';

export default function PublicRoute() {
  const { token, loading } = useAuth();

  // Пока тянем профиль — показываем загрузку
  if (loading) {
    return <FullPageSpinner />;
  }

  // Если уже залогинен — не пускаем на публичные страницы
  return token
      ? <Navigate to="/" replace />
      : <Outlet />;
}
