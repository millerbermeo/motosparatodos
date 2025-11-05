// src/api/hooksActas.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

/** ===== Tipos ===== */
export type EstadoActa = "borrador" | "cerrada";

export interface ActaEntrega {
  id_acta: number;
  id_factura: number;
  fecha_entrega: string;     // "YYYY-MM-DD HH:mm:ss"
  responsable: string;
  observaciones: string | null;
  firma_url: string | null;
  estado: EstadoActa;
  fotos: string[];           // ["foto1.png","foto2.jpg"]
}

export type NewActa = Omit<ActaEntrega, "id_acta">;
export type UpdateActa = Partial<Omit<ActaEntrega, "id_factura" | "fecha_entrega" | "responsable" | "estado" | "fotos">>
  & { id_acta: number }
  & Partial<Pick<ActaEntrega, "id_factura" | "fecha_entrega" | "responsable" | "estado" | "fotos" | "firma_url" | "observaciones">>;

export interface ListResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: T[];
}

export interface ItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ServerError {
  error?: string;
  message?: string | string[];
}

/** Util: formatear Date a "YYYY-MM-DD HH:mm:ss" */
export const toMySQLDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/** ===== Listado con búsqueda/paginación =====
 * GET /acta.php?page=&limit=&q=&factura=
 */
export const useActas = (opts?: { page?: number; limit?: number; q?: string; factura?: number }) => {
  const { page = 1, limit = 50, q, factura } = opts ?? {};
  return useQuery({
    queryKey: ["actas", { page, limit, q, factura }],
    queryFn: async () => {
      const { data } = await api.get<ListResponse<ActaEntrega>>("/acta.php", {
        params: { page, limit, q, factura },
      });
      return data;
    },
  });
};

/** ===== Obtener una acta por ID =====
 * GET /acta.php?id=123
 */
export const useActaById = (id_acta: number | undefined) => {
  return useQuery({
    queryKey: ["acta", id_acta],
    enabled: !!id_acta && id_acta > 0,
    queryFn: async () => {
      const { data } = await api.get<ItemResponse<ActaEntrega>>("/acta.php", {
        params: { id: id_acta },
      });
      return data.data;
    },
  });
};

/** ===== Crear (JSON) =====
 * POST /acta.php
 * body: { id_factura, fecha_entrega, responsable, fotos, observaciones?, firma_url?, estado? }
 * -> Útil si ya tienes URLs (no archivos). Mantengo este hook por compatibilidad.
 */
export const useCreateActa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id_factura: number;
      fecha_entrega: string;        // usa toMySQLDateTime(new Date())
      responsable: string;
      fotos: string[];
      observaciones?: string | null;
      firma_url?: string | null;
      estado?: EstadoActa;          // default 'borrador'
    }) => {
      const { data } = await api.post("/acta.php", payload);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["actas"] });
      Swal.fire({ icon: "success", title: "Acta creada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) || "Error al crear el acta";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Crear (FormData / archivos) =====
 * POST /acta.php (multipart/form-data)
 * fields:
 *  - id_factura, fecha_entrega, responsable, estado, observaciones?, firma_url?
 *  - firma_file? (File)
 *  - fotos[] (File[])  // múltiples
 */
export const useCreateActaFormData = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id_factura: number;
      fecha_entrega: string;
      responsable: string;
      estado: EstadoActa;
      observaciones?: string | null;
      firma_url?: string | null;   // usar si no mandas archivo de firma
      firmaFile?: File | null;     // opcional (si hay archivo de firma)
      files: File[];               // fotos
    }) => {
      const fd = new FormData();
      fd.append("id_factura", String(payload.id_factura));
      fd.append("fecha_entrega", payload.fecha_entrega);
      fd.append("responsable", payload.responsable);
      fd.append("estado", payload.estado);
      if (payload.observaciones != null) fd.append("observaciones", payload.observaciones);
      if (payload.firma_url) fd.append("firma_url", payload.firma_url);
      if (payload.firmaFile) fd.append("firma_file", payload.firmaFile);
      for (const f of payload.files) fd.append("fotos[]", f);
      fd.append("_multipart", "1"); // bandera opcional para backend

      const { data } = await api.post("/acta.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["actas"] });
      Swal.fire({ icon: "success", title: "Acta creada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) || "Error al crear el acta";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Actualizar =====
 * PUT /acta.php
 * body: { id_acta, ...campos a modificar }
 * Notas:
 *  - Puedes mandar solo los campos que cambian.
 *  - Para cerrar: manda estado='cerrada' + firma_url (y si actualizas fotos, que tenga ≥1).
 */
export const useUpdateActa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateActa) => {
      const { data } = await api.put("/acta.php", payload);
      return data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["actas"] }),
        qc.invalidateQueries({ queryKey: ["acta", (variables as any).id_acta] }),
      ]);
      Swal.fire({ icon: "success", title: "Acta actualizada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) || "Error al actualizar el acta";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Eliminar =====
 * DELETE /acta.php
 * body: { id_acta }
 */
export const useDeleteActa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id_acta: number) => {
      const { data } = await api.delete("/acta.php", { data: { id_acta } });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["actas"] });
      Swal.fire({ icon: "success", title: "Acta eliminada", timer: 1500, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const msg =
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join("\n")
          : error.response?.data?.error || error.response?.data?.message) || "Error al eliminar el acta";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    },
  });
};

/** ===== Helpers opcionales para fotos (modo JSON) ===== */

/** Añadir una foto al array (desde el front, luego mandar por PUT) */
export const appendFotoLocal = (acta: ActaEntrega, nuevaFoto: string): ActaEntrega =>
  ({ ...acta, fotos: [...(acta.fotos ?? []), nuevaFoto] });

/** Remover una foto por índice (desde el front, luego mandar por PUT) */
export const removeFotoLocal = (acta: ActaEntrega, index: number): ActaEntrega =>
  ({ ...acta, fotos: acta.fotos.filter((_, i) => i !== index) });
