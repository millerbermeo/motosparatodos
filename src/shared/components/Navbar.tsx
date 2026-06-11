// src/components/Navbar/Navbar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings, User as UserIcon, Shield } from "lucide-react";
import NotificacionesPanel from "./NotificacionesPanel";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/auth.store";

// ⬇️ importa el store del modal y el componente del perfil
import { useModalStore } from "../../store/modalStore";
import UserPerfil from "../../features/users/UserPerfil";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // ⬇️ función para abrir el modal de perfil
  const open = useModalStore((s) => s.open);
  const openPerfil = React.useCallback(() => {
    const idNumber = Number(user?.user_id ?? 0);
    if (!idNumber) return;
    open(<UserPerfil id={idNumber} />, "Perfil de usuario", {
      size: "lg", // o "xl" si quieres más ancho
      position: "center",
    });
  }, [open, user?.user_id]);

  const handleLogout = async () => {
    const res = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y deberás iniciar nuevamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (res.isConfirmed) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburguesa solo en móvil */}
        <button
          className="btn btn-ghost btn-circle btn-sm lg:hidden hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15px] md:text-base font-semibold text-gray-800 truncate leading-tight">
            Panel de Administración
          </h1>
          <p className="hidden sm:block text-[11px] text-gray-400 leading-tight truncate">
            MotosParaTodos
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">

        <NotificacionesPanel />

        <div className="hidden md:block h-8 w-px bg-gray-200 mx-1" />

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="flex items-center gap-2 rounded-full p-1 pr-1 md:pr-3 hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Menú de usuario" title="Cuenta">
            <div className="avatar">
              <div className="w-9 rounded-full ring-2 ring-gray-100 ring-offset-1">
                <img alt="avatar" src="https://cdn-icons-png.flaticon.com/512/204/204191.png" />
              </div>
            </div>
            <div className="hidden md:flex flex-col items-start min-w-0 max-w-[140px]">
              <span className="text-[13px] font-semibold text-gray-800 leading-tight truncate w-full">
                {user?.name ?? "Usuario"}
              </span>
              <span className="text-[11px] text-gray-400 leading-tight truncate w-full">
                {user?.rol ?? "Sin rol"}
              </span>
            </div>
          </div>

          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            <li className="mb-1">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="avatar">
                  <div className="w-9 rounded-full">
                    <img alt="avatar" src="https://cdn-icons-png.flaticon.com/512/204/204191.png" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {user?.name ?? "Usuario"}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span className="truncate">{user?.rol ?? "Sin rol"}</span>
                  </div>
                </div>
              </div>
            </li>

            <li className="menu-title">
              <span>Cuenta</span>
            </li>

            {/* ⬇️ Abrir modal de perfil (reemplaza navigate("/perfil")) */}
            <li>
              <a onClick={openPerfil}>
                <UserIcon className="w-4 h-4" />
                Perfil
                <span className="badge badge-info badge-sm">Nuevo</span>
              </a>
            </li>

            {(
              user?.rol === "Administrador" ||
              user?.rol === "Lider_marca" ||
              user?.rol === "Lider_punto"
            ) && (
                <li>
                  <a onClick={() => navigate("/configuraciones")}>
                    <Settings className="w-4 h-4" />
                    Configuración
                  </a>
                </li>
              )}


            <li><hr className="my-1" /></li>

            <li>
              <a className="text-red-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
