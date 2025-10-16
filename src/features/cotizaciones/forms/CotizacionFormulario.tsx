import React from "react";
import { useForm } from "react-hook-form";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { FormInput } from "../../../shared/components/FormInput";
import { useCanales, useFinancieras, usePreguntas, useSeguros } from "../../../services/selectsServices";
import { useMarcas, useMotosPorMarca } from "../../../services/marcasServices";
import { useCreateCotizaciones } from "../../../services/cotizacionesServices";
import { useAuthStore } from "../../../store/auth.store";
import ButtonLink from "../../../shared/components/ButtonLink";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

type MetodoPago = "contado" | "credibike" | "terceros";

const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
    contado: "Contado",
    credibike: "Crédito directo",
    terceros: "Crédito de terceros",
};

const dateNotTodayOrFuture = (val: unknown): true | string => {
    const v = typeof val === "string" ? val : "";
    if (!v) return true;
    const exp = new Date(`${v}T00:00:00`);
    exp.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (+exp === +today) return "No puede ser hoy";
    if (exp > today) return "No puede ser una fecha futura";
    return true;
};

// Helper para alertas
const warn = (title: string, text: string) =>
    Swal.fire({ icon: "warning", title, text, confirmButtonText: "Entendido" });


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
    segurosIds1: string[];
    otroSeguro1: string;
    precioDocumentos1: string;
    descuento1: string;
    cuotaInicial1: string;

    marca2: string;
    moto2: string;
    garantia2: string;
    accesorios2: string;
    segurosIds2: string[];
    otroSeguro2: string;
    precioDocumentos2: string;
    descuento2: string;
    cuotaInicial2: string;

    cuota_6_a?: string; cuota_6_b?: string;
    cuota_12_a?: string; cuota_12_b?: string;
    cuota_18_a?: string; cuota_18_b?: string;
    cuota_24_a?: string; cuota_24_b?: string;
    cuota_30_a?: string; cuota_30_b?: string;
    cuota_36_a?: string; cuota_36_b?: string;

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
    nombre_usuario: string;
    rol_usuario: string;

    marcacion1: string;
    marcacion2: string;

    foto_a?: string | null;
    foto_b?: string | null;

    garantiaExtendida1?: "no" | "12" | "24" | "36";
    garantiaExtendida2?: "no" | "12" | "24" | "36";

};

const garantiaExtendidaOptions: SelectOption[] = [
    { value: "no", label: "No" },
    { value: "12", label: "12 meses" },
    { value: "24", label: "24 meses" },
    { value: "36", label: "36 meses" },
];


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

            garantiaExtendida1: "no", // NUEVO

            accesorios1: "0",
            segurosIds1: [],
            otroSeguro1: "0",
            precioDocumentos1: "",
            descuento1: "0",
            cuotaInicial1: "0",

            marca2: "",
            moto2: "",
            garantia2: "",
            garantiaExtendida2: "no", // NUEVO

            accesorios2: "0",
            segurosIds2: [],
            otroSeguro2: "0",
            precioDocumentos2: "",
            descuento2: "0",
            cuotaInicial2: "0",

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
            marcacion1: "0",
            marcacion2: "0",
        },
        mode: "onBlur",
        shouldUnregister: false,
    });

    const navigate = useNavigate();

    const { mutate: cotizacion, isPending } = useCreateCotizaciones();

    const metodo = watch("metodoPago");
    const incluirMoto1 = watch("incluirMoto1");
    const incluirMoto2 = watch("incluirMoto2");
    const categoria = watch("categoria");

    const isMotos = categoria === "motos";
    const isProductos = categoria === "otros";
    const showProductos = isProductos && metodo !== "terceros";
    const showMotos = isMotos || metodo === "terceros";

    const name = useAuthStore((s) => s.user?.name);

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

    const motoOptions1: SelectOption[] = (motos1?.motos ?? []).map((m) => ({
        value: m.linea,
        label: `${m.linea} – ${Number(m.precio_base).toLocaleString("es-CO")} COP - Modelo ${m.modelo ?? ""}`,
    }));

    const motoOptions2: SelectOption[] = (motos2?.motos ?? []).map((m) => ({
        value: m.linea,
        label: `${m.linea} – ${Number(m.precio_base).toLocaleString("es-CO")} COP Modelo ${m.modelo ?? ""}`,
    }));

    // MOTO 1
    React.useEffect(() => {
        const sel = watch("moto1");
        const m = (motos1?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            setValue("modelo_a", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento1", descuento.toString());
            const documentos =
                (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
                Number(m.impuestos) + Number(m.soat);
            setValue("precioDocumentos1", documentos.toString());

            // 👇 NUEVO: guarda la url de la foto
            setValue("foto_a", m.foto ?? null);
        }
    }, [watch("moto1"), motos1, metodo, setValue]);

    // MOTO 2
    React.useEffect(() => {
        const sel = watch("moto2");
        const m = (motos2?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            setValue("modelo_b", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento2", descuento.toString());
            const documentos =
                (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
                Number(m.impuestos) + Number(m.soat);
            setValue("precioDocumentos2", documentos.toString());

            // 👇 NUEVO: guarda la url de la foto
            setValue("foto_b", m.foto ?? null);
        }
    }, [watch("moto2"), motos2, metodo, setValue]);

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

    // ===== NUEVO: documentos calculados (fuente única de la verdad) =====
    const moto1Sel = watch("moto1");
    const moto2Sel = watch("moto2");

    const documentos1 = React.useMemo(() => {
        const m = (motos1?.motos ?? []).find(x => x.linea === moto1Sel);
        if (!incluirMoto1 || !m) return 0;
        return (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito))
            + Number(m.impuestos) + Number(m.soat);
    }, [motos1?.motos, moto1Sel, metodo, incluirMoto1]);

    const documentos2 = React.useMemo(() => {
        const m = (motos2?.motos ?? []).find(x => x.linea === moto2Sel);
        if (!incluirMoto2 || !m) return 0;
        return (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito))
            + Number(m.impuestos) + Number(m.soat);
    }, [motos2?.motos, moto2Sel, metodo, incluirMoto2]);

    const { data: seguros = [], isPending: loadingSeguros } = useSeguros();

    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marca1", ""); setValue("moto1", ""); setValue("garantia1", "");
            setValue("foto_a", null);
            setValue("accesorios1", "0"); setValue("segurosIds1", []); setValue("otroSeguro1", "0");
            setValue("precioDocumentos1", "0"); setValue("descuento1", "0"); setValue("cuotaInicial1", "0");
            setValue("garantiaExtendida1", "no")
        }
    }, [incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marca2", ""); setValue("moto2", ""); setValue("garantia2", "");
            setValue("foto_b", null)
            setValue("accesorios2", "0"); setValue("segurosIds2", []); setValue("otroSeguro2", "0");
            setValue("precioDocumentos2", "0"); setValue("descuento2", "0"); setValue("cuotaInicial2", "0");
            setValue("garantiaExtendida2", "no");
        }
    }, [incluirMoto2, setValue]);

    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("financiera", ""); setValue("cuotas", ""); setValue("categoria", "motos");
        } else if (metodo === "credibike") {
            setValue("financiera", ""); setValue("cuotas", "");
        } else if (metodo === "terceros") {
            setValue("categoria", "motos");
        }
    }, [metodo, setValue]);

    const reqIf = (cond: boolean, msg: string) => ({
        validate: (v: any) => (!cond ? true : (v !== undefined && v !== null && String(v).trim().length > 0) || msg),
    });

    // ====== HELPERS NUMÉRICOS (ajustado) ======
    const N = (v: any) => {
        if (v === null || v === undefined || v === "") return 0;
        const s = String(v).replace(/[^\d-]/g, "");   // quita . , espacios, COP, etc. (conserva signo)
        return s ? Number(s) : 0;
    };

    const fmt = (n: number) => n.toLocaleString("es-CO") + " COP";

    const findSeguroValor = (id: string) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        return s ? Number(s.valor) : 0;
    };

    const findSeguroObj = (id: string | number) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        if (!s) return null;
        return { id: Number(s.id), nombre: s.nombre, tipo: s.tipo ?? null, valor: Number(s.valor) };
    };

    const mapSeguros = (ids: Array<string | number>, otrosMonto: any) => {
        const base = (ids ?? [])
            .map((sid) => findSeguroObj(sid))
            .filter(Boolean) as Array<{ id: number; nombre: string; tipo: string | null; valor: number }>;
        const otros = N(otrosMonto);
        if (otros > 0) {
            base.push({ id: -1, nombre: "Otros seguros", tipo: null, valor: otros });
        }
        return base;
    };
    // ====== FIN HELPERS ======

    const nombre = useAuthStore((s) => s.user?.name);
    const rol = useAuthStore((s) => s.user?.rol);

    React.useEffect(() => {
        if (metodo === "terceros") {
            setValue("categoria", "motos");
            setValue("producto1Nombre", ""); setValue("producto1Descripcion", "");
            setValue("producto1Precio", "0"); setValue("producto1CuotaInicial", "0");
            setValue("producto2Nombre", ""); setValue("producto2Descripcion", "");
            setValue("producto2Precio", "0"); setValue("producto2CuotaInicial", "0");
        }
    }, [metodo, setValue]);

    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("categoria", "motos");
        } else if (metodo === "terceros") {
            setValue("categoria", "motos");
        }
    }, [metodo, setValue]);

    // ===== CÁLCULOS MOTO 1 =====
    const segurosIds1 = watch("segurosIds1") ?? [];
    const otros1 = N(watch("otroSeguro1"));
    const accesorios1Val = N(watch("accesorios1"));
    const descuento1Val = N(watch("descuento1"));
    const inicial1 = N(watch("cuotaInicial1"));
    const marcacion1Val = N(watch("marcacion1"));

    const totalSeguros1 = (showMotos && incluirMoto1)
        ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros1
        : 0;

    const totalSinSeguros1 = (showMotos && incluirMoto1)
        ? (precioBase1 + accesorios1Val + documentos1 + marcacion1Val - descuento1Val)
        : 0;

    const totalConSeguros1 = totalSinSeguros1 + totalSeguros1;

    // ===== CÁLCULOS MOTO 2 =====
    const segurosIds2 = watch("segurosIds2") ?? [];
    const otros2 = N(watch("otroSeguro2"));
    const accesorios2Val = N(watch("accesorios2"));
    const descuento2Val = N(watch("descuento2"));
    const inicial2 = N(watch("cuotaInicial2"));
    const marcacion2Val = N(watch("marcacion2"));

    const totalSeguros2 = (showMotos && incluirMoto2)
        ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros2
        : 0;

    const totalSinSeguros2 = (showMotos && incluirMoto2)
        ? (precioBase2 + accesorios2Val + documentos2 + marcacion2Val - descuento2Val)
        : 0;

    const totalConSeguros2 = totalSinSeguros2 + totalSeguros2;

    const moto1Seleccionada = Boolean(watch("moto1"));
    const moto2Seleccionada = Boolean(watch("moto2"));

    const onSubmit = (data: FormValues) => {


        const unformatNumber = (v: string | number | null | undefined): string => {
            if (v === null || v === undefined) return "";
            return String(v).replace(/[^\d-]/g, "");
        };
        const toNumberSafe = (v: string | number | null | undefined): number => {
            const raw = unformatNumber(v); return raw ? Number(raw) : 0;
        };
        const toNumberOrNullMoney = (v: string | number | null | undefined): number | null => {
            const raw = unformatNumber(v); return raw ? Number(raw) : null;
        };

        // Validaciones con SweetAlert2 (moto A obligatoria; moto B opcional pero obligatoria si se selecciona)
        const mustHaveMoto1 = showMotos && incluirMoto1; // Moto 1 es obligatoria si se está mostrando la sección de motos y está marcada
        const mustHaveMoto2 = showMotos && incluirMoto2; // Moto 2 es opcional; si está marcada, se valida

        if (mustHaveMoto1 && (!moto1Seleccionada || !Number.isFinite(precioBase1) || precioBase1 <= 0)) {
            return warn("Falta información", "La Moto 1 es obligatoria y debe tener un precio base válido; configúralo en el módulo de motos.");
        }

        if (mustHaveMoto2 && (!moto2Seleccionada || !Number.isFinite(precioBase2) || precioBase2 <= 0)) {
            return warn("Falta información", "Seleccionaste la Moto 2; también debe tener un precio base válido; configúralo en el módulo de motos.");
        }


        if (!data.comentario || !data.comentario.trim()) {
            return warn("Comentario obligatorio", "Debes ingresar un comentario.");
        }


        const accesorios1 = toNumberSafe(data.accesorios1);
        const accesorios2 = toNumberSafe(data.accesorios2);
        const otroSeguro1 = toNumberSafe(data.otroSeguro1);
        const otroSeguro2 = toNumberSafe(data.otroSeguro2);
        // Mantengo estas dos líneas, aunque ya no se usan para el cálculo final:
        // const precioDocumentos1 = toNumberSafe(data.precioDocumentos1);
        // const precioDocumentos2 = toNumberSafe(data.precioDocumentos2);
        const descuento1 = toNumberSafe(data.descuento1);
        const descuento2 = toNumberSafe(data.descuento2);
        const cuotaInicial1Num = toNumberSafe(data.cuotaInicial1);
        const cuotaInicial2Num = toNumberSafe(data.cuotaInicial2);
        const marcacion1 = toNumberSafe(data.marcacion1);
        const marcacion2 = toNumberSafe(data.marcacion2);

        const cuota_6_a = toNumberOrNullMoney(data.cuota_6_a);
        const cuota_12_a = toNumberOrNullMoney(data.cuota_12_a);
        const cuota_18_a = toNumberOrNullMoney(data.cuota_18_a);
        const cuota_24_a = toNumberOrNullMoney(data.cuota_24_a);
        const cuota_30_a = toNumberOrNullMoney(data.cuota_30_a);
        const cuota_36_a = toNumberOrNullMoney(data.cuota_36_a);

        const cuota_6_b = toNumberOrNullMoney(data.cuota_6_b);
        const cuota_12_b = toNumberOrNullMoney(data.cuota_12_b);
        const cuota_18_b = toNumberOrNullMoney(data.cuota_18_b);
        const cuota_24_b = toNumberOrNullMoney(data.cuota_24_b);
        const cuota_30_b = toNumberOrNullMoney(data.cuota_30_b);
        const cuota_36_b = toNumberOrNullMoney(data.cuota_36_b);

        const producto1Precio = toNumberSafe(data.producto1Precio);
        const producto1CuotaInicial = toNumberSafe(data.producto1CuotaInicial);
        const producto2Precio = toNumberSafe(data.producto2Precio);
        const producto2CuotaInicial = toNumberSafe(data.producto2CuotaInicial);

        const seg1 = (data.segurosIds1 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);
        const seg2 = (data.segurosIds2 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);

        const totalSinSeg1 = incluirMoto1
            ? (precioBase1 + accesorios1 + documentos1 + marcacion1 - descuento1)
            : 0;

        const totalSinSeg2 = incluirMoto2
            ? (precioBase2 + accesorios2 + documentos2 + marcacion2 - descuento2)
            : 0;

        const precioTotalA = incluirMoto1 ? (totalSinSeg1 + seg1 + otroSeguro1) : 0;
        const precioTotalB = incluirMoto2 ? (totalSinSeg2 + seg2 + otroSeguro2) : 0;

        const esFinanciado = data.metodoPago !== "contado";

        const lineaA_final = incluirMoto1 ? [data.moto1?.trim(), data.modelo_a?.trim()].filter(Boolean).join(" – ") : "";
        const lineaB_final = incluirMoto2 ? [data.moto2?.trim(), data.modelo_b?.trim()].filter(Boolean).join(" – ") : null;

        const segurosA = incluirMoto1 ? mapSeguros(data.segurosIds1 as string[], otroSeguro1) : [];
        const segurosB = incluirMoto2 ? mapSeguros(data.segurosIds2 as string[], otroSeguro2) : [];

        const payload: Record<string, any> = {
            name: data.primer_nombre?.trim(),
            s_name: data.segundo_nombre?.trim(),
            last_name: data.primer_apellido?.trim(),
            s_last_name: data.segundo_apellido?.trim() || null,
            cedula: data.cedula?.trim(),
            email: data.email?.trim().toLowerCase(),
            canal_contacto: data.canal,
            pregunta: data.pregunta,



            celular: data.celular?.replace(/\D/g, "").trim(),
            fecha_nacimiento: data.fecha_nac,

            marca_a: incluirMoto1 ? data.marca1 : "",
            linea_a: lineaA_final,
            garantia_a: incluirMoto1 ? (data.garantia1 || "") : "",
            garantia_extendida_a: incluirMoto1 ? (data.garantiaExtendida1 || "no") : "no", // NUEVO

            accesorios_a: incluirMoto1 ? accesorios1 : 0,
            seguro_vida_a: incluirMoto1 ? seg1 : 0,
            seguro_mascota_s_a: 0,
            seguro_mascota_a_a: 0,
            otro_seguro_a: incluirMoto1 ? otroSeguro1 : 0,
            precio_base_a: incluirMoto1 ? precioBase1 : 0,
            precio_documentos_a: incluirMoto1 ? documentos1 : 0,
            precio_total_a: precioTotalA,
            modelo_a: incluirMoto1 ? (data.modelo_a?.trim() || "") : "",

            marca_b: incluirMoto2 ? data.marca2 : null,
            linea_b: lineaB_final,
            garantia_b: incluirMoto2 ? (data.garantia2 || "") : null,
            garantia_extendida_b: incluirMoto2 ? (data.garantiaExtendida2 || "no") : null, // NUEVO

            accesorios_b: incluirMoto2 ? accesorios2 : null,
            seguro_vida_b: incluirMoto2 ? seg2 : null,
            seguro_mascota_s_b: incluirMoto2 ? 0 : null,
            seguro_mascota_a_b: incluirMoto2 ? 0 : null,
            otro_seguro_b: incluirMoto2 ? otroSeguro2 : null,
            precio_base_b: incluirMoto2 ? precioBase2 : null,
            precio_documentos_b: incluirMoto2 ? documentos2 : null,
            precio_total_b: incluirMoto2 ? precioTotalB : null,
            modelo_b: incluirMoto2 ? (data.modelo_b?.trim() || "") : null,

            metodo_pago: METODO_PAGO_LABEL[data.metodoPago],
            tipo_pago: METODO_PAGO_LABEL[data.metodoPago],

            cuota_inicial_a: incluirMoto1 ? cuotaInicial1Num : null,
            cuota_inicial_b: incluirMoto2 ? cuotaInicial2Num : null,
            financiera: esFinanciado ? (data.financiera || null) : null,
            cant_cuotas: esFinanciado ? (data.cuotas ? Number(data.cuotas) : null) : null,

            cuota_6_a, cuota_6_b,
            cuota_12_a, cuota_12_b,
            cuota_18_a, cuota_18_b,
            cuota_24_a, cuota_24_b,
            cuota_30_a, cuota_30_b,
            cuota_36_a, cuota_36_b,

            comentario: data.comentario?.trim(),

            asesor: name,
            nombre_usuario: nombre ?? "Usuario",
            rol_usuario: rol ?? "Usuario",

            seguros_a: incluirMoto1 ? segurosA : [],
            seguros_b: incluirMoto2 ? segurosB : [],
            total_sin_seguros_a: incluirMoto1 ? totalSinSeg1 : 0,
            total_sin_seguros_b: incluirMoto2 ? totalSinSeg2 : 0,

            producto1Precio: producto1Precio,
            producto1CuotaInicial: producto1CuotaInicial,
            producto2Precio: producto2Precio,
            producto2CuotaInicial: producto2CuotaInicial,
            marcacion_a: incluirMoto1 ? marcacion1 : 0,
            marcacion_b: incluirMoto2 ? marcacion2 : null,

            foto_a: incluirMoto1 ? (data.foto_a ?? null) : null,
            foto_b: incluirMoto2 ? (data.foto_b ?? null) : null,


            descuentos_a: incluirMoto1 ? descuento1 : 0,
            descuentos_b: incluirMoto2 ? descuento2 : null,
        };

        console.log("SUBMIT (payload EXACTO BD):", payload);

        cotizacion(payload, {
            onSuccess: () => {
                reset(); // tu lógica de reseteo
                // 👇 navegar a la ruta deseada
                navigate(`/cotizaciones`);
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    const esCreditoDirecto = metodo === "credibike" || metodo === "terceros";

    React.useEffect(() => {
        if (!esCreditoDirecto) {
            setValue("cuotaInicial1", "0");
            setValue("cuotaInicial2", "0");
        }
    }, [esCreditoDirecto, setValue]);

    // Forzar garantía = "si" cuando sea crédito y la moto esté incluida
    React.useEffect(() => {
        if (esCreditoDirecto && incluirMoto1) {
            setValue("garantia1", "si", { shouldValidate: true });
        }
    }, [esCreditoDirecto, incluirMoto1, setValue]);

    React.useEffect(() => {
        if (esCreditoDirecto && incluirMoto2) {
            setValue("garantia2", "si", { shouldValidate: true });
        }
    }, [esCreditoDirecto, incluirMoto2, setValue]);

    React.useEffect(() => {
        const sel = watch("moto1");
        const m = (motos1?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            setValue("modelo_a", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento1", descuento.toString());
            const documentos =
                (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
                Number(m.impuestos) +
                Number(m.soat);
            setValue("precioDocumentos1", documentos.toString());
        }
    }, [watch("moto1"), motos1, metodo, setValue]);

    React.useEffect(() => {
        const sel = watch("moto2");
        const m = (motos2?.motos ?? []).find((x) => x.linea === sel);
        if (m) {
            setValue("modelo_b", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento2", descuento.toString());
            const documentos =
                (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
                Number(m.impuestos) +
                Number(m.soat);
            setValue("precioDocumentos2", documentos.toString());
        }
    }, [watch("moto2"), motos2, metodo, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="pt-4 mb-3">
                <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" direction="back" />
            </div>

            <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    <label className="label cursor-pointer gap-2">
                        <input
                            type="radio"
                            value="contado"
                            className="radio radio-success"
                            {...register("metodoPago", { required: true })}
                        />
                        <span className="label-text">Contado</span>
                    </label>

                    <label className="label cursor-pointer gap-2">
                        <input
                            type="radio"
                            value="credibike"
                            className="radio radio-success"
                            {...register("metodoPago", { required: true })}
                        />
                        <span className="label-text">Crédito propio</span>
                    </label>

                    <label className="label cursor-pointer gap-2">
                        <input
                            type="radio"
                            value="terceros"
                            className="radio radio-success"
                            {...register("metodoPago", { required: true })}
                        />
                        <span className="label-text">Crédito de terceros</span>
                    </label>
                </div>

                {errors.metodoPago && <p className="text-sm text-error">Selecciona una opción.</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
                    {metodo === "terceros" && (
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
                                className="mt-6"
                                control={control}
                                placeholder="cuotas"
                                rules={{
                                    required: "La cantidad de cuotas es obligatoria cuando es financiado.",
                                    validate: (v) => {
                                        const n = Number(v);
                                        if (!Number.isFinite(n)) return "Debe ser un número válido";
                                        if (!Number.isInteger(n)) return "Debe ser un número entero";
                                        if (n <= 0) return "Debe ser > 0";
                                        if (n > 36) return "No puede ser mayor a 36";
                                        return true;
                                    },
                                }}
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

                <div className="divider divider-start divider-success">
                    <div className="badge text-xl badge-success text-white">Datos Personales</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput<FormValues>
                        name="cedula"
                        label="Cédula"
                        control={control}
                        placeholder="Número de documento"
                        rules={{ required: "La cédula es obligatoria.", pattern: { value: /^[0-9]{5,20}$/, message: "Solo números (5-20 dígitos)" } }}
                    />
                    <FormInput<FormValues>
                        name="fecha_nac"
                        label="Fecha de nacimiento"
                        type="date"
                        control={control}
                        rules={{ required: "Requerido", validate: dateNotTodayOrFuture }}
                    />
                    <FormInput<FormValues> name="primer_nombre" label="Primer nombre" control={control} rules={{ required: "El primer nombre es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_nombre" label="Segundo nombre" control={control} />
                    <FormInput<FormValues> name="primer_apellido" label="Primer apellido" control={control} rules={{ required: "El primer apellido es obligatorio." }} />
                    <FormInput<FormValues> name="segundo_apellido" label="Segundo apellido" control={control} />
                    <FormInput<FormValues>
                        name="celular"
                        label="Celular"
                        control={control}
                        placeholder="3001234567"
                        rules={{ required: "El celular es obligatorio.", pattern: { value: /^[0-9]{7,12}$/, message: "Solo números (7-12 dígitos)" } }}
                    />
                    <FormInput<FormValues>
                        name="email"
                        label="Email"
                        type="email"
                        control={control}
                        placeholder="correo@dominio.com"
                        rules={{ required: "El email es obligatorio.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }}
                    />
                </div>

                {/* MOTOS */}
                {showMotos && (
                    <>
                        <div className="divider divider-start divider-success">
                            <div className="badge text-xl badge-success text-white">Datos Motocicletas</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* MOTO 1 */}
                            <div className="bg-white rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" className="checkbox checkbox-success text-white" {...register("incluirMoto1")} />
                                    <span className="label-text font-semibold">Incluir Motocicleta 1</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">

                                    <FormSelect<FormValues>
                                        name="marca1"
                                        label="Marca"
                                        control={control}
                                        options={marcaOptions}
                                        placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={reqIf(showMotos && incluirMoto1, "La marca es obligatoria")}
                                    />

                                    <FormSelect<FormValues>
                                        name="moto1"
                                        label="Moto (modelo – precio)"
                                        control={control}
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

                                    {moto1Seleccionada && (
                                        <>
                                            <FormSelect<FormValues>
                                                name="garantia1"
                                                label="¿Incluye garantía?"
                                                control={control}
                                                options={garantiaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto1 || esCreditoDirecto}  // 👈 BLOQUEA EN CRÉDITO
                                                rules={reqIf(showMotos && incluirMoto1, "La garantía es obligatoria")}
                                            />
                                            <FormSelect<FormValues>
                                                name="garantiaExtendida1"
                                                label="Garantía extendida"
                                                control={control}
                                                options={garantiaExtendidaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto1}
                                            />

                                        </>
                                    )}

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
                                                name="otroSeguro1"
                                                label="Otros seguros (monto adicional)"
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto1}
                                                rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                                formatThousands
                                            />
                                        </div>
                                    </div>

                                    {moto1Seleccionada && (
                                        <>
                                            <FormInput<FormValues>
                                                name="accesorios1"
                                                label="Cascos y Accesorios"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto1}
                                                rules={{
                                                    ...reqIf(showMotos && incluirMoto2, "Ingresa accesorios"),
                                                    validate: (v: unknown) => {
                                                        if (!showMotos || !incluirMoto2) return true;
                                                        const s = typeof v === "string" ? v : String(v ?? "");
                                                        return /^[0-9]+(\.[0-9]{3})*$/.test(s) || "Formato inválido (ej: 1.000.000)";
                                                    },
                                                }}
                                            />

                                            {esCreditoDirecto && (
                                                <FormInput<FormValues>
                                                    name="cuotaInicial1"
                                                    formatThousands
                                                    label="Cuota inicial"
                                                    control={control}
                                                    type="number"
                                                    rules={reqIf(showMotos && incluirMoto1, "Ingresa la cuota inicial")}
                                                    disabled={!showMotos || !incluirMoto1}
                                                />
                                            )}

                                            {/* Documentos oculto (se setea automático) */}
                                            <FormInput<FormValues>
                                                name="precioDocumentos1"
                                                label=""
                                                control={control}
                                                type="hidden"
                                                disabled={!showMotos || !incluirMoto1}
                                            />

                                            {/* DESCUENTO CON VALIDACIÓN */}
                                            <FormInput<FormValues>
                                                name="descuento1"
                                                label="Descuento (COP)"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto1}
                                                rules={{
                                                    min: { value: 0, message: "No puede ser negativo" },
                                                    validate: (v: unknown) => {
                                                        const val = N(v);
                                                        const max = precioBase1 + accesorios1Val + documentos1;
                                                        return val <= max || `El descuento no puede superar ${fmt(max)}`;
                                                    },
                                                }}
                                            />

                                            <p className="text-xs text-base-content/60">
                                                Máximo permitido: {fmt(precioBase1 + accesorios1Val + documentos1)}
                                            </p>

                                            <FormInput<FormValues>
                                                name="marcacion1"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto1}
                                            />

                                            {/* RESUMEN MOTO 1 */}
                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                {/* Encabezado */}
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>

                                                {/* Bloque de detalles */}
                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    {/* Precio documentos */}
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Precio documentos:</span>
                                                        <span>{fmt(documentos1)}</span>
                                                    </div>

                                                    {/* Descuento */}
                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento1Val > 0 ? `-${fmt(descuento1Val)}` : "0 COP"}
                                                        </span>
                                                    </div>

                                                    {/* Cascos y Accesorios */}
                                                    <div className="flex justify-between bg-blue-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Cascos y Accesorios:</span>
                                                        <span>{fmt(accesorios1Val)}</span>
                                                    </div>

                                                    {/* Marcación */}
                                                    <div className="flex justify-between bg-indigo-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Marcación y personalización:</span>
                                                        <span>{fmt(marcacion1Val)}</span>
                                                    </div>

                                                    {/* Inicial (si aplica) */}
                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between bg-yellow-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Inicial:</span>
                                                            <span>{fmt(inicial1)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Totales */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center bg-warning/10 px-4 py-2 rounded-md border border-warning/30 shadow-sm">
                                                        <span className="font-semibold text-warning">TOTAL SIN SEGUROS:</span>
                                                        <span className="font-bold">{fmt(totalSinSeguros1)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL CON SEGUROS:</span>
                                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros1)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    )}

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
                                        name="marca2"
                                        label="Marca"
                                        control={control}
                                        options={marcaOptions}
                                        placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto2}
                                        rules={reqIf(showMotos && incluirMoto2, "La marca es obligatoria")}
                                    />

                                    <FormSelect<FormValues>
                                        name="moto2"
                                        label="Moto (modelo – precio)"
                                        control={control}
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

                                    {moto2Seleccionada && (
                                        <>
                                            <FormSelect<FormValues>
                                                name="garantia2"
                                                label="¿Incluye garantía?"
                                                control={control}
                                                options={garantiaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto2 || esCreditoDirecto}  // 👈 BLOQUEA EN CRÉDITO
                                                rules={reqIf(showMotos && incluirMoto2, "La garantía es obligatoria")}
                                            />

                                            <FormSelect<FormValues>
                                                name="garantiaExtendida2"
                                                label="Garantía extendida"
                                                control={control}
                                                options={garantiaExtendidaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto2}
                                            />

                                        </>
                                    )}

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
                                                name="otroSeguro2"
                                                formatThousands
                                                label="Otros seguros (monto adicional)"
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto2}
                                                rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                            />
                                        </div>
                                    </div>

                                    {moto2Seleccionada && (
                                        <>
                                            <FormInput<FormValues>
                                                name="accesorios2"
                                                formatThousands
                                                label="Cascos y Accesorios"
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto2}
                                                rules={{
                                                    ...reqIf(showMotos && incluirMoto2, "Ingresa accesorios"),
                                                    validate: (v: unknown) => {
                                                        if (!showMotos || !incluirMoto2) return true;
                                                        const s = typeof v === "string" ? v : String(v ?? "");
                                                        return /^[0-9]+(\.[0-9]{3})*$/.test(s) || "Formato inválido (ej: 1.000.000)";
                                                    },
                                                    setValueAs: (v) => (v == null ? "" : String(v)),
                                                }}
                                            />

                                            {esCreditoDirecto && (
                                                <FormInput<FormValues>
                                                    name="cuotaInicial2"
                                                    formatThousands
                                                    label="Cuota inicial"
                                                    control={control}
                                                    type="number"
                                                    placeholder="0"
                                                    rules={reqIf(showMotos && incluirMoto2, "Ingresa la cuota inicial")}
                                                    disabled={!showMotos || !incluirMoto2}
                                                />
                                            )}

                                            <FormInput<FormValues>
                                                name="precioDocumentos2"
                                                label=""
                                                control={control}
                                                type="hidden"
                                                disabled={!showMotos || !incluirMoto2}
                                            />

                                            {/* DESCUENTO CON VALIDACIÓN */}
                                            <FormInput<FormValues>
                                                name="descuento2"
                                                label="Descuento (COP)"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                type="number"
                                                disabled={!showMotos || !incluirMoto2}
                                                rules={{
                                                    min: { value: 0, message: "No puede ser negativo" },
                                                    validate: (v: unknown) => {
                                                        const val = N(v);
                                                        const max = precioBase2 + accesorios2Val + documentos2;
                                                        return val <= max || `El descuento no puede superar ${fmt(max)}`;
                                                    },
                                                }}
                                            />

                                            <p className="text-xs text-base-content/60">
                                                Máximo permitido: {fmt(precioBase2 + accesorios2Val + documentos2)}
                                            </p>

                                            <FormInput<FormValues>
                                                name="marcacion2"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto2}
                                            />

                                            {/* RESUMEN MOTO 2 */}
                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                {/* Encabezado */}
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>

                                                {/* Bloque de detalles */}
                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    {/* Precio documentos */}
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Precio documentos:</span>
                                                        <span>{fmt(documentos2)}</span>
                                                    </div>

                                                    {/* Descuento */}
                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento2Val > 0 ? `-${fmt(descuento2Val)}` : "0 COP"}
                                                        </span>
                                                    </div>

                                                    {/* Cascos y Accesorios */}
                                                    <div className="flex justify-between bg-blue-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Cascos y Accesorios:</span>
                                                        <span>{fmt(accesorios2Val)}</span>
                                                    </div>

                                                    {/* Marcación */}
                                                    <div className="flex justify-between bg-indigo-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Marcación y personalización:</span>
                                                        <span>{fmt(marcacion2Val)}</span>
                                                    </div>

                                                    {/* Inicial (si aplica) */}
                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between bg-yellow-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Inicial:</span>
                                                            <span>{fmt(inicial2)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Totales */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center bg-warning/10 px-4 py-2 rounded-md border border-warning/30 shadow-sm">
                                                        <span className="font-semibold text-warning">TOTAL SIN SEGUROS:</span>
                                                        <span className="font-bold">{fmt(totalSinSeguros2)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL CON SEGUROS:</span>
                                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Cuotas manuales MOTO 1 */}
            {metodo === "terceros" && moto1Seleccionada && (
                <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-lg badge-success text-white">Cuotas Moto 1 (A)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<FormValues> formatThousands name="cuota_6_a" label="Cuota 6 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_12_a" label="Cuota 12 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_18_a" label="Cuota 18 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_24_a" label="Cuota 24 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_30_a" label="Cuota 30 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_36_a" label="Cuota 36 meses A" type="number" control={control} placeholder="Opcional" />
                    </div>
                </div>
            )}

            {/* Cuotas manuales MOTO 2 */}
            {metodo === "terceros" && moto2Seleccionada && (
                <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-lg badge-success text-white">Cuotas Moto 2 (B)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<FormValues> formatThousands name="cuota_6_b" label="Cuota 6 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_12_b" label="Cuota 12 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_18_b" label="Cuota 18 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_24_b" label="Cuota 24 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_30_b" label="Cuota 30 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValues> formatThousands name="cuota_36_b" label="Cuota 36 meses B" type="number" control={control} placeholder="Opcional" />
                    </div>
                </div>
            )}

            {/* OTROS PRODUCTOS */}
            {showProductos && (
                <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-xl badge-success text-white">Otros productos</div>
                    <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">

                        <div className="grid grid-cols-1 gap-4">
                            <FormInput<FormValues> name="producto1Nombre" label="Producto 1 *" control={control} placeholder="Producto" />
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Descripción *</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Descripción"
                                    {...register("producto1Descripcion", { maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                                />
                                {errors.producto1Descripcion && <p className="text-sm text-error">{String(errors.producto1Descripcion.message)}</p>}
                            </div>
                            <FormInput<FormValues> formatThousands name="producto1Precio" label="Precio *" type="number" control={control} placeholder="0 COP" />
                            <FormInput<FormValues> formatThousands name="producto1CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormInput<FormValues> name="producto2Nombre" label="Producto 2 *" control={control} placeholder="Producto" />
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Descripción *</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Descripción"
                                    {...register("producto2Descripcion", { maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                                />
                                {errors.producto2Descripcion && <p className="text-sm text-error">{String(errors.producto2Descripcion.message)}</p>}
                            </div>
                            <FormInput<FormValues> formatThousands name="producto2Precio" label="Precio *" type="number" control={control} placeholder="0 COP" />
                            <FormInput<FormValues> formatThousands name="producto2CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                        </div>

                    </div>
                </div>
            )}

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

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="btn btn-warning px-10"
                    disabled={isPending} // ⬅️ aquí usas isPending
                >
                    {isPending ? "Cargando..." : "Registrar"}
                </button>            </div>

        </form>
    );
};

export default CotizacionFormulario;
