// src/services/formatosServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

// Tipos solicitados: usar any
export type Formato = any;
export interface ServerError { message?: string | string[] }

export const useFormatos = () => {
  return useQuery<Formato[]>({
    queryKey: ["formatos"],
    queryFn: async ({ signal }) => {
      // GET http://tuclick.vozipcolombia.net.co/motos/back/formatos.php
      const { data } = await api.get("/formatos.php", { signal });
      // La API devuelve { success: true, formatos: [...] }
      const arr = Array.isArray(data?.formatos) ? data.formatos : [];
      return arr as Formato[];
    },
    staleTime: 30_000,
  });
};


// src/services/formatosServices.ts
export const useCreateFormato = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["formatos", "create"],
    mutationFn: async (payload: { name: string; documento: File }) => {
      const fd = new FormData();
      fd.append("name", payload.name);
      fd.append("documento", payload.documento, payload.documento.name);

      const { data } = await api.post("/formatos.php", fd, {
        headers: { "Content-Type": "multipart/form-data" }, // opcional si deja el interceptor
      });

      return data as any;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["formatos"] });
      Swal.fire({ icon: "success", title: "Formato creado", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear formato";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};


export const useDeleteFormato = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["formatos", "delete"],
    // DELETE con body { id }
    mutationFn: async (id: number) => {
      const { data } = await api.delete("/formatos.php", {
        data: { id },
        headers: { "Content-Type": "application/json" },
      });
      return data as any;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["formatos"] });
      Swal.fire({ icon: "success", title: "Formato eliminado", timer: 1400, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar formato";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
