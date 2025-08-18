/* ===== MUTATIONS ===== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

// create (POST sin id)
export const useCreateCotizaciones = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/create_cotizacion.php", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["motos"] });
      Swal.fire({ icon: "success", title: "Cotiazacion creada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear la cotizacion";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};



type Id = number | string;

export const useCotizacionById = (id: Id | undefined) => {
  const parsedId = typeof id === "string" ? id.trim() : id;

  return useQuery({
    queryKey: ["cotizacion-id", parsedId],
    enabled: parsedId !== undefined && parsedId !== null && `${parsedId}` !== "",
    queryFn: async () => {
      const { data } = await api.get("/list_cotizaciones.php", {
        params: { id: parsedId },
      });
      return data;
    },
  });
};



/** Interfaz genérica con success y data como any */
export interface ApiListResponse {
  success: boolean;
  data: any; // el backend puede devolver array u objeto; pediste "data como any"
  pagination?: {
    total: number | string; // tu backend manda "4" como string
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Hook para listar cotizaciones con paginación.
 * - Usa page y perPage como parámetros (page=1, perPage=10 por defecto)
 * - queryKey incluye la página para cachear/invalidate por página
 * - keepPreviousData evita flicker entre páginas
 */
export const useCotizaciones = (page: number = 1, perPage: number = 10) => {
  return useQuery<ApiListResponse>({
    queryKey: ['cotizaciones', { page, perPage }],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse>('/list_cotizaciones.php', {
        params: { page, per_page: perPage },
      });
      return data;
    },
  });
};


export const useUpdateCotizacion = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; comentario2: string; estado: string }) => {
      const { data } = await api.put("/actualizar_cotizacion.php", payload);
      return data;
    },
    onSuccess: async () => {
      // Refrescar queries relacionadas
      await qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      Swal.fire({
        icon: "success",
        title: "Cotización actualizada",
        timer: 1800,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar la cotización";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};