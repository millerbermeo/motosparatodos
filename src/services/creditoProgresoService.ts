import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

/* ===== TIPOS ===== */

export interface CreditoProgreso {
  id: number;
  credito_id: number;
  paso_actual: number;
  paso_1_completo: boolean;
  paso_2_completo: boolean;
  paso_3_completo: boolean;
  paso_4_completo: boolean;
  paso_5_completo: boolean;
  fecha_actualizacion: string | null;
}

export interface CreditoProgresoResponse {
  success: boolean;
  progreso: Record<string, any>;
}

/* ===== HELPERS ===== */

// backend puede devolver "1"/"0", 1/0, true/false
const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

const normalizeProgreso = (p: Record<string, any>): CreditoProgreso => ({
  id: Number(p.id),
  credito_id: Number(p.credito_id),
  paso_actual: Number(p.paso_actual ?? 1),
  paso_1_completo: toBool(p.paso_1_completo),
  paso_2_completo: toBool(p.paso_2_completo),
  paso_3_completo: toBool(p.paso_3_completo),
  paso_4_completo: toBool(p.paso_4_completo),
  paso_5_completo: toBool(p.paso_5_completo),
  fecha_actualizacion: p.fecha_actualizacion ?? null,
});

/* ===== QUERY ===== */

export const creditoProgresoKey = (codigoCredito: string | number) =>
  ["credito-progreso", String(codigoCredito)] as const;

export const useCreditoProgreso = (
  codigoCredito: string | number | undefined,
  enabled = true
) => {
  return useQuery<CreditoProgreso | null>({
    queryKey: creditoProgresoKey(codigoCredito ?? ""),
    enabled: !!codigoCredito && enabled,
    queryFn: async () => {
      try {
        const { data } = await api.get<CreditoProgresoResponse>(
          "/get_credito_progreso.php",
          { params: { codigo_credito: codigoCredito } }
        );
        if (!data?.progreso) return null;
        return normalizeProgreso(data.progreso);
      } catch (err: any) {
        // 404 = aún sin progreso registrado → tratar como "ningún paso completo"
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
  });
};
