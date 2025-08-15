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
    nombre: "Reportes",
    ruta: "/reportes",
    icono: "FileText",
  },
  {
    nombre: "Configuración",
    ruta: "/configuracion",
    icono: "Settings",
  },
];
