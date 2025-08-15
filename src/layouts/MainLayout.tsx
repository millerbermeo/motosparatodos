// MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../shared/components/Sidebar";   // ajusta la ruta
import Navbar from "../shared/components/Navbar";
// import NavbarStatic from "../components/NavbarStatic";     // ajusta la ruta

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <div className="flex relative">
      {/* Sidebar fijo con slide-in */}
      <div
        className={`fixed top-0 z-40 left-0 h-screen transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-[120%]"} w-64`}
      >
        <Sidebar />
      </div>

      {/* Botón toggle siempre visible */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-3.5 cursor-pointer z-40 p-2 rounded bg-[#3498DB] text-white transition-all duration-300
        ${isOpen ? "left-[280px]" : "left-4"}`}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Contenedor principal */}
      <div
        className={`flex-1 min-h-screen bg-gray-50 transition-all duration-300
        ${isOpen ? "lg:ml-64" : "ml-0"}`}
      >
        {/* Navbar sticky */}
        <div className="sticky top-0 z-30">
          <Navbar />
        </div>

        {/* Contenido dinámico */}
        <main className="px-5 py-4">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
