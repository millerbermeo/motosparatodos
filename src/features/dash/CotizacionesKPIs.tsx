// src/components/dashboard/CotizacionesKPIs.tsx (daisyUI color refresh, sin rosado/morado)
import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  DollarSign,
  CalendarRange,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useDashboardCotizacionesKPIs } from "../../services/dash/cotizacionesDash";

// --- Utilities --------------------------------------------------------------
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v || 0);

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// Paleta sin secondary (morado) ni tonos rosados. Priorizamos info/warning/accent/success/primary
const palette = [
  { dot: "bg-info", progress: "progress-info" },
  { dot: "bg-warning", progress: "progress-warning" },
  { dot: "bg-accent", progress: "progress-accent" },
  { dot: "bg-success", progress: "progress-success" },
  { dot: "bg-primary", progress: "progress-primary" },
  { dot: "bg-error", progress: "progress-error" },
];

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const monthBounds = (offsetMonths = 0) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offsetMonths;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return { desde: toISODate(first), hasta: toISODate(last) };
};

// --- Skeletons & Atoms ------------------------------------------------------
const SkeletonStat: React.FC = () => (
  <div className="stats shadow bg-base-100/60 backdrop-blur border border-base-200/50 rounded-2xl">
    <div className="stat animate-pulse">
      <div className="stat-title h-4 w-28 bg-base-200 rounded" />
      <div className="stat-value h-7 w-24 mt-2 bg-base-200 rounded" />
    </div>
  </div>
);

const IconChip: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={cx(
    "inline-flex items-center justify-center rounded-full p-2 text-base-100",
    "shadow-sm",
    className
  )}>
    {children}
  </span>
);

const KpiStat: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
}> = ({ icon, title, value, color = "info" }) => (
  <div className={cx(
    "stats rounded-2xl shadow transition hover:shadow-lg",
    "bg-base-100/70 border border-base-200/60"
  )}>
    <div className="stat">
      <div className="stat-title flex items-center gap-2 text-base-content/70">
        <IconChip className={`bg-${color}`}>{icon}</IconChip>
        <span className="font-medium">{title}</span>
      </div>
      <div className={`stat-value text-${color}`}>{value}</div>
    </div>
  </div>
);

// --- Main Component ---------------------------------------------------------

type Props = {
  /** Filtro opcional solo para el alcance "mes" (rango). "Hoy" no usa estos filtros */
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  /** Auto-refresh en ms (ej: 60_000 = 1 min). Por defecto, 30s en el hook. */
  refetchInterval?: number;
  className?: string;
};

const CotizacionesKPIs: React.FC<Props> = ({ desde, hasta, refetchInterval, className }) => {
  // Estado de UI (inputs)
  const [desdeInput, setDesdeInput] = useState<string>(desde ?? "");
  const [hastaInput, setHastaInput] = useState<string>(hasta ?? "");
  // Estado aplicado al hook (sólo cambia al hacer "Aplicar" o presets)
  const [applied, setApplied] = useState<{ desde?: string; hasta?: string }>({
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  });

  const invalidRange = useMemo(
    () => !!(desdeInput && hastaInput && desdeInput > hastaInput),
    [desdeInput, hastaInput]
  );

  const applyFilters = () => {
    if (invalidRange) return;
    setApplied({
      ...(desdeInput ? { desde: desdeInput } : {}),
      ...(hastaInput ? { hasta: hastaInput } : {}),
    });
  };

  const clearFilters = () => {
    setDesdeInput("");
    setHastaInput("");
    setApplied({});
  };

  const setThisMonth = () => {
    const { desde, hasta } = monthBounds(0);
    setDesdeInput(desde);
    setHastaInput(hasta);
    setApplied({ desde, hasta });
  };

  const setLastMonth = () => {
    const { desde, hasta } = monthBounds(-1);
    setDesdeInput(desde);
    setHastaInput(hasta);
    setApplied({ desde, hasta });
  };

  const { data, isLoading, isFetching, error } = useDashboardCotizacionesKPIs(applied, { refetchInterval });

  const modo = data?.filters?.alcance_mes?.modo ?? "mes_actual";
  const labelMes = modo === "rango" ? "Cotizaciones (rango)" : "Cotizaciones (mes)";
  const labelMonto = modo === "rango" ? "Monto (rango)" : "Monto (mes)";

  const totalMes = data?.kpis?.cotizaciones_mes_total ?? 0;
  const estados = data?.cotizaciones_mes_por_estado ?? [];
  const totalEstados = sum(estados.map((e) => e.total));
  const basePct = totalMes > 0 ? totalMes : totalEstados;

  return (
    <section className={cx("w-full space-y-4", className)}>
      {/* Filtros */}
      <div className={cx(
        "card border-success bg-[#F1FCF6] border ",
        "rounded-2xl"
      )}>
        <div className="card-body gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="card-title flex items-center gap-2 text-base-content">
              <CalendarRange className="w-5 h-5" />
              Filtros (rango de fechas)
              <span className={cx(
                "badge badge-soft hidden sm:inline-flex",
                modo === "rango" && "badge-primary",
                modo === "mes_actual" && "badge-info"
              )}>
                {modo}
              </span>
            </h3>
            {isFetching && !isLoading && (
              <span className="loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Fecha desde */}
            <div className="form-control col-span-1 lg:col-span-3">
              <label className="label">
                <span className="label-text">Desde</span>
              </label>
              <input
                type="date"
                className={cx("input input-bordered w-full", invalidRange && "input-error")}
                value={desdeInput}
                onChange={(e) => setDesdeInput(e.target.value)}
              />
            </div>

            {/* Fecha hasta */}
            <div className="form-control col-span-1 lg:col-span-3">
              <label className="label">
                <span className="label-text">Hasta</span>
              </label>
              <input
                type="date"
                className={cx("input input-bordered w-full", invalidRange && "input-error")}
                value={hastaInput}
                onChange={(e) => setHastaInput(e.target.value)}
              />
            </div>

            {/* Presets */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-end">
              <div className="flex w-full gap-2">
                <button
                  className="btn btn-outline btn-warning btn-sm sm:btn-md flex-1"
                  type="button"
                  onClick={setThisMonth}
                  title="Usar mes actual"
                >
                  Este mes
                </button>
                <button
                  className="btn btn-outline btn-info btn-sm sm:btn-md flex-1"
                  type="button"
                  onClick={setLastMonth}
                  title="Usar mes pasado"
                >
                  Mes pasado
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-end">
              <div className="flex w-full gap-2 lg:justify-end">
                <button
                  className="btn btn-ghost btn-sm sm:btn-md flex-1 sm:flex-none sm:w-auto"
                  type="button"
                  onClick={clearFilters}
                  title="Quitar filtros"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Limpiar
                </button>
                <button
                  className="btn btn-success btn-sm sm:btn-md flex-1 sm:flex-none sm:w-auto"
                  type="button"
                  onClick={applyFilters}
                  disabled={invalidRange}
                  title="Aplicar filtros"
                >
                  Aplicar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {invalidRange && (
            <div className="mt-1 text-sm text-error flex items-center gap-2">
              <span className="badge badge-error badge-sm" />
              El campo <b>Desde</b> no puede ser mayor que <b>Hasta</b>.
            </div>
          )}

        </div>
      </div>

      {/* Estado de error */}
      {error && (
        <div className="alert alert-error shadow">
          <span>Ups, no pudimos cargar los KPIs del dashboard.</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <KpiStat
              icon={<CalendarDays className="w-5 h-5" />}
              title="Cotizaciones (hoy)"
              value={String(data?.kpis?.cotizaciones_hoy ?? 0)}
              color="info"
            />
            <KpiStat
              icon={<BarChart3 className="w-5 h-5" />}
              title={labelMes}
              value={String(totalMes)}
              color="accent"
            />
            <KpiStat
              icon={<DollarSign className="w-5 h-5" />}
              title={labelMonto}
              value={formatCOP(Number(data?.kpis?.monto_cotizaciones_mes ?? 0))}
              color="success"
            />
          </>
        )}
      </div>

      {/* Distribución por estado */}
      <div className="card bg-base-100/70 border border-base-200/60 rounded-2xl shadow">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Cotizaciones (mes) por estado</h3>
            {isFetching && !isLoading && (
              <span className="loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-base-200" />
                  <div className="h-3 flex-1 bg-base-200 rounded" />
                  <div className="h-3 w-16 bg-base-200 rounded" />
                </div>
              ))}
            </div>
          ) : (data?.cotizaciones_mes_por_estado ?? []).length === 0 ? (
            <div className="text-sm text-base-content/60">Sin datos para este período.</div>
          ) : (
            <div className="space-y-3">
              {(data?.cotizaciones_mes_por_estado ?? []).map((e, idx) => {
                const pct = basePct > 0 ? Math.round((e.total * 100) / basePct) : 0;
                const theme = palette[idx % palette.length];
                return (
                  <div key={e.estado} className="w-full">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cx("inline-block w-3 h-3 rounded-full", theme.dot)} />
                        <span className="font-medium">{e.estado || "—"}</span>
                      </div>
                      <div className="tabular-nums">
                        {e.total} <span className="opacity-60">({pct}%)</span>
                      </div>
                    </div>
                    <progress className={cx("progress w-full", theme.progress)} value={pct} max={100} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CotizacionesKPIs;
