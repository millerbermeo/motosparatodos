// src/components/Sidebar/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { LogOut } from "lucide-react";
import { MENU_ESTATICO } from "../../utils/arrayMenu";
import type { MenuItem } from "../../shared/types/menu";
import { useAuthStore } from "../../store/auth.store";
import { hasModuleNormalized, hasRoleNormalized } from "../../utils/permissions";
import Swal from "sweetalert2"; // 👈 importa SweetAlert2

// Helper ícono por nombre
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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // auth
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const userModules = user?.modules ?? [];
  const userRole = user?.rol;

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const menus = useMemo(() => {
    if (!user || !token) return [] as MenuItem[];
    return MENU_ESTATICO.filter((item) => {
      const okModule = hasModuleNormalized(userModules, item.requireModule);
      const okRole = hasRoleNormalized(userRole, item.requireRole);
      return okModule && okRole;
    });
  }, [user, token, userModules, userRole]);

  useEffect(() => {
    const currentPath = location.pathname;
    const key = menus.find((m) => m.ruta === currentPath)?.nombre ?? null;
    setActiveKey(key);
  }, [location.pathname, menus]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y deberás iniciar nuevamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="w-[260px] h-screen bg-[#3498DB] flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Usuario logueado */}
        <div className="flex items-center gap-3 p-4 border-b border-white/20">
          <img
            src="https://cdn-icons-png.flaticon.com/512/204/204191.png"
            alt="avatar"
            className="w-10 h-10 rounded-full border border-white/50"
          />
          <div className="text-white">
            <p className="font-semibold leading-tight">{user?.name ?? "Usuario"}</p>
            <p className="text-sm text-white/70">{user?.username ?? ""}</p>
          </div>
        </div>

        {/* Menú */}
        <div className="pt-4">
          {menus.length > 0 ? (
            menus.map((menu) => {
              const isActive = activeKey === menu.nombre;
              return (
                <div
                  key={menu.nombre}
                  className={`group flex items-center gap-2 py-3 pr-3 cursor-pointer select-none transition-all
                    ${isActive
                      ? "text-[#0277bd] bg-gray-50 border-l-4 border-blue-300"
                      : "hover:bg-[#0277bd]/40 text-white"
                    }`}
                  style={{ paddingLeft: "16px" }}
                  onClick={() => {
                    if (menu.ruta) {
                      navigate(menu.ruta);
                      setActiveKey(menu.nombre);
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
            })
          ) : (
            <p className="px-4 py-3 text-white/80 text-sm">
              No tienes módulos habilitados.
            </p>
          )}
        </div>
      </div>

      {/* Logout con confirmación */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-md py-2 transition"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
