// src/shared/types/menu.ts
export interface MenuItemBase {
  nombre: string;
  icono: string;            // nombre del icono (lucide-react) como string
  requireModule?: string;
  requireRole?: string;
  orden?: number;
}

// Ítem hoja (clickeable): requiere ruta y NO tiene children
export interface MenuLeaf extends MenuItemBase {
  ruta: string;
  children?: never;
}

// Ítem padre (agrupador): tiene children y NO requiere ruta
export interface MenuParent extends MenuItemBase {
  children: MenuLeaf[];
  ruta?: never;
}

// Unión final para usar en todo el app
export type MenuItem = MenuLeaf | MenuParent;

// Helper opcional para type-guard
export const isParent = (item: MenuItem): item is MenuParent =>
  Array.isArray((item as MenuParent).children);
