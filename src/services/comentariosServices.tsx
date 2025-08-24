// src/services/comentarioServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

/* ===== Tipos ===== */
export interface ComentarioCredito {
  id: number;
  codigo_credito: string; // <- importante: string consistente
  nombre_usuario: string;
  rol_usuario: string;
  comentario: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ServerError {
  message?: string | string[];
}

/* Key helper para evitar desfaces */
const comentariosKey = (codigo: string | number) => ["comentarios", String(codigo)] as const;

/* GET */
export const useComentariosCredito = (codigo_credito: string | number, enabled: boolean = true) => {
  const codigo = String(codigo_credito);
  return useQuery<ComentarioCredito[], AxiosError<ServerError>>({
    queryKey: comentariosKey(codigo),
    enabled: enabled && !!codigo,
    queryFn: async () => {
      const { data } = await api.get<ComentarioCredito[]>("/credito_comentarios.php", {
        params: { codigo_credito: codigo },
      });
      return Array.isArray(data) ? data : [];
    },
  });
};

/* POST */
type RegistrarComentarioInput = {
  codigo_credito: string | number;
  nombre_usuario: string;
  rol_usuario: string;
  comentario: string;
};

export const useRegistrarComentarioCredito = () => {
  const qc = useQueryClient();

  return useMutation<
    ComentarioCredito,
    AxiosError<ServerError>,
    RegistrarComentarioInput
  >({
    mutationFn: async (payload) => {
      // normaliza antes de mandar
      const payloadNorm = { ...payload, codigo_credito: String(payload.codigo_credito) };
      const { data } = await api.post<ComentarioCredito>("/credito_comentarios.php", payloadNorm, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (data, variables) => {
      const codigo = String(data?.codigo_credito ?? variables.codigo_credito);

      // 1) Update inmediato del cache (opcional pero mejora UX)
      qc.setQueryData<ComentarioCredito[]>(comentariosKey(codigo), (prev) => {
        return prev ? [data, ...prev] : [data];
      });

      // 2) Y de todos modos invalida/refresca por si el backend hace más cosas
      await qc.invalidateQueries({ queryKey: comentariosKey(codigo) });

      Swal.fire({
        icon: "success",
        title: "Comentario registrado",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "Error al registrar comentario";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
