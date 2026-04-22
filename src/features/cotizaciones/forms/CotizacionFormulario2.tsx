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
import { useConfigPlazoByCodigo } from "../../../services/configuracionPlazoService";
import type { FormValuesCotizacion } from "../types";
import { fmtCOP, toNumberOrNullMoney, toNumberSafe } from "../../../utils/money";
import { garantiaExtendidaOptions } from "../../../shared/components/options/garantia-extendida-options";
import { aNumeroOUndefined } from "../../../utils/number";
import MotoImage from "../detalles-cotizacion/sub-components/MotoImage";
import { BASE_URL } from "../../../utils/url";
import { gpsOptions } from "../../../shared/components/options/gps-options";
import { buildMotoOptions } from "./motoHelpers";
import { alert } from "../../../utils/alerts";
import { METODO_PAGO_LABEL } from "../../../shared/components/tipo-pago-label";
import { dateNotTodayOrFuture } from "../../../utils/dateValidatorFutura";
import { polizaOptions } from "../../../shared/components/options/poliza-options";
import { calcGarantia, calcGps, calcPoliza, getMatricula } from "./cotizacion.helpers";
import { useIvaDecimal } from "../../../services/ivaServices";
import { calcularCreditoDirectoMoto, logCreditoDirectoMoto } from "../../../shared/components/credito/creditoDirecto.utils";
import { useBuscarClientePorCedula } from "../../../services/clientesServices";
import { Search } from "lucide-react";


const getMotoByIndex = <T,>(
    motos: T[] | undefined,
    selected: string | null | undefined
): T | null => {
    const index = selected !== undefined && selected !== null && selected !== "" ? Number(selected) : NaN;
    return Number.isNaN(index) ? null : (motos ?? [])[index] ?? null;
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
    } = useForm<FormValuesCotizacion>({
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

            garantiaExtendida1: "no",

            accesorios1: "0",
            segurosIds1: [],
            otroSeguro1: "0",
            precioDocumentos1: "",
            descuento1: "0",
            cuotaInicial1: "0",

            marca2: "",
            moto2: "",
            garantia2: "",
            garantiaExtendida2: "no",

            accesorios2: "0",
            segurosIds2: [],
            otroSeguro2: "0",
            precioDocumentos2: "",
            descuento2: "0",
            cuotaInicial2: "0",

            cuota_6_a: "",
            cuota_6_b: "",
            cuota_12_a: "",
            cuota_12_b: "",
            cuota_18_a: "",
            cuota_18_b: "",
            cuota_24_a: "",
            cuota_24_b: "",
            cuota_30_a: "",
            cuota_30_b: "",
            cuota_36_a: "",
            cuota_36_b: "",

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

    // HOOKS
    const { mutate: cotizacion, isPending } = useCreateCotizaciones();
    const { data: canales, isPending: loadingCanales } = useCanales();
    const { data: preguntas, isPending: loadingPregs } = usePreguntas();
    const { data: financieras, isPending: loadingFinancieras } = useFinancieras();

    const {
        porcentaje,
        isLoading: ivaLoading,
        error: ivaError,
    } = useIvaDecimal();




    const IVA_PCT = ivaLoading || ivaError ? 19 : Number(porcentaje ?? 19);


    // AUTH
    const name = useAuthStore((s) => s.user?.name);
    const telefonoAsesor = useAuthStore((s) => s.user?.telefono) ?? "";
    const rol = useAuthStore((s) => s.user?.rol);

    // WATCHED VALUES
    const metodo = watch("metodoPago");
    const incluirMoto1 = watch("incluirMoto1");
    const incluirMoto2 = watch("incluirMoto2");
    const categoria = watch("categoria");

    const marca1Value = watch("marca1");
    const marca2Value = watch("marca2");
    const moto1Value = watch("moto1");
    const moto2Value = watch("moto2");

    const garantiaExtendida1Value = watch("garantiaExtendida1") ?? "no";
    const garantiaExtendida2Value = watch("garantiaExtendida2") ?? "no";

    const gps1Value = watch("gps1") ?? "no";
    const gps2Value = watch("gps2") ?? "no";
    const gpsContado1Value = watch("gpsContado1") ?? "no";
    const gpsContado2Value = watch("gpsContado2") ?? "no";

    const poliza1Value = watch("poliza1") ?? "";
    const poliza2Value = watch("poliza2") ?? "";

    const fotoMoto1 = watch("foto_a");
    const fotoMoto2 = watch("foto_b");

    const segurosIds1 = watch("segurosIds1") ?? [];
    const segurosIds2 = watch("segurosIds2") ?? [];

    const soatAValue = watch("soat_a");
    const impuestosAValue = watch("impuestos_a");
    const matriculaAValue = watch("matricula_a");

    const soatBValue = watch("soat_b");
    const impuestosBValue = watch("impuestos_b");
    const matriculaBValue = watch("matricula_b");

    const accesorios1Value = watch("accesorios1");
    const accesorios2Value = watch("accesorios2");
    const descuento1Value = watch("descuento1");
    const descuento2Value = watch("descuento2");
    const cuotaInicial1Value = watch("cuotaInicial1");
    const cuotaInicial2Value = watch("cuotaInicial2");
    const marcacion1Value = watch("marcacion1");
    const marcacion2Value = watch("marcacion2");

    const otroSeguro1Value = watch("otroSeguro1");
    const otroSeguro2Value = watch("otroSeguro2");

    const valorGarantiaAValue = watch("valor_garantia_extendida_a");
    const valorGarantiaBValue = watch("valor_garantia_extendida_b");

    const gpsAValue = watch("gps_a");
    const gpsBValue = watch("gps_b");

    const valorPolizaAValue = watch("valor_poliza_a");
    const valorPolizaBValue = watch("valor_poliza_b");

    const valorRunt1Value = watch("valorRunt1");
    const valorLicencia1Value = watch("valorLicencia1");
    const valorDefensas1Value = watch("valorDefensas1");
    const valorHandSavers1Value = watch("valorHandSavers1");
    const valorOtrosAdicionales1Value = watch("valorOtrosAdicionales1");

    const valorRunt2Value = watch("valorRunt2");
    const valorLicencia2Value = watch("valorLicencia2");
    const valorDefensas2Value = watch("valorDefensas2");
    const valorHandSavers2Value = watch("valorHandSavers2");
    const valorOtrosAdicionales2Value = watch("valorOtrosAdicionales2");

    const isMotos = categoria === "motos";
    const isProductos = categoria === "otros";
    const showProductos = isProductos && metodo !== "terceros";
    const showMotos = isMotos || metodo === "terceros";

    const canalOptions: SelectOption[] = (canales ?? []).map((c: any) => ({ value: c, label: c }));
    const preguntaOptions: SelectOption[] = (preguntas ?? []).map((p: any) => ({ value: p, label: p }));
    const financieraOptions: SelectOption[] = (financieras ?? []).map((f: any) => ({ value: f, label: f }));

    const { data: marcas } = useMarcas();
    const marcaOptions: SelectOption[] = (marcas ?? []).map((m: any) => ({ value: m.marca, label: m.marca }));

    const selectedMarca1 = marca1Value;
    const selectedMarca2 = marca2Value;

    const { data: motos1 } = useMotosPorMarca(selectedMarca1 || undefined);
    const { data: motos2 } = useMotosPorMarca(selectedMarca2 || undefined);

    const { data: seguros = [] } = useSeguros();

    const { data: ge12 } = useConfigPlazoByCodigo("GAR_EXT_12");
    const { data: ge24 } = useConfigPlazoByCodigo("GAR_EXT_24");
    const { data: ge36 } = useConfigPlazoByCodigo("GAR_EXT_36");

    const motoOptions1 = buildMotoOptions(motos1?.motos);
    const motoOptions2 = buildMotoOptions(motos2?.motos);

    const motoASeleccionada = React.useMemo(
        () => getMotoByIndex(motos1?.motos, moto1Value),
        [motos1?.motos, moto1Value]
    );

    const motoBSeleccionada = React.useMemo(
        () => getMotoByIndex(motos2?.motos, moto2Value),
        [motos2?.motos, moto2Value]
    );

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
        const m = motoASeleccionada;
        if (!m) return;

        setValue("modelo_a", m.modelo?.trim() || "");
        const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
        setValue("descuento1", descuento.toString());

        setValue("soat_a", String(Number(m.soat) || 0));
        setValue("impuestos_a", String(Number(m.impuestos) || 0));
        setValue("matricula_a", String(getMatricula(m, metodo)));

        const documentos = getMatricula(m, metodo) + Number(m.impuestos) + Number(m.soat);
        setValue("precioDocumentos1", documentos.toString());

        setValue("foto_a", m.foto ?? null);
    }, [motoASeleccionada, metodo, setValue]);

    // MOTO 2
    React.useEffect(() => {
        const m = motoBSeleccionada;
        if (!m) return;

        setValue("modelo_b", m.modelo?.trim() || "");
        const descuento = Number(m.descuento_empresa) + Number(m.descuento_ensambladora);
        setValue("descuento2", descuento.toString());

        setValue("soat_b", String(Number(m.soat) || 0));
        setValue("impuestos_b", String(Number(m.impuestos) || 0));
        setValue("matricula_b", String(getMatricula(m, metodo)));

        const documentos = getMatricula(m, metodo) + Number(m.impuestos) + Number(m.soat);
        setValue("precioDocumentos2", documentos.toString());

        setValue("foto_b", m.foto ?? null);
    }, [motoBSeleccionada, metodo, setValue]);

    // Mantengo este bloque porque tu lógica de negocio lo usa,
    // pero lo ajusto a selección por índice para no mezclar con linea.
    React.useEffect(() => {
        const mA = motoASeleccionada;
        if (mA) {
            setValue("matricula_a", String(getMatricula(mA, metodo)));
            const docsA = getMatricula(mA, metodo) + Number(mA.impuestos) + Number(mA.soat);
            setValue("precioDocumentos1", docsA.toString());
        }

        const mB = motoBSeleccionada;
        if (mB) {
            setValue("matricula_b", String(getMatricula(mB, metodo)));
            const docsB = getMatricula(mB, metodo) + Number(mB.impuestos) + Number(mB.soat);
            setValue("precioDocumentos2", docsB.toString());
        }
    }, [metodo, motoASeleccionada, motoBSeleccionada, setValue]);

    React.useEffect(() => {
        setValue("moto1", "");
    }, [selectedMarca1, setValue]);

    React.useEffect(() => {
        setValue("moto2", "");
    }, [selectedMarca2, setValue]);

    const precioBase1 = React.useMemo(() => {
        return motoASeleccionada ? Number(motoASeleccionada.precio_base) : 0;
    }, [motoASeleccionada]);

    const precioBase2 = React.useMemo(() => {
        return motoBSeleccionada ? Number(motoBSeleccionada.precio_base) : 0;
    }, [motoBSeleccionada]);

    const soat1 = aNumeroOUndefined(soatAValue) ?? 0;
    const imp1 = aNumeroOUndefined(impuestosAValue) ?? 0;
    const mat1 = aNumeroOUndefined(matriculaAValue) ?? 0;

    const documentos1 = React.useMemo(() => {
        if (!incluirMoto1) return 0;
        return mat1 + imp1 + soat1;
    }, [mat1, imp1, soat1, incluirMoto1]);

    const soat2 = aNumeroOUndefined(soatBValue) ?? 0;
    const imp2 = aNumeroOUndefined(impuestosBValue) ?? 0;
    const mat2 = aNumeroOUndefined(matriculaBValue) ?? 0;

    const documentos2 = React.useMemo(() => {
        if (!incluirMoto2) return 0;
        return mat2 + imp2 + soat2;
    }, [mat2, imp2, soat2, incluirMoto2]);

    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marca1", "");
            setValue("moto1", "");
            setValue("garantia1", "");
            setValue("foto_a", null);
            setValue("accesorios1", "0");
            setValue("segurosIds1", []);
            setValue("otroSeguro1", "0");
            setValue("precioDocumentos1", "0");
            setValue("descuento1", "0");
            setValue("cuotaInicial1", "0");
            setValue("garantiaExtendida1", "no");
            setValue("valor_garantia_extendida_a", "0");
            setValue("soat_a", "0");
            setValue("impuestos_a", "0");
            setValue("matricula_a", "0");
            setValue("gps1", "no");
            setValue("gps_a", "0");
            setValue("poliza1", "");
            setValue("valor_poliza_a", "0");
        }
    }, [incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marca2", "");
            setValue("moto2", "");
            setValue("garantia2", "");
            setValue("foto_b", null);
            setValue("accesorios2", "0");
            setValue("segurosIds2", []);
            setValue("otroSeguro2", "0");
            setValue("precioDocumentos2", "0");
            setValue("descuento2", "0");
            setValue("cuotaInicial2", "0");
            setValue("garantiaExtendida2", "no");
            setValue("valor_garantia_extendida_b", "0");
            setValue("soat_b", "0");
            setValue("impuestos_b", "0");
            setValue("matricula_b", "0");
            setValue("gps2", "no");
            setValue("gps_b", "0");
            setValue("poliza2", "");
            setValue("valor_poliza_b", "0");
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
        } else if (metodo === "terceros") {
            setValue("categoria", "motos");
        }
    }, [metodo, setValue]);

    React.useEffect(() => {
        if (garantiaExtendida1Value === "no") setValue("valor_garantia_extendida_a", "0");
    }, [garantiaExtendida1Value, setValue]);

    React.useEffect(() => {
        if (garantiaExtendida2Value === "no") setValue("valor_garantia_extendida_b", "0");
    }, [garantiaExtendida2Value, setValue]);

    const reqIf = (cond: boolean, msg: string) => ({
        validate: (v: any) => (!cond ? true : (v !== undefined && v !== null && String(v).trim().length > 0) || msg),
    });

    const findSeguroValor = (id: string) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        return s ? Number(s.valor) : 0;
    };

    const findSeguroObj = (id: string | number) => {
        const s = seguros.find((x: any) => String(x.id) === String(id));
        if (!s) return null;
        return { id: Number(s.id), nombre: s.nombre, tipo: s.tipo ?? null, valor: Number(s.valor) };
    };

    const mapSeguros = (ids: Array<string | number>, otrosMonto: unknown) => {
        const base = (ids ?? [])
            .map((sid) => findSeguroObj(sid))
            .filter(Boolean) as Array<{ id: number; nombre: string; tipo: string | null; valor: number }>;

        const otros = aNumeroOUndefined(otrosMonto) ?? 0;

        if (otros > 0) {
            base.push({ id: -1, nombre: "Otros seguros", tipo: null, valor: otros });
        }

        return base;
    };

    React.useEffect(() => {
        if (metodo === "terceros") {
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
        if (metodo === "contado" || metodo === "terceros") {
            setValue("categoria", "motos");
        }
    }, [metodo, setValue]);

    const otros1 = aNumeroOUndefined(otroSeguro1Value) ?? 0;
    const accesorios1Val = aNumeroOUndefined(accesorios1Value) ?? 0;
    const descuento1Val = aNumeroOUndefined(descuento1Value) ?? 0;
    const inicial1 = aNumeroOUndefined(cuotaInicial1Value) ?? 0;
    const marcacion1Val = aNumeroOUndefined(marcacion1Value) ?? 0;

    // ===== ADICIONALES MOTO 1 =====
    const extrasMoto1 =
        (adicionalesMoto1.runt ? (aNumeroOUndefined(valorRunt1Value) ?? 0) : 0) +
        (adicionalesMoto1.licencia ? (aNumeroOUndefined(valorLicencia1Value) ?? 0) : 0) +
        (adicionalesMoto1.defensas ? (aNumeroOUndefined(valorDefensas1Value) ?? 0) : 0) +
        (adicionalesMoto1.hand ? (aNumeroOUndefined(valorHandSavers1Value) ?? 0) : 0) +
        (adicionalesMoto1.otros ? (aNumeroOUndefined(valorOtrosAdicionales1Value) ?? 0) : 0);

    // ===== ADICIONALES MOTO 2 =====
    const extrasMoto2 =
        (adicionalesMoto2.runt ? (aNumeroOUndefined(valorRunt2Value) ?? 0) : 0) +
        (adicionalesMoto2.licencia ? (aNumeroOUndefined(valorLicencia2Value) ?? 0) : 0) +
        (adicionalesMoto2.defensas ? (aNumeroOUndefined(valorDefensas2Value) ?? 0) : 0) +
        (adicionalesMoto2.hand ? (aNumeroOUndefined(valorHandSavers2Value) ?? 0) : 0) +
        (adicionalesMoto2.otros ? (aNumeroOUndefined(valorOtrosAdicionales2Value) ?? 0) : 0);

    const garantiaExt1Sel = garantiaExtendida1Value;
    const garantiaExtVal1 = aNumeroOUndefined(valorGarantiaAValue) ?? 0;

    const garantiaExt2Sel = garantiaExtendida2Value;
    const garantiaExtVal2 = aNumeroOUndefined(valorGarantiaBValue) ?? 0;

    const codigoMarcacion1 = garantiaExt1Sel !== "no" ? `MARC_${garantiaExt1Sel}` : "";

    const { data: configMarcacion1 } = useConfigPlazoByCodigo(
        codigoMarcacion1,
        Boolean(codigoMarcacion1)
    );

    const codigoMarcacion2 = garantiaExt2Sel !== "no" ? `MARC_${garantiaExt2Sel}` : "";

    const { data: configMarcacion2 } = useConfigPlazoByCodigo(
        codigoMarcacion2,
        Boolean(codigoMarcacion2)
    );

    const { data: tasaFinanciacion } = useConfigPlazoByCodigo("TASA_FIN");
    const { data: tasaGarantiaConfig } = useConfigPlazoByCodigo("TASA_GARANTIA");

    const tasaDecimal = tasaFinanciacion ? Number(tasaFinanciacion.valor) / 100 : 0.0188;

    const TASA_GARANTIA_MENSUAL = tasaGarantiaConfig ? Number(tasaGarantiaConfig.valor) : 1.5;



    React.useEffect(() => {
        if (!incluirMoto1) {
            setValue("marcacion1", "0");
            return;
        }

        if (garantiaExt1Sel === "no") {
            setValue("marcacion1", "0");
            return;
        }
    }, [garantiaExt1Sel, configMarcacion1, incluirMoto1, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) {
            setValue("marcacion2", "0");
            return;
        }

        if (garantiaExt2Sel === "no") {
            setValue("marcacion2", "0");
            return;
        }
    }, [garantiaExt2Sel, configMarcacion2, incluirMoto2, setValue]);

    const totalSeguros1 =
        showMotos && incluirMoto1
            ? (segurosIds1 as string[]).reduce((acc, id) => acc + findSeguroValor(String(id)), 0) + otros1
            : 0;

    const gpsVal1 = aNumeroOUndefined(gpsAValue) ?? 0;


    const gpsVal2 = aNumeroOUndefined(gpsBValue) ?? 0;

    const polizaVal1 = aNumeroOUndefined(valorPolizaAValue) ?? 0;
    const polizaVal2 = aNumeroOUndefined(valorPolizaBValue) ?? 0;


    const gpsAplica1 =
        metodo === "contado" || metodo === "terceros"
            ? gpsContado1Value === "si"
            : gps1Value !== "no";

    const gpsAplica2 =
        metodo === "contado" || metodo === "terceros"
            ? gpsContado2Value === "si"
            : gps2Value !== "no";

    const totalSinSeguros1 =
        showMotos && incluirMoto1
            ? precioBase1 +
            accesorios1Val +
            documentos1 +
            marcacion1Val -
            descuento1Val +
            (garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0) +
            (gpsAplica1 ? gpsVal1 : 0) +
            extrasMoto1 +
            polizaVal1
            : 0;

    const totalConSeguros1 = totalSinSeguros1 + totalSeguros1;

    const otros2 = aNumeroOUndefined(otroSeguro2Value) ?? 0;
    const accesorios2Val = aNumeroOUndefined(accesorios2Value) ?? 0;
    const descuento2Val = aNumeroOUndefined(descuento2Value) ?? 0;
    const inicial2 = aNumeroOUndefined(cuotaInicial2Value) ?? 0;
    const marcacion2Val = aNumeroOUndefined(marcacion2Value) ?? 0;

    const totalSeguros2 =
        showMotos && incluirMoto2
            ? (segurosIds2 as string[]).reduce((acc, id) => acc + findSeguroValor(String(id)), 0) + otros2
            : 0;

    const totalSinSeguros2 =
        showMotos && incluirMoto2
            ? precioBase2 +
            accesorios2Val +
            documentos2 +
            marcacion2Val -
            descuento2Val +
            (garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0) +
            (gpsAplica2 ? gpsVal2 : 0) +
            extrasMoto2 +
            polizaVal2
            : 0;

    const totalConSeguros2 = totalSinSeguros2 + totalSeguros2;

    const moto1Seleccionada = Boolean(moto1Value);
    const moto2Seleccionada = Boolean(moto2Value);

    const onSubmit = (data: FormValuesCotizacion) => {

        const motoA = incluirMoto1 && motos1?.motos ? motos1.motos[Number(data.moto1)] ?? null : null;
        const motoB = incluirMoto2 && motos2?.motos ? motos2.motos[Number(data.moto2)] ?? null : null;

        const gpsComoContado = data.metodoPago === "contado" || data.metodoPago === "terceros";

        const mustHaveMoto1 = showMotos && incluirMoto1;
        const mustHaveMoto2 = showMotos && incluirMoto2;

        if (mustHaveMoto1 && (!moto1Seleccionada || !Number.isFinite(precioBase1) || precioBase1 <= 0)) {
            return alert.warn(
                "Falta información",
                "La Moto 1 es obligatoria y debe tener un precio base válido; configúralo en el módulo de motos."
            );
        }

        if (mustHaveMoto2 && (!moto2Seleccionada || !Number.isFinite(precioBase2) || precioBase2 <= 0)) {
            return alert.warn(
                "Falta información",
                "Seleccionaste la Moto 2; también debe tener un precio base válido; configúralo en el módulo de motos."
            );
        }

        if (!data.comentario || !data.comentario.trim()) {
            return alert.warn("Comentario obligatorio", "Debes ingresar un comentario.");
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

        const seg1 = (data.segurosIds1 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);
        const seg2 = (data.segurosIds2 ?? []).reduce((acc, id) => acc + findSeguroValor(String(id)), 0);

        const gpsA = toNumberSafe(data.gps_a);
        const gpsB = toNumberSafe(data.gps_b);

        const precioTotalA = incluirMoto1 ? totalConSeguros1 : 0;
        const precioTotalB = incluirMoto2 ? totalConSeguros2 : 0;

        const esFinanciado = data.metodoPago !== "contado";

        const lineaA_final = incluirMoto1
            ? [motos1?.motos?.[Number(data.moto1)]?.linea ?? "", data.modelo_a?.trim()].filter(Boolean).join(" - ")
            : "";

        const lineaB_final = incluirMoto2
            ? [motos2?.motos?.[Number(data.moto2)]?.linea ?? "", data.modelo_b?.trim()].filter(Boolean).join(" - ")
            : null;

        const segurosA = incluirMoto1 ? mapSeguros(data.segurosIds1 as string[], otroSeguro1) : [];
        const segurosB = incluirMoto2 ? mapSeguros(data.segurosIds2 as string[], otroSeguro2) : [];

        const gpsSelContA = data.gpsContado1 ?? "no";
        const gpsSelContB = data.gpsContado2 ?? "no";


        const ivaEnviar = Number(IVA_PCT ?? 19);
        const tasaFinEnviar = Number(tasaFinanciacion?.valor ?? 1.9122);
        const tasaGarantiaEnviar = Number(tasaGarantiaConfig?.valor ?? 1.5);



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
            nombre_usuario: name ?? "Usuario",
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

            soat_a: incluirMoto1 ? (aNumeroOUndefined(data.soat_a) ?? 0) : 0,
            impuestos_a: incluirMoto1 ? (aNumeroOUndefined(data.impuestos_a) ?? 0) : 0,
            matricula_a: incluirMoto1 ? (aNumeroOUndefined(data.matricula_a) ?? 0) : 0,

            soat_b: incluirMoto2 ? aNumeroOUndefined(data.soat_b) : null,
            impuestos_b: incluirMoto2 ? aNumeroOUndefined(data.impuestos_b) : null,
            matricula_b: incluirMoto2 ? aNumeroOUndefined(data.matricula_b) : null,

            valorRunt1: incluirMoto1 && adicionalesMoto1.runt ? toNumberSafe(data.valorRunt1) : 0,
            valorLicencia1: incluirMoto1 && adicionalesMoto1.licencia ? toNumberSafe(data.valorLicencia1) : 0,
            valorDefensas1: incluirMoto1 && adicionalesMoto1.defensas ? toNumberSafe(data.valorDefensas1) : 0,
            valorHandSavers1: incluirMoto1 && adicionalesMoto1.hand ? toNumberSafe(data.valorHandSavers1) : 0,
            valorOtrosAdicionales1: incluirMoto1 && adicionalesMoto1.otros ? toNumberSafe(data.valorOtrosAdicionales1) : 0,

            valorRunt2: incluirMoto2 && adicionalesMoto2.runt ? toNumberSafe(data.valorRunt2) : 0,
            valorLicencia2: incluirMoto2 && adicionalesMoto2.licencia ? toNumberSafe(data.valorLicencia2) : 0,
            valorDefensas2: incluirMoto2 && adicionalesMoto2.defensas ? toNumberSafe(data.valorDefensas2) : 0,
            valorHandSavers2: incluirMoto2 && adicionalesMoto2.hand ? toNumberSafe(data.valorHandSavers2) : 0,
            valorOtrosAdicionales2: incluirMoto2 && adicionalesMoto2.otros ? toNumberSafe(data.valorOtrosAdicionales2) : 0,

            saldo_financiar_a: saldoFinanciar1,
            saldo_financiar_b: saldoFinanciar2,

            id_empresa_a: incluirMoto1 && motoA?.id_empresa != null ? Number(motoA.id_empresa) : null,
            id_empresa_b: incluirMoto2 && motoB?.id_empresa != null ? Number(motoB.id_empresa) : null,

            valor_gps_a: incluirMoto1
                ? gpsComoContado
                    ? gpsSelContA === "si"
                        ? gpsA
                        : 0
                    : (data.gps1 ?? "no") !== "no"
                        ? gpsA
                        : 0
                : 0,

            valor_gps_b: incluirMoto2
                ? gpsComoContado
                    ? gpsSelContB === "si"
                        ? gpsB
                        : 0
                    : (data.gps2 ?? "no") !== "no"
                        ? gpsB
                        : 0
                : 0,

            poliza_a: incluirMoto1 ? (data.poliza1 || null) : null,
            valor_poliza_a: incluirMoto1 ? toNumberSafe(data.valor_poliza_a) : 0,

            poliza_b: incluirMoto2 ? (data.poliza2 || null) : null,
            valor_poliza_b: incluirMoto2 ? toNumberSafe(data.valor_poliza_b) : null,

            telefono_asesor: telefonoAsesor,

            iva: ivaEnviar,
            tasa_financiacion: tasaFinEnviar,
            tasa_garantia: tasaGarantiaEnviar,


        };

        if (!gpsComoContado) {
            payload.gps_meses_a = incluirMoto1 ? (data.gps1 ?? "no") : "no";
            payload.gps_meses_b = incluirMoto2 ? (data.gps2 ?? "no") : null;
        }

        if (gpsComoContado) {
            delete payload.gps_meses_a;
            delete payload.gps_meses_b;
        }

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

    // Mantengo estos efectos porque en tu negocio aplican descuento empresa/documentos,
    // pero ajustados a la moto real seleccionada por índice.
    React.useEffect(() => {
        const m = motoASeleccionada;
        if (!m) return;

        setValue("modelo_a", m.modelo?.trim() || "");
        const descuento = Number(m.descuento_empresa) || 0;
        setValue("descuento1", descuento.toString());

        const documentos =
            (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
            Number(m.impuestos) +
            Number(m.soat);

        setValue("precioDocumentos1", documentos.toString());
    }, [motoASeleccionada, metodo, setValue]);

    React.useEffect(() => {
        const m = motoBSeleccionada;
        if (!m) return;

        setValue("modelo_b", m.modelo?.trim() || "");
        const descuento = Number(m.descuento_empresa) || 0;
        setValue("descuento2", descuento.toString());

        const documentos =
            (metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito)) +
            Number(m.impuestos) +
            Number(m.soat);

        setValue("precioDocumentos2", documentos.toString());
    }, [motoBSeleccionada, metodo, setValue]);

    const saldoFinanciar1 =
        esCreditoDirecto && incluirMoto1 ? Math.max(totalConSeguros1 - inicial1, 0) : 0;

    const saldoFinanciar2 =
        esCreditoDirecto && incluirMoto2 ? Math.max(totalConSeguros2 - inicial2, 0) : 0;

    const hideGarantiaExtendida = metodo === "contado" || metodo === "terceros";
    const showGarantiaExtendida = showMotos && !hideGarantiaExtendida;

    const polizaLabel = hideGarantiaExtendida ? "Garantía extendida" : "Póliza todo riesgo";
    const polizaValorLabel = hideGarantiaExtendida ? "Valor garantía extendida" : "Valor póliza";

    React.useEffect(() => {
        const gpsComoContado = metodo === "contado" || metodo === "terceros";

        if (gpsComoContado) {
            setValue("gps1", "no");
            setValue("gps2", "no");

            const c1 = gpsContado1Value;
            const c2 = gpsContado2Value;

            if (c1 === "no") setValue("gps_a", "0");
            if (c2 === "no") setValue("gps_b", "0");

            if (c1 === "si" && gpsAValue === "0") setValue("gps_a", "");
            if (c2 === "si" && gpsBValue === "0") setValue("gps_b", "");
        } else {
            setValue("gpsContado1", "no");
            setValue("gpsContado2", "no");
        }
    }, [metodo, setValue, gpsContado1Value, gpsContado2Value, gpsAValue, gpsBValue]);

    const geMap = React.useMemo(
        () => ({
            "12": ge12,
            "24": ge24,
            "36": ge36,
        }),
        [ge12, ge24, ge36]
    );

    React.useEffect(() => {
        if (!incluirMoto1) return;

        const sel = garantiaExtendida1Value;
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
    }, [incluirMoto1, garantiaExtendida1Value, precioBase1, geMap, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) return;

        const sel = garantiaExtendida2Value;
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
    }, [incluirMoto2, garantiaExtendida2Value, precioBase2, geMap, setValue]);

    const { data: gps12 } = useConfigPlazoByCodigo("GPS_12");
    const { data: gps24 } = useConfigPlazoByCodigo("GPS_24");
    const { data: gps36 } = useConfigPlazoByCodigo("GPS_36");

    const { data: polLight } = useConfigPlazoByCodigo("LIGHT");
    const { data: polTranqui } = useConfigPlazoByCodigo("TRANQUI");
    const { data: polTranquiPlus } = useConfigPlazoByCodigo("TRANQUI_PLUS");

    const { data: marcacionCoti } = useConfigPlazoByCodigo("MARC");
    // const { data: segVidaCfg } = useConfigPlazoByCodigo("SEG_VIDA");

    // const calcSeguroVidaMensual = (saldo: number, cfg: any | null): number => {
    //     if (!cfg || saldo <= 0) return 0;

    //     const v = Number(cfg.valor) || 0;

    //     if (cfg.tipo_valor === "%") {
    //         return Math.round(saldo * (v / 100));
    //     }

    //     return Math.round((saldo / 1000) * v);
    // };


    const saldoFinanciar1SinGarantia = Math.max(
        saldoFinanciar1 - (garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0),
        0
    );

    const saldoFinanciar2SinGarantia = Math.max(
        saldoFinanciar2 - (garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0),
        0
    );

    // const segVidaMensualA =
    //   metodo === "credibike" && incluirMoto1
    //     ? calcSeguroVidaMensual(saldoFinanciar1SinGarantia, segVidaCfg ?? null)
    //     : 0;

    // const segVidaMensualB =
    //   metodo === "credibike" && incluirMoto2
    //     ? calcSeguroVidaMensual(saldoFinanciar2SinGarantia, segVidaCfg ?? null)
    //     : 0;


    const calcularCuotaProyectadaMoto = (
        incluir: boolean,
        saldoSinGarantia: number,
        valorGarantia: number,
        plazo: number
    ) => {
        if (metodo !== "credibike" || !incluir) return 0;

        const credito = calcularCreditoDirectoMoto({
            incluir: true,
            mesesGarantia: plazo,
            valorGarantia,
            saldoFinanciar: saldoSinGarantia,
            tasaFinanciacionPct: tasaDecimal * 100,
            tasaGarantiaPct: TASA_GARANTIA_MENSUAL,
        });

        return credito.cuotaTotal;
    };

    const cuota6_a_auto = calcularCuotaProyectadaMoto(
        incluirMoto1,
        saldoFinanciar1SinGarantia,
        garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
        6
    );

    const cuota12_a_auto = calcularCuotaProyectadaMoto(
        incluirMoto1,
        saldoFinanciar1SinGarantia,
        garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
        12
    );

    // const cuota18_a_auto = calcularCuotaProyectadaMoto(
    //   incluirMoto1,
    //   saldoFinanciar1SinGarantia,
    //   garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
    //   18
    // );

    const cuota24_a_auto = calcularCuotaProyectadaMoto(
        incluirMoto1,
        saldoFinanciar1SinGarantia,
        garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
        24
    );

    // const cuota30_a_auto = calcularCuotaProyectadaMoto(
    //   incluirMoto1,
    //   saldoFinanciar1SinGarantia,
    //   garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
    //   30
    // );

    const cuota36_a_auto = calcularCuotaProyectadaMoto(
        incluirMoto1,
        saldoFinanciar1SinGarantia,
        garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0,
        36
    );

    const cuota6_b_auto = calcularCuotaProyectadaMoto(
        incluirMoto2,
        saldoFinanciar2SinGarantia,
        garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
        6
    );

    const cuota12_b_auto = calcularCuotaProyectadaMoto(
        incluirMoto2,
        saldoFinanciar2SinGarantia,
        garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
        12
    );

    // const cuota18_b_auto = calcularCuotaProyectadaMoto(
    //   incluirMoto2,
    //   saldoFinanciar2SinGarantia,
    //   garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
    //   18
    // );

    const cuota24_b_auto = calcularCuotaProyectadaMoto(
        incluirMoto2,
        saldoFinanciar2SinGarantia,
        garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
        24
    );

    // const cuota30_b_auto = calcularCuotaProyectadaMoto(
    //   incluirMoto2,
    //   saldoFinanciar2SinGarantia,
    //   garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
    //   30
    // );

    const cuota36_b_auto = calcularCuotaProyectadaMoto(
        incluirMoto2,
        saldoFinanciar2SinGarantia,
        garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0,
        36
    );


    React.useEffect(() => {
        if (metodo === "contado") return;
        const hayMoto = moto1Value !== undefined && moto1Value !== null && moto1Value !== "";
        if (!incluirMoto1) return;

        if (hayMoto) {
            const actual = aNumeroOUndefined(marcacion1Value) ?? 0;

            if (actual <= 0) {
                setValue("marcacion1", String(marcacionCoti?.valor || 0), {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        }
    }, [metodo, moto1Value, incluirMoto1, marcacionCoti, setValue, marcacion1Value]);

    React.useEffect(() => {
        if (metodo === "contado") {
            setValue("marcacion1", "0");
            setValue("marcacion2", "0");
        }
    }, [metodo, setValue]);

    React.useEffect(() => {
        if (metodo === "contado") return;
        const hayMoto = moto2Value !== undefined && moto2Value !== null && moto2Value !== "";
        if (!incluirMoto2) return;

        if (hayMoto) {
            const actual = aNumeroOUndefined(marcacion2Value) ?? 0;

            if (actual <= 0) {
                setValue("marcacion2", String(marcacionCoti?.valor || 0), {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        }
    }, [metodo, moto2Value, incluirMoto2, marcacionCoti, setValue, marcacion2Value]);

    const gpsMap = React.useMemo(
        () => ({
            "12": gps12,
            "24": gps24,
            "36": gps36,
        }),
        [gps12, gps24, gps36]
    );

    const polizaMap = React.useMemo(
        () => ({
            LIGHT: polLight,
            TRANQUI: polTranqui,
            TRANQUI_PLUS: polTranquiPlus,
        }),
        [polLight, polTranqui, polTranquiPlus]
    );

    React.useEffect(() => {
        if (!incluirMoto1) return;

        const sel = poliza1Value;
        if (!sel) {
            setValue("valor_poliza_a", "0");
            return;
        }

        const cfg = polizaMap[sel as "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"] ?? null;
        const val = calcPoliza(precioBase1, cfg);

        setValue("valor_poliza_a", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto1, poliza1Value, precioBase1, polizaMap, setValue]);

    React.useEffect(() => {
        if (!incluirMoto2) return;

        const sel = poliza2Value;
        if (!sel) {
            setValue("valor_poliza_b", "0");
            return;
        }

        const cfg = polizaMap[sel as "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"] ?? null;
        const val = calcPoliza(precioBase2, cfg);

        setValue("valor_poliza_b", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto2, poliza2Value, precioBase2, polizaMap, setValue]);

    React.useEffect(() => {
        if (!incluirMoto1) return;
        if (metodo === "contado" || metodo === "terceros") return;

        const sel = gps1Value;
        if (sel === "no") {
            setValue("gps_a", "0");
            return;
        }

        const cfg = gpsMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGps(precioBase1, cfg);

        setValue("gps_a", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto1, gps1Value, precioBase1, gpsMap, setValue, metodo]);

    React.useEffect(() => {
        if (!incluirMoto2) return;
        if (metodo === "contado" || metodo === "terceros") return;

        const sel = gps2Value;
        if (sel === "no") {
            setValue("gps_b", "0");
            return;
        }

        const cfg = gpsMap[sel as "12" | "24" | "36"] ?? null;
        const val = calcGps(precioBase2, cfg);

        setValue("gps_b", String(val), { shouldDirty: true, shouldValidate: true });
    }, [incluirMoto2, gps2Value, precioBase2, gpsMap, setValue, metodo]);



    const aplicarCalculoCreditoDirecto = metodo === "credibike";

    const creditoMoto1 = calcularCreditoDirectoMoto({
        incluir: aplicarCalculoCreditoDirecto && incluirMoto1,
        mesesGarantia:
            aplicarCalculoCreditoDirecto && incluirMoto1 && garantiaExtendida1Value !== "no"
                ? garantiaExtendida1Value
                : 0,
        valorGarantia: valorGarantiaAValue,
        saldoFinanciar: saldoFinanciar1SinGarantia,
        tasaFinanciacionPct: tasaDecimal * 100,
        tasaGarantiaPct: TASA_GARANTIA_MENSUAL,
    });

    const creditoMoto2 = calcularCreditoDirectoMoto({
        incluir: aplicarCalculoCreditoDirecto && incluirMoto2,
        mesesGarantia:
            aplicarCalculoCreditoDirecto && incluirMoto2 && garantiaExtendida2Value !== "no"
                ? garantiaExtendida2Value
                : 0,
        valorGarantia: valorGarantiaBValue,
        saldoFinanciar: saldoFinanciar2SinGarantia,
        tasaFinanciacionPct: tasaDecimal * 100,
        tasaGarantiaPct: TASA_GARANTIA_MENSUAL,
    });



    // const mesesMoto1 = creditoMoto1.meses;
    // const mesesMoto2 = creditoMoto2.meses;

    const cuotaGarantiaExtendidaMoto1 = creditoMoto1.cuotaGarantiaExtendida;
    const cuotaGarantiaExtendidaMoto2 = creditoMoto2.cuotaGarantiaExtendida;

    // const seguroDeudorMoto1 = creditoMoto1.seguroDeudor;
    // const seguroDeudorMoto2 = creditoMoto2.seguroDeudor;

    // const garantiaSegurosMesMoto1 = creditoMoto1.garantiaMasSeguro;
    // const garantiaSegurosMesMoto2 = creditoMoto2.garantiaMasSeguro;

    // const cuotaNegocioMoto1 = creditoMoto1.cuotaNegocio;
    // const cuotaNegocioMoto2 = creditoMoto2.cuotaNegocio;

    // const cuotaTotalMoto1 = creditoMoto1.cuotaTotal;
    // const cuotaTotalMoto2 = creditoMoto2.cuotaTotal;

    if (aplicarCalculoCreditoDirecto) {
        logCreditoDirectoMoto("MOTO 1", creditoMoto1);
        logCreditoDirectoMoto("MOTO 2", creditoMoto2);
    }



    const cedulaValue = watch("cedula");

    const {
        refetch: buscarCliente,
        isFetching: buscandoCliente,
    } = useBuscarClientePorCedula(cedulaValue);



    const handleBuscarCliente = async () => {
        if (!cedulaValue || cedulaValue.length < 5) {
            alert.warn("Cédula inválida", "Ingresa una cédula válida");
            return;
        }

        const { data: cliente } = await buscarCliente();

        if (!cliente) {
            alert.warn("No encontrado", "No existe cliente con esa cédula");
            return;
        }

        // ✅ Rellenar formulario automáticamente
        setValue("primer_nombre", cliente.name || "");
        setValue("segundo_nombre", cliente.s_name || "");
        setValue("primer_apellido", cliente.last_name || "");
        setValue("segundo_apellido", cliente.s_last_name || "");
        setValue("celular", cliente.celular || "");
        setValue("email", cliente.email || "");
    };


    const isCedulaValida = /^[0-9]{5,20}$/.test(cedulaValue ?? "");

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
                            <FormSelect<FormValuesCotizacion>
                                name="financiera"
                                label="Financiera"
                                control={control}
                                options={financieraOptions}
                                placeholder={loadingFinancieras ? "Cargando financieras..." : "Seleccione..."}
                                disabled={loadingFinancieras}
                                rules={{ required: "La financiera es obligatoria cuando es financiado." }}
                            />
                            <FormInput<FormValuesCotizacion>
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
                                        value: 100,
                                        message: "La cantidad máxima es 100 cuotas",
                                    },
                                    validate: (value) =>
                                        Number.isInteger(Number(value)) || "Solo se permiten números enteros",
                                }}
                            />
                        </>
                    )}

                    <FormSelect<FormValuesCotizacion>
                        name="canal"
                        label="Canal de contacto"
                        control={control}
                        options={canalOptions}
                        placeholder={loadingCanales ? "Cargando canales..." : "Seleccione un canal"}
                        disabled={loadingCanales}
                        rules={{ required: "El canal de contacto es obligatorio." }}
                    />

                    <FormSelect<FormValuesCotizacion>
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

            <div className="flex gap-6 flex-col w-full bg-white p-3 rounded-xl">
                <div className="divider divider-start divider-success">
                    <div className="badge text-xl badge-success text-white">Datos Personales</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <FormInput<FormValuesCotizacion>
                            name="cedula"
                            label="Cédula"
                            control={control}
                            placeholder="Número de documento"
                            rules={{
                                required: "La cédula es obligatoria.",
                                pattern: {
                                    value: /^[0-9]{5,20}$/,
                                    message: "Solo números (5-20 dígitos)",
                                },
                            }}
                        />

                        {isCedulaValida && (
                            <button
                                type="button"
                                onClick={handleBuscarCliente}
                                className="absolute right-2 top-3 btn btn-sm btn-circle bg-[#3498DB] "
                            >
                                {buscandoCliente ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <>
                                    <Search className="w-4 h-4 text-white" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <FormInput<FormValuesCotizacion>
                        name="fecha_nac"
                        label="Fecha de nacimiento"
                        type="date"
                        control={control}
                        rules={{ required: "Requerido", validate: dateNotTodayOrFuture }}
                    />
                    <FormInput<FormValuesCotizacion> name="primer_nombre" label="Primer nombre" control={control} rules={{ required: "El primer nombre es obligatorio." }} />
                    <FormInput<FormValuesCotizacion> name="segundo_nombre" label="Segundo nombre" control={control} />
                    <FormInput<FormValuesCotizacion> name="primer_apellido" label="Primer apellido" control={control} rules={{ required: "El primer apellido es obligatorio." }} />
                    <FormInput<FormValuesCotizacion> name="segundo_apellido" label="Segundo apellido" control={control} />
                    <FormInput<FormValuesCotizacion>
                        name="celular"
                        label="Celular"
                        control={control}
                        placeholder="3001234567"
                        rules={{
                            required: "El celular es obligatorio.",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Debe tener exactamente 10 números.",
                            },
                        }}
                    />
                    <FormInput<FormValuesCotizacion>
                        name="email"
                        label="Email"
                        type="email"
                        control={control}
                        placeholder="correo@dominio.com"
                        rules={{ required: "El email es obligatorio.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } }}
                    />
                </div>

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
                                    <FormSelect<FormValuesCotizacion>
                                        name="marca1"
                                        label="Marca"
                                        control={control}
                                        options={marcaOptions}
                                        placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto1}
                                        rules={reqIf(showMotos && incluirMoto1, "La marca es obligatoria")}
                                    />

                                    <FormSelect<FormValuesCotizacion>
                                        name="moto1"
                                        label="Moto (modelo – precio)"
                                        control={control}
                                        options={motoOptions1}
                                        placeholder={selectedMarca1 ? "Seleccione una moto" : "Seleccione una marca primero"}
                                        disabled={!showMotos || !incluirMoto1 || !selectedMarca1}
                                        rules={reqIf(showMotos && incluirMoto1, "La moto es obligatoria")}
                                    />

                                    <FormInput<FormValuesCotizacion>
                                        name="modelo_a"
                                        label="Modelo año"
                                        control={control}
                                        placeholder="Ej. 2025 / Edición especial"
                                        disabled={!showMotos || !incluirMoto1}
                                        className="hidden"
                                    />

                                    {moto1Seleccionada && (
                                        <>
                                            {incluirMoto1 && (
                                                <div className="mt-2 flex justify-center">
                                                    <MotoImage
                                                        src={fotoMoto1 ? `${BASE_URL}/${fotoMoto1}` : undefined}
                                                        thumbClassName="w-32 h-32"
                                                    />
                                                </div>
                                            )}

                                            {showGarantiaExtendida && (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
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

                                                    {garantiaExtendida1Value !== "no" && (
                                                        <FormInput<FormValuesCotizacion>
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

                                            {metodo === "contado" || metodo === "terceros" ? (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
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

                                                    {gpsContado1Value === "si" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="gps_a"
                                                            label="Valor GPS A"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="Escribe el valor"
                                                            disabled={!showMotos || !incluirMoto1}
                                                            rules={{
                                                                validate: (v) => {
                                                                    if (!incluirMoto1) return true;
                                                                    if (gpsContado1Value !== "si") return true;

                                                                    return (aNumeroOUndefined(v) ?? 0) > 0
                                                                        ? true
                                                                        : "El valor del GPS debe ser mayor a 0.";
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
                                                        name="gps1"
                                                        label="GPS"
                                                        control={control}
                                                        options={gpsOptions}
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

                                                    {gps1Value !== "no" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="gps_a"
                                                            label="Valor GPS A"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {!esCreditoDirecto2 && (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
                                                        name="poliza1"
                                                        label={polizaLabel}
                                                        control={control}
                                                        options={polizaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto1}
                                                    />

                                                    {poliza1Value !== "" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valor_poliza_a"
                                                            label={`${polizaValorLabel} A`}
                                                            control={control}
                                                            type="number"
                                                            formatThousands
                                                            disabled
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                    <div className="p-3 rounded-md bg-[#3498DB]">
                                        <p className="font-semibold mb-2 text-white">Seguro todo riesgo</p>

                                        <FormInput<FormValuesCotizacion>
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
                                            <FormInput<FormValuesCotizacion>
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
                                                <FormInput<FormValuesCotizacion>
                                                    name="cuotaInicial1"
                                                    formatThousands
                                                    label="Cuota inicial"
                                                    control={control}
                                                    type="number"
                                                    rules={reqIf(showMotos && incluirMoto1, "Ingresa la cuota inicial")}
                                                    disabled={!showMotos || !incluirMoto1}
                                                />
                                            )}

                                            <FormInput<FormValuesCotizacion>
                                                name="precioDocumentos1"
                                                label=""
                                                control={control}
                                                type="hidden"
                                                disabled={!showMotos || !incluirMoto1}
                                            />

                                            <FormInput<FormValuesCotizacion>
                                                name="marcacion1"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto1}
                                            />

                                            <FormInput<FormValuesCotizacion>
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
                                                        const val = aNumeroOUndefined(v) ?? 0;
                                                        const max = precioBase1 + accesorios1Val + documentos1;
                                                        return val <= max || `El descuento no puede superar ${fmtCOP(max)}`;
                                                    },
                                                }}
                                            />

                                            <p className="text-xs text-base-content/60">
                                                Máximo permitido: {fmtCOP(precioBase1 + accesorios1Val + documentos1)}
                                            </p>

                                            <div className="rounded-xl border border-base-200 p-3 space-y-3 bg-base-100">
                                                <p className="font-semibold text-sm">Productos y servicios adicionales (Moto 1)</p>

                                                <div className="grid grid-cols-2 gap-4">
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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorRunt1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.runt}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorLicencia1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.licencia}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorDefensas1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.defensas}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorHandSavers1"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto1 || !adicionalesMoto1.hand}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
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

                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>

                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula:</span>
                                                        <span>{fmtCOP(mat1)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Impuestos:</span>
                                                        <span>{fmtCOP(imp1)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">SOAT:</span>
                                                        <span>{fmtCOP(soat1)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-semibold text-gray-800">Documentos (M+I+S):</span>
                                                        <span className="font-semibold">{fmtCOP(documentos1)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-purple-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">
                                                            Costos adicionales (RUNT, licencias, defensas, etc.):
                                                        </span>
                                                        <span>{fmtCOP(extrasMoto1)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento / Plan de marca:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento1Val > 0 ? `-${fmtCOP(descuento1Val)} COP` : "0 COP"}
                                                        </span>
                                                    </div>

                                                    {garantiaExt1Sel !== "no" && metodo === "credibike" && (
                                                        <>
                                                            {/* 🔒 Valor total (oculto por ahora, por si luego lo necesitan) */}
                                                            <div className="hidden justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                                <span className="font-medium text-gray-700">
                                                                    Garantía extendida ({garantiaExt1Sel} meses):
                                                                </span>
                                                                <span>{fmtCOP(garantiaExtVal1)} COP</span>
                                                            </div>

                                                            {/* ✅ Valor correcto mostrado (cuota mensual) */}
                                                            <div className="hidden justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                                <span className="font-medium text-gray-700">
                                                                    Garantía extendida ({garantiaExt1Sel} meses):
                                                                </span>
                                                                <span>
                                                                    {fmtCOP(cuotaGarantiaExtendidaMoto1)} / mes
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {gpsAplica1 && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                GPS {metodo === "contado" || metodo === "terceros" ? "" : `(${gps1Value} meses)`}:
                                                            </span>
                                                            <span>{fmtCOP(gpsVal1)} COP</span>
                                                        </div>
                                                    )}
                                                    {poliza1Value !== "" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium">{polizaLabel} {poliza1Value}:</span>
                                                            <span>{fmtCOP(polizaVal1)} COP</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between bg-blue-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Cascos y Accesorios:</span>
                                                        <span>{fmtCOP(accesorios1Val)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-indigo-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Marcación y personalización:</span>
                                                        <span>{fmtCOP(marcacion1Val)} COP</span>
                                                    </div>

                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between bg-yellow-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Inicial:</span>
                                                            <span>{fmtCOP(inicial1)} COP</span>
                                                        </div>
                                                    )}

                                                    {totalSeguros1 > 0 && (
                                                        <div className="flex justify-between bg-[#3498DB]/10 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Seguro todo riesgo:</span>
                                                            <span>{fmtCOP(totalSeguros1)} COP</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300 shadow-sm">
                                                        <span className="font-semibold">PRECIO BASE:</span>
                                                        <span className="font-extrabold">{fmtCOP(precioBase1)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL:</span>
                                                        <span className="text-success font-extrabold text-lg">
                                                            {fmtCOP(
                                                                totalConSeguros1 - (garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0)
                                                            )} COP
                                                        </span>
                                                    </div>
                                                    {esCreditoDirecto && (
                                                        <>
                                                            <div className="flex justify-between items-center bg-info/10 px-4 py-2 rounded-md border border-info/30 shadow-sm">
                                                                <span className="font-semibold text-info">SALDO A FINANCIAR:</span>
                                                                <span className="font-bold">
                                                                    {fmtCOP(
                                                                        saldoFinanciar1 - (garantiaExt1Sel !== "no" ? garantiaExtVal1 : 0)
                                                                    )} COP
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-red-50 px-4 py-2 rounded-md border border-red-200 shadow-sm">
                                                                <span className="font-semibold text-red-700">Cuota Garantía {garantiaExt1Sel} Meses:</span>
                                                                <span className="font-bold text-red-900">
                                                                    {fmtCOP(cuotaGarantiaExtendidaMoto1)} COP
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}



                                                    {metodo === "credibike" && incluirMoto1 && saldoFinanciar1 > 0 && (
                                                        <div className="mt-3 bg-base-100 border border-base-300 rounded-lg p-3 space-y-1">
                                                            <p className="font-semibold text-sm">Cuotas proyectadas</p>

                                                            <div className="flex justify-between text-sm">
                                                                <span>6 meses:</span>
                                                                <span>{fmtCOP(cuota6_a_auto)} COP</span>
                                                            </div>

                                                            <div className="flex justify-between text-sm">
                                                                <span>12 meses:</span>
                                                                <span>{fmtCOP(cuota12_a_auto)} COP</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>24 meses:</span>
                                                                <span>{fmtCOP(cuota24_a_auto)} COP</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>36 meses:</span>
                                                                <span>{fmtCOP(cuota36_a_auto)} COP</span>
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
                                    <FormSelect<FormValuesCotizacion>
                                        name="marca2"
                                        label="Marca"
                                        control={control}
                                        options={marcaOptions}
                                        placeholder="Seleccione una marca"
                                        disabled={!showMotos || !incluirMoto2}
                                        rules={reqIf(showMotos && incluirMoto2, "La marca es obligatoria")}
                                    />

                                    <FormSelect<FormValuesCotizacion>
                                        name="moto2"
                                        label="Moto (modelo – precio)"
                                        control={control}
                                        options={motoOptions2}
                                        placeholder={selectedMarca2 ? "Seleccione una moto" : "Seleccione una marca primero"}
                                        disabled={!showMotos || !incluirMoto2 || !selectedMarca2}
                                        rules={reqIf(showMotos && incluirMoto2, "La moto es obligatoria")}
                                    />

                                    <FormInput<FormValuesCotizacion>
                                        name="modelo_b"
                                        label="Modelo año"
                                        control={control}
                                        placeholder="Ej. 2025 / Edición especial"
                                        disabled={!showMotos || !incluirMoto2}
                                        className="hidden"
                                    />

                                    {moto2Seleccionada && (
                                        <>
                                            {incluirMoto2 && (
                                                <div className="mt-2 flex justify-center">
                                                    <MotoImage
                                                        src={fotoMoto2 ? `${BASE_URL}/${fotoMoto2}` : undefined}
                                                        thumbClassName="w-32 h-32"
                                                    />
                                                </div>
                                            )}

                                            {showGarantiaExtendida && (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
                                                        name="garantiaExtendida2"
                                                        label="Garantia Extendida"
                                                        control={control}
                                                        options={garantiaExtendidaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                        rules={{
                                                            validate: (v) => {
                                                                if (esCreditoDirecto2 && incluirMoto2) {
                                                                    return v && v !== "no"
                                                                        ? true
                                                                        : "La garantía extendida es obligatoria para crédito directo.";
                                                                }
                                                                return true;
                                                            },
                                                        }}
                                                    />

                                                    {garantiaExtendida2Value !== "no" && (
                                                        <FormInput<FormValuesCotizacion>
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

                                            {metodo === "contado" || metodo === "terceros" ? (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
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

                                                    {gpsContado2Value === "si" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="gps_b"
                                                            label="Valor GPS B"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="Escriba el valor"
                                                            disabled={!showMotos || !incluirMoto2}
                                                            rules={{
                                                                validate: (v) => {
                                                                    if (!incluirMoto2) return true;
                                                                    if (gpsContado2Value !== "si") return true;

                                                                    return (aNumeroOUndefined(v) ?? 0) > 0
                                                                        ? true
                                                                        : "El valor del GPS debe ser mayor a 0.";
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
                                                        name="gps2"
                                                        label="GPS"
                                                        control={control}
                                                        options={gpsOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />

                                                    {gps2Value !== "no" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="gps_b"
                                                            label="Valor GPS B"
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {!esCreditoDirecto2 && (
                                                <>
                                                    <FormSelect<FormValuesCotizacion>
                                                        name="poliza2"
                                                        label={polizaLabel}
                                                        control={control}
                                                        options={polizaOptions}
                                                        placeholder="Seleccione..."
                                                        disabled={!showMotos || !incluirMoto2}
                                                    />

                                                    {poliza2Value !== "" && (
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valor_poliza_b"
                                                            label={`${polizaValorLabel} B`}
                                                            control={control}
                                                            type="number"
                                                            formatThousands
                                                            disabled
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                    <div className="p-3 rounded-md bg-[#3498DB]">
                                        <p className="font-semibold mb-2 text-white">Seguro todo riesgo</p>

                                        <FormInput<FormValuesCotizacion>
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
                                            <FormInput<FormValuesCotizacion>
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
                                                <FormInput<FormValuesCotizacion>
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

                                            <FormInput<FormValuesCotizacion>
                                                name="precioDocumentos2"
                                                label=""
                                                control={control}
                                                type="hidden"
                                                disabled={!showMotos || !incluirMoto2}
                                            />

                                            <FormInput<FormValuesCotizacion>
                                                name="marcacion2"
                                                label="Marcación y personalización"
                                                type="number"
                                                formatThousands
                                                control={control}
                                                placeholder="0"
                                                disabled={!showMotos || !incluirMoto2}
                                            />

                                            <FormInput<FormValuesCotizacion>
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
                                                        const val = aNumeroOUndefined(v) ?? 0;
                                                        const max = precioBase2 + accesorios2Val + documentos2;
                                                        return val <= max || `El descuento no puede superar ${fmtCOP(max)}`;
                                                    },
                                                }}
                                            />

                                            <p className="text-xs text-base-content/60">
                                                Máximo permitido: {fmtCOP(precioBase2 + accesorios2Val + documentos2)}
                                            </p>

                                            <div className="rounded-xl border border-base-200 p-3 space-y-3 bg-base-100">
                                                <p className="font-semibold text-sm">Productos y servicios adicionales (Moto 2)</p>

                                                <div className="grid grid-cols-2 gap-4">
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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorRunt2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.runt}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorLicencia2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.licencia}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorDefensas2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.defensas}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
                                                            name="valorHandSavers2"
                                                            label=""
                                                            type="number"
                                                            formatThousands
                                                            control={control}
                                                            placeholder="0"
                                                            disabled={!showMotos || !incluirMoto2 || !adicionalesMoto2.hand}
                                                        />
                                                    </div>

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
                                                        <FormInput<FormValuesCotizacion>
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

                                            <div className="bg-base-100 shadow-xl rounded-2xl p-6 border border-base-300">
                                                <h3 className="text-lg font-bold mb-4 text-success bg-success/5 px-4 py-2 rounded-lg">
                                                    Resumen de costos
                                                </h3>

                                                <div className="bg-base-200/70 p-4 rounded-xl mb-4 space-y-2">
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Matrícula:</span>
                                                        <span>{fmtCOP(mat2)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Impuestos:</span>
                                                        <span>{fmtCOP(imp2)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">SOAT:</span>
                                                        <span>{fmtCOP(soat2)} COP</span>
                                                    </div>
                                                    <div className="flex justify-between bg-base-100/80 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-semibold text-gray-800">Documentos (M+I+S):</span>
                                                        <span className="font-semibold">{fmtCOP(documentos2)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-purple-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">
                                                            Costos adicionales (RUNT, licencias, defensas, etc.):
                                                        </span>
                                                        <span>{fmtCOP(extrasMoto2)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-error/5 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Descuento / Plan de marca:</span>
                                                        <span className="text-error font-semibold">
                                                            {descuento2Val > 0 ? `-${fmtCOP(descuento2Val)} COP` : "0 COP"}
                                                        </span>
                                                    </div>

                                                    {garantiaExt2Sel !== "no" && metodo === "credibike" && (
                                                        <>
                                                            {/* 🔒 Valor total (oculto por ahora, por si luego lo necesitan) */}
                                                            <div className="hidden justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                                <span className="font-medium text-gray-700">
                                                                    Garantía extendida ({garantiaExt2Sel} meses):
                                                                </span>
                                                                <span>{fmtCOP(garantiaExtVal2)} COP</span>
                                                            </div>

                                                            {/* ✅ Valor correcto mostrado (cuota mensual) */}
                                                            <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                                <span className="font-medium text-gray-700">
                                                                    Garantía extendida ({garantiaExt2Sel} meses):
                                                                </span>
                                                                <span>
                                                                    {fmtCOP(cuotaGarantiaExtendidaMoto2)} / mes
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {gpsAplica2 && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">
                                                                GPS {metodo === "contado" || metodo === "terceros" ? "" : `(${gps2Value} meses)`}:
                                                            </span>
                                                            <span>{fmtCOP(gpsVal2)} COP</span>
                                                        </div>
                                                    )}


                                                    {poliza2Value !== "" && (
                                                        <div className="flex justify-between bg-green-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium">{polizaLabel} {poliza2Value}:</span>
                                                            <span>{fmtCOP(polizaVal2)} COP</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between bg-blue-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Cascos y Accesorios:</span>
                                                        <span>{fmtCOP(accesorios2Val)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between bg-indigo-50/70 px-4 py-2 rounded-md shadow-sm">
                                                        <span className="font-medium text-gray-700">Marcación y personalización:</span>
                                                        <span>{fmtCOP(marcacion2Val)} COP</span>
                                                    </div>

                                                    {esCreditoDirecto && (
                                                        <div className="flex justify-between bg-yellow-50/70 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Inicial:</span>
                                                            <span>{fmtCOP(inicial2)} COP</span>
                                                        </div>
                                                    )}

                                                    {totalSeguros2 > 0 && (
                                                        <div className="flex justify-between bg-[#3498DB]/10 px-4 py-2 rounded-md shadow-sm">
                                                            <span className="font-medium text-gray-700">Seguro todo riesgo:</span>
                                                            <span>{fmtCOP(totalSeguros2)} COP</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300 shadow-sm">
                                                        <span className="font-semibold">PRECIO BASE:</span>
                                                        <span className="font-extrabold">{fmtCOP(precioBase2)} COP</span>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-success/10 px-4 py-2 rounded-md border border-success/30 shadow-sm">
                                                        <span className="font-bold text-success">TOTAL:</span>
                                                        <span className="text-success font-extrabold text-lg">
                                                            {fmtCOP(
                                                                totalConSeguros2 - (garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0)
                                                            )} COP
                                                        </span>
                                                    </div>

                                                    {esCreditoDirecto && (
                                                        <>
                                                            <div className="flex justify-between items-center bg-info/10 px-4 py-2 rounded-md border border-info/30 shadow-sm">
                                                                <span className="font-semibold text-info">SALDO A FINANCIAR:</span>
                                                                <span className="font-bold">
                                                                    {fmtCOP(
                                                                        saldoFinanciar2 - (garantiaExt2Sel !== "no" ? garantiaExtVal2 : 0)
                                                                    )} COP
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between items-center bg-red-50 px-4 py-2 rounded-md border border-red-200 shadow-sm">
                                                                <span className="font-semibold text-red-700">Cuota Garantía {garantiaExt2Sel} Meses:</span>
                                                                <span className="font-bold text-red-900">
                                                                    {fmtCOP(cuotaGarantiaExtendidaMoto2)} COP
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {metodo === "credibike" && incluirMoto2 && saldoFinanciar2 > 0 && (
                                                        <div className="mt-3 bg-base-100 border border-base-300 rounded-lg p-3 space-y-1">
                                                            <p className="font-semibold text-sm">Cuotas proyectadas</p>

                                                            <div className="flex justify-between text-sm">
                                                                <span>6 meses:</span>
                                                                <span>{fmtCOP(cuota6_b_auto)} COP</span>
                                                            </div>

                                                            <div className="flex justify-between text-sm">
                                                                <span>12 meses:</span>
                                                                <span>{fmtCOP(cuota12_b_auto)} COP</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>24 meses:</span>
                                                                <span>{fmtCOP(cuota24_b_auto)} COP</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>36 meses:</span>
                                                                <span>{fmtCOP(cuota36_b_auto)} COP</span>
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

            {metodo === "terceros" && moto1Seleccionada && (
                <div className="hidden gap-6 flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-lg badge-success text-white">Cuotas Moto 1 (A)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_6_a" label="Cuota 6 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_12_a" label="Cuota 12 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_18_a" label="Cuota 18 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_24_a" label="Cuota 24 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_30_a" label="Cuota 30 meses A" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_36_a" label="Cuota 36 meses A" type="number" control={control} placeholder="Opcional" />
                    </div>
                </div>
            )}

            {metodo === "terceros" && moto2Seleccionada && (
                <div className="hidden gap-6 flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-lg badge-success text-white">Cuotas Moto 2 (B)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_6_b" label="Cuota 6 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_12_b" label="Cuota 12 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_18_b" label="Cuota 18 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_24_b" label="Cuota 24 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_30_b" label="Cuota 30 meses B" type="number" control={control} placeholder="Opcional" />
                        <FormInput<FormValuesCotizacion> formatThousands name="cuota_36_b" label="Cuota 36 meses B" type="number" control={control} placeholder="Opcional" />
                    </div>
                </div>
            )}

            {showProductos && (
                <div className=" gap-6 hidden flex-col w-full bg-white p-3 rounded-xl">
                    <div className="badge text-xl badge-success text-white">Otros productos</div>
                    <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput<FormValuesCotizacion> name="producto1Nombre" label="Producto 1 *" control={control} placeholder="Producto" />
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Descripción *</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Descripción"
                                    {...register("producto1Descripcion", { maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                                />
                                {errors.producto1Descripcion && <p className="text-sm text-error">{String(errors.producto1Descripcion.message)}</p>}
                            </div>
                            <FormInput<FormValuesCotizacion> formatThousands name="producto1Precio" label="Precio *" type="number" control={control} placeholder="0 COP" />
                            <FormInput<FormValuesCotizacion> formatThousands name="producto1CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormInput<FormValuesCotizacion> name="producto2Nombre" label="Producto 2 *" control={control} placeholder="Producto" />
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Descripción *</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Descripción"
                                    {...register("producto2Descripcion", { maxLength: { value: 500, message: "Máximo 500 caracteres" } })}
                                />
                                {errors.producto2Descripcion && <p className="text-sm text-error">{String(errors.producto2Descripcion.message)}</p>}
                            </div>
                            <FormInput<FormValuesCotizacion> formatThousands name="producto2Precio" label="Precio *" type="number" control={control} placeholder="0 COP" />
                            <FormInput<FormValuesCotizacion> formatThousands name="producto2CuotaInicial" label="Cuota inicial" type="number" control={control} placeholder="0 COP" />
                        </div>
                    </div>
                </div>
            )}

            {metodo === "credibike" && (
                <p className="text-xs text-base-content/70">
                    Tasa de financiación: <strong>{tasaFinanciacion?.valor ?? "1.88"}% M.V.</strong>
                </p>
            )}

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
                    disabled={isPending}
                >
                    {isPending ? "Cargando..." : "Registrar"}
                </button>
            </div>
        </form>
    );
};

export default CotizacionFormulario;