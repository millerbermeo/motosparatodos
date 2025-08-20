import React from "react";
import { useForm } from "react-hook-form";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { FormInput } from "../../../shared/components/FormInput";
import { useCanales, useFinancieras, usePreguntas, useSeguros } from "../../../services/selectsServices";
import { useMarcas, useMotosPorMarca } from "../../../services/marcasServices";
import { useCreateCotizaciones } from "../../../services/cotizacionesServices";
import { useAuthStore } from "../../../store/auth.store";
import ButtonLink from "../../../shared/components/ButtonLink";

type MetodoPago = "contado" | "credibike" | "terceros";

type FormValues = {
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

    incluirMoto1: boolean;
    incluirMoto2: boolean;

    marca1: string;
    moto1: string;
    garantia1: string;
    accesorios1: string;
    segurosIds1: string[];     // <— múltiples seguros
    otroSeguro1: string;
    precioDocumentos1: string; // <— mapea a precio_documentos_a
    descuento1: string;
    cuotaInicial1: string;

    marca2: string;
    moto2: string;
    garantia2: string;
    accesorios2: string;
    segurosIds2: string[];     // <— múltiples seguros
    otroSeguro2: string;
    precioDocumentos2: string; // <— mapea a precio_documentos_b
    descuento2: string;
    cuotaInicial2: string;

    // cuotas manuales opcionales
    cuota_6_a?: string; cuota_6_b?: string;
    cuota_12_a?: string; cuota_12_b?: string;
    cuota_18_a?: string; cuota_18_b?: string;
    cuota_24_a?: string; cuota_24_b?: string;
    cuota_30_a?: string; cuota_30_b?: string;
    cuota_36_a?: string; cuota_36_b?: string;

    // otros productos (sin cambios)
    producto1Nombre: string;
    producto1Descripcion: string;
    producto1Precio: string;
    producto1CuotaInicial: string;

    producto2Nombre: string;
    producto2Descripcion: string;
    producto2Precio: string;
    producto2CuotaInicial: string;
    modelo_a: string;
    modelo_b: string;
};

const CotizacionFormulario: React.FC = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue,
        reset,
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
            moto1: "",
            garantia1: "",
            accesorios1: "0",
            segurosIds1: [],          // múltiple
            otroSeguro1: "0",
            precioDocumentos1: "",   // mapea a precio_documentos_a
            descuento1: "0",
            cuotaInicial1: "0",

            marca2: "",
            moto2: "",
            garantia2: "",
            accesorios2: "0",
            segurosIds2: [],          // múltiple
            otroSeguro2: "0",
            precioDocumentos2: "",   // mapea a precio_documentos_b
            descuento2: "0",
            cuotaInicial2: "0",

            // cuotas opcionales vacías (=> null al enviar)
            cuota_6_a: "", cuota_6_b: "",
            cuota_12_a: "", cuota_12_b: "",
            cuota_18_a: "", cuota_18_b: "",
            cuota_24_a: "", cuota_24_b: "",
            cuota_30_a: "", cuota_30_b: "",
            cuota_36_a: "", cuota_36_b: "",

            producto1Nombre: "",
            producto1Descripcion: "",
            producto1Precio: "0",
            producto1CuotaInicial: "0",

            producto2Nombre: "",
            producto2Descripcion: "",
            producto2Precio: "0",
            producto2CuotaInicial: "0",

            modelo_a: "",
            modelo_b: "",
        },
        mode: "onBlur",
        shouldUnregister: false, // <-- mantiene valores aunque se oculten

    });

    const { mutate: cotizacion } = useCreateCotizaciones();

    const metodo = watch("metodoPago");
    const incluirMoto1 = watch("incluirMoto1");
    const incluirMoto2 = watch("incluirMoto2");
    const categoria = watch("categoria");
    const isMotos = categoria === "motos";
    const isProductos = categoria === "otros";
    const showProductos = isProductos && metodo !== "terceros";
    // Si es “terceros”, también mostramos Motos
    const showMotos = isMotos || metodo === "terceros";


    const name = useAuthStore((s) => s.user?.name); // string | undefined

    const { data: canales, isPending: loadingCanales } = useCanales();
    const { data: preguntas, isPending: loadingPregs } = usePreguntas();
    const { data: financieras, isPending: loadingFinancieras } = useFinancieras();
    const canalOptions: SelectOption[] = (canales ?? []).map((c: any) => ({ value: c, label: c }));
    const preguntaOptions: SelectOption[] = (preguntas ?? []).map((p: any) => ({ value: p, label: p }));
    const financieraOptions: SelectOption[] = (financieras ?? []).map((f: any) => ({ value: f, label: f }));

    const { data: marcas } = useMarcas();
    const marcaOptions: SelectOption[] = (marcas ?? []).map((m: any) => ({ value: m.marca, label: m.marca }));

    const selectedMarca1 = watch("marca1");
    const selectedMarca2 = watch("marca2");

    const { data: motos1 } = useMotosPorMarca(selectedMarca1 || undefined);
    const { data: motos2 } = useMotosPorMarca(selectedMarca2 || undefined);
    console.log(motos1)
    const motoOptions1: SelectOption[] = (motos1?.motos ?? []).map((m) => ({
        value: m.linea,
        label: `${m.linea} – ${Number(m.precio_base).toLocaleString("es-CO")} COP - Modelo ${m.modelo ?? ''}`,
    }));

    console.log(motoOptions1)
    const motoOptions2: SelectOption[] = (motos2?.motos ?? []).map((m) => ({
        value: m.linea,
        label: `${m.linea} – ${Number(m.precio_base).toLocaleString("es-CO")} COP Modelo ${m.modelo ?? ''}`,
    }));


    console.log(motoOptions2)



    // Cuando seleccionan una moto1, si existe el modelo lo seteo, si no dejo vacío
    React.useEffect(() => {
        const sel = watch("moto1");
        const m = (motos1?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            if (m.modelo && m.modelo.trim() !== "") {
                setValue("modelo_a", m.modelo); // autocompleta
            } else {
                setValue("modelo_a", ""); // lo deja vacío para que el usuario lo escriba
            }
        }
    }, [watch("moto1"), motos1, setValue]);

    // Igual para moto2
    React.useEffect(() => {
        const sel = watch("moto2");
        const m = (motos2?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            if (m.modelo && m.modelo.trim() !== "") {
                setValue("modelo_b", m.modelo);
            } else {
                setValue("modelo_b", "");
            }
        }
    }, [watch("moto2"), motos2, setValue]);

    const garantiaOptions: SelectOption[] = [
        { value: "si", label: "Sí" },
        { value: "no", label: "No" },
    ];


    React.useEffect(() => { setValue("moto1", ""); }, [selectedMarca1, setValue]);
    React.useEffect(() => { setValue("moto2", ""); }, [selectedMarca2, setValue]);

    const precioBase1 = React.useMemo(() => {
        const sel = watch("moto1");
        const m = (motos1?.motos ?? []).find((x) => x.linea === sel);
        return m ? Number(m.precio_base) : 0;
    }, [motos1?.motos, watch("moto1")]);

    const precioBase2 = React.useMemo(() => {
        const sel = watch("moto2");
        const m = (motos2?.motos ?? []).find((x) => x.linea === sel);
        return m ? Number(m.precio_base) : 0;
    }, [motos2?.motos, watch("moto2")]);

    const { data: seguros = [], isPending: loadingSeguros } = useSeguros();

    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marca1", "");
            setValue("moto1", "");
            setValue("garantia1", "");
            setValue("accesorios1", "0");
            setValue("segurosIds1", []);
            setValue("otroSeguro1", "0");
            setValue("precioDocumentos1", "0");
            setValue("descuento1", "0");
            setValue("cuotaInicial1", "0");
        }
    }, [incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marca2", "");
            setValue("moto2", "");
            setValue("garantia2", "");
            setValue("accesorios2", "0");
            setValue("segurosIds2", []);
            setValue("otroSeguro2", "0");
            setValue("precioDocumentos2", "0");
            setValue("descuento2", "0");
            setValue("cuotaInicial2", "0");
        }
    }, [incluirMoto2, setValue]);

    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("financiera", "");
            setValue("cuotas", "");
            setValue("categoria", "motos");
        } else if (metodo === "credibike") {
            setValue("financiera", "");
            setValue("cuotas", "");
            // categoría la elige el usuario con los radios (ya gestionado abajo)
        } else if (metodo === "terceros") {
            setValue("categoria", "motos"); // <- clave
        }
    }, [metodo, setValue]);


    const reqIf = (cond: boolean, msg: string) => ({
        validate: (v: any) => (!cond ? true : (v !== undefined && v !== null && String(v).trim().length > 0) || msg),
    });

    const N = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));
    const fmt = (n: number) => n.toLocaleString("es-CO") + " COP";
    const findSeguroValor = (id: string) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        return s ? Number(s.valor) : 0;
    };

    // const clearMotos = React.useCallback(() => {
    //     setValue("incluirMoto1", true);
    //     setValue("incluirMoto2", false);

    //     setValue("marca1", ""); setValue("moto1", "");
    //     setValue("garantia1", ""); setValue("accesorios1", "0");
    //     setValue("segurosIds1", []); setValue("otroSeguro1", "0");
    //     setValue("precioDocumentos1", "0"); setValue("descuento1", "0");
    //     setValue("cuotaInicial1", "0");

    //     setValue("marca2", ""); setValue("moto2", "");
    //     setValue("garantia2", ""); setValue("accesorios2", "0");
    //     setValue("segurosIds2", []); setValue("otroSeguro2", "0");
    //     setValue("precioDocumentos2", "0"); setValue("descuento2", "0");
    //     setValue("cuotaInicial2", "0");
    // }, [setValue]);


    React.useEffect(() => {
        if (metodo === "terceros") {
            // forzar categoría motos y limpiar productos
            setValue("categoria", "motos");
            setValue("producto1Nombre", "");
            setValue("producto1Descripcion", "");
            setValue("producto1Precio", "0");
            setValue("producto1CuotaInicial", "0");
            setValue("producto2Nombre", "");
            setValue("producto2Descripcion", "");
            setValue("producto2Precio", "0");
            setValue("producto2CuotaInicial", "0");
        }
    }, [metodo, setValue]);



    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("categoria", "motos");
        } else if (metodo === "terceros") {
            setValue("categoria", "motos"); // mantenemos motos activas
            // NO llamar clearMotos();
        }
    }, [metodo, setValue]);

    // ===== cálculos MOTO 1 =====
    const segurosIds1 = watch("segurosIds1") ?? [];
    const otros1 = N(watch("otroSeguro1"));
    const accesorios1Val = N(watch("accesorios1"));
    const precioDocumentos1Val = N(watch("precioDocumentos1"));
    const descuento1Val = N(watch("descuento1"));
    const inicial1 = N(watch("cuotaInicial1"));
    const totalSeguros1 = (showMotos && incluirMoto1)
        ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros1
        : 0;
    const totalSinSeguros1 = showMotos && incluirMoto1 ? (precioBase1 + accesorios1Val + precioDocumentos1Val - descuento1Val) : 0;
    const totalConSeguros1 = totalSinSeguros1 + totalSeguros1;

    // ===== cálculos MOTO 2 =====
    const segurosIds2 = watch("segurosIds2") ?? [];
    const otros2 = N(watch("otroSeguro2"));
    const accesorios2Val = N(watch("accesorios2"));
    const precioDocumentos2Val = N(watch("precioDocumentos2"));
    const descuento2Val = N(watch("descuento2"));
    const inicial2 = N(watch("cuotaInicial2"));
    const totalSeguros2 = (showMotos && incluirMoto2)
        ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros2
        : 0;
    const totalSinSeguros2 = showMotos && incluirMoto2 ? (precioBase2 + accesorios2Val + precioDocumentos2Val - descuento2Val) : 0;
    const totalConSeguros2 = totalSinSeguros2 + totalSeguros2;

    // toNumberOrNull: convierte "" -> null, otro -> Number
    const toNumberOrNull = (v: any) => {
        if (v === undefined || v === null) return null;
        const n = Number(v);
        return isNaN(n) || String(v).trim() === "" ? null : n;
    };

    const onSubmit = (data: FormValues) => {


        if (!data.segundo_nombre || !data.segundo_nombre.trim()) {
            alert("El segundo nombre es obligatorio (BD: s_name).");
            return;
        }
        if (!data.comentario || !data.comentario.trim()) {
            alert("El comentario es obligatorio.");
            return;
        }

        // Recalcular totales dentro del submit para asegurar últimos valores:
        const seg1 = (data.segurosIds1 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);
        const seg2 = (data.segurosIds2 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);

        const totalSinSeg1 = incluirMoto1 ? (precioBase1 + N(data.accesorios1) + N(data.precioDocumentos1) - N(data.descuento1)) : 0;
        const totalSinSeg2 = incluirMoto2 ? (precioBase2 + N(data.accesorios2) + N(data.precioDocumentos2) - N(data.descuento2)) : 0;

        const precioTotalA = incluirMoto1 ? (totalSinSeg1 + seg1 + N(data.otroSeguro1)) : 0;
        const precioTotalB = incluirMoto2 ? (totalSinSeg2 + seg2 + N(data.otroSeguro2)) : 0;




        const tipo_pago = data.metodoPago === "contado" ? "contado" : "financiado";

        // justo antes de construir payload:
        const lineaA_final = incluirMoto1
            ? [data.moto1?.trim(), data.modelo_a?.trim()].filter(Boolean).join(" – ")
            : "";

        const lineaB_final = incluirMoto2
            ? [data.moto2?.trim(), data.modelo_b?.trim()].filter(Boolean).join(" – ")
            : null;


        const payload: Record<string, any> = {
            name: data.primer_nombre?.trim(),
            s_name: data.segundo_nombre?.trim(),
            last_name: data.primer_apellido?.trim(),
            s_last_name: data.segundo_apellido?.trim() || null,
            cedula: data.cedula?.trim(),
            email: data.email?.trim(),
            canal_contacto: data.canal,
            pregunta: data.pregunta,

            // Vehículo A
            marca_a: incluirMoto1 ? data.marca1 : "",
            linea_a: lineaA_final,
            garantia_a: incluirMoto1 ? (data.garantia1 || "") : "",
            accesorios_a: incluirMoto1 ? N(data.accesorios1) : 0,
            seguro_vida_a: incluirMoto1 ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) : 0,
            seguro_mascota_s_a: 0,
            seguro_mascota_a_a: 0,
            otro_seguro_a: incluirMoto1 ? N(data.otroSeguro1) : 0,
            precio_base_a: incluirMoto1 ? precioBase1 : 0,
            precio_documentos_a: incluirMoto1 ? N(data.precioDocumentos1) : 0,
            precio_total_a: precioTotalA,

            modelo_a: incluirMoto1 ? (data.modelo_a?.trim() || "") : "",

            // Vehículo B
            marca_b: incluirMoto2 ? data.marca2 : null,
            linea_b: lineaB_final,
            garantia_b: incluirMoto2 ? (data.garantia2 || "") : null,
            accesorios_b: incluirMoto2 ? N(data.accesorios2) : null,
            seguro_vida_b: incluirMoto2 ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) : null,
            seguro_mascota_s_b: incluirMoto2 ? 0 : null,
            seguro_mascota_a_b: incluirMoto2 ? 0 : null,
            otro_seguro_b: incluirMoto2 ? N(data.otroSeguro2) : null,
            precio_base_b: incluirMoto2 ? precioBase2 : null,
            precio_documentos_b: incluirMoto2 ? N(data.precioDocumentos2) : null,
            precio_total_b: incluirMoto2 ? precioTotalB : null,  // <-- AJUSTE
            modelo_b: incluirMoto2 ? (data.modelo_b?.trim() || "") : null,

            // Pago / financiación
            tipo_pago,
            cuota_inicial_a: incluirMoto1 ? inicial1 : null,
            cuota_inicial_b: incluirMoto2 ? inicial2 : null,
            financiera: tipo_pago === "financiado" ? (data.financiera || null) : null,
            cant_cuotas: tipo_pago === "financiado" ? (data.cuotas ? Number(data.cuotas) : null) : null,

            // Cuotas manuales (opcionales)
            cuota_6_a: toNumberOrNull(data.cuota_6_a), cuota_6_b: toNumberOrNull(data.cuota_6_b),
            cuota_12_a: toNumberOrNull(data.cuota_12_a), cuota_12_b: toNumberOrNull(data.cuota_12_b),
            cuota_18_a: toNumberOrNull(data.cuota_18_a), cuota_18_b: toNumberOrNull(data.cuota_18_b),
            cuota_24_a: toNumberOrNull(data.cuota_24_a), cuota_24_b: toNumberOrNull(data.cuota_24_b),
            cuota_30_a: toNumberOrNull(data.cuota_30_a), cuota_30_b: toNumberOrNull(data.cuota_30_b),
            cuota_36_a: toNumberOrNull(data.cuota_36_a), cuota_36_b: toNumberOrNull(data.cuota_36_b),

            comentario: data.comentario?.trim(),

            asesor: name
        };

        console.log("SUBMIT (payload EXACTO BD):", payload);
        cotizacion(payload, {
            onSuccess: () => {
                // vuelve TODO al estado inicial
                reset(); // o simplemente reset(); para regresar a defaultValues
                // si quieres mantener los defaultValues actuales internamente:
                // reset(DEFAULTS, { keepDefaultValues: true });
            },
            onError: (err) => {
                console.error(err);
                // opcional: mostrar toast/error
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className='pt-4 mb-3'>
                <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" />
            </div>

            <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">


                    {(metodo === "credibike" || metodo === "terceros") && (
                        <>
                            <FormSelect<FormValues>
                                name="financiera"
                                label="Financiera"
                                control={control}
                                options={financieraOptions}
                                placeholder={loadingFinancieras ? "Cargando financieras..." : "Seleccione..."}
                                disabled={loadingFinancieras}
                                rules={{ required: "La financiera es obligatoria cuando es financiado." }}
                            />
                            <FormInput<FormValues>
                                name="cuotas"
                                label="Cantidad de cuotas"
                                type="number"
                                control={control}
                                placeholder="cuotas"
                                rules={{ required: "La cantidad de cuotas es obligatoria cuando es financiado.", validate: (v) => Number(v) > 0 || "Debe ser > 0" }}
                            />
                        </>
                    )}

                    <FormSelect<FormValues>
                        name="canal"
                        label="Canal de contacto"
                        control={control}
                        options={canalOptions}
                        placeholder={loadingCanales ? "Cargando canales..." : "Seleccione un canal"}
                        disabled={loadingCanales}
                        rules={{ required: "El canal de contacto es obligatorio." }}
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
                </div>
            </div>

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

            {/* DATOS PERSONALES */}
            <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                <div className="badge text-xl badge-success text-white">Datos Personales</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput<FormValues> name="cedula" label="Cédula" control={control} placeholder="Número de documento"
                        rules={{ required: "La cédula es obligatoria.", pattern: { value: /^[0-9]{5,20}$/, message: "Solo números (5-20 dígitos)" } }} />
                    <FormInput<FormValues> name="fecha_nac" label="Fecha de nacimiento" type="date" control={control}
                        rules={{ required: "La fecha de nacimiento es obligatoria." }} />
                    <FormInput<FormValues> name="primer_nombre" label="Primer nombre" control={control}
                        rules={{ required: "El primer nombre es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_nombre" label="Segundo nombre" control={control}
                        rules={{ required: "El segundo nombre es obligatorio (BD)." }} />
                    <FormInput<FormValues> name="primer_apellido" label="Primer apellido" control={control}
                        rules={{ required: "El primer apellido es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_apellido" label="Segundo apellido" control={control} />
                    <FormInput<FormValues> name="celular" label="Celular" control={control} placeholder="3001234567"
                        rules={{ required: "El celular es obligatorio.", pattern: { value: /^[0-9]{7,12}$/, message: "Solo números (7-12 dígitos)" } }} />
                    <FormInput<FormValues> name="email" label="Email" type="email" control={control} placeholder="correo@dominio.com"
                        rules={{ required: "El email es obligatorio.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }} />
                </div>

                {/* MOTOS */}
                {showMotos && (
                    <>
                        <div className="badge text-xl badge-success text-white">Datos Motocicletas</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* MOTO 1 */}
                            <div className="bg-white rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" className="checkbox checkbox-success text-white" {...register("incluirMoto1")} />
                                    <span className="label-text font-semibold">Incluir Motocicleta 1</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <FormSelect<FormValues>
                                        name="marca1" label="Marca" control={control}
                                        options={marcaOptions} placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={reqIf(showMotos && incluirMoto1, "La marca es obligatoria")}
                                    />
                                    <FormSelect<FormValues>
                                        name="moto1" label="Moto (modelo – precio)" control={control}
                                        options={motoOptions1}
                                        placeholder={selectedMarca1 ? "Seleccione una moto" : "Seleccione una marca primero"}
                                        disabled={!showMotos || !incluirMoto1 || !selectedMarca1}
                                        rules={reqIf(showMotos && incluirMoto1, "La moto es obligatoria")}
                                    />

                                    <FormInput<FormValues>
                                        name="modelo_a"
                                        label="Modelo año"
                                        control={control}
                                        placeholder="Ej. 2025 / Edición especial"
                                        disabled={!showMotos || !incluirMoto1}
                                        className="hidden"
                                    />


                                    <FormSelect<FormValues>
                                        name="garantia1"
                                        label="¿Incluye garantía?"
                                        control={control}
                                        options={garantiaOptions}
                                        placeholder="Seleccione..."
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={reqIf(showMotos && incluirMoto1, "La garantía es obligatoria")}
                                    />


                                    <FormInput<FormValues>
                                        name="accesorios1"
                                        label="Accesorios (entero)"
                                        control={control}
                                        placeholder="0"
                                        type="number"
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={{
                                            ...reqIf(showMotos && incluirMoto1, "Ingresa accesorios"),
                                            validate: (v) => (!showMotos || !incluirMoto1 ? true : Number.isInteger(Number(v)) && Number(v) >= 0 || "Ingrese un entero ≥ 0"),
                                            setValueAs: (v) => (v === "" ? "" : Number(v)),
                                        }}
                                    />

                                    {/* SEGUROS MULTI */}
                                    <div className="p-3 rounded-md bg-[#3498DB] ">
                                        <p className="font-semibold mb-2 text-white">Selecciona uno o varios seguros</p>
                                        <div className="flex flex-col gap-2 text-white">
                                            {loadingSeguros && <span>Cargando seguros...</span>}
                                            {!loadingSeguros && seguros.map((s: any) => (
                                                <label key={`m1-${s.id}`} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        value={String(s.id)}
                                                        className="checkbox checkbox-sm"
                                                        {...register("segurosIds1")}
                                                        disabled={!showMotos || !incluirMoto1}
                                                    />
                                                    <span>{s.nombre} – {Number(s.valor).toLocaleString("es-CO")} COP</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            <FormInput<FormValues>
                                                name="otroSeguro1" label="Otros seguros (monto adicional)" control={control}
                                                placeholder="0" type="number" disabled={!showMotos || !incluirMoto1}
                                                rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                            />
                                        </div>
                                    </div>

                                    <FormInput<FormValues>
                                        name="cuotaInicial1" label="Cuota inicial" control={control} type="number"
                                        rules={reqIf(showMotos && incluirMoto1, "Ingresa la cuota inicial")} disabled={!showMotos || !incluirMoto1} />

                                    {/* CAMBIO DE NOMBRE */}
                                    <FormInput<FormValues>
                                        name="precioDocumentos1" label="Precio documentos / matrícula y SOAT" control={control} type="number"
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={reqIf(showMotos && incluirMoto1, "El precio es obligatoria")}

                                    />
                                    <FormInput<FormValues> name="descuento1" label="Descuentos" control={control} type="number" disabled={!showMotos || !incluirMoto1} />

                                    {/* RESUMEN */}
                                    <div className="bg-base-100 shadow-lg rounded-xl p-6 border border-base-300">
                                        <h3 className="text-lg font-bold mb-4 text-success">Resumen de costos</h3>

                                        <div className="grid grid-cols-1 gap-2 mb-4">
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Precio documentos:</span>
                                                <span>{fmt(precioDocumentos1Val)}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Descuentos:</span>
                                                <span className="text-error font-semibold">-{fmt(descuento1Val)}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Accesorios (entero):</span>
                                                <span>{N(watch("accesorios1"))}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Inicial:</span>
                                                <span>{fmt(inicial1)}</span>
                                            </div>
                                        </div>

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

                            {/* MOTO 2 */}
                            <div className="bg-white rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" className="checkbox checkbox-success text-white" {...register("incluirMoto2")} />
                                    <span className="label-text font-semibold">Incluir Motocicleta 2</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <FormSelect<FormValues>
                                        name="marca2" label="Marca" control={control}
                                        options={marcaOptions} placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto2}
                                        rules={reqIf(showMotos && incluirMoto2, "La marca es obligatoria")}
                                    />
                                    <FormSelect<FormValues>
                                        name="moto2" label="Moto (modelo – precio)" control={control}
                                        options={motoOptions2}
                                        placeholder={selectedMarca2 ? "Seleccione una moto" : "Seleccione una marca primero"}
                                        disabled={!showMotos || !incluirMoto2 || !selectedMarca2}
                                        rules={reqIf(showMotos && incluirMoto2, "La moto es obligatoria")}
                                    />

                                    <FormInput<FormValues>
                                        name="modelo_b"
                                        label="Modelo año"
                                        control={control}
                                        placeholder="Ej. 2025 / Edición especial"
                                        disabled={!showMotos || !incluirMoto2}
                                        className="hidden"

                                    />


                                    <FormSelect<FormValues>
                                        name="garantia2"
                                        label="¿Incluye garantía?"
                                        control={control}
                                        options={garantiaOptions}
                                        placeholder="Seleccione..."
                                        disabled={!showMotos || !incluirMoto2}
                                        rules={reqIf(showMotos && incluirMoto2, "La garantía es obligatoria")}
                                    />


                                    <FormInput<FormValues>
                                        name="accesorios2"
                                        label="Accesorios (entero)"
                                        control={control}
                                        placeholder="0"
                                        type="number"
                                        disabled={!showMotos || !incluirMoto2}
                                        rules={{
                                            ...reqIf(showMotos && incluirMoto2, "Ingresa accesorios"),
                                            validate: (v) => (!showMotos || !incluirMoto2 ? true : Number.isInteger(Number(v)) && Number(v) >= 0 || "Ingrese un entero ≥ 0"),
                                            setValueAs: (v) => (v === "" ? "" : Number(v)),
                                        }}
                                    />

                                    {/* SEGUROS MULTI */}
                                    <div className="p-3 rounded-md bg-[#3498DB]">
                                        <p className="font-semibold mb-2 text-white">Selecciona uno o varios seguros</p>
                                        <div className="flex flex-col gap-2 text-white">
                                            {loadingSeguros && <span>Cargando seguros...</span>}
                                            {!loadingSeguros && seguros.map((s: any) => (
                                                <label key={`m2-${s.id}`} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        value={String(s.id)}
                                                        className="checkbox checkbox-sm"
                                                        {...register("segurosIds2")}
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />
                                                    <span>{s.nombre} – {Number(s.valor).toLocaleString("es-CO")} COP</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            <FormInput<FormValues>
                                                name="otroSeguro2" label="Otros seguros (monto adicional)" control={control}
                                                placeholder="0" type="number" disabled={!showMotos || !incluirMoto2}
                                                rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                            />
                                        </div>
                                    </div>

                                    <FormInput<FormValues>
                                        name="cuotaInicial2" label="Cuota inicial" control={control} type="number" placeholder="0"
                                        rules={reqIf(showMotos && incluirMoto2, "Ingresa la cuota inicial")} disabled={!showMotos || !incluirMoto2} />
                                    {/* CAMBIO DE NOMBRE */}
                                    <FormInput<FormValues> rules={reqIf(showMotos && incluirMoto1, "El precio es obligatoria")}
                                        name="precioDocumentos2" label="Precio documentos / matrícula y SOAT" control={control} type="number" disabled={!showMotos || !incluirMoto2} />
                                    <FormInput<FormValues> name="descuento2" label="Descuentos" control={control} type="number" disabled={!showMotos || !incluirMoto2} />

                                    <div className="bg-base-100 shadow-lg rounded-xl p-6 border border-base-300">
                                        <h3 className="text-lg font-bold mb-4 text-success">Resumen de costos</h3>

                                        <div className="grid grid-cols-1 gap-2 mb-4">
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Precio documentos:</span>
                                                <span>{fmt(precioDocumentos2Val)}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Descuentos:</span>
                                                <span className="text-error font-semibold">-{fmt(descuento2Val)}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Accesorios (entero):</span>
                                                <span>{N(watch("accesorios2"))}</span>
                                            </div>
                                            <div className="flex justify-between bg-base-200 px-4 py-2 rounded-md">
                                                <span className="font-medium text-gray-500">Inicial:</span>
                                                <span>{fmt(inicial2)}</span>
                                            </div>
                                        </div>

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


                    </>
                )}




                {metodo === "terceros" && (
                    <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput<FormValues> name="cuota_6_a" label="Cuota 6 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_6_b" label="Cuota 6 meses B" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_12_a" label="Cuota 12 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_12_b" label="Cuota 12 meses B" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_18_a" label="Cuota 18 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_18_b" label="Cuota 18 meses B" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_24_a" label="Cuota 24 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_24_b" label="Cuota 24 meses B" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_30_a" label="Cuota 30 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_30_b" label="Cuota 30 meses B" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_36_a" label="Cuota 36 meses A" type="number" control={control} placeholder="Opcional" />
                            <FormInput<FormValues> name="cuota_36_b" label="Cuota 36 meses B" type="number" control={control} placeholder="Opcional" />
                        </div>
                    </div>
                )}

                {/* OTROS PRODUCTOS (igual que antes) */}
                {showProductos && (
                    <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                        <div className="badge text-xl badge-success text-white">Otros productos</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid grid-cols-1 gap-4">
                                <FormInput<FormValues>
                                    name="producto1Nombre"
                                    label="Producto 1 *"
                                    control={control}
                                    placeholder="Producto"
                                />
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Descripción *</span></label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Descripción"
                                        {...register("producto1Descripcion", {

                                            maxLength: { value: 500, message: "Máximo 500 caracteres" },
                                        })}
                                    />
                                    {errors.producto1Descripcion && <p className="text-sm text-error">{String(errors.producto1Descripcion.message)}</p>}
                                </div>
                                <FormInput<FormValues> name="producto1Precio" label="Precio *" type="number" control={control} placeholder="0 COP"
                                />
                                <FormInput<FormValues> name="producto1CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <FormInput<FormValues> name="producto2Nombre" label="Producto 2 *" control={control} placeholder="Producto"
                                />
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Descripción *</span></label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Descripción"
                                        {...register("producto2Descripcion", {
                                            maxLength: { value: 500, message: "Máximo 500 caracteres" },
                                        })}
                                    />
                                    {errors.producto2Descripcion && <p className="text-sm text-error">{String(errors.producto2Descripcion.message)}</p>}
                                </div>
                                <FormInput<FormValues> name="producto2Precio" label="Precio *" type="number" control={control} placeholder="0 COP"
                                />
                                <FormInput<FormValues> name="producto2CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* COMENTARIO */}
            <div className="form-control w-full">
                <label className="label"><span className="label-text">Comentario *</span></label>
                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Escribe un comentario..."
                    {...register("comentario", { required: "El comentario es obligatorio.", maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                />
                {errors.comentario && <p className="text-sm text-error">{String(errors.comentario.message)}</p>}
            </div>

            <button type="submit" className="btn btn-primary">Continuar</button>
        </form>
    );
};

export default CotizacionFormulario;
