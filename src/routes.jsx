// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import RequirePermission from './components/RequirePermission';

import Login        from './pages/Login';
import Register     from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound     from './pages/NotFound';
import AppealsList  from './pages/AppealsList';
import AppealCreate from './pages/AppealCreate';
import AppealDetail from './pages/AppealDetail';
import CamerasPage  from './pages/CamerasPage';
import BuildingListPage from './pages/BuildingListPage';
import BuildingConstructorPage from './pages/BuildingConstructorPage';
import AccessControl from './pages/AccessControl';

export default function AppRoutes() {
  return (
      <Routes>
        {/* публичные, но не для авторизованных */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* статический редирект с корня */}
        <Route path="/" element={<Navigate to="/appeals" replace />} />

        {/* защищённые */}
        <Route element={<PrivateRoute />}>
          <Route
              path="/appeals"
              element={
                <RequirePermission permission="view_appeals">
                  <AppealsList />
                </RequirePermission>
              }
          />
          <Route
              path="/appeals/new"
              element={
                <RequirePermission permission="create_appeal">
                  <AppealCreate />
                </RequirePermission>
              }
          />
          <Route
              path="/appeals/:id"
              element={
                <RequirePermission permission="view_appeals">
                  <AppealDetail />
                </RequirePermission>
              }
          />
          <Route
              path="/building"
              element={
                <RequirePermission permission="view_buildings">
                  <BuildingListPage />
                </RequirePermission>
              }
          />
          <Route
              path="/constructor"
              element={
                <RequirePermission permission="view_buildings">
                  <BuildingConstructorPage />
                </RequirePermission>
              }
          />
          <Route
              path="/constructor/:id"
              element={
                <RequirePermission permission="view_buildings">
                  <BuildingConstructorPage />
                </RequirePermission>
              }
          />
          <Route
              path="/cameras"
              element={
                <RequirePermission permission="view_cameras">
                  <CamerasPage />
                </RequirePermission>
              }
          />
          <Route
              path="/control"
              element={
                <RequirePermission permission="manage_roles">
                  <AccessControl />
                </RequirePermission>
              }
          />
        </Route>

        {/* неавторизованный доступ */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}
