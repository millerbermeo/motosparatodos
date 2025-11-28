// src/pages/DetallesFacturacion.tsx
import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCotizacionFullById } from "../services/fullServices";
import DocumentosSolicitud from "../features/solicitudes/DocumentosSolicitud";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useIvaDecimal } from "../services/ivaServices";

// Hooks del servicio de solicitudes
import {
  useUltimaSolicitudPorIdCotizacion,
  useActualizarFacturaSolicitud,
} from "../services/solicitudServices";

import Swal from "sweetalert2";

// 🔹 NUEVO: panel de descuentos / contraentrega
import DescuentosContraentregaPanel from "../shared/components/DescuentosContraentregaPanel";
import SolicitudFacturaPDF2 from "../features/creditos/pdf/SolicitudFacturaPDF2";

type Num = number | undefined | null;

// Helpers
const toNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const fmtCOP = (v?: Num) =>
  typeof v === "number" && Number.isFinite(v)
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(v)
    : v === 0
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(0)
    : "—";

const pick = <T,>(...vals: (T | undefined | null | "")[]): T | undefined => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
};

const sum = (...vals: Num[]): number | undefined => {
  const arr = vals.map(toNum).filter((n): n is number => typeof n === "number");
  return arr.length ? arr.reduce((a, b) => a + b, 0) : undefined;
};

const max0 = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.max(n, 0) : undefined;

const fmtDate = (raw?: string | null) => {
  if (!raw) return "—";
  return raw.replace("T", " ").split(".")[0];
};

const RowRight: React.FC<{
  label: string;
  value?: string;
  bold?: boolean;
  badge?: string;
}> = ({ label, value = "—", bold, badge = "" }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div
      className={`col-span-4 sm:col-span-2 text-right ${
        bold ? "font-semibold text-slate-900" : "font-medium text-slate-800"
      }`}
    >
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

// Base URL para armar links de descarga
const BASE_BACK_URL = "https://tuclick.vozipcolombia.net.co/motos/back/";

// Helper para construir URLs absolutas
const buildUrlFromBase = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const clean = path.replace(/^\/+/, "");
  return `${BASE_BACK_URL}${clean}`;
};

// 🔹 Helper genérico para desglosar TOTAL = BRUTO + IVA
const desglosarConIva = (
  totalConIva?: Num,
  baseSinIva?: Num,
  ivaExplicito?: Num,
  ivaDec: number = 0.19
) => {
  const total = toNum(totalConIva);
  const base = toNum(baseSinIva);
  const iva = toNum(ivaExplicito);

  // Caso ideal: ya viene todo explícito
  if (base !== undefined && iva !== undefined) {
    return {
      total: base + iva,
      bruto: base,
      iva,
    };
  }

  // Si tengo total y base => IVA = total - base
  if (total !== undefined && base !== undefined) {
    const ivaCalc = max0(total - base);
    return {
      total,
      bruto: base,
      iva: ivaCalc,
    };
  }

  // Si solo tengo total => calculo base e IVA desde total
  if (total !== undefined) {
    const brutoCalc = Math.round(total / (1 + ivaDec));
    const ivaCalc = max0(total - brutoCalc);
    return {
      total,
      bruto: brutoCalc,
      iva: ivaCalc,
    };
  }

  // Si solo tengo base => calculo IVA desde base
  if (base !== undefined) {
    const ivaCalc = Math.round(base * ivaDec);
    return {
      total: base + ivaCalc,
      bruto: base,
      iva: ivaCalc,
    };
  }

  // Si no hay nada
  return {
    total: undefined as number | undefined,
    bruto: undefined as number | undefined,
    iva: undefined as number | undefined,
  };
};

const DetallesFacturacion: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const id_cotizacion = (idParam ?? "").trim();

  const { data, isLoading, isError, error, refetch } =
    useCotizacionFullById(id_cotizacion);

  // Última solicitud de facturación por id_cotizacion
  const {
    data: ultimaSolData,
    isLoading: isUltimaSolLoading,
    isError: isUltimaSolError,
  } = useUltimaSolicitudPorIdCotizacion(id_cotizacion);

  // Hook para actualizar factura
  const {
    mutate: actualizarFactura,
    isPending: isSubiendoFactura,
  } = useActualizarFacturaSolicitud();

  // Estado local para el archivo de factura
  const [facturaFile, setFacturaFile] = useState<File | null>(null);

  // IVA desde backend (con fallback)
  const {
    ivaDecimal,
    porcentaje,
    isLoading: ivaLoading,
    error: ivaError,
  } = useIvaDecimal();

  const IVA_DEC = ivaLoading || ivaError ? 0.19 : ivaDecimal ?? 0.19;
  const IVA_PCT = ivaLoading || ivaError ? 19 : Number(porcentaje ?? 19);

  // data = { success, data: { cotizacion, creditos, solicitar_estado_facturacion } }
  const cot = data?.data?.cotizacion ?? null;
  const cred = data?.data?.creditos ?? null;
  const sol = data?.data?.solicitar_estado_facturacion ?? null;

  // ===================== SELECCIÓN DE MOTO A/B =====================

  const motoSeleccionada: "a" | "b" | undefined = useMemo(() => {
    if (!cot) return undefined;

    const descA = [cot.marca_a, cot.linea_a].filter(Boolean).join(" ").toLowerCase();
    const descB = [cot.marca_b, cot.linea_b].filter(Boolean).join(" ").toLowerCase();

    const refTexto = [sol?.motocicleta, sol?.modelo, cred?.producto]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (refTexto && descA && refTexto.includes(descA)) return "a";
    if (refTexto && descB && refTexto.includes(descB)) return "b";

    if (descA && !descB) return "a";
    if (descB && !descA) return "b";

    return undefined;
  }, [cot, sol, cred]);

  const pickMotoField = (base: string): any => {
    if (!cot) return undefined;
    const anyCot: any = cot;
    const fa = anyCot[`${base}_a`];
    const fb = anyCot[`${base}_b`];

    if (motoSeleccionada === "a") return fa ?? fb ?? anyCot[base];
    if (motoSeleccionada === "b") return fb ?? fa ?? anyCot[base];

    return fa ?? fb ?? anyCot[base];
  };

  // ===================== ESTADO / CLIENTE =====================

  const estadoCotizacion: string | undefined =
    cot?.estado ||
    (sol as any)?.estado ||
    (sol as any)?.estado_facturacion ||
    undefined;

  // Tipo de pago unificado
  const tipoPagoTexto = (
    cot?.tipo_pago ??
    cred?.tipo_pago ??
    sol?.tipo_solicitud ??
    ""
  )
    .toString()
    .toLowerCase();

  const esContado = tipoPagoTexto.includes("contado");

  // Crédito de terceros (con o sin tilde)
  const esCreditoTerceros =
    tipoPagoTexto.includes("crédito de terceros") ||
    tipoPagoTexto.includes("credito de terceros");

  const ultimaSolRegistro: any =
    (ultimaSolData as any)?.registro ?? ultimaSolData ?? null;

  const idSolicitud =
    ultimaSolRegistro && ultimaSolRegistro.id
      ? Number(ultimaSolRegistro.id)
      : undefined;

  const isFinalAutorizacion: boolean = (() => {
    if (!ultimaSolRegistro) return false;
    const raw =
      ultimaSolRegistro.is_final !== undefined
        ? ultimaSolRegistro.is_final
        : ultimaSolRegistro.isFinal;
    const n = Number(raw);
    return Number.isFinite(n) && n === 1;
  })();

  const clienteNombre = useMemo(
    () =>
      pick<string>(
        sol?.nombre_cliente,
        [cot?.name, cot?.s_name, cot?.last_name, cot?.s_last_name]
          .filter(Boolean)
          .join(" ")
      ) ?? "—",
    [cot, sol]
  );

  const clienteDocumento =
    pick<string>(sol?.numero_documento, cot?.cedula) ?? "—";
  const clienteTelefono = pick<string>(sol?.telefono, cot?.celular) ?? "—";
  const clienteEmail = pick<string>(sol?.email, cot?.email) ?? "—";

  const codigoSolicitud =
    pick<string>(sol?.codigo, cot?.codigo, id_cotizacion) ?? id_cotizacion;

  const fechaCreacion =
    pick<string>(sol?.creado_en, cot?.fecha_creacion, cred?.fecha_creacion) ??
    "—";
  const asesor = pick<string>(cred?.asesor, cot?.asesor) ?? "—";

  // ===================== MOTO (USANDO A / B CORRECTA) =====================

  const marcaLinea =
    pick<string>(
      [sol?.motocicleta, sol?.modelo].filter(Boolean).join(" "),
      [pickMotoField("marca"), pickMotoField("linea")]
        .filter(Boolean)
        .join(" "),
      [cot?.marca_a, cot?.linea_a].filter(Boolean).join(" ")
    ) ?? "—";

  const numeroMotor =
    pick<string>(sol?.numero_motor, cred?.numero_motor) ?? "—";
  const numeroChasis =
    pick<string>(sol?.numero_chasis, cred?.numero_chasis) ?? "—";
  const color = pick<string>(sol?.color, cred?.color) ?? "—";
  const placa = pick<string>(sol?.placa, cred?.placa) ?? "—";

  // ===================== DOCUMENTOS & EXTRAS (BASE PARA TODOS LOS CÁLCULOS) =====================

  // Documentos (preferimos la descomposición de la cotización)
  const soat = toNum(
    pick(sol?.tot_soat, pickMotoField("soat"), cot?.soat_a, cot?.soat_b, cred?.soat)
  );
  const matricula = toNum(
    pick(
      sol?.tot_matricula,
      pickMotoField("matricula"),
      pickMotoField("precio_documentos"),
      cot?.matricula_a,
      cot?.matricula_b,
      cot?.precio_documentos_a,
      cot?.precio_documentos_b,
      cred?.matricula
    )
  );
  const impuestos = toNum(
    pick(
      sol?.tot_impuestos,
      pickMotoField("impuestos"),
      cot?.impuestos_a,
      cot?.impuestos_b,
      cred?.impuestos
    )
  );
  const subtotalDocs = sum(soat, matricula, impuestos);

  // Accesorios
  const rawAccTotal = toNum(pick(sol?.acc_total, cred?.accesorios_total));
  const rawAccBruto = toNum(sol?.acc_valor_bruto);
  const rawAccIva = toNum(sol?.acc_iva);

  const {
    total: accesorios_total,
    bruto: accesorios_bruto,
    iva: acc_iva_accesorios,
  } = desglosarConIva(rawAccTotal, rawAccBruto, rawAccIva, IVA_DEC);

  // Seguros (ya vienen como total)
  const seguros_total = toNum(
    pick(sol?.tot_seguros_accesorios, cred?.precio_seguros)
  );

  const acc_seg_total = sum(accesorios_total, seguros_total);

  // ===================== VALOR DEL VEHÍCULO (SOLO MOTO) =====================

  const valorProducto =
    toNum(cred?.valor_producto) ??
    toNum(pickMotoField("precio_total"));

  let valorMoto: number | undefined;

  if (typeof valorProducto === "number" && Number.isFinite(valorProducto)) {
    const docs =
      (typeof soat === "number" ? soat : 0) +
      (typeof matricula === "number" ? matricula : 0) +
      (typeof impuestos === "number" ? impuestos : 0);

    const extras =
      (typeof accesorios_total === "number" ? accesorios_total : 0) +
      (typeof seguros_total === "number" ? seguros_total : 0);

    const base = valorProducto - docs - extras;
    valorMoto = base > 0 ? base : valorProducto;
  } else {
    // Fallback: precio_base de la cotización
    valorMoto = toNum(pickMotoField("precio_base"));
  }

  // ===================== CONDICIONES DEL NEGOCIO (IVA) =====================

  // Vehículo: solo la moto, sin documentos ni accesorios/seguros
  const rawVehiculoTotal = toNum(
    pick(
      sol?.cn_total,
      sol?.cn_valor_moto,
      valorMoto,
      pickMotoField("precio_base")
    )
  );
  const rawVehiculoBruto = toNum(sol?.cn_valor_bruto);
  const rawVehiculoIva = toNum(sol?.cn_iva);

  const {
    total: cn_total,
    bruto: cn_bruto,
    iva: cn_iva,
  } = desglosarConIva(rawVehiculoTotal, rawVehiculoBruto, rawVehiculoIva, IVA_DEC);

  // ===================== TOTAL GENERAL =====================

  const totalGeneral =
    toNum(sol?.tot_general) ??
    sum(cn_total, subtotalDocs, acc_seg_total) ??
    sum(
      valorMoto,
      soat,
      matricula,
      impuestos,
      accesorios_total,
      seguros_total
    );

  // ===================== CRÉDITO (POR SI APLICA) =====================

  const financiador = pick<string>(cred?.producto) ?? "—";
  const cuota_inicial = toNum(cred?.cuota_inicial) ?? 0;
  const saldoFinanciar = max0((totalGeneral ?? 0) - cuota_inicial) ?? 0;

  // ===================== URLS DE DOCUMENTOS (BASE) =====================

  const manifiesto_url =
    sol && (sol as any).manifiesto_url
      ? (sol as any).manifiesto_url
      : cred?.formato_referencia || null;

  const cedula_url =
    sol && (sol as any).cedula_url
      ? (sol as any).cedula_url
      : cred?.formato_datacredito || null;

  const factura_url =
    (sol as any)?.factura_url ||
    (cot as any)?.factura_url ||
    null;

  const numeroReciboSolicitud: string | null =
    (ultimaSolRegistro &&
      (ultimaSolRegistro.numero_recibo ??
        ultimaSolRegistro.numeroRecibo)) ??
    sol?.numero_recibo ??
    null;

  const resiboPagoSolicitud: string | null =
    (ultimaSolRegistro &&
      (ultimaSolRegistro.resibo_pago ??
        ultimaSolRegistro.recibo_pago)) ??
    sol?.resibo_pago ??
    null;

  const cedulaPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.cedula) ?? null;

  const manifiestoPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.manifiesto) ?? null;

  const facturaPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.factura) ?? null;

  const cedulaUrlFinal =
    buildUrlFromBase(cedulaPathUlt) || buildUrlFromBase(cedula_url);
  const manifiestoUrlFinal =
    buildUrlFromBase(manifiestoPathUlt) || buildUrlFromBase(manifiesto_url);
  const facturaUrlFinal =
    buildUrlFromBase(facturaPathUlt) || buildUrlFromBase(factura_url);

  const tieneFactura = !!facturaUrlFinal;

  // 🔹 LÓGICA PARA MOSTRAR PANEL / DOCUMENTOS
  // - Contado y Crédito de terceros → pasan por DescuentosContraentregaPanel, luego DocumentosSolicitud cuando is_final = 1
  // - Créditos normales → NO panel; van directo a DocumentosSolicitud cuando hay factura + idSolicitud

  const debeMostrarDescuentosPanel =
    (esContado || esCreditoTerceros) &&
    !!idSolicitud &&
    tieneFactura &&
    !isFinalAutorizacion;

  const debeMostrarDocumentosSolicitud =
    ((esContado || esCreditoTerceros) && isFinalAutorizacion) ||
    (!esContado && !esCreditoTerceros && !!idSolicitud && tieneFactura);

  // ===================== HANDLERS FACTURA =====================

  const handleFacturaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;
    setFacturaFile(file || null);
  };

  const handleSubirFactura = () => {
    if (!idSolicitud) {
      Swal.fire(
        "Sin solicitud",
        "No se encontró el ID de la solicitud de facturación. Verifica que exista una solicitud.",
        "warning"
      );
      return;
    }

    if (!facturaFile) {
      Swal.fire(
        "Archivo requerido",
        "Selecciona un archivo de factura antes de enviar.",
        "info"
      );
      return;
    }

    const fd = new FormData();
    fd.append("id", String(idSolicitud));
    fd.append("factura", facturaFile);
    fd.append("id_cotizacion", id_cotizacion);

    actualizarFactura(fd, {
      onSuccess: () => {
        setFacturaFile(null);
        refetch();
      },
    });
  };

  return (
    <main className="min-h-screen w-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between gap-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Detalles de Facturación
          </h1>
          <button
            onClick={() => refetch()}
            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          >
            Recargar datos
          </button>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            Cargando información…
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Error al cargar detalles: {String((error as any)?.message ?? "")}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Cliente */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-base font-semibold text-emerald-700 mb-3">
                    Cliente
                  </h2>
                  <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                    <div className="font-medium text-slate-900">
                      {clienteNombre}
                    </div>
                    <div className="text-slate-600">
                      {clienteDocumento}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Teléfono:
                      </span>{" "}
                      <span className="text-slate-600">
                        {clienteTelefono}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Correo:
                      </span>{" "}
                      <span className="text-slate-600">
                        {clienteEmail}
                      </span>
                    </div>
                    <div className="pt-2 text-xs text-slate-500 space-y-0.5">
                      {cot?.canal_contacto && (
                        <div>
                          <span className="font-semibold">
                            Canal de contacto:
                          </span>{" "}
                          {cot.canal_contacto}
                        </div>
                      )}
                      {cot?.pregunta && (
                        <div>
                          <span className="font-semibold">
                            Necesidad del cliente:
                          </span>{" "}
                          {cot.pregunta}
                        </div>
                      )}
                      {cot?.tipo_pago && (
                        <div>
                          <span className="font-semibold">
                            Tipo de pago:
                          </span>{" "}
                          {cot.tipo_pago}
                        </div>
                      )}
                      {cot?.metodo_pago && (
                        <div>
                          <span className="font-semibold">
                            Método de pago:
                          </span>{" "}
                          {cot.metodo_pago}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        Solicitud #{codigoSolicitud}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Creado: {fmtDate(fechaCreacion)}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Asesor: {asesor}
                      </div>
                      {estadoCotizacion && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                          Estado: {estadoCotizacion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Motocicleta */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold px-5 py-2.5 text-sm">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-5">Motocicleta</div>
                  <div className="col-span-2"># Motor</div>
                  <div className="col-span-3"># Chasis</div>
                  <div className="col-span-1 text-right">Color</div>
                  <div className="col-span-1 text-right">Placa</div>
                </div>
              </div>
              <div className="px-5 py-3 text-sm text-slate-800">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-5 truncate">
                    {marcaLinea}
                  </div>
                  <div className="col-span-2 truncate">
                    {numeroMotor}
                  </div>
                  <div className="col-span-3 truncate">
                    {numeroChasis}
                  </div>
                  <div className="col-span-1 text-right">
                    {color}
                  </div>
                  <div className="col-span-1 text-right">
                    {placa}
                  </div>
                </div>
              </div>
            </section>

            {/* Condiciones del negocio */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
                <span>Condiciones del negocio</span>
                <span>Costos</span>
              </div>
              <div className="divide-y divide-slate-200">
                <RowRight
                  label="Valor bruto vehículo:"
                  value={fmtCOP(cn_bruto)}
                />
                <RowRight
                  label={`IVA vehículo (${IVA_PCT}%):`}
                  value={fmtCOP(cn_iva)}
                />
                <RowRight
                  label="Total vehículo:"
                  value={fmtCOP(cn_total)}
                  bold
                  badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"
                />
              </div>
              <div className="px-5 pb-3 pt-1 text-[11px] text-slate-500">
                IVA calculado automáticamente a partir del total del vehículo cuando no viene informado en la solicitud.
              </div>
            </section>

            {/* Documentos */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm">
                Documentos
              </div>
              <div className="divide-y divide-slate-200">
                <RowRight label="SOAT:" value={fmtCOP(soat)} />
                <RowRight
                  label="Matrícula:"
                  value={fmtCOP(matricula)}
                />
                <RowRight
                  label="Impuestos:"
                  value={fmtCOP(impuestos)}
                />
                <RowRight
                  label="Subtotal documentos:"
                  value={fmtCOP(subtotalDocs)}
                  bold
                />
              </div>
            </section>

            {/* Seguros, accesorios y total */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
                  Seguros y accesorios
                </div>
                <div className="divide-y divide-slate-200">
                  <RowRight
                    label="Accesorios (bruto):"
                    value={fmtCOP(accesorios_bruto)}
                  />
                  <RowRight
                    label={`IVA accesorios (${IVA_PCT}%):`}
                    value={fmtCOP(acc_iva_accesorios)}
                  />
                  <RowRight
                    label="Accesorios (total):"
                    value={fmtCOP(accesorios_total)}
                  />
                  <RowRight
                    label="Seguros:"
                    value={fmtCOP(seguros_total)}
                  />
                  <RowRight
                    label="Total Seguros + Accesorios:"
                    value={fmtCOP(acc_seg_total)}
                    bold
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
                  TOTAL
                </div>
                <div className="divide-y divide-slate-200">
                  <RowRight
                    label="Total vehículo:"
                    value={fmtCOP(cn_total)}
                  />
                  <RowRight
                    label="Documentos:"
                    value={fmtCOP(subtotalDocs)}
                  />
                  <RowRight
                    label="Seguros + Accesorios:"
                    value={fmtCOP(acc_seg_total)}
                  />
                  <RowRight
                    label="TOTAL GENERAL:"
                    value={fmtCOP(totalGeneral)}
                    bold
                    badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"
                  />
                </div>
              </div>
            </section>

            {/* Soportes descargables, número de recibo y (si aplica) carga de factura */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-800 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
                <span>Soportes de pago y documentos adjuntos</span>
                {isUltimaSolLoading && (
                  <span className="text-xs text-slate-200">Cargando adjuntos…</span>
                )}
                {isUltimaSolError && (
                  <span className="text-xs text-red-200">
                    Error al cargar adjuntos
                  </span>
                )}
              </div>
              <div className="p-5 space-y-4 text-sm text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700">
                      Número de recibo:
                    </span>{" "}
                    <span>{numeroReciboSolicitud ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Recibo de pago:
                    </span>{" "}
                    <span>{resiboPagoSolicitud ?? "—"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 mt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Archivos descargables:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={cedulaUrlFinal ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-xs border ${
                        cedulaUrlFinal
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      Cédula {cedulaUrlFinal ? "" : "(no disponible)"}
                    </a>
                    <a
                      href={manifiestoUrlFinal ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-xs border ${
                        manifiestoUrlFinal
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      Manifiesto {manifiestoUrlFinal ? "" : "(no disponible)"}
                    </a>
                    <a
                      href={facturaUrlFinal ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-xs border ${
                        facturaUrlFinal
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      Factura {facturaUrlFinal ? "" : "(no disponible)"}
                    </a>
                  </div>
                </div>

                {/* Carga de factura: SOLO si aún NO hay factura */}
                {!tieneFactura && (
                  <div className="mt-4 pt-3 bg-success p-3 rounded-2xl border-t border-dashed border-slate-200 space-y-2">
                    <div className="text-xs font-semibold text-slate-600">
                      Cargar factura (obligatoria para poder aceptar, solo se puede adjuntar una vez):
                    </div>
                    {!idSolicitud && (
                      <div className="text-xs text-rose-600">
                        No se encontró una solicitud de facturación asociada a esta cotización.
                        Primero crea la solicitud para poder adjuntar la factura.
                      </div>
                    )}
                    {idSolicitud && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleFacturaChange}
                          className="block w-full text-xs text-slate-600
                            file:mr-3 file:py-1.5 file:px-3
                            file:rounded-md file:border-0
                            file:text-xs file:font-semibold
                            file:bg-slate-100 file:text-slate-700
                            hover:file:bg-slate-200"
                        />
                        <button
                          type="button"
                          onClick={handleSubirFactura}
                          disabled={isSubiendoFactura || !facturaFile}
                          className={`btn btn-sm border bg-white text-success`}
                        >
                          {isSubiendoFactura
                            ? "Subiendo factura…"
                            : "Subir factura"}
                        </button>
                      </div>
                    )}
                    {facturaFile && (
                      <div className="text-xs text-slate-500">
                        Archivo seleccionado:{" "}
                        <span className="font-medium">{facturaFile.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Observaciones crédito: SOLO si NO es contado (incluye crédito normal y de terceros) */}
            {!esContado && (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Observaciones del crédito:
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1.5">
                    <li>
                      Crédito aprobado por{" "}
                      <span className="font-semibold">
                        {financiador}
                      </span>
                    </li>
                    <li>
                      Cuota inicial:{" "}
                      <span className="font-semibold">
                        {fmtCOP(cuota_inicial)}
                      </span>
                    </li>
                    <li>
                      Saldo a financiar:{" "}

                      <span className="font-semibold">
                        {fmtCOP(saldoFinanciar)}
                      </span>
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* 🔹 Contado o Crédito de terceros: si YA hay factura y aún NO es final -> panel de descuentos / contraentrega */}
            {debeMostrarDescuentosPanel && (
              <DescuentosContraentregaPanel idSolicitud={idSolicitud!} />
            )}

            {/* 🔹 DocumentosSolicitud:
                - Contado / Crédito de terceros: cuando is_final = 1
                - Crédito normal: cuando ya hay factura e idSolicitud (sin pasar por descuentos) */}
            {debeMostrarDocumentosSolicitud && (
              <DocumentosSolicitud
                id_factura={Number(id_cotizacion)}
                id={id_cotizacion}
                docs={{
                  manifiesto_url: manifiestoUrlFinal,
                  cedula_url: cedulaUrlFinal,
                  factura_url: facturaUrlFinal,
                }}
                estadoCotizacion={estadoCotizacion}
                onAprobado={() => {
                  if (!tieneFactura) {
                    Swal.fire(
                      "Falta la factura",
                      "Para aprobar/aceptar es obligatorio que exista una factura adjunta.",
                      "warning"
                    );
                    return;
                  }
                  refetch();
                }}
              />
            )}

            {/* Botones: ir al acta, recargar, PDF */}
            <section className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Revisa la información, descarga el soporte en PDF o consulta el acta de entrega.
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/solicitudes/actas/final/${id_cotizacion}`}
                  className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-violet-600"
                >
                  Ver acta de entrega
                </Link>

                <button
                  onClick={() => refetch()}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  Recargar datos
                </button>
                <PDFDownloadLink
                  fileName={`solicitud_factura_${codigoSolicitud}.pdf`}
                  document={
                    <SolicitudFacturaPDF2
                      // ENCABEZADO
                      codigoFactura={codigoSolicitud || ""}
                      codigoCredito={cred?.codigo_credito ?? ""}
                      fecha={fmtDate(fechaCreacion)}
                      agencia={cot?.canal_contacto ?? ""}
                      logoDataUrl="/motomax.png"
                      // DEUDOR
                      cedula={clienteDocumento || ""}
                      nombre={clienteNombre || ""}
                      telefono={clienteTelefono || ""}
                      direccion={
                        cot?.direccion_residencia ??
                        sol?.direccion_residencia ??
                        ""
                      }
                      // DETALLE DE LA VENTA
                      reciboPago={
                        numeroReciboSolicitud ??
                        (cot as any)?.numero_recibo ??
                        ""
                      }
                      motocicleta={marcaLinea || ""}
                      modelo={
                        pick<string>(
                          sol?.modelo,
                          (pickMotoField("modelo") as string | undefined),
                          cot?.modelo_a
                        ) ?? ""
                      }
                      numeroMotor={numeroMotor || ""}
                      numeroChasis={numeroChasis || ""}
                      color={color || ""}
                      // CONDICIONES DEL NEGOCIO
                      cn_valor_moto={cn_total}
                      cn_descuento={0}
                      cn_desc_auto={0}
                      cn_valorMotoDesc={cn_total}
                      cn_valorBruto={cn_bruto}
                      cn_iva={cn_iva}
                      cn_total={cn_total}
                      // DOCUMENTOS
                      soat={soat}
                      matricula={matricula}
                      impuestos={impuestos}
                      // ACCESORIOS / SEGUROS
                      accesorios_bruto={accesorios_bruto}
                      accesorios_iva={acc_iva_accesorios}
                      accesorios_total={accesorios_total}
                      seguros_total={seguros_total}
                      // TOTAL GENERAL
                      totalGeneral={totalGeneral}
                    />
                  }
                >
                  {({ loading }) => (
                    <button className="btn btn-sm bg-sky-600 hover:bg-sky-700 text-white border-sky-600">
                      {loading ? "Generando…" : "Descargar PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default DetallesFacturacion;
