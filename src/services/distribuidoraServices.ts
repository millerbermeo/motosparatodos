// src/api/hooksDistribuidoras.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

/** ===== Tipos ===== */
export interface Distribuidora {
  id: number;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  estado: 0 | 1;          // 1 = activa, 0 = inactiva
  fecha: string;          // timestamp desde la BD
}

export type NewDistribuidora = Omit<Distribuidora, "id" | "fecha">;

export interface ListResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: T[];
}

export interface ItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ServerError {
  error?: string;
  message?: string | string[];
}

/** ===== Listado con búsqueda y paginación =====
 * GET /distribuidora.php?page=&limit=&q=
 */
export const useDistribuidoras = (opts?: { page?: number; limit?: number; q?: string }) => {
  const { page = 1, limit = 50, q } = opts ?? {};
  return useQuery({
    queryKey: ["distribuidoras", { page, limit, q }],
    queryFn: async () => {
      const { data } = await api.get<ListResponse<Distribuidora>>("/distribuidora.php", {
        params: { page, limit, q },
      });
      return data;
    },
  });
};

/** ===== Obtener una distribuidora por ID =====
 * GET /distribuidora.php?id=123
 */
export const useDistribuidoraById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["distribuidora", id],
    enabled: !!id && id > 0,
    queryFn: async () => {
      const { data } = await api.get<ItemResponse<Distribuidora>>("/distribuidora.php", {
        params: { id },
      });
      return data.data;
    },
  });
};

/** ===== Crear =====
 * POST /distribuidora.php
 * body: { nombre, telefono?, direccion?, estado? }
 */
export const useCreateDistribuidora = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewDistribuidora) => {
      const { data } = await api.post("/distribuidora.php", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["distribuidoras"] });
      Swal.fire({
        icon: "success",
        title: "Distribuidora creada",
        timer: 1800,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) ||
        "Error al crear la distribuidora";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Actualizar =====
 * PUT /distribuidora.php
 * body: { id, nombre, telefono?, direccion?, estado? }
 */
export const useUpdateDistribuidora = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Distribuidora | (NewDistribuidora & { id: number })) => {
      const { data } = await api.put("/distribuidora.php", payload);
      return data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["distribuidoras"] }),
        // refresca cache del detalle si estaba cargado
        qc.invalidateQueries({ queryKey: ["distribuidora", (variables as any).id] }),
      ]);
      Swal.fire({
        icon: "success",
        title: "Distribuidora actualizada",
        timer: 1800,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) ||
        "Error al actualizar la distribuidora";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Eliminar =====
 * DELETE /distribuidora.php
 * body: { id }
 */
export const useDeleteDistribuidora = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete("/distribuidora.php", { data: { id } });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["distribuidoras"] });
      Swal.fire({
        icon: "success",
        title: "Distribuidora eliminada",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) ||
        "Error al eliminar la distribuidora";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};
