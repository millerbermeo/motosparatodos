// src/components/solicitudes/CoodeudoresFormulario.tsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";

type Coodeudor = {
    // personales
    numDocumento: string;
    tipoDocumento: string;
    fechaExpedicion: string;
    lugarExpedicion: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    fechaNacimiento: string;
    nivelEstudios: string;
    ciudadResidencia: string;
    barrioResidencia?: string;
    direccionResidencia: string;
    celular: string;
    telFijo?: string;
    email: string;
    estadoCivil: string;
    personasACargo: number | string;
    tipoVivienda: string;
    costoArriendo?: number | string;
    fincaRaiz: "No" | "Casa" | "Apartamento" | "Lote" | "Otro";
    // laboral
    empresaLabora?: string;
    direccionEmpleador?: string;
    telEmpleador?: string;
    cargo?: string;
    tipoContrato?: string;
    salario?: number | string;
    tiempoServicio?: string; // meses o texto
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

// ---------- opciones para selects (ejemplos) ----------
const tipoDocumentoOptions: SelectOption[] = [
    { value: "CC", label: "Cédula de ciudadanía" },
    { value: "CE", label: "Cédula de extranjería" },
    { value: "TI", label: "Tarjeta de identidad" },
    { value: "PA", label: "Pasaporte" },
];
const nivelEstudiosOptions: SelectOption[] = [
    { value: "Sin estudios", label: "Sin estudios" },
    { value: "Secundaria", label: "Educación media" },
    { value: "Tecnico", label: "Técnico/Tecnólogo" },
    { value: "Universitario", label: "Universitario" },
    { value: "Postgrado", label: "Postgrado" },
];
const estadoCivilOptions: SelectOption[] = [
    { value: "Soltero/a", label: "Soltero/a" },
    { value: "Casado/a", label: "Casado/a" },
    { value: "Union libre", label: "Unión libre" },
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
    { value: "Indefinido", label: "Indefinido" },
    { value: "Fijo", label: "Término fijo" },
    { value: "Obra", label: "Obra o labor" },
    { value: "Prestacion", label: "Prestación de servicios" },
];
const vehiculoTipoOptions: SelectOption[] = [
    { value: "Motocicleta", label: "Motocicleta" },
    { value: "Automovil", label: "Automóvil" },
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

// ---------- utils ----------
const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";

const emptyCoodeudor: Coodeudor = {
    numDocumento: "", tipoDocumento: "CC", fechaExpedicion: "", lugarExpedicion: "",
    primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "",
    fechaNacimiento: "", nivelEstudios: "Sin estudios", ciudadResidencia: "",
    barrioResidencia: "", direccionResidencia: "", celular: "", telFijo: "",
    email: "", estadoCivil: "Soltero/a", personasACargo: 0, tipoVivienda: "Propia",
    costoArriendo: 0, fincaRaiz: "No",
    empresaLabora: "", direccionEmpleador: "", telEmpleador: "", cargo: "",
    tipoContrato: "", salario: 0, tiempoServicio: "",
    vehPlaca: "", vehMarca: "", vehModelo: "", vehTipo: "", vehNumMotor: "",
    ref1Nombre: "", ref1Tipo: "Familiar", ref1Direccion: "", ref1Telefono: "",
    ref2Nombre: "", ref2Tipo: "Familiar", ref2Direccion: "", ref2Telefono: "",
    ref3Nombre: "", ref3Tipo: "Familiar", ref3Direccion: "", ref3Telefono: "",
};

const CoodeudoresFormulario: React.FC = () => {
    const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
        mode: "onBlur",
        defaultValues: { codeudores: [emptyCoodeudor] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "codeudores" });

    // Si el tipo de vivienda cambia a distinto de "Arriendo", costoArriendo = 0
    const tipoVivienda0 = watch(`codeudores.0.tipoVivienda`);
    React.useEffect(() => {
        if (tipoVivienda0 !== "Arriendo") setValue(`codeudores.0.costoArriendo`, 0);
    }, [tipoVivienda0, setValue]);

    const tipoVivienda1 = watch(`codeudores.1.tipoVivienda`);
    React.useEffect(() => {
        if (tipoVivienda1 !== "Arriendo") setValue(`codeudores.1.costoArriendo`, 0);
    }, [tipoVivienda1, setValue]);

    const addSecond = () => {
        if (fields.length < 2) append({ ...emptyCoodeudor });
    };
    const removeSecond = () => {
        if (fields.length === 2) remove(1);
    };

    const onSubmit = (values: FormValues) => {
        const normalized = values.codeudores.map((c) => ({
            ...c,
            personasACargo: Number(c.personasACargo) || 0,
            costoArriendo: Number(c.costoArriendo) || 0,
            salario: Number(c.salario) || 0,
        }));
        console.log("Coodeudores payload:", normalized);
        // aquí puedes disparar tu mutation create/update
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {fields.map((field, idx) => (
                <div key={field.id} className="space-y-8 border border-base-300 rounded-xl p-4">



                    <div className="badge text-xl badge-success text-white  mb-3">
                        {`Codeudor ${idx + 1} - Información personal`}
                    </div>

                    {/* ======== PERSONALES ======== */}
                    <div className={grid}>
                        <FormInput control={control} name={`codeudores.${idx}.numDocumento`} label="Número de documento*" rules={{ required: "Requerido" }} placeholder="Ingrese número de documento" />
                        <FormSelect control={control} name={`codeudores.${idx}.tipoDocumento`} label="Tipo de documento*" options={tipoDocumentoOptions} rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.fechaExpedicion`} label="Fecha de expedición*" type="date" rules={{ required: "Requerido" }} />

                        <FormSelect control={control} name={`codeudores.${idx}.lugarExpedicion`} label="Lugar de expedición*" options={ciudadesEjemplo} rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.primerNombre`} label="Primer nombre*" rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.segundoNombre`} label="Segundo nombre" />

                        <FormInput control={control} name={`codeudores.${idx}.primerApellido`} label="Primer apellido*" rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.segundoApellido`} label="Segundo apellido" />
                        <FormInput control={control} name={`codeudores.${idx}.fechaNacimiento`} label="Fecha de nacimiento*" type="date" rules={{ required: "Requerido" }} />

                        <FormSelect control={control} name={`codeudores.${idx}.nivelEstudios`} label="Nivel de estudios*" options={nivelEstudiosOptions} rules={{ required: "Requerido" }} />
                        <FormSelect control={control} name={`codeudores.${idx}.ciudadResidencia`} label="Ciudad de residencia*" options={ciudadesEjemplo} rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.barrioResidencia`} label="Barrio de residencia" />

                        <FormInput control={control} name={`codeudores.${idx}.direccionResidencia`} label="Dirección de residencia*" rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.celular`} label="Número de celular*" placeholder="3XXXXXXXXX"
                            rules={{ required: "Requerido", pattern: { value: /^[0-9]{7,10}$/, message: "Solo dígitos (7-10)" } }} />
                        <FormInput control={control} name={`codeudores.${idx}.telFijo`} label="Número tel. fijo" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />

                        <FormInput control={control} name={`codeudores.${idx}.email`} label="Email*" rules={{ required: "Requerido", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }} />
                        <FormSelect control={control} name={`codeudores.${idx}.estadoCivil`} label="Estado civil*" options={estadoCivilOptions} rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.personasACargo`} label="Personas a cargo*" type="number" rules={{ required: "Requerido", validate: (v) => Number(v) >= 0 || "Debe ser >= 0" }} />

                        <FormSelect control={control} name={`codeudores.${idx}.tipoVivienda`} label="Tipo de vivienda*" options={tipoViviendaOptions} rules={{ required: "Requerido" }} />
                        <FormInput control={control} name={`codeudores.${idx}.costoArriendo`} label="Costo del arriendo (COP)" type="number"
                            rules={{ validate: (v) => (watch(`codeudores.${idx}.tipoVivienda`) !== "Arriendo") || Number(v) > 0 || "Indique un valor > 0" }} />
                        <FormSelect control={control} name={`codeudores.${idx}.fincaRaiz`} label="Finca raíz*" options={fincaRaizOptions} rules={{ required: "Requerido" }} />
                    </div>

                    {/* ======== LABORAL ======== */}
                    <div className="badge text-xl badge-success text-white  mb-3">
                        Codeudor {idx + 1} - Información laboral
                    </div>

                    <div className={grid}>
                        <FormInput control={control} name={`codeudores.${idx}.empresaLabora`} label="Empresa donde labora" />
                        <FormInput control={control} name={`codeudores.${idx}.direccionEmpleador`} label="Dirección empleador" />
                        <FormInput control={control} name={`codeudores.${idx}.telEmpleador`} label="Teléfono del empleador" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />

                        <FormInput control={control} name={`codeudores.${idx}.cargo`} label="Cargo" />
                        <FormSelect control={control} name={`codeudores.${idx}.tipoContrato`} label="Tipo de contrato" options={tipoContratoOptions} />
                        <FormInput control={control} name={`codeudores.${idx}.salario`} label="Salario (COP)" type="number" rules={{ validate: (v) => Number(v) >= 0 || "Debe ser >= 0" }} />

                        <FormInput control={control} name={`codeudores.${idx}.tiempoServicio`} label="Tiempo de servicio" placeholder="Ej. 24 meses" />
                    </div>

                    {/* ======== VEHÍCULO ======== */}

                    <div className="badge text-xl badge-success text-white  mb-3">
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

                    <div className="badge text-xl badge-success text-white  mb-3">
                        Codeudor {idx + 1} - Referencia 1
                    </div>
                    <div className={grid}>
                        <FormInput control={control} name={`codeudores.${idx}.ref1Nombre`} label="Nombre completo" />
                        <FormSelect control={control} name={`codeudores.${idx}.ref1Tipo`} label="Tipo de referencia" options={tipoReferenciaOptions} />
                        <FormInput control={control} name={`codeudores.${idx}.ref1Direccion`} label="Dirección" />
                        <FormInput control={control} name={`codeudores.${idx}.ref1Telefono`} label="Número telefónico" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
                    </div>

                    <div className="badge text-xl badge-success text-white  mb-3">
                        Codeudor {idx + 1} - Referencia 2
                    </div>

                    <div className={grid}>
                        <FormInput control={control} name={`codeudores.${idx}.ref2Nombre`} label="Nombre completo" />
                        <FormSelect control={control} name={`codeudores.${idx}.ref2Tipo`} label="Tipo de referencia" options={tipoReferenciaOptions} />
                        <FormInput control={control} name={`codeudores.${idx}.ref2Direccion`} label="Dirección" />
                        <FormInput control={control} name={`codeudores.${idx}.ref2Telefono`} label="Número telefónico" rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
                    </div>


                    <div className="badge text-xl badge-success text-white  mb-3">
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
                    <button type="reset" className="btn btn-ghost">Limpiar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </div>
        </form>
    );
};

export default CoodeudoresFormulario;
