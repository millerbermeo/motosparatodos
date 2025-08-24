// src/services/creditoServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/auth.store";

/* ===== TIPOS ===== */
export interface InformacionLaboral {
  empresa: string;
  direccion_empleador: string;
  telefono_empleador: string;
  cargo: string;
  tipo_contrato: string;       // p.ej. "Indefinido" | "Fijo" | "Prestación de servicios"
  salario: number;
  tiempo_servicio: string;     // p.ej. "2 años", "8 meses"
}

export interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  tipo: string;                // p.ej. "Motocicleta" | "Automóvil"
  numero_motor: string;
}

export interface Referencia {
  nombre_completo: string;
  tipo_referencia: string;     // p.ej. "Familiar" | "Personal" | "Laboral"
  direccion: string;
  telefono: string;
}

export interface RegistroDeudorPayload {
  codigo_credito: number;
  numero_documento: string;
  tipo_documento: string;
  fecha_expedicion: string;    // "YYYY-MM-DD"
  lugar_expedicion: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  fecha_nacimiento: string;    // "YYYY-MM-DD"
  nivel_estudios: string;
  ciudad_residencia: string;
  barrio_residencia: string;
  direccion_residencia: string;
  telefono_fijo?: string | null;
  celular: string;
  email: string;
  estado_civil: string;
  personas_a_cargo: number;
  tipo_vivienda: string;       // "Propia" | "Arriendo" | etc.
  costo_arriendo: number;
  finca_raiz: "Sí" | "No" | string;
  informacion_laboral: InformacionLaboral;
  vehiculo: Vehiculo;
  referencias: Referencia[];
}

export interface ServerError {
  message: string | string[];
}

/* ===== MUTATION: Registrar Deudor (Paso 1 Crédito) ===== */
export const useRegistrarDeudor = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      // Ajusta la ruta si tu backend usa otro nombre
      const { data } = await api.post("/deudores.php", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (_data, variables) => {
      // Invalida lo que tenga sentido para tu UI
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["deudor", variables.codigo_credito] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),
      ]);

      Swal.fire({
        icon: "success",
        title: "Registro enviado",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al registrar deudor";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};



export const useDeudor = (id: string) => {
  return useQuery<any>({
    queryKey: ["deudor", id],
    queryFn: async () => {
      const { data } = await api.get<any>(
        "/deudores_id.php", // endpoint correcto
        {
          params: { codigo_credito: id }, // pasa el id en query string

        }
      );
      return data;
    },
  });
};




/* ===== TIPOS de respuesta del servidor (opcional) ===== */
type ServerOk = { success?: boolean; message?: string };

/* ===== MUTATION: Actualizar Deudor (Paso 1 Crédito) ===== */
type ActualizarDeudorInput = {
  id: number;                         // id del deudor a actualizar (ej. 6)
  payload: any;     // mismo payload que usas para registrar
};

export const useActualizarDeudor = () => {
  const qc = useQueryClient();

  return useMutation<ServerOk, AxiosError<ServerError>, ActualizarDeudorInput>({
    mutationFn: async ({ id, payload }) => {
      // Igual que registrar, solo cambia a PUT y la ruta/params:
      const { data } = await api.put<ServerOk>("/deudor_actualizar.php", payload, {
        params: { codigo_credito: id }, // ← tal como en tu Postman
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (resp, variables) => {
      // refresca el deudor y cualquier lista relacionada
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["deudor", variables.id] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),
      ]);

      await qc.refetchQueries({ queryKey: ["deudor", variables.id] });


      Swal.fire({
        icon: "success",
        title: resp?.message || "Deudor actualizado exitosamente",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "Error al actualizar deudor";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};



export const useRegistrarCodeudor = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<any>("/codeudores.php", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (_data, variables) => {
      // intenta leer deudor_id del payload para invalidar lo relacionado
      const deudorId =
        (variables as any)?.deudor_id ??
        (variables as any)?.informacion_personal?.deudor_id ??
        null;

      await Promise.all([
        deudorId ? qc.invalidateQueries({ queryKey: ["deudor", deudorId] }) : Promise.resolve(),
        qc.invalidateQueries({ queryKey: ["codeudores"] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),
      ]);

      Swal.fire({
        icon: "success",
        title: "Codeudor registrado",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error: AxiosError<ServerError>) => {
      const raw = error.response?.data?.message ?? "Error al registrar codeudor";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};

/* -------------------------------------------
   Obtener Codeudor por ID (si necesitas ver/editar uno)
   GET /codeudores_id.php?id={id}
-------------------------------------------- */
export const useCodeudoresByDeudor = (id: string) => {
  return useQuery<any>({
    queryKey: ["codeudor", id],
    queryFn: async () => {
      const { data } = await api.get<any>("/list_codeudores.php", {
        params: { codigo_credito: id },
      });
      return data;
    },
    enabled: !!id,
  });
};

/* -------------------------------------------
   Actualizar Codeudor
   PUT /codeudor_actualizar.php?id={id}
   body: any (mismo shape que registrar)
-------------------------------------------- */
// types sugeridos
type ActualizarCodeudorInput = {
  id: number | string;            // id del codeudor (query param)
  codigo_credito: string;         // código del crédito (query param)
  payload: any;                   // body con la data
};

export const useActualizarCodeudor = () => {
  const qc = useQueryClient();

  return useMutation<ServerOk, AxiosError<ServerError>, ActualizarCodeudorInput>({
    mutationFn: async ({ id, codigo_credito, payload }) => {
      const { data } = await api.put<ServerOk>(
        "/codeudor_actualizar.php",
        payload,                                // body JSON
        {
          params: { codigo_credito, id },       // ⬅️ enviar ambos params
          headers: { "Content-Type": "application/json" },
        }
      );
      return data;
    },
    onSuccess: async (resp, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["codeudor", variables.id] }),
        qc.invalidateQueries({ queryKey: ["codeudores"] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),
      ]);
      Swal.fire({ icon: "success", title: resp?.message || "Codeudor actualizado", timer: 1600, showConfirmButton: false });
    },
    onError: (error) => {
      const raw = (error as AxiosError<ServerError>)?.response?.data?.message ?? "Error al actualizar codeudor";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};








export interface CreditoRaw {
  id: string | number;
  asesor?: string;
  codigo_credito?: string;
  nombre_cliente?: string;
  producto?: string;
  valor_producto?: string | number;   // viene como "68655602.00"
  plazo_meses?: string | number;      // viene como "6"
  estado?: string;
  proaprobado?: string;               // "Sí"/"No" o "No"
  analista?: string;                  // "Sin analista"
  revisado?: string;                  // "Sí"/"No"
  entrega_autorizada?: string;        // "No hay factura"
  cambio_ci?: string;                 // "Sí"/"No"
  fecha_creacion?: string;            // "YYYY-MM-DD HH:mm:ss"
  actualizado?: string;               // "YYYY-MM-DD HH:mm:ss"
  deudor_id?: string | number;        // "6"
  cotizacion_id: string | number;        // "6"
  codeudor_id: string | number;

}

export interface Credito {
  id: number;
  asesor: string;
  codigo_credito: string;
  nombre_cliente: string;
  producto: string;
  valor_producto: number;             // normalizado a number
  plazo_meses: number;                // normalizado a number
  estado: string;
  proaprobado: string;
  analista: string;
  revisado: string;
  entrega_autorizada: string;
  cambio_ci: string;
  fecha_creacion: string;             // sin tocar (ISO-like del backend)
  actualizado: string;                // sin tocar
  deudor_id: number;
  cotizacion_id: string | number;        // "6"
  codeudor_id: string | number;

}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}
export interface ListCreditosResponseRaw {
  success?: boolean;
  creditos?: CreditoRaw[]; // lo que ya tenías
  data?: CreditoRaw[];     // por si backend manda {data:[]}
  pagination?: PaginationMeta;
  message?: string;
}

const toNumberSafe = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapCredito = (r: CreditoRaw): Credito => ({
  id: toNumberSafe(r.id),
  asesor: r.asesor ?? "",
  codigo_credito: r.codigo_credito ?? "",
  nombre_cliente: r.nombre_cliente ?? "",
  producto: r.producto ?? "",
  valor_producto: toNumberSafe(r.valor_producto),
  plazo_meses: toNumberSafe(r.plazo_meses),
  estado: r.estado ?? "",
  proaprobado: r.proaprobado ?? "",
  analista: r.analista ?? "",
  revisado: r.revisado ?? "",
  entrega_autorizada: r.entrega_autorizada ?? "",
  cambio_ci: r.cambio_ci ?? "",
  fecha_creacion: r.fecha_creacion ?? "",
  actualizado: r.actualizado ?? "",
  deudor_id: toNumberSafe(r.deudor_id),
  cotizacion_id: toNumberSafe(r.cotizacion_id),
  codeudor_id: toNumberSafe(r.codeudor_id),

});

/**
 * Hook: useCreditos
 * Lista los créditos (sin filtros, tal cual el endpoint de tu captura).
 *
 * Uso:
 *   const { data, isLoading, error } = useCreditos();
 *   // data: Credito[]
 */
// export const useCreditos = () => {
//   return useQuery<Credito[]>({
//     queryKey: ["creditos"],
//     queryFn: async () => {
//       const { data } = await api.get<ListCreditosResponseRaw>("/list_creditos.php");
//       const arr = Array.isArray(data?.creditos)
//         ? data!.creditos!
//         : Array.isArray(data?.data)
//           ? data!.data!
//           : [];
//       return arr.map(mapCredito);
//     },
//   });
// };


export const useCreditos = (
  page: number,
  perPage: number = 10
) => {
  return useQuery<{
    items: Credito[];
    pagination: PaginationMeta;
  }>({
    queryKey: ["creditos", { page, perPage }],
    queryFn: async () => {
      const { data } = await api.get<ListCreditosResponseRaw>("/list_creditos.php", {
        params: { page, per_page: perPage },
      });

      // items: tolera {creditos: []} o {data: []}
      const rawArr: CreditoRaw[] = Array.isArray(data?.creditos)
        ? data!.creditos!
        : Array.isArray(data?.data)
        ? data!.data!
        : [];

      const items = rawArr.map(mapCredito);

      // meta: si no viene desde backend, lo calculamos básico
      const pagination: PaginationMeta =
        data?.pagination ?? {
          total: items.length,
          per_page: perPage,
          current_page: page,
          last_page: Math.max(1, Math.ceil((data?.pagination?.total ?? items.length) / perPage)),
        };

      return { items, pagination };
    },
    staleTime: 60_000,
  });
};



export interface CreditoLine {
  id: number;
  asesor: string;
  codigo_credito: string;
  nombre_cliente: string;
  producto: string;
  valor_producto: number;
  plazo_meses: number | null;
  estado: string; // ej.: "Incompleto"
  proaprobado: "Sí" | "No" | string; // permitir valores desconocidos
  analista: string; // ej.: "Sin analista"
  revisado: "Sí" | "No" | string;
  entrega_autorizada: string; // ej.: "No hay factura"
  entregado: string; // ej.: "No hay factura"
  cambio_ci: "Sí" | "No" | string;
  fecha_creacion: string; // ISO-like datetime string
  actualizado: string; // ISO-like datetime string
  deudor_id: number | null;
  codeudor_id: number | null;
  cotizacion_id: number | null;
  comentario: string | null;
  cuota_inicial: number;
  numero_chasis?: string | null;
  numero_motor?: string | null;
  fecha_entrega?: any;
  placa?: string | null;


  firmas?: any;
  soportes?: any;
}


export interface ApiResponseCreditos {
  success: boolean;
  creditos: CreditoLine[];
}


export type CreditoUpdatePayload = {
  cuota_inicial?: number;
  plazo_meses?: number;
  comentario?: string | null;
};


export interface UpdateCreditoResponseRaw {
  success?: boolean;
  message?: string;
  data?: Partial<CreditoLine> & { id?: number };
}


export type ActualizarCreditoInput = {
  codigo_credito: string | number; // ej. "3Q0LKp6"
  payload: CreditoUpdatePayload;
};


export const useActualizarCredito = () => {
  const qc = useQueryClient();


  return useMutation<UpdateCreditoResponseRaw, AxiosError<ServerError>, ActualizarCreditoInput>({
    mutationFn: async ({ codigo_credito, payload }) => {
      const { data } = await api.put<UpdateCreditoResponseRaw>(
        "/actualizar_credito.php",
        payload,
        {
          params: { codigo_credito },
          headers: { "Content-Type": "application/json" },
        }
      );
      return data;
    },
    onSuccess: async (resp, variables) => {
      // Invalida la lista general y, si manejas un detalle, también por código
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["creditos"] }),
        qc.invalidateQueries({ queryKey: ["credito", variables.codigo_credito] }),
        qc.invalidateQueries({ queryKey: ["codeudor", variables.codigo_credito] }),

        qc.invalidateQueries({ queryKey: ["deudor", variables.codigo_credito] }),

      ]);


      Swal.fire({
        icon: "success",
        title: resp?.message || "Crédito actualizado",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = (error as AxiosError<ServerError>)?.response?.data?.message ??
        "Error al actualizar crédito";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};


type Params =
  | { codigo_credito: string | number; id?: never }
  | { id: string | number; codigo_credito?: never };

export const useCredito = (params: Params, enabled = true) => {
  return useQuery<ApiResponseCreditos, AxiosError>({
    queryKey: ["credito", params],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponseCreditos>(
        "/list_creditos.php",
        { params } // { codigo_credito } o { id }
      );
      return data;
    },
  });
};





/* ---------- Tipos para Cerrar Crédito ---------- */
export type CerrarCreditoPayload = {
  numero_chasis?: string | null;
  numero_motor?: string | null;
  placa?: string | null;
  color?: string | null;
  capacidad?: string | null;
};

export type CerrarCreditoInput = {
  codigo_credito: string | number;
  payload: CerrarCreditoPayload;
};

export interface CerrarCreditoResponseRaw {
  success?: boolean;
  updated?: boolean;
  message?: string;
  data?: {
    id?: number;
    codigo_credito?: string;
    numero_chasis?: string | null;
    numero_motor?: string | null;
    placa?: string | null;
    color?: string | null;
    capacidad?: string | null;
    actualizado?: string;
  };
}

export interface ServerError {
  messages?: string | string[];
}

/* ---------- HOOK: Cerrar crédito (actualiza solo 5 campos) ---------- */
export const useCerrarCredito = () => {
  const qc = useQueryClient();

  return useMutation<CerrarCreditoResponseRaw, AxiosError<ServerError>, CerrarCreditoInput>({
    mutationFn: async ({ codigo_credito, payload }) => {
      const { data } = await api.put<CerrarCreditoResponseRaw>(
        "/cerrar_credito.php",
        payload,
        {
          params: { codigo_credito },
          headers: { "Content-Type": "application/json" },
        }
      );
      return data;
    },
    onSuccess: async (resp) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["creditos"] }),
        qc.invalidateQueries({ queryKey: ["credito"] }), // detalle por id o codigo
      ]);

      Swal.fire({
        icon: "success",
        title: resp?.message || "Campos de cierre actualizados",
        timer: 1600,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const raw = error.response?.data?.message ?? "Error al cerrar crédito";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};




export type CambiarEstadoPayload = {
  estado: "Pendiente" | "Aprobado" | "No viable" | string;
  comentario: string;
  nombre_usuario?: string;
  rol_usuario?: string;
};
export type CambiarEstadoInput = {
  codigo_credito: string | number;
  payload: CambiarEstadoPayload;
};
type CambiarEstadoResponse = { success?: boolean; message?: string; data?: any };

export const useCambiarEstadoCredito = () => {
  const qc = useQueryClient();

  return useMutation<CambiarEstadoResponse, AxiosError<any>, CambiarEstadoInput>({
    mutationFn: async ({ codigo_credito, payload }) => {
      // Fallback de auth por si el componente no lo manda
      const { user } = useAuthStore.getState();
      const enriched = {
        ...payload,
        nombre_usuario: payload.nombre_usuario ?? user?.name ?? "Usuario",
        rol_usuario: payload.rol_usuario ?? user?.rol ?? "Usuario",
      };

      const { data } = await api.put<CambiarEstadoResponse>("/cambiar_estado_credito.php", enriched, {
        params: { codigo_credito },
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (resp, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["creditos"] }),
        qc.invalidateQueries({ queryKey: ["credito", vars.codigo_credito] }),
        qc.invalidateQueries({ queryKey: ["comentarios", vars.codigo_credito] }),
      ]);
      Swal.fire({ icon: "success", title: resp?.message || "Estado actualizado", timer: 1500, showConfirmButton: false });
    },
    onError: (error) => {
      const raw = (error as AxiosError<any>)?.response?.data?.message ?? "Error al cambiar estado";
      const arr = Array.isArray(raw) ? raw : [raw];
      Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
    },
  });
};





type CreditosResponse =
  | Credito[]
  | { success: boolean; data: Credito[] };

// ===== Hook =====
export const useBuscarCreditos = (qInput: string) => {
  const q = (qInput ?? "").trim();

  return useQuery<Credito[]>({
    queryKey: ["creditos-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      // endpoint de tu backend nuevo: buscar_creditos.php
      const { data } = await api.get<CreditosResponse>("/select_credito.php", {
        params: { q },
      });

      const list = Array.isArray(data)
        ? data
        : data && Array.isArray((data as any).data)
          ? (data as any).data
          : [];

      // Normaliza id a number por si viene como string
      return list.map((c: any) => ({ ...c, id: Number(c.id) }));
    },
    staleTime: 60_000,
  });
};


export interface OneCreditoResponse {
  success: boolean;
  data: CreditoRaw | CreditoRaw[] | null;
}


// ya tienes useCreditos(); aquí solo agregamos el "por id"
export const useCreditoById = (id: number | null) =>
  useQuery<Credito | null>({
    queryKey: ["credito-by-id", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<OneCreditoResponse>("/list_creditos.php", { params: { id } });
      const raw = (data as any)?.data;
      if (!raw) return null;
      // puede venir como objeto o arreglo
      const c = Array.isArray(raw) ? raw[0] : raw;
      return c ? { ...c, id: Number(c.id) } : null;
    },
  });
