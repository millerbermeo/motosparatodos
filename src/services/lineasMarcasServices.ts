// src/services/lineasServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useModalStore } from "../store/modalStore"; // ajusta la ruta
import { api } from "./axiosInstance";

/* ========= TIPOS ========= */
export interface Linea {
  id: number;
  marca: string; // nombre de la marca (texto)
  linea: string; // nombre de la línea/modelo
  cilindraje?: string | null; // nueva propiedad
}

export type NewLinea = Omit<Linea, "id">;

export interface LineasResponse {
  lineas: Linea[];
}

// Si ya tienes este tipo global, usa ese y borra este.
export interface ServerError {
  message: string | string[];
}

/* ========= QUERIES ========= */
export const useLineas = () => {
  return useQuery<Linea[]>({
    queryKey: ["lineas"],
    queryFn: async () => {
      const { data } = await api.get<LineasResponse>("/list_lineas.php");
      return data.lineas;
    },
  });
};

/* ========= MUTATIONS ========= */
export const useCreateLinea = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewLinea) => {
      // POST → { marca, linea, cilindraje }
      const { data } = await api.post("/create_linea.php", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["lineas"] });
      closeModal();
      Swal.fire({
        icon: "success",
        title: "Línea creada",
        text: "La línea fue creada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear la línea";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export const useUpdateLinea = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: Linea) => {
      // PUT → { id, marca, linea, cilindraje }
      const { data } = await api.put("/create_linea.php", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["lineas"] });
      closeModal();
      Swal.fire({
        icon: "success",
        title: "Línea actualizada",
        text: "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar la línea";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export const useDeleteLinea = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // DELETE → { id } (en body)
      const { data } = await api.delete("/create_linea.php", { data: { id } });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["lineas"] });
      Swal.fire({
        icon: "success",
        title: "Línea eliminada",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar la línea";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
