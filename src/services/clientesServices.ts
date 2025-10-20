/* ===== CLIENTES (únicos por cédula) ===== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

/** Modelo que devuelve el backend en clientes-unicos.php */
export interface Cliente {
  id: number;                 // id del registro (se normaliza a number)
  cedula: string;
  name?: string;
  s_name?: string;
  last_name?: string;
  s_last_name?: string;
  celular?: string;
  email?: string;
  fecha_nacimiento?: string;  // "YYYY-MM-DD"
  fecha_creacion?: string;    // "YYYY-MM-DD HH:mm:ss"
  [k: string]: any;
}

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

/**
 * Lista de clientes únicos por cédula (último registro por cédula).
 * - page/perPage para paginación.
 * - Normaliza id a number por seguridad.
 */
export const useClientes = (page: number = 1, perPage: number = 10) => {
  return useQuery<ApiListResponseT<Cliente[]>>({
    queryKey: ["clientes", { page, perPage }],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponseT<Cliente[]>>(
        "/clientes-unicos.php",
        { params: { page, per_page: perPage } }
      );

      const list = Array.isArray(data?.data) ? data.data : [];
      const normalized: Cliente[] = list.map((c) => ({
        ...c,
        id: Number(c.id),
      }));

      return {
        ...data,
        data: normalized,
        // normaliza por si el backend envía "4" como string
        pagination: data?.pagination
          ? {
              ...data.pagination,
              total: Number(data.pagination.total),
            }
          : undefined,
      };
    },
  });
};

/**
 * Trae el ÚLTIMO registro para una cédula específica
 * - GET /clientes-unicos.php?cedula=XXXX
 */
export const useClienteByCedula = (cedulaInput: string | undefined | null) => {
  const cedula = (cedulaInput ?? "").trim();

  return useQuery<Cliente>({
    queryKey: ["cliente-cedula", cedula],
    enabled: cedula.length >= 3, // evita llamadas con cédulas vacías o muy cortas
    queryFn: async () => {
      const { data } = await api.get<ApiListResponseT<Cliente>>(
        "/clientes-unicos.php",
        { params: { cedula } }
      );

      const raw = (data?.data ?? {}) as Cliente;
      return { ...raw, id: Number(raw.id) };
    },
  });
};

/* ===== OPCIONALES/UTILIDADES ===== */

/**
 * Si en algún flujo (p.ej. crear/actualizar cotización) quieres refrescar
 * la lista de clientes únicos, puedes usar este helper.
 * Llama a qc.invalidateQueries({ queryKey: ["clientes"] })
 */
export const useRefreshClientes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => true, // dummy
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clientes"] });
      Swal.fire({
        icon: "success",
        title: "Clientes actualizados",
        timer: 1200,
        showConfirmButton: false,
      });
    },
  });
};

/**
 * Ejemplo: tras crear cotización, refrescar clientes
 * (útil si la creación puede introducir una nueva cédula o actualizar la última).
 *
 * En tu useCreateCotizaciones onSuccess:
 *   await qc.invalidateQueries({ queryKey: ["clientes"] });
 *
 * Ya tienes un hook similar; lo recordamos aquí como guía.
 */
export const usePostCreateCotizacionRefreshClientes = () => {
  const qc = useQueryClient();
  return async () => {
    await qc.invalidateQueries({ queryKey: ["clientes"] });
  };
};

/**
 * Manejo de errores genérico (opcional para reutilizar en onError)
 */
export const handleAxiosError = (error: AxiosError<ServerError>, fallbackMsg: string) => {
  const raw = (error.response?.data as any)?.message ?? fallbackMsg;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
};
