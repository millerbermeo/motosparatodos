// src/utils/arrayMenu.ts
import type { MenuItem } from "../shared/types/menu";

export const MENU_ESTATICO: MenuItem[] = [

  { nombre: "Dashboard", ruta: "/", icono: "LayoutDashboard", requireModule: "Dashboard", orden: 1 },
  { nombre: "Clientes", ruta: "/clientes", icono: "Users", requireModule: "Clientes", orden: 2 },
  { nombre: "Motocicletas", ruta: "/motocicletas", icono: "Bike", requireModule: "Motocicletas", orden: 3 },
  { nombre: "Cotizaciones", ruta: "/cotizaciones", icono: "FileEdit", requireModule: "Cotizaciones", orden: 4 },
  { nombre: "Créditos", ruta: "/creditos", icono: "FileEdit", requireModule: "Creditos", orden: 5 },
  { nombre: "Solicitud de facturación", ruta: "/solicitudes", icono: "FileSpreadsheet", requireModule: "Solicitudes de facturación", orden: 6 },
  { nombre: "Parametrizacion", ruta: "/parametrizacion", icono: "Config", requireModule: "Parametrizaciones", orden: 6 },

  // PUNTOS (submenu)
  {
    nombre: "Puntos",
    icono: "Store",
    orden: 7,
    children: [
      { nombre: "Empresas", ruta: "/empresas", icono: "Building2", requireModule: "Puntos", orden: 1 },
      { nombre: "Agencias", ruta: "/agencias", icono: "FileType", requireModule: "Puntos", orden: 2 },
    ],
  },

  // ALERTAS (submenu)
  {
    nombre: "Alertas",
    icono: "HelpCircle",
    orden: 8,
    children: [
      { nombre: "Cumpleaños", ruta: "/happy", icono: "Gift", requireModule: "Alertas", orden: 1 },
      { nombre: "Soat", ruta: "/soat", icono: "Shield", requireModule: "Alertas", orden: 2 },
      { nombre: "Revisiones", ruta: "/revisiones", icono: "Wrench", requireModule: "Alertas", orden: 3 },
    ],
  },

  { nombre: "Reportes", ruta: "/reportes", icono: "FileText", requireModule: "Reportes", orden: 9 },
  { nombre: "Usuarios", ruta: "/usuarios", icono: "User", requireModule: "Usuarios", orden: 10 },
  { nombre: "Formatos", ruta: "/formatos", icono: "FileType", requireModule: "Formatos", orden: 11 },
  { nombre: "Ayuda", ruta: "/ayuda", icono: "HelpCircle", requireModule: "Ayuda", orden: 12 },
];
