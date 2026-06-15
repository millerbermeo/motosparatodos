// src/pages/SolicitarFacturacionPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useGetFacturacionPorCotizacionId } from "../services/procesoContadoServices";
import { useAuthStore } from "../store/auth.store";
import { useDistribuidoras } from "../services/distribuidoraServices";
import { useCotizacionSoloMotoById } from "../services/fullServices";
import { SolicitarFacturacionForm } from "../shared/components/contado-terceros/SolicitudFacturacionForm";
import { useUltimaSolicitudPorIdCotizacion } from "../services/solicitudServices";
import { fmtFecha } from "../utils/date";
import { fmtCOP, toNumberSafe } from "../utils/money";
import Box from "../shared/components/solicitar-facturacion/Box";
import ButtonLink from "../shared/components/ButtonLink";
import {
  FileText,
  Bike,
  User2,
  CalendarDays,
  Hash,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from "lucide-react";

type FormValues = {
  documentos: "Si" | "No";
  distribuidora?: string;
  reciboPago?: string;
  descuentoAut?: string;
  saldoContraentrega?: string;
  cedulaFile?: FileList;
  manifiestoFile?: FileList;
  observaciones: string;
  cartaFile?: FileList;
  otrosDocumentosFile?: FileList;
};

const safe = (v?: string | null) => (v ? String(v) : "—");

// Mismas etiquetas que TablaCotizaciones
const estadoLabel = (estado?: string) => {
  if (!estado || estado === "Sin estado") return "Sin revisar";
  if (estado === "Solicitar facturación") return "En facturación";
  if (estado === "Solicitar prefacturación") return "Solicitud de Facturación";
  return estado;
};

const estadoBadgeColor = (estado?: string) => {
  switch (estado) {
    case "Solicitar facturación":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Solicitar prefacturación":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Facturado":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ======================= UI Helpers (mejorados sin romper) ======================= */


const HeadRow = ({ cols }: { cols: React.ReactNode[] }) => (
  <div className="grid grid-cols-12 bg-sky-700 text-white text-xs md:text-sm font-semibold">
    {cols.map((c, i) => (
      <div
        key={i}
        className="px-3 py-2 border-r border-sky-600 last:border-r-0 col-span-2"
      >
        {c}
      </div>
    ))}
  </div>
);

const Row = ({
  cols,
  emphasis,
}: {
  cols: React.ReactNode[];
  emphasis?: "none" | "success" | "danger";
}) => (
  <div className="grid grid-cols-12 border-b last:border-b-0 border-slate-100 bg-white">
    {cols.map((c, i) => (
      <div
        key={i}
        className={`px-3 py-2 text-xs md:text-sm ${i === 0
          ? "col-span-6 md:col-span-6 font-medium text-slate-600"
          : `col-span-6 md:col-span-6 text-right ${emphasis === "success"
            ? "text-emerald-700 font-semibold"
            : emphasis === "danger"
              ? "text-rose-600 font-semibold"
              : "text-slate-800"
          }`
          } border-r border-slate-100 last:border-r-0`}
      >
        {c}
      </div>
    ))}
  </div>
);

/* ===== Helpers de cálculo ===== */
type Num = number | undefined | null;

const toNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const max0 = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.max(n, 0) : undefined;

const desglosarConIva = (
  totalConIva?: Num,
  baseSinIva?: Num,
  ivaExplicito?: Num,
  ivaDec: number = 0.19
) => {
  const total = toNum(totalConIva);
  const base = toNum(baseSinIva);
  const iva = toNum(ivaExplicito);

  if (base !== undefined && iva !== undefined) {
    return { total: base + iva, bruto: base, iva };
  }

  if (total !== undefined && base !== undefined) {
    const ivaCalc = max0(total - base);
    return { total, bruto: base, iva: ivaCalc };
  }

  if (total !== undefined) {
    const brutoCalc = Math.round(total / (1 + ivaDec));
    const ivaCalc = max0(total - brutoCalc);
    return { total, bruto: brutoCalc, iva: ivaCalc };
  }

  if (base !== undefined) {
    const ivaCalc = Math.round(base * ivaDec);
    return { total: base + ivaCalc, bruto: base, iva: ivaCalc };
  }

  return {
    total: undefined as number | undefined,
    bruto: undefined as number | undefined,
    iva: undefined as number | undefined,
  };
};

type MotoCot = {
  precioBase: number;
  precioDocumentos: number;
  descuentos: number;
  accesoriosYMarcacion: number;
  seguros: number;
  soat: number;
  matricula: number;
  impuestos: number;
  adicionalesTotal: number;
  totalSinSeguros: number;
  total: number;
};

const sumSegurosFromJson = (raw: unknown): number => {
  if (typeof raw !== "string" || !raw.trim()) return 0;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((acc, item) => {
      const v = Number(item?.valor ?? 0);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);
  } catch {
    return 0;
  }
};

/**
 * ✅ Evita duplicar seguros:
 * - Si viene JSON y ya cubre "otros", no vuelvas a sumar otro_seguro.
 * - Regla práctica: si jsonSum >= otroSeguro, usa jsonSum. Si no, suma ambos.
 */
const calcularSegurosNoDuplicados = (otroSeguro: number, segurosJsonRaw: unknown) => {
  const jsonSum = sumSegurosFromJson(segurosJsonRaw);
  if (jsonSum > 0 && otroSeguro > 0) {
    return jsonSum >= otroSeguro ? jsonSum : jsonSum + otroSeguro;
  }
  return (jsonSum || 0) + (otroSeguro || 0);
};

const buildMotoFromCotizacion = (
  cot: any,
  lado: "A" | "B"
): MotoCot | undefined => {
  const suffix = lado === "A" ? "_a" : "_b";

  const marca = cot?.[`marca${suffix}`];
  const linea = cot?.[`linea${suffix}`];

  const hasCore =
    marca ||
    linea ||
    cot?.[`precio_base${suffix}`] ||
    cot?.[`precio_total${suffix}`];

  if (!hasCore) return undefined;

  const precioBase = Number(cot?.[`precio_base${suffix}`]) || 0;
  const precioDocumentos = Number(cot?.[`precio_documentos${suffix}`]) || 0;
  const descuentos = Number(cot?.[`descuentos${suffix}`]) || 0;

  const accesorios = Number(cot?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(cot?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;

  const otroSeguro = Number(cot?.[`otro_seguro${suffix}`]) || 0;
  const segurosRaw = cot?.[`seguros${suffix}`];

  const seguros = calcularSegurosNoDuplicados(otroSeguro, segurosRaw);

  const soat = Number(cot?.[`soat${suffix}`]) || 0;
  const matricula = Number(cot?.[`matricula${suffix}`]) || 0;
  const impuestos = Number(cot?.[`impuestos${suffix}`]) || 0;

  const isA = lado === "A";
  const adicionalesRunt = Number(cot?.[isA ? "runt_1" : "runt_2"]) || 0;
  const adicionalesLicencia =
    Number(cot?.[isA ? "licencia_1" : "licencia_2"]) || 0;
  const adicionalesDefensas =
    Number(cot?.[isA ? "defensas_1" : "defensas_2"]) || 0;
  const adicionalesHandSavers =
    Number(cot?.[isA ? "hand_savers_1" : "hand_savers_2"]) || 0;
  const adicionalesOtros =
    Number(cot?.[isA ? "otros_adicionales_1" : "otros_adicionales_2"]) || 0;

  const adicionalesTotal =
    Number(cot?.[isA ? "total_adicionales_1" : "total_adicionales_2"]) ||
    adicionalesRunt +
    adicionalesLicencia +
    adicionalesDefensas +
    adicionalesHandSavers +
    adicionalesOtros;

  const totalSinSeguros =
    Number(cot?.[`total_sin_seguros${suffix}`]) ||
    (precioBase +
      precioDocumentos +
      accesoriosYMarcacion +
      adicionalesTotal -
      descuentos);

  const total =
    Number(cot?.[`precio_total${suffix}`]) || totalSinSeguros + seguros;

  return {
    precioBase,
    precioDocumentos,
    descuentos,
    accesoriosYMarcacion,
    seguros,
    soat,
    matricula,
    impuestos,
    adicionalesTotal,
    totalSinSeguros,
    total,
  };
};


const SolicitarFacturacionPageContadoTercero: React.FC = () => {
  const { cotizacionId } = useParams<{ cotizacionId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetFacturacionPorCotizacionId(cotizacionId);

  const { data: cotFull } = useCotizacionSoloMotoById(data?.cotizacion_id);
  const cotF = cotFull?.data?.cotizacion;

  const IVA_PCT = cotF ? Number((cotF as any).iva ?? 19) : 19;
  const IVA_DEC = IVA_PCT / 100;

  const { data: distsResp, isLoading: loadingDists } = useDistribuidoras({
    page: 1,
    limit: 200,
  });

  const DIST_OPTS = React.useMemo(
    () => [
      { value: "", label: "Seleccione…" },
      ...((distsResp?.data ?? []).map((d) => ({
        value: slugify(d.nombre),
        label: d.nombre,
      })) as Array<{ value: string; label: string }>),
    ],
    [distsResp]
  );

  const distSlugMap = React.useMemo(() => {
    const m = new Map<string, { id: number; nombre: string }>();
    (distsResp?.data ?? []).forEach((d) =>
      m.set(slugify(d.nombre), { id: d.id, nombre: d.nombre })
    );
    return m;
  }, [distsResp]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      documentos: "Si",
      distribuidora: "",
      reciboPago: "",
      descuentoAut: "0",
      saldoContraentrega: "0",
      observaciones: "",
    },
  });

  React.useEffect(() => {
    // cada vez que cambia el codigo o llega nueva data, resetea el formulario
    reset({
      documentos: "Si",
      distribuidora: "",
      reciboPago: "",
      descuentoAut: "0",
      saldoContraentrega: "0",
      observaciones: "",
      cedulaFile: undefined,
      manifiestoFile: undefined,
      cartaFile: undefined,
      otrosDocumentosFile: undefined,
    });
  }, [cotizacionId, data?.idPrimaria, reset]);


  const docValue = watch("documentos");
  const descuentoAutForm = toNumberSafe(watch("descuentoAut"));
  const saldoContraentregaForm = toNumberSafe(watch("saldoContraentrega"));

  const cedulaFiles = watch("cedulaFile");
  const manifiestoFiles = watch("manifiestoFile");
  const cartaFiles = watch("cartaFile");

  const cedulaPreviewUrl = React.useMemo(() => {
    if (!cedulaFiles || cedulaFiles.length === 0) return undefined;
    const f = cedulaFiles[0];
    if (!f.type.startsWith("image/")) return undefined;
    return URL.createObjectURL(f);
  }, [cedulaFiles]);

  const manifiestoPreviewUrl = React.useMemo(() => {
    if (!manifiestoFiles || manifiestoFiles.length === 0) return undefined;
    const f = manifiestoFiles[0];
    if (!f.type.startsWith("image/")) return undefined;
    return URL.createObjectURL(f);
  }, [manifiestoFiles]);

  React.useEffect(() => {
    return () => {
      if (cedulaPreviewUrl) URL.revokeObjectURL(cedulaPreviewUrl);
    };
  }, [cedulaPreviewUrl]);

  React.useEffect(() => {
    return () => {
      if (manifiestoPreviewUrl) URL.revokeObjectURL(manifiestoPreviewUrl);
    };
  }, [manifiestoPreviewUrl]);

  const tipoPagoTexto = React.useMemo(
    () =>
      (
        cotF?.tipo_pago ??
        cotF?.metodo_pago ??
        (data as any)?.tipo_pago ??
        (data as any)?.metodo_pago ??
        ""
      )
        .toString()
        .toLowerCase(),
    [cotF, data]
  );

  const esContado = tipoPagoTexto.includes("contado");
  const esCreditoTercerosCot =
    tipoPagoTexto.includes("crédito de terceros") ||
    tipoPagoTexto.includes("credito de terceros");

  React.useEffect(() => {
    if (!esCreditoTercerosCot) {
      setValue("cartaFile", undefined as any);
    }
  }, [esCreditoTercerosCot, setValue]);

  /* ========= Cálculos (alineados a la otra vista) ========= */

  const ladoMoto: "A" | "B" | undefined = React.useMemo(() => {
    if (!cotF) return undefined;
    const numSel = Number((cotF as any).moto_seleccionada);
    if (numSel === 1) return "A";
    if (numSel === 2) return "B";

    const hasA =
      cotF.marca_a || cotF.linea_a || cotF.precio_base_a || cotF.precio_total_a;
    const hasB =
      cotF.marca_b || cotF.linea_b || cotF.precio_base_b || cotF.precio_total_b;

    if (hasA && !hasB) return "A";
    if (hasB && !hasA) return "B";
    return hasA ? "A" : hasB ? "B" : undefined;
  }, [cotF]);

  const motoCot = React.useMemo(
    () => (cotF && ladoMoto ? buildMotoFromCotizacion(cotF, ladoMoto) : undefined),
    [cotF, ladoMoto]
  );


  const motoNombre = React.useMemo(() => {
    if (!cotF || !ladoMoto) return "—";
    const s = ladoMoto === "A" ? "_a" : "_b";

    const marca = (cotF as any)[`marca${s}`];
    const linea = (cotF as any)[`linea${s}`];

    // Ej: "KYMCO AGILITY FUSION CBS - 2026"
    const full = [marca, linea].filter(Boolean).join(" ");
    return full || "—";
  }, [cotF, ladoMoto]);

  const motoModelo = React.useMemo(() => {
    if (!cotF || !ladoMoto) return "—";
    const s = ladoMoto === "A" ? "_a" : "_b";
    return (cotF as any)[`modelo${s}`] ? String((cotF as any)[`modelo${s}`]) : "—";
  }, [cotF, ladoMoto]);


  const soatNum = motoCot?.soat ?? 0;
  const matriculaNum = motoCot?.matricula ?? 0;
  const impuestosNum = motoCot?.impuestos ?? 0;
  const subtotalDocs = (soatNum || 0) + (matriculaNum || 0) + (impuestosNum || 0);

  // Extras (brutos sin IVA) como la otra vista
  const accesoriosBrutos = motoCot?.accesoriosYMarcacion ?? 0;
  const adicionalesBrutos = motoCot?.adicionalesTotal ?? 0;
  const extrasBrutosTotal = (accesoriosBrutos || 0) + (adicionalesBrutos || 0);
  const iva_extras_total = Math.round(extrasBrutosTotal * IVA_DEC);
  const extras_total_con_iva = extrasBrutosTotal + iva_extras_total;

  // Mantener nombres esperados por el form (sin romper)
  const accesorios_bruto = extrasBrutosTotal;
  const accesorios_iva = iva_extras_total;
  const accesorios_total = extras_total_con_iva;

  const segurosTotal = motoCot?.seguros ?? 0;

  // ✅ Descuentos alineados a la otra vista
  const descuentoIncluido = motoCot?.descuentos ?? 0;
  const totalDescuentosAut = (descuentoAutForm || 0) + (saldoContraentregaForm || 0);
  const totalDescuentos = (descuentoIncluido || 0) + totalDescuentosAut;

  // ✅ Total vehículo = total cotización - docs - extras(con IVA) - seguros - descuentos
  const cn_total_calc = motoCot
    ? (motoCot.total || 0) -
    (subtotalDocs || 0) -
    (accesorios_total || 0) -
    (segurosTotal || 0) -
    (totalDescuentos || 0)
    : 0;

  const { total: cn_total, bruto: cn_bruto, iva: cn_iva } = desglosarConIva(
    cn_total_calc,
    undefined,
    undefined,
    IVA_DEC
  );

  const tot_valor_moto = cn_total ?? 0;

  // Seguros + Extras (con IVA)
  const tot_seguros_accesorios = (segurosTotal || 0) + (accesorios_total || 0);

  // Total general final (como la otra vista)
  const totalGeneralNum =
    (tot_valor_moto || 0) + (subtotalDocs || 0) + (tot_seguros_accesorios || 0);

  const user = useAuthStore((state) => state.user);

  const shouldCheckUltima = !!data?.cotizacion_id;

  const { data: ultimaSol, isLoading: loadingUltimaSol } =
    useUltimaSolicitudPorIdCotizacion(data?.cotizacion_id, {
      enabled: shouldCheckUltima,
    });

  const yaExisteSolicitud = ultimaSol != null;
  const showValidatingUltima = shouldCheckUltima && loadingUltimaSol;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-lg p-8 text-center space-y-3">
          <div className="loader mx-auto mb-2" />
          <h2 className="font-semibold text-slate-800 text-lg">
            Cargando solicitud…
          </h2>
          <p className="text-sm text-slate-500">
            Estamos obteniendo la información de la cotización.
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-rose-200 shadow-lg p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="font-semibold text-rose-700 text-lg">
            No se encontró la solicitud
          </h2>
          <p className="text-sm text-slate-600">
            {error?.message || "Verifica el código e intenta nuevamente."}
          </p>
          <button className="btn btn-outline w-full" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </main>
    );
  }

  if (showValidatingUltima) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-lg p-8 text-center space-y-3">
          <div className="loader mx-auto mb-2" />
          <h2 className="font-semibold text-slate-800 text-lg">
            Validando solicitud existente…
          </h2>
          <p className="text-sm text-slate-500">
            Revisando si ya hay una solicitud para esta cotización.
          </p>
        </div>
      </main>
    );
  }

  const encabezadoCliente = (
    <div className="w-full bg-[#EBF5FB] border border-blue-100 rounded-2xl p-4 md:p-5 shadow-sm">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* IZQUIERDA: Info cliente */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
            <User2 className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">
              {safe(data.nombre_cliente)}
            </h3>

            <div className="text-sm text-slate-600">
              C.C. <span className="font-medium">{safe(data.numero_documento)}</span>
            </div>

            {data.email && (
              <div className="text-xs text-slate-500">
                {data.email}
              </div>
            )}
          </div>
        </div>

        {/* DERECHA: badges / info */}
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-xs">

          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold border ${estadoBadgeColor((cotF as any)?.estado ?? (data as any)?.estado)}`}>
            {estadoLabel((cotF as any)?.estado ?? (data as any)?.estado)}
          </span>

          <span className="px-2 py-1 rounded-full bg-white text-slate-600 border border-slate-200 shadow-sm">
            IVA: <span className="font-semibold">{IVA_PCT.toFixed(2)}%</span>
          </span>

          <span className="px-2 py-1 rounded-full bg-white text-slate-600 border border-slate-200 shadow-sm">
            Pago:{" "}
            <span className="font-semibold">
              {esCreditoTercerosCot
                ? "Crédito de terceros"
                : esContado
                  ? "Contado"
                  : cotF?.tipo_pago || cotF?.metodo_pago || "—"}
            </span>
          </span>

        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-linear-to-b w-full from-slate-50 to-slate-100 py-6 md:py-8">
      <div className="w-full space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8">

        <div className="border border-emerald-100 bg-linear-to-r from-[#EAF7F0]/90 to-emerald-50/60 backdrop-blur rounded-2xl px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">

          {/* Botón volver */}
          <div>
            <ButtonLink
              to="/solicitudes"
              label="Volver a facturación"
              direction="back"
            />
          </div>

          {/* Título */}
          <div className="flex items-center gap-3 justify-center sm:justify-end">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="text-center sm:text-right">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Solicitud de facturación
              </h1>
              {(esCreditoTercerosCot || esContado) && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  {esCreditoTercerosCot ? "Crédito de terceros" : "Contado"}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Header */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex-1">{encabezadoCliente}</div>

            <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                Resumen de cotización
              </div>

              <div className="text-lg font-bold text-slate-900">
                Cotización #{data.cotizacion_id ?? "—"}
              </div>

              <div className="flex flex-wrap md:justify-end items-center gap-2 text-xs mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  <Hash className="h-3 w-3 text-slate-400" />
                  Código: <span className="font-medium">{data.codigo}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  ID: <span className="font-medium">{data.idPrimaria}</span>
                </span>
              </div>

              <div className="mt-3 w-full md:w-auto md:min-w-50">
                <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-emerald-100/50 px-4 py-3 text-right shadow-sm">
                  <div className="text-[11px] text-emerald-700 font-semibold tracking-wide uppercase">
                    Total general
                  </div>
                  <div className="text-xl font-bold text-emerald-800">
                    {fmtCOP(totalGeneralNum)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Datos del cliente / solicitud */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Box title="Datos del cliente" tone="emerald">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Fecha de nacimiento:</span>{" "}
                {fmtFecha((data as any).fecha_nacimiento)}
              </div>
              <div>
                <span className="font-semibold">Ciudad:</span>{" "}
                {safe((data as any).ciudad_residencia)}
              </div>
              {(data.telefono || (cotF as any)?.celular) && (
                <div>
                  <span className="font-semibold">Teléfono:</span>{" "}
                  {safe(data.telefono || (cotF as any)?.celular)}
                </div>
              )}
              {(data.email || (cotF as any)?.email) && (
                <div>
                  <span className="font-semibold">Correo:</span>{" "}
                  {safe(data.email || (cotF as any)?.email)}
                </div>
              )}
              <div className="md:col-span-2">
                <span className="font-semibold">Dirección:</span>{" "}
                {safe((data as any).direccion_residencia)}
              </div>
            </div>
          </Box>

          <Box title="Información de la solicitud" tone="emerald">
            <div className="space-y-1.5 text-sm text-slate-700">
              {(cotF as any)?.asesor && (
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">Asesor:</span>{" "}
                  {safe((cotF as any).asesor)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Creada:</span>{" "}
                {fmtFecha((data as any).creado_en)}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Actualizada:</span>{" "}
                {fmtFecha((data as any).actualizado_en)}
              </div>

              {(data as any).observaciones && (
                <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="font-semibold text-slate-800">
                    Observaciones de la solicitud:{" "}
                  </span>
                  {(data as any).observaciones}
                </div>
              )}
            </div>
          </Box>
        </section>

        {/* Detalle de la moto */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 pt-4 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h3 className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-slate-800">
              <Bike className="h-4 w-4 text-sky-600" />
              Detalle de la motocicleta
            </h3>
            <span className="text-xs text-slate-500">
              Verifique que los datos coincidan con la cotización y la moto a facturar
            </span>
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block border-t border-slate-100 overflow-x-auto">
            <div className="min-w-180">
              <HeadRow cols={["Motocicleta", "Modelo", "# Motor", "# Chasis", "Color", "Placa"]} />
              <div className="grid grid-cols-12 text-sm">
                <div className="col-span-2 px-3 py-2.5 border-r border-slate-100 font-medium text-slate-800">{motoNombre}</div>
                <div className="col-span-2 px-3 py-2.5 border-r border-slate-100 text-slate-700">{motoModelo}</div>
                <div className="col-span-2 px-3 py-2.5 border-r border-slate-100 text-slate-700">{safe((data as any).numero_motor)}</div>
                <div className="col-span-2 px-3 py-2.5 border-r border-slate-100 text-slate-700">{safe((data as any).numero_chasis)}</div>
                <div className="col-span-2 px-3 py-2.5 border-r border-slate-100 text-slate-700">{safe((data as any).color)}</div>
                <div className="col-span-2 px-3 py-2.5 text-slate-700">{safe((data as any).placa)}</div>
              </div>
            </div>
          </div>

          {/* Mobile: tarjetas label/valor */}
          <div className="md:hidden border-t border-slate-100 divide-y divide-slate-100">
            {[
              ["Motocicleta", motoNombre],
              ["Modelo", motoModelo],
              ["# Motor", safe((data as any).numero_motor)],
              ["# Chasis", safe((data as any).numero_chasis)],
              ["Color", safe((data as any).color)],
              ["Placa", safe((data as any).placa)],
            ].map(([label, value], i) => (
              <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <span className="text-sm text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Condiciones del negocio */}
        <Box
          title="Condiciones del negocio"
          tone="emerald"
          right={<span className="font-semibold text-sm">Costos</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0">
            <div className="md:col-span-8 flex items-center justify-center">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 md:px-6 md:py-6 text-center">
                <p className="text-xs md:text-sm text-slate-600">
                  Esta sección resume los valores de la negociación base del vehículo.
                  Revise que el valor bruto, IVA y total coincidan con el acuerdo con
                  el cliente.
                </p>
                <div className="mt-3 text-[11px] text-slate-500">
                  * Incluye descuento (ya incluido) + autorizaciones (si aplica).
                </div>
              </div>
            </div>

            <div className="md:col-span-4 border border-slate-200 md:border-0 md:border-l rounded-xl md:rounded-none md:rounded-r-2xl overflow-hidden">
              <Row
                cols={[
                  "Total vehículo:",
                  <span className="font-semibold">{fmtCOP(tot_valor_moto)}</span>,
                ]}
              />
              <Row
                cols={[
                  "Valor bruto vehículo:",
                  <span className="font-semibold">{fmtCOP(cn_bruto)}</span>,
                ]}
              />
              <Row
                cols={[
                  `IVA vehículo${IVA_PCT > 0 ? ` (${IVA_PCT.toFixed(2)}%)` : ""}:`,
                  <span className="font-semibold">{fmtCOP(cn_iva)}</span>,
                ]}
              />
              <Row
                cols={[
                  "Total vehículo:",
                  <span className="font-semibold text-emerald-700">
                    {fmtCOP(cn_total)}
                  </span>,
                ]}
                emphasis="success"
              />
            </div>
          </div>
        </Box>

        {/* Extras + Totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Box
            title="Adicionales y accesorios"
            tone="sky"
            right={<span className="font-semibold text-sm">Detalle</span>}
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Row
                  cols={[
                    "Accesorios (bruto):",
                    <span className="font-semibold">{fmtCOP(accesoriosBrutos)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Adicionales (bruto):",
                    <span className="font-semibold">{fmtCOP(adicionalesBrutos)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Extras total sin IVA:",
                    <span className="font-semibold text-rose-600">
                      {fmtCOP(extrasBrutosTotal)}
                    </span>,
                  ]}
                  emphasis="danger"
                />
                <Row
                  cols={[
                    `IVA extras${IVA_PCT > 0 ? ` (${IVA_PCT.toFixed(2)}%)` : ""}:`,
                    <span className="font-semibold">{fmtCOP(accesorios_iva)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Extras total con IVA:",
                    <span className="font-bold text-emerald-700">
                      {fmtCOP(accesorios_total)}
                    </span>,
                  ]}
                  emphasis="success"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Se calcula IVA sobre extras (accesorios + adicionales), igual que la otra vista.
              </p>
            </div>
          </Box>

          <Box title="Total de la operación" tone="sky">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Row
                  cols={[
                    "Total vehículo:",
                    <span className="font-semibold">{fmtCOP(tot_valor_moto)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Documentos (subtotal):",
                    <span className="font-semibold">{fmtCOP(subtotalDocs)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "SOAT:",
                    <span className="font-semibold">{fmtCOP(soatNum)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Matrícula:",
                    <span className="font-semibold">{fmtCOP(matriculaNum)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Impuestos:",
                    <span className="font-semibold">{fmtCOP(impuestosNum)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "Seguros + Extras:",
                    <span className="font-semibold">{fmtCOP(tot_seguros_accesorios)}</span>,
                  ]}
                />
                <Row
                  cols={[
                    "TOTAL GENERAL:",
                    <span className="font-bold text-emerald-700 text-base">
                      {fmtCOP(totalGeneralNum)}
                    </span>,
                  ]}
                  emphasis="success"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Este total corresponde al valor general a facturar. Asegúrese de que
                las cifras coincidan con el negocio acordado con el cliente.
              </p>
            </div>
          </Box>
        </div>

        {yaExisteSolicitud ? (
          <div className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50/60 to-white shadow-sm p-4 md:p-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700">
                Ya existe una solicitud de facturación para esta cotización
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Para evitar duplicados, el formulario no se mostrará.
              </p>
            </div>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6 lg:p-7">
            <SolicitarFacturacionForm
              control={control}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              isSubmitting={isSubmitting}
              docValue={docValue}
              esCreditoTercerosCot={esCreditoTercerosCot}
              cartaFiles={cartaFiles}
              manifiestoFiles={manifiestoFiles}
              cedulaFiles={cedulaFiles}
              DIST_OPTS={DIST_OPTS}
              loadingDists={loadingDists}
              onBack={() => navigate(-1)}
              codigo={data.codigo || ""}
              solicitudData={data}
              distSlugMap={distSlugMap}
              userRol={user?.rol}
              navigateTo={(path) => navigate(path)}
              totales={{
                tot_valor_moto,
                cn_bruto: cn_bruto ?? 0,
                cn_iva: cn_iva ?? 0,
                cn_total: cn_total ?? 0,
                accesorios_bruto: accesorios_bruto ?? 0,
                accesorios_iva: accesorios_iva ?? 0,
                accesorios_total: accesorios_total ?? 0,
                soatNum: soatNum ?? 0,
                matriculaNum: matriculaNum ?? 0,
                impuestosNum: impuestosNum ?? 0,
                tot_seguros_accesorios: tot_seguros_accesorios ?? 0,
                totalGeneralNum: totalGeneralNum ?? 0,
              }}
            />
          </section>
        )}
      </div>
    </main>
  );
};

export default SolicitarFacturacionPageContadoTercero;
