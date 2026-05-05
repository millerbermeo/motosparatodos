// src/services/solicitudesService.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

/* ===== Tipos raw del backend ===== */
export interface SolicitudFacturacionApi {
  id: string | number;
  agencia: string;
  distribuidora?: string | null;
  distribuidora_id?: string | null;
  codigo_solicitud: string;
  codigo_credito?: string | null;
  nombre_cliente: string;
  cedula?: string | null;
  tipo_solicitud: string;
  numero_recibo?: string | null;
  resibo_pago?: string | null;
  manifiesto?: string | null;
  observaciones?: string | null;
  facturador?: string | null;
  autorizado: string | number | boolean;
  facturado: string | number | boolean;
  entrega_autorizada: string | number | boolean;
  fecha_creacion: string;
  actualizado: string;
  id_cotizacion?: number | string | null;
  factura?: string | null;
  observacion2?: string | null;

  // datos del JOIN con cotizaciones
  cotizacion_id?: number | string | null;
  cotizacion_codigo?: string | null;
  cotizacion_nombre?: string | null;
  cotizacion_s_name?: string | null;
  cotizacion_last_name?: string | null;
  cotizacion_s_last_name?: string | null;
  cotizacion_cedula?: string | null;
  cotizacion_email?: string | null;
  cotizacion_celular?: string | null;
  cotizacion_estado?: string | null;
  cotizacion_fecha_creacion?: string | null;

  marca_a?: string | null;
  modelo_a?: string | null;
  linea_a?: string | null;
  precio_total_a?: string | number | null;
  marca_b?: string | null;
  modelo_b?: string | null;
  linea_b?: string | null;
  precio_total_b?: string | number | null;
}

/* ===== Tipos normalizados ===== */
export interface SolicitudFacturacion {
  id: number;
  agencia: string;
  distribuidora?: string | null;
  distribuidoraId?: string | null;
  codigo: string;
  codigoCredito?: string | null;
  cliente: string;
  cedulaPath?: string | null;
  tipo: string;
  numeroRecibo?: string | null;
  resiboPago?: string | null;
  manifiestoPath?: string | null;
  observaciones?: string | null;
  facturador?: string | null;
  autorizado: boolean;
  facturado: boolean;
  entregaAutorizada: boolean;
  fechaCreacion: string;
  actualizado: string;
  id_cotizacion?: number | null;
  facturaPath?: string | null;
  observacion2?: string | null;

  // datos cotización
  cotizacionId?: number | null;
  cotizacionCodigo?: string | null;
  cotizacionNombreCompleto?: string | null;
  cotizacionCedula?: string | null;
  cotizacionEmail?: string | null;
  cotizacionCelular?: string | null;
  cotizacionEstado?: string | null;
  cotizacionFechaCreacion?: string | null;

  marcaA?: string | null;
  modeloA?: string | null;
  lineaA?: string | null;
  precioTotalA?: number | null;
  marcaB?: string | null;
  modeloB?: string | null;
  lineaB?: string | null;
  precioTotalB?: number | null;
}

const siNoToBool = (v?: string | number | boolean | null) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "si" || t === "sí" || t === "1" || t === "true";
  }
  return false;
};

const toNumOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const buildCotizacionNombre = (r: SolicitudFacturacionApi) =>
  [
    r.cotizacion_nombre,
    r.cotizacion_s_name,
    r.cotizacion_last_name,
    r.cotizacion_s_last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim() || null;

export const normalizeSolicitud = (r: SolicitudFacturacionApi): SolicitudFacturacion => ({
  id: Number(r.id),
  agencia: r.agencia,
  distribuidora: r.distribuidora ?? null,
  distribuidoraId: r.distribuidora_id ?? null,
  codigo: r.codigo_solicitud,
  codigoCredito: r.codigo_credito ?? null,
  cliente: r.nombre_cliente,
  cedulaPath: r.cedula ?? null,
  tipo: r.tipo_solicitud,
  numeroRecibo: r.numero_recibo ?? null,
  resiboPago: r.resibo_pago ?? null,
  manifiestoPath: r.manifiesto ?? null,
  observaciones: r.observaciones ?? null,
  facturador: r.facturador ?? null,
  autorizado: siNoToBool(r.autorizado),
  facturado: siNoToBool(r.facturado),
  entregaAutorizada: siNoToBool(r.entrega_autorizada),
  fechaCreacion: r.fecha_creacion,
  actualizado: r.actualizado,
  id_cotizacion: toNumOrNull(r.id_cotizacion),
  facturaPath: r.factura ?? null,
  observacion2: r.observacion2 ?? null,

  cotizacionId: toNumOrNull(r.cotizacion_id),
  cotizacionCodigo: r.cotizacion_codigo ?? null,
  cotizacionNombreCompleto: buildCotizacionNombre(r),
  cotizacionCedula: r.cotizacion_cedula ?? null,
  cotizacionEmail: r.cotizacion_email ?? null,
  cotizacionCelular: r.cotizacion_celular ?? null,
  cotizacionEstado: r.cotizacion_estado ?? null,
  cotizacionFechaCreacion: r.cotizacion_fecha_creacion ?? null,

  marcaA: r.marca_a ?? null,
  modeloA: r.modelo_a ?? null,
  lineaA: r.linea_a ?? null,
  precioTotalA: toNumOrNull(r.precio_total_a),
  marcaB: r.marca_b ?? null,
  modeloB: r.modelo_b ?? null,
  lineaB: r.linea_b ?? null,
  precioTotalB: toNumOrNull(r.precio_total_b),
});

export interface SolicitudesPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface ListSolicitudesResponse {
  success: boolean;
  data: SolicitudFacturacionApi[];
  pagination?: SolicitudesPagination;
  filters?: {
    search?: string | null;
    tipo_solicitud?: string | null;
    fecha_desde?: string | null;
    fecha_hasta?: string | null;
    estado?: string | null;
    id_cotizacion?: number | null;
  };
}

export interface SolicitudesListResult {
  success: boolean;
  data: SolicitudFacturacion[];
  pagination: SolicitudesPagination;
  filters?: ListSolicitudesResponse["filters"];
}

export type SolicitudesFilters = {
  search?: string;
  tipo_solicitud?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  id_cotizacion?: number | null;
};

export const useSolicitudesFacturacion = (
  page: number = 1,
  perPage: number = 10,
  filters?: SolicitudesFilters,
  opts?: { token?: string }
) => {
  return useQuery<SolicitudesListResult>({
    queryKey: ["solicitudes-facturacion", { page, perPage, ...filters }],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
      };

      if (filters?.search?.trim()) params.search = filters.search.trim();
      if (filters?.tipo_solicitud?.trim()) params.tipo_solicitud = filters.tipo_solicitud.trim();
      if (filters?.fecha_desde?.trim()) params.fecha_desde = filters.fecha_desde.trim();
      if (filters?.fecha_hasta?.trim()) params.fecha_hasta = filters.fecha_hasta.trim();
      if (filters?.estado?.trim()) params.estado = filters.estado.trim();
      if (filters?.id_cotizacion !== null && filters?.id_cotizacion !== undefined) {
        params.id_cotizacion = filters.id_cotizacion;
      }

      const { data } = await api.get<ListSolicitudesResponse>("/list_solicitudes.php", {
        params,
        headers: opts?.token ? { Authorization: `Bearer ${opts.token}` } : undefined,
      });

      return {
        success: data.success,
        data: (data.data ?? []).map(normalizeSolicitud),
        pagination: data.pagination ?? {
          total: 0,
          per_page: perPage,
          current_page: page,
          last_page: 1,
        },
        filters: data.filters,
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};


/* ======================================================================================
   NUEVO: Registrar Solicitud de Facturación
   - Recibe directamente un FormData (tal como lo armas en la vista)
   - Envía multipart/form-data
   - Invalida listados y, si se puede, el crédito relacionado
   - Muestra SweetAlert de éxito / error
   ====================================================================================== */

export interface RegistrarSolicitudResponse {
  success: boolean;
  id?: string | number;                 // id de la solicitud creada (si lo devuelve el backend)
  codigo_solicitud?: string;            // opcional
  message?: string | string[];          // mensaje de backend
}

export interface ServerError {
  message: string | string[];
}

/** 
 * Hook para registrar la solicitud de facturación.
 * 
 * Uso:
 *   const { mutate: registrar, isPending } = useRegistrarSolicitudFacturacion();
 *   registrar(formData);
 */


export const useRegistrarSolicitudFacturacion = (
  opts?: {
    /** Permitir sobreescribir el endpoint si lo necesitas */
    endpoint?: string; // por defecto "/registrar_solicitud_facturacion.php"
  }
) => {
  const qc = useQueryClient();

  return useMutation<RegistrarSolicitudResponse, AxiosError<ServerError>, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.post<RegistrarSolicitudResponse>(
        opts?.endpoint ?? "/create_solicitud.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: async (resp, formData) => {
      // Intentamos obtener el código de crédito desde el formdata para invalidar caches asociadas
      const cc = formData.get("codigo_credito")?.toString();

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] }),
        cc ? qc.invalidateQueries({ queryKey: ["credito", cc] }) : Promise.resolve(),
        cc ? qc.invalidateQueries({ queryKey: ["credito_detalle", cc] }) : Promise.resolve(),
      ]);

      const texto =
        Array.isArray(resp.message) ? resp.message.join("\n") :
        resp.message ?? "Solicitud de facturación registrada correctamente";

      Swal.fire({
        icon: "success",
        title: "Solicitud registrada",
        text: texto,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "No se pudo registrar la solicitud";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};


export const useRegistrarSolicitudFacturacion2 = (opts?: { endpoint?: string }) => {
  const qc = useQueryClient();

  return useMutation<RegistrarSolicitudResponse, AxiosError<ServerError>, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.post<RegistrarSolicitudResponse>(
        opts?.endpoint ?? "/crear_solicitud_facturacion.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: async (resp /*, formData */) => {
      // ✅ Sin uso de codigo_credito
      await qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] });

      const texto =
        Array.isArray(resp?.message) ? resp.message.join("\n") :
        resp?.message ?? "Solicitud de facturación registrada correctamente";

      Swal.fire({
        icon: "success",
        title: "Solicitud registrada",
        text: texto,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
           const raw = error.response?.data?.message ?? "No se pudo registrar la solicitud";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export const useSolicitudesPorCodigoCredito = (codigoCredito: string | number) => {
  return useQuery<SolicitudFacturacion[], AxiosError>({
    queryKey: ["solicitudes-facturacion", "por-credito", codigoCredito],
    enabled: !!codigoCredito,
    queryFn: async () => {
      const { data } = await api.get<ListSolicitudesResponse>(
        "/list_solicitudes.php",
        { params: { id: codigoCredito } } // ← el back espera 'id' como codigo_credito
      );

      const rawData = data?.data;
      const raw: SolicitudFacturacionApi[] = Array.isArray(rawData)
        ? rawData
        : rawData && typeof rawData === 'object'
        ? [rawData as SolicitudFacturacionApi]
        : [];
      return raw.map(normalizeSolicitud);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};



export interface UltimaSolicitudYCotizacionApiResponse {
  success: boolean;
  solicitud_facturacion?: SolicitudFacturacionApi;
  cotizacion?: Record<string, any>; // tabla cotizaciones (todas las columnas)
  error?: string;
}

/** Resultado normalizado del hook */
export interface UltimaSolicitudYCotizacion {
  solicitud: SolicitudFacturacion | null;
  cotizacion: Record<string, any> | null;
}

export const useUltimaSolicitudYCotizacion = (
  idCotizacion?: string | number,
  opts?: {
    /** Endpoint combinado del back */
    endpoint?: string; // por defecto "/get_ultima_solicitud_y_cotizacion.php"
    /** Inyectar token manual si no usas interceptor */
    token?: string;
    /** Habilitar/deshabilitar manualmente */
    enabled?: boolean;
  }
) => {
  return useQuery<UltimaSolicitudYCotizacion, AxiosError>({
    queryKey: ["solicitud-facturacion", "ultima+cotizacion", idCotizacion],
    enabled: (opts?.enabled ?? true) && !!idCotizacion,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<UltimaSolicitudYCotizacionApiResponse>(
          opts?.endpoint ?? "/list_solicitud_id.php",
          {
            params: { id_cotizacion: idCotizacion },
            headers: opts?.token
              ? { Authorization: `Bearer ${opts.token}` }
              : undefined,
          }
        );

        if (!data?.success) {
          // Sin datos o error de negocio
          return { solicitud: null, cotizacion: null };
        }

        const solicitud = data.solicitud_facturacion
          ? normalizeSolicitud(data.solicitud_facturacion)
          : null;

        const cotizacion = data.cotizacion ?? null;

        return { solicitud, cotizacion };
      } catch (err) {
        const e = err as AxiosError;
        // 404 => sin registros para esa cotización
        if (e.response?.status === 404) {
          return { solicitud: null, cotizacion: null };
        }
        throw e;
      }
    },
  });
};


// Debajo de tus otros tipos
export interface RegistrarActaResponse {
  success: boolean;
  id_acta?: number | string;
  message?: string | string[];
  estado?: string;
  id_factura?: number | string;
}

// ...

export const useRegistrarActaEntrega = (opts?: {
  endpoint?: string; // por defecto nuestro endpoint de acta
}) => {
  const qc = useQueryClient();

  return useMutation<RegistrarActaResponse, AxiosError<ServerError>, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.post<RegistrarActaResponse>(
        opts?.endpoint ?? "/actualizar_estado_por_cotizacion.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: async (resp) => {
      // invalidamos listados relacionados
      await qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] });

      const texto =
        Array.isArray(resp?.message)
          ? resp!.message!.join("\n")
          : resp?.message ?? "Acta registrada correctamente";

      Swal.fire({
        icon: "success",
        title: "Acta registrada",
        text: texto,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw =
        error.response?.data?.message ??
        "No se pudo registrar el acta de entrega";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};


// Hook sencillo: trae la ÚLTIMA solicitud por id_cotizacion, tipado como `any`
export const useUltimaSolicitudPorIdCotizacion = (
  idCotizacion?: string | number,
  opts?: {
    endpoint?: string; // por defecto "/obtener_solicitud_por_id_cotizacion.php"
    token?: string;
    enabled?: boolean;
  }
) => {
  return useQuery<any, AxiosError>({
    queryKey: ["solicitud-facturacion", "ultima-por-id-cotizacion", idCotizacion],
    enabled: (opts?.enabled ?? true) && !!idCotizacion,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<any>(
          opts?.endpoint ?? "/obtener_solicitud_por_id_cotizacion.php",
          {
            params: { id_cotizacion: idCotizacion },
            headers: opts?.token
              ? { Authorization: `Bearer ${opts.token}` }
              : undefined,
          }
        );

        // aquí simplemente devolvemos tal cual lo que mande el backend
        return data;
      } catch (err) {
        const e = err as AxiosError;
        // Si el back devuelve 404 cuando no hay registros, retornamos null en vez de romper
        if (e.response?.status === 404) {
          return null;
        }
        throw e;
      }
    },
  });
};


// ========================= ACTUALIZAR FACTURA DE SOLICITUD =========================

export interface ActualizarFacturaResponse {
  success: boolean;
  id?: number | string;
  factura_path?: string;
  message?: string | string[];
}

export const useActualizarFacturaSolicitud = (opts?: {
  endpoint?: string; // por defecto "/actualizar_factura_solicitud.php"
}) => {
  const qc = useQueryClient();

  return useMutation<
    ActualizarFacturaResponse,
    AxiosError<ServerError>,
    FormData
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post<ActualizarFacturaResponse>(
        opts?.endpoint ?? "/actualizar_factura_solicitud.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: async (resp, formData) => {
      // Podemos intentar sacar el id o id_cotizacion del formData
      // const id = formData.get("id")?.toString();
      const idCot = formData.get("id_cotizacion")?.toString();

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] }),
        idCot
          ? qc.invalidateQueries({
              queryKey: ["solicitud-facturacion", "ultima-por-id-cotizacion", idCot],
            })
          : Promise.resolve(),
      ]);

      const texto =
        Array.isArray(resp?.message)
          ? resp.message.join("\n")
          : resp?.message ?? "Factura actualizada correctamente";

      Swal.fire({
        icon: "success",
        title: "Factura actualizada",
        text: texto,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw =
        error.response?.data?.message ??
        "No se pudo actualizar la factura de la solicitud";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};




// ========================= DESCUENTOS / SALDO CONTRAENTREGA =========================

// Lo que devuelve el PHP de descuentos_contraentrega.php (GET)
export interface DescuentosContraentregaApi {
  id: number | string;
  descuento_solicitado_a: string | number | null;
  saldo_contraentrega_a: string | number | null;
  descuento_autorizado_b: string | number | null;
  saldo_contraentrega_b: string | number | null;
  observacion2?: string | null;
  is_final: string | number | null;
}

// Estructura normalizada para tu app
export interface DescuentosContraentrega {
  id: number;
  descuentoSolicitadoA: number | null;
  saldoContraentregaA: number | null;
  descuentoAutorizadoB: number | null;
  saldoContraentregaB: number | null;
  observacion2: string | null;
  isFinal: boolean; // true si 1, false si 0
}

interface DescuentosContraentregaResponse {
  success: boolean;
  data?: DescuentosContraentregaApi;
  error?: string;
}

/** Normaliza lo que viene del back a números / boolean */
const normalizeDescuentos = (
  api: DescuentosContraentregaApi
): DescuentosContraentrega => {
  const toNumOrNull = (v: any): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const toBoolFinal = (v: any): boolean => {
    if (v === null || v === undefined || v === "") return false;
    const n = Number(v);
    return n === 1;
  };

  return {
    id: Number(api.id),
    descuentoSolicitadoA: toNumOrNull(api.descuento_solicitado_a),
    saldoContraentregaA: toNumOrNull(api.saldo_contraentrega_a),
    descuentoAutorizadoB: toNumOrNull(api.descuento_autorizado_b),
    saldoContraentregaB: toNumOrNull(api.saldo_contraentrega_b),
    observacion2: api.observacion2 ?? null,
    isFinal: toBoolFinal(api.is_final),
  };
};

/**
 * Hook GET:
 *   GET /descuentos_contraentrega.php?id=ID
 *
 * Uso:
 *   const { data, isLoading } = useDescuentosContraentrega(idSolicitud);
 */
export const useDescuentosContraentrega = (
  id?: number | string,
  opts?: {
    endpoint?: string; // por defecto "/descuentos_contraentrega.php"
    enabled?: boolean;
  }
) => {
  return useQuery<DescuentosContraentrega | null, AxiosError>({
    queryKey: ["descuentos-contraentrega", id],
    enabled: (opts?.enabled ?? true) && !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<DescuentosContraentregaResponse>(
          opts?.endpoint ?? "/descuentos_contraentrega.php",
          { params: { id } }
        );

        if (!data?.success || !data.data) {
          return null;
        }

        return normalizeDescuentos(data.data);
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) {
          // No hay registro con ese ID
          return null;
        }
        throw e;
      }
    },
  });
};

// ------------------------- MUTATION: ACTUALIZAR B + observacion2 + is_final -------------------------

export interface ActualizarDescuentosContraentregaPayload {
  id: number | string;               // id (PRIMARY KEY) de solicitudes_facturacion
  descuento_autorizado_b: number;    // valor autorizado
  saldo_contraentrega_b: number;     // saldo B
  observacion2?: string | null;      // texto libre (puede ser null o vacío)
  is_final?: number | boolean;       // 1 / 0 o true / false
}

export interface ActualizarDescuentosContraentregaResponse {
  success: boolean;
  message?: string | string[];
  updated_id?: number | string;
  affected_rows?: number;
}

/**
 * Hook POST:
 *   POST /descuentos_contraentrega.php
 *   Campos: id, descuento_autorizado_b, saldo_contraentrega_b, observacion2, is_final
 *
 * Uso:
 *   const { mutate: actualizarDescuentos, isPending } = useActualizarDescuentosContraentrega();
 *   actualizarDescuentos({
 *     id: 123,
 *     descuento_autorizado_b: 100000,
 *     saldo_contraentrega_b: 50000,
 *     observacion2: "Obs. del área de cartera",
 *     is_final: 1,
 *   });
 */
export const useActualizarDescuentosContraentrega = (opts?: {
  endpoint?: string; // por defecto "/descuentos_contraentrega.php"
}) => {
  const qc = useQueryClient();

  return useMutation<
    ActualizarDescuentosContraentregaResponse,
    AxiosError<ServerError>,
    ActualizarDescuentosContraentregaPayload
  >({
    mutationFn: async (payload) => {
      const fd = new FormData();
      fd.append("id", String(payload.id));
      fd.append(
        "descuento_autorizado_b",
        String(payload.descuento_autorizado_b)
      );
      fd.append(
        "saldo_contraentrega_b",
        String(payload.saldo_contraentrega_b)
      );

      // observacion2 opcional; si viene null/undefined, mandamos cadena vacía
      if (payload.observacion2 !== undefined && payload.observacion2 !== null) {
        fd.append("observacion2", payload.observacion2);
      } else {
        fd.append("observacion2", "");
      }

      const isFinalValue =
        payload.is_final === true || payload.is_final === 1 ? "1" : "0";
      fd.append("is_final", isFinalValue);

      const { data } =
        await api.post<ActualizarDescuentosContraentregaResponse>(
          opts?.endpoint ?? "/descuentos_contraentrega.php",
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

      return data;
    },
    onSuccess: async (resp, payload) => {
      await Promise.all([
        // refrescar listados de solicitudes
        qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] }),
        // refrescar el descuento de este id puntual
        qc.invalidateQueries({
          queryKey: ["descuentos-contraentrega", payload.id],
        }),
      ]);

      const texto = Array.isArray(resp?.message)
        ? resp.message.join("\n")
        : resp?.message ?? "Descuentos / saldo y observación actualizados correctamente";

      Swal.fire({
        icon: "success",
        title: "Actualización exitosa",
        text: texto,
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw =
        error.response?.data?.message ??
        "No se pudieron actualizar los descuentos / saldo / observación";
      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({
        icon: "error",
        title: "Error",
        html: arr.join("<br/>"),
      });
    },
  });
};





export interface GetSolicitudPorCotizacionResponse {
  success: boolean;
  data?: SolicitudFacturacionApi;
  error?: string;
}

export const useSolicitudFacturacionPorIdCotizacion = (
  idCotizacion?: string | number,
  opts?: {
    endpoint?: string; // por defecto el PHP nuevo
    token?: string;    // si no usas interceptor
    enabled?: boolean;
  }
) => {
  return useQuery<SolicitudFacturacion | null, AxiosError>({
    queryKey: ["solicitud-facturacion", "por-id-cotizacion", idCotizacion],
    enabled: (opts?.enabled ?? true) && !!idCotizacion,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<GetSolicitudPorCotizacionResponse>(
          opts?.endpoint ?? "/solicitar_estado_facturacion.php",
          {
            params: { id_cotizacion: idCotizacion },
            headers: opts?.token
              ? { Authorization: `Bearer ${opts.token}` }
              : undefined,
          }
        );

        if (!data?.success || !data.data) return null;

        return normalizeSolicitud(data.data);
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) return null;
        throw e;
      }
    },
  });
};

export interface SubirManifiestoResponse {
  success: boolean;
  message?: string;
  error?: string;
  manifiesto_nuevo?: string; // opcional si tu backend lo devuelve
}
export const useSubirManifiestoSolicitud = (opts?: { endpoint?: string }) => {
  const qc = useQueryClient();

  return useMutation<SubirManifiestoResponse, AxiosError<ServerError>, FormData>({
    mutationFn: async (fd) => {
      const { data } = await api.post<SubirManifiestoResponse>(
        opts?.endpoint ?? "/actualizar_manifiesto.php", // o actualizar_manifiesto.php
        fd,
        {
          // ✅ IGUAL QUE TU FORM
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },

    onSuccess: async (resp, fd) => {
      const idCot = fd.get("id_cotizacion")?.toString();

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] }),
        idCot
          ? qc.invalidateQueries({
              queryKey: ["solicitud-facturacion", "ultima-por-id-cotizacion", idCot],
            })
          : Promise.resolve(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Manifiesto cargado",
        text: resp?.message ?? "El manifiesto se cargó correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    },

    onError: (error) => {
      const raw =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        "No se pudo subir el manifiesto";
      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

export interface SubirCedulaResponse {
  success: boolean;
  message?: string;
  error?: string;
  cedula_nueva?: string;
}

export const useSubirCedulaSolicitud = (opts?: { endpoint?: string }) => {
  const qc = useQueryClient();

  return useMutation<SubirCedulaResponse, AxiosError<ServerError>, FormData>({
    mutationFn: async (fd) => {
      const { data } = await api.post<SubirCedulaResponse>(
        opts?.endpoint ?? "/actualizar_cedula.php",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },

    onSuccess: async (resp, fd) => {
      const idCot = fd.get("id_cotizacion")?.toString();

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["solicitudes-facturacion"] }),
        idCot
          ? qc.invalidateQueries({
              queryKey: ["solicitud-facturacion", "ultima-por-id-cotizacion", idCot],
            })
          : Promise.resolve(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Cédula cargada",
        text: resp?.message ?? "La cédula se cargó correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    },

    onError: (error) => {
      const raw =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        "No se pudo subir la cédula";
      const arr = Array.isArray(raw) ? raw : [raw];

      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};
