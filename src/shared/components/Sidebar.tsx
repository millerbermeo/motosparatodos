// src/components/Sidebar/Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, LogOut, Moon, Sun,
  // Iconos del menú (importados por nombre para permitir tree-shaking)
  Menu,
  Bike, Building2, FileEdit, FileSpreadsheet, FileText, FileType,
  Gift, HelpCircle, LayoutDashboard, Settings, Shield, ShieldCheck,
  Store, User, Users, Wrench,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { useThemeStore } from "../../store/theme.store";
import { MENU_ESTATICO } from "../../utils/arrayMenu";
import type { MenuItem } from "../../shared/types/menu";
import { useAuthStore } from "../../store/auth.store";
import { useLoaderStore } from "../../store/loader.store";
import { hasModuleNormalized, hasRoleNormalized } from "../../utils/permissions";
import Swal from "sweetalert2";

// Mapa de solo los iconos usados por el menú (evita el barrel `import *`)
const MENU_ICONS: Record<string, LucideIconType> = {
  Bike, Building2, FileEdit, FileSpreadsheet, FileText, FileType,
  Gift, HelpCircle, LayoutDashboard, Settings, Shield, ShieldCheck,
  Store, User, Users, Wrench,
};

function LucideIcon({
  name,
  className,
  color,
}: {
  name?: string;
  className?: string;
  color?: string;
}) {
  const IconComp = (name && MENU_ICONS[name]) || Menu;
  return <IconComp className={className} color={color} />;
}

const isParent = (item: MenuItem): item is MenuItem & { children: MenuItem[] } =>
  Array.isArray((item as any)?.children);

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const userModules = user?.modules ?? [];
  const userRole = user?.rol;

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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
        if (children.length > 0) acc.push({ ...item, children } as MenuItem);
      } else {
        if (byPerms(item)) acc.push(item);
      }
      return acc;
    }, []).sort((a, b) => ((a.orden ?? 9999) - (b.orden ?? 9999)));
  }, [user, token, userModules, userRole]);

  useEffect(() => {
    const currentPath = location.pathname;
    const firstSegment = currentPath.split("/")[1];

    const leaf = menus.find(
      (m) => !isParent(m) && (m as any).ruta?.split("/")[1] === firstSegment
    ) as (MenuItem & { ruta: string }) | undefined;

    if (leaf) {
      setActiveKey(leaf.nombre);
      setOpenGroup(null);
      return;
    }

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

  const isActive = (name: string) => activeKey === name;
  const colorFor = (active: boolean) => (active ? "#0277bd" : "white");

  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  const { show } = useLoaderStore();

  const goTo = (ruta: string, nombre: string) => {
    if (ruta && ruta !== location.pathname) show(); // loader mientras carga la nueva ruta/chunk
    navigate(ruta);
    setActiveKey(nombre);
    setOpenGroup(null);
    onNavigate?.();
  };

  return (
    <div
      className={`h-screen ${theme === "dark" ? "bg-base-300" : "bg-[#3498DB]"} flex flex-col justify-between overflow-y-auto overflow-x-hidden transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Usuario */}
        <div
          className={`flex items-center gap-3 p-4 border-b border-white/20 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/204/204191.png"
            alt="avatar"
            className="w-10 h-10 rounded-full border border-white/50 shrink-0"
          />
          {!collapsed && (
            <div className="text-white overflow-hidden">
              <p className="font-semibold leading-tight truncate">{user?.name ?? "Usuario"}</p>
              <p className="text-sm text-white/70 truncate">{user?.rol ?? ""}</p>
            </div>
          )}
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
                    title={collapsed ? menu.nombre : undefined}
                    className={`flex items-center gap-2 py-3 cursor-pointer select-none transition-all
                      ${collapsed ? "justify-center px-0" : "pr-3"}
                      ${
                        active
                          ? "text-[#0277bd] bg-base-200 border-l-4 border-blue-300"
                          : "hover:bg-[#0277bd]/40 text-white"
                      }`}
                    style={collapsed ? {} : { paddingLeft: "16px" }}
                    onClick={() => {
                      if ((menu as any).ruta) goTo((menu as any).ruta, menu.nombre);
                    }}
                  >
                    <LucideIcon
                      name={(menu as any).icono}
                      className="w-5 h-5 shrink-0"
                      color={colorFor(active)}
                    />
                    {!collapsed && (
                      <span className="flex-1 text-[15px] truncate">{menu.nombre}</span>
                    )}
                  </div>
                );
              }

              // Padre con submenú
              const opened = !collapsed && openGroup === menu.nombre;

              return (
                <div key={menu.nombre}>
                  <div
                    title={collapsed ? menu.nombre : undefined}
                    className={`flex items-center gap-2 py-3 cursor-pointer select-none transition-all
                      ${collapsed ? "justify-center px-0" : "pr-3"}
                      ${opened ? "text-white/90 bg-white/10" : "hover:bg-[#0277bd]/40 text-white"}`}
                    style={collapsed ? {} : { paddingLeft: "16px" }}
                    onClick={() => {
                      if (collapsed) {
                        // Expandir sidebar y abrir el grupo de una vez
                        onToggleCollapse?.();
                        setOpenGroup(menu.nombre);
                      } else {
                        toggleGroup(menu.nombre);
                      }
                    }}
                    role="button"
                    aria-expanded={opened}
                  >
                    <LucideIcon
                      name={(menu as any).icono}
                      className="w-5 h-5 shrink-0"
                      color="white"
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-[15px] truncate">{menu.nombre}</span>
                        <LucideIcon
                          name="ChevronDown"
                          className={`w-4 h-4 transition-transform duration-300 ${
                            opened ? "rotate-180" : ""
                          }`}
                          color="white"
                        />
                      </>
                    )}
                  </div>

                  {/* Submenú — solo visible cuando expandido */}
                  {!collapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        opened ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <div className="ml-6">
                        {menu.children.map((child) => {
                          const childActive =
                            isActive(child.nombre) ||
                            location.pathname === (child as any).ruta;
                          return (
                            <div
                              key={child.nombre}
                              className={`flex items-center gap-2 py-2 pr-3 cursor-pointer select-none rounded-l-md my-0.5
                                ${
                                  childActive
                                    ? "text-[#0277bd] bg-base-200 border-l-4 border-blue-300"
                                    : "hover:bg-[#0277bd]/30 text-white/95"
                                }`}
                              style={{ paddingLeft: "16px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                goTo((child as any).ruta, child.nombre);
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
                  )}
                </div>
              );
            })
          ) : (
            <p className="px-4 py-3 text-white/80 text-sm">No tienes módulos habilitados.</p>
          )}
        </div>
      </div>

      {/* Footer: tema + colapsar (solo desktop) + logout */}
      <div className="p-3 space-y-2 border-t border-white/20">
        {/* Toggle switch modo claro/oscuro */}
        <label
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 bg-white/15 hover:bg-white/25 text-white rounded-md py-2 px-3 transition cursor-pointer`}
        >
          {!collapsed && (
            <span className="flex items-center gap-2 font-medium text-sm">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 shrink-0" />
              )}
              {theme === "dark" ? "Modo oscuro" : "Modo claro"}
            </span>
          )}
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={theme === "dark"}
            onChange={toggleTheme}
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          />
        </label>

        {/* Botón colapsar — solo desktop */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={`hidden lg:flex w-full items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white rounded-md py-2 transition font-medium text-sm`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Colapsar</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          title={collapsed ? "Cerrar sesión" : undefined}
          className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 text-white rounded-md py-2 transition font-medium text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
