// src/services/solicitudesService.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./axiosInstance";

/* ===== Tipos que devuelve la API (raw) ===== */
export interface SolicitudFacturacionApi {
  id: string;                 // "4"
  agencia: string;            // "NORTE"
  codigo_solicitud: string;   // "4003"
  nombre_cliente: string;     // "SOFIA CAMILA VARGAS"
  tipo_solicitud: string;     // "Contado" | "Crédito directo" | ...
  numero_recibo: string;      // "00456" | "N/A"
  facturador: string;         // "Carlos Ramírez" | "Sin facturador"
  autorizado: string;         // "Si" | "No"
  facturado: string;          // "Si" | "No"
  entrega_autorizada: string; // "Si" | "No"
  fecha_creacion: string;     // "2025-08-19 05:10:50"
  actualizado: string;        // "2025-08-19 05:10:50"
}

/* ===== Tipos normalizados para tu app ===== */
export interface SolicitudFacturacion {
  id: number;
  agencia: string;
  codigo: string;
  cliente: string;
  tipo: string;
  numeroRecibo?: string | null;
  facturador?: string | null;
  autorizado: boolean;
  facturado: boolean;
  entregaAutorizada: boolean;
  fechaCreacion: string; // o Date si prefieres parsear
  actualizado: string;   // idem
}

/* ===== Respuesta del endpoint ===== */
interface ListSolicitudesResponse {
  success: boolean;
  solicitudes_facturacion: SolicitudFacturacionApi[];
}

/* ===== Utils ===== */
const siNoToBool = (v?: string) =>
  typeof v === "string" ? v.trim().toLowerCase().startsWith("s") : false;

const normalizeSolicitud = (r: SolicitudFacturacionApi): SolicitudFacturacion => ({
  id: Number(r.id),
  agencia: r.agencia,
  codigo: r.codigo_solicitud,
  cliente: r.nombre_cliente,
  tipo: r.tipo_solicitud,
  numeroRecibo: r.numero_recibo === "N/A" ? null : r.numero_recibo,
  facturador: r.facturador === "Sin facturador" ? null : r.facturador,
  autorizado: siNoToBool(r.autorizado),
  facturado: siNoToBool(r.facturado),
  entregaAutorizada: siNoToBool(r.entrega_autorizada),
  fechaCreacion: r.fecha_creacion,
  actualizado: r.actualizado,
});

/* ===== Parámetros de búsqueda/filtrado (opcionales) ===== */
export type SolicitudesFilters = {
  agencia?: string;
  tipo?: string;               // "Contado" | "Crédito directo" | ...
  autorizado?: boolean;
  facturado?: boolean;
  q?: string;                  // búsqueda libre (si tu backend la soporta)
};

/* ===== Hook principal ===== */
export const useSolicitudesFacturacion = (
  filters?: SolicitudesFilters,
  opts?: { token?: string }    // por si quieres inyectar el Bearer manualmente
) => {
  return useQuery<SolicitudFacturacion[]>({
    queryKey: ["solicitudes-facturacion", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (filters?.agencia) params.agencia = filters.agencia;
      if (filters?.tipo) params.tipo_solicitud = filters.tipo;
      if (filters?.autorizado !== undefined)
        params.autorizado = filters.autorizado ? "Si" : "No";
      if (filters?.facturado !== undefined)
        params.facturado = filters.facturado ? "Si" : "No";
      if (filters?.q) params.q = filters.q;

      const { data } = await api.get<ListSolicitudesResponse>(
        "/list_solicitudes.php",
        {
          params,
          headers: opts?.token
            ? { Authorization: `Bearer ${opts.token}` }
            : undefined, // si tu api ya agrega el token por interceptor, omite esto
        }
      );

      // Manejo básico de éxito/fracaso
      const raw = data?.solicitudes_facturacion ?? [];
      return raw.map(normalizeSolicitud);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
