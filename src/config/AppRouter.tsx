// routes/AppRouter.tsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "./PrivateRoute";
import RequireModule from "./RequireModule"; // 👈
import { useLoaderStore } from "../store/loader.store";
import Loader from "../utils/Loader";
import Configuraciones from "../pages/Configuraciones";


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
const CrearCotizaciones2 = lazy(() => import("../pages/CrearCotizaciones2")); // 👈 crea esta página simple

const CreditosForm = lazy(() => import("../pages/CreditosForm")); // 👈 crea esta página simple
const DetalleEstado = lazy(() => import("../pages/DetalleEstado")); // 👈 crea esta página simple
const CreditoDetalle = lazy(() => import("../features/creditos/CreditoDetalle")); // 👈 crea esta página simple
const CreditoDetalleAdmin = lazy(() => import("../features/creditos/CreditoDetalleAdmin")); // 👈 crea esta página simple
const CreditoDetalleAsesor = lazy(() => import("../features/creditos/CreditoDetalleAsesor")); // 👈 crea esta página simple

const FacturarCredito = lazy(() => import("../features/creditos/forms/SolictudFacturarCredito")); // 👈 crea esta página simple
const FacturarCreditoSolicitud = lazy(() => import("../features/creditos/forms/FacturarCreditoSolicitud")); // 👈 crea esta página simple

const RegistrarFacturacion = lazy(() => import("../pages/RegistrarFacturacion")); // 👈 crea esta página simple

const Garantia = lazy(() => import("../pages/Garantia")); // 👈 crea esta página simple
const SolicitarFacturacionPage = lazy(() => import("../pages/SolicitarFacturacionPageContadoTercero"));

const Dis = lazy(() => import("../pages/Dis"));

const Notificaciones = lazy(() => import("../pages/Notificaciones"));

const DetallesFacturacion = lazy(() => import("../pages/DetallesFacturacion"));
const ActaFinal = lazy(() => import("../pages/ActaFinal"));
const Fallback: React.FC = () => {
  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    show(); // se monta -> mostrar loader
    return () => hide(); // se desmonta -> ocultar loader
  }, [show, hide]);

  return <Loader />; // 👈 se renderiza el overlay
};

// Oculta el loader de navegación cuando la nueva ruta ya quedó montada.
// Va dentro de <Suspense> y antes de <Routes>: solo se monta cuando el
// contenido (chunk) terminó de cargar, así no apaga el loader durante la carga.
const RouteChangeHide: React.FC = () => {
  const location = useLocation();
  const hide = useLoaderStore((s) => s.hide);

  React.useEffect(() => {
    hide();
  }, [location.pathname, hide]);

  return null;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <RouteChangeHide />
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Bloque privado (requiere estar autenticado) */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              {/* Home: solo autenticación */}
              <Route path="/" element={<Home />} />

              {/* Notificaciones: disponible para todos los autenticados */}
              <Route path="/notificaciones" element={<Notificaciones />} />

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
                <Route path="/creditos/crear-cotizaciones-credito" element={<CrearCotizaciones2 />} />

                <Route path="/cotizaciones" element={<Cotizaciones />} />
                <Route path="/cotizaciones/:id" element={<Detalles />} /> {/* 👈 aquí */}
                <Route path="/cotizaciones/estado/:id" element={<DetalleEstado />} /> {/* 👈 aquí */}
                <Route path="/garantia" element={<Garantia />} /> {/* 👈 aquí */}
                <Route path="/cotizaciones/facturacion/:cotizacionId" element={<SolicitarFacturacionPage />} />

              </Route>

              <Route element={<RequireModule name="Créditos" />}>

                <Route path="/creditos" element={<Creditos />} />
                <Route path="/creditos/registrar/:id" element={<CreditosForm />} />
                <Route path="/creditos/detalle/:id" element={<CreditoDetalle />} />
                <Route path="/creditos/detalle/cambiar-estado/:id" element={<CreditoDetalleAdmin />} />
                <Route path="/creditos/detalle/cerrar-credito/:id/:cot" element={<CreditoDetalleAsesor />} />
                <Route path="/creditos/detalle/facturar-credito/:id/:cot" element={<FacturarCredito />} />
                <Route path="/creditos/detalle/facturar-solicitud/:id" element={<FacturarCreditoSolicitud />} />

                <Route path="/solicitudes/:id" element={<RegistrarFacturacion />} />


              </Route>


              <Route element={<RequireModule name="Solicitudes de facturación" />}>
                <Route path="/solicitudes" element={<SolicitudFacturacion />} />
                <Route path="/solicitudes/detalle/facturar-credito/:id" element={<FacturarCredito />} />
                <Route path="/solicitudes/detalle/facturar-solicitud/:id" element={<FacturarCreditoSolicitud />} />
                <Route path="/solicitudes/facturacion/:id" element={<DetallesFacturacion />} />
                <Route path="/solicitudes/actas/final/:id" element={<ActaFinal />} />

              </Route>

              <Route element={<RequireModule name="Configuraciones" />}>
                <Route path="/configuraciones" element={<Configuraciones />} />
              </Route>




              {/* -------------------- SUBMENU PUNTOS -------------------- */}

              <Route element={<RequireModule name="Puntos" />}>
                <Route path="/empresas" element={<Empresas />} />
              </Route>

              <Route element={<RequireModule name="Puntos" />}>
                <Route path="/agencias" element={<Agencias />} />
              </Route>


              <Route element={<RequireModule name="Puntos" />}>
                <Route path="/distribuidoras" element={<Dis />} />
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
