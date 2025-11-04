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
    onSuccess: async (data) => {
      const newId = data?.id;

      await qc.invalidateQueries({ queryKey: ["motos"] });

      if (newId) {
        await qc.invalidateQueries({ queryKey: ["cotizacion-id", newId] });
      } Swal.fire({ icon: "success", title: "cotización creada", timer: 1800, showConfirmButton: false });
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
// src/services/cotizacionesServices.ts
export const useCotizaciones = (
  page: number = 1,
  perPage: number = 10,
  estado?: string   // 👈 nuevo param opcional
) => {
  return useQuery<ApiListResponse>({
    queryKey: ['cotizaciones', { page, perPage, estado }],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse>('/list_cotizaciones.php', {
        params: {
          page,
          per_page: perPage,
          ...(estado ? { estado } : {}), // 👈 solo lo manda si tiene valor
        },
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



// types.ts (o en tu services)
export interface Persona {
  id: number;         // el backend devuelve id; usamos number
  name?: string;    // segundo nombre / nombre corto
  cedula?: string;
  [k: string]: any;
}

type PersonasResponse =
  | Persona[]
  | { success: boolean; data: Persona[] }; // por si devuelves objeto

export const useBuscarPersonas = (qInput: string) => {
  const q = (qInput ?? "").trim();

  return useQuery<Persona[]>({
    queryKey: ["personas-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data } = await api.get<PersonasResponse>("/select_cotizacion.php", {
        params: { q }, // <-- backend espera 'q'
      });

      const list = Array.isArray(data) ? data : (data && data.data) ? data.data : [];
      // Normaliza a número por si el backend envía string
      return list.map(p => ({ ...p, id: Number(p.id) }));
    },
    staleTime: 60_000, // 1 min
  });
};




export interface CotizacionActividad {
  id: number;
  id_cotizacion: number;
  nombre_usuario: string;
  rol_usuario: string;
  comentario: string;
  fecha_creacion: string;      // "YYYY-MM-DD HH:mm:ss"
  fecha_actualizacion: string; // "YYYY-MM-DD HH:mm:ss"
}

/**
 * Lista actividades (comentarios) de una cotización.
 * - Llama a /cotizacion_actividades_listar.php?id_cotizacion=...&limit=&offset=
 * - El backend devuelve un array simple.
 */
export const useCotizacionActividades = (
  idCotizacion: Id | undefined,
  opts?: { limit?: number; offset?: number; enabled?: boolean }
) => {
  const parsedId =
    typeof idCotizacion === "string" ? idCotizacion.trim() : idCotizacion;
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;

  return useQuery<CotizacionActividad[]>({
    queryKey: ["cotizacion-actividades", parsedId, limit, offset],
    enabled:
      parsedId !== undefined &&
      parsedId !== null &&
      `${parsedId}` !== "" &&
      (opts?.enabled ?? true),
    queryFn: async () => {
      const { data } = await api.get<CotizacionActividad[]>(
        "/actividades.php",
        { params: { id_cotizacion: parsedId, limit, offset } }
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000, // opcional
  });
};


// === Buscar cotización por código de crédito ===
export const useCotizacionByCodigoCredito = (codigoCredito: string | undefined) => {
  const codigo = (codigoCredito ?? "").trim();

  return useQuery({
    queryKey: ["cotizacion-by-codigo", codigo],
    enabled: codigo.length > 0,
    queryFn: async () => {
      const { data } = await api.get("/get_cotizacion_por_codigo_credito.php", {
        params: { codigo_credito: codigo },
      });

      if (!data?.success) {
        throw new Error(
          data?.error ?? "No se pudo obtener la cotización por código de crédito"
        );
      }

      // Devuelve directamente el objeto completo que incluye:
      // success, codigo_credito, cotizacion_id y cotizacion
      return data;
    },

  });
};
