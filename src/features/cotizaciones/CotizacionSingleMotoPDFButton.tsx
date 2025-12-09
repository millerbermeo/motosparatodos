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

const BaseUrl =
  import.meta.env.VITE_API_URL ?? "http://tuclick.vozipcolombia.net.co/motos/back";

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
  const textLabel = label ?? "Descargar cotización (PDF v2)";

  // 1) Primero SIEMPRE: hook de cotización
  const { data, isLoading, isError } = useCotizacionById(id);
  const cotizacion = data as CotizacionApi | undefined;
  const payload: any = (cotizacion as any)?.data ?? cotizacion;

  // 2) Luego SIEMPRE: id de empresa a partir del payload
  const rawIdEmpresa =
    payload?.id_empresa_a ??
    payload?.id_empresa_b;

  const idEmpresa = Number(rawIdEmpresa);

  console.log(idEmpresa)

  // 3) Hook de empresa SIEMPRE (aunque idEmpresa sea NaN, igual que en DetalleCotizacion)
  const {
    data: empresaSeleccionada,
    isLoading: loadingEmpresa,
  } = useEmpresaById(idEmpresa);

  // 4) Empresa para el PDF (usa override si viene por props)
  const empresaPDF: EmpresaInfo = React.useMemo(() => {
    if (empresaProp) {
      return empresaProp;
    }

    if (!empresaSeleccionada) {
      // Fallback mientras carga o si no hay
      return {
        nombre: "Feria de la Movilidad",
        ciudad: "Cali",
        almacen: "Feria de la Movilidad",
        nit: "123.456.789-0",
        telefono: "300 000 0000",
        direccion: "Dirección ejemplo 123",
      };
    }

    return {
      nombre: empresaSeleccionada.nombre_empresa,
      ciudad: "Cali", // ajusta si tu tabla de empresa tiene ciudad
      almacen: empresaSeleccionada.nombre_empresa,
      nit: empresaSeleccionada.nit_empresa,
      telefono: empresaSeleccionada.telefono_garantias ?? "",
      direccion: empresaSeleccionada.direccion_siniestros ?? "",
    };
  }, [empresaProp, empresaSeleccionada]);

  // 5) Logo (usa override si viene por props)
  const logoUrl: string | undefined = React.useMemo(() => {
    if (logoUrlProp) return logoUrlProp;

    const fromEmpresa = empresaSeleccionada?.foto
      ? buildImageUrl(empresaSeleccionada.foto)
      : undefined;

    return fromEmpresa || "/moto3.png";
  }, [logoUrlProp, empresaSeleccionada]);

  // === A PARTIR DE AQUÍ PUEDES HACER RETURNS SIN ROMPER HOOKS ===

  if (isLoading) {
    return (
      <button disabled className={finalClasses} title={textLabel}>
        <span className="flex items-center gap-2">Cargando cotización…</span>
        <Download className="w-4 h-4 opacity-80 group-hover:opacity-100" />
      </button>
    );
  }

  if (isError || !cotizacion) {
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
          cotizacion={cotizacion}
          garantiaExt={garantiaExt}
          logoUrl={logoUrl}
          empresa={empresaPDF}
          motoFotoUrl={motoFotoUrl}
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
