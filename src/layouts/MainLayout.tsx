// MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar";
import Navbar from "../shared/components/Navbar";

const SIDEBAR_KEY = "sidebar_collapsed";

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });

  return (
    <div className="flex relative w-full overflow-x-hidden">

      {/* Overlay oscuro — solo móvil cuando el sidebar está abierto */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh
          transition-all duration-300 ease-in-out
          /* móvil: desliza dentro/fuera */
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          /* desktop: siempre visible, ancho varía */
          lg:translate-x-0
          ${collapsed ? "lg:w-16" : "lg:w-64"}
          w-64
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Contenedor principal — se desplaza en desktop según el ancho del sidebar */}
      <div
        className={`
          flex-1 min-h-dvh bg-[#F5F5F5]
          transition-all duration-300
          ml-0
          ${collapsed ? "lg:ml-16" : "lg:ml-64"}
          min-w-0
        `}
      >
        {/* Navbar sticky con botón hamburguesa para móvil */}
        <div className="sticky top-0 z-30 w-full">
          <Navbar onMenuClick={() => setMobileOpen((p) => !p)} />
        </div>

        <main className="px-5 py-4 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
