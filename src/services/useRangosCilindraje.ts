import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useModalStore } from "../store/modalStore";

/* ===== TIPOS ===== */

export interface RangoCilindraje {
  id: number;
  descripcion: string;
  cilindraje_min: number | null;
  cilindraje_max: number | null;
  precio: number;
  soat: number;
  matricula_credito: number;
  matricula_contado: number;
  impuestos: number;
  total_credito: number;  // precio + soat + matricula_credito + impuestos
  total_contado: number;  // precio + soat + matricula_contado + impuestos
}

export interface RangoCilindrajeResponse {
  rangos: RangoCilindraje[];
}

export interface ServerError {
  message?: string | string[];
  error?: string | string[];
}

/* ===== HELPERS ===== */

const parseError = (error: AxiosError<ServerError>, fallback: string) => {
  const data = error.response?.data;
  const raw = data?.message ?? data?.error ?? fallback;
  const arr = Array.isArray(raw) ? raw : [raw];
  Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
};

const toNumberOrNull = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const normalizeRango = (t: any): RangoCilindraje => ({
  id: Number(t.id),
  descripcion: String(t.descripcion ?? ""),
  cilindraje_min: toNumberOrNull(t.cilindraje_min),
  cilindraje_max: toNumberOrNull(t.cilindraje_max),
  precio: Number(t.precio ?? 0),
  soat: Number(t.soat ?? 0),
  matricula_credito: Number(t.matricula_credito ?? 0),
  matricula_contado: Number(t.matricula_contado ?? 0),
  impuestos: Number(t.impuestos ?? 0),
  total_credito: Number(t.total_credito ?? 0),
  total_contado: Number(t.total_contado ?? 0),
});

/* ===== QUERIES ===== */

// Listar todos los rangos de cilindraje
export const useRangosCilindraje = () => {
  return useQuery<RangoCilindraje[]>({
    queryKey: ["rango-cilindraje"],
    queryFn: async () => {
      const { data } = await api.get<RangoCilindrajeResponse>("/rango_cilindraje.php");
      return (data.rangos || []).map(normalizeRango);
    },
  });
};

// Obtener un rango por ID
export const useRangoCilindrajeById = (id: number | null, enabled = true) => {
  return useQuery<RangoCilindraje | null>({
    queryKey: ["rango-cilindraje", "id", id],
    enabled: !!id && enabled,
    queryFn: async () => {
      const { data } = await api.get<RangoCilindrajeResponse>("/rango_cilindraje.php", {
        params: { id },
      });

      const items = (data.rangos || []).map(normalizeRango);
      return items[0] ?? null;
    },
  });
};

/* ===== MUTATIONS ===== */

export type NewRangoCilindraje = Omit<
  RangoCilindraje,
  "id" | "total_credito" | "total_contado"
>;
export type UpdateRangoCilindraje = RangoCilindraje;

// Crear (POST)
export const useCreateRangoCilindraje = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewRangoCilindraje) => {
      const body = {
        descripcion: payload.descripcion,
        cilindraje_min: toNumberOrNull(payload.cilindraje_min),
        cilindraje_max: toNumberOrNull(payload.cilindraje_max),
        precio: Number(payload.precio),
        soat: Number(payload.soat ?? 0),
        matricula_credito: Number(payload.matricula_credito ?? 0),
        matricula_contado: Number(payload.matricula_contado ?? 0),
        impuestos: Number(payload.impuestos ?? 0),
      };

      const { data } = await api.post("/rango_cilindraje.php", body, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rango-cilindraje"] });
      close();
      Swal.fire({
        icon: "success",
        title: "Rango creado",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) =>
      parseError(error, "Error al crear el rango de cilindraje"),
  });
};

// Actualizar (PUT)
export const useUpdateRangoCilindraje = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: UpdateRangoCilindraje) => {
      const body = {
        id: Number(payload.id),
        descripcion: payload.descripcion,
        cilindraje_min: toNumberOrNull(payload.cilindraje_min),
        cilindraje_max: toNumberOrNull(payload.cilindraje_max),
        precio: Number(payload.precio),
        soat: Number(payload.soat ?? 0),
        matricula_credito: Number(payload.matricula_credito ?? 0),
        matricula_contado: Number(payload.matricula_contado ?? 0),
        impuestos: Number(payload.impuestos ?? 0),
      };

      const { data } = await api.put("/rango_cilindraje.php", body, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rango-cilindraje"] });
      close();
      Swal.fire({
        icon: "success",
        title: "Rango actualizado",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) =>
      parseError(error, "Error al actualizar el rango de cilindraje"),
  });
};




/* ===== NUEVO: RESPUESTA DEL ENDPOINT DE BÚSQUEDA ===== */

interface BuscarRangoCilindrajeResponse {
  rango: any | null;
  error?: string | string[];
}

/* ===== NUEVOS HOOKS DE BÚSQUEDA ===== */

// Buscar rango por cilindraje (ej: 150 cc)
export const useRangoPorCilindraje = (
  cilindraje: number | null,
  enabled = true
) => {
  return useQuery<RangoCilindraje | null, AxiosError<ServerError>>({
    queryKey: ["rango-cilindraje", "buscar", "cilindraje", cilindraje],
    enabled: enabled && cilindraje !== null && !Number.isNaN(Number(cilindraje)),
    queryFn: async () => {
      const { data } = await api.get<BuscarRangoCilindrajeResponse>(
        "/buscar_cilindraje.php",
        { params: { cilindraje } }
      );

      if (!data.rango) return null;
      return normalizeRango(data.rango);
    }
  });
};

// Buscar rango de Motocarros
export const useRangoMotocarro = (enabled = true) => {
  return useQuery<RangoCilindraje | null, AxiosError<ServerError>>({
    queryKey: ["rango-cilindraje", "buscar", "motocarro"],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<BuscarRangoCilindrajeResponse>(
        "/buscar_cilindraje.php",
        { params: { motocarro: 1 } }
      );

      if (!data.rango) return null;
      return normalizeRango(data.rango);
    }
  });
};
