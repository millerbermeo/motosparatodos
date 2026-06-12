import React, { useEffect, useState } from "react";
import {
  Bell,
  Inbox,
  FileText,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificaciones, type Notificacion } from "../../services/notificacionesService";
import { moduloBadgeClass } from "../../utils/moduloColor";

/* =======================
   Utils
   ======================= */
const humanizeDesde = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "justo ahora";
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hrs > 0) return `hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  if (min > 0) return `hace ${min} minuto${min > 1 ? "s" : ""}`;
  return "justo ahora";
};

const formatFechaLarga = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

const getIcon = (tipo: string) => {
  switch (tipo) {
    case "success":
      return (
        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    case "error":
      return (
        <div className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    case "warning":
      return (
        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl border border-blue-100">
          <Info className="w-4 h-4" />
        </div>
      );
  }
};

/* =======================
   Componente
   ======================= */
const NotificacionesHistorial: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [modulo, setModulo] = useState("");

  // Debounce de la búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  const { data, isLoading, isFetching, isError } = useNotificaciones(page, q, tipo, modulo);

  // Lista acumulada (modo "cargar más")
  const [rows, setRows] = useState<Notificacion[]>([]);
  useEffect(() => {
    if (!data?.data) return;
    const serverPage = Number(data.pagination?.current_page ?? page);
    setRows((prev) => {
      if (serverPage <= 1) return data.data;
      const ids = new Set(prev.map((n) => n.id));
      return [...prev, ...data.data.filter((n) => !ids.has(n.id))];
    });
  }, [data, page]);

  const tipos = data?.filters?.tipos ?? [];
  const modulos = data?.filters?.modulos ?? [];

  const total = Number(data?.pagination?.total ?? rows.length) || 0;
  const perPage = Number(data?.pagination?.per_page ?? 25) || 25;
  const currentPage = Number(data?.pagination?.current_page ?? page) || page;
  const lastPage = Number(data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / perPage)));

  const hayMas = currentPage < lastPage;
  const cargarMas = () => setPage((p) => p + 1);

  const hayFiltros = q !== "" || tipo !== "" || modulo !== "";
  const limpiarFiltros = () => {
    setQInput("");
    setQ("");
    setTipo("");
    setModulo("");
    setPage(1);
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-base-200">
        <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
          <Inbox className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Historial de notificaciones</h2>
          <p className="text-xs text-slate-400">{total} en total</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 px-5 py-3.5 border-b border-base-200">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Buscar por título o mensaje…"
            className="input input-sm input-bordered w-full pl-9 rounded-xl"
          />
        </label>

        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setPage(1);
          }}
          className="select select-sm select-bordered rounded-xl"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={modulo}
          onChange={(e) => {
            setModulo(e.target.value);
            setPage(1);
          }}
          className="select select-sm select-bordered rounded-xl"
        >
          <option value="">Todos los módulos</option>
          {modulos.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {hayFiltros && (
          <button onClick={limpiarFiltros} className="btn btn-sm btn-ghost rounded-xl gap-1 text-slate-500">
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* LISTA */}
      <div className="divide-y divide-base-200 min-h-[300px]">
        {isLoading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-400">Cargando…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-error">
            <AlertCircle className="w-6 h-6 mb-2" />
            <p className="text-sm font-semibold">Error al cargar las notificaciones</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 mb-2.5">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Sin resultados</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {hayFiltros ? "Prueba ajustando los filtros." : "Aún no hay notificaciones."}
            </p>
          </div>
        ) : (
          rows.map((n, i) => (
            <div
              key={n.id}
              className={`group flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-blue-50/40 ${
                i % 2 === 0 ? "bg-white" : "bg-slate-50/70"
              } ${n.url ? "cursor-pointer" : ""}`}
              onClick={() => n.url && navigate(n.url)}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(n.tipo)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {n.titulo}
                  </p>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${moduloBadgeClass(n.modulo)}`}>
                    {n.modulo}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed break-words">{n.mensaje}</p>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-slate-400" title={formatFechaLarga(n.created_at)}>
                    {humanizeDesde(n.created_at)} · {formatFechaLarga(n.created_at)}
                  </span>

                  {n.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(n.url as string);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="w-3 h-3" />
                      Abrir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CARGAR MÁS */}
      {rows.length > 0 && (
        <div className="flex flex-col items-center gap-1.5 px-5 py-4 border-t border-base-200">
          {hayMas ? (
            <button
              onClick={cargarMas}
              disabled={isFetching}
              className="btn btn-sm btn-ghost rounded-xl bg-base-200 hover:bg-base-300 gap-2 min-w-[160px]"
            >
              {isFetching ? (
                <>
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Cargando…
                </>
              ) : (
                "Cargar más"
              )}
            </button>
          ) : (
            <span className="text-xs text-base-content/40">No hay más notificaciones</span>
          )}
          <span className="text-[11px] text-base-content/40">
            Mostrando {rows.length} de {total}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificacionesHistorial;
