// hooks/useReporteCotizacionesFull.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

export type CotizacionFull = Record<string, any>;

export type PaginationMeta = {
  total: number | string;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type ReporteCotizacionesResponse = {
  success: boolean;
  data: CotizacionFull[];
  pagination?: PaginationMeta;
  error?: string;
  message?: string | string[];
};

export type ReporteCotizacionesFilters = {
  from?: string;
  to?: string;
  estado?: string;
  estados?: string[];
  all?: boolean;
  page?: number;
  perPage?: number;
};

export const useReporteCotizacionesFull = (
  filters: ReporteCotizacionesFilters,
  options?: { enabled?: boolean }
) => {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 50;
  const all = Boolean(filters.all);

  return useQuery<ReporteCotizacionesResponse, AxiosError<ServerError>>({
    queryKey: ["reporte-cotizaciones-full", { ...filters, page, perPage, all }],
    enabled: options?.enabled ?? true, // 👈
    queryFn: async () => {
      const params: any = {};

      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      if (filters.estados?.length) {
        params.estados = filters.estados.join(",");
      } else if (filters.estado) {
        params.estado = filters.estado;
      }

      if (all) params.all = 1;
      else {
        params.page = page;
        params.per_page = perPage;
      }

      const { data } = await api.get<ReporteCotizacionesResponse>(
        "/reporte_cotizaciones.php",
        { params }
      );

      return data;
    },
    staleTime: 60_000,
    retry: false,
  });
};

export const usePrecargarReporteCotizacionesFull = (
  filters?: Omit<ReporteCotizacionesFilters, "all" | "page" | "perPage">,
  options?: { enabled?: boolean }
) => {
  return useReporteCotizacionesFull({ ...(filters ?? {}), all: true }, options);
};