// src/services/cumpleanosServices.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

export interface ClienteCumple {
  id: number;
  cedula: string;
  name?: string;
  s_name?: string;
  last_name?: string;
  s_last_name?: string;
  celular?: string;
  email?: string;
  fecha_nacimiento?: string;
  fecha_creacion?: string;
  birthday_this_year?: string | null;
  has_had_birthday?: boolean | null;
  days_until?: number | null;
  age_this_year?: number | null;
  birth_month?: number | null;
}

export interface CumpleanosResponse {
  success: boolean;
  data: ClienteCumple[] | ClienteCumple;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const useCumpleanosClientes = (
  page: number = 1,
  perPage: number = 10,
  filters?: {
    month?: number;
    status?: "cumplidos" | "por_cumplir";
    cedula?: string;
  }
) => {
  return useQuery<CumpleanosResponse>({
    queryKey: ["cumpleanos", { page, perPage, filters }],
    queryFn: async () => {
      const params: any = { page, per_page: perPage };
      if (filters?.month) params.month = filters.month;
      if (filters?.status) params.status = filters.status;
      if (filters?.cedula) params.cedula = filters.cedula.trim();

      const { data } = await api.get<CumpleanosResponse>(
        "/clientes-cumpleanos.php",
        { params }
      );

      // 🔹 Normalizamos siempre a array
      let normalizedData: ClienteCumple[] = [];
      if (Array.isArray(data?.data)) normalizedData = data.data;
      else if (data?.data && typeof data.data === "object")
        normalizedData = [data.data];

      return {
        ...data,
        data: normalizedData,
      } as CumpleanosResponse;
    },
  });
};
