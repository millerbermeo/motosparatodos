// src/components/Sidebar/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { LogOut } from "lucide-react";
import { MENU_ESTATICO } from "../../utils/arrayMenu";
import type { MenuItem } from "../../shared/types/menu";
import { useAuthStore } from "../../store/auth.store";
import { hasModuleNormalized, hasRoleNormalized } from "../../utils/permissions";
import Swal from "sweetalert2";

// Helper: ícono por nombre (string)
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

// Type guard runtime para detectar padres con children
const isParent = (item: MenuItem): item is MenuItem & { children: MenuItem[] } =>
  Array.isArray((item as any)?.children);

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
  const [openGroup, setOpenGroup] = useState<string | null>(null); // <- solo un submenú abierto

  // 1) Filtrado por permisos (módulos/roles)
  const menus = useMemo(() => {
    if (!user || !token) return [] as MenuItem[];

    const byPerms = (item: MenuItem) => {
      const okModule = hasModuleNormalized(userModules, (item as any).requireModule);
      const okRole = hasRoleNormalized(userRole, (item as any).requireRole);
      return okModule && okRole;
    };

    return MENU_ESTATICO.reduce<MenuItem[]>((acc, item) => {
      if (isParent(item)) {
        const children = item.children
          .filter(byPerms)
          .sort((a, b) => ((a.orden ?? 9999) - (b.orden ?? 9999)));
        if (children.length > 0) {
          acc.push({ ...item, children } as MenuItem);
        }
      } else {
        if (byPerms(item)) acc.push(item);
      }
      return acc;
    }, []).sort((a, b) => ((a.orden ?? 9999) - (b.orden ?? 9999)));
  }, [user, token, userModules, userRole]);

  // 2) Activa item y abre el grupo si la ruta actual cae dentro de un hijo
useEffect(() => {
  const currentPath = location.pathname;
  const firstSegment = currentPath.split("/")[1]; // <-- solo "cotizaciones"

  const leaf = menus.find(
    (m) => !isParent(m) && (m as any).ruta?.split("/")[1] === firstSegment
  ) as (MenuItem & { ruta: string }) | undefined;


    if (leaf) {
      setActiveKey(leaf.nombre);
      setOpenGroup(null); // si estás en un leaf directo, cierra submenús
      return;
    }

    // Si coincide con hijo, marca activo y abre SOLO ese grupo
    let foundParent: string | null = null;
    menus.forEach((m) => {
      if (isParent(m)) {
        const child = m.children.find((c: any) => c.ruta === currentPath);
        if (child) {
          foundParent = m.nombre;
          setActiveKey(child.nombre);
        }
      }
    });

    setOpenGroup(foundParent ?? null);
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

  // Helpers UI
  const isActive = (name: string) => activeKey === name;
  const colorFor = (active: boolean) => (active ? "#0277bd" : "white");

  // Toggle que asegura "solo un submenú abierto"
  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  // Navegar y cerrar submenús al hacer click en cualquier ruta
  const goTo = (ruta: string, nombre: string) => {
    navigate(ruta);
    setActiveKey(nombre);
    setOpenGroup(null); // <- cerrar submenús al navegar
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
              if (!isParent(menu)) {
                const active = isActive(menu.nombre);
                return (
                  <div
                    key={menu.nombre}
                    className={`group flex items-center gap-2 py-3 pr-3 cursor-pointer select-none transition-all
                      ${
                        active
                          ? "text-[#0277bd] bg-gray-50 border-l-4 border-blue-300"
                          : "hover:bg-[#0277bd]/40 text-white"
                      }`}
                    style={{ paddingLeft: "16px" }}
                    onClick={() => {
                      if ((menu as any).ruta) {
                        goTo((menu as any).ruta, menu.nombre);
                      }
                    }}
                  >
                    <LucideIcon
                      name={(menu as any).icono}
                      className="w-4 h-4"
                      color={colorFor(active)}
                    />
                    <span className="flex-1 text-[15px] truncate">{menu.nombre}</span>
                  </div>
                );
              }

              // Item padre con submenú (solo uno puede estar abierto)
              const opened = openGroup === menu.nombre;

              return (
                <div key={menu.nombre}>
                  {/* Header del grupo */}
                  <div
                    className={`group flex items-center gap-2 py-3 pr-3 cursor-pointer select-none transition-all
                      ${opened ? "text-white/90 bg-white/10" : "hover:bg-[#0277bd]/40 text-white"}`}
                    style={{ paddingLeft: "16px" }}
                    onClick={() => toggleGroup(menu.nombre)}
                    aria-expanded={opened}
                    aria-controls={`submenu-${menu.nombre}`}
                    role="button"
                  >
                    <LucideIcon name={(menu as any).icono} className="w-4 h-4" color="white" />
                    <span className="flex-1 text-[15px] truncate">{menu.nombre}</span>
                    <LucideIcon
                      name="ChevronDown"
                      className={`w-4 h-4 transition-transform duration-300 ${opened ? "rotate-180" : ""}`}
                      color="white"
                    />
                  </div>

                  {/* Contenedor animado del submenú */}
                  <div
                    id={`submenu-${menu.nombre}`}
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      opened ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="ml-6">
                      {menu.children.map((child) => {
                        const childActive =
                          isActive(child.nombre) || location.pathname === (child as any).ruta;
                        return (
                          <div
                            key={child.nombre}
                            className={`flex items-center gap-2 py-2 pr-3 cursor-pointer select-none rounded-l-md my-0.5
                              ${
                                childActive
                                  ? "text-[#0277bd] bg-gray-50 border-l-4 border-blue-300"
                                  : "hover:bg-[#0277bd]/30 text-white/95"
                              }`}
                            style={{ paddingLeft: "16px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              goTo((child as any).ruta, child.nombre); // <- navega y cierra submenús
                            }}
                          >
                            <LucideIcon
                              name={(child as any).icono}
                              className="w-4 h-4"
                              color={colorFor(childActive)}
                            />
                            <span className="flex-1 text-[14px] truncate">{child.nombre}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-4 py-3 text-white/80 text-sm">No tienes módulos habilitados.</p>
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
