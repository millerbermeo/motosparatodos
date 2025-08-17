import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { api } from "./axiosInstance";
import type { Punto, NewPunto, PuntosResponse, PuntoAPI } from "../shared/types/puntos";
import { useModalStore } from "../store/modalStore";
import type { ServerError } from "../shared/types/server";

/* ----- helpers ----- */
const toFormData = (data: Partial<Punto>) => {
  const fd = new FormData();
  if (data.id != null) fd.append("id", String(data.id));
  if (data.empresa_id != null) fd.append("empresa_id", String(data.empresa_id));
  if (data.nombre_punto != null) fd.append("nombre_punto", data.nombre_punto);
  if (data.telefono != null) fd.append("telefono", data.telefono);
  if (data.correo != null) fd.append("correo", data.correo);
  if (data.direccion != null) fd.append("direccion", data.direccion);
  return fd;
};

// Hook: devuelve el JSON del backend sin tocarlo
export const usePuntos = () => {
  return useQuery<PuntoAPI[]>({
    queryKey: ["puntos"],
    queryFn: async () => {
      // Usa GET porque tu tester está haciendo GET (según captura)
      const { data } = await api.get<PuntosResponse>("/puntos.php");
      return data.puntos; // sin map, 1:1 con el backend
    },
  });
};



/* ----- mutations ----- */
export const useCreatePunto = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewPunto) => {
      const fd = toFormData(payload);
      const { data } = await api.post("/puntos.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["puntos"] });
      close();
      Swal.fire({ icon: "success", title: "Punto creado", timer: 1600, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear el punto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export const useUpdatePunto = () => {
  const qc = useQueryClient();
  const close = useModalStore((s) => s.close);
  
  return useMutation({
    mutationFn: async (payload: Punto) => {
console.log("payload",payload)
      const { data } = await api.post("/puntos.php", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["puntos"] });
      close();
      Swal.fire({ icon: "success", title: "Punto actualizado", timer: 1600, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar el punto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export const useDeletePunto = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {

      const { data } = await api.post("/puntos.php", toFormData({ id /* , accion: 'delete' */ }), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["puntos"] });
      Swal.fire({ icon: "success", title: "Punto eliminado", timer: 1200, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar el punto";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
