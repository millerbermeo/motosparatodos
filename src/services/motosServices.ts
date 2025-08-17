// src/services/motosServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance"; // ajusta si tu ruta es otra
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useModalStore } from "../store/modalStore";

/* ===== TIPOS ===== */
export interface Moto {
  id: number;
  marca: string;
  linea: string;
  modelo: string;
  estado: string;        // p.ej. "Nueva" | "Usada"
  precio_base: number;   // en tu API puede venir string; lo normalizamos a number
  descrip: string;
  imagen?: any;       // URL/filename guardado por el backend
  empresa?: string
  subdistribucion: string
}

export type NewMoto = Omit<Moto, "id" | "imagen"> & { imagen?: File | null };

export interface MotosResponse {
  motos: Moto[];
}

export interface ServerError {
  message: string | string[];
}

/* Helper para armar FormData */
const toFormData = (data: Partial<Moto> & { imagen?: File | null }) => {
  const fd = new FormData();
  if (data.id != null) fd.append("id", String(data.id));
  if (data.marca != null) fd.append("marca", data.marca);
  if (data.linea != null) fd.append("linea", data.linea);
  if (data.modelo != null) fd.append("modelo", data.modelo);
  if (data.estado != null) fd.append("estado", data.estado);
  if (data.precio_base != null) fd.append("precio_base", String(data.precio_base));
  if (data.descrip != null) fd.append("descrip", data.descrip);

  // 🔹 Agregar los dos campos nuevos (nombres en string)
  if (data.empresa != null) fd.append("empresa", data.empresa);
  if (data.subdistribucion != null) fd.append("subdistribucion", data.subdistribucion);
  
  if (data.imagen instanceof File) fd.append("imagen", data.imagen);
  return fd;
};

/* ===== QUERIES ===== */
export const useMotos = () => {
  return useQuery<Moto[]>({
    queryKey: ["motos"],
    queryFn: async () => {
      const { data } = await api.get<MotosResponse>("/list_motos.php");
      // si tu API devuelve strings, castea precio_base a number
      return data.motos.map((m) => ({
        ...m,
        precio_base: typeof m.precio_base === "string" ? Number(m.precio_base) : m.precio_base,
      }));
    },
  });
};

/* ===== MUTATIONS ===== */
// create (POST sin id)
export const useCreateMoto = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewMoto) => {
      const fd = toFormData(payload);
      const { data } = await api.post("/create_moto.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["motos"] });
      closeModal();
      Swal.fire({ icon: "success", title: "Moto creada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear la moto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// update (POST con id)
export const useUpdateMoto = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: Moto & { nuevaImagen?: File | null }) => {
      // si no cambias imagen, pasa nuevaImagen = null/undefined
      const fd = toFormData({
        ...payload,
        imagen: payload.nuevaImagen ?? null,
      });
      const { data } = await api.post("/create_moto.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["motos"] });
      closeModal();
      Swal.fire({ icon: "success", title: "Moto actualizada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar la moto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// delete (DELETE con body { id })
export const useDeleteMoto = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete("/create_moto.php", { data: { id } });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["motos"] });
      Swal.fire({ icon: "success", title: "Moto eliminada", timer: 1400, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar la moto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};



/* ===== TIPOS ===== */
export interface ImpuestosMoto {
  id: number;                // oculto en el form (p.ej. el id del registro o de la moto)
  soat: string;              // "458000"
  matricula_contado: string; // "4548000"
  matricula_credito: string; // "4538000"
  impuestos: string;         // "4548000"
}

export type NewImpuestosMoto = Omit<ImpuestosMoto, "id"> & { id?: number };



// src/services/motosServices.ts

export const useUpdateImpuestosMoto = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: ImpuestosMoto) => {
      // 🔹 Enviar como JSON
      const { data } = await api.put("/impuesto_moto.php", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["impuestos-moto"] }),
        qc.invalidateQueries({ queryKey: ["motos"] }),
      ]);
      close();
      Swal.fire({
        icon: "success",
        title: "Impuestos actualizados",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw =
        error.response?.data?.message ?? "Error al actualizar impuestos";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
