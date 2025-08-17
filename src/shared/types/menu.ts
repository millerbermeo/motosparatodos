// src/shared/types/menu.ts
export interface MenuItem {
  nombre: string;
  ruta: string;
  icono: string;               // nombre del ícono de lucide-react
  requireModule?: string;      // nombre del módulo que exige este item
  requireRole?: string;        // rol que exige este item (p.ej. "Administrador")
}
