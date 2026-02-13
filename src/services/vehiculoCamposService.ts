import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { api } from "./axiosInstance";

/** tipo = 1 => creditos | tipo = 2 => solicitar_estado_facturacion */
export type VehiculoTipo = 1 | 2;

export interface VehiculoCamposApi {
  id: number | string;
  id_cotizacion: number;
  numero_motor?: string | null;
  numero_chasis?: string | null;
  color?: string | null;
  placa?: string | null;
  observacion_final?: string | null;
}

export interface VehiculoCamposResponse {
  success: boolean;
  tipo?: VehiculoTipo;
  data?: VehiculoCamposApi;
  error?: string;
}

export interface ActualizarVehiculoCamposResponse {
  success: boolean;
  message?: string;
  tipo?: VehiculoTipo;
  id_cotizacion?: number;
  affected_rows?: number;
  error?: string;
}

export interface ServerError {
  message?: string | string[];
  error?: string;
}

/** =========================
 *  GET: trae 1 registro por tipo + id_cotizacion
 *  Endpoint: /vehiculo_campos.php?tipo=1&id_cotizacion=123
 *  ========================= */
export const useVehiculoCampos = (
  params?: { tipo?: VehiculoTipo; idCotizacion?: string | number },
  opts?: {
    endpoint?: string; // por defecto "/vehiculo_campos.php"
    enabled?: boolean;
    token?: string; // si no usas interceptor
  }
) => {
  const tipo = params?.tipo;
  const idCotizacion = params?.idCotizacion;

  return useQuery<VehiculoCamposApi | null, AxiosError>({
    queryKey: ["vehiculo-campos", tipo, idCotizacion],
    enabled: (opts?.enabled ?? true) && !!tipo && !!idCotizacion,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<VehiculoCamposResponse>(
          opts?.endpoint ?? "/vehiculo_campos.php",
          {
            params: {
              tipo,
              id_cotizacion: idCotizacion,
            },
            headers: opts?.token
              ? { Authorization: `Bearer ${opts.token}` }
              : undefined,
          }
        );

        if (!data?.success || !data.data) return null;
        return data.data;
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) return null;
        throw e;
      }
    },
  });
};

/** Payload de update: puedes mandar solo lo que quieras cambiar */
export type ActualizarVehiculoCamposPayload = {
  tipo: VehiculoTipo;
  id_cotizacion: number | string;
  numero_motor?: string | null;
  numero_chasis?: string | null;
  color?: string | null;
  placa?: string | null;
  observacion_final?: string | null;
};

/** =========================
 *  POST: actualiza campos por tipo + id_cotizacion
 *  Endpoint: /vehiculo_campos.php
 *  ========================= */
export const useActualizarVehiculoCampos = (opts?: { endpoint?: string }) => {
  const qc = useQueryClient();

  return useMutation<
    ActualizarVehiculoCamposResponse,
    AxiosError<ServerError>,
    ActualizarVehiculoCamposPayload
  >({
    mutationFn: async (payload) => {
      const fd = new FormData();
      fd.append("tipo", String(payload.tipo));
      fd.append("id_cotizacion", String(payload.id_cotizacion));

      // Solo mandamos campos si existen (para no pisar con vacío)
      const addIfDefined = (k: string, v: any) => {
        if (v === undefined) return;
        // si viene null, mandamos vacío para "limpiar" si lo deseas
        fd.append(k, v === null ? "" : String(v));
      };

      addIfDefined("numero_motor", payload.numero_motor);
      addIfDefined("numero_chasis", payload.numero_chasis);
      addIfDefined("color", payload.color);
      addIfDefined("placa", payload.placa);
      addIfDefined("observacion_final", payload.observacion_final);

      const { data } = await api.post<ActualizarVehiculoCamposResponse>(
        opts?.endpoint ?? "/vehiculo_campos.php",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: async (resp, payload) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["vehiculo-campos", payload.tipo, payload.id_cotizacion] }),
        qc.invalidateQueries({ queryKey: ["vehiculo-campos"] }), // por si hay pantallas que usan lista general
      ]);

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: resp?.message ?? "Campos del vehículo actualizados correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "No se pudieron actualizar los campos";

      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};
