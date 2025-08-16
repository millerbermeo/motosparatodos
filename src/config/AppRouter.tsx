// routes/AppRouter.tsx
import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Users = lazy(() => import('../pages/Users'));
const Reportes = lazy(() => import('../pages/Reportes'));
const Configs = lazy(() => import('../pages/Configs'));
const Motocicletas = lazy(() => import('../pages/Motocicletas'));
const Parametrizacion = lazy(() => import('../pages/Parametrizacion'));
const Cotizaciones = lazy(() => import('../pages/Cotizaciones'));
const SolicitudFacturacion = lazy(() => import('../pages/SolicitudFacturacion'));
const Ayuda = lazy(() => import('../pages/Ayuda'));
const Formatos = lazy(() => import('../pages/Formatos'));


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
            <Route path="/configuracion" element={<Configs />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/motocicletas" element={<Motocicletas />} />
            <Route path="/parametrizacion" element={<Parametrizacion />} />
            <Route path="/solicitudes" element={<SolicitudFacturacion />} />
            <Route path="/motocicletas" element={<Motocicletas />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/formatos" element={<Formatos />} />


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
