// src/features/creditos/pdf/CotizacionMotoSeleccionadaPDF.tsx
import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";

// 👇 Hooks de tu app
import { useCotizacionFullById } from "../../services/fullServices";
import { useIvaDecimal } from "../../services/ivaServices";

/* ===================== Helpers básicos ===================== */

const ACCENT = "#0f766e";
const BORDER = "#d1d5db";
const GRAY_BG = "#f3f4f6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "column",
    maxWidth: "60%",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    maxWidth: "40%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },

  sectionTitleWrapper: {
    backgroundColor: GRAY_BG,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitleTag: {
    fontSize: 9,
    color: "#6b7280",
  },

  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  col: {
    flex: 1,
    paddingRight: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 1,
  },
  value: {
    fontSize: 9,
    color: "#111827",
  },

  resumenWrapper: {
    borderRadius: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  resumenLine: {
    fontSize: 9,
    color: "#064e3b",
    marginBottom: 3,
  },
  resumenHeader: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 4,
  },

  table: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellHeader: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 9,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 8.5,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLast: {
    borderRightWidth: 0,
  },

  smallMuted: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 10,
    lineHeight: 1.3,
  },
});

const fmtCOP = (v: any) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safe = (v: any, fallback: string = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const fmtDateTime = (raw?: string) => {
  if (!raw) return "";
  const d = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* 🔹 desglosar TOTAL = BRUTO + IVA */
const desglosarConIva = (totalConIva: number, ivaDec: number) => {
  if (!Number.isFinite(totalConIva) || totalConIva <= 0) {
    return { total: 0, bruto: 0, iva: 0 };
  }
  const bruto = Math.round(totalConIva / (1 + ivaDec));
  const iva = Math.max(totalConIva - bruto, 0);
  return { total: totalConIva, bruto, iva };
};

/* ========== Lógica moto ========== */

type MotoCot = {
  modeloLabel: string;
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

const buildMotoFromCotizacion = (cot: any, lado: "A" | "B"): MotoCot | undefined => {
  const suffix = lado === "A" ? "_a" : "_b";

  const marca = cot?.[`marca${suffix}`];
  const linea = cot?.[`linea${suffix}`];
  const modeloApi = cot?.[`modelo${suffix}`];

  const hasCore =
    marca || linea || cot?.[`precio_base${suffix}`] || cot?.[`precio_total${suffix}`];

  if (!hasCore) return undefined;

  const modeloLabel =
    [marca, linea, modeloApi].filter(Boolean).join(" ").trim() || "—";

  const precioBase = Number(cot?.[`precio_base${suffix}`]) || 0;
  const precioDocumentos = Number(cot?.[`precio_documentos${suffix}`]) || 0;
  const descuentos = Number(cot?.[`descuentos${suffix}`]) || 0;

  const accesorios = Number(cot?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(cot?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;

  let seguros = 0;
  const otroSeguro = Number(cot?.[`otro_seguro${suffix}`]) || 0;
  seguros += otroSeguro;

  const segurosRaw = cot?.[`seguros${suffix}`];
  if (typeof segurosRaw === "number") {
    seguros += segurosRaw;
  } else if (typeof segurosRaw === "string" && segurosRaw.trim()) {
    try {
      const arr = JSON.parse(segurosRaw);
      if (Array.isArray(arr)) {
        seguros += arr.reduce((acc, item) => {
          const v = Number(item?.valor ?? 0);
          return acc + (Number.isFinite(v) ? v : 0);
        }, 0);
      }
    } catch {
      // ignorar error JSON
    }
  }

  const soat = Number(cot?.[`soat${suffix}`]) || 0;
  const matricula = Number(cot?.[`matricula${suffix}`]) || 0;
  const impuestos = Number(cot?.[`impuestos${suffix}`]) || 0;

  const isA = lado === "A";
  const adicionalesRunt = Number(cot?.[isA ? "runt_1" : "runt_2"]) || 0;
  const adicionalesLicencia = Number(cot?.[isA ? "licencia_1" : "licencia_2"]) || 0;
  const adicionalesDefensas = Number(cot?.[isA ? "defensas_1" : "defensas_2"]) || 0;
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
    modeloLabel,
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

/* ============================================================
   1) PDF PURO: SOLO USA PROPS (NO HOOKS)
   ============================================================ */

type PDFProps = {
  id: string;
  cot: any;
  cred?: any;
  sol?: any;
  ivaDecimal: number;
  ivaPct: number;
};

export const CotizacionMotoSeleccionadaPDFDoc: React.FC<PDFProps> = ({
  id,
  cot,
  cred,
  sol,
  ivaDecimal,
  ivaPct,
}) => {
  /* ===== Selección de moto A/B ===== */

  const motoSeleccionada: "a" | "b" | undefined = useMemo(() => {
    const descA = [cot?.marca_a, cot?.linea_a].filter(Boolean).join(" ").toLowerCase();
    const descB = [cot?.marca_b, cot?.linea_b].filter(Boolean).join(" ").toLowerCase();

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

  const ladoMoto: "A" | "B" | undefined =
    motoSeleccionada === "a" ? "A" : motoSeleccionada === "b" ? "B" : undefined;

  const moto = ladoMoto ? buildMotoFromCotizacion(cot, ladoMoto) : undefined;

  if (!moto) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>
            No se encontró información de motocicleta asociada a la cotización #{id}.
          </Text>
        </Page>
      </Document>
    );
  }

  /* ===== Datos de cliente y comercial ===== */

  const nombreCompletoCliente = [
    cot?.name,
    cot?.s_name,
    cot?.last_name,
    cot?.s_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const estado = safe(
    cot?.estado ?? sol?.estado ?? sol?.estado_facturacion,
    "Sin estado"
  );

  const tipoPago = safe(
    cot?.tipo_pago ?? cred?.tipo_pago ?? sol?.tipo_solicitud,
    "—"
  );

  const financiera = safe(cot?.financiera ?? cred?.financiera, "No aplica");

  const fechaCreacion = fmtDateTime(
    cot?.fecha_creacion ?? sol?.creado_en ?? cred?.fecha_creacion
  );

  const asesor = safe(cred?.asesor ?? cot?.asesor, "—");

  /* ===== Cálculos ===== */

  const docsTotal =
    (moto.soat || 0) + (moto.matricula || 0) + (moto.impuestos || 0);

  const extrasTotal =
    (moto.accesoriosYMarcacion || 0) + (moto.adicionalesTotal || 0);

  const cuotaInicial =
    num(cred?.cuota_inicial) ||
    num(cot?.cuota_inicial_a) ||
    num(cot?.cuota_inicial_b) ||
    0;

  const saldoFinanciar = Math.max(moto.total - cuotaInicial, 0);

  const etiquetaMoto =
    ladoMoto === "A"
      ? "Moto A (seleccionada)"
      : ladoMoto === "B"
      ? "Moto B (seleccionada)"
      : "Motocicleta seleccionada";

  const ivaMoto = desglosarConIva(moto.total, ivaDecimal);

  /* ===== Render PDF ===== */

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>
              Cotización #{safe(cot?.id, "")} – {etiquetaMoto}
            </Text>
            <Text style={styles.subtitle}>
              Fecha de creación: {fechaCreacion}
            </Text>
            <Text style={styles.subtitle}>
              Cliente: {safe(nombreCompletoCliente)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Estado: {estado}</Text>
            <Text style={styles.subtitle}>Tipo de pago: {tipoPago}</Text>
            <Text style={styles.subtitle}>Financiera: {financiera}</Text>
            <Text style={styles.subtitle}>Asesor: {asesor}</Text>
          </View>
        </View>

        {/* RESUMEN GENERAL */}
        <View style={styles.resumenWrapper}>
          <Text style={styles.resumenHeader}>Resumen de la moto seleccionada</Text>
          <Text style={styles.resumenLine}>
            Modelo: {moto.modeloLabel}
          </Text>
          <Text style={styles.resumenLine}>
            Precio base: {fmtCOP(moto.precioBase)} · Descuentos:{" "}
            {fmtCOP(moto.descuentos)}
          </Text>
          <Text style={styles.resumenLine}>
            Documentos (SOAT + matrícula + impuestos): {fmtCOP(docsTotal)}
          </Text>
          <Text style={styles.resumenLine}>
            Accesorios + adicionales: {fmtCOP(extrasTotal)}
          </Text>
          <Text style={styles.resumenLine}>
            Otros seguros: {fmtCOP(moto.seguros)}
          </Text>
          <Text style={styles.resumenLine}>
            Total sin seguros: {fmtCOP(moto.totalSinSeguros)} · Total con seguros:{" "}
            {fmtCOP(moto.total)}
          </Text>
          <Text style={styles.resumenLine}>
            Bruto estimado sin IVA ({ivaPct}%): {fmtCOP(ivaMoto.bruto)} · IVA:{" "}
            {fmtCOP(ivaMoto.iva)}
          </Text>
          <Text style={styles.resumenLine}>
            Cuota inicial: {fmtCOP(cuotaInicial)} · Saldo a financiar:{" "}
            {fmtCOP(saldoFinanciar)}
          </Text>
        </View>

        {/* 1. CLIENTE */}
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitleText}>1. Información del cliente</Text>
        </View>
        <View style={styles.box}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nombre completo</Text>
              <Text style={styles.value}>{safe(nombreCompletoCliente)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Cédula</Text>
              <Text style={styles.value}>{safe(cot?.cedula)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Celular</Text>
              <Text style={styles.value}>{safe(cot?.celular)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Text style={styles.value}>{safe(cot?.email)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Canal de contacto</Text>
              <Text style={styles.value}>{safe(cot?.canal_contacto)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Necesidad / motivo</Text>
              <Text style={styles.value}>{safe(cot?.pregunta)}</Text>
            </View>
          </View>
        </View>

        {/* 2. COMERCIAL */}
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitleText}>2. Información comercial</Text>
        </View>
        <View style={styles.box}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Tipo de pago</Text>
              <Text style={styles.value}>{tipoPago}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Financiera</Text>
              <Text style={styles.value}>{financiera}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Prospecto</Text>
              <Text style={styles.value}>{safe(cot?.prospecto)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Asesor</Text>
              <Text style={styles.value}>{asesor}</Text>
            </View>
          </View>
        </View>

        {/* 3. DETALLE ECONÓMICO */}
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitleText}>3. Detalle económico de la moto</Text>
          <Text style={styles.sectionTitleTag}>{moto.modeloLabel}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableCellHeader}>Concepto</Text>
            <Text style={styles.tableCellHeader}>Valor</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellLast]}>
              Comentario
            </Text>
          </View>

          {[
            ["Precio base", moto.precioBase, "Precio público de la moto"],
            ["Descuentos", -moto.descuentos, "Descuentos aplicados"],
            ["Documentos – SOAT", moto.soat, ""],
            ["Documentos – Matrícula", moto.matricula, ""],
            ["Documentos – Impuestos", moto.impuestos, ""],
            ["Total documentos", docsTotal, ""],
            [
              "Accesorios / marcación",
              moto.accesoriosYMarcacion,
              "Accesorios, marcación y personalización",
            ],
            ["Adicionales", moto.adicionalesTotal, ""],
            ["Total extras (docs + accesorios + adicionales)", docsTotal + extrasTotal, ""],
            ["Otros seguros", moto.seguros, ""],
            ["Total sin seguros", moto.totalSinSeguros, ""],
            ["Total con seguros", moto.total, ""],
            [
              `Bruto sin IVA (${ivaPct}%)`,
              ivaMoto.bruto,
              "Estimado a partir del total de la moto",
            ],
            [
              `IVA (${ivaPct}%)`,
              ivaMoto.iva,
              "Bruto + IVA = Total con IVA",
            ],
            [
              "Cuota inicial",
              cuotaInicial,
              cuotaInicial > 0 ? "Aporte inicial del cliente" : "No aplica",
            ],
            [
              "Saldo a financiar",
              saldoFinanciar,
              saldoFinanciar > 0
                ? "Total con seguros - cuota inicial"
                : "No hay saldo a financiar",
            ],
          ].map(([label, val, detail], idx) => (
            <View style={styles.tableRow} key={String(label) + idx}>
              <Text style={styles.tableCell}>{label as string}</Text>
              <Text style={styles.tableCell}>{fmtCOP(val)}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}>
                {detail as string}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.smallMuted}>
          Nota: los valores incluyen IVA donde aplique. IVA considerado: {ivaPct}%.
          Este documento corresponde únicamente a la motocicleta seleccionada en la
          cotización (opciones A/B no incluidas).
        </Text>
      </Page>
    </Document>
  );
};

/* ============================================================
   2) COMPONENTE "WEB" QUE CONSUME HOOKS Y EXPONE EL BOTÓN
   ============================================================ */

type DownloadProps = {
  idCotizacion: string;
  fileName?: string;
  classNameButton?: string;
};

export const CotizacionMotoSeleccionadaPDFDownload: React.FC<DownloadProps> = ({
  idCotizacion,
  fileName,
  classNameButton,
}) => {
  // Hooks SÍ se pueden usar aquí (esto va en el árbol normal de React con QueryClientProvider)
  const { data, isLoading, isError } = useCotizacionFullById(idCotizacion);
  const {
    ivaDecimal,
    porcentaje,
    isLoading: ivaLoading,
    error: ivaError,
  } = useIvaDecimal();

  const cot = data?.data?.cotizacion ?? null;
  const cred = data?.data?.creditos ?? null;
  const sol = data?.data?.solicitar_estado_facturacion ?? null;

  const IVA_DEC = ivaLoading || ivaError ? 0.19 : ivaDecimal ?? 0.19;
  const IVA_PCT = ivaLoading || ivaError ? 19 : Number(porcentaje ?? 19);

  if (isLoading || ivaLoading) {
    return (
      <button
        type="button"
        className={classNameButton ?? "btn btn-info btn-outline btn-sm"}
        disabled
      >
        Cargando datos…
      </button>
    );
  }

  if (isError || !cot) {
    return (
      <button
        type="button"
        className={classNameButton ?? "btn btn-error btn-outline btn-sm"}
        disabled
      >
        Error al cargar cotización
      </button>
    );
  }

  return (
    <PDFDownloadLink
      fileName={fileName ?? `cotizacion_moto_seleccionada_${idCotizacion}.pdf`}
      document={
        <CotizacionMotoSeleccionadaPDFDoc
          id={idCotizacion}
          cot={cot}
          cred={cred}
          sol={sol}
          ivaDecimal={IVA_DEC}
          ivaPct={IVA_PCT}
        />
      }
    >
      {({ loading }) => (
        <button
          type="button"
          className={classNameButton ?? "btn btn-info btn-outline btn-sm"}
        >
          {loading ? "Generando PDF…" : "Cotización PDF (moto seleccionada)"}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default CotizacionMotoSeleccionadaPDFDoc;
