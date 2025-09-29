/* ===== DASHBOARD CRÉDITOS – KPIs ===== */
import { useQuery } from "@tanstack/react-query";
import { api } from "./../axiosInstance";

export interface DashboardCreditosKPIsParams {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

export interface DashboardCreditosKPIsResponse {
  success: boolean;
  filters: {
    alcance_mes: {
      modo: "rango" | "rango_desde" | "rango_hasta" | "mes_actual" | "sin_fecha";
      desde: string | null;
      hasta: string | null;
      cobertura: string;
    };
    nota: string;
  };
  kpis: {
    creditos_hoy: number | null;       // puede ser null si no existe fecha_creacion
    creditos_mes_total: number;
    monto_creditos_mes: number;
    promedio_plazo_meses: number;
    promedio_cuota_inicial: number;
    tasa_aprobacion: number | null;    // puede ser null si no existe 'estado'
  };
  creditos_mes_por_estado: Array<{ estado: string; total: number }>;
}

const toNum = (v: unknown): number =>
  typeof v === "number" ? v : Number(v ?? 0);

export const fetchDashboardCreditosKPIs = async (
  params?: DashboardCreditosKPIsParams
): Promise<DashboardCreditosKPIsResponse> => {
  const { data } = await api.get<DashboardCreditosKPIsResponse>("/creditos_kpis.php", {
    params,
  });

  return {
    ...data,
    kpis: {
      creditos_hoy: data?.kpis?.creditos_hoy ?? null,
      creditos_mes_total: toNum(data?.kpis?.creditos_mes_total),
      monto_creditos_mes: toNum(data?.kpis?.monto_creditos_mes),
      promedio_plazo_meses: toNum(data?.kpis?.promedio_plazo_meses),
      promedio_cuota_inicial: toNum(data?.kpis?.promedio_cuota_inicial),
      tasa_aprobacion:
        data?.kpis?.tasa_aprobacion === null ? null : toNum(data?.kpis?.tasa_aprobacion),
    },
    creditos_mes_por_estado: (data?.creditos_mes_por_estado ?? []).map((r) => ({
      estado: String(r.estado),
      total: toNum(r.total),
    })),
  };
};

export const useDashboardCreditosKPIs = (
  params?: DashboardCreditosKPIsParams,
  opts?: { enabled?: boolean; refetchInterval?: number; staleTime?: number }
) => {
  return useQuery({
    queryKey: ["dashboard-creditos-kpis", params ?? {}],
    queryFn: () => fetchDashboardCreditosKPIs(params),
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchInterval,
    staleTime: opts?.staleTime ?? 30_000,
  });
};
