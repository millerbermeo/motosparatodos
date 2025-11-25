import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useModalStore } from "../store/modalStore";

/* ===== TIPOS ===== */

export interface ConfigPlazo {
  id: number;
  codigo: string;        // 👈 NUEVO
  servicio: string;
  plazo_meses: number;
  tipo_valor: string; // '%' | '$'
  valor: number;
}

export interface ConfigPlazoResponse {
  tarifas: ConfigPlazo[];
}

export interface ServerError {
  message: string | string[];
}

/* ===== HELPERS ===== */

const parseError = (error: AxiosError<ServerError>, fallback: string) => {
  const raw = error.response?.data?.message ?? fallback;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
};

const normalizeConfig = (t: any): ConfigPlazo => ({
  id: Number(t.id),
  codigo: String(t.codigo ?? ""),
  servicio: String(t.servicio ?? ""),
  plazo_meses: typeof t.plazo_meses === "string" ? Number(t.plazo_meses) : t.plazo_meses,
  tipo_valor: String(t.tipo_valor ?? ""),
  valor: typeof t.valor === "string" ? Number(t.valor) : t.valor,
});

/* ===== QUERIES ===== */

// Listar todas las configuraciones
export const useConfiguracionesPlazo = () => {
  return useQuery<ConfigPlazo[]>({
    queryKey: ["configuracion-plazo"],
    queryFn: async () => {
      const { data } = await api.get<ConfigPlazoResponse>("/configuracion_plazo.php");
      return (data.tarifas || []).map(normalizeConfig);
    },
  });
};

// 👇 NUEVO: obtener UNA configuración por CODIGO
export const useConfigPlazoByCodigo = (codigo: string, enabled = true) => {
  return useQuery<ConfigPlazo | null>({
    queryKey: ["configuracion-plazo", "codigo", codigo],
    enabled: !!codigo && enabled,
    queryFn: async () => {
      const { data } = await api.get<ConfigPlazoResponse>("/configuracion_plazo.php", {
        params: { codigo },
      });

      const items = (data.tarifas || []).map(normalizeConfig);
      // el backend devuelve arreglo, acá tomamos el primero
      return items[0] ?? null;
    },
  });
};

/* ===== MUTATIONS ===== */

export type NewConfigPlazo = Omit<ConfigPlazo, "id">;
export type UpdateConfigPlazo = ConfigPlazo;

// Crear (POST)
export const useCreateConfigPlazo = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewConfigPlazo) => {
      const body = {
        codigo: payload.codigo,                 // 👈 obligatorio
        servicio: payload.servicio,
        plazo_meses: Number(payload.plazo_meses),
        tipo_valor: payload.tipo_valor,
        valor: Number(payload.valor),
      };

      const { data } = await api.post("/configuracion_plazo.php", body, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["configuracion-plazo"] });
      close();
      Swal.fire({
        icon: "success",
        title: "Configuración creada",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) =>
      parseError(error, "Error al crear la configuración"),
  });
};

// Actualizar (PUT)
export const useUpdateConfigPlazo = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: UpdateConfigPlazo) => {
      const body = {
        id: Number(payload.id),
        codigo: payload.codigo,                 // 👈 obligatorio también al editar
        servicio: payload.servicio,
        plazo_meses: Number(payload.plazo_meses),
        tipo_valor: payload.tipo_valor,
        valor: Number(payload.valor),
      };

      const { data } = await api.put("/configuracion_plazo.php", body, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["configuracion-plazo"] });
      close();
      Swal.fire({
        icon: "success",
        title: "Configuración actualizada",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) =>
      parseError(error, "Error al actualizar la configuración"),
  });
};
