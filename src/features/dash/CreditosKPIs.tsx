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
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v || 0);

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

// --- Variantes seguras -----------------------------------------------------
const COLOR_VARIANTS = {
  primary: {
    chip: "bg-primary text-primary-content",
    value: "text-primary",
  },
  secondary: {
    chip: "bg-secondary text-secondary-content",
    value: "text-secondary",
  },
  accent: {
    chip: "bg-accent text-accent-content",
    value: "text-accent",
  },
  info: {
    chip: "bg-info text-info-content",
    value: "text-info",
  },
  success: {
    chip: "bg-success text-success-content",
    value: "text-success",
  },
  warning: {
    chip: "bg-warning text-warning-content",
    value: "text-warning",
  },
  error: {
    chip: "bg-error text-error-content",
    value: "text-error",
  },
} as const;

// --- UI atoms --------------------------------------------------------------
const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cx(
      "card rounded-2xl border border-base-200 bg-base-100 shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const SkeletonStat: React.FC = () => (
  <div className="card h-full rounded-2xl border border-base-200 bg-base-100 shadow-sm">
    <div className="card-body animate-pulse gap-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-base-200" />
        <div className="h-4 w-32 rounded bg-base-200" />
      </div>
      <div className="h-9 w-28 rounded bg-base-200" />
    </div>
  </div>
);

const IconChip: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <span
    className={cx(
      "inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
      className
    )}
  >
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
    <div className="card h-full rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="card-body gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <IconChip className={variant.chip}>{icon}</IconChip>
          <p className="truncate text-sm font-medium text-base-content/70">{title}</p>
        </div>

        <div className={cx("text-3xl md:text-[2rem] font-bold leading-none tracking-tight wrap-break-word", variant.value)}>
          {value}
        </div>
      </div>
    </div>
  );
};

// --- Component -------------------------------------------------------------
type Props = {
  desde?: string;
  hasta?: string;
  refetchInterval?: number;
  className?: string;
};

const CreditosKPIs: React.FC<Props> = ({ desde, hasta, refetchInterval, className }) => {
  const [desdeInput, setDesdeInput] = useState<string>(desde ?? "");
  const [hastaInput, setHastaInput] = useState<string>(hasta ?? "");

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

  const { data, isLoading, isFetching, error } = useDashboardCreditosKPIs(applied, {
    refetchInterval,
  });

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

  const badgeClass =
    modo === "rango"
      ? "badge-primary"
      : modo === "sin_fecha"
        ? "badge-ghost"
        : "badge-secondary";

  return (
    <section className={cx("w-full space-y-5", className)}>
      {/* Filtros */}
      <SectionCard className="border-primary/20 bg-base-100">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="card-title text-base md:text-lg">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  Filtros de fecha
                </h3>

                <span className={cx("badge badge-sm md:badge-md", badgeClass)}>
                  {modo === "rango"
                    ? "rango aplicado"
                    : modo === "sin_fecha"
                      ? "histórico"
                      : "mes actual"}
                </span>
              </div>

              <p className="mt-1 text-sm text-base-content/60">
                Filtra los KPIs del período mensual sin afectar la métrica de hoy.
              </p>
            </div>

            {isFetching && !isLoading && (
              <span className="loading loading-spinner loading-sm text-primary self-start sm:self-center" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
            {/* Desde */}
            <div className="xl:col-span-3">
              <label className="label pb-2">
                <span className="label-text font-medium">Desde</span>
              </label>
              <input
                type="date"
                className={cx(
                  "input input-bordered w-full h-12 rounded-xl bg-base-100",
                  invalidRange && "input-error"
                )}
                value={desdeInput}
                onChange={(e) => setDesdeInput(e.target.value)}
              />
            </div>

            {/* Hasta */}
            <div className="xl:col-span-3">
              <label className="label pb-2">
                <span className="label-text font-medium">Hasta</span>
              </label>
              <input
                type="date"
                className={cx(
                  "input input-bordered w-full h-12 rounded-xl bg-base-100",
                  invalidRange && "input-error"
                )}
                value={hastaInput}
                onChange={(e) => setHastaInput(e.target.value)}
              />
            </div>

            {/* Presets */}
            <div className="xl:col-span-3">
              <label className="label pb-2">
                <span className="label-text font-medium">Atajos</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn btn-outline h-12 rounded-xl"
                  type="button"
                  onClick={setThisMonth}
                >
                  Este mes
                </button>

                <button
                  className="btn btn-outline h-12 rounded-xl"
                  type="button"
                  onClick={setLastMonth}
                >
                  Mes pasado
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="xl:col-span-3">
              <label className="label pb-2">
                <span className="label-text font-medium">Acciones</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn btn-ghost h-12 rounded-xl"
                  type="button"
                  onClick={clearFilters}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>

                <button
                  className="btn btn-primary h-12 rounded-xl"
                  type="button"
                  onClick={applyFilters}
                  disabled={invalidRange}
                >
                  <span>Aplicar</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {invalidRange && (
            <div className="alert alert-error py-3">
              <span>
                El campo <b>Desde</b> no puede ser mayor que <b>Hasta</b>.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
            <span>Las métricas de <b>hoy</b> no usan estos filtros.</span>
            <span className="hidden sm:inline">•</span>
            <span>Alcance:</span>
            <code className="badge badge-ghost badge-sm align-middle">{modo}</code>

            {applied.desde && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>desde</span>
                <code className="badge badge-outline badge-sm align-middle">{applied.desde}</code>
              </>
            )}

            {applied.hasta && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>hasta</span>
                <code className="badge badge-outline badge-sm align-middle">{applied.hasta}</code>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="alert alert-error shadow-sm">
          <span>No se pudieron cargar los KPIs de créditos.</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <KpiStat
              icon={<CalendarDays className="h-5 w-5" />}
              title="Créditos (hoy)"
              value={String(data?.kpis?.creditos_hoy ?? 0)}
              color="info"
            />

            <KpiStat
              icon={<CreditCard className="h-5 w-5" />}
              title={labelTotal}
              value={String(data?.kpis?.creditos_mes_total ?? 0)}
              color="secondary"
            />

            <KpiStat
              icon={<DollarSign className="h-5 w-5" />}
              title={labelMonto}
              value={formatCOP(Number(data?.kpis?.monto_creditos_mes ?? 0))}
              color="success"
            />

            <KpiStat
              icon={<Timer className="h-5 w-5" />}
              title="Plazo prom. (meses)"
              value={String(data?.kpis?.promedio_plazo_meses ?? 0)}
              color="accent"
            />

            <KpiStat
              icon={<DollarSign className="h-5 w-5" />}
              title="Cuota inicial prom."
              value={formatCOP(Number(data?.kpis?.promedio_cuota_inicial ?? 0))}
              color="warning"
            />
          </>
        )}
      </div>

      {/* Tasa de aprobación */}
      {!isLoading && data?.kpis?.tasa_aprobacion !== null && (
        <SectionCard>
          <div className="card-body gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <IconChip className="bg-primary text-primary-content">
                <Percent className="h-5 w-5" />
              </IconChip>
              <p className="text-sm font-medium text-base-content/70">Tasa de aprobación</p>
            </div>

            <div className="text-3xl md:text-[2rem] font-bold leading-none tracking-tight text-primary">
              {(data?.kpis?.tasa_aprobacion ?? 0).toFixed(1)}%
            </div>
          </div>
        </SectionCard>
      )}

      {/* Distribución por estado */}
      <SectionCard>
        <div className="card-body gap-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="card-title text-base md:text-lg">Créditos por estado</h3>
              <p className="text-sm text-base-content/60">
                Distribución del período seleccionado.
              </p>
            </div>

            {isFetching && !isLoading && (
              <span className="loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-4 w-36 rounded bg-base-200" />
                    <div className="h-4 w-16 rounded bg-base-200" />
                  </div>
                  <div className="h-2 w-full rounded bg-base-200" />
                </div>
              ))}
            </div>
          ) : estados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-base-300 p-6 text-sm text-base-content/60">
              Sin datos para este período.
            </div>
          ) : (
            <div className="space-y-4">
              {estados.map((e: any, idx: number) => {
                const pct = totalBase > 0 ? Math.round((e.total * 100) / totalBase) : 0;
                const theme = palette[idx % palette.length];

                return (
                  <div key={`${e.estado}-${idx}`} className="w-full space-y-2">
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cx(
                            "mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full",
                            theme.dot
                          )}
                        />
                        <span className="truncate font-medium text-base-content">
                          {e.estado || "Sin estado"}
                        </span>
                      </div>

                      <div className="shrink-0 tabular-nums text-right font-medium">
                        {e.total} <span className="text-base-content/60">({pct}%)</span>
                      </div>
                    </div>

                    <progress
                      className={cx("progress w-full h-2", theme.progress)}
                      value={pct}
                      max={100}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {data?.filters?.alcance_mes?.modo === "sin_fecha" && (
            <div className="rounded-xl border border-dashed border-base-300 bg-base-50 p-4 text-xs text-base-content/60">
              Nota: la tabla <code>creditos</code> no tiene <code>fecha_creacion</code>; se muestran KPIs del histórico completo.
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  );
};

export default CreditosKPIs;