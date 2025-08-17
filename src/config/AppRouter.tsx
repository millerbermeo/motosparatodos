// routes/AppRouter.tsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "./PrivateRoute";
import RequireModule from "./RequireModule"; // 👈

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Users = lazy(() => import("../pages/Users"));
const Reportes = lazy(() => import("../pages/Reportes"));
const Configs = lazy(() => import("../pages/Configs"));
const Motocicletas = lazy(() => import("../pages/Motocicletas"));
const Parametrizacion = lazy(() => import("../pages/Parametrizacion"));
const Cotizaciones = lazy(() => import("../pages/Cotizaciones"));
const SolicitudFacturacion = lazy(() => import("../pages/SolicitudFacturacion"));
const Ayuda = lazy(() => import("../pages/Ayuda"));
const Formatos = lazy(() => import("../pages/Formatos"));
const Forbidden = lazy(() => import("../pages/Forbidden")); // 👈 crea esta página simple

const Fallback = () => <div style={{ padding: 16 }}>Cargando…</div>;

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Bloque privado (requiere estar autenticado) */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              {/* Home: solo autenticación */}
              <Route path="/" element={<Home />} />

              {/* Por módulo (ajusta los nombres según tu backend) */}
              <Route element={<RequireModule name="Usuarios" />}>
                <Route path="/usuarios" element={<Users />} />
              </Route>

              <Route element={<RequireModule name="Reportes" />}>
                <Route path="/reportes" element={<Reportes />} />
              </Route>

              <Route element={<RequireModule name="Parametrizaciones" />}>
                <Route path="/parametrizacion" element={<Parametrizacion />} />
              </Route>

              <Route element={<RequireModule name="Cotizaciones" />}>
                <Route path="/cotizaciones" element={<Cotizaciones />} />
              </Route>

              <Route element={<RequireModule name="Motocicletas" />}>
                <Route path="/motocicletas" element={<Motocicletas />} />
              </Route>

              <Route element={<RequireModule name="Solicitudes de facturación" />}>
                <Route path="/solicitudes" element={<SolicitudFacturacion />} />
              </Route>

              <Route element={<RequireModule name="Ayuda" />}>
                <Route path="/ayuda" element={<Ayuda />} />
              </Route>

              <Route element={<RequireModule name="Formatos" />}>
                <Route path="/formatos" element={<Formatos />} />
              </Route>

              {/* Configuración (si lo controlas por rol o módulo, cambia aquí) */}
              <Route element={<PrivateRoute requireRole="Administrador" />}>
                <Route path="/configuracion" element={<Configs />} />
              </Route>
            </Route>
          </Route>

          {/* Forbidden */}
          <Route path="/403" element={<Forbidden />} />

          {/* Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
