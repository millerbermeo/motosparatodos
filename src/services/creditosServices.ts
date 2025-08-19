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