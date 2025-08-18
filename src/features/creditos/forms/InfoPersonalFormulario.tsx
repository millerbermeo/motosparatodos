// src/components/solicitudes/InfoPersonalFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";

type InfoPersonalFormValues = {
    // Persona
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
    poseeFincaRaiz: "Si" | "No" | "Otro";
    // Laboral
    empresaLabora?: string;
    direccionEmpleador?: string;
    telEmpleador?: string;
    cargo?: string;
    tipoContrato?: string;
    salario?: number | string;
    tiempoServicio?: string;
    // Vehículo (opcional)
    vehPlaca?: string;
    vehMarca?: string;
    vehModelo?: string;
    vehTipo?: string;
    vehNumMotor?: string;
    // Referencias
    ref1Nombre?: string;
    ref1Tipo?: string;
    ref1Direccion?: string;
    ref1Telefono?: string;

    ref2Nombre?: string;
    ref2Tipo?: string;
    ref2Direccion?: string;
    ref2Telefono?: string;

    ref3Nombre?: string;
    ref3Tipo?: string;
    ref3Direccion?: string;
    ref3Telefono?: string;
};

const tipoDocumentoOptions: SelectOption[] = [
    { value: "CC", label: "Cédula de ciudadanía" },
    { value: "CE", label: "Cédula de extranjería" },
    { value: "TI", label: "Tarjeta de identidad" },
    { value: "PA", label: "Pasaporte" },
];

const nivelEstudiosOptions: SelectOption[] = [
    { value: "Primaria", label: "Primaria" },
    { value: "Secundaria", label: "Educación media" },
    { value: "Tecnico", label: "Técnico / Tecnólogo" },
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

const siNoOtroOptions: SelectOption[] = [
    { value: "No", label: "No" },
    { value: "Si", label: "Sí" },
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

const InfoPersonalFormulario: React.FC = () => {
    const { control, handleSubmit, watch, setValue } = useForm<InfoPersonalFormValues>({
        mode: "onBlur",
        defaultValues: {
            tipoDocumento: "CC",
            nivelEstudios: "",
            estadoCivil: "",
            tipoVivienda: "",
            poseeFincaRaiz: "No",
            personasACargo: 0,
            costoArriendo: 0,
            salario: 0,
        },
    });

    // si tipoVivienda !== Arriendo => costoArriendo = 0
    const tipoVivienda = watch("tipoVivienda");
    React.useEffect(() => {
        if (tipoVivienda !== "Arriendo") setValue("costoArriendo", 0);
    }, [tipoVivienda, setValue]);

    const onSubmit = (values: InfoPersonalFormValues) => {
        // Normalizaciones simples
        const payload = {
            ...values,
            personasACargo: Number(values.personasACargo) || 0,
            costoArriendo: Number(values.costoArriendo) || 0,
            salario: Number(values.salario) || 0,
        };
        console.log("InfoPersonal payload:", payload);
        // aquí harías create/update según tu flujo (mutations, etc.)
    };

    const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ================== DATOS PERSONALES ================== */}
            <section>

                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Información Personal
                </div>

                <div className={grid}>
                    <FormInput
                        name="numDocumento"
                        label="Número de documento*"
                        control={control}
                        rules={{ required: "Requerido" }}
                        placeholder="1144102233"
                    />
                    <FormSelect
                        name="tipoDocumento"
                        label="Tipo de documento*"
                        control={control}
                        options={tipoDocumentoOptions}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput
                        name="fechaExpedicion"
                        label="Fecha de expedición*"
                        type="date"
                        control={control}
                        rules={{ required: "Requerido" }}
                    />

                    <FormSelect
                        name="lugarExpedicion"
                        label="Lugar de expedición*"
                        control={control}
                        options={ciudadesEjemplo}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput
                        name="primerNombre"
                        label="Primer nombre*"
                        control={control}
                        rules={{ required: "Requerido", minLength: { value: 2, message: "Mínimo 2 caracteres" } }}
                    />
                    <FormInput name="segundoNombre" label="Segundo nombre" control={control} />

                    <FormInput
                        name="primerApellido"
                        label="Primer apellido*"
                        control={control}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput name="segundoApellido" label="Segundo apellido" control={control} />
                    <FormInput
                        name="fechaNacimiento"
                        label="Fecha de nacimiento*"
                        type="date"
                        control={control}
                        rules={{ required: "Requerido" }}
                    />

                    <FormSelect
                        name="nivelEstudios"
                        label="Nivel de estudios*"
                        control={control}
                        options={nivelEstudiosOptions}
                        rules={{ required: "Requerido" }}
                    />
                    <FormSelect
                        name="ciudadResidencia"
                        label="Ciudad de residencia*"
                        control={control}
                        options={ciudadesEjemplo}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput name="barrioResidencia" label="Barrio de residencia" control={control} />

                    <FormInput
                        name="direccionResidencia"
                        label="Dirección de residencia*"
                        control={control}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput
                        name="celular"
                        label="Número de celular*"
                        control={control}
                        placeholder="3XXXXXXXXX"
                        rules={{
                            required: "Requerido",
                            pattern: { value: /^[0-9]{7,10}$/, message: "Solo dígitos (7-10)" },
                        }}
                    />
                    <FormInput
                        name="telFijo"
                        label="Número tel. fijo"
                        control={control}
                        rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }}
                    />

                    <FormInput
                        name="email"
                        label="Email*"
                        control={control}
                        rules={{
                            required: "Requerido",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
                        }}
                    />
                    <FormSelect
                        name="estadoCivil"
                        label="Estado civil*"
                        control={control}
                        options={estadoCivilOptions}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput
                        name="personasACargo"
                        label="Personas a cargo*"
                        type="number"
                        control={control}
                        rules={{
                            required: "Requerido",
                            validate: (v) => Number(v) >= 0 || "Debe ser >= 0",
                        }}
                    />

                    <FormSelect
                        name="tipoVivienda"
                        label="Tipo de vivienda*"
                        control={control}
                        options={tipoViviendaOptions}
                        rules={{ required: "Requerido" }}
                    />
                    <FormInput
                        name="costoArriendo"
                        label="Costo del arriendo (COP)"
                        type="number"
                        control={control}
                        placeholder="0"
                        rules={{
                            validate: (v) =>
                                tipoVivienda !== "Arriendo" || Number(v) > 0 || "Indique un valor mayor a 0",
                        }}
                    />
                    <FormSelect
                        name="poseeFincaRaiz"
                        label="Finca raíz*"
                        control={control}
                        options={siNoOtroOptions}
                        rules={{ required: "Requerido" }}
                    />
                </div>
            </section>

            {/* ================== INFORMACIÓN LABORAL ================== */}
            <section>

                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Información laboral
                </div>

                <div className={grid}>
                    <FormInput name="empresaLabora" label="Empresa donde labora" control={control} />
                    <FormInput name="direccionEmpleador" label="Dirección empleador" control={control} />
                    <FormInput
                        name="telEmpleador"
                        label="Teléfono del empleador"
                        control={control}
                        rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }}
                    />

                    <FormInput name="cargo" label="Cargo" control={control} />
                    <FormSelect
                        name="tipoContrato"
                        label="Tipo de contrato"
                        control={control}
                        options={tipoContratoOptions}
                    />
                    <FormInput
                        name="salario"
                        label="Salario (COP)"
                        type="number"
                        control={control}
                        rules={{ validate: (v) => Number(v) >= 0 || "Debe ser >= 0" }}
                    />

                    <FormInput
                        name="tiempoServicio"
                        label="Tiempo de servicio"
                        control={control}
                        placeholder="Ej. 2 años"
                    />
                </div>
            </section>

            {/* ================== VEHÍCULO ================== */}
            <section>
                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Vehículo
                </div>

                <div className={grid}>
                    <FormInput name="vehPlaca" label="Placa" control={control} />
                    <FormInput name="vehMarca" label="Marca" control={control} />
                    <FormInput name="vehModelo" label="Modelo" control={control} />
                    <FormSelect name="vehTipo" label="Tipo" control={control} options={vehiculoTipoOptions} />
                    <FormInput name="vehNumMotor" label="Número de motor" control={control} />
                </div>
            </section>

            {/* ================== REFERENCIAS ================== */}
            <section>
                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Referencia 1
                </div>

                <div className={grid}>
                    <FormInput name="ref1Nombre" label="Nombre completo" control={control} />
                    <FormSelect name="ref1Tipo" label="Tipo de referencia" control={control} options={tipoReferenciaOptions} />
                    <FormInput name="ref1Direccion" label="Dirección" control={control} />
                    <FormInput name="ref1Telefono" label="Número telefónico" control={control}
                        rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
                </div>
            </section>

            <section>
                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Referencia 2
                </div>


                <div className={grid}>
                    <FormInput name="ref2Nombre" label="Nombre completo" control={control} />
                    <FormSelect name="ref2Tipo" label="Tipo de referencia" control={control} options={tipoReferenciaOptions} />
                    <FormInput name="ref2Direccion" label="Dirección" control={control} />
                    <FormInput name="ref2Telefono" label="Número telefónico" control={control}
                        rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
                </div>
            </section>

            <section>
                <div className="badge text-xl badge-success text-white  mb-3">
                    Deudor - Referencia 3
                </div>
                <div className={grid}>
                    <FormInput name="ref3Nombre" label="Nombre completo" control={control} />
                    <FormSelect name="ref3Tipo" label="Tipo de referencia" control={control} options={tipoReferenciaOptions} />
                    <FormInput name="ref3Direccion" label="Dirección" control={control} />
                    <FormInput name="ref3Telefono" label="Número telefónico" control={control}
                        rules={{ pattern: { value: /^[0-9]*$/, message: "Solo dígitos" } }} />
                </div>
            </section>

            <div className="flex justify-end gap-2">
                <button className="btn btn-ghost" type="reset">Limpiar</button>
                <button className="btn btn-primary" type="submit">Guardar</button>
            </div>
        </form>
    );
};

export default InfoPersonalFormulario;
