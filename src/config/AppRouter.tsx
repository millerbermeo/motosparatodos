// routes/AppRouter.tsx
import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import Reportes from '../pages/Reportes';
import Configs from '../pages/Configs';
import Motocicletas from '../pages/Motocicletas';
import Parametrizacion from '../pages/Parametrizacion';
import Cotizaciones from '../pages/Cotizaciones';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Users = lazy(() => import('../pages/Users'));

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas con layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/usuarios" element={<Users />} />

            <Route path="/reportes" element={<Reportes />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configs />} />
            <Route path="/motocicletas" element={<Motocicletas />} />
                        <Route path="/parametrizacion" element={<Parametrizacion />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />



            {/* Aquí podrías poner más rutas de usuarios */}
          </Route>
        </Route>

        {/* Not Found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
