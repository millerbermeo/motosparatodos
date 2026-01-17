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
  estado_moto: 0 | 1; // ✅ ACTIVO/INACTIVO (1/0)

  linea: string;
  modelo: string;
  estado: string; // p.ej. "Nueva" | "Usada"
  precio_base: number; // en tu API puede venir string; lo normalizamos a number
  descrip: string;
  imagen?: any; // URL/filename guardado por el backend
  empresa?: string;
  subdistribucion: string;
  soat?: string;
  matricula_contado?: string;
  matricula_credito?: string;
  impuestos?: string;
  descuento_empresa?: string;
  descuento_ensambladora?: string;
  id_empresa?: number;
  id_distribuidora?: number;
}

export type NewMoto = Omit<Moto, "id" | "imagen"> & { imagen?: File | null };

export interface MotosResponse {
  motos: Moto[];
}

export interface ServerError {
  message?: string | string[];
  error?: string | string[];
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

  // ✅ quitar duplicados: soat e impuestos se estaban enviando 2 veces
  if (data.soat != null) fd.append("soat", data.soat);
  if (data.matricula_contado != null) fd.append("matricula_contado", data.matricula_contado);
  if (data.matricula_credito != null) fd.append("matricula_credito", data.matricula_credito);
  if (data.impuestos != null) fd.append("impuestos", data.impuestos);

  if (data.descuento_empresa != null) fd.append("descuento_empresa", data.descuento_empresa);
  if (data.descuento_ensambladora != null) fd.append("descuento_ensambladora", data.descuento_ensambladora);

  if (data.imagen instanceof File) fd.append("imagen", data.imagen);

  // 🔹 NUEVO: enviar los IDs al backend
  if (data.id_empresa != null) {
    fd.append("id_empresa", String(data.id_empresa));
  }
  if (data.id_distribuidora != null) {
    fd.append("id_distribuidora", String(data.id_distribuidora));
  }

  return fd;
};

export type MotoFilters = {
  marca?: string;
  linea?: string;
  modelo?: string;
  empresa?: string;
  estado?: "Nueva" | "Usada" | "";
};

export interface MotosResponse {
  success?: boolean;
  count?: number;
  motos: Moto[];
}

const clean = (v?: string) => {
  const t = (v ?? "").trim();
  return t.length ? t : undefined;
};

export const useMotos = (filters: MotoFilters) => {
  // queryKey incluye filtros => cambia => refetch automático
  return useQuery<Moto[]>({
    queryKey: ["motos", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (clean(filters.marca)) params.marca = clean(filters.marca)!;
      if (clean(filters.linea)) params.linea = clean(filters.linea)!;
      if (clean(filters.modelo)) params.modelo = clean(filters.modelo)!;
      if (clean(filters.empresa)) params.empresa = clean(filters.empresa)!;
      if (clean(filters.estado)) params.estado = clean(filters.estado)!;

      const { data } = await api.get<MotosResponse>("/list_motos.php", { params });

      return (data.motos ?? []).map((m) => ({
        ...m,
        precio_base: typeof m.precio_base === "string" ? Number(m.precio_base) : m.precio_base,
      }));
    },
    staleTime: 10_000,
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
      const raw =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al crear la moto";
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
      const raw =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al actualizar la moto";
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
      const raw =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al eliminar la moto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

/* ===== TIPOS ===== */
export interface ImpuestosMoto {
  id: number; // oculto en el form (p.ej. el id del registro o de la moto)
  soat: string; // "458000"
  matricula_contado: string; // "4548000"
  matricula_credito: string; // "4538000"
  impuestos: string; // "4548000"
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
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al actualizar impuestos";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// ===== DESCUENTOS =====
export interface DescuentosMotoPayload {
  id: number;
  descuento_empresa?: number | string; // opcional
  descuento_ensambladora?: number | string; // opcional
}

export const useUpdateDescuentosMoto = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: DescuentosMotoPayload) => {
      const body: Record<string, number> & { id: number } = { id: Number(payload.id) };

      const addIfNumber = (k: "descuento_empresa" | "descuento_ensambladora", v: any) => {
        if (v !== undefined && v !== null && String(v).trim() !== "" && !Number.isNaN(Number(String(v).replace(/\D/g, "")))) {
          body[k] = Number(String(v).replace(/\D/g, ""));
        }
      };

      addIfNumber("descuento_empresa", payload.descuento_empresa);
      addIfNumber("descuento_ensambladora", payload.descuento_ensambladora);

      const { data } = await api.put("/descuentos.php", body, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["motos"] }),
        qc.invalidateQueries({ queryKey: ["descuentos"] }),
      ]);
      close();
      Swal.fire({ icon: "success", title: "Descuentos actualizados", timer: 1600, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al actualizar descuentos";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// ===== TOGGLE ESTADO MOTO (estado_moto 1/0) =====
export interface ToggleEstadoMotoResponse {
  success: boolean;
  id: number;
  estado_anterior: 0 | 1; // estado_moto anterior
  estado_nuevo: 0 | 1; // estado_moto nuevo
}

export const useToggleEstadoMoto = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<ToggleEstadoMotoResponse>(
        "/toggle_estado_moto.php",
        { id },
        { headers: { "Content-Type": "application/json" } }
      );
      return data;
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["motos"] });

      Swal.fire({
        icon: "success",
        title: res.estado_nuevo === 1 ? "Moto activada" : "Moto inactivada",
        timer: 1400,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<any>) => {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Error al cambiar el estado";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    },
  });
};
