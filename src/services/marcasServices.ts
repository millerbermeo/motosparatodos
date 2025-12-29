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

// ✅ NUEVO: recibe q opcional
export const useMarcas = (q?: string) => {
  const qClean = (q ?? "").trim();

  return useQuery<Marca[]>({
    queryKey: ["marcas", qClean],
    queryFn: async () => {
      const params = qClean ? { q: qClean } : undefined;
      const { data } = await api.get<MarcasResponse>("/list_marcas.php", { params });
      return data.marcas;
    },
    staleTime: 10_000,
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



export interface Moto {
  linea: string;
  precio_base: number;
  soat: number;
  matricula_contado: number;
  matricula_credito: number;
  impuestos: number;
  modelo?: string
  descuento_empresa?: string
  descuento_ensambladora?: string
  foto: string | null
  id_empresa?: number | null;

}

export interface FiltroMarcaResponseRaw {
  success: boolean;
  marca: string;
  count: number | string;
  motos: Array<{
    linea: string;
    foto?: string;
    precio_base: string | number;
    soat: string | number;
    matricula_contado: string | number;
    matricula_credito: string | number;
    impuestos: string | number;
    modelo: string
    descuento_empresa?: string
    descuento_ensambladora?: string
      id_empresa?: number | null;

  }>;
}

export interface FiltroMarcaResponse {
  success: boolean;
  marca: string;
  count: number;
  motos: Moto[];
  foto?: string;
}

/**
 * Hook para obtener las motos de una marca específica.
 * Usa GET /filter_marca.php?marca=<nombre>
 */
export const useMotosPorMarca = (marca: string | undefined) => {
  return useQuery<FiltroMarcaResponse>({
    queryKey: ["motos-por-marca", marca],
    enabled: !!marca && marca.trim().length > 0,
    queryFn: async () => {
      // Mejor pasar params que armar el querystring a mano
      const { data } = await api.get<FiltroMarcaResponseRaw>("/filter_marca.php", {
        params: { marca },
      });

      // Normalizamos números porque el backend los devuelve como string
      const normalizeNumber = (v: string | number) =>
        typeof v === "number" ? v : Number(v ?? 0);

      return {
        success: data.success,
        marca: data.marca,
        count: normalizeNumber(data.count),
        motos: (data.motos ?? []).map((m) => ({
          linea: m.linea,
          foto: m.foto ?? null,
          precio_base: normalizeNumber(m.precio_base),
          soat: normalizeNumber(m.soat),
          matricula_contado: normalizeNumber(m.matricula_contado),
          matricula_credito: normalizeNumber(m.matricula_credito),
          impuestos: normalizeNumber(m.impuestos),
          modelo: m.modelo,
          descuento_empresa: m.descuento_empresa,
          descuento_ensambladora: m.descuento_ensambladora,
          id_empresa: m.id_empresa
        })),
      };
    },
    // mantiene los datos previos mientras cambias la marca
    placeholderData: (prev) => prev,
  });
};