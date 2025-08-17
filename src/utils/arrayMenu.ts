// src/utils/arrayMenu.ts
import type { MenuItem } from "../shared/types/menu";

export const MENU_ESTATICO: MenuItem[] = [
  { nombre: "Dashboard", ruta: "/", icono: "LayoutDashboard", requireModule: "Dashboard" },

  { nombre: "Usuarios", ruta: "/usuarios", icono: "Users", requireModule: "Usuarios" },

  { nombre: "Motocicletas", ruta: "/motocicletas", icono: "Bike", requireModule: "Motocicletas" },

  { nombre: "Cotizaciones", ruta: "/cotizaciones", icono: "FileEdit", requireModule: "Cotizaciones" },

  { nombre: "Reportes", ruta: "/reportes", icono: "FileText", requireModule: "Reportes" },

  // Configuración: puedes exigir rol o módulo. Aquí exijo rol Admin.
  { nombre: "Configuración", ruta: "/configuracion", icono: "Settings", requireRole: "Administrador" },
  // Si prefieres por módulo:
  // { nombre: "Configuración", ruta: "/configuracion", icono: "Settings", requireModule: "Parametrizaciones" },

  { nombre: "Parametrización", ruta: "/parametrizacion", icono: "Sliders", requireModule: "Parametrizaciones" },

  { nombre: "Solicitudes", ruta: "/solicitudes", icono: "FileSpreadsheet", requireModule: "Solicitudes de facturación" },

  { nombre: "Ayuda", ruta: "/ayuda", icono: "HelpCircle", requireModule: "Ayuda" },

  { nombre: "Formatos", ruta: "/formatos", icono: "FileType", requireModule: "Formatos" },
];
