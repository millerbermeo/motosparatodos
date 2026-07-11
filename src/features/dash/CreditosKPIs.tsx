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
import { fmtCOP as formatCOP } from "../../utils/money";

// --- Utils -----------------------------------------------------------------
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const palette = [
  { dot: "bg-primary", bar: "bg-primary" },
  { dot: "bg-secondary", bar: "bg-secondary" },
  { dot: "bg-accent", bar: "bg-accent" },
  { dot: "bg-info", bar: "bg-info" },
  { dot: "bg-success", bar: "bg-success" },
  { dot: "bg-warning", bar: "bg-warning" },
  { dot: "bg-error", bar: "bg-error" },
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
    chip: "bg-primary/15 text-primary",
    value: "text-primary",
    bar: "from-primary to-primary/40",
  },
  secondary: {
    chip: "bg-secondary/15 text-secondary",
    value: "text-secondary",
    bar: "from-secondary to-secondary/40",
  },
  accent: {
    chip: "bg-accent/15 text-accent",
    value: "text-accent",
    bar: "from-accent to-accent/40",
  },
  info: {
    chip: "bg-info/15 text-info",
    value: "text-info",
    bar: "from-info to-info/40",
  },
  success: {
    chip: "bg-success/15 text-success",
    value: "text-success",
    bar: "from-success to-success/40",
  },
  warning: {
    chip: "bg-warning/15 text-warning",
    value: "text-warning",
    bar: "from-warning to-warning/40",
  },
  error: {
    chip: "bg-error/15 text-error",
    value: "text-error",
    bar: "from-error to-error/40",
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
      "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
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
    <div className="group relative h-full overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-base-300">
      <div className={cx("absolute inset-x-0 top-0 h-1 bg-linear-to-r", variant.bar)} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate pt-1 text-sm font-medium text-base-content/60">{title}</p>
          <IconChip className={cx(variant.chip, "shrink-0 transition-transform duration-300 group-hover:scale-110")}>
            {icon}
          </IconChip>
        </div>

        <div className={cx("mt-4 text-3xl sm:text-4xl font-extrabold leading-none tracking-tight tabular-nums wrap-break-word", variant.value)}>
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
      {/* Encabezado de sección */}
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <CreditCard className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-base-content">Créditos</h2>
          <p className="text-xs text-base-content/50">Métricas y distribución del período</p>
        </div>
      </div>

      {/* Filtros */}
      <SectionCard className="border-primary/20 bg-linear-to-br from-primary/5 via-base-100 to-base-100">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="card-title text-base md:text-lg">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <CalendarRange className="h-4.5 w-4.5" />
                  </span>
                  Filtros de fecha
                </h3>

                <span className={cx("badge badge-sm md:badge-md border-0 font-medium", badgeClass)}>
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

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
            {/* Desde */}
            <div className="col-span-1">
              <label className="label pb-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/60">Desde</span>
              </label>
              <input
                type="date"
                className={cx(
                  "input input-bordered w-full h-11 rounded-xl bg-base-100 focus:border-primary",
                  invalidRange && "input-error"
                )}
                value={desdeInput}
                onChange={(e) => setDesdeInput(e.target.value)}
              />
            </div>

            {/* Hasta */}
            <div className="col-span-1">
              <label className="label pb-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/60">Hasta</span>
              </label>
              <input
                type="date"
                className={cx(
                  "input input-bordered w-full h-11 rounded-xl bg-base-100 focus:border-primary",
                  invalidRange && "input-error"
                )}
                value={hastaInput}
                onChange={(e) => setHastaInput(e.target.value)}
              />
            </div>

            {/* Presets */}
            <div className="col-span-2 lg:col-span-1">
              <label className="label pb-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/60">Atajos</span>
              </label>

              <div className="grid grid-cols-2 gap-2 lg:flex">
                <button
                  className="btn h-11 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-content hover:border-primary"
                  type="button"
                  onClick={setThisMonth}
                >
                  Este mes
                </button>

                <button
                  className="btn h-11 rounded-xl border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
                  type="button"
                  onClick={setLastMonth}
                >
                  Mes pasado
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="col-span-2 lg:col-span-1">
              <label className="label pb-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide text-base-content/60">Acciones</span>
              </label>

              <div className="grid grid-cols-2 gap-2 lg:flex">
                <button
                  className="btn h-11 rounded-xl border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
                  type="button"
                  onClick={clearFilters}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>

                <button
                  className="btn btn-primary h-11 rounded-xl shadow-sm"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                            "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                            theme.dot
                          )}
                        />
                        <span className="truncate font-medium text-base-content">
                          {e.estado || "Sin estado"}
                        </span>
                      </div>

                      <div className="shrink-0 tabular-nums text-right">
                        <span className="font-semibold text-base-content">{e.total}</span>{" "}
                        <span className="text-base-content/50">({pct}%)</span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-base-200">
                      <div
                        className={cx("h-full rounded-full transition-all duration-700 ease-out", theme.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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