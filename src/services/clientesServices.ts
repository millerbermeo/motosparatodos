/* ===== CLIENTES ===== */

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import type { ServerError } from "../shared/types/server";

/* ===== TYPES ===== */

export interface Cliente {
  id: number;
  cedula: string;
  name?: string;
  s_name?: string;
  last_name?: string;
  s_last_name?: string;
  celular?: string;
  email?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  fecha_creacion?: string;
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

/* ===== LISTADO CON FILTROS ===== */

export const useClientes = (
  page: number = 1,
  perPage: number = 10,
  filters?: {
    cedula?: string;
    nombre?: string;
    ciudad?: string;
    departamento?: string;
  }
) => {
  return useQuery<ApiListResponseT<Cliente[]>>({
    queryKey: ["clientes", { page, perPage, filters }],
    queryFn: async () => {
      const params: any = {
        page,
        per_page: perPage,
      };

      if (filters?.cedula?.trim()) params.cedula = filters.cedula.trim();
      if (filters?.nombre?.trim()) params.nombre = filters.nombre.trim();
      if (filters?.ciudad?.trim()) params.ciudad = filters.ciudad.trim();
      if (filters?.departamento?.trim()) params.departamento = filters.departamento.trim();

      const { data } = await api.get<ApiListResponseT<Cliente[]>>(
        "/list_clientes.php",
        { params }
      );

      return {
        ...data,
        data: (data?.data ?? []).map((c) => ({
          ...c,
          id: Number(c.id),
        })),
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

/* ===== CLIENTE POR CÉDULA ===== */

export const useClienteByCedula = (cedulaInput: string | undefined | null) => {
  const cedula = (cedulaInput ?? "").trim();

  return useQuery<Cliente>({
    queryKey: ["cliente-cedula", cedula],
    enabled: cedula.length >= 3,
    queryFn: async () => {
      const { data } = await api.get<ApiListResponseT<Cliente>>(
        "/list_clientes.php",
        { params: { cedula } }
      );

      const raw = (data?.data ?? {}) as Cliente;
      return { ...raw, id: Number(raw.id) };
    },
  });
};

/* ===== REFRESH ===== */

export const useRefreshClientes = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => true,
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

/* ===== ERROR HANDLER ===== */

export const handleAxiosError = (
  error: AxiosError<ServerError>,
  fallbackMsg: string
) => {
  const raw = (error.response?.data as any)?.message ?? fallbackMsg;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
};


/* ===== BUSCAR CLIENTE (ENDPOINT RÁPIDO) ===== */

export const useBuscarClientePorCedula = (
  cedulaInput: string | undefined | null
) => {
  const cedula = (cedulaInput ?? "").trim();

  return useQuery<Cliente | null>({
    queryKey: ["buscar-cliente-cedula", cedula],
    enabled: cedula.length >= 5, // evita llamadas innecesarias
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: Cliente | null;
      }>("/buscar_cliente_cedula.php", {
        params: { cedula },
      });

      if (!data?.data) return null;

      return {
        ...data.data,
        id: Number(data.data.id),
      };
    },
    staleTime: 1000 * 60 * 5, // cache 5 min
  });
};