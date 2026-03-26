/* ===== Tasas de cotización por ID ===== */

import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

/** Respuesta genérica */
export interface ApiResponseT<T> {
  success: boolean;
  data: T;
}

/** Lo que devuelve get_tasas.php */
export interface TasasCotizacion {
  iva: number;
  tasa_financiacion: number;
  tasa_garantia: number;
}

export interface TasasCotizacionResponse {
  success: boolean;
  data: {
    iva: string | number;
    tasa_financiacion: string | number;
    tasa_garantia: string | number;
  };
}

/** Manejo de errores */
export const handleAxiosError = (
  error: AxiosError<ServerError>,
  fallbackMsg: string
) => {
  const raw = (error.response?.data as any)?.message ?? fallbackMsg;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({
    icon: "error",
    title: "Error",
    html: arr.join("<br/>"),
  });
};

/**
 * Hook: obtener tasas de una cotización por ID
 * GET /get_tasas.php?id=:id
 */
export const useTasasCotizacion = (id?: number) => {
  return useQuery<TasasCotizacion>({
    queryKey: ["tasas-cotizacion", id],
    queryFn: async () => {
      try {
        const { data } = await api.get<TasasCotizacionResponse>("/get_tasas.php", {
          params: { id },
        });

        if (!data?.success || !data?.data) {
          throw new Error("No se encontraron las tasas de la cotización");
        }

        return {
          iva: Number(data.data.iva ?? 0),
          tasa_financiacion: Number(data.data.tasa_financiacion ?? 0),
          tasa_garantia: Number(data.data.tasa_garantia ?? 0),
        };
      } catch (error) {
        handleAxiosError(
          error as AxiosError<ServerError>,
          "No fue posible obtener las tasas de la cotización"
        );
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};