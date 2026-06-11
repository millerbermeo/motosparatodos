import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Inbox,
  FileText,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUltimasNotificaciones } from "../../services/notificacionesService";
import { useNotificacionesStore } from "../../store/notificaciones.store";
import { useAuthStore } from "../../store/auth.store";

const NotificacionesPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const rol = useAuthStore((s) => s.user?.rol);

  const { data, isLoading } = useUltimasNotificaciones();
  const notificaciones = data?.data ?? [];

  // Resuelve la URL destino de una notificación según módulo y rol.
  // Créditos: si la URL apunta a "registrar" (crédito creado), el asesor entra
  // a registrar y los demás roles al detalle (mismo código de la URL). Si la URL
  // ya apunta a "detalle" (u otro), se usa tal cual para todos.
  const resolverDestino = (n: any): string => {
    const url: string = n?.url ?? "";
    if (n?.modulo === "creditos" && url.includes("/registrar/") && rol !== "Asesor") {
      const codigo = url.split("/").filter(Boolean).pop() ?? "";
      return `/creditos/detalle/${codigo}`;
    }
    return url;
  };

  // IDs visibles actuales (string estable para deps de efectos)
  const currentIds = useMemo<number[]>(
    () => notificaciones.map((n: any) => Number(n.id)),
    [notificaciones]
  );
  const idsKey = currentIds.join(",");

  const seenIds = useNotificacionesStore((s) => s.seenIds);
  const sync = useNotificacionesStore((s) => s.sync);
  const markSeen = useNotificacionesStore((s) => s.markSeen);

  // Contador de NO leídas (visibles que no están en seenIds)
  const unreadCount = useMemo(() => {
    const seen = new Set(seenIds);
    return currentIds.reduce((acc, id) => (seen.has(id) ? acc : acc + 1), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, seenIds]);

  // Sincroniza el almacenamiento al cambiar el listado (descarta IDs obsoletos)
  useEffect(() => {
    if (currentIds.length > 0) sync(currentIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // Al abrir el panel, marca todas las visibles como leídas
  useEffect(() => {
    if (open && currentIds.length > 0) markSeen(currentIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idsKey]);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Iconos compactos con la paleta limpia del Dashboard
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "success":
        return (
          <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      case "error":
        return (
          <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        );
      case "warning":
        return (
          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg border border-amber-100">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg border border-blue-100">
            <Info className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* 🔔 BOTÓN DE CAMPANA (Combina con tu barra superior) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none
          ${open 
            ? "bg-slate-100 text-blue-600" 
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none ring-2 ring-white">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
            <span className="relative">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {/* 📦 PANEL DESPLEGABLE (Esquinas redondeadas coherentes con tus Cards) */}
      <div
        className={`z-50 rounded-xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right
        max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[64px] max-sm:w-auto
        sm:absolute sm:right-0 sm:mt-2 sm:w-[380px]
        ${
          open
            ? "opacity-100 scale-100 translate-y-0 shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-50 text-slate-700 rounded-md border border-slate-100">
              <Inbox className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-800">
              Notificaciones
            </h3>
          </div>

          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100/50">
              {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
            </span>
          )}
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-400">Cargando...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No tienes notificaciones</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px]">
                Te avisaremos de las actualizaciones del sistema aquí.
              </p>
            </div>
          ) : (
            notificaciones.map((n: any) => (
              <div
                key={n.id}
                className="group flex items-start gap-2.5 px-3.5 py-2.5 hover:bg-slate-50/60 transition-colors duration-150"
              >
                {/* ICONO */}
                <div className="flex-shrink-0 mt-0.5">{getIcon(n.tipo)}</div>

                {/* CONTENIDO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-[13px] font-bold text-slate-800 leading-tight truncate transition-colors duration-150 group-hover:text-blue-600">
                      {n.titulo}
                    </p>
                    <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {n.modulo}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug break-words line-clamp-2 font-normal">
                    {n.mensaje}
                  </p>

                  {n.url && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate(resolverDestino(n));
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                      >
                        <FileText className="w-3 h-3" />
                        {n.modulo === "creditos"
                          ? "Ver crédito"
                          : n.modulo === "cotizaciones"
                          ? "Ver cotización"
                          : "Abrir"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/60 border-t border-slate-100">
          <button
            onClick={() => {
              setOpen(false);
              navigate("/notificaciones");
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver historial completo
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            En vivo
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesPanel;