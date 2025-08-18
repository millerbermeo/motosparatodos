// src/api/hooksMarcas.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import { useModalStore } from "../store/modalStore";
import Swal from "sweetalert2";


export interface Marca {
  id: number;
  marca: string;
}

export type NewMarca = Omit<Marca, "id">;

export interface MarcasResponse {
  marcas: Marca[];
}

export interface ServerError {
  message: string | string[];
}


export const useMarcas = () => {
  return useQuery<Marca[]>({
    queryKey: ["marcas"],
    queryFn: async () => {
      const { data } = await api.get<MarcasResponse>("/list_marcas.php");
      return data.marcas;
    },
  });
};


export const useCreateMarca = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewMarca) => {
      // POST → { "marca": "Honda" }
      const { data } = await api.post("/create_marca.php ", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["marcas"] });
      closeModal();
      Swal.fire({
        icon: "success",
        title: "Marca creada",
        text: "La marca fue creada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear la marca";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};

export const useUpdateMarca = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: Marca) => {
      // PUT → { "id": 3, "marca": "Yamaha" }
      const { data } = await api.put("/create_marca.php ", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["marcas"] });
      closeModal();
      Swal.fire({
        icon: "success",
        title: "Marca actualizada",
        text: "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar la marca";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};

export const useDeleteMarca = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // DELETE → { "id": 3 }
      // Nota: con axios, para DELETE con body se usa "data" en el config:
      const { data } = await api.delete("/create_marca.php ", { data: { id } });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["marcas"] });
      Swal.fire({
        icon: "success",
        title: "Marca eliminada",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar la marca";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};
