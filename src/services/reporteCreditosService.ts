// src/services/reporteCreditosService.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

export type CreditoFull = Record<string, any>;

export type PaginationMeta = {
  total: number | string;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type ReporteCreditosResponse = {
  success: boolean;
  data: CreditoFull[];
  pagination?: PaginationMeta;
  error?: string;
  message?: string | string[];
};

export type DateFieldCredito = "fecha_creacion" | "actualizado";

export type ReporteCreditosFilters = {
  from?: string;              // YYYY-MM-DD
  to?: string;                // YYYY-MM-DD
  dateField?: DateFieldCredito; // "fecha_creacion" | "actualizado"

  estado?: string;
  estados?: string[];

  all?: boolean;              // precarga total
  page?: number;
  perPage?: number;
};

export const useReporteCreditosFull = (
  filters: ReporteCreditosFilters,
  options?: { enabled?: boolean }
) => {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 50;
  const all = Boolean(filters.all);

  return useQuery<ReporteCreditosResponse, AxiosError<ServerError>>({
    queryKey: ["reporte-creditos-full", { ...filters, page, perPage, all }],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const params: any = {};

      // Fechas
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      // Campo de fecha (opcional)
      if (filters.dateField) params.date_field = filters.dateField;

      // Estado(s)
      if (filters.estados?.length) {
        params.estados = filters.estados.join(",");
      } else if (filters.estado) {
        params.estado = filters.estado;
      }

      // all o paginación
      if (all) {
        params.all = 1;
      } else {
        params.page = page;
        params.per_page = perPage;
      }

      // ✅ endpoint backend que creaste
      const { data } = await api.get<ReporteCreditosResponse>(
        "/reporte_creditos.php",
        { params }
      );

      return data;
    },
    staleTime: 60_000,
    retry: false,
  });
};

// ✅ helper para “precargar todo” (sin paginación)
export const usePrecargarReporteCreditosFull = (
  filters?: Omit<ReporteCreditosFilters, "all" | "page" | "perPage">,
  options?: { enabled?: boolean }
) => {
  return useReporteCreditosFull({ ...(filters ?? {}), all: true }, options);
};