import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppealsList from './pages/AppealsList';
import AppealCreate from './pages/AppealCreate';
import AppealDetail from './pages/AppealDetail';
import NotFound from './pages/NotFound';
import BuildingConstructorPage from "./pages/BuildingConstructorPage.jsx";
const AppRoutes = () => (
  <Routes>

    <Route path="/" element={<Navigate to="/appeals" replace />} />


    <Route path="/appeals" element={<AppealsList />} />
    <Route path="/constructor" element={<BuildingConstructorPage />} />

    <Route path="/appeals/new" element={<AppealCreate />} />

    <Route path="/appeals/:id" element={<AppealDetail />} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
