import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { LogOut } from "lucide-react";
import { MENU_ESTATICO } from "../../utils/arrayMenu";
import type { MenuItem } from "../types/menu";

// Helper para devolver componente de ícono por nombre
function LucideIcon({
  name,
  className,
  color,
}: {
  name?: string;
  className?: string;
  color?: string;
}) {
  const Fallback = Icons.Menu;
  const IconComp = (name && (Icons as any)[name]) || Fallback;
  return <IconComp className={className} color={color} />;
}

// Buscar key activa por ruta
const findActiveKey = (menus: MenuItem[], path: string): string | null => {
  for (const menu of menus) {
    if (menu.ruta === path) return menu.nombre;
  }
  return null;
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Menú memorizado (estático)
  const menus = useMemo(() => MENU_ESTATICO, []);

  // Sincroniza URL con ítem activo
  useEffect(() => {
    const currentPath = location.pathname;
    const key = findActiveKey(menus, currentPath);
    setActiveKey(key);
  }, [location.pathname, menus]);

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((menu) => {
      const key = menu.nombre;
      const isActive = activeKey === key;

      return (
        <div
          key={key}
          className={`group flex items-center gap-2 py-3 pr-3 cursor-pointer select-none transition-all
            ${
              isActive
                ? "text-[#0277bd] bg-gray-50 border-l-4 border-blue-300"
                : "hover:bg-[#0277bd]/40 text-white"
            }`}
          style={{ paddingLeft: "16px" }}
          onClick={() => {
            if (menu.ruta) {
              navigate(menu.ruta);
              setActiveKey(key);
            }
          }}
        >
          <LucideIcon
            name={menu.icono}
            className="w-4 h-4"
            color={isActive ? "#0277bd" : "white"}
          />
          <span className="flex-1 text-[15px] truncate">{menu.nombre}</span>
        </div>
      );
    });
  };

  return (
    <div className="w-[260px] h-screen bg-[#3498DB] flex flex-col justify-between overflow-y-auto">
      <div className="pt-4">{renderMenuItems(menus)}</div>
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-md py-2 transition"
          onClick={() => alert("Logout estático")}
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
