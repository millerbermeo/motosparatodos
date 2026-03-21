// src/components/CotizacionSingleMotoPDFButton.tsx
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";

import {
  CotizacionDetalladaPDFDocV2,
} from "./CotizacionDetalladaPDFDocV2";

import type {
  CotizacionApi,
  GarantiaExtApi,
  EmpresaInfo,
} from "./CotizacionDetalladaPDFDocV2";

import { useCotizacionById } from "../../services/cotizacionesServices";
import { useEmpresaById } from "../../services/empresasServices";
import { calcularCreditoDirectoMoto, type CreditoMotoResultado } from "../../shared/components/credito/creditoDirecto.utils";

type Id = number | string;

type Props = {
  id: Id;
  label?: string;
  logoUrl?: string;       // override manual opcional
  empresa?: EmpresaInfo;  // override manual opcional
  motoFotoUrl?: string;
  garantiaExt?: GarantiaExtApi;
  className?: string;
};


const normalizarTexto = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const esCreditoDirectoDesdePayload = (payload: any): boolean => {
  const tipoPago = normalizarTexto(payload?.tipo_pago ?? payload?.metodo_pago);

  return (
    tipoPago.includes("credibike") ||
    tipoPago.includes("credito propio") ||
    tipoPago.includes("credito directo") ||
    tipoPago.includes("directo")
  );
};

const getMesesGarantia = (value: unknown): number => {
  if (value === null || value === undefined || value === "" || value === "no") {
    return 0;
  }

  const meses = Number(value);
  return Number.isFinite(meses) && meses > 0 ? meses : 0;
};



const BaseUrl =
  import.meta.env.VITE_API_URL ??
  "https://tuclick.vozipcolombia.net.co/motos/back";

const sameChipStyles =
  "group flex w-full items-center cursor-pointer max-h-14 justify-between " +
  "rounded-xl px-4 py-2 text-sm font-medium text-white " +
  "shadow-md transition-all hover:shadow-lg focus:outline-none " +
  "bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed";

// Igual que en DetalleCotizacion
const buildImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const root = (BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

// 🚀 Construye un payload "single moto" donde
// la moto seleccionada (1 = A, 2 = B) SIEMPRE queda en los campos *_a / *_1
const buildSingleMotoPayload = (payload: any): any => {
  if (!payload) return payload;

  const motoSeleccionadaNum: number =
    Number(payload.moto_seleccionada ?? 0) || 0;

  // Si no viene selección o es 1, dejamos todo tal cual
  if (motoSeleccionadaNum !== 2) {
    return payload;
  }

  // Clonamos para no tocar el original
  const p: any = { ...payload };

  // Helper para copiar campos sufijados _b -> _a
  const copySideBToA = (bases: string[]) => {
    for (const base of bases) {
      const keyA = `${base}_a`;
      const keyB = `${base}_b`;
      if (keyB in p) {
        p[keyA] = p[keyB];
      }
    }
  };

  // Helper para copiar adicionales *_2 -> *_1
  const copyAdicionales2To1 = (bases: string[]) => {
    for (const base of bases) {
      const key1 = `${base}_1`;
      const key2 = `${base}_2`;
      if (key2 in p) {
        p[key1] = p[key2];
      }
    }
  };

  // 1️⃣ Campos de moto A/B (la B pasa a ocupar los campos A)
  copySideBToA([
    "marca",
    "id_empresa",
    "linea",
    "modelo",
    "garantia",
    "accesorios",
    "marcacion",
    "seguro_vida",
    "seguro_mascota_s",
    "seguro_mascota_a",
    "otro_seguro",
    "precio_base",
    "precio_documentos",
    "soat",
    "impuestos",
    "matricula",
    "precio_total",
    "seguros",
    "total_sin_seguros",
    "cuota_inicial",
    "cuota_6",
    "cuota_12",
    "cuota_18",
    "cuota_24",
    "cuota_30",
    "cuota_36",
    "foto",
    "garantia_extendida",
    "descuentos",
    "saldo_financiar",
    "valor_garantia_extendida",
  ]);

  // 2️⃣ Adicionales 2 → 1 (RUNT, licencias, etc.)
  copyAdicionales2To1([
    "runt",
    "licencia",
    "defensas",
    "hand_savers",
    "otros_adicionales",
    "total_adicionales",
  ]);

  // 3️⃣ Genéricos para plantillas que usan producto1*
  p.producto1Precio = p.precio_total_a ?? 0;
  p.producto1CuotaInicial = p.cuota_inicial_a ?? 0;

  // saldo a financiar si lo maneja así tu PDF
  p.saldo_financiar_1 = p.saldo_financiar_a ?? 0;

  // Nombre de la moto para "Moto: ..."
  const marcaSel = p.marca_a ?? "";
  const lineaSel = p.linea_a ?? "";
  p.producto1Nombre = `${marcaSel} ${lineaSel}`.trim();

  return p;
};

export const CotizacionSingleMotoPDFButton: React.FC<Props> = ({
  id,
  label,
  logoUrl: logoUrlProp,
  empresa: empresaProp,
  motoFotoUrl,
  garantiaExt,
  className,
}) => {
  const finalClasses = `${sameChipStyles} ${className ?? ""}`;
  const textLabel = label ?? "Descargar cotización";

  // 1) Hook de cotización
  const { data, isLoading, isError } = useCotizacionById(id);
  const cotizacion = data as CotizacionApi | undefined;

  // 2) Payload plano (puede venir como { success, data } o solo el objeto)
  const rawPayload: any = (cotizacion as any)?.data ?? cotizacion;

  // 3) Determinar moto seleccionada: 1 = A, 2 = B
  const motoSeleccionadaNum: number =
    Number(rawPayload?.moto_seleccionada ?? 0) || 0;

  // 4) Construir payload "single moto" donde la seleccionada siempre es la A/1
  const payload = buildSingleMotoPayload(rawPayload);


  const creditoDirecto: CreditoMotoResultado | null = React.useMemo(() => {
    if (!payload) return null;

    const esCreditoDirecto = esCreditoDirectoDesdePayload(payload);
    if (!esCreditoDirecto) return null;

    const mesesGarantia = getMesesGarantia(payload?.garantia_extendida_a);

    const resultado = calcularCreditoDirectoMoto({
      incluir: mesesGarantia > 0,
      mesesGarantia,
      valorGarantia: payload?.valor_garantia_extendida_a ?? 0,
      saldoFinanciar: payload?.saldo_financiar_a ?? 0,
      tasaFinanciacionPct: payload?.tasa_financiacion ?? 1.9122,
      tasaGarantiaPct: payload?.tasa_garantia ?? 1.5,
    });

    return resultado;
  }, [payload]);


  // 5) Elegir id_empresa según la moto seleccionada original
  const rawIdEmpresa: any = (() => {
    if (motoSeleccionadaNum === 1) {
      return rawPayload?.id_empresa_a ?? rawPayload?.id_empresa_b;
    }
    if (motoSeleccionadaNum === 2) {
      return rawPayload?.id_empresa_b ?? rawPayload?.id_empresa_a;
    }
    // fallback si no hay selección
    return rawPayload?.id_empresa_a ?? rawPayload?.id_empresa_b;
  })();

  const idEmpresa = Number(rawIdEmpresa);

  // 6) Hook de empresa
  const {
    data: empresaSeleccionada,
    isLoading: loadingEmpresa,
  } = useEmpresaById(idEmpresa);

  // 7) Empresa para el PDF (usa override si viene por props)
  const empresaPDF: EmpresaInfo = React.useMemo(() => {
    if (empresaProp) {
      return empresaProp;
    }

    if (!empresaSeleccionada) {
      // Fallback mientras carga o si no hay empresa
      return {
        nombre: "",
        ciudad: "",
        almacen: "",
        nit: "",
        telefono: "",
        direccion: "",
      };
    }

    return {
      nombre: empresaSeleccionada.nombre_empresa,
      ciudad: "Cali", // ajusta si tu tabla de empresas tiene ciudad
      almacen: empresaSeleccionada.nombre_empresa,
      nit: empresaSeleccionada.nit_empresa,
      telefono: empresaSeleccionada.telefono_garantias ?? "",
      direccion: empresaSeleccionada.direccion_siniestros ?? "",
    };
  }, [empresaProp, empresaSeleccionada]);

  // 8) Logo (usa override si viene por props)
  const logoUrl: string | undefined = React.useMemo(() => {
    if (logoUrlProp) return logoUrlProp;

    const fromEmpresa = empresaSeleccionada?.foto
      ? buildImageUrl(empresaSeleccionada.foto)
      : undefined;

    return fromEmpresa || "/moto3.png";
  }, [logoUrlProp, empresaSeleccionada]);

  // 9) Foto de moto para el PDF: según la moto seleccionada original
  const motoFotoUrlFinal: string | undefined = React.useMemo(() => {
    if (motoFotoUrl) return motoFotoUrl; // override manual

    if (!rawPayload) return undefined;

    if (motoSeleccionadaNum === 1) {
      return buildImageUrl(rawPayload?.foto_a);
    }
    if (motoSeleccionadaNum === 2) {
      return buildImageUrl(rawPayload?.foto_b);
    }

    // Si no hay selección (caso raro), intenta A y luego B
    return buildImageUrl(rawPayload?.foto_a) ?? buildImageUrl(rawPayload?.foto_b);
  }, [motoFotoUrl, rawPayload, motoSeleccionadaNum]);

  // 10) Volver a armar el objeto cotizacion con el payload transformado
  const cotizacionForPdf: CotizacionApi | undefined = React.useMemo(() => {
    if (!cotizacion) return undefined;

    // Si la API viene como { success, data: {...} }
    if ((cotizacion as any).data) {
      return {
        ...(cotizacion as any),
        data: payload,
      } as CotizacionApi;
    }

    // Si la API ya trae directamente el objeto
    return payload as CotizacionApi;
  }, [cotizacion, payload]);

  // === A PARTIR DE AQUÍ YA SE PUEDEN HACER RETURNS ===

  if (isLoading) {
    return (
      <button disabled className={finalClasses} title={textLabel}>
        <span className="flex items-center gap-2">Cargando cotización…</span>
        <Download className="w-4 h-4 opacity-80 group-hover:opacity-100" />
      </button>
    );
  }

  if (isError || !cotizacionForPdf) {
    return (
      <button disabled className={finalClasses} title={textLabel}>
        <span className="flex items-center gap-2">
          Error al cargar cotización
        </span>
        <Download className="w-4 h-4 opacity-80 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <CotizacionDetalladaPDFDocV2
          cotizacion={cotizacionForPdf}
          garantiaExt={garantiaExt}
          logoUrl={logoUrl}
          empresa={empresaPDF}
          motoFotoUrl={motoFotoUrlFinal}
          creditoDirecto={creditoDirecto}
        />
      }
      fileName={`cotizacion-${id}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading || loadingEmpresa}
          className={finalClasses}
          title={textLabel}
        >
          <span className="flex items-center gap-2">
            {loading || loadingEmpresa ? "Generando PDF..." : textLabel}
          </span>
          <Download className="w-4 h-4 opacity-80 group-hover:opacity-100" />
        </button>
      )}
    </PDFDownloadLink>
  );
};
