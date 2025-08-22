import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

export interface SubirFirmaPayload {
  codigo_credito: string | number;
  firma: File; // archivo que se adjunta
}

export interface SubirFirmaResponse {
  success: boolean;
  codigo_credito: string;
  firma: string; // ruta del archivo en el servidor
}

export interface ServerError {
  message: string | string[];
}






export const useSubirFirma = () => {
  const qc = useQueryClient();

  return useMutation<SubirFirmaResponse, AxiosError<ServerError>, SubirFirmaPayload>({
    mutationFn: async ({ codigo_credito, firma }) => {
      const formData = new FormData();
      formData.append("codigo_credito", String(codigo_credito));
      formData.append("firma", firma);

      const { data } = await api.post<SubirFirmaResponse>(
        "/credito_firmas.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: async (resp) => {
      // invalida lo relacionado al crédito
      await qc.invalidateQueries({ queryKey: ["credito", resp.codigo_credito] });
      await qc.invalidateQueries({ queryKey: ["creditos"] });

      Swal.fire({
        icon: "success",
        title: "Firma subida correctamente",
        text: resp.firma,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "Error al subir firma";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};



export interface SubirFormatosPayload {
  codigo_credito: string | number;
  documentos: File[]; // múltiples archivos
}

export interface SubirFormatosResponse {
  success: boolean;
  codigo_credito: string;
  soportes: string; // rutas concatenadas separadas por coma
}

export interface ServerError {
  message: string | string[];
}


export const useSubirFormatos = () => {
  const qc = useQueryClient();

  return useMutation<SubirFormatosResponse, AxiosError<ServerError>, SubirFormatosPayload>({
    mutationFn: async ({ codigo_credito, documentos }) => {
      const formData = new FormData();
      formData.append("codigo_credito", String(codigo_credito));
      documentos.forEach((doc) => formData.append("documentos[]", doc));

      const { data } = await api.post<SubirFormatosResponse>(
        "/credito_formatos.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: async (resp) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["credito", resp.codigo_credito] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),

                qc.invalidateQueries({ queryKey: ["credito_detalle", resp.codigo_credito] }),

      ]);

      Swal.fire({
        icon: "success",
        title: "Formatos subidos correctamente",
        text: resp.soportes,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "Error al subir formatos";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};






export interface CreditoDetalle {
  id: number;
  asesor: string;
  codigo_credito: string;
  nombre_cliente: string;
  producto: string;
  valor_producto: number;
  plazo_meses: number;
  estado: string;
  proaprobado: string;
  analista: string;
  revisado: string;
  entrega_autorizada: string;
  entregado: string;
  cambio_ci: string;
  fecha_creacion: string;
  actualizado: string;
  deudor_id: number | null;
  codeudor_id: number | null;
  cotizacion_id: number | null;
  comentario: string | null;
  cuota_inicial: number | null;
  firmas: string[];    // rutas de firmas
  soportes: string[];  // rutas de soportes
}

export interface CreditoDetalleResponse {
  success: boolean;
  creditos: any[];
}

const parseArchivos = (input?: string): string[] => {
  if (!input) return [];
  try {
    // El backend puede devolver string JSON o csv
    if (input.startsWith("[")) {
      return JSON.parse(input).map((s: string) => s.replace(/\\/g, ""));
    }
    return input.split(",").map((s) => s.trim().replace(/\\/g, ""));
  } catch {
    return [];
  }
};

export const useCreditoConDocumentos = (codigo_credito: string) => {
  return useQuery<CreditoDetalle, AxiosError>({
    queryKey: ["credito_detalle", codigo_credito],
    queryFn: async () => {
      const { data } = await api.get<CreditoDetalleResponse>(
        "/list_creditos.php",
        { params: { codigo_credito } }
      );

      const raw = data.creditos?.[0];
      return {
        id: raw.id,
        asesor: raw.asesor,
        codigo_credito: raw.codigo_credito,
        nombre_cliente: raw.nombre_cliente,
        producto: raw.producto,
        valor_producto: raw.valor_producto,
        plazo_meses: raw.plazo_meses,
        estado: raw.estado,
        proaprobado: raw.proaprobado,
        analista: raw.analista,
        revisado: raw.revisado,
        entrega_autorizada: raw.entrega_autorizada,
        entregado: raw.entregado,
        cambio_ci: raw.cambio_ci,
        fecha_creacion: raw.fecha_creacion,
        actualizado: raw.actualizado,
        deudor_id: raw.deudor_id,
        codeudor_id: raw.codeudor_id,
        cotizacion_id: raw.cotizacion_id,
        comentario: raw.comentario,
        cuota_inicial: raw.cuota_inicial,
        firmas: parseArchivos(raw.firmas),
        soportes: parseArchivos(raw.soportes),
      };
    },
    enabled: !!codigo_credito,
  });
};