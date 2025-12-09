// src/services/empresasServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useModalStore } from "../store/modalStore";
import type { Empresa, EmpresaOption, EmpresasResponse, EmpresasSelectResponse, NewEmpresa } from "../shared/types/empresas";
import type { ServerError } from "../shared/types/server";



/* ===== Helper: FormData ===== */
const toEmpresaFormData = (data: Partial<Empresa> & { imagen?: File | null }) => {
  const fd = new FormData();
  if (data.id != null) fd.append("id", String(data.id));
  if (data.nombre_empresa != null) fd.append("nombre_empresa", data.nombre_empresa);
  if (data.nit_empresa != null) fd.append("nit_empresa", data.nit_empresa);
  if (data.correo_garantias != null) fd.append("correo_garantias", data.correo_garantias);
  if (data.telefono_garantias != null) fd.append("telefono_garantias", data.telefono_garantias);
  if (data.correo_siniestros != null) fd.append("correo_siniestros", data.correo_siniestros);
  if (data.telefono_siniestros != null) fd.append("telefono_siniestros", data.telefono_siniestros);
  if (data.direccion_siniestros != null) fd.append("direccion_siniestros", data.direccion_siniestros);
  if (data.slogan_empresa != null) fd.append("slogan_empresa", data.slogan_empresa);
  if (data.sitio_web != null) fd.append("sitio_web", data.sitio_web);
  if (data.imagen instanceof File) fd.append("imagen", data.imagen);
  return fd;
};

/* ===== QUERIES ===== */
export const useEmpresas = () => {
  return useQuery<Empresa[]>({
    queryKey: ["empresas"],
    queryFn: async () => {
      // Ajusta al endpoint real. Si usas un único empresas.php con action=list, cámbialo abajo.
      const { data } = await api.get<EmpresasResponse>("/empresas.php");
      return data.empresas;
    },
  });
};


// Hook que SIEMPRE devuelve un array (aunque esté vacío)
export const useEmpresasSelect = () => {
  return useQuery<EmpresaOption[]>({
    queryKey: ["empresas-select"],
    queryFn: async () => {
      const { data } = await api.get<EmpresasSelectResponse>("/empresas_id.php");
      const lista = data?.puntos ?? [];
      return lista.map((e) => ({
        id: Number(e.id),
        nombre: e.nombre_empresa,
      }));
    },
    initialData: [],
  });
};

/* ===== MUTATIONS ===== */
// create
export const useCreateEmpresa = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: NewEmpresa) => {
      const fd = toEmpresaFormData(payload);
      // Si usas empresas.php para todo, podrías necesitar fd.append("accion", "create")
      const { data } = await api.post("/empresas.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as { success: boolean; id?: number; message?: string };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["empresas"] });
      closeModal();
      Swal.fire({ icon: "success", title: "Empresa creada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al crear la empresa";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// update (si no cambias la imagen, no adjuntes el campo)
export const useUpdateEmpresa = () => {
  const qc = useQueryClient();
  const closeModal = useModalStore((s) => s.close);

  return useMutation({
    mutationFn: async (payload: Empresa & { nuevaImagen?: File | null }) => {
      const fd = toEmpresaFormData({
        ...payload,
        imagen: payload.nuevaImagen ?? null,
      });
      // Si usas un único endpoint, puede requerir accion=update
      const { data } = await api.post("/empresas.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as { success: boolean; message?: string };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["empresas"] });
      closeModal();
      Swal.fire({ icon: "success", title: "Empresa actualizada", timer: 1800, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al actualizar la empresa";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

// delete
export const useDeleteEmpresa = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {

      const { data } = await api.delete("/empresas.php", { params: { id } });


      return data as { success: boolean; message?: string };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["empresas"] });
      Swal.fire({ icon: "success", title: "Empresa eliminada", timer: 1400, showConfirmButton: false });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al eliminar la empresa";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};


// Trae UNA empresa por id (toda la data de la tabla)
export const useEmpresaById = (id?: number) => {
  return useQuery<any | null>({
    queryKey: ["empresa-by-id", id],
    enabled: !!id, // solo consulta si hay id
    queryFn: async () => {
      const { data } = await api.get<any>("/empresas_id_full.php", {
        params: { id },
      });
      return data.empresa ?? null;
    },
  });
};
