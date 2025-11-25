// src/pages/DetallesFacturacion.tsx
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCotizacionFullById } from "../services/fullServices";
import DocumentosSolicitud from "../features/solicitudes/DocumentosSolicitud";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SolicitudFacturaPDF from "../features/creditos/pdf/SolicitudFacturaPDF";
import { useIvaDecimal } from "../services/ivaServices";

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

const DetallesFacturacion: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const id_cotizacion = (idParam ?? "").trim();

  const { data, isLoading, isError, error, refetch } =
    useCotizacionFullById(id_cotizacion);

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

  // Estado de la cotización (para ocultar botón Aceptar cuando esté Facturado)
  const estadoCotizacion: string | undefined =
    cot?.estado ||
    (sol as any)?.estado ||
    (sol as any)?.estado_facturacion ||
    undefined;

  // Cliente
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

  // Metadatos
  const codigoSolicitud = id_cotizacion;
  const fechaCreacion =
    pick<string>(
      sol?.creado_en,
      cot?.fecha_creacion,
      cred?.fecha_creacion
    ) ?? "—";
  const asesor = pick<string>(cred?.asesor, cot?.asesor) ?? "—";

  // Moto
  const marcaLinea =
    pick<string>(
      [sol?.motocicleta, sol?.modelo].filter(Boolean).join(" "),
      [cot?.marca_a, cot?.linea_a].filter(Boolean).join(" ")
    ) ?? "—";

  const numeroMotor = pick<string>(sol?.numero_motor, cred?.numero_motor) ?? "—";
  const numeroChasis =
    pick<string>(sol?.numero_chasis, cred?.numero_chasis) ?? "—";
  const color = pick<string>(sol?.color, cred?.color) ?? "—";
  const placa = pick<string>(sol?.placa, cred?.placa) ?? "—";

  // Condiciones negocio
  const cn_total = toNum(pick(sol?.cn_total, cot?.precio_total_a, cred?.total));

  const cn_bruto = toNum(
    pick(
      sol?.cn_valor_bruto,
      typeof cn_total === "number"
        ? Math.round(cn_total / (1 + IVA_DEC))
        : undefined
    )
  );

  const cn_iva = useMemo(() => {
    const ivaExplicito = toNum(sol?.cn_iva);
    if (typeof ivaExplicito === "number") return ivaExplicito;
    if (typeof cn_total === "number" && typeof cn_bruto === "number")
      return Math.max(cn_total - cn_bruto, 0);
    return undefined;
  }, [sol?.cn_iva, cn_total, cn_bruto]);

  // Documentos / costos
  const soat = toNum(pick(sol?.tot_soat, cot?.soat_b, cot?.soat_a, cred?.soat));
  const matricula = toNum(
    pick(
      sol?.tot_matricula,
      cot?.matricula_b,
      cot?.matricula_a,
      cot?.precio_documentos_a,
      cot?.precio_documentos_b,
      cred?.matricula
    )
  );
  const impuestos = toNum(
    pick(sol?.tot_impuestos, cot?.impuestos_b, cot?.impuestos_a, cred?.impuestos)
  );
  const subtotalDocs = sum(soat, matricula, impuestos);

  // Seguros y accesorios
  const accesorios_bruto = toNum(
    pick(sol?.tot_accesorios, cred?.accesorios_total)
  );
  const seguros_total = toNum(
    pick(sol?.tot_seguros, cred?.precio_seguros)
  );

  const acc_iva_accesorios =
    typeof accesorios_bruto === "number"
      ? Math.round(accesorios_bruto * IVA_DEC)
      : undefined;

  const acc_total_accesorios =
    typeof accesorios_bruto === "number" &&
    typeof acc_iva_accesorios === "number"
      ? accesorios_bruto + acc_iva_accesorios
      : accesorios_bruto;

  const acc_seg_total = sum(acc_total_accesorios, seguros_total);

  // Total general
  const totalGeneral =
    toNum(pick(sol?.tot_general)) ??
    sum(cn_total, subtotalDocs, acc_seg_total) ??
    sum(
      cn_total,
      soat,
      matricula,
      impuestos,
      acc_total_accesorios,
      seguros_total
    );

  // Crédito
  const financiador = pick<string>(cred?.producto) ?? "—";
  const cuota_inicial = toNum(cred?.cuota_inicial) ?? 0;
  const saldoFinanciar =
    max0((totalGeneral ?? 0) - cuota_inicial) ?? 0;

  // URLs de documentos
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
                <RowRight label="Valor bruto:" value={fmtCOP(cn_bruto)} />
                <RowRight
                  label={`IVA (${IVA_PCT}%):`}
                  value={fmtCOP(cn_iva)}
                />
                <RowRight
                  label="Total vehículo:"
                  value={fmtCOP(cn_total)}
                  bold
                  badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
                />
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
                    value={fmtCOP(acc_total_accesorios)}
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
                    badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
                  />
                </div>
              </div>
            </section>

            {/* Observaciones crédito */}
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

            {/* Documentos + botón Aceptar condicionado por estado */}
            <DocumentosSolicitud
              id_factura={Number(id_cotizacion)}
              id={id_cotizacion}
              docs={{
                manifiesto_url: manifiesto_url,
                cedula_url: cedula_url,
                factura_url: factura_url,
              }}
              estadoCotizacion={estadoCotizacion}
              onAprobado={() => {
                refetch();
              }}
            />

            {/* Botones: ir al acta, recargar, PDF */}
            <section className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Revisa la información, descarga el soporte en PDF o consulta el acta de entrega.
              </div>
              <div className="flex items-center gap-2">
                {/* 👇 Botón que abre la nueva página ActaFinal pasando el id en la URL */}
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
                    <SolicitudFacturaPDF
                      codigoFactura={"codigoFactura"}
                      codigoCredito={cred?.codigo_credito ?? "NR"}
                      fecha={fmtDate(fechaCreacion)}
                      agencia={"agencia"}
                      cedula={clienteDocumento}
                      nombre={clienteNombre}
                      telefono={clienteTelefono}
                      direccion={cot?.direccion_residencia ?? null}
                      ciudad={cot?.ciudad_residencia ?? null}
                      estadoCivil={cot?.estado_civil ?? null}
                      empresa={cot?.empresa ?? null}
                      ocupacion={cot?.ocupacion ?? null}
                      personasACargo={cot?.personas_a_cargo ?? null}
                      valorArriendo={cot?.valor_arriendo ?? null}
                      fincaRaiz={cot?.finca_raiz ?? null}
                      inmueble={cot?.inmueble ?? null}
                      tipoVivienda={cot?.vivienda ?? null}
                      reciboPago={cot?.numero_recibo ?? null}
                      motocicleta={marcaLinea}
                      modelo={
                        pick<string>(sol?.modelo, cot?.modelo_a) ?? "NR"
                      }
                      numeroMotor={numeroMotor}
                      numeroChasis={numeroChasis}
                      color={color}
                      cn_valor_moto={cn_total}
                      cn_valorBruto={cn_bruto}
                      cn_iva={cn_iva}
                      cn_total={cn_total}
                      soat={soat}
                      matricula={matricula}
                      impuestos={impuestos}
                      accesorios_bruto={accesorios_bruto}
                      accesorios_iva={acc_iva_accesorios}
                      accesorios_total={acc_total_accesorios}
                      seguros_total={seguros_total}
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
