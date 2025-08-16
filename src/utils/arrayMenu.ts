import type { MenuItem } from "../shared/types/menu";

// ✅ Arreglo estático con 4 módulos
export const MENU_ESTATICO: MenuItem[] = [
  {
    nombre: "Dashboard",
    ruta: "/",
    icono: "LayoutDashboard",
  },
  {
    nombre: "Usuarios",
    ruta: "/usuarios",
    icono: "Users",
  },
   {
    nombre: "Motocicletas",
    ruta: "/motocicletas",
    icono: "Ride",
  },

     {
    nombre: "Cotizaciones",
    ruta: "/cotizaciones",
    icono: "Ride",
  },
  
  {
    nombre: "Reportes",
    ruta: "/reportes",
    icono: "FileText",
  },
  {
    nombre: "Configuración",
    ruta: "/configuracion",
    icono: "Settings",
  },

   {
    nombre: "Parametrización",
    ruta: "/parametrizacion",
    icono: "Sliders",
  },
  {
    nombre: "Solicitudes",
    ruta: "/solicitudes",
    icono: "FileSpreadsheet",
  },
  {
    nombre: "Ayuda",
    ruta: "/ayuda",
    icono: "HelpCircle",
  },
  {
    nombre: "Formatos",
    ruta: "/formatos",
    icono: "FileType",
  },
  
];
