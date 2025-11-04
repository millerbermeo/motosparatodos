/* ===== IVA (vigencia actual) ===== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

/** Respuesta genérica si la necesitas para listas en el futuro */
export interface ApiListResponseT<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number | string;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/** Modelo que devuelve get_iva_vigente.php */
export interface IvaVigente {
  id: number;
  nombre: string;
  porcentaje: number;         // 19.00
  descripcion?: string | null;
  vigente_desde: string;      // "YYYY-MM-DD"
  vigente_hasta?: string | null;
}

export interface IvaVigenteResponse {
  success: boolean;
  iva: IvaVigente;
}

/** Manejo de errores genérico */
export const handleAxiosError = (error: AxiosError<ServerError>, fallbackMsg: string) => {
  const raw = (error.response?.data as any)?.message ?? fallbackMsg;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
};

/**
 * Hook: IVA vigente (GET /get_iva_vigente.php)
 * - queryKey: ['iva-vigente']
 * - Normaliza id a number
 */
export const useIvaVigente = () => {
  return useQuery<IvaVigente>({
    queryKey: ["iva-vigente"],
    queryFn: async () => {
      const { data } = await api.get<IvaVigenteResponse>("/get_iva_vigente.php");
      if (!data?.success || !data?.iva) {
        throw new Error("No se encontró una tasa de IVA vigente");
      }
      const iva = data.iva;
      return { ...iva, id: Number(iva.id) };
    },
    staleTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * Helper: devuelve el IVA vigente y su forma decimal (0.19)
 */
export const useIvaDecimal = () => {
  const q = useIvaVigente();
  const porcentaje = q.data?.porcentaje ?? 0;
  const ivaDecimal = porcentaje / 100;
  return { ...q, porcentaje, ivaDecimal };
};

/**
 * Helper para invalidar manualmente el IVA (p.ej. después de actualizarlo en admin)
 */
export const useRefreshIvaVigente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => true, // dummy
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["iva-vigente"] });
      Swal.fire({
        icon: "success",
        title: "IVA actualizado",
        timer: 1200,
        showConfirmButton: false,
      });
    },
  });
};
