// src/services/procesoContadoHooks.ts
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";

type ServerError = { error?: string; details?: string; fields?: string[] };

export type ProcesoContado = {
  id: number;
  cotizacion_id: number;
  primer_nombre?: string | null;
  segundo_nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  numero_documento?: string | null;
  numero_celular?: string | null;
  fecha_nacimiento?: string | null;
  ciudad_residencia?: string | null;
  direccion_residencia?: string | null;
  numero_chasis?: string | null;
  numero_motor?: string | null;
  color?: string | null;
  placa?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiSuccess = {
  success: true;
  match: { cotizacion_id: number };
  data: ProcesoContado;
};

type ApiError = {
  error: string;
  criteria?: Record<string, unknown>;
};

export type ParamsProcesoContado = {
  cotizacion_id?: number | null;
};

export const useGetProcesoContadoPorCotizacionYMoto = (
  params: ParamsProcesoContado,
  options?: Omit<
    UseQueryOptions<ProcesoContado, AxiosError<ServerError | ApiError>>,
    "queryKey" | "queryFn" | "enabled"
  >
) => {
  const { cotizacion_id } = params || {};

  // Solo ejecuta si hay ID de cotización
  const enabled = !!cotizacion_id;

  return useQuery<ProcesoContado, AxiosError<ServerError | ApiError>>({
    queryKey: ["proceso_contado", "byCotizacion", { cotizacion_id }],
    enabled,
    queryFn: async () => {
      const payload = { cotizacion_id: Number(cotizacion_id) };

      console.log("📤 Enviando payload:", payload);

      // ✅ POST JSON al backend (el PHP ya acepta application/json)
      const { data } = await api.post<ApiSuccess | ApiError>(
        "listar_proceso_list.php",
        JSON.stringify(payload),
        { headers: { "Content-Type": "application/json" } }
      );

      if ((data as ApiSuccess).success) {
        return (data as ApiSuccess).data;
      }

      throw new Error((data as ApiError).error || "No se encontró el registro");
    },
    ...options,
  });
};
