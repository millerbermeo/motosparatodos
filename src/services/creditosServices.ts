// src/services/creditoServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axiosInstance";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

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
  id_cotizacion: number;
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
        qc.invalidateQueries({ queryKey: ["deudor", variables.id_cotizacion] }),
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



export const useDeudor = (id: number) => {
  return useQuery<any>({
    queryKey: ["deudor", id],
    queryFn: async () => {
      const { data } = await api.get<any>(
        "/deudores_id.php", // endpoint correcto
        {
          params: { id }, // pasa el id en query string
    
        }
      );
      return data;
    },
    enabled: !!id, // solo consulta si hay id y token
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
        params: { id }, // ← tal como en tu Postman
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
export const useCodeudoresByDeudor = (id: number) => {
  return useQuery<any>({
    queryKey: ["codeudor", id],
    queryFn: async () => {
      const { data } = await api.get<any>("/list_codeudores.php", {
        params: { deudor_id: id },
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
type ActualizarCodeudorInput = {
  id: number;     // id del codeudor a actualizar
  payload: any;   // mismo payload que en registrar
};


export const useActualizarCodeudor = () => {
  const qc = useQueryClient();

  return useMutation<ServerOk, AxiosError<ServerError>, ActualizarCodeudorInput>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<ServerOk>("/codeudor_actualizar.php", payload, {
        params: { id },
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: async (resp, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["codeudor", variables.id] }),
        qc.invalidateQueries({ queryKey: ["codeudores"] }),
        qc.invalidateQueries({ queryKey: ["creditos"] }),
      ]);

      Swal.fire({
        icon: "success",
        title: resp?.message || "Codeudor actualizado",
        timer: 1600,
        showConfirmButton: false,
      });
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
  poraprobado?: string;               // "Sí"/"No" o "No"
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
  poraprobado: string;
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

export interface ListCreditosResponseRaw {
  success?: boolean;
  creditos?: CreditoRaw[];            // según la captura
  data?: CreditoRaw[];                // por si el backend envía {data:[]}
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
  poraprobado: r.poraprobado ?? "",
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
export const useCreditos = () => {
  return useQuery<Credito[]>({
    queryKey: ["creditos"],
    queryFn: async () => {
      const { data } = await api.get<ListCreditosResponseRaw>("/list_creditos.php");
      // el backend puede devolver { creditos: [...] } o { data: [...] }
      const arr = Array.isArray(data?.creditos)
        ? data!.creditos!
        : Array.isArray(data?.data)
        ? data!.data!
        : [];
      return arr.map(mapCredito);
    },
  });
};