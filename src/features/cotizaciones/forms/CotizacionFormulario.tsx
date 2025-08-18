import React from "react";
import { useForm } from "react-hook-form";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { FormInput } from "../../../shared/components/FormInput";
import { useCanales, useFinancieras, usePreguntas, useSeguros } from "../../../services/selectsServices";
import { useMarcas } from "../../../services/marcasServices";
import { useLineas } from "../../../services/lineasMarcasServices";

type MetodoPago = "contado" | "credibike" | "terceros";

type FormValues = {
    /* existentes */
    metodoPago: MetodoPago;
    canal: string;
    pregunta: string;
    categoria: string;
    financiera: string;
    cuotas: number | string;
    cedula: string;
    fecha_nac: string;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    celular: string;
    email: string;
    comentario: string;

    /* ——— motos comparadas ——— */
    incluirMoto1: boolean;
    incluirMoto2: boolean;

    marca1: string;
    linea1: string;
    garantia1: "si" | "no" | "";
    accesorios1: string;
    seguroId1: string;
    otroSeguro1: string;
    matricula1: string;       // Matrícula y SOAT
    descuento1: string;
    cuotaInicial1: string;

    marca2: string;
    linea2: string;
    garantia2: "si" | "no" | "";
    accesorios2: string;
    seguroId2: string;
    otroSeguro2: string;
    matricula2: string;       // Matrícula y SOAT
    descuento2: string;
    cuotaInicial2: string;
};

const CotizacionFormulario: React.FC = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormValues>({
        defaultValues: {
            metodoPago: "contado",
            canal: "",
            pregunta: "",
            categoria: "motos",
            financiera: "",
            cuotas: "",
            cedula: "",
            fecha_nac: "",
            primer_nombre: "",
            segundo_nombre: "",
            primer_apellido: "",
            segundo_apellido: "",
            celular: "",
            email: "",
            comentario: "",

            incluirMoto1: true,
            incluirMoto2: false,

            marca1: "",
            linea1: "",
            garantia1: "",
            accesorios1: "",
            seguroId1: "",
            otroSeguro1: "",
            matricula1: "",
            descuento1: "",
            cuotaInicial1: "",

            marca2: "",
            linea2: "",
            garantia2: "",
            accesorios2: "",
            seguroId2: "",
            otroSeguro2: "",
            matricula2: "",
            descuento2: "",
            cuotaInicial2: "",
        },
        mode: "onBlur",
    });

    const metodo = watch("metodoPago");
    const incluirMoto1 = watch("incluirMoto1");
    const incluirMoto2 = watch("incluirMoto2");

    /* selects globales */
    const { data: canales, isPending: loadingCanales } = useCanales();
    const { data: preguntas, isPending: loadingPregs } = usePreguntas();
    const { data: financieras, isPending: loadingFinancieras } = useFinancieras();

    const canalOptions: SelectOption[] = (canales ?? []).map((c: any) => ({ value: c, label: c }));
    const preguntaOptions: SelectOption[] = (preguntas ?? []).map((p: any) => ({ value: p, label: p }));
    const financieraOptions: SelectOption[] = (financieras ?? []).map((f: any) => ({ value: f, label: f }));

    /* marcas/lineas */
    const { data: marcas } = useMarcas();
    const { data: lineas } = useLineas();
    const marcaOptions: SelectOption[] = (marcas ?? []).map((m: any) => ({ value: m.marca, label: m.marca }));

    const selectedMarca1 = watch("marca1");
    const selectedMarca2 = watch("marca2");

    const lineasFiltradas1 = React.useMemo(() => {
        if (!lineas) return [];
        if (!selectedMarca1) return lineas;
        return lineas.filter((l: any) => l.marca === selectedMarca1);
    }, [lineas, selectedMarca1]);

    const lineasFiltradas2 = React.useMemo(() => {
        if (!lineas) return [];
        if (!selectedMarca2) return lineas;
        return lineas.filter((l: any) => l.marca === selectedMarca2);
    }, [lineas, selectedMarca2]);

    const lineaOptions1: SelectOption[] = lineasFiltradas1.map((l: any) => ({ value: l.linea, label: l.linea }));
    const lineaOptions2: SelectOption[] = lineasFiltradas2.map((l: any) => ({ value: l.linea, label: l.linea }));

    React.useEffect(() => { setValue("linea1", ""); }, [selectedMarca1, setValue]);
    React.useEffect(() => { setValue("linea2", ""); }, [selectedMarca2, setValue]);

    /* seguros (lista) */
    const { data: seguros = [], isPending: loadingSeguros } = useSeguros();

    /* limpieza cuando desmarcan una moto */
    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marca1", "");
            setValue("linea1", "");
            setValue("garantia1", "");
            setValue("accesorios1", "");
            setValue("seguroId1", "");
            setValue("otroSeguro1", "");
            setValue("matricula1", "");
            setValue("descuento1", "");
            setValue("cuotaInicial1", "");
        }
    }, [incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marca2", "");
            setValue("linea2", "");
            setValue("garantia2", "");
            setValue("accesorios2", "");
            setValue("seguroId2", "");
            setValue("otroSeguro2", "");
            setValue("matricula2", "");
            setValue("descuento2", "");
            setValue("cuotaInicial2", "");
        }
    }, [incluirMoto2, setValue]);

    /* lógica de método (como antes) */
    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("financiera", "");
            setValue("cuotas", "");
            setValue("categoria", "motos");
        } else if (metodo === "credibike") {
            setValue("financiera", "");
            setValue("cuotas", "");
        } else if (metodo === "terceros") {
            setValue("categoria", "");
        }
    }, [metodo, setValue]);

    /* helper: reglas condicionales por inclusión */
    const reqIf = (cond: boolean, msg: string) => ({
        validate: (v: any) => (!cond ? true : (v !== undefined && v !== null && String(v).trim().length > 0) || msg),
    });

    /* helpers numéricos */
    const N = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));
    const fmt = (n: number) => n.toLocaleString("es-CO") + " COP";
    const findSeguroValor = (id: string) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        return s ? Number(s.valor) : 0;
    };

    /* ===== cálculos MOTO 1 ===== */
    const segSel1 = watch("seguroId1");
    const otros1 = N(watch("otroSeguro1"));
    const accesorios1 = N(watch("accesorios1"));
    const matricula1 = N(watch("matricula1"));
    const descuento1 = N(watch("descuento1"));
    const inicial1 = N(watch("cuotaInicial1"));
    const totalSeguros1 = (incluirMoto1 ? findSeguroValor(segSel1) : 0) + (incluirMoto1 ? otros1 : 0);
    const totalSinSeguros1 = incluirMoto1 ? accesorios1 + matricula1 - descuento1 : 0;
    const totalConSeguros1 = totalSinSeguros1 + totalSeguros1;

    /* ===== cálculos MOTO 2 ===== */
    const segSel2 = watch("seguroId2");
    const otros2 = N(watch("otroSeguro2"));
    const accesorios2 = N(watch("accesorios2"));
    const matricula2 = N(watch("matricula2"));
    const descuento2 = N(watch("descuento2"));
    const inicial2 = N(watch("cuotaInicial2"));
    const totalSeguros2 = (incluirMoto2 ? findSeguroValor(segSel2) : 0) + (incluirMoto2 ? otros2 : 0);
    const totalSinSeguros2 = incluirMoto2 ? accesorios2 + matricula2 - descuento2 : 0;
    const totalConSeguros2 = totalSinSeguros2 + totalSeguros2;

    const onSubmit = (data: FormValues) => {
        console.log("SUBMIT:", data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-semibold">Método de pago</h2>

            {/* Radios manuales */}
            <div className="flex  gap-6  flex-col w-full bg-white p-3 rounded-xl">
                <div className="flex items-center justify-between gap-6 w-full">
                    <label className="label cursor-pointer gap-2 w-full">
                        <input type="radio" value="contado" className="radio radio-success" {...register("metodoPago", { required: true })} />
                        <span className="label-text">Contado</span>
                    </label>
                    <label className="label cursor-pointer gap-2 w-full">
                        <input type="radio" value="credibike" className="radio radio-success" {...register("metodoPago", { required: true })} />
                        <span className="label-text">Credibike de Colombia</span>
                    </label>
                    <label className="label cursor-pointer gap-2 w-full">
                        <input type="radio" value="terceros" className="radio radio-success" {...register("metodoPago", { required: true })} />
                        <span className="label-text">Crédito de terceros</span>
                    </label>
                </div>

                {errors.metodoPago && <p className="text-sm text-error">Selecciona una opción.</p>}

                {/* Bloque de selects/inputs (mismo layout y estilos) */}
                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
                    <FormSelect<FormValues>
                        name="canal"
                        label="Canal de contacto"
                        control={control}
                        options={canalOptions}
                        placeholder={loadingCanales ? "Cargando canales..." : "Seleccione un canal"}
                        disabled={loadingCanales}
                        rules={{ required: "El campo canal es obligatorio." }}
                    />
                    <FormSelect<FormValues>
                        name="pregunta"
                        label="Pregunta al cliente: ¿Para ti cuál de estas categorías describen mejor su relación con las motos?"
                        control={control}
                        options={preguntaOptions}
                        placeholder={loadingPregs ? "Cargando opciones..." : "Seleccione una opción"}
                        disabled={loadingPregs}
                        rules={{ required: "Este campo es obligatorio." }}
                    />

                    {metodo === "terceros" && (
                        <>
                            <FormSelect<FormValues>
                                name="financiera"
                                label="Financiera"
                                control={control}
                                options={financieraOptions}
                                placeholder={loadingFinancieras ? "Cargando financieras..." : "Seleccione..."}
                                disabled={loadingFinancieras}
                                rules={{ required: "La financiera es obligatoria." }}
                            />
                            <FormInput<FormValues>
                                name="cuotas"
                                label="Cantidad de cuotas"
                                type="number"
                                control={control}
                                placeholder="cuotas"
                                rules={{ required: "La cantidad de cuotas es obligatoria.", validate: (v) => Number(v) > 0 || "Debe ser > 0" }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Segundo grupo de radios (Categoría): SOLO 'credibike' */}
            {metodo === "credibike" && (
                <div className="flex gap-10 bg-white p-3 rounded-xl justify-center">
                    <label className="label cursor-pointer gap-2">
                        <input type="radio" value="motos" className="radio radio-primary" {...register("categoria", { required: true })} />
                        <span className="label-text">Motocicletas</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                        <input type="radio" value="otros" className="radio radio-primary" {...register("categoria", { required: true })} />
                        <span className="label-text">Otros productos</span>
                    </label>
                </div>
            )}
            {metodo === "credibike" && errors.categoria && <p className="text-sm text-error">Selecciona una categoría.</p>}

            {/* ================== DATOS DEL CLIENTE (SIEMPRE VISIBLES) ================== */}
            <div className="flex  gap-6 flex-col w-full bg-white p-3 rounded-xl">


                <div className="badge text-xl badge-success text-white">Datos Personales</div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput<FormValues> name="cedula" label="Cédula" control={control} placeholder="Número de documento"
                        rules={{ required: "La cédula es obligatoria.", pattern: { value: /^[0-9]{5,20}$/, message: "Solo números (5-20 dígitos)" } }} />
                    <FormInput<FormValues> name="fecha_nac" label="Fecha de nacimiento" type="date" control={control}
                        rules={{ required: "La fecha de nacimiento es obligatoria." }} />
                    <FormInput<FormValues> name="primer_nombre" label="Primer nombre" control={control}
                        rules={{ required: "El primer nombre es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_nombre" label="Segundo nombre" control={control} />
                    <FormInput<FormValues> name="primer_apellido" label="Primer apellido" control={control}
                        rules={{ required: "El primer apellido es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_apellido" label="Segundo apellido" control={control} />
                    <FormInput<FormValues> name="celular" label="Celular" control={control} placeholder="3001234567"
                        rules={{ required: "El celular es obligatorio.", pattern: { value: /^[0-9]{7,12}$/, message: "Solo números (7-12 dígitos)" } }} />
                    <FormInput<FormValues> name="email" label="Email" type="email" control={control} placeholder="correo@dominio.com"
                        rules={{ required: "El email es obligatorio.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }} />
                </div>

                <div className="badge text-xl badge-success text-white">Datos Motocicletas</div>


                {/* ========= COMPARADOR: MOTO 1 | MOTO 2 ========= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ======= MOTO 1 ======= */}
                    <div className="bg-white  rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="checkbox" {...register("incluirMoto1")} />
                            <span className="label-text font-semibold">Incluir Motocicleta 1</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormSelect<FormValues>
                                name="marca1" label="Marca" control={control}
                                options={marcaOptions} placeholder="Seleccione una marca"
                                disabled={!incluirMoto1} rules={reqIf(incluirMoto1, "La marca es obligatoria")}
                            />
                            <FormSelect<FormValues>
                                name="linea1" label="Línea" control={control}
                                options={lineaOptions1}
                                placeholder={selectedMarca1 ? "Seleccione una línea" : "Seleccione una marca primero"}
                                disabled={!incluirMoto1 || !selectedMarca1}
                                rules={reqIf(incluirMoto1, "La línea es obligatoria")}
                            />
                            <FormSelect<FormValues>
                                name="garantia1" label="Garantía extendida" control={control}
                                options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                                placeholder="Seleccione..." disabled={!incluirMoto1}
                                rules={reqIf(incluirMoto1, "Este campo es obligatorio")}
                            />
                            <FormInput<FormValues>
                                name="accesorios1" label="Accesorios / Marcadas / Personalizadas" control={control}
                                placeholder="0 COP" disabled={!incluirMoto1}
                                rules={reqIf(incluirMoto1, "Ingresa el valor de accesorios")}
                            />

                            {/* Seguros (lista de radios) */}
                            <div className="p-3 rounded-md bg-[#3498DB] text-white">
                                <p className="font-semibold mb-2">Elige los seguros de la cotización</p>
                                <div className="flex flex-col gap-2">
                                    {loadingSeguros && <span>Cargando seguros...</span>}
                                    {!loadingSeguros && seguros.map((s: any) => (
                                        <label key={`m1-${s.id}`} className="flex items-center gap-2">
                                            <input type="radio" value={String(s.id)} className="radio"
                                                {...register("seguroId1", reqIf(incluirMoto1, "Selecciona un seguro o ingresa 'Otros seguros'"))}
                                                disabled={!incluirMoto1} />
                                            <span>{s.nombre} - {s.tipo} - {Number(s.valor).toLocaleString("es-CO")} COP</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <FormInput<FormValues>
                                        name="otroSeguro1" label="Otros seguros" control={control}
                                        placeholder="0 COP" disabled={!incluirMoto1}
                                        // rules={{ validate: (v) => !incluirMoto1 ? true : (watch("seguroId1") || (v?.trim()?.length ?? 0) > 0) || "Selecciona un seguro o ingresa el valor de 'Otros seguros'" }}
                                    />
                                </div>
                            </div>

                            {/* Cuota inicial + partidas para cálculo */}
                            <FormInput<FormValues> name="cuotaInicial1" label="Cuota inicial" control={control} type="number" placeholder="0 COP"
                                rules={reqIf(incluirMoto1, "Ingresa la cuota inicial")} disabled={!incluirMoto1} />
                            <FormInput<FormValues> name="matricula1" label="Matrícula y SOAT" control={control} type="number" placeholder="0 COP" disabled={!incluirMoto1} />
                            <FormInput<FormValues> name="descuento1" label="Descuentos" control={control} type="number" placeholder="0 COP" disabled={!incluirMoto1} />

                            {/* Resumen (versión mejorada #1) */}
                            <div className="bg-base-100 shadow-lg rounded-xl p-6 border border-base-300">
                                {/* Encabezado */}
                                <h3 className="text-lg font-bold mb-4 text-success flex items-center gap-2">
                                    <span className="inline-flex w-2 h-2 rounded-full bg-success"></span>
                                    Resumen de costos
                                </h3>

                                {/* Valor total seguros */}
                                <div className="flex justify-between items-center bg-success/10 text-success px-4 py-2 rounded-lg mb-4">
                                    <span className="font-semibold">Valor total de seguros:</span>
                                    <span className="font-bold">{fmt(totalSeguros1)}</span>
                                </div>

                                {/* Detalles */}
                                <div className="grid grid-cols-1 gap-2 mb-4">
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Matrícula y SOAT:</span>
                                        <span>{fmt(matricula1)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Descuentos:</span>
                                        <span className="text-error font-semibold">-{fmt(descuento1)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Accesorios / Marcadas / Personalizadas:</span>
                                        <span>{fmt(accesorios1)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Inicial:</span>
                                        <span>{fmt(inicial1)}</span>
                                    </div>
                                </div>

                                {/* Totales */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-warning/10 px-4 py-2 rounded-md">
                                        <span className="font-semibold text-warning">TOTAL SIN SEGUROS:</span>
                                        <span className="font-bold">{fmt(totalSinSeguros1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-success/20 px-4 py-2 rounded-md">
                                        <span className="font-bold text-success">TOTAL CON SEGUROS:</span>
                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros1)}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ======= MOTO 2 ======= */}
                    <div className="bg-white rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="checkbox" {...register("incluirMoto2")} />
                            <span className="label-text font-semibold">Incluir Motocicleta 2</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormSelect<FormValues>
                                name="marca2" label="Marca" control={control}
                                options={marcaOptions} placeholder="Seleccione una marca"
                                disabled={!incluirMoto2} rules={reqIf(incluirMoto2, "La marca es obligatoria")}
                            />
                            <FormSelect<FormValues>
                                name="linea2" label="Línea" control={control}
                                options={lineaOptions2}
                                placeholder={selectedMarca2 ? "Seleccione una línea" : "Seleccione una marca primero"}
                                disabled={!incluirMoto2 || !selectedMarca2}
                                rules={reqIf(incluirMoto2, "La línea es obligatoria")}
                            />
                            <FormSelect<FormValues>
                                name="garantia2" label="Garantía extendida" control={control}
                                options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                                placeholder="Seleccione..." disabled={!incluirMoto2}
                                rules={reqIf(incluirMoto2, "Este campo es obligatorio")}
                            />
                            <FormInput<FormValues>
                                name="accesorios2" label="Accesorios / Marcadas / Personalizadas" control={control}
                                placeholder="0 COP" disabled={!incluirMoto2}
                                rules={reqIf(incluirMoto2, "Ingresa el valor de accesorios")}
                            />

                            {/* Seguros (lista de radios) */}
                            <div className="p-3 rounded-md bg-[#3498DB] text-white">
                                <p className="font-semibold mb-2">Elige los seguros de la cotización</p>
                                <div className="flex flex-col gap-2">
                                    {loadingSeguros && <span>Cargando seguros...</span>}
                                    {!loadingSeguros && seguros.map((s: any) => (
                                        <label key={`m2-${s.id}`} className="flex items-center gap-2">
                                            <input type="radio" value={String(s.id)} className="radio"
                                                {...register("seguroId2", reqIf(incluirMoto2, "Selecciona un seguro o ingresa 'Otros seguros'"))}
                                                disabled={!incluirMoto2} />
                                            <span>{s.nombre} - {s.tipo} - {Number(s.valor).toLocaleString("es-CO")} COP</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <FormInput<FormValues>
                                        name="otroSeguro2" label="Otros seguros" control={control}
                                        placeholder="0 COP" disabled={!incluirMoto2}
                                        // rules={{ validate: (v) => !incluirMoto2 ? true : (watch("seguroId2") || (v?.trim()?.length ?? 0) > 0) || "Selecciona un seguro o ingresa el valor de 'Otros seguros'" }}
                                    />
                                </div>
                            </div>



                            {/* Cuota inicial + partidas para cálculo */}
                            <FormInput<FormValues> name="cuotaInicial2" label="Cuota inicial" control={control} type="number" placeholder="0 COP"
                                rules={reqIf(incluirMoto2, "Ingresa la cuota inicial")} disabled={!incluirMoto2} />
                            <FormInput<FormValues> name="matricula2" label="Matrícula y SOAT" control={control} type="number" placeholder="0 COP" disabled={!incluirMoto2} />
                            <FormInput<FormValues> name="descuento2" label="Descuentos" control={control} type="number" placeholder="0 COP" disabled={!incluirMoto2} />
                            {/* Resumen (versión mejorada) */}
                            <div className="bg-base-100 shadow-lg rounded-xl p-6 border border-base-300">
                                {/* Encabezado */}
                                <h3 className="text-lg font-bold mb-4 text-success flex items-center gap-2">
                                    <span className="inline-flex w-2 h-2 rounded-full bg-success"></span>
                                    Resumen de costos
                                </h3>

                                {/* Valor total seguros */}
                                <div className="flex justify-between items-center bg-success/10 text-success px-4 py-2 rounded-lg mb-4">
                                    <span className="font-semibold">Valor total de seguros:</span>
                                    <span className="font-bold">{fmt(totalSeguros2)}</span>
                                </div>

                                {/* Detalles */}
                                <div className="grid grid-cols-1 gap-2 mb-4">
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Matrícula y SOAT:</span>
                                        <span>{fmt(matricula2)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Descuentos:</span>
                                        <span className="text-error font-semibold">-{fmt(descuento2)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Accesorios / Marcadas / Personalizadas:</span>
                                        <span>{fmt(accesorios2)}</span>
                                    </div>
                                    <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                        <span className="font-medium text-gray-500">Inicial:</span>
                                        <span>{fmt(inicial2)}</span>
                                    </div>
                                </div>

                                {/* Totales */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-warning/10 px-4 py-2 rounded-md">
                                        <span className="font-semibold text-warning">TOTAL SIN SEGUROS:</span>
                                        <span className="font-bold">{fmt(totalSinSeguros2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-success/20 px-4 py-2 rounded-md">
                                        <span className="font-bold text-success">TOTAL CON SEGUROS:</span>
                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros2)}</span>
                                    </div>
                                </div>
                            </div>



                        </div>
                    </div>
                </div>
            </div>

            {/* ================== COMENTARIO ================== */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Comentario</span>
                </label>
                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Escribe un comentario..."
                    {...register("comentario", { maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                />
                {errors.comentario && <p className="text-sm text-error">{String(errors.comentario.message)}</p>}
            </div>

            <button type="submit" className="btn btn-primary">Continuar</button>
        </form>
    );
};

export default CotizacionFormulario;
