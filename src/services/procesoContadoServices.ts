import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";

type ServerError = { error?: string; details?: string; fields?: string[] };

/* ============================================================
   🔹 Hook para registrar / actualizar proceso contado
   ============================================================ */
export const useRegistrarProcesoContado = () => {
  return useMutation({
    mutationFn: async (payload: FormData | Record<string, any>) => {
      const isFD = typeof FormData !== "undefined" && payload instanceof FormData;
      const config = isFD
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : { headers: { "Content-Type": "application/json" } };

      const { data } = await api.post(
        "/proceso_contado_upsert.php",
        isFD ? payload : JSON.stringify(payload),
        config
      );
      return data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Proceso guardado",
        text: "Se creó/actualizó correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const e = error.response?.data;
      const msg =
        (Array.isArray(e?.fields) && e?.fields.length > 0)
          ? `Faltan: ${e?.fields.join(", ")}`
          : e?.error || "Error al registrar el proceso";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    },
  });
};

/* ============================================================
   🔹 Hook para obtener datos por código desde solicitar_estado_facturacion
   ============================================================ */
type FacturacionData = {
  idPrimaria: number;
  codigo: string;
  cotizacion_id: number;
  nombre_cliente: string;
  numero_documento: string;
  fecha_nacimiento: string;
  ciudad_residencia: string;
  direccion_residencia: string;
  telefono?: string;
  email?: string;
  motocicleta?: string;
  modelo?: string;
  numero_motor?: string;
  numero_chasis?: string;
  color?: string;
  placa?: string;
  cn_valor_moto?: string;
  cn_valor_bruto?: string;
  cn_iva?: string;
  cn_total?: string;
  acc_valor_bruto?: string;
  acc_iva?: string;
  acc_total?: string;
  tot_valor_moto?: string;
  tot_soat?: string;
  tot_matricula?: string;
  tot_impuestos?: string;
  tot_seguros_accesorios?: string;
  tot_general?: string;
  observaciones?: string;
  creado_en?: string;
  actualizado_en?: string;
};

export const useGetFacturacionPorCodigo = (codigo?: string) => {
  const query = useQuery<FacturacionData, AxiosError<ServerError>>({
    queryKey: ["facturacion", codigo],
    enabled: !!codigo,
    queryFn: async () => {
      const { data } = await api.get(
        `/solicitar_facturacion_get.php?codigo=${encodeURIComponent(codigo!)}`
      );
      if (!data?.success) {
        throw new Error(data?.error || "No se encontró el registro");
      }
      return data.data as FacturacionData;
    },
  });

  // ⚠️ Manejo del error con efecto lateral (fuera de config)
  if (query.error) {
    const err = query.error as AxiosError<ServerError>;
    const msg =
      err.response?.data?.error ||
      err.message ||
      "No se pudo obtener la información.";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }

  return query;
};
