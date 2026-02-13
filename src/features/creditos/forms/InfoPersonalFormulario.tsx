// src/components/solicitudes/InfoPersonalFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { FormInput } from "../../../shared/components/FormInput";
import { useDeudor, useRegistrarDeudor, useActualizarDeudor } from "../../../services/creditosServices";
import { useParams } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";
import { unformatNumber } from "../../../shared/components/moneyUtils";
import { useCotizacionByCodigoCredito } from "../../../services/cotizacionesServices";

/** Convierte string con puntos/comas/etc. a número en pesos */
const toNumberPesos = (v: unknown): number => {
  if (v == null) return 0;
  const raw = String(v);
  const digits = unformatNumber(raw);
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

/** Centavos (DB) -> string de pesos sin formato (para que FormInput lo enmascare) */
const centsToPesosStr = (cents: unknown): string => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "0";
  const pesos = Math.trunc(n / 100);
  return String(pesos);
};

/** String de pesos formateado -> número en centavos (DB) */
const pesosStrToCentsNumber = (value: unknown): number => {
  const pesos = toNumberPesos(value);
  return pesos * 100;
};

// ============================ Tipos ============================

type Referencia = {
  nombre_completo: string;
  tipo_referencia: string;
  direccion: string;
  telefono: string;
};

type InfoPersonalFormValues = {
  codigo_credito?: string;
  numero_documento: string;
  tipo_documento: string;
  fecha_expedicion: string;
  lugar_expedicion: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  nivel_estudios: string;
  ciudad_residencia: string;
  barrio_residencia?: string;
  direccion_residencia: string;
  telefono_fijo?: string;
  celular: string;
  email: string;
  estado_civil: string;
  personas_a_cargo: number;
  tipo_vivienda: string;
  costo_arriendo?: string;
  finca_raiz?: string;

  informacion_laboral: {
    empresa?: string;
    direccion_empleador?: string;
    telefono_empleador?: string;
    cargo?: string;
    tipo_contrato?: string;
    salario?: number | string;
    tiempo_servicio?: string;
  };

  vehiculo: {
    placa?: string;
    marca?: string;
    modelo?: string;
    tipo?: string;
    numero_motor?: string;
  };

  referencias: Referencia[];
};

// ============================ Opciones Select ============================

const tipoDocumentoOptions: SelectOption[] = [
  { value: "Cédula de ciudadanía", label: "Cédula de ciudadanía" },
  { value: "Tarjeta de identidad", label: "Tarjeta de identidad" },
  { value: "Cédula extranjería", label: "Cédula extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
  { value: "Otro", label: "Otro" },
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
  { value: "Otro", label: "Otro" },
];

const tipoContratoOptions: SelectOption[] = [
  { value: "Indefinido", label: "Indefinido" },
  { value: "Término fijo", label: "Término fijo" },
  { value: "Prestación de servicios", label: "Prestación de servicios" },
  { value: "Otro", label: "Otro" },
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
  { value: "Otro", label: "Otro" },
];

const fincaRaizOptions: SelectOption[] = [
  { value: "No", label: "No" },
  { value: "Casa", label: "Casa" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Lote", label: "Lote" },
  { value: "Otro", label: "Otro" },
];

// ============================ Helpers ============================

const normalizaRef = (r: Referencia): Referencia => ({
  nombre_completo: (r?.nombre_completo ?? "").trim(),
  tipo_referencia: (r?.tipo_referencia ?? "").trim(),
  direccion: (r?.direccion ?? "").trim(),
  telefono: (r?.telefono ?? "").trim(),
});

// convierte strings numéricos a número; conserva 0 cuando no hay valor
const toNumber = (v: unknown): number => {
  if (v == null) return 0;
  const raw = String(v);
  const digits = unformatNumber(raw);
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

// el backend te manda "Casa" en finca_raiz; lo tratamos como "Si"
const mapFincaRaiz = (v: any): "Si" | "No" | "Otro" => {
  if (v === "Si" || v === "No" || v === "Otro") return v;
  if (!v) return "No";
  return "Si";
};

const dateNotTodayOrFuture = (val: unknown): true | string => {
  const v = typeof val === "string" ? val : "";
  if (!v) return true;
  const exp = new Date(`${v}T00:00:00`);
  exp.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (+exp === +today) return "No puede ser hoy";
  if (exp > today) return "No puede ser una fecha futura";
  return true;
};

/** ✅ Helpers referencias (regla "si toca algo, todo obligatorio") */
const hasAnyRefValue = (r: Referencia) => {
  const rr = normalizaRef(r);
  return Boolean(rr.nombre_completo || rr.tipo_referencia || rr.direccion || rr.telefono);
};

const isCompleteRef = (r: Referencia) => {
  const rr = normalizaRef(r);
  return Boolean(rr.nombre_completo && rr.tipo_referencia && rr.direccion && rr.telefono);
};

const isPhone10 = (tel: string) => /^[0-9]{10}$/.test(tel);

// ✅ valida a nivel de campo, según estado de la referencia completa
const refFieldRule =
  (index: number, field: keyof Referencia, getValues: any) =>
  (value: unknown): true | string => {
    const refs = (getValues("referencias") ?? []) as Referencia[];
    const r = refs[index] ?? { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" };
    const rr = normalizaRef(r);

    const touched = hasAnyRefValue(rr);
    if (!touched) return true; // referencia vacía: ok

    // si escribieron algo, entonces todo es obligatorio
    const val = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    if (!val) return "Este campo es obligatorio";

    // validación especial para teléfono: exactamente 10 dígitos
    if (field === "telefono") {
      if (!isPhone10(val)) return "Debe tener exactamente 10 dígitos";
    }

    return true;
  };

// ============================ Componente ============================

const InfoPersonalFormulario: React.FC = () => {
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const navDirRef = React.useRef<"next" | "prev">("next");
  const isFirst = useWizardStore((s) => s.isFirst);

  const { id } = useParams<{ id: string }>();
  console.log("ID recibido:", id);

  if (!id) {
    return <div>Error: no se encontró el parámetro en la URL</div>;
  }

  const { data } = useDeudor(String(id));

  const registrarDeudor = useRegistrarDeudor();
  const actualizarDeudor = useActualizarDeudor();

  const { control, handleSubmit, watch, setValue, reset, getValues } = useForm<InfoPersonalFormValues>({
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      codigo_credito: String(id),
      numero_documento: "",
      tipo_documento: "Cédula de ciudadanía",
      fecha_expedicion: "",
      lugar_expedicion: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      fecha_nacimiento: "",
      nivel_estudios: "",
      ciudad_residencia: "",
      barrio_residencia: "",
      direccion_residencia: "",
      telefono_fijo: "",
      celular: "",
      email: "",
      estado_civil: "",
      personas_a_cargo: 0,
      tipo_vivienda: "",
      costo_arriendo: "0",
      finca_raiz: "",
      informacion_laboral: {
        empresa: "",
        direccion_empleador: "",
        telefono_empleador: "",
        cargo: "",
        tipo_contrato: "",
        salario: "0",
        tiempo_servicio: "",
      },
      vehiculo: {
        placa: "",
        marca: "",
        modelo: "",
        tipo: "",
        numero_motor: "",
      },
      referencias: [
        { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
        { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
        { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
      ],
    },
  });

  // Cargar data del backend → reset con mapeo correcto
  React.useEffect(() => {
    if (!data) return;

    const p = (data.data as any).informacion_personal ?? {};
    const l = (data.data as any).informacion_laboral ?? {};
    const v = (data.data as any).vehiculo ?? {};

    const rRaw: any[] = Array.isArray((data?.data as any)?.referencias) ? (data!.data as any).referencias : [];

    const r3 = rRaw.slice(0, 3);
    while (r3.length < 3) {
      r3.push({ nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" });
    }
    const referenciasNorm = r3.map(normalizaRef);

    reset({
      codigo_credito: p.codigo_credito ?? id,
      numero_documento: p.numero_documento ?? "",
      tipo_documento: p.tipo_documento ?? "Cédula de ciudadanía",
      fecha_expedicion: p.fecha_expedicion ?? "",
      lugar_expedicion: p.lugar_expedicion ?? "",
      primer_nombre: p.primer_nombre ?? "",
      segundo_nombre: p.segundo_nombre ?? "",
      primer_apellido: p.primer_apellido ?? "",
      segundo_apellido: p.segundo_apellido ?? "",
      fecha_nacimiento: p.fecha_nacimiento ?? "",
      nivel_estudios: p.nivel_estudios ?? "",
      ciudad_residencia: p.ciudad_residencia ?? "",
      barrio_residencia: p.barrio_residencia ?? "",
      direccion_residencia: p.direccion_residencia ?? "",
      telefono_fijo: p.telefono_fijo ?? "",
      celular: p.celular ?? "",
      email: p.email ?? "",
      estado_civil: p.estado_civil ?? "",
      personas_a_cargo: toNumber(p.personas_a_cargo ?? 0),
      tipo_vivienda: p.tipo_vivienda ?? "",
      costo_arriendo: centsToPesosStr(p.costo_arriendo ?? 0),
      finca_raiz: mapFincaRaiz(p.finca_raiz),

      informacion_laboral: {
        empresa: l.empresa ?? "",
        direccion_empleador: l.direccion_empleador ?? "",
        telefono_empleador: l.telefono_empleador ?? "",
        cargo: l.cargo ?? "",
        tipo_contrato: l.tipo_contrato,
        salario: centsToPesosStr(l.salario ?? 0),
        tiempo_servicio: l.tiempo_servicio ?? "",
      },

      vehiculo: {
        placa: v.placa ?? "",
        marca: v.marca ?? "",
        modelo: v.modelo ?? "",
        tipo: v.tipo ?? "",
        numero_motor: v.numero_motor ?? "",
      },

      referencias: referenciasNorm,
    });
  }, [data, reset, id]);

  // Si NO es arriendo → costo_arriendo = 0
  const tipoVivienda = watch("tipo_vivienda");
  React.useEffect(() => {
    if (tipoVivienda == null) return;
    if (tipoVivienda !== "Arriendo") {
      const curr = getValues("costo_arriendo");
      if (curr == null || curr === "") {
        setValue("costo_arriendo", "0", { shouldDirty: false });
      }
    }
  }, [tipoVivienda, setValue, getValues]);

  // Submit
  const mapFincaRaizToBackend = (v: string | undefined) => {
    if (!v || v === "No") return "";
    if (v === "Si") return "Casa";
    if (v === "Otro") return "Otro";
    return String(v);
  };

  const onSubmit = (values: InfoPersonalFormValues) => {
    // ✅ construye referencias para backend:
    // - si referencia está vacía → se omite
    // - si tiene algo → debe estar completa y teléfono 10 dígitos
    const refs = (values.referencias ?? []).slice(0, 3).map(normalizaRef);

    const referenciasLimpias: Referencia[] = [];
    for (const r of refs) {
      if (!hasAnyRefValue(r)) continue; // vacía: ignorar

      // si tiene algo, debe estar completa
      if (!isCompleteRef(r)) {
        // esto normalmente ya lo frena el UI con rules, pero lo dejamos por seguridad
        console.error("Referencia incompleta:", r);
        return; // corta submit
      }

      // teléfono 10 dígitos
      if (!isPhone10(r.telefono)) {
        console.error("Teléfono referencia inválido (debe ser 10 dígitos):", r.telefono);
        return; // corta submit
      }

      referenciasLimpias.push(r);
    }

    const informacion_personal = {
      codigo_credito: values.codigo_credito ?? String(id),
      numero_documento: values.numero_documento.trim(),
      tipo_documento: values.tipo_documento.trim(),
      fecha_expedicion: values.fecha_expedicion,
      lugar_expedicion: values.lugar_expedicion,
      primer_nombre: values.primer_nombre.trim(),
      segundo_nombre: (values.segundo_nombre ?? "").trim(),
      primer_apellido: values.primer_apellido.trim(),
      segundo_apellido: (values.segundo_apellido ?? "").trim(),
      fecha_nacimiento: values.fecha_nacimiento,
      nivel_estudios: values.nivel_estudios,
      ciudad_residencia: values.ciudad_residencia,
      barrio_residencia: (values.barrio_residencia ?? "").trim(),
      direccion_residencia: values.direccion_residencia.trim(),
      telefono_fijo: (values.telefono_fijo ?? "").trim(),
      celular: values.celular.trim(),
      email: values.email.trim(),
      estado_civil: values.estado_civil,
      personas_a_cargo: toNumber(values.personas_a_cargo),
      tipo_vivienda: values.tipo_vivienda,
      costo_arriendo: pesosStrToCentsNumber(values.costo_arriendo),
      finca_raiz: mapFincaRaizToBackend(values.finca_raiz as string),
    };

    const informacion_laboral = {
      empresa: values.informacion_laboral?.empresa?.trim() || "",
      direccion_empleador: values.informacion_laboral?.direccion_empleador?.trim() || "",
      telefono_empleador: values.informacion_laboral?.telefono_empleador?.trim() || "",
      cargo: values.informacion_laboral?.cargo?.trim() || "",
      tipo_contrato: values.informacion_laboral?.tipo_contrato?.trim() || null,
      salario: pesosStrToCentsNumber(values.informacion_laboral?.salario),
      tiempo_servicio: values.informacion_laboral?.tiempo_servicio?.trim() || "",
    };

    const vehiculo = {
      placa: values.vehiculo?.placa?.trim() || "",
      marca: values.vehiculo?.marca?.trim() || "",
      modelo: values.vehiculo?.modelo?.trim() || "",
      tipo: values.vehiculo?.tipo?.trim() || "",
      numero_motor: values.vehiculo?.numero_motor?.trim() || "",
    };

    const onOk = () => {
      next();
    };
    const onFail = (err: any) => {
      console.error("Error guardando información personal:", err);
    };

    const existingId =
      (data as any)?.informacion_personal?.codigo_credito ?? (data as any)?.data?.informacion_personal?.codigo_credito ?? null;

    if (existingId) {
      const payload = { informacion_personal, informacion_laboral, vehiculo, referencias: referenciasLimpias };
      actualizarDeudor.mutate({ id: existingId, payload }, { onSuccess: onOk, onError: onFail });
    } else {
      const payload = { ...informacion_personal, informacion_laboral, vehiculo, referencias: referenciasLimpias };
      registrarDeudor.mutate(payload as any, { onSuccess: onOk, onError: onFail });
    }
  };

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";

  const setDirFromEvent = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    navDirRef.current = e.shiftKey ? "prev" : "next";
  };

  const { data: cotizacion } = useCotizacionByCodigoCredito(id);

  console.log("Datos de cotización obtenidos:", cotizacion);

  // Precargar desde la COTIZACIÓN si NO hay datos de deudor
  const prefilledFromCotRef = React.useRef(false);

  React.useEffect(() => {
    if (prefilledFromCotRef.current) return;
    if (!cotizacion?.success) return;

    const hasDeudor =
      Boolean((data as any)?.informacion_personal?.codigo_credito) ||
      Boolean((data as any)?.data?.informacion_personal?.codigo_credito);

    if (hasDeudor) return;

    const c = (cotizacion as any)?.cotizacion ?? {};

    const mapped: Partial<InfoPersonalFormValues> = {
      codigo_credito: String(id),
      numero_documento: c.cedula ?? "",
      primer_nombre: c.name ?? "",
      segundo_nombre: c.s_name ?? "",
      primer_apellido: c.last_name ?? "",
      segundo_apellido: c.s_last_name ?? "",
      celular: c.celular ?? "",
      email: c.email ?? "",
      fecha_nacimiento: (c.fecha_nacimiento ?? "").slice(0, 10),
    };

    const current = getValues();
    const merged = { ...current, ...mapped };

    reset(merged, { keepDirty: false, keepTouched: false });

    prefilledFromCotRef.current = true;
  }, [cotizacion, data, id, getValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ================== DATOS PERSONALES ================== */}
      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Información Personal</div>
        </div>

        <div className={grid}>
          <FormInput
            name="numero_documento"
            className="mt-6"
            label="Número de documento*"
            control={control}
            placeholder="1144102233"
            rules={{
              required: "Requerido",
              pattern: { value: /^[0-9]+$/, message: "Solo se permiten números" },
              minLength: { value: 5, message: "Mínimo 5 dígitos" },
              maxLength: { value: 15, message: "Máximo 15 dígitos" },
            }}
          />

          <FormSelect
            name="tipo_documento"
            label="Tipo de documento*"
            control={control}
            options={tipoDocumentoOptions}
            rules={{ required: "Requerido" }}
          />

          <FormInput
            name="fecha_expedicion"
            className="mt-6"
            label="Fecha de expedición*"
            type="date"
            control={control}
            rules={{ required: "Requerido", validate: dateNotTodayOrFuture }}
          />

          <FormInput
            name="lugar_expedicion"
            label="Lugar de expedición*"
            control={control}
            placeholder="Ej. Pitalito (Huila)"
            rules={{
              required: "Requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              pattern: { value: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{2,}$/, message: "Solo letras y espacios" },
            }}
          />

          <FormInput
            name="primer_nombre"
            label="Primer nombre*"
            control={control}
            rules={{ required: "Requerido", minLength: { value: 2, message: "Mínimo 2 caracteres" } }}
          />
          <FormInput name="segundo_nombre" label="Segundo nombre" control={control} />

          <FormInput name="primer_apellido" label="Primer apellido*" control={control} rules={{ required: "Requerido" }} />
          <FormInput name="segundo_apellido" label="Segundo apellido" control={control} />

          <FormInput
            name="fecha_nacimiento"
            label="Fecha de nacimiento*"
            type="date"
            control={control}
            rules={{ required: "Requerido", validate: dateNotTodayOrFuture }}
          />

          <FormSelect
            name="nivel_estudios"
            label="Nivel de estudios*"
            control={control}
            options={nivelEstudiosOptions}
            rules={{ required: "Requerido" }}
          />

          <FormInput
            name="ciudad_residencia"
            className="mt-6"
            label="Ciudad de residencia*"
            control={control}
            placeholder="Ej. Pitalito"
            rules={{
              required: "Requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              pattern: { value: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{2,}$/, message: "Solo letras y espacios" },
            }}
          />

          <FormInput name="barrio_residencia" className="mt-6" label="Barrio de residencia" control={control} />

          <FormInput name="direccion_residencia" label="Dirección de residencia*" control={control} rules={{ required: "Requerido" }} />

          <FormInput
            name="celular"
            label="Número de celular*"
            control={control}
            placeholder="3XXXXXXXXX"
            rules={{
              required: "Requerido",
              pattern: { value: /^[0-9]{10}$/, message: "Debe tener exactamente 10 dígitos" },
            }}
          />

          <FormInput
            name="telefono_fijo"
            label="Número tel. fijo"
            control={control}
            rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }}
          />

          <FormInput
            name="email"
            className="mt-6"
            label="Email*"
            control={control}
            rules={{
              required: "Requerido",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
            }}
          />

          <FormSelect
            name="estado_civil"
            label="Estado civil*"
            control={control}
            options={estadoCivilOptions}
            rules={{ required: "Requerido" }}
          />

          <FormInput
            name="personas_a_cargo"
            className="mt-6"
            label="Personas a cargo*"
            type="number"
            control={control}
            rules={{
              required: "Requerido",
              validate: (v) => Number(v) >= 0 || "Debe ser >= 0",
            }}
          />

          <FormSelect
            name="tipo_vivienda"
            label="Tipo de vivienda*"
            control={control}
            options={tipoViviendaOptions}
            rules={{ required: "Requerido" }}
          />

          <FormInput
            name="costo_arriendo"
            className="mt-6"
            label="Costo del arriendo (COP)"
            type="number"
            control={control}
            placeholder="0"
            formatThousands
            rules={{
              validate: (v) => {
                if (watch("tipo_vivienda") !== "Arriendo") return true;
                const n = toNumber(v);
                if (!n) return "Indique un valor";
                return n > 0 || "Indique un valor mayor a 0";
              },
            }}
          />

          <FormSelect
            name="finca_raiz"
            label="Finca raíz*"
            control={control}
            options={fincaRaizOptions}
          />
        </div>
      </section>

      {/* ================== INFORMACIÓN LABORAL ================== */}
      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Información laboral</div>
        </div>

        <div className={grid}>
          <FormInput name="informacion_laboral.empresa" label="Empresa donde labora" control={control} />
          <FormInput name="informacion_laboral.direccion_empleador" label="Dirección empleador" control={control} />
          <FormInput
            name="informacion_laboral.telefono_empleador"
            label="Teléfono del empleador"
            control={control}
            rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }}
          />

          <FormInput name="informacion_laboral.cargo" className="mt-6" label="Cargo" control={control} />
          <FormSelect name="informacion_laboral.tipo_contrato" label="Tipo de contrato" control={control} options={tipoContratoOptions} />

          <FormInput
            name="informacion_laboral.salario"
            className="mt-6"
            label="Salario (COP)"
            type="number"
            control={control}
            formatThousands
            rules={{ validate: (v) => toNumber(v) >= 0 || "Debe ser >= 0" }}
          />

          <FormInput name="informacion_laboral.tiempo_servicio" label="Tiempo de servicio" control={control} placeholder="Ej. 5 años" />
        </div>
      </section>

      {/* ================== VEHÍCULO ================== */}
      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Vehículo</div>
        </div>

        <div className={grid}>
          <FormInput name="vehiculo.placa" label="Placa" control={control} />
          <FormInput name="vehiculo.marca" label="Marca" control={control} />
          <FormInput name="vehiculo.modelo" label="Modelo" control={control} />
          <FormSelect name="vehiculo.tipo" label="Tipo" control={control} options={vehiculoTipoOptions} />
          <FormInput name="vehiculo.numero_motor" className="mt-6" label="Número de motor" control={control} />
        </div>
      </section>

      {/* ================== REFERENCIAS ================== */}
      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Referencia 1</div>
        </div>

        <div className={grid}>
          <FormInput
            name="referencias.0.nombre_completo"
            className="mt-6"
            label="Nombre completo"
            control={control}
            rules={{ validate: refFieldRule(0, "nombre_completo", getValues) }}
          />
          <FormSelect
            name="referencias.0.tipo_referencia"
            label="Tipo de referencia"
            control={control}
            options={tipoReferenciaOptions}
            rules={{ validate: refFieldRule(0, "tipo_referencia", getValues) }}
          />
          <FormInput
            name="referencias.0.direccion"
            className="mt-6"
            label="Dirección"
            control={control}
            rules={{ validate: refFieldRule(0, "direccion", getValues) }}
          />
          <FormInput
            name="referencias.0.telefono"
            label="Número telefónico"
            control={control}
            rules={{ validate: refFieldRule(0, "telefono", getValues) }}
          />
        </div>
      </section>

      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Referencia 2</div>
        </div>

        <div className={grid}>
          <FormInput
            name="referencias.1.nombre_completo"
            className="mt-6"
            label="Nombre completo"
            control={control}
            rules={{ validate: refFieldRule(1, "nombre_completo", getValues) }}
          />
          <FormSelect
            name="referencias.1.tipo_referencia"
            label="Tipo de referencia"
            control={control}
            options={tipoReferenciaOptions}
            rules={{ validate: refFieldRule(1, "tipo_referencia", getValues) }}
          />
          <FormInput
            className="mt-6"
            name="referencias.1.direccion"
            label="Dirección"
            control={control}
            rules={{ validate: refFieldRule(1, "direccion", getValues) }}
          />
          <FormInput
            name="referencias.1.telefono"
            label="Número telefónico"
            control={control}
            rules={{ validate: refFieldRule(1, "telefono", getValues) }}
          />
        </div>
      </section>

      <section>
        <div className="divider divider-start divider-success">
          <div className="badge text-xl badge-success text-white mb-3">Deudor - Referencia 3</div>
        </div>

        <div className={grid}>
          <FormInput
            name="referencias.2.nombre_completo"
            className="mt-6"
            label="Nombre completo"
            control={control}
            rules={{ validate: refFieldRule(2, "nombre_completo", getValues) }}
          />
          <FormSelect
            name="referencias.2.tipo_referencia"
            label="Tipo de referencia"
            control={control}
            options={tipoReferenciaOptions}
            rules={{ validate: refFieldRule(2, "tipo_referencia", getValues) }}
          />
          <FormInput
            name="referencias.2.direccion"
            className="mt-6"
            label="Dirección"
            control={control}
            rules={{ validate: refFieldRule(2, "direccion", getValues) }}
          />
          <FormInput
            name="referencias.2.telefono"
            label="Número telefónico"
            control={control}
            rules={{ validate: refFieldRule(2, "telefono", getValues) }}
          />
        </div>
      </section>

      <div className="flex justify-between gap-2">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={prev}
          disabled={isFirst}
          title={isFirst ? "Ya estás en el primer paso" : "Ir al paso anterior"}
        >
          ← Anterior
        </button>

        {!((data as any)?.informacion_personal?.codigo_credito || (data as any)?.data?.informacion_personal?.codigo_credito) && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() =>
              reset({
                codigo_credito: String(id),
                numero_documento: "",
                tipo_documento: "Cédula de ciudadanía",
                fecha_expedicion: "",
                lugar_expedicion: "",
                primer_nombre: "",
                segundo_nombre: "",
                primer_apellido: "",
                segundo_apellido: "",
                fecha_nacimiento: "",
                nivel_estudios: "",
                ciudad_residencia: "",
                barrio_residencia: "",
                direccion_residencia: "",
                telefono_fijo: "",
                celular: "",
                email: "",
                estado_civil: "",
                personas_a_cargo: 0,
                tipo_vivienda: "",
                costo_arriendo: "",
                finca_raiz: "No",
                informacion_laboral: {
                  empresa: "",
                  direccion_empleador: "",
                  telefono_empleador: "",
                  cargo: "",
                  tipo_contrato: "",
                  salario: 0,
                  tiempo_servicio: "",
                },
                vehiculo: {
                  placa: "",
                  marca: "",
                  modelo: "",
                  tipo: "",
                  numero_motor: "",
                },
                referencias: [
                  { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
                  { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
                  { nombre_completo: "", tipo_referencia: "", direccion: "", telefono: "" },
                ],
              })
            }
          >
            Limpiar
          </button>
        )}

        <button
          className="btn btn-warning"
          type="submit"
          onMouseDown={setDirFromEvent}
          onKeyDown={(e) => {
            if (e.key === "Enter") setDirFromEvent(e);
          }}
          title="Click para Guardar y Avanzar. Shift+Click para Guardar y Retroceder."
        >
          {(data as any)?.informacion_personal?.codigo_credito || (data as any)?.data?.informacion_personal?.codigo_credito
            ? "Actualizar"
            : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default InfoPersonalFormulario;
