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
import { useConfigPlazoByCodigo } from "../../../services/configuracionPlazoService";

const BaseUrl = import.meta.env.VITE_API_URL ?? "https://tuclick.vozipcolombia.net.co/motos/back";


type MetodoPago = "contado" | "credibike" | "terceros";

const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
    contado: "Contado",
    credibike: "Credito directo",
    terceros: "Credito de terceros",
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

    gpsContado1?: "si" | "no";
    gpsContado2?: "si" | "no";


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

    // 👇 NUEVOS
    valor_garantia_extendida_a?: string;
    valor_garantia_extendida_b?: string;

    soat_a?: string;
    impuestos_a?: string;
    matricula_a?: string;

    soat_b?: string;
    impuestos_b?: string;
    matricula_b?: string;

    valorRunt1: string;
    valorLicencia1: string;
    valorDefensas1: string;
    valorHandSavers1: string;
    valorOtrosAdicionales1: string;

    // Valores adicionales MOTO 2
    valorRunt2: string;
    valorLicencia2: string;
    valorDefensas2: string;
    valorHandSavers2: string;
    valorOtrosAdicionales2: string;

    gps_a?: string;
    gps_b?: string;

    gps1?: "no" | "12" | "24" | "36";
    gps2?: "no" | "12" | "24" | "36";

    poliza1?: "" | "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"; // Moto A
    poliza2?: "" | "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"; // Moto B

    valor_poliza_a?: string; // valor calculado A
    valor_poliza_b?: string; // valor calculado B



};

const garantiaExtendidaOptions: SelectOption[] = [
    { value: "no", label: "-----" },
    { value: "12", label: "12 meses" },
    { value: "24", label: "24 meses" },
    { value: "36", label: "36 meses" },
];


const gpsOptions: SelectOption[] = [
    { value: "no", label: "-----" },
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
            metodoPago: "credibike",
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
            valor_garantia_extendida_a: "0",
            valor_garantia_extendida_b: "0",

            valorRunt1: "0",
            valorLicencia1: "0",
            valorDefensas1: "0",
            valorHandSavers1: "0",
            valorOtrosAdicionales1: "0",

            // MOTO 2
            valorRunt2: "0",
            valorLicencia2: "0",
            valorDefensas2: "0",
            valorHandSavers2: "0",
            valorOtrosAdicionales2: "0",

            poliza1: "",
            poliza2: "",
            valor_poliza_a: "0",
            valor_poliza_b: "0",

            gpsContado1: "no",
            gpsContado2: "no",
            gps_a: "0",
            gps_b: "0",
            gps1: "no",
            gps2: "no",


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
    console.log(motos1)
    const motoOptions1: SelectOption[] = (motos1?.motos ?? []).map((m, index) => ({
        value: String(index), // 👈 valor único
        label: `${m.linea} - ${Number(m.precio_base).toLocaleString("es-CO")} COP - Modelo ${m.modelo ?? ""}`,
    }));

    const motoOptions2: SelectOption[] = (motos2?.motos ?? []).map((m, index) => ({
        value: String(index),
        label: `${m.linea} - ${Number(m.precio_base).toLocaleString("es-CO")} COP - Modelo ${m.modelo ?? ""}`,
    }));



    // Checkboxes solo para habilitar inputs de adicionales (NO van al backend)
    const [adicionalesMoto1, setAdicionalesMoto1] = React.useState({
        runt: false,
        licencia: false,
        defensas: false,
        hand: false,
        otros: false,
    });

    const [adicionalesMoto2, setAdicionalesMoto2] = React.useState({
        runt: false,
        licencia: false,
        defensas: false,
        hand: false,
        otros: false,
    });


    React.useEffect(() => {
        if (!incluirMoto1) {
            setAdicionalesMoto1({ runt: false, licencia: false, defensas: false, hand: false, otros: false });
        }
    }, [incluirMoto1]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setAdicionalesMoto2({ runt: false, licencia: false, defensas: false, hand: false, otros: false });
        }
    }, [incluirMoto2]);




    // MOTO 1
    React.useEffect(() => {
        const sel = watch("moto1");
        const index = sel !== undefined && sel !== null && sel !== "" ? Number(sel) : NaN;

        const m = Number.isNaN(index) ? null : (motos1?.motos ?? [])[index];
        if (m) {
            setValue("modelo_a", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento1", descuento.toString());

            setValue("soat_a", String(Number(m.soat) || 0));
            setValue("impuestos_a", String(Number(m.impuestos) || 0));
            setValue("matricula_a", String(getMatricula(m, metodo)));

            const documentos = getMatricula(m, metodo) + Number(m.impuestos) + Number(m.soat);
            setValue("precioDocumentos1", documentos.toString());

            setValue("foto_a", m.foto ?? null);
        }
    }, [watch("moto1"), motos1, metodo, setValue]);

    // MOTO 2
    React.useEffect(() => {
        const sel = watch("moto2");
        const index = sel !== undefined && sel !== null && sel !== "" ? Number(sel) : NaN;

        const m = Number.isNaN(index) ? null : (motos2?.motos ?? [])[index];
        if (m) {
            setValue("modelo_b", m.modelo?.trim() || "");
            const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
            setValue("descuento2", descuento.toString());

            setValue("soat_b", String(Number(m.soat) || 0));
            setValue("impuestos_b", String(Number(m.impuestos) || 0));
            setValue("matricula_b", String(getMatricula(m, metodo)));

            const documentos = getMatricula(m, metodo) + Number(m.impuestos) + Number(m.soat);
            setValue("precioDocumentos2", documentos.toString());

            setValue("foto_b", m.foto ?? null);
        }
    }, [watch("moto2"), motos2, metodo, setValue]);





    React.useEffect(() => {
        // A
        const selA = watch("moto1");
        const mA = (motos1?.motos ?? []).find((x) => x.linea === selA);
        if (mA) {
            setValue("matricula_a", String(getMatricula(mA, metodo)));
            const docsA = getMatricula(mA, metodo) + Number(mA.impuestos) + Number(mA.soat);
            setValue("precioDocumentos1", docsA.toString());
        }
        // B
        const selB = watch("moto2");
        const mB = (motos2?.motos ?? []).find((x) => x.linea === selB);
        if (mB) {
            setValue("matricula_b", String(getMatricula(mB, metodo)));
            const docsB = getMatricula(mB, metodo) + Number(mB.impuestos) + Number(mB.soat);
            setValue("precioDocumentos2", docsB.toString());
        }
    }, [metodo, motos1, motos2, watch("moto1"), watch("moto2"), setValue]);


    // const garantiaOptions: SelectOption[] = [
    //     { value: "si", label: "Sí" },
    //     { value: "no", label: "No" },
    // ];

    React.useEffect(() => { setValue("moto1", ""); }, [selectedMarca1, setValue]);
    React.useEffect(() => { setValue("moto2", ""); }, [selectedMarca2, setValue]);

    const precioBase1 = React.useMemo(() => {
        const sel = watch("moto1");
        const index = sel !== undefined && sel !== null && sel !== "" ? Number(sel) : NaN;

        const m = Number.isNaN(index) ? null : (motos1?.motos ?? [])[index];
        return m ? Number(m.precio_base) : 0;
    }, [motos1?.motos, watch("moto1")]);

    const precioBase2 = React.useMemo(() => {
        const sel = watch("moto2");
        const index = sel !== undefined && sel !== null && sel !== "" ? Number(sel) : NaN;

        const m = Number.isNaN(index) ? null : (motos2?.motos ?? [])[index];
        return m ? Number(m.precio_base) : 0;
    }, [motos2?.motos, watch("moto2")]);


    // ===== NUEVO: documentos calculados (fuente única de la verdad) =====
    // const moto1Sel = watch("moto1");
    // const moto2Sel = watch("moto2");

    const soat1 = N(watch("soat_a"));
    const imp1 = N(watch("impuestos_a"));
    const mat1 = N(watch("matricula_a"));
    const documentos1 = React.useMemo(() => {
        if (!incluirMoto1) return 0;
        return mat1 + imp1 + soat1;
    }, [mat1, imp1, soat1, incluirMoto1]);

    const soat2 = N(watch("soat_b"));
    const imp2 = N(watch("impuestos_b"));
    const mat2 = N(watch("matricula_b"));
    const documentos2 = React.useMemo(() => {
        if (!incluirMoto2) return 0;
        return mat2 + imp2 + soat2;
    }, [mat2, imp2, soat2, incluirMoto2]);


    const { data: seguros = [] } = useSeguros();

    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marca1", ""); setValue("moto1", ""); setValue("garantia1", "");
            setValue("foto_a", null);
            setValue("accesorios1", "0"); setValue("segurosIds1", []); setValue("otroSeguro1", "0");
            setValue("precioDocumentos1", "0"); setValue("descuento1", "0"); setValue("cuotaInicial1", "0");
            setValue("garantiaExtendida1", "no")
            setValue("garantiaExtendida1", "no");
            setValue("valor_garantia_extendida_a", "0"); // 👈
            setValue("soat_a", "0"); setValue("impuestos_a", "0"); setValue("matricula_a", "0");
            setValue("gps1", "no");
            setValue("gps_a", "0");
            setValue("poliza1", "");
            setValue("valor_poliza_a", "0");



        }
    }, [incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marca2", ""); setValue("moto2", ""); setValue("garantia2", "");
            setValue("foto_b", null)
            setValue("accesorios2", "0"); setValue("segurosIds2", []); setValue("otroSeguro2", "0");
            setValue("precioDocumentos2", "0"); setValue("descuento2", "0"); setValue("cuotaInicial2", "0");
            setValue("garantiaExtendida2", "no");
            setValue("garantiaExtendida2", "no");
            setValue("valor_garantia_extendida_b", "0"); // 👈
            setValue("soat_b", "0"); setValue("impuestos_b", "0"); setValue("matricula_b", "0");
            setValue("gps2", "no");
            setValue("gps_b", "0");
            setValue("poliza2", "");
            setValue("valor_poliza_b", "0");



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

    React.useEffect(() => {
        if (watch("garantiaExtendida1") === "no") setValue("valor_garantia_extendida_a", "0");
    }, [watch("garantiaExtendida1"), setValue]);

    React.useEffect(() => {
        if (watch("garantiaExtendida2") === "no") setValue("valor_garantia_extendida_b", "0");
    }, [watch("garantiaExtendida2"), setValue]);

    const reqIf = (cond: boolean, msg: string) => ({
        validate: (v: any) => (!cond ? true : (v !== undefined && v !== null && String(v).trim().length > 0) || msg),
    });

    // ====== HELPERS NUMÉRICOS (ajustado) ======
    function N(v: any): number {
        if (v === null || v === undefined || v === "") return 0;
        const s = String(v).replace(/[^\d-]/g, "");
        return s ? Number(s) : 0;
    }
    const fmt = (n: number) => n.toLocaleString("es-CO") + " COP";

    // const calcCuotaPlano = (saldo: number, meses: number): number => {
    //     if (saldo <= 0 || meses <= 0) return 0;
    //     return Math.round(saldo / meses);
    // };

    const getMatricula = (m: any, metodo: "contado" | "credibike" | "terceros") =>
        metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito);


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
    // const segurosIds1 = watch("segurosIds1") ?? [];
    const otros1 = N(watch("otroSeguro1"));
    const accesorios1Val = N(watch("accesorios1"));
    const descuento1Val = N(watch("descuento1"));
    const inicial1 = N(watch("cuotaInicial1"));
    const marcacion1Val = N(watch("marcacion1"));

    // ===== ADICIONALES MOTO 1 =====
    const extrasMoto1 =
        (adicionalesMoto1.runt ? N(watch("valorRunt1")) : 0) +
        (adicionalesMoto1.licencia ? N(watch("valorLicencia1")) : 0) +
        (adicionalesMoto1.defensas ? N(watch("valorDefensas1")) : 0) +
        (adicionalesMoto1.hand ? N(watch("valorHandSavers1")) : 0) +
        (adicionalesMoto1.otros ? N(watch("valorOtrosAdicionales1")) : 0);

    // ===== ADICIONALES MOTO 2 =====
    const extrasMoto2 =
        (adicionalesMoto2.runt ? N(watch("valorRunt2")) : 0) +
        (adicionalesMoto2.licencia ? N(watch("valorLicencia2")) : 0) +
        (adicionalesMoto2.defensas ? N(watch("valorDefensas2")) : 0) +
        (adicionalesMoto2.hand ? N(watch("valorHandSavers2")) : 0) +
        (adicionalesMoto2.otros ? N(watch("valorOtrosAdicionales2")) : 0);


    const garantiaExt1Sel = watch("garantiaExtendida1") ?? "no";
    const garantiaExtVal1 = N(watch("valor_garantia_extendida_a"));

    // ===== CÁLCULOS MOTO 2 =====
    const garantiaExt2Sel = watch("garantiaExtendida2") ?? "no";
    const garantiaExtVal2 = N(watch("valor_garantia_extendida_b"));

    const codigoMarcacion1 =
        garantiaExt1Sel !== "no" ? `MARC_${garantiaExt1Sel}` : "";

    const { data: configMarcacion1 } = useConfigPlazoByCodigo(
        codigoMarcacion1,
        Boolean(codigoMarcacion1) // enabled
    );

    // Para MOTO 2
    const codigoMarcacion2 =
        garantiaExt2Sel !== "no" ? `MARC_${garantiaExt2Sel}` : "";

    const { data: configMarcacion2 } = useConfigPlazoByCodigo(
        codigoMarcacion2,
        Boolean(codigoMarcacion2)
    );

    const { data: tasaFinanciacion } = useConfigPlazoByCodigo("TASA_FIN");

    const tasaDecimal = tasaFinanciacion ? Number(tasaFinanciacion.valor) / 100 : 0.0188;




    // Cuando cambia la garantía extendida de la MOTO 1 o llega la tarifa, actualizar marcación1
    React.useEffect(() => {
        if (!incluirMoto1) {
            // si se desmarca la moto, dejamos en 0
            setValue("marcacion1", "0");
            return;
        }

        if (garantiaExt1Sel === "no") {
            // sin garantía extendida → marcación 0
            setValue("marcacion1", "0");
            return;
        }

        // if (configMarcacion1) {
        //     // usamos el valor del servicio MARC_12 / 24 / 36
        //     setValue("marcacion1", String(configMarcacion1.valor ?? 0), {
        //         shouldDirty: true,
        //         shouldValidate: true,
        //     });
        // }

    }, [garantiaExt1Sel, configMarcacion1, incluirMoto1, setValue]);

    // Cuando cambia la garantía extendida de la MOTO 2 o llega la tarifa, actualizar marcación2
    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marcacion2", "0");
            return;
        }

        if (garantiaExt2Sel === "no") {
            setValue("marcacion2", "0");
            return;
        }

        // if (configMarcacion2) {
        //     setValue("marcacion2", String(configMarcacion2.valor ?? 0), {
        //         shouldDirty: true,
        //         shouldValidate: true,
        //     });
        // }

    }, [garantiaExt2Sel, configMarcacion2, incluirMoto2, setValue]);



    // const totalSeguros1 = (showMotos && incluirMoto1)
    //     ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros1
    //     : 0;

    const segurosIds1 = watch("segurosIds1") ?? [];
    const segurosIds2 = watch("segurosIds2") ?? [];

    const totalSeguros1 =
        (showMotos && incluirMoto1)
            ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(String(id)), 0) + otros1
            : 0;



    const gpsSel1 = watch("gps1") ?? "no";
    const gpsVal1 = N(watch("gps_a"));

    const gpsSel2 = watch("gps2") ?? "no";
    const gpsVal2 = N(watch("gps_b"));

    const polizaVal1 = N(watch("valor_poliza_a"));
    const polizaVal2 = N(watch("valor_poliza_b"));


    const totalSinSeguros1 = (showMotos && incluirMoto1)
        ? (
            precioBase1 +
            accesorios1Val +
            documentos1 +
            marcacion1Val -
            descuento1Val +
            (garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0) +
            (gpsSel1 !== "no" ? gpsVal1 : 0) +
            extrasMoto1 +
            polizaVal1
        )
        : 0;



    const totalConSeguros1 = totalSinSeguros1 + totalSeguros1;

    // ===== CÁLCULOS MOTO 2 =====
    // const segurosIds2 = watch("segurosIds2") ?? [];
    const otros2 = N(watch("otroSeguro2"));
    const accesorios2Val = N(watch("accesorios2"));
    const descuento2Val = N(watch("descuento2"));
    const inicial2 = N(watch("cuotaInicial2"));
    const marcacion2Val = N(watch("marcacion2"));


    // const totalSeguros2 = (showMotos && incluirMoto2)
    //     ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(id), 0) + otros2
    //     : 0;

    const totalSeguros2 =
        (showMotos && incluirMoto2)
            ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(String(id)), 0) + otros2
            : 0;

    const totalSinSeguros2 = (showMotos && incluirMoto2)
        ? (
            precioBase2 +
            accesorios2Val +
            documentos2 +
            marcacion2Val -
            descuento2Val +
            (garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0) +
            (gpsSel2 !== "no" ? gpsVal2 : 0) +
            extrasMoto2 +
            polizaVal2
        )
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

        // 🔹 Obtener la moto A seleccionada (por índice del select)
        const motoA =
            incluirMoto1 && motos1?.motos
                ? motos1.motos[Number(data.moto1)] ?? null
                : null;

        // 🔹 Obtener la moto B seleccionada (por índice del select)
        const motoB =
            incluirMoto2 && motos2?.motos
                ? motos2.motos[Number(data.moto2)] ?? null
                : null;

        console.log(motoA)


        // Validaciones con SweetAlert2
        const mustHaveMoto1 = showMotos && incluirMoto1;
        const mustHaveMoto2 = showMotos && incluirMoto2;

        if (mustHaveMoto1 && (!moto1Seleccionada || !Number.isFinite(precioBase1) || precioBase1 <= 0)) {
            return warn(
                "Falta información",
                "La Moto 1 es obligatoria y debe tener un precio base válido; configúralo en el módulo de motos."
            );
        }

        if (mustHaveMoto2 && (!moto2Seleccionada || !Number.isFinite(precioBase2) || precioBase2 <= 0)) {
            return warn(
                "Falta información",
                "Seleccionaste la Moto 2; también debe tener un precio base válido; configúralo en el módulo de motos."
            );
        }

        if (!data.comentario || !data.comentario.trim()) {
            return warn("Comentario obligatorio", "Debes ingresar un comentario.");
        }

        const accesorios1 = toNumberSafe(data.accesorios1);
        const accesorios2 = toNumberSafe(data.accesorios2);
        const otroSeguro1 = toNumberSafe(data.otroSeguro1);
        const otroSeguro2 = toNumberSafe(data.otroSeguro2);
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

        const valorGarantiaA = toNumberSafe(data.valor_garantia_extendida_a);
        const valorGarantiaB = toNumberSafe(data.valor_garantia_extendida_b);

        const seg1 = (data.segurosIds1 ?? []).reduce(
            (acc, id) => acc + findSeguroValor(String(id)),
            0
        );
        const seg2 = (data.segurosIds2 ?? []).reduce(
            (acc, id) => acc + findSeguroValor(String(id)),
            0
        );

        const gpsA = toNumberSafe(data.gps_a);
        const gpsB = toNumberSafe(data.gps_b);
        // const gpsSelA = data.gps1 ?? "no";
        // const gpsSelB = data.gps2 ?? "no";




        // 🔴 AQUÍ EL CAMBIO: ahora incluye garantía extendida + extrasMoto1/2,
        // igual que el cálculo visual de totalSinSeguros1/2.
        // const totalSinSeg1 = incluirMoto1
        //     ? (
        //         (precioBase1) +
        //         accesorios1 +
        //         documentos1 +
        //         marcacion1 -
        //         descuento1 +
        //         (data.garantiaExtendida1 !== "no" ? valorGarantiaA : 0) +
        //         (gpsSelA !== "no" ? gpsA : 0) +
        //         extrasMoto1
        //     )
        //     : 0;

        // const totalSinSeg2 = incluirMoto2
        //     ? (
        //         (precioBase2) +
        //         accesorios2 +
        //         documentos2 +
        //         marcacion2 -
        //         descuento2 +
        //         (data.garantiaExtendida2 !== "no" ? valorGarantiaB : 0) +
        //         (gpsSelB !== "no" ? gpsB : 0) +
        //         extrasMoto2
        //     )
        //     : 0;



        const precioTotalA = incluirMoto1 ? totalConSeguros1 : 0;
        const precioTotalB = incluirMoto2 ? totalConSeguros2 : 0;


        const esFinanciado = data.metodoPago !== "contado";

        const lineaA_final = incluirMoto1
            ? [
                motos1?.motos?.[Number(data.moto1)]?.linea ?? "",  // 👈 usa la línea real
                data.modelo_a?.trim(),
            ].filter(Boolean).join(" - ")
            : "";

        const lineaB_final = incluirMoto2
            ? [
                motos2?.motos?.[Number(data.moto2)]?.linea ?? "",
                data.modelo_b?.trim(),
            ].filter(Boolean).join(" - ")
            : null;

        const segurosA = incluirMoto1 ? mapSeguros(data.segurosIds1 as string[], otroSeguro1) : [];
        const segurosB = incluirMoto2 ? mapSeguros(data.segurosIds2 as string[], otroSeguro2) : [];


        const gpsSelContA = data.gpsContado1 ?? "no";
        const gpsSelContB = data.gpsContado2 ?? "no";


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
            garantia_extendida_a: incluirMoto1 ? (data.garantiaExtendida1 || "no") : "no",

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
            garantia_extendida_b: incluirMoto2 ? (data.garantiaExtendida2 || "no") : null,

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

            cuota_6_a: data.metodoPago === "credibike" ? cuota6_a_auto : cuota_6_a,
            cuota_6_b: data.metodoPago === "credibike" ? cuota6_b_auto : cuota_6_b,


            cuota_12_a: data.metodoPago === "credibike" ? cuota12_a_auto : cuota_12_a,
            cuota_12_b: data.metodoPago === "credibike" ? cuota12_b_auto : cuota_12_b,

            cuota_18_a,
            cuota_18_b,

            cuota_24_a: data.metodoPago === "credibike" ? cuota24_a_auto : cuota_24_a,
            cuota_24_b: data.metodoPago === "credibike" ? cuota24_b_auto : cuota_24_b,

            cuota_30_a,
            cuota_30_b,

            cuota_36_a: data.metodoPago === "credibike" ? cuota36_a_auto : cuota_36_a,
            cuota_36_b: data.metodoPago === "credibike" ? cuota36_b_auto : cuota_36_b,

            comentario: data.comentario?.trim(),

            asesor: name,
            nombre_usuario: nombre ?? "Usuario",
            rol_usuario: rol ?? "Usuario",

            seguros_a: incluirMoto1 ? segurosA : [],
            seguros_b: incluirMoto2 ? segurosB : [],
            total_sin_seguros_a: incluirMoto1 ? totalSinSeguros1 : 0,
            total_sin_seguros_b: incluirMoto2 ? totalSinSeguros2 : 0,

            producto1Precio,
            producto1CuotaInicial,
            producto2Precio,
            producto2CuotaInicial,
            marcacion_a: incluirMoto1 ? marcacion1 : 0,
            marcacion_b: incluirMoto2 ? marcacion2 : null,

            foto_a: incluirMoto1 ? (data.foto_a ?? null) : null,
            foto_b: incluirMoto2 ? (data.foto_b ?? null) : null,

            descuentos_a: incluirMoto1 ? descuento1 : 0,
            descuentos_b: incluirMoto2 ? descuento2 : null,

            valor_garantia_extendida_a:
                incluirMoto1 && data.garantiaExtendida1 !== "no" ? valorGarantiaA : 0,
            valor_garantia_extendida_b:
                incluirMoto2 && data.garantiaExtendida2 !== "no" ? valorGarantiaB : null,

            soat_a: incluirMoto1 ? N(data.soat_a) : 0,
            impuestos_a: incluirMoto1 ? N(data.impuestos_a) : 0,
            matricula_a: incluirMoto1 ? N(data.matricula_a) : 0,

            soat_b: incluirMoto2 ? N(data.soat_b) : null,
            impuestos_b: incluirMoto2 ? N(data.impuestos_b) : null,
            matricula_b: incluirMoto2 ? N(data.matricula_b) : null,

            valorRunt1: incluirMoto1 && adicionalesMoto1.runt
                ? toNumberSafe(data.valorRunt1)
                : 0,
            valorLicencia1: incluirMoto1 && adicionalesMoto1.licencia
                ? toNumberSafe(data.valorLicencia1)
                : 0,
            valorDefensas1: incluirMoto1 && adicionalesMoto1.defensas
                ? toNumberSafe(data.valorDefensas1)
                : 0,
            valorHandSavers1: incluirMoto1 && adicionalesMoto1.hand
                ? toNumberSafe(data.valorHandSavers1)
                : 0,
            valorOtrosAdicionales1: incluirMoto1 && adicionalesMoto1.otros
                ? toNumberSafe(data.valorOtrosAdicionales1)
                : 0,

            valorRunt2: incluirMoto2 && adicionalesMoto2.runt
                ? toNumberSafe(data.valorRunt2)
                : 0,
            valorLicencia2: incluirMoto2 && adicionalesMoto2.licencia
                ? toNumberSafe(data.valorLicencia2)
                : 0,
            valorDefensas2: incluirMoto2 && adicionalesMoto2.defensas
                ? toNumberSafe(data.valorDefensas2)
                : 0,
            valorHandSavers2: incluirMoto2 && adicionalesMoto2.hand
                ? toNumberSafe(data.valorHandSavers2)
                : 0,
            valorOtrosAdicionales2: incluirMoto2 && adicionalesMoto2.otros
                ? toNumberSafe(data.valorOtrosAdicionales2)
                : 0,

            saldo_financiar_a: saldoFinanciar1,
            saldo_financiar_b: saldoFinanciar2,

            // IDs de empresa según la moto A seleccionada
            id_empresa_a:
                incluirMoto1 && motoA?.id_empresa != null
                    ? Number(motoA.id_empresa)
                    : null,

            // IDs de empresa según la moto B seleccionada
            id_empresa_b:
                incluirMoto2 && motoB?.id_empresa != null
                    ? Number(motoB.id_empresa)
                    : null,

            gps_meses_a: incluirMoto1
                ? (data.metodoPago === "contado" ? gpsSelContA : (data.gps1 ?? "no"))
                : "no",

            gps_meses_b: incluirMoto2
                ? (data.metodoPago === "contado" ? gpsSelContB : (data.gps2 ?? "no"))
                : null,

            valor_gps_a: incluirMoto1
                ? (data.metodoPago === "contado"
                    ? (gpsSelContA === "si" ? gpsA : 0)
                    : ((data.gps1 ?? "no") !== "no" ? gpsA : 0))
                : 0,

            valor_gps_b: incluirMoto2
                ? (data.metodoPago === "contado"
                    ? (gpsSelContB === "si" ? gpsB : null)
                    : ((data.gps2 ?? "no") !== "no" ? gpsB : null))
                : null,

            poliza_a: incluirMoto1 ? (data.poliza1 || null) : null,
            valor_poliza_a: incluirMoto1 ? toNumberSafe(data.valor_poliza_a) : 0,

            poliza_b: incluirMoto2 ? (data.poliza2 || null) : null,
            valor_poliza_b: incluirMoto2 ? toNumberSafe(data.valor_poliza_b) : null,

        };

        console.log("SUBMIT (payload EXACTO BD):", payload);

        cotizacion(payload, {
            onSuccess: () => {
                reset();
                navigate(`/cotizaciones`);
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };


    const esCreditoDirecto = metodo === "credibike" || metodo === "terceros";

    const esCreditoDirecto2 = metodo === "credibike";

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
            const descuento = Number(m.descuento_empresa) || 0; // ✅ solo empresa
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
            const descuento = Number(m.descuento_empresa) || 0; // ✅ solo empresa
            setValue("descuento2", descuento.toString());
            const documentos =
                (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
                Number(m.impuestos) +
                Number(m.soat);
            setValue("precioDocumentos2", documentos.toString());
        }
    }, [watch("moto2"), motos2, metodo, setValue]);


    const saldoFinanciar1 =
        esCreditoDirecto && incluirMoto1
            ? Math.max(totalConSeguros1 - inicial1, 0)
            : 0;

    const saldoFinanciar2 =
        esCreditoDirecto && incluirMoto2
            ? Math.max(totalConSeguros2 - inicial2, 0)
            : 0;

    const calcCuotaConInteres = (
        saldo: number,
        meses: number,
        tasaMes: number
    ): number => {
        if (saldo <= 0 || meses <= 0 || tasaMes <= 0) return 0;

        const r = tasaMes;
        const pow = Math.pow(1 + r, meses);
        const factor = (r * pow) / (pow - 1);

        return Math.round(saldo * factor);
    };



    const fotoMoto1 = watch("foto_a");
    const fotoMoto2 = watch("foto_b");

    const hideGarantiaExtendida = metodo === "contado" || metodo === "terceros";
    const showGarantiaExtendida = showMotos && !hideGarantiaExtendida; // ✅ solo en credibike

    // Labels dinámicos para el bloque de póliza
    const polizaLabel = hideGarantiaExtendida ? "Garantía extendida" : "Póliza todo riesgo";
    const polizaValorLabel = hideGarantiaExtendida ? "Valor garantía extendida" : "Valor póliza";

    // o si prefieres: const showGarantiaExtendida = showMotos && (metodo !== "terceros" ? true : true);
    // (pero con showMotos es suficiente: si estás en motos, se muestra)

    React.useEffect(() => {
        if (metodo === "contado") {
            // En contado no usamos meses (12/24/36)
            setValue("gps1", "no");
            setValue("gps2", "no");

            // Si el usuario marca NO, fuerza 0.
            if ((watch("gpsContado1") ?? "no") === "no") setValue("gps_a", "0");
            if ((watch("gpsContado2") ?? "no") === "no") setValue("gps_b", "0");

            // Si marca SI, deja el input listo para escribir (vacío)
            if ((watch("gpsContado1") ?? "no") === "si" && watch("gps_a") === "0") setValue("gps_a", "");
            if ((watch("gpsContado2") ?? "no") === "si" && watch("gps_b") === "0") setValue("gps_b", "");
        } else {
            // En crédito no usamos el select contado
            setValue("gpsContado1", "no");
            setValue("gpsContado2", "no");
        }
    }, [metodo, setValue, watch("gpsContado1"), watch("gpsContado2")]);



    const { data: ge12 } = useConfigPlazoByCodigo("GAR_EXT_12");
    const { data: ge24 } = useConfigPlazoByCodigo("GAR_EXT_24");
    const { data: ge36 } = useConfigPlazoByCodigo("GAR_EXT_36");

    const geMap = React.useMemo(() => ({
        "12": ge12,
        "24": ge24,
        "36": ge36,
    }), [ge12, ge24, ge36]);


    const calcGarantia = (precioBase: number, cfg: any | null) => {
        if (!cfg || precioBase <= 0) return 0;

        const v = Number(cfg.valor) || 0;
        if (cfg.tipo_valor === "%") {
            return Math.round(precioBase * (v / 100));
        }
        // tipo_valor === "$" o fijo
        return Math.round(v);
    };

    React.useEffect(() => {
        if (!incluirMoto1) return;

        const sel = watch("garantiaExtendida1") ?? "no";
        if (sel === "no") {
            setValue("valor_garantia_extendida_a", "0");
            return;
        }

        const cfg = geMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGarantia(precioBase1, cfg);

        setValue("valor_garantia_extendida_a", String(val), {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [incluirMoto1, watch("garantiaExtendida1"), precioBase1, geMap, setValue]);


    React.useEffect(() => {
        if (!incluirMoto2) return;

        const sel = watch("garantiaExtendida2") ?? "no";
        if (sel === "no") {
            setValue("valor_garantia_extendida_b", "0");
            return;
        }

        const cfg = geMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGarantia(precioBase2, cfg);

        setValue("valor_garantia_extendida_b", String(val), {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [incluirMoto2, watch("garantiaExtendida2"), precioBase2, geMap, setValue]);



    const { data: gps12 } = useConfigPlazoByCodigo("GPS_12");
    const { data: gps24 } = useConfigPlazoByCodigo("GPS_24");
    const { data: gps36 } = useConfigPlazoByCodigo("GPS_36");

    const { data: polLight } = useConfigPlazoByCodigo("LIGHT");
    const { data: polTranqui } = useConfigPlazoByCodigo("TRANQUI");
    const { data: polTranquiPlus } = useConfigPlazoByCodigo("TRANQUI_PLUS");

    const { data: marcacionCoti } = useConfigPlazoByCodigo("MARC");

    const { data: segVidaCfg } = useConfigPlazoByCodigo("SEG_VIDA");


    const calcSeguroVidaMensual = (saldo: number, cfg: any | null): number => {
        if (!cfg || saldo <= 0) return 0;

        const v = Number(cfg.valor) || 0;

        // Si el backend lo manda como porcentaje (ej: 0.04% => valor = 0.04)
        if (cfg.tipo_valor === "%") {
            return Math.round(saldo * (v / 100));
        }

        // Si lo manda como "por mil" directo (x1000)
        // ej: valor=0.4 => $0.4 por cada $1000 financiados
        return Math.round((saldo / 1000) * v);
    };

    const segVidaMensualA =
        metodo === "credibike" && incluirMoto1 ? calcSeguroVidaMensual(saldoFinanciar1, segVidaCfg ?? null) : 0;

    const segVidaMensualB =
        metodo === "credibike" && incluirMoto2 ? calcSeguroVidaMensual(saldoFinanciar2, segVidaCfg ?? null) : 0;



    const cuota6_a_auto = metodo === "credibike" && incluirMoto1
        ? calcCuotaConInteres(saldoFinanciar1, 6, tasaDecimal) + segVidaMensualA
        : 0;

    const cuota12_a_auto = metodo === "credibike" && incluirMoto1
        ? calcCuotaConInteres(saldoFinanciar1, 12, tasaDecimal) + segVidaMensualA
        : 0;

    const cuota24_a_auto = metodo === "credibike" && incluirMoto1
        ? calcCuotaConInteres(saldoFinanciar1, 24, tasaDecimal) + segVidaMensualA
        : 0;

    const cuota36_a_auto = metodo === "credibike" && incluirMoto1
        ? calcCuotaConInteres(saldoFinanciar1, 36, tasaDecimal) + segVidaMensualA
        : 0;


    const cuota6_b_auto = metodo === "credibike" && incluirMoto2
        ? calcCuotaConInteres(saldoFinanciar2, 6, tasaDecimal) + segVidaMensualB
        : 0;

    const cuota12_b_auto = metodo === "credibike" && incluirMoto2
        ? calcCuotaConInteres(saldoFinanciar2, 12, tasaDecimal) + segVidaMensualB
        : 0;

    const cuota24_b_auto = metodo === "credibike" && incluirMoto2
        ? calcCuotaConInteres(saldoFinanciar2, 24, tasaDecimal) + segVidaMensualB
        : 0;

    const cuota36_b_auto = metodo === "credibike" && incluirMoto2
        ? calcCuotaConInteres(saldoFinanciar2, 36, tasaDecimal) + segVidaMensualB
        : 0;


    React.useEffect(() => {
        if (metodo === "contado") return; // 👈 clave: en contado queda manual
        const sel = watch("moto1");
        const hayMoto = sel !== undefined && sel !== null && sel !== "";
        if (!incluirMoto1) return;

        if (hayMoto) {
            const actual = N(watch("marcacion1"));
            if (actual <= 0) {
                setValue("marcacion1", String(marcacionCoti?.valor || 0), {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        }
    }, [metodo, watch("moto1"), incluirMoto1, marcacionCoti, setValue]);

    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("marcacion1", "0");
            setValue("marcacion2", "0");
        }
    }, [metodo, setValue]);


    React.useEffect(() => {
        if (metodo === "contado") return; // 👈 clave
        const sel = watch("moto2");
        const hayMoto = sel !== undefined && sel !== null && sel !== "";
        if (!incluirMoto2) return;

        if (hayMoto) {
            const actual = N(watch("marcacion2"));
            if (actual <= 0) {
                setValue("marcacion2", String(marcacionCoti?.valor || 0), {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        }
    }, [metodo, watch("moto2"), incluirMoto2, marcacionCoti, setValue]);


    const gpsMap = React.useMemo(() => ({
        "12": gps12,
        "24": gps24,
        "36": gps36,
    }), [gps12, gps24, gps36]);


    const polizaMap = React.useMemo(() => ({
        LIGHT: polLight,
        TRANQUI: polTranqui,
        TRANQUI_PLUS: polTranquiPlus,
    }), [polLight, polTranqui, polTranquiPlus]);


    const polizaOptions: SelectOption[] = [
        { value: "", label: "-----" },
        { value: "LIGHT", label: "LIGHT (3%)" },
        { value: "TRANQUI", label: "TRANQUI (10%)" },
        { value: "TRANQUI_PLUS", label: "TRANQUI PLUS (11%)" },
    ];



    const calcPoliza = (precioBase: number, cfg: any | null) => {
        if (!cfg || precioBase <= 0) return 0;

        const v = Number(cfg.valor) || 0;

        if (cfg.tipo_valor === "%") {
            return Math.round(precioBase * (v / 100));
        }

        return Math.round(v); // fijo $
    };



    React.useEffect(() => {
        if (!incluirMoto1) return;

        const sel = watch("poliza1") ?? "";
        if (!sel) {
            setValue("valor_poliza_a", "0");
            return;
        }

        const cfg = polizaMap[sel as "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"] ?? null;
        const val = calcPoliza(precioBase1, cfg);

        setValue("valor_poliza_a", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto1, watch("poliza1"), precioBase1, polizaMap, setValue]);



    React.useEffect(() => {
        if (!incluirMoto2) return;

        const sel = watch("poliza2") ?? "";
        if (!sel) {
            setValue("valor_poliza_b", "0");
            return;
        }

        const cfg = polizaMap[sel as "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"] ?? null;
        const val = calcPoliza(precioBase2, cfg);

        setValue("valor_poliza_b", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto2, watch("poliza2"), precioBase2, polizaMap, setValue]);



    const calcGps = (precioBase: number, cfg: any | null) => {
        if (!cfg) return 0;

        const v = Number(cfg.valor) || 0;
        if (cfg.tipo_valor === "%") {
            return Math.round(precioBase * (v / 100));
        }
        return Math.round(v); // "$"
    };

    React.useEffect(() => {
        if (!incluirMoto1) return;
        if (metodo === "contado") return; // 👈 esto evita autollenado

        const sel = watch("gps1") ?? "no";
        if (sel === "no") {
            setValue("gps_a", "0");
            return;
        }

        const cfg = gpsMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGps(precioBase1, cfg);

        setValue("gps_a", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto1, watch("gps1"), precioBase1, gpsMap, setValue]);


    React.useEffect(() => {
        if (!incluirMoto2) return;
        if (metodo === "contado") return;

        const sel = watch("gps2") ?? "no";
        if (sel === "no") {
            setValue("gps_b", "0");
            return;
        }

        const cfg = gpsMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGps(precioBase2, cfg);

        setValue("gps_b", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto2, watch("gps2"), precioBase2, gpsMap, setValue]);





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
                                control={control}
                                className="mt-6"
                                placeholder="Ingrese cantidad de cuotas"
                                type="number"
                                rules={{
                                    required: "La cantidad de cuotas es obligatoria cuando es financiado.",
                                    min: {
                                        value: 1,
                                        message: "La cantidad mínima es 1 cuota",
                                    },
                                    max: {
                                        value: 40,
                                        message: "La cantidad máxima es 40 cuotas",
                                    },
                                    validate: (value) =>
                                        Number.isInteger(Number(value)) || "Solo se permiten números enteros",
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
                <div className="hidden gap-10 bg-white p-3 rounded-xl justify-center">
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
                        rules={{
                            required: "El celular es obligatorio.",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Debe tener exactamente 10 números."
                            }
                        }}
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
                                            {/* Imagen Moto 1 */}
                                            {incluirMoto1 && (
                                                <div className="mt-2 flex justify-center">
                                                    <MotoImage
                                                        src={fotoMoto1 ? `${BaseUrl}/${fotoMoto1}` : undefined}

                                                        thumbClassName="w-32 h-32"
                                                    />
                                                </div>
                                            )}

                                            {/* <FormSelect<FormValues>
                                                name="garantia1"
                                                label="¿Incluye garantía?"
                                                control={control}
                                                options={garantiaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto1 || esCreditoDirecto}  // 👈 BLOQUEA EN CRÉDITO
                                                rules={reqIf(showMotos && incluirMoto1, "La garantía es obligatoria")}
                                            /> */}

                                            {showGarantiaExtendida && (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="garantiaExtendida1"
                                                        label="Garantia Extendida"
                                                        control={control}
                                                        options={garantiaExtendidaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto1}
                                                        rules={{
                                                            validate: (v) => {
                                                                if (esCreditoDirecto2 && incluirMoto1) {
                                                                    return v && v !== "no"
                                                                        ? true
                                                                        : "La garantía extendida es obligatoria para crédito directo.";
                                                                }
                                                                return true;
                                                            },
                                                        }}
                                                    />

                                                    {watch("garantiaExtendida1") !== "no" && (
                                                        <FormInput<FormValues>
                                                            name="valor_garantia_extendida_a"
                                                            label="Valor garantía extendida A"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1}
                                                            rules={{
                                                                required: "Ingresa el valor de la garantía extendida",
                                                                min: { value: 0, message: "No puede ser negativo" },
                                                                setValueAs: (v) => (v === "" ? "" : String(v)),
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}



                                            {metodo === "contado" ? (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="gpsContado1"
                                                        label="GPS"
                                                        control={control}
                                                        options={[
                                                            { value: "no", label: "No" },
                                                            { value: "si", label: "Sí" },
                                                        ]}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto1}
                                                    />

                                                    {(watch("gpsContado1") ?? "no") === "si" && (
                                                        <FormInput<FormValues>
                                                            name="gps_a"
                                                            label="Valor GPS A"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="Escribe el valor"
                                                            disabled={!showMotos || !incluirMoto1}   // ✅ editable
                                                            rules={{
                                                                validate: (v) => {
                                                                    if (!incluirMoto1) return true;
                                                                    if ((watch("gpsContado1") ?? "no") !== "si") return true;
                                                                    return N(v) > 0 ? true : "El valor del GPS debe ser mayor a 0.";
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="gps1"
                                                        label="GPS"
                                                        control={control}
                                                        options={gpsOptions}  // 12/24/36/no
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto1}
                                                        rules={{
                                                            validate: (v) => {
                                                                if (esCreditoDirecto && incluirMoto1) {
                                                                    return v && v !== "no" ? true : "El GPS es obligatorio para crédito.";
                                                                }
                                                                return true;
                                                            },
                                                        }}
                                                    />

                                                    {watch("gps1") !== "no" && (
                                                        <FormInput<FormValues>
                                                            name="gps_a"
                                                            label="Valor GPS A"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled   // ✅ calculado en crédito
                                                        />
                                                    )}
                                                </>
                                            )}



                                            {!esCreditoDirecto2 && (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="poliza1"
                                                        label={polizaLabel}
                                                        control={control}
                                                        options={polizaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto1}
                                                    />

                                                    {watch("poliza1") && watch("poliza1") !== "" && (
                                                        <FormInput<FormValues>
                                                            name="valor_poliza_a"
                                                            label={`${polizaValorLabel} A`}
                                                            control={control}
                                                            type="number"
                                                            formatThousands
                                                            disabled
                                                        />
                                                    )}


                                                </ >
                                            )}

                                        </>
                                    )}

                                    {/* SEGUROS MULTI */}
                                    {/* <div className="p-3 rounded-md bg-[#3498DB] ">
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
                                    </div> */}

                                    {/* SOLO INPUT OTROS SEGUROS (SIN CHECKBOXES) */}
                                    <div className="p-3 rounded-md bg-[#3498DB]">
                                        <p className="font-semibold mb-2 text-white">Seguro todo riesgo</p>

                                        <FormInput<FormValues>
                                            name="otroSeguro1"
                                            label="Valor seguro todo riesgo"
                                            control={control}
                                            placeholder="0"
                                            type="number"
                                            disabled={!showMotos || !incluirMoto1}
                                            rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                            formatThousands
                                        />
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
                                                    ...reqIf(showMotos && incluirMoto1, "Ingresa accesorios"),
                                                    validate: (v: unknown) => {
                                                        if (!showMotos || !incluirMoto1) return true;
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


                                            <FormInput<FormValues>
                                                name="marcacion1"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto1}
                                            />


                                            {/* DESCUENTO CON VALIDACIÓN */}
                                            <FormInput<FormValues>
                                                name="descuento1"
                                                label="Descuento / Plan de marca"
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


                                            {/* PRODUCTOS / SERVICIOS ADICIONALES MOTO 1 */}
                                            <div className="rounded-xl border border-base-200 p-3 space-y-3 bg-base-100">
                                                <p className="font-semibold text-sm">Productos y servicios adicionales (Moto 1)</p>

                                                <div className="grid grid-cols-2 gap-4">

                                                    {/* RUNT */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto1.runt}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto1((prev) => ({ ...prev, runt: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto1}
                                                            />
                                                            <span>Inscripción RUNT</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorRunt1"
                                                            label=""                 // 👈 OBLIGATORIO PARA EL TIPO
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.runt}
                                                        />
                                                    </div>

                                                    {/* Licencias */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto1.licencia}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto1((prev) => ({ ...prev, licencia: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto1}
                                                            />
                                                            <span>Licencias</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorLicencia1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.licencia}
                                                        />
                                                    </div>

                                                    {/* Defensas */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto1.defensas}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto1((prev) => ({ ...prev, defensas: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto1}
                                                            />
                                                            <span>Defensas</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorDefensas1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.defensas}
                                                        />
                                                    </div>

                                                    {/* Hand savers */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto1.hand}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto1((prev) => ({ ...prev, hand: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto1}
                                                            />
                                                            <span>Hand savers</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorHandSavers1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.hand}
                                                        />
                                                    </div>

                                                    {/* Otros */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto1.otros}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto1((prev) => ({ ...prev, otros: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto1}
                                                            />
                                                            <span>Otros adicionales</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorOtrosAdicionales1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.otros}
                                                        />
                                                    </div>

                                                </div>
                                            </div>

                                            {/* RESUMEN MOTO 1 */}
                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                {/* Encabezado */}
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>

                                                {/* Bloque de detalles */}
                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    {/* Precio documentos */}
                                                    {/* <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula y SOAT:</span>
                                                        <span>{fmt(documentos1)}</span>
                                                    </div> */}

                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula:</span>
                                                        <span>{fmt(mat1)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Impuestos:</span>
                                                        <span>{fmt(imp1)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">SOAT:</span>
                                                        <span>{fmt(soat1)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-semibold text-gray-800">Documentos (M+I+S):</span>
                                                        <span className="font-semibold">{fmt(documentos1)}</span>
                                                    </div>

                                                    {/* 🔹 Costos adicionales */}
                                                    <div className="flex justify-between bg-purple-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">
                                                            Costos adicionales (RUNT, licencias, defensas, etc.):
                                                        </span>
                                                        <span>{fmt(extrasMoto1)}</span>
                                                    </div>


                                                    {/* Descuento */}
                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento / Plan de marca:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento1Val > 0 ? `-${fmt(descuento1Val)}` : "0 COP"}
                                                        </span>
                                                    </div>

                                                    {/* Garantía extendida (si aplica) */}
                                                    {garantiaExt1Sel !== "no" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                Garantía extendida ({garantiaExt1Sel} meses):
                                                            </span>
                                                            <span>{fmt(garantiaExtVal1)}</span>
                                                        </div>
                                                    )}


                                                    {gpsSel1 !== "no" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                GPS ({gpsSel1} meses):
                                                            </span>
                                                            <span>{fmt(gpsVal1)}</span>
                                                        </div>
                                                    )}

                                                    {watch("poliza1") && watch("poliza1") !== "" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium">{polizaLabel} {watch("poliza1")}:</span>
                                                            <span>{fmt(polizaVal1)}</span>
                                                        </div>
                                                    )}


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


                                                    {/* Seguro todo riesgo (si aplica) */}
                                                    {totalSeguros1 > 0 && (
                                                        <div className="flex justify-between bg-[#3498DB]/10 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Seguro todo riesgo:</span>
                                                            <span>{fmt(totalSeguros1)}</span>
                                                        </div>
                                                    )}



                                                </div>






                                                {/* Totales */}
                                                <div className="space-y-2">

                                                    <div className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300 shadow-sm">
                                                        <span className="font-semibold">PRECIO BASE:</span>
                                                        <span className="font-extrabold">{fmt(precioBase1)}</span>
                                                    </div>


                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL:</span>
                                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros1)}</span>
                                                    </div>

                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between items-center bg-info/10 px-4 py-2 rounded-md border border-info/30 shadow-sm">
                                                            <span className="font-semibold text-info">SALDO A FINANCIAR:</span>
                                                            <span className="font-bold">{fmt(saldoFinanciar1)}</span>
                                                        </div>


                                                    )}

                                                    {metodo === "credibike" && incluirMoto1 && saldoFinanciar1 > 0 && (
                                                        <div className="mt-3 bg-base-100 border border-base-300 rounded-lg p-3 space-y-1">
                                                            <p className="font-semibold text-sm">Cuotas proyectadas</p>

                                                            {/* <div className="flex justify-between text-sm">
                                                                <span>Seguro de vida mensual:</span>
                                                                <span>{fmt(segVidaMensualA)}</span>
                                                            </div> */}


                                                            <div className="flex justify-between text-sm">
                                                                <span>6 meses:</span>
                                                                <span>{fmt(cuota6_a_auto)}</span>
                                                            </div>

                                                            <div className="flex justify-between text-sm">
                                                                <span>12 meses:</span>
                                                                <span>{fmt(cuota12_a_auto)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>24 meses:</span>
                                                                <span>{fmt(cuota24_a_auto)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>36 meses:</span>
                                                                <span>{fmt(cuota36_a_auto)}</span>
                                                            </div>
                                                        </div>
                                                    )}



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
                                            {/* Imagen Moto 2 */}
                                            {incluirMoto2 && (
                                                <div className="mt-2 flex justify-center">
                                                    <MotoImage
                                                        src={fotoMoto2 ? `${BaseUrl}/${fotoMoto2}` : undefined}

                                                        thumbClassName="w-32 h-32"
                                                    />
                                                </div>
                                            )}


                                            {/* 
                                            <FormSelect<FormValues>
                                                name="garantia2"
                                                label="¿Incluye garantía?"
                                                control={control}
                                                options={garantiaOptions}
                                                placeholder="Seleccione..."
                                                disabled={!showMotos || !incluirMoto2 || esCreditoDirecto}  // 👈 BLOQUEA EN CRÉDITO
                                                rules={reqIf(showMotos && incluirMoto2, "La garantía es obligatoria")}
                                            /> */}

                                            {showGarantiaExtendida && (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="garantiaExtendida2"
                                                        label="Garantia Extendida"
                                                        control={control}
                                                        options={garantiaExtendidaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                        rules={{
                                                            validate: (v) => {
                                                                // Si es crédito directo (credibike) y la moto 2 está incluida,
                                                                // NO se permite "no"
                                                                if (esCreditoDirecto2 && incluirMoto2) {
                                                                    return v && v !== "no"
                                                                        ? true
                                                                        : "La garantía extendida es obligatoria para crédito directo.";
                                                                }
                                                                return true;
                                                            },
                                                        }}
                                                    />

                                                    {watch("garantiaExtendida2") !== "no" && (
                                                        <FormInput<FormValues>
                                                            name="valor_garantia_extendida_b"
                                                            label="Valor garantía extendida B"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2}
                                                            rules={{
                                                                required: "Ingresa el valor de la garantía extendida",
                                                                min: { value: 0, message: "No puede ser negativo" },
                                                                setValueAs: (v) => (v === "" ? "" : String(v)),
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {metodo === "contado" ? (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="gpsContado2"
                                                        label="GPS"
                                                        control={control}
                                                        options={[
                                                            { value: "no", label: "No" },
                                                            { value: "si", label: "Sí" },
                                                        ]}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />

                                                    {(watch("gpsContado2") ?? "no") === "si" && (
                                                        <FormInput<FormValues>
                                                            name="gps_b"
                                                            label="Valor GPS B"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="Escriba el valor"
                                                            disabled={!showMotos || !incluirMoto2}   // ✅ editable
                                                            rules={{
                                                                validate: (v) => {
                                                                    if (!incluirMoto2) return true;
                                                                    if ((watch("gpsContado2") ?? "no") !== "si") return true;
                                                                    return N(v) > 0 ? true : "El valor del GPS debe ser mayor a 0.";
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect<FormValues>
                                                        name="gps2"
                                                        label="GPS"
                                                        control={control}
                                                        options={gpsOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />

                                                    {watch("gps2") !== "no" && (
                                                        <FormInput<FormValues>
                                                            name="gps_b"
                                                            label="Valor GPS B"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled   // calculado automático en crédito
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {!esCreditoDirecto2 && (
                                                <>

                                                    <FormSelect<FormValues>
                                                        name="poliza2"
                                                        label={polizaLabel}                 // ✅ dinámico
                                                        control={control}
                                                        options={polizaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />

                                                    {watch("poliza2") && watch("poliza2") !== "" && (
                                                        <FormInput<FormValues>
                                                            name="valor_poliza_b"
                                                            label={`${polizaValorLabel} B`}    // ✅ dinámico
                                                            control={control}
                                                            type="number"
                                                            formatThousands
                                                            disabled
                                                        />
                                                    )}

                                                </>)}

                                        </>
                                    )}

                                    {/* SEGUROS MULTI */}
                                    {/* <div className="p-3 rounded-md bg-[#3498DB]">
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
                                    </div> */}

                                    {/* SOLO INPUT OTROS SEGUROS (SIN CHECKBOXES) */}
                                    <div className="p-3 rounded-md bg-[#3498DB]">
                                        <p className="font-semibold mb-2 text-white">Seguro todo riesgo</p>

                                        <FormInput<FormValues>
                                            name="otroSeguro2"
                                            label="Valor seguro todo riesgo"
                                            control={control}
                                            placeholder="0"
                                            type="number"
                                            disabled={!showMotos || !incluirMoto2}
                                            rules={{ setValueAs: (v) => (v === "" ? "" : Number(v)) }}
                                            formatThousands
                                        />
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


                                            <FormInput<FormValues>
                                                name="marcacion2"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto2}
                                            />



                                            {/* DESCUENTO CON VALIDACIÓN */}
                                            <FormInput<FormValues>
                                                name="descuento2"
                                                label="Descuento / Plan de marca"
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

                                            {/* PRODUCTOS / SERVICIOS ADICIONALES MOTO 2 */}
                                            <div className="rounded-xl border border-base-200 p-3 space-y-3 bg-base-100">
                                                <p className="font-semibold text-sm">Productos y servicios adicionales (Moto 2)</p>

                                                <div className="grid grid-cols-2 gap-4">

                                                    {/* RUNT */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto2.runt}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto2((prev) => ({ ...prev, runt: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto2}
                                                            />
                                                            <span>Inscripción RUNT</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorRunt2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.runt}
                                                        />
                                                    </div>

                                                    {/* Licencias */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto2.licencia}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto2((prev) => ({ ...prev, licencia: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto2}
                                                            />
                                                            <span>Licencias</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorLicencia2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.licencia}
                                                        />
                                                    </div>

                                                    {/* Defensas */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto2.defensas}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto2((prev) => ({ ...prev, defensas: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto2}
                                                            />
                                                            <span>Defensas</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorDefensas2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.defensas}
                                                        />
                                                    </div>

                                                    {/* Hand savers */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto2.hand}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto2((prev) => ({ ...prev, hand: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto2}
                                                            />
                                                            <span>Hand savers</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorHandSavers2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.hand}
                                                        />
                                                    </div>

                                                    {/* Otros */}
                                                    <div className="flex flex-col">
                                                        <label className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-success checkbox-sm"
                                                                checked={adicionalesMoto2.otros}
                                                                onChange={(e) =>
                                                                    setAdicionalesMoto2((prev) => ({ ...prev, otros: e.target.checked }))
                                                                }
                                                                disabled={!showMotos || !incluirMoto2}
                                                            />
                                                            <span>Otros adicionales</span>
                                                        </label>
                                                        <FormInput<FormValues>
                                                            name="valorOtrosAdicionales2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.otros}
                                                        />
                                                    </div>

                                                </div>
                                            </div>



                                            {/* RESUMEN MOTO 2 */}
                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                {/* Encabezado */}
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>




                                                {/* Bloque de detalles */}
                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    {/* Precio documentos */}
                                                    {/* <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula y SOAT:</span>
                                                        <span>{fmt(documentos2)}</span>
                                                    </div> */}

                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula:</span>
                                                        <span>{fmt(mat2)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Impuestos:</span>
                                                        <span>{fmt(imp2)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">SOAT:</span>
                                                        <span>{fmt(soat2)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm border-t pt-2">
                                                        <span className="font-semibold text-gray-800">Documentos (M+I+S):</span>
                                                        <span className="font-semibold">{fmt(documentos2)}</span>
                                                    </div>

                                                    {/* 🔹 Costos adicionales */}
                                                    <div className="flex justify-between bg-purple-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">
                                                            Costos adicionales (RUNT, licencias, defensas, etc.):
                                                        </span>
                                                        <span>{fmt(extrasMoto2)}</span>
                                                    </div>

                                                    {/* Descuento */}
                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento / Plan de marca:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento2Val > 0 ? `-${fmt(descuento2Val)}` : "0 COP"}
                                                        </span>
                                                    </div>


                                                    {/* Garantía extendida (si aplica) */}
                                                    {garantiaExt2Sel !== "no" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                Garantía extendida ({garantiaExt2Sel} meses):
                                                            </span>
                                                            <span>{fmt(garantiaExtVal2)}</span>
                                                        </div>
                                                    )}


                                                    {gpsSel2 !== "no" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                GPS ({gpsSel2} meses):
                                                            </span>
                                                            <span>{fmt(gpsVal2)}</span>
                                                        </div>
                                                    )}


                                                    {watch("poliza2") && watch("poliza2") !== "" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium">{polizaLabel} {watch("poliza2")}:</span>
                                                            <span>{fmt(polizaVal2)}</span>
                                                        </div>
                                                    )}


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

                                                    {/* Seguro todo riesgo (si aplica) */}
                                                    {totalSeguros2 > 0 && (
                                                        <div className="flex justify-between bg-[#3498DB]/10 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Seguro todo riesgo:</span>
                                                            <span>{fmt(totalSeguros2)}</span>
                                                        </div>
                                                    )}

                                                </div>


                                                {/* Totales */}
                                                <div className="space-y-2">

                                                    <div className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300 shadow-sm">
                                                        <span className="font-semibold">PRECIO BASE:</span>
                                                        <span className="font-extrabold">{fmt(precioBase2)}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL:</span>
                                                        <span className="text-success font-extrabold text-lg">{fmt(totalConSeguros2)}</span>
                                                    </div>


                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between items-center bg-info/10 px-4 py-2 rounded-md border border-info/30 shadow-sm">
                                                            <span className="font-semibold text-info">SALDO A FINANCIAR:</span>
                                                            <span className="font-bold">{fmt(saldoFinanciar2)}</span>
                                                        </div>
                                                    )}

                                                    {metodo === "credibike" && incluirMoto2 && saldoFinanciar2 > 0 && (
                                                        <div className="mt-3 bg-base-100 border border-base-300 rounded-lg p-3 space-y-1">
                                                            <p className="font-semibold text-sm">Cuotas proyectadas</p>


                                                            <div className="flex justify-between text-sm">
                                                                <span>Seguro de vida mensual:</span>
                                                                <span>{fmt(segVidaMensualB)}</span>
                                                            </div>


                                                            <div className="flex justify-between text-sm">
                                                                <span>6 meses:</span>
                                                                <span>{fmt(cuota6_b_auto)}</span>
                                                            </div>


                                                            <div className="flex justify-between text-sm">
                                                                <span>12 meses:</span>
                                                                <span>{fmt(cuota12_b_auto)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>24 meses:</span>
                                                                <span>{fmt(cuota24_b_auto)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>36 meses:</span>
                                                                <span>{fmt(cuota36_b_auto)}</span>
                                                            </div>
                                                        </div>
                                                    )}

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
                <div className="hidden gap-6 flex-col w-full bg-white p-3 rounded-xl">
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
                <div className="hidden gap-6 flex-col w-full bg-white p-3 rounded-xl">
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
                <div className=" gap-6 hidden flex-col w-full bg-white p-3 rounded-xl">
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

            {metodo === "credibike" && (
                <p className="text-xs text-base-content/70">
                    Tasa de financiación: <strong>{tasaFinanciacion?.valor ?? "1.88"}% M.V.</strong>
                </p>

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



import { Bike, X } from "lucide-react";

type MotoImageProps = {
    src?: string;
    alt?: string;
    thumbClassName?: string; // ej: "w-24 h-24" (default)
};

const MotoImage: React.FC<MotoImageProps> = ({
    src,
    alt = "Imagen de la moto",
    thumbClassName = "w-24 h-24",
}) => {
    const [error, setError] = React.useState(false);
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const uid = React.useId();

    const showPlaceholder = !src || error;

    const openModal = () => {
        if (!showPlaceholder) {
            dialogRef.current?.showModal();
        }
    };

    const closeModal = () => dialogRef.current?.close();

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            {/* Thumb / disparador */}
            <button
                type="button"
                onClick={openModal}
                className={`hover:opacity-90 transition ${showPlaceholder ? "cursor-not-allowed" : "cursor-zoom-in"}`}
                aria-haspopup="dialog"
                aria-controls={`moto-modal-${uid}`}
                aria-disabled={showPlaceholder}
                title={showPlaceholder ? "Sin imagen" : "Ver imagen"}
            >
                <div className="rounded-xl border border-base-300/60 overflow-hidden bg-base-200 flex items-center justify-center p-2">
                    {showPlaceholder ? (
                        <div className="text-center p-4">
                            <Bike className="w-10 h-10 opacity-40 mx-auto mb-2" />
                            <p className="text-xs opacity-60">Aquí va la imagen de la moto</p>
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={alt}
                            className={`${thumbClassName} object-contain size-44`}
                            onError={() => setError(true)}
                            loading="lazy"
                        />
                    )}
                </div>
            </button>

            {/* Modal daisyUI */}
            <dialog ref={dialogRef} id={`moto-modal-${uid}`} className="modal">
                <div className="modal-box max-w-4xl p-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                        <h3 className="font-semibold text-base">{alt}</h3>
                        <button onClick={closeModal} className="btn btn-ghost btn-sm" aria-label="Cerrar">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-0">
                        {!showPlaceholder && (
                            <img
                                src={src}
                                alt={alt}
                                className="w-full h-auto max-h-[75vh] object-contain bg-base-200"
                                onError={() => setError(true)}
                            />
                        )}
                        {showPlaceholder && (
                            <div className="w-full h-[60vh] bg-base-200 flex flex-col items-center justify-center">
                                <Bike className="w-16 h-16 opacity-40 mb-3" />
                                <p className="opacity-70">No hay imagen disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
};
