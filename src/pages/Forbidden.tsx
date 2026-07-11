import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const rol = useAuthStore((s) => s.user?.rol);

  return (
    <main className="min-h-screen w-full bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-error to-orange-500 px-6 py-8 flex flex-col items-center text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight">403</div>
            <div className="text-white/90 font-medium">Acceso denegado</div>
          </div>

          <div className="p-6 md:p-8 text-center space-y-2">
            <h1 className="text-lg font-semibold text-base-content">
              No tienes permiso para ver esta página
            </h1>
            <p className="text-sm text-base-content/70">
              Tu rol{rol ? <> (<span className="font-medium text-base-content">{rol}</span>)</> : ''} no
              tiene acceso a este módulo. Si crees que es un error, contacta a un administrador.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline w-full sm:w-auto gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver atrás
              </button>

              <Link to="/" className="btn btn-success text-white w-full sm:w-auto gap-2">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Forbidden;
