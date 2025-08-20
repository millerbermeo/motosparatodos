// src/components/solicitudes/CoodeudoresFormulario.tsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import {
  useRegistrarCodeudor,
  useActualizarCodeudor,
  useCodeudoresByDeudor,
} from "../../../services/creditosServices";

// + añade:
import { useParams } from "react-router-dom";


/* ========================= Tipos del form ========================= */
type Coodeudor = {
  // personales
  numDocumento?: string;
  tipoDocumento?: string;
  fechaExpedicion?: string;
  lugarExpedicion?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  nivelEstudios?: string;
  ciudadResidencia?: string;
  barrioResidencia?: string;
  direccionResidencia?: string;
  celular?: string;
  telFijo?: string;
  email?: string;
  estadoCivil?: string;
  personasACargo?: number | string;
  tipoVivienda?: string;
  costoArriendo?: number | string;
  fincaRaiz?: "No" | "Casa" | "Apartamento" | "Lote" | "Otro";

  // laboral
  empresaLabora?: string;
  direccionEmpleador?: string;
  telEmpleador?: string;
  cargo?: string;
  tipoContrato?: string;
  salario?: number | string;
  tiempoServicio?: string;

  // vehículo
  vehPlaca?: string;
  vehMarca?: string;
  vehModelo?: string;
  vehTipo?: string;
  vehNumMotor?: string;

  // referencias
  ref1Nombre?: string; ref1Tipo?: string; ref1Direccion?: string; ref1Telefono?: string;
  ref2Nombre?: string; ref2Tipo?: string; ref2Direccion?: string; ref2Telefono?: string;
  ref3Nombre?: string; ref3Tipo?: string; ref3Direccion?: string; ref3Telefono?: string;
};

type FormValues = { codeudores: Coodeudor[] };

/* ========================= Selects ========================= */
const tipoDocumentoOptions: SelectOption[] = [
  { value: "Cédula de ciudadanía", label: "Cédula de ciudadanía" },
];

const nivelEstudiosOptions: SelectOption[] = [
  { value: "Primaria", label: "Primaria" },
  { value: "Educación media", label: "Educación media" },
  { value: "Técnico / Tecnólogo", label: "Técnico / Tecnólogo" },
  { value: "Universitario", label: "Universitario" },
  { value: "Postgrado", label: "Postgrado" },
  { value: "Educación superior", label: "Educación superior" },
];

const estadoCivilOptions: SelectOption[] = [
  { value: "Soltero/a", label: "Soltero/a" },
  { value: "Casado/a", label: "Casado/a" },
  { value: "Unión libre", label: "Unión libre" },
  { value: "Divorciado/a", label: "Divorciado/a" },
  { value: "Viudo/a", label: "Viudo/a" },
];

const tipoViviendaOptions: SelectOption[] = [
  { value: "Propia", label: "Propia" },
  { value: "Arriendo", label: "Arriendo" },
  { value: "Familiar", label: "Familiar" },
];

const fincaRaizOptions: SelectOption[] = [
  { value: "No", label: "No" },
  { value: "Casa", label: "Casa" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Lote", label: "Lote" },
  { value: "Otro", label: "Otro" },
];

const tipoContratoOptions: SelectOption[] = [
  { value: "Fijo", label: "Fijo" },
  { value: "Indefinido", label: "Indefinido" },
  { value: "Obra o labor", label: "Obra o labor" },
  { value: "Temporal", label: "Temporal" },
  { value: "Prestación de servicios", label: "Prestación de servicios" },
];

const vehiculoTipoOptions: SelectOption[] = [
  { value: "Motocicleta", label: "Motocicleta" },
  { value: "Automóvil", label: "Automóvil" },
  { value: "Camioneta", label: "Camioneta" },
  { value: "Otro", label: "Otro" },
];

const tipoReferenciaOptions: SelectOption[] = [
  { value: "Familiar", label: "Familiar" },
  { value: "Personal", label: "Personal" },
  { value: "Laboral", label: "Laboral" },
];

const ciudadesEjemplo: SelectOption[] = [
  { value: "Pitalito", label: "Pitalito" },
  { value: "Neiva", label: "Neiva" },
  { value: "Bogotá", label: "Bogotá" },
  { value: "Cali", label: "Cali" },
  { value: "Medellín", label: "Medellín" },
];

/* ========================= Utils ========================= */
const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";

const emptyCoodeudor: Coodeudor = {
  numDocumento: "",
  tipoDocumento: "Cédula de ciudadanía",
  fechaExpedicion: "",
  lugarExpedicion: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  fechaNacimiento: "",
  nivelEstudios: "Educación superior",
  ciudadResidencia: "",
  barrioResidencia: "",
  direccionResidencia: "",
  celular: "",
  telFijo: "",
  email: "",
  estadoCivil: "Soltero/a",
  personasACargo: "",
  tipoVivienda: "Propia",
  costoArriendo: "",
  fincaRaiz: "No",
  empresaLabora: "",
  direccionEmpleador: "",
  telEmpleador: "",
  cargo: "",
  tipoContrato: "Indefinido",
  salario: "",
  tiempoServicio: "",
  vehPlaca: "",
  vehMarca: "",
  vehModelo: "",
  vehTipo: "",
  vehNumMotor: "",
  ref1Nombre: "",
  ref1Tipo: "Familiar",
  ref1Direccion: "",
  ref1Telefono: "",
  ref2Nombre: "",
  ref2Tipo: "Familiar",
  ref2Direccion: "",
  ref2Telefono: "",
  ref3Nombre: "",
  ref3Tipo: "Familiar",
  ref3Direccion: "",
  ref3Telefono: "",
};

// limpia "", null, undefined, objetos/arrays vacíos
const prune = (obj: any): any => {
  if (obj == null) return undefined;
  if (Array.isArray(obj)) {
    const a = obj.map(prune).filter((v) => v !== undefined);
    return a.length ? a : undefined;
  }
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const pv = prune(v);
      if (pv !== undefined && !(typeof pv === "object" && !Array.isArray(pv) && Object.keys(pv).length === 0)) {
        out[k] = pv;
      }
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (typeof obj === "string") return obj.trim() === "" ? undefined : obj.trim();
  if (typeof obj === "number" && Number.isNaN(obj)) return undefined;
  return obj;
};

/* ========================= Mapeos form ⇄ backend ========================= */
// antes: const toBackendPayload = (c: Coodeudor, deudorId?: number) => {
const toBackendPayload = (c: Coodeudor, credito?: string,) => {

  const personas_a_cargo = c.personasACargo === "" ? undefined : Number(c.personasACargo);
  const costo_arriendo_in = c.costoArriendo === "" ? undefined : Number(c.costoArriendo);
  const salario = c.salario === "" ? undefined : Number(c.salario);

  const referencias = [
    c.ref1Nombre || c.ref1Tipo || c.ref1Direccion || c.ref1Telefono
      ? { nombre_completo: c.ref1Nombre, tipo_referencia: c.ref1Tipo, direccion: c.ref1Direccion, telefono: c.ref1Telefono }
      : undefined,
    c.ref2Nombre || c.ref2Tipo || c.ref2Direccion || c.ref2Telefono
      ? { nombre_completo: c.ref2Nombre, tipo_referencia: c.ref2Tipo, direccion: c.ref2Direccion, telefono: c.ref2Telefono }
      : undefined,
    c.ref3Nombre || c.ref3Tipo || c.ref3Direccion || c.ref3Telefono
      ? { nombre_completo: c.ref3Nombre, tipo_referencia: c.ref3Tipo, direccion: c.ref3Direccion, telefono: c.ref3Telefono }
      : undefined,
  ].filter(Boolean);

  const payload = {
    codigo_credito: String(credito), // <- viene de la URL
    informacion_personal: {
      numero_documento: c.numDocumento,
      tipo_documento: c.tipoDocumento,
      fecha_expedicion: c.fechaExpedicion,
      lugar_expedicion: c.lugarExpedicion,
      primer_nombre: c.primerNombre,
      segundo_nombre: c.segundoNombre,
      primer_apellido: c.primerApellido,
      segundo_apellido: c.segundoApellido,
      fecha_nacimiento: c.fechaNacimiento,
      nivel_estudios: c.nivelEstudios,
      ciudad_residencia: c.ciudadResidencia,
      barrio_residencia: c.barrioResidencia,
      direccion_residencia: c.direccionResidencia,
      telefono_fijo: c.telFijo,
      celular: c.celular,
      email: c.email,
      estado_civil: c.estadoCivil,
      personas_a_cargo,
      tipo_vivienda: c.tipoVivienda,
      costo_arriendo: c.tipoVivienda === "Arriendo" ? (costo_arriendo_in ?? 0) : 0,
      finca_raiz: c.fincaRaiz,
    },
    informacion_laboral: {
      empresa: c.empresaLabora,
      direccion_empleador: c.direccionEmpleador,
      telefono_empleador: c.telEmpleador,
      cargo: c.cargo,
      tipo_contrato: c.tipoContrato,
      salario,
      tiempo_servicio: c.tiempoServicio,
    },
    vehiculo: {
      placa: c.vehPlaca,
      marca: c.vehMarca,
      modelo: c.vehModelo,
      tipo: c.vehTipo,
      numero_motor: c.vehNumMotor,
    },
    referencias: referencias.length ? referencias : undefined,
  };

  return prune(payload);
};


const normalizeEstadoCivil = (v: any): string => {
  if (v === "0" || v == null || v === "") return "Soltero/a";
  return String(v);
};
const normalizeTipoVivienda = (v: any): string => {
  if (v === "0" || v == null || v === "") return "Propia";
  return String(v);
};

// Mapea un objeto del backend → form (para editar)
const fromBackendToForm = (data: any): Coodeudor => {
  const p = data?.informacion_personal ?? {};
  const l = data?.informacion_laboral ?? {};
  // Puede venir como `vehiculo` o como `vehiculos` (array)
  const v = data?.vehiculo ?? (Array.isArray(data?.vehiculos) ? data.vehiculos[0] : {}) ?? {};
  const r: any[] = Array.isArray(data?.referencias) ? data.referencias : [];

  return {
    numDocumento: p.numero_documento ?? "",
    tipoDocumento: p.tipo_documento ?? "Cédula de ciudadanía",
    fechaExpedicion: p.fecha_expedicion ?? "",
    lugarExpedicion: p.lugar_expedicion ?? "",
    primerNombre: p.primer_nombre ?? "",
    segundoNombre: p.segundo_nombre ?? "",
    primerApellido: p.primer_apellido ?? "",
    segundoApellido: p.segundo_apellido ?? "",
    fechaNacimiento: p.fecha_nacimiento ?? "",
    nivelEstudios: p.nivel_estudios ?? "Educación superior",
    ciudadResidencia: p.ciudad_residencia ?? "",
    barrioResidencia: p.barrio_residencia ?? "",
    direccionResidencia: p.direccion_residencia ?? "",
    celular: p.celular ?? "",
    telFijo: p.telefono_fijo ?? "",
    email: p.email ?? "",
    estadoCivil: normalizeEstadoCivil(p.estado_civil),
    personasACargo: p.personas_a_cargo ?? "",
    tipoVivienda: normalizeTipoVivienda(p.tipo_vivienda),
    costoArriendo: p.costo_arriendo ?? "",
    fincaRaiz: (p.finca_raiz as Coodeudor["fincaRaiz"]) ?? "No",

    empresaLabora: l.empresa ?? "",
    direccionEmpleador: l.direccion_empleador ?? "",
    telEmpleador: l.telefono_empleador ?? "",
    cargo: l.cargo ?? "",
    tipoContrato: l.tipo_contrato ?? "Indefinido",
    salario: l.salario ?? "",
    tiempoServicio: l.tiempo_servicio ?? "",

    vehPlaca: v?.placa ?? "",
    vehMarca: v?.marca ?? "",
    vehModelo: v?.modelo ?? "",
    vehTipo: v?.tipo ?? "",
    vehNumMotor: v?.numero_motor ?? "",

    ref1Nombre: r[0]?.nombre_completo ?? "",
    ref1Tipo: r[0]?.tipo_referencia ?? "Familiar",
    ref1Direccion: r[0]?.direccion ?? "",
    ref1Telefono: r[0]?.telefono ?? "",
    ref2Nombre: r[1]?.nombre_completo ?? "",
    ref2Tipo: r[1]?.tipo_referencia ?? "Familiar",
    ref2Direccion: r[1]?.direccion ?? "",
    ref2Telefono: r[1]?.telefono ?? "",
    ref3Nombre: r[2]?.nombre_completo ?? "",
    ref3Tipo: r[2]?.tipo_referencia ?? "Familiar",
    ref3Direccion: r[2]?.direccion ?? "",
    ref3Telefono: r[2]?.telefono ?? "",
  };
};

/* ========================= Data hooks ========================= */

/* ========================= Componente ========================= */
// type Props = { deudorId?: number }; // usaremos id estático si no lo pasan

const CoodeudoresFormulario: React.FC = () => {



const { id: codigoCredito } = useParams<{ id: string }>();
if (!codigoCredito) return <div>Error: no se encontró el parámetro en la URL</div>;


  
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { codeudores: [emptyCoodeudor] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "codeudores" });

  // mutations
  const registrar = useRegistrarCodeudor();
  const actualizar = useActualizarCodeudor();

  // lista existente
const { data: listResp, isLoading: listLoading, refetch } =
  useCodeudoresByDeudor(String(codigoCredito));

  // ids de edición por índice (0..1)
  const [editingIds, setEditingIds] = React.useState<(number | null)[]>([null]);

  // normalizar listado cualquiera sea el shape
  const codeudoresList: any[] = React.useMemo(() => {
    if (!listResp) return [];
    if (Array.isArray(listResp)) return listResp;
    if (Array.isArray(listResp?.data)) return listResp.data;
    return [];
  }, [listResp]);

  // extraer id “del codeudor” desde una fila
  const extractRowId = (row: any): number | null => {
    const p = row?.informacion_personal;
    const l = row?.informacion_laboral;
    const v = row?.vehiculo ?? (Array.isArray(row?.vehiculos) ? row.vehiculos[0] : undefined);
    const id =
      Number(row?.id ?? p?.id ?? l?.id ?? v?.id ?? 0) || 0;
    return id || null;
  };

  // Prefill directo en el form (sin tabla)
  React.useEffect(() => {
    if (!codeudoresList || codeudoresList.length === 0) {
      reset({ codeudores: [emptyCoodeudor] });
      setEditingIds([null]);
      return;
    }
    const mapped = codeudoresList.slice(0, 2).map(fromBackendToForm);
    reset({ codeudores: mapped });
    setEditingIds(codeudoresList.slice(0, 2).map(extractRowId));
  }, [codeudoresList, reset]);

  // watchers para arriendo (0 y 1)
  const tipoVivienda0 = watch(`codeudores.0.tipoVivienda`);
  React.useEffect(() => {
    if (tipoVivienda0 && tipoVivienda0 !== "Arriendo") setValue(`codeudores.0.costoArriendo`, "");
  }, [tipoVivienda0, setValue]);

  const tipoVivienda1 = watch(`codeudores.1.tipoVivienda`);
  React.useEffect(() => {
    if (tipoVivienda1 && tipoVivienda1 !== "Arriendo") setValue(`codeudores.1.costoArriendo`, "");
  }, [tipoVivienda1, setValue]);

  // agregar/quitar segundo codeudor
  const addSecond = () => {
    if (fields.length < 2) {
      append({ ...emptyCoodeudor });
      setEditingIds((prev) => [...prev, null]);
    }
  };
  const removeSecond = () => {
    if (fields.length === 2) {
      remove(1);
      setEditingIds((prev) => [prev[0] ?? null]);
    }
  };

  // submit: por cada bloque, si hay id → actualizar; si no → registrar
const onSubmit = (values: FormValues) => {
  const payloads = values.codeudores
    .map((c) => prune(toBackendPayload(c, codigoCredito))) // <- usa codigoCredito
    .filter(Boolean);

  payloads.forEach((payload) => {
    const codeudorId = editingIds[0]; // <- NO lo llames "id" para no confundir
    if (codeudorId) {
      actualizar.mutate({ id: payload.codigo_credito, payload }, { onSuccess: () => refetch() });
    } else {
      registrar.mutate(payload as any, { onSuccess: () => refetch() });
    }
  });
};



  // cancelar: vuelve al estado inicial (lo que haya en servidor o vacío)
  const onCancel = () => {
    if (codeudoresList.length === 0) {
      reset({ codeudores: [emptyCoodeudor] });
      setEditingIds([null]);
    } else {
      const mapped = codeudoresList.slice(0, 2).map(fromBackendToForm);
      reset({ codeudores: mapped });
      setEditingIds(codeudoresList.slice(0, 2).map(extractRowId));
    }
  };

  return (
    <div className="space-y-10">
      {/* ================== FORM (edición directa) ================== */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {fields.map((field, idx) => (
          <div key={field.id} className="space-y-8 border border-base-300 rounded-xl p-4">
            <div className="badge text-xl badge-success text-white mb-3">
              {`Codeudor ${idx + 1} - Información personal`}
              {editingIds[idx] ? <span className="ml-2">[Editando #{editingIds[idx]}]</span> : null}
            </div>

            {/* ======== PERSONALES ======== */}
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.numDocumento`} label="Número de documento" placeholder="Ingrese número de documento" />
              <FormSelect control={control} name={`codeudores.${idx}.tipoDocumento`} label="Tipo de documento" options={tipoDocumentoOptions} />
              <FormInput control={control} name={`codeudores.${idx}.fechaExpedicion`} label="Fecha de expedición" type="date" />

              <FormSelect control={control} name={`codeudores.${idx}.lugarExpedicion`} label="Lugar de expedición" options={ciudadesEjemplo} />
              <FormInput control={control} name={`codeudores.${idx}.primerNombre`} label="Primer nombre" />
              <FormInput control={control} name={`codeudores.${idx}.segundoNombre`} label="Segundo nombre" />

              <FormInput control={control} name={`codeudores.${idx}.primerApellido`} label="Primer apellido" />
              <FormInput control={control} name={`codeudores.${idx}.segundoApellido`} label="Segundo apellido" />
              <FormInput control={control} name={`codeudores.${idx}.fechaNacimiento`} label="Fecha de nacimiento" type="date" />

              <FormSelect control={control} name={`codeudores.${idx}.nivelEstudios`} label="Nivel de estudios" options={nivelEstudiosOptions} />
              <FormSelect control={control} name={`codeudores.${idx}.ciudadResidencia`} label="Ciudad de residencia" options={ciudadesEjemplo} />
              <FormInput control={control} name={`codeudores.${idx}.barrioResidencia`} label="Barrio de residencia" />

              <FormInput control={control} name={`codeudores.${idx}.direccionResidencia`} label="Dirección de residencia" />
              <FormInput
                control={control}
                name={`codeudores.${idx}.celular`}
                label="Número de celular"
                placeholder="3XXXXXXXXX"
                rules={{ pattern: { value: /^3\d{9}$/, message: "Debe iniciar en 3 y tener 10 dígitos" } }}
              />
              <FormInput control={control} name={`codeudores.${idx}.telFijo`} label="Número tel. fijo" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />

              <FormInput control={control} name={`codeudores.${idx}.email`} label="Email" rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }} />
              <FormSelect control={control} name={`codeudores.${idx}.estadoCivil`} label="Estado civil" options={estadoCivilOptions} />
              <FormInput control={control} name={`codeudores.${idx}.personasACargo`} label="Personas a cargo" type="number" rules={{ validate: (v) => (v === "" || Number(v) >= 0) || "Debe ser >= 0" }} />

              <FormSelect control={control} name={`codeudores.${idx}.tipoVivienda`} label="Tipo de vivienda" options={tipoViviendaOptions} />
              <FormInput
                control={control}
                name={`codeudores.${idx}.costoArriendo`}
                label="Costo del arriendo (COP)"
                type="number"
                // disabled={watch(`codeudores.${idx}.tipoVivienda`) !== "Arriendo"}
                rules={{ validate: (v) => (v === "" || Number(v) > 0 || "Indique un valor > 0") }}
              />
              <FormSelect control={control} name={`codeudores.${idx}.fincaRaiz`} label="Finca raíz" options={fincaRaizOptions} />
            </div>

            {/* ======== LABORAL ======== */}
            <div className="badge text-xl badge-success text-white mb-3">
              Codeudor {idx + 1} - Información laboral
            </div>
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.empresaLabora`} label="Empresa donde labora" />
              <FormInput control={control} name={`codeudores.${idx}.direccionEmpleador`} label="Dirección empleador" />
              <FormInput control={control} name={`codeudores.${idx}.telEmpleador`} label="Teléfono del empleador" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />

              <FormInput control={control} name={`codeudores.${idx}.cargo`} label="Cargo" />
              <FormSelect control={control} name={`codeudores.${idx}.tipoContrato`} label="Tipo de contrato" options={tipoContratoOptions} />
              <FormInput control={control} name={`codeudores.${idx}.salario`} label="Salario (COP)" type="number" rules={{ validate: (v) => (v === "" || Number(v) >= 0) || "Debe ser >= 0" }} />

              <FormInput control={control} name={`codeudores.${idx}.tiempoServicio`} label="Tiempo de servicio" placeholder="Ej. 24 meses" />
            </div>

            {/* ======== VEHÍCULO ======== */}
            <div className="badge text-xl badge-success text-white mb-3">
              Codeudor {idx + 1} - Vehículo
            </div>
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.vehPlaca`} label="Placa" />
              <FormInput control={control} name={`codeudores.${idx}.vehMarca`} label="Marca" />
              <FormInput control={control} name={`codeudores.${idx}.vehModelo`} label="Modelo" />
              <FormSelect control={control} name={`codeudores.${idx}.vehTipo`} label="Tipo" options={vehiculoTipoOptions} />
              <FormInput control={control} name={`codeudores.${idx}.vehNumMotor`} label="Número de motor" />
            </div>

            {/* ======== REFERENCIAS ======== */}
            <div className="badge text-xl badge-success text-white mb-3">
              Codeudor {idx + 1} - Referencia 1
            </div>
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.ref1Nombre`} label="Nombre completo" />
              <FormSelect control={control} name={`codeudores.${idx}.ref1Tipo`} label="Tipo de referencia" options={tipoReferenciaOptions} />
              <FormInput control={control} name={`codeudores.${idx}.ref1Direccion`} label="Dirección" />
              <FormInput control={control} name={`codeudores.${idx}.ref1Telefono`} label="Número telefónico" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
            </div>

            <div className="badge text-xl badge-success text-white mb-3">
              Codeudor {idx + 1} - Referencia 2
            </div>
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.ref2Nombre`} label="Nombre completo" />
              <FormSelect control={control} name={`codeudores.${idx}.ref2Tipo`} label="Tipo de referencia" options={tipoReferenciaOptions} />
              <FormInput control={control} name={`codeudores.${idx}.ref2Direccion`} label="Dirección" />
              <FormInput control={control} name={`codeudores.${idx}.ref2Telefono`} label="Número telefónico" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
            </div>

            <div className="badge text-xl badge-success text-white mb-3">
              Codeudor {idx + 1} - Referencia 3
            </div>
            <div className={grid}>
              <FormInput control={control} name={`codeudores.${idx}.ref3Nombre`} label="Nombre completo" />
              <FormSelect control={control} name={`codeudores.${idx}.ref3Tipo`} label="Tipo de referencia" options={tipoReferenciaOptions} />
              <FormInput control={control} name={`codeudores.${idx}.ref3Direccion`} label="Dirección" />
              <FormInput control={control} name={`codeudores.${idx}.ref3Telefono`} label="Número telefónico" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
            </div>

            {/* acciones por codeudor */}
            {idx === 1 && (
              <div className="flex justify-end">
                <button type="button" className="btn btn-outline btn-error" onClick={removeSecond}>
                  Quitar codeudor 2
                </button>
              </div>
            )}
          </div>
        ))}

        {/* acciones generales */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {fields.length < 2 && (
              <button type="button" className="btn btn-outline" onClick={addSecond}>
                + Agregar codeudor 2
              </button>
            )}
            {fields.length === 2 && (
              <button type="button" className="btn btn-outline btn-error" onClick={removeSecond}>
                Quitar codeudor 2
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={listLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={registrar.isPending || actualizar.isPending}>
              {editingIds.some(Boolean) ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CoodeudoresFormulario;
