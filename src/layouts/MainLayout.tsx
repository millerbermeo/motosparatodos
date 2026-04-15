import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar";
import Navbar from "../shared/components/Navbar";

const SIDEBAR_KEY = "sidebar_collapsed";
const LG_BREAKPOINT = 1024;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  const [isDesktop, setIsDesktop] = useState(
    () => window.innerWidth >= LG_BREAKPOINT
  );

  // ✅ FIX PRO: detectar cambio real de breakpoint
  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent) => {
      const desktop = e.matches;

      setIsDesktop(desktop);

      // 🔥 reset limpio al cambiar modo
      setMobileOpen(false);

      // opcional pero recomendado → evita estados raros
      if (!desktop) {
        // en móvil nunca queremos colapsado
        setCollapsed(false);
      }
    };

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });

  // 🔥 clave: solo colapsa en desktop
  const effectiveCollapsed = isDesktop ? collapsed : false;

  return (
    <div className="flex relative w-full overflow-x-hidden">
      {/* Overlay móvil */}
      {mobileOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh
          transition-all duration-300 ease-in-out

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0

          ${effectiveCollapsed ? "lg:w-16" : "lg:w-64"}
          w-64
        `}
      >
        <Sidebar
          collapsed={effectiveCollapsed}
          onToggleCollapse={toggleCollapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Contenido */}
      <div
        className={`
          flex-1 min-h-dvh bg-[#F5F5F5]
          transition-all duration-300
          ml-0
          ${effectiveCollapsed ? "lg:ml-16" : "lg:ml-64"}
          min-w-0
        `}
      >
        {/* Navbar */}
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