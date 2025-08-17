// MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../shared/components/Sidebar";
import Navbar from "../shared/components/Navbar";

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    // 👇 Evita que el body haga scroll horizontal por cualquier desborde
    <div className="flex relative w-full overflow-x-hidden">
      {/* Sidebar fijo con slide-in */}
  <div
  className={`fixed top-0 left-0 z-40 h-dvh flex items-start transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-[120%]"} w-64`}
>
  <Sidebar />

  {/* Botón pegado al borde derecho del sidebar */}
  <button
    onClick={toggleSidebar}
    className={`absolute top-3  p-2 rounded bg-[#3498DB] text-white shadow ${isOpen ? 'right-[-60px] lg:right-[-60px]' : 'right-[-100px] lg:right-[-100px]'}`}
    aria-label="Toggle sidebar"
  >
    {isOpen ? <X size={20} /> : <Menu size={20} />}
  </button>
</div>


      {/* Contenedor principal */}
      <div
        className={`flex-1 min-h-dvh bg-gray-50 transition-all duration-300
        ${isOpen ? "lg:ml-64" : "ml-0"} 
        min-w-0`}  // 👈 clave: permite que el contenido NO fuerce ancho extra
      >
        {/* Navbar sticky */}
        <div className="sticky top-0 z-30 w-full">
          <Navbar />
        </div>

        {/* Contenido dinámico */}
        <main className="px-5 py-4 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
