import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import AppealsList from './pages/AppealsList';
import AppealCreate from './pages/AppealCreate';
import AppealDetail from './pages/AppealDetail';
import NotFound from './pages/NotFound';
import CamerasPage from "./pages/CamerasPage.jsx"
import BuildingListPage from "@/pages/BuildingListPage.jsx";
import BuildingConstructorPage from "@/pages/BuildingConstructorPage.jsx";

const AppRoutes = () => (
    <Routes>

      <Route path="/" element={<Navigate to="/appeals" replace/>}/>


      <Route path="/appeals" element={<AppealsList/>}/>
      <Route path="/building" element={<BuildingListPage/>}/>
      <Route path="/constructor" element={<BuildingConstructorPage/>}></Route>
      <Route path="/constructor/:id" element={<BuildingConstructorPage />} />
      <Route path="/cameras" element={<CamerasPage></CamerasPage>}/>
      <Route path="/appeals/new" element={<AppealCreate/>}/>

      <Route path="/appeals/:id" element={<AppealDetail/>}/>

      <Route path="*" element={<NotFound/>}/>
    </Routes>
);

export default AppRoutes;
