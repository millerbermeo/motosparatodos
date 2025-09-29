// src/components/dashboard/CreditosKPIs.tsx
// Versión sobria: colores profesionales con acentos discretos (daisyUI)
// Cambios clave:
// - Sin clases dinámicas de Tailwind (evita romper el purge). Mapa de variantes seguro.
// - Cards neutras, bordes suaves, sombras sutiles; color sólo en chips/valores/progress.
// - Badges y botones menos saturados (ghost/outline) y encabezado con acento lateral.

import React, { useMemo, useState } from "react";
import {
  CreditCard,
  CalendarDays,
  DollarSign,
  Timer,
  Percent,
  CalendarRange,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useDashboardCreditosKPIs } from "../../services/dash/dashboardCreditosServices";

// --- Utils -----------------------------------------------------------------
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const palette = [
  { dot: "bg-primary", progress: "progress-primary" },
  { dot: "bg-secondary", progress: "progress-secondary" },
  { dot: "bg-accent", progress: "progress-accent" },
  { dot: "bg-info", progress: "progress-info" },
  { dot: "bg-success", progress: "progress-success" },
  { dot: "bg-warning", progress: "progress-warning" },
  { dot: "bg-error", progress: "progress-error" },
];

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

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

// --- Variantes de color seguras (evita clases como `text-${color}`) --------
const COLOR_VARIANTS = {
  primary: { chip: "bg-primary text-primary-content", value: "text-primary" },
  secondary: { chip: "bg-secondary text-secondary-content", value: "text-secondary" },
  accent: { chip: "bg-accent text-accent-content", value: "text-accent" },
  info: { chip: "bg-info text-info-content", value: "text-info" },
  success: { chip: "bg-success text-success-content", value: "text-success" },
  warning: { chip: "bg-warning text-warning-content", value: "text-warning" },
  error: { chip: "bg-error text-error-content", value: "text-error" },
} as const;

// --- Atoms -----------------------------------------------------------------
const SkeletonStat: React.FC = () => (
  <div className="stats bg-base-100 border border-base-200 rounded-xl shadow-sm">
    <div className="stat animate-pulse">
      <div className="stat-title h-4 w-28 bg-base-200 rounded" />
      <div className="stat-value h-7 w-24 mt-2 bg-base-200 rounded" />
    </div>
  </div>
);

const IconChip: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={cx("inline-flex items-center justify-center rounded-full p-2 shadow-sm ring-1 ring-base-200", className)}>
    {children}
  </span>
);

const KpiStat: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  color?: keyof typeof COLOR_VARIANTS;
}> = ({ icon, title, value, color = "primary" }) => {
  const variant = COLOR_VARIANTS[color];
  return (
    <div className="stats bg-base-100 border border-base-200 rounded-xl shadow-sm transition hover:shadow-md">
      <div className="stat">
        <div className="stat-title flex items-center gap-2 text-base-content/70">
          <IconChip className={variant.chip}>{icon}</IconChip>
          <span className="font-medium">{title}</span>
        </div>
        <div className={cx("stat-value", variant.value)}>{value}</div>
      </div>
    </div>
  );
};

// --- Component -------------------------------------------------------------

type Props = {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  refetchInterval?: number;
  className?: string;
};

const CreditosKPIs: React.FC<Props> = ({ desde, hasta, refetchInterval, className }) => {
  // Estado de UI para filtros (independiente de props)
  const [desdeInput, setDesdeInput] = useState<string>(desde ?? "");
  const [hastaInput, setHastaInput] = useState<string>(hasta ?? "");
  const [applied, setApplied] = useState<{ desde?: string; hasta?: string }>({
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  });

  const invalidRange = useMemo(() => !!(desdeInput && hastaInput && desdeInput > hastaInput), [desdeInput, hastaInput]);

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

  const { data, isLoading, isFetching, error } = useDashboardCreditosKPIs(applied, { refetchInterval });

  const modo = data?.filters?.alcance_mes?.modo ?? "mes_actual";
  const labelTotal = modo.startsWith("rango")
    ? "Créditos (rango)"
    : modo === "sin_fecha"
    ? "Créditos (histórico)"
    : "Créditos (mes)";
  const labelMonto = modo.startsWith("rango")
    ? "Monto (rango)"
    : modo === "sin_fecha"
    ? "Monto (histórico)"
    : "Monto (mes)";

  const k = data?.kpis;
  const estados = data?.creditos_mes_por_estado ?? [];
  const totalBase = (k?.creditos_mes_total ?? sum(estados.map((e: any) => e.total))) || 0;

  // Acento lateral del header según modo
  const headerAccent =
    modo === "rango" ? "border-l-primary" : modo === "sin_fecha" ? "border-l-base-300" : "border-l-secondary";
  const badgeClass =
    modo === "rango"
      ? "badge badge-ghost badge-primary"
      : modo === "sin_fecha"
      ? "badge badge-ghost"
      : "badge badge-ghost badge-secondary";

  return (
    <section className={cx("w-full space-y-4", className)}>
      {/* Filtros */}
      <div
        className={cx(
          "card bg-base-100 border border-base-200 rounded-xl shadow-sm hover:shadow-md transition",
          "pl-3 border-l-4",
          headerAccent
        )}
      >
        <div className="card-body gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="card-title flex items-center gap-2">
              <CalendarRange className="w-5 h-5" /> Filtros (rango de fechas)
              <span className={cx("hidden sm:inline-flex", badgeClass)}>{modo}</span>
            </h3>
            {isFetching && !isLoading && <span className="loading loading-spinner loading-sm text-primary" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Desde */}
            <div className="form-control col-span-1 lg:col-span-3">
              <label className="label"><span className="label-text">Desde</span></label>
              <input type="date" className={cx("input input-bordered w-full", invalidRange && "input-error")} value={desdeInput} onChange={(e) => setDesdeInput(e.target.value)} />
            </div>
            {/* Hasta */}
            <div className="form-control col-span-1 lg:col-span-3">
              <label className="label"><span className="label-text">Hasta</span></label>
              <input type="date" className={cx("input input-bordered w-full", invalidRange && "input-error")} value={hastaInput} onChange={(e) => setHastaInput(e.target.value)} />
            </div>
            {/* Presets */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-end">
              <div className="flex w-full gap-2">
                <button className="btn btn-outline btn-sm sm:btn-md flex-1" type="button" onClick={setThisMonth}>Este mes</button>
                <button className="btn btn-outline btn-sm sm:btn-md flex-1" type="button" onClick={setLastMonth}>Mes pasado</button>
              </div>
            </div>
            {/* Acciones */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-end">
              <div className="flex w-full gap-2 lg:justify-end">
                <button className="btn btn-ghost btn-sm sm:btn-md flex-1 sm:flex-none sm:w-auto" type="button" onClick={clearFilters}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
                </button>
                <button className="btn btn-primary btn-sm sm:btn-md flex-1 sm:flex-none sm:w-auto" type="button" onClick={applyFilters} disabled={invalidRange}>
                  Aplicar <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {invalidRange && (
            <div className="mt-1 text-sm text-error flex items-center gap-2">
              <span className="badge badge-error badge-sm" /> El campo <b>Desde</b> no puede ser mayor que <b>Hasta</b>.
            </div>
          )}

          <div className="mt-1 text-xs text-base-content/60">
            Las métricas de <b>hoy</b> no usan estos filtros. Alcance:{" "}
            <code className="badge badge-ghost badge-sm align-middle">{modo}</code>
            {applied.desde && (<>
              {" • desde "}<code className="badge badge-outline badge-sm align-middle">{applied.desde}</code>
            </>)}
            {applied.hasta && (<>
              {" • hasta "}<code className="badge badge-outline badge-sm align-middle">{applied.hasta}</code>
            </>)}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error/80 shadow-sm"><span>No se pudieron cargar los KPIs de créditos.</span></div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
          </>
        ) : (
          <>
            <KpiStat icon={<CalendarDays className="w-5 h-5" />} title="Créditos (hoy)" value={String(data?.kpis?.creditos_hoy ?? 0)} color="info" />
            <KpiStat icon={<CreditCard className="w-5 h-5" />} title={labelTotal} value={String(data?.kpis?.creditos_mes_total ?? 0)} color="secondary" />
            <KpiStat icon={<DollarSign className="w-5 h-5" />} title={labelMonto} value={formatCOP(Number(data?.kpis?.monto_creditos_mes ?? 0))} color="success" />
            <KpiStat icon={<Timer className="w-5 h-5" />} title="Plazo prom. (meses)" value={String(data?.kpis?.promedio_plazo_meses ?? 0)} color="accent" />
            <KpiStat icon={<DollarSign className="w-5 h-5" />} title="Cuota inicial prom." value={formatCOP(Number(data?.kpis?.promedio_cuota_inicial ?? 0))} color="warning" />
          </>
        )}
      </div>

      {/* Tasa de aprobación */}
      {!isLoading && data?.kpis?.tasa_aprobacion !== null && (
        <div className="stats bg-base-100 border border-base-200 rounded-xl shadow-sm mt-4">
          <div className="stat">
            <div className="stat-title flex items-center gap-2 text-base-content/70"><Percent className="w-5 h-5" /> Tasa de aprobación</div>
            <div className="stat-value text-primary">{(data?.kpis?.tasa_aprobacion ?? 0).toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* Distribución por estado */}
      <div className="card bg-base-100 border border-base-200 rounded-xl shadow-sm mt-4">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Créditos por estado</h3>
            {isFetching && !isLoading && <span className="loading loading-spinner loading-sm text-primary" />}
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
          ) : estados.length === 0 ? (
            <div className="text-sm text-base-content/60">Sin datos para este período.</div>
          ) : (
            <div className="space-y-3">
              {estados.map((e: any, idx: number) => {
                const pct = totalBase > 0 ? Math.round((e.total * 100) / totalBase) : 0;
                const theme = palette[idx % palette.length];
                return (
                  <div key={e.estado} className="w-full">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cx("inline-block w-3 h-3 rounded-full bg-info", theme.dot)} />
                        <span className="font-medium">{e.estado || "—"}</span>
                      </div>
                      <div className="tabular-nums">{e.total} <span className="opacity-60">({pct}%)</span></div>
                    </div>
                    <progress className={cx("progress progress-info w-full")} value={pct} max={100} />
                  </div>
                );
              })}
            </div>
          )}

          {data?.filters?.alcance_mes?.modo === "sin_fecha" && (
            <div className="mt-2 text-xs text-base-content/60">
              Nota: la tabla <code>creditos</code> no tiene <code>fecha_creacion</code>; se muestran KPIs del histórico completo.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreditosKPIs;
