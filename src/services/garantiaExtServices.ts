// src/services/garantiaExtServices.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

// Igual al que usas en cotizaciones
export interface ApiListResponse {
  success: boolean;
  data: any; // backend puede devolver array u objeto
  pagination?: {
    total: number | string;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface GarantiaExt {
  id: number;
  cotizacion_id: number;
  moto_a: string | null;
  garantia_extendida_a: string | null; // "no" | "12" | "24" | "26"
  meses_a: number | null;
  valor_a: number | null;

  moto_b: string | null;
  garantia_extendida_b: string | null;
  meses_b: number | null;
  valor_b: number | null;

  cliente_nombre: string | null;
  cliente_cedula: string | null;
  cliente_celular: string | null;
  cliente_email: string | null;

  fecha: string | null;          // "YYYY-MM-DD"
  creado_en: string | null;      // "YYYY-MM-DD HH:mm:ss"
  actualizado_en: string | null; // "YYYY-MM-DD HH:mm:ss"
}

/** Traer 1 registro por ID (tabla garantia_extendida) */
export const useGarantiaExtById = (id?: number | string | null) => {
  const parsed = typeof id === "string" ? id.trim() : id;

  return useQuery({
    queryKey: ["garantia-ext-id", parsed],
    enabled: parsed !== undefined && parsed !== null && `${parsed}` !== "",
    queryFn: async () => {
      const { data } = await api.get("/garantia_extendida_list.php", {
        params: { id: parsed },
      });
      return data as { success: boolean; data: GarantiaExt };
    },
  });
};

/**
 * Listado con filtros (server-side)
 * - page, perPage
 * - q: texto libre (cliente, cédula, moto, email…)
 * - cotizacionId
 * - desde/hasta (YYYY-MM-DD)
 */
export const useGarantiasExt = (
  page: number = 1,
  perPage: number = 10,
  opts?: {
    q?: string;
    cotizacionId?: number | null;
    desde?: string | null;
    hasta?: string | null;
  }
) => {
  const { q, cotizacionId, desde, hasta } = opts ?? {};

  return useQuery<ApiListResponse>({
    queryKey: [
      "garantias-ext",
      { page, perPage, q: q ?? "", cotizacionId: cotizacionId ?? null, desde: desde ?? null, hasta: hasta ?? null },
    ],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse>("/garantia_extendida_list.php", {
        params: {
          page,
          per_page: perPage,
          ...(q ? { q } : {}),
          ...(cotizacionId ? { cotizacion_id: cotizacionId } : {}),
          ...(desde ? { desde } : {}),
          ...(hasta ? { hasta } : {}),
        },
      });
      return data;
    },
  });
};


// --- NUEVO HOOK ---
// Traer garantía extendida por ID de cotización
// GET /garantia_extendida_por_cotizacion.php?cotizacion_id=...
export const useGarantiaExtByCotizacionId = (
  cotizacionId?: number | string | null
) => {
  const parsed =
    typeof cotizacionId === "string" ? cotizacionId.trim() : cotizacionId;

  return useQuery({
    queryKey: ["garantia-ext-cotizacion", parsed],
    enabled: parsed !== undefined && parsed !== null && `${parsed}` !== "",
    queryFn: async () => {
      const { data } = await api.get("/garantia_extendida_por_cotizacion.php", {
        params: { cotizacion_id: parsed },
      });
      // El endpoint devuelve: { success: true, data: GarantiaExt }
      return data as { success: boolean; data: GarantiaExt };
    },
  });
};
