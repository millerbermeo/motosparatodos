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
// const Configs = lazy(() => import("../pages/Configs"));
const Motocicletas = lazy(() => import("../pages/Motocicletas"));
const Parametrizacion = lazy(() => import("../pages/Parametrizacion"));
const Cotizaciones = lazy(() => import("../pages/Cotizaciones"));
const SolicitudFacturacion = lazy(() => import("../pages/SolicitudFacturacion"));
const Ayuda = lazy(() => import("../pages/Ayuda"));
const Formatos = lazy(() => import("../pages/Formatos"));
const Forbidden = lazy(() => import("../pages/Forbidden")); // 👈 crea esta página simple
const Empresas = lazy(() => import("../pages/Empresas"));
const Agencias = lazy(() => import("../pages/Agencias")); // 👈 crea esta página simple
const Happy = lazy(() => import("../pages/Happy")); // 👈 crea esta página simple
const Soat = lazy(() => import("../pages/Soat")); // 👈 crea esta página simple
const Revisiones = lazy(() => import("../pages/Revisiones")); // 👈 crea esta página simple
const Clientes = lazy(() => import("../pages/Clientes")); // 👈 crea esta página simple

const Creditos = lazy(() => import("../pages/Creditos")); // 👈 crea esta página simple
const Detalles = lazy(() => import("../pages/Detalles")); // 👈 crea esta página simple
const CrearCotizaciones = lazy(() => import("../pages/CrearCotizaciones")); // 👈 crea esta página simple

const CreditosForm = lazy(() => import("../pages/CreditosForm")); // 👈 crea esta página simple
const DetalleEstado = lazy(() => import("../pages/DetalleEstado")); // 👈 crea esta página simple
const CreditoDetalle = lazy(() => import("../features/creditos/CreditoDetalle")); // 👈 crea esta página simple
const CreditoDetalleAdmin = lazy(() => import("../features/creditos/CreditoDetalleAdmin")); // 👈 crea esta página simple
const CreditoDetalleAsesor = lazy(() => import("../features/creditos/CreditoDetalleAsesor")); // 👈 crea esta página simple



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

              <Route element={<RequireModule name="Clientes" />}>
                <Route path="/clientes" element={<Clientes />} />
              </Route>

              <Route element={<RequireModule name="Motocicletas" />}>
                <Route path="/motocicletas" element={<Motocicletas />} />
              </Route>

              <Route element={<RequireModule name="Parametrizaciones" />}>
                <Route path="/parametrizacion" element={<Parametrizacion />} />
              </Route>

              <Route element={<RequireModule name="Cotizaciones" />}>
                <Route path="/cotizaciones/crear-cotizaciones" element={<CrearCotizaciones />} />

                <Route path="/cotizaciones" element={<Cotizaciones />} />
                <Route path="/cotizaciones/:id" element={<Detalles />} /> {/* 👈 aquí */}
                <Route path="/cotizaciones/estado/:id" element={<DetalleEstado />} /> {/* 👈 aquí */}

              </Route>

              <Route element={<RequireModule name="Créditos" />}>
                <Route path="/creditos" element={<Creditos />} />
                <Route path="/creditos/registrar/:id" element={<CreditosForm />} />
                <Route path="/creditos/detalle/:id" element={<CreditoDetalle />} />
                <Route path="/creditos/detalle/cambiar-estado/:id" element={<CreditoDetalleAdmin />} />
                <Route path="/creditos/detalle/cerrar-credito/:id" element={<CreditoDetalleAsesor />} />


              </Route>


              <Route element={<RequireModule name="Solicitudes de facturación" />}>
                <Route path="/solicitudes" element={<SolicitudFacturacion />} />
              </Route>



              {/* -------------------- SUBMENU PUNTOS -------------------- */}

              <Route element={<RequireModule name="Puntos" />}>
                <Route path="/empresas" element={<Empresas />} />
              </Route>

              <Route element={<RequireModule name="Puntos" />}>
                <Route path="/agencias" element={<Agencias />} />
              </Route>


              {/* -------------------- SUBEMENU ALERTAS -------------------- */}

              <Route element={<RequireModule name="Alertas" />}>
                <Route path="/happy" element={<Happy />} />
              </Route>

              <Route element={<RequireModule name="Alertas" />}>
                <Route path="/soat" element={<Soat />} />
              </Route>

              <Route element={<RequireModule name="Alertas" />}>
                <Route path="/revisiones" element={<Revisiones />} />
              </Route>


              <Route element={<RequireModule name="Reportes" />}>
                <Route path="/reportes" element={<Reportes />} />
              </Route>

              {/* Por módulo (ajusta los nombres según tu backend) */}
              <Route element={<RequireModule name="Usuarios" />}>
                <Route path="/usuarios" element={<Users />} />
              </Route>

              <Route element={<RequireModule name="Formatos" />}>
                <Route path="/formatos" element={<Formatos />} />
              </Route>

              <Route element={<RequireModule name="Ayuda" />}>
                <Route path="/ayuda" element={<Ayuda />} />
              </Route>



              {/* Configuración (si lo controlas por rol o módulo, cambia aquí) */}
              {/* <Route element={<PrivateRoute requireRole="Administrador" />}>
                <Route path="/configuracion" element={<Configs />} />
              </Route> */}
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
