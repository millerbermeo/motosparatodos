/* ===== DASHBOARD COTIZACIONES – KPIs ===== */

import { useQuery } from "@tanstack/react-query";
import { api } from "./../axiosInstance";

/** Params opcionales para el alcance "mes" (rango de fechas). 
 *  OJO: "hoy" SIEMPRE es la fecha del servidor y NO usa estos filtros.
 */
export interface DashboardKPIsParams {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

/** Respuesta del backend `dashboard_cotizaciones_kpis.php` */
export interface DashboardKPIsResponse {
  success: boolean;
  filters: {
    alcance_mes: {
      modo: "rango" | "mes_actual";
      desde: string | null;
      hasta: string | null;
    };
    nota: string;
  };
  kpis: {
    cotizaciones_hoy: number;
    cotizaciones_mes_total: number;
    monto_cotizaciones_mes: number;
  };
  cotizaciones_mes_por_estado: Array<{ estado: string; total: number }>;
}

/** Normaliza por si algún número llegara como string */
const toNum = (v: unknown): number =>
  typeof v === "number" ? v : Number(v ?? 0);

/** Fetcher simple (útil para llamadas fuera de React Query si alguna vez lo necesitas) */
export const fetchDashboardCotizacionesKPIs = async (
  params?: DashboardKPIsParams
): Promise<DashboardKPIsResponse> => {
  const { data } = await api.get<DashboardKPIsResponse>(
    "/cotizaciones_kpis.php",
    { params }
  );

  // Defensa ligera por si el backend devolviera strings numéricos
  return {
    ...data,
    kpis: {
      cotizaciones_hoy: toNum(data?.kpis?.cotizaciones_hoy),
      cotizaciones_mes_total: toNum(data?.kpis?.cotizaciones_mes_total),
      monto_cotizaciones_mes: toNum(data?.kpis?.monto_cotizaciones_mes),
    },
    cotizaciones_mes_por_estado: (data?.cotizaciones_mes_por_estado ?? []).map(
      (r) => ({ estado: String(r.estado), total: toNum(r.total) })
    ),
  };
};

/** Hook principal para el dashboard de cotizaciones (KPIs) */
export const useDashboardCotizacionesKPIs = (
  params?: DashboardKPIsParams,
  opts?: {
    enabled?: boolean;
    /** refresco automático en ms; ej: 60_000 para 1 min */
    refetchInterval?: number;
    /** tiempo que se considera “fresco” (ms) */
    staleTime?: number;
  }
) => {
  const queryKey = ["dashboard-cotizaciones-kpis", params ?? {}];

  return useQuery({
    queryKey,
    queryFn: () => fetchDashboardCotizacionesKPIs(params),
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchInterval ?? undefined,
    staleTime: opts?.staleTime ?? 30_000, // 30s por defecto
  });
};

/* ======================
   Ejemplo de uso en React
   ======================

import { useDashboardCotizacionesKPIs } from "@/services/dashboardCotizacionesServices";

function DashboardHeader() {
  const { data, isLoading, error } = useDashboardCotizacionesKPIs(
    { desde: "2025-09-01", hasta: "2025-09-30" }, // opcional
    { refetchInterval: 60_000 } // refresca cada minuto
  );

  if (isLoading) return <div>Cargando KPIs…</div>;
  if (error) return <div>Ups, no pudimos cargar los KPIs</div>;

  const k = data?.kpis;
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="card">Hoy: {k?.cotizaciones_hoy ?? 0}</div>
      <div className="card">Mes (total): {k?.cotizaciones_mes_total ?? 0}</div>
      <div className="card">
        Monto mes: ${k?.monto_cotizaciones_mes?.toLocaleString() ?? 0}
      </div>
      <div className="card">
        Estados: {data?.cotizaciones_mes_por_estado?.length ?? 0}
      </div>
    </div>
  );
}

*/
