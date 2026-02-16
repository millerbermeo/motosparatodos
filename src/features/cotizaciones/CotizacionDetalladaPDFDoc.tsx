// src/pages/CotizacionDetalladaPDFDoc.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const formatSeguros = (raw: any): string => {
  if (!raw) return "—";
  if (typeof raw === "string" && !raw.includes("[")) return raw.trim();

  try {
    let data: any = raw;

    if (typeof raw === "string") {
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        const jsonPart = raw.slice(start, end + 1);
        data = JSON.parse(jsonPart);
      } else {
        data = JSON.parse(raw);
      }
    }

    if (!Array.isArray(data)) return String(raw);

    const nombres = data
      .filter(
        (item) =>
          item &&
          (item.valor === 1 || item.valor === true || item.seleccionado === true)
      )
      .map((item) => item?.nombre)
      .filter(Boolean);

    if (!nombres.length) return "—";
    return nombres.join(" - ");
  } catch {
    if (typeof raw === "string") return raw.split("[")[0].trim();
    return String(raw);
  }
};

const normalizeLower = (v: any) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const isGpsActive = (gpsMeses: any) => {
  const v = normalizeLower(gpsMeses);
  if (!v || v === "no" || v === "0" || v === "null" || v === "undefined") return false;
  return true; // "si", "sí", "12", 12, etc.
};

/* ============================
   Tipos
============================ */

export type CotizacionApi = {
  success: boolean;
  data: any;
};

export type GarantiaExtApi = {
  success: boolean;
  data: any;
};

type EmpresaInfo = {
  nombre?: string;
  ciudad?: string;
  almacen?: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
};

type Props = {
  cotizacion: CotizacionApi;
  garantiaExt?: GarantiaExtApi;
  logoUrl?: string;
  empresa?: EmpresaInfo;
  motoFotoAUrl?: string;
  motoFotoBUrl?: string;
};

/* ============================
   Helpers
============================ */

const ACCENT = "#0f766e";
const ACCENT_LIGHT = "#ecfdf5";
const BORDER = "#d1d5db";
const GRAY_BG = "#f3f4f6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    fontSize: 8.0,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.08,
  },

  // Página B un poquito más grande (ya no va el bloque general)
  pageB: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 14,
    fontSize: 8.6,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.1,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 5,
  },
  headerLeft: { flexDirection: "column", maxWidth: "65%" },
  headerRight: { flexDirection: "column", alignItems: "flex-end", maxWidth: "35%" },
  logo: { width: 74, height: 32, marginBottom: 3, objectFit: "contain" },
  title: { fontSize: 12.0, fontWeight: "bold", color: ACCENT, marginBottom: 5 },
  subtitle: { fontSize: 7.5, marginBottom: 1, color: "#4b5563" },

  /* RESUMEN */
  resumenWrapper: {
    flexDirection: "row",
    borderRadius: 7,
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  resumenCol: { flex: 1, paddingRight: 5 },
  resumenHeader: { fontSize: 8.5, fontWeight: "bold", color: ACCENT, marginBottom: 2 },
  resumenLine: { fontSize: 7.6, color: "#064e3b", marginBottom: 1 },

  /* SECTION TITLE */
  sectionTitleWrapper: {
    backgroundColor: GRAY_BG,
    borderRadius: 5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    marginTop: 4,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: { fontSize: 9.0, fontWeight: "bold", color: "#111827" },
  sectionTitleTag: { fontSize: 7.4, color: "#6b7280" },

  /* BOX */
  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
  },
  row: { flexDirection: "row", marginBottom: 3 },
  col: { flex: 1, paddingRight: 5 },
  label: { fontWeight: "bold", color: "#374151", marginBottom: 1, fontSize: 7.6 },
  value: { fontSize: 7.6, color: "#111827" },

  /* Mini resumen */
  miniRow: { flexDirection: "row", gap: 5, marginBottom: 5 },
  miniBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 7,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  miniLabel: { fontSize: 7.0, color: "#064e3b" },
  miniValue: { fontSize: 9.0, fontWeight: "bold", color: ACCENT, marginTop: 1 },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    overflow: "hidden",
  },
  tableHeaderRow: { flexDirection: "row", backgroundColor: ACCENT_LIGHT },
  tableRow: { flexDirection: "row" },
  tableCellHeader: {
    flex: 1,
    paddingVertical: 2.6,
    paddingHorizontal: 3.5,
    fontSize: 7.2,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 2.6,
    paddingHorizontal: 3.5,
    fontSize: 7.2,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLast: { borderRightWidth: 0 },

  /* MOTO CARD */
  motoCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 5,
    marginBottom: 5,
  },
  motoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    gap: 6,
  },
  motoTitle: { fontSize: 8.6, fontWeight: "bold", color: "#111827", flexGrow: 1 },
  motoChip: { fontSize: 7.2, color: "#374151" },

  // Layout horizontal
  motoBodyRow: { flexDirection: "row", gap: 5 },

  // Imagen izquierda
  motoLeftCol: {
    width: 120,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    backgroundColor: "#f9fafb",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  motoImage: { width: 110, height: 62, objectFit: "contain" },

  // Imagen en página B un poco más grande
  motoLeftColB: {
    width: 150,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,
    backgroundColor: "#f9fafb",
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  motoImageB: { width: 140, height: 82, objectFit: "contain" },

  motoImageLabel: { fontSize: 6.8, color: "#6b7280", marginTop: 2, textAlign: "center" },
  motoNoImg: { fontSize: 7.0, color: "#6b7280", textAlign: "center" },

  motoRightCol: { flex: 1, gap: 5 },
  motoTablesRow: { flexDirection: "row", gap: 5 },
  half: { flex: 1 },

  /* Cuotas 3 col */
  table3Header: { flexDirection: "row", backgroundColor: ACCENT_LIGHT },
  table3Row: { flexDirection: "row" },
  t3h: {
    width: "33.33%",
    paddingVertical: 2.6,
    paddingHorizontal: 3.5,
    fontSize: 7.0,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  t3c: {
    width: "33.33%",
    paddingVertical: 2.6,
    paddingHorizontal: 3.5,
    fontSize: 7.0,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  t3Last: { borderRightWidth: 0 },

  /* HABEAS / FIRMAS */
  habeasTitle: {
    fontSize: 7.8,
    fontWeight: "bold",
    marginBottom: 2,
    marginTop: 1,
    color: "#111827",
  },
  habeasText: {
    fontSize: 6.5,
    color: "#374151",
    lineHeight: 1.06,
    marginBottom: 2,
  },

  firmaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 35 },
  firmaBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 3 },
  firmaLabel: { fontSize: 7.4, color: "#111827" },

  /* FOOTER */
  footer: {
    fontSize: 6.6,
    color: "#6b7280",
    marginTop: 3,
    lineHeight: 1.1,
    textAlign: "center",
  },
  footerCenter: { fontSize: 6.6, color: "#374151", marginTop: 2, textAlign: "center" },

  observacionesBox: {
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: 4,
    minHeight: 75, // ≈ 2 cm
  },
  observacionesLabel: {
    fontSize: 7.2,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  observacionesText: {
    fontSize: 7.0,
    color: "#111827",
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

const fmtDateShort = (raw?: string) => {
  if (!raw) return "";
  const d = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(raw);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const safe = (v: any, fallback: string = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const BaseUrl =
  (import.meta as any)?.env?.VITE_API_URL ?? "https://tuclick.vozipcolombia.net.co/motos/back";

const buildAbsUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const root = String(BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

// Solo imagen real (sin fallback) para ahorrar alto en A; B puede verse sin imagen si no hay
const resolveMotoImg = (d: any, side: "A" | "B", override?: string): string | null => {
  if (override) return override;

  const key = side === "A" ? "foto_a" : "foto_b";
  const sideSpecific = d?.[key];
  const candidates = [sideSpecific, d?.product_img, d?.imagen, d?.foto].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }
  return null;
};

const SectionTitle: React.FC<{ title: string; tag?: string }> = ({ title, tag }) => (
  <View style={styles.sectionTitleWrapper}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {tag ? <Text style={styles.sectionTitleTag}>{tag}</Text> : null}
  </View>
);

const MiniBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.miniBox} wrap={false}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={styles.miniValue}>{value}</Text>
  </View>
);

const pickComentario = (d: any) => safe(d.comentario2 ?? d.comentario ?? "", "—");

/* ============================
   Componente principal PDF
============================ */

export const CotizacionDetalladaPDFDoc: React.FC<Props> = ({
  cotizacion,
  garantiaExt,
  logoUrl,
  empresa,
  motoFotoAUrl,
  motoFotoBUrl,
}) => {
  const d = cotizacion?.data || {};
  const g = garantiaExt?.data || {};

  const nombreCompletoCliente = [d.name, d.s_name, d.last_name, d.s_last_name]
    .filter(Boolean)
    .join(" ");

  const motoALabel = [d.marca_a, d.linea_a].filter(Boolean).join(" ");
  const motoBLabel = [d.marca_b, d.linea_b].filter(Boolean).join(" ");
  const hayMotoB = !!d.marca_b || !!d.linea_b || !!d.precio_base_b || !!d.precio_total_b;

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";
  const tipoPago = safe(d.tipo_pago || d.metodo_pago);

  // ===== reglas UI -> PDF =====
  const tipoPagoNorm = normalizeLower(d.tipo_pago || d.metodo_pago);
  const isContado = tipoPagoNorm.includes("contado");
  const isCreditoPropio = tipoPagoNorm.includes("directo") || tipoPagoNorm.includes("credibike");
  const isCreditoTerceros = tipoPagoNorm.includes("terceros");

  // Igual que UI:
  const showGarantiaExtendida = isCreditoPropio;
  const polizaLabel = (isContado || isCreditoTerceros) ? "Garantía extendida" : "Póliza";

  const motoImgA = resolveMotoImg(d, "A", motoFotoAUrl);
  const motoImgB = hayMotoB ? resolveMotoImg(d, "B", motoFotoBUrl) : null;

  const getGE = (side: "A" | "B") => {
    if (side === "A") {
      const meses = num(g?.meses_a) || num(d?.garantia_extendida_a);
      const valor = num(g?.valor_a) || num(d?.valor_garantia_extendida_a);
      const plan = safe(g?.garantia_extendida_a ?? d?.garantia_extendida_a, "—");
      return { meses, valor, plan };
    }
    const meses = num(g?.meses_b) || num(d?.garantia_extendida_b);
    const valor = num(g?.valor_b) || num(d?.valor_garantia_extendida_b);
    const plan = safe(g?.garantia_extendida_b ?? d?.garantia_extendida_b, "—");
    return { meses, valor, plan };
  };

  const getMotoValues = (side: "A" | "B") => {
    const s = side === "A" ? "_a" : "_b";
    const isA = side === "A";

    const precioBase = num(d[`precio_base${s}`]);
    const descuentos = Math.abs(num(d[`descuentos${s}`])); // siempre positivo, se resta

    const accesorios = num(d[`accesorios${s}`]);
    const marcacion = num(d[`marcacion${s}`]);
    const accesoriosMarcacion = accesorios + marcacion;

    const otrosSeguros = num(d[`otro_seguro${s}`]);

    const soat = num(d[`soat${s}`]);
    const matricula = num(d[`matricula${s}`]);
    const impuestos = num(d[`impuestos${s}`]);
    const docsReal = soat + matricula + impuestos;

    const runt = num(d[isA ? "runt_1" : "runt_2"]);
    const licencia = num(d[isA ? "licencia_1" : "licencia_2"]);
    const defensas = num(d[isA ? "defensas_1" : "defensas_2"]);
    const hand = num(d[isA ? "hand_savers_1" : "hand_savers_2"]);
    const otrosAd = num(d[isA ? "otros_adicionales_1" : "otros_adicionales_2"]);
    const adicionalesTotal =
      num(d[isA ? "total_adicionales_1" : "total_adicionales_2"]) ||
      (runt + licencia + defensas + hand + otrosAd);

    // ===== GPS (no sumar si viene "no") =====
    const gpsMeses = d[`gps_meses${s}`];
    const gpsValorRaw = num(d[`valor_gps${s}`]);
    const gpsValor = isGpsActive(gpsMeses) ? gpsValorRaw : 0;

    // ===== PÓLIZA =====
    const polizaCodigo = d[`poliza${s}`] ?? null; // poliza_a / poliza_b
    const polizaValor = num(d[`valor_poliza${s}`]); // valor_poliza_a / valor_poliza_b

    // ===== Garantía extendida (solo crédito propio) =====
    const geSide = getGE(side);
    const geMeses = num(geSide.meses);
    const geValor = (showGarantiaExtendida && geMeses > 0) ? num(geSide.valor) : 0;

    // ===== Totales =====
    const totalSinSegurosApi = num(d[`total_sin_seguros${s}`]);
    const totalApi = num(d[`precio_total${s}`]);

    // Igual que UI: base - descuentos + accesorios + docs + adicionales + poliza + ge + gps + otrosSeguros
    const totalSinSegurosCalc =
      precioBase +
      docsReal +
      accesoriosMarcacion +
      adicionalesTotal +
      polizaValor +
      geValor +
      gpsValor -
      descuentos;

    const totalCalc = totalSinSegurosCalc + otrosSeguros;

    // Usa API solo si cuadra
    const totalSinSeguros =
      totalSinSegurosApi > 0 && Math.abs(totalSinSegurosApi - totalSinSegurosCalc) < 2
        ? totalSinSegurosApi
        : totalSinSegurosCalc;

    const total =
      totalApi > 0 && Math.abs(totalApi - totalCalc) < 2
        ? totalApi
        : totalCalc;

    const cuotaInicial = num(d[`cuota_inicial${s}`]);
    const saldo = Math.max(total - cuotaInicial, 0);

    const cuotas = {
      c6: num(d[`cuota_6${s}`]),
      c12: num(d[`cuota_12${s}`]),
      c18: num(d[`cuota_18${s}`]),
      c24: num(d[`cuota_24${s}`]),
      c30: num(d[`cuota_30${s}`]),
      c36: num(d[`cuota_36${s}`]),
    };

    return {
      precioBase,
      descuentos,
      accesorios,
      marcacion,
      accesoriosMarcacion,
      otrosSeguros,

      soat,
      matricula,
      impuestos,
      docsReal,

      runt,
      licencia,
      defensas,
      hand,
      otrosAd,
      adicionalesTotal,

      gpsMeses,
      gpsValor,

      geMeses,
      geValor,

      totalSinSeguros,
      total,
      cuotaInicial,
      saldo,
      cuotas,

      polizaCodigo,
      polizaValor,
    };
  };

  const renderMotoBlock = (side: "A" | "B", opts?: { bigger?: boolean }) => {
    const bigger = !!opts?.bigger;

    const label = side === "A" ? motoALabel : motoBLabel;
    const img = side === "A" ? motoImgA : motoImgB;

    const segurosDetalle = formatSeguros(side === "A" ? d.seguros_a : d.seguros_b);

    const v = getMotoValues(side);

    const cuotasList = [
      ["6", v.cuotas.c6],
      ["12", v.cuotas.c12],
      ["18", v.cuotas.c18],
      ["24", v.cuotas.c24],
      ["30", v.cuotas.c30],
      ["36", v.cuotas.c36],
    ].filter(([, val]) => Number(val) > 0);

    type RowItem =
      | { k: string; v: any; type: "money" }
      | { k: string; v: any; type: "moneyOrDash" }
      | { k: string; v: any; type: "text" };

    const leftRows: RowItem[] = [
      { k: "Precio base", v: v.precioBase, type: "money" },
      { k: "Docs (total)", v: v.docsReal, type: "money" },
      { k: "Marcación", v: v.marcacion, type: "money" },

      // GPS (si viene "no", mostramos 0 y NO suma en total)
      {
        k: isGpsActive(v.gpsMeses)
          ? (Number(v.gpsMeses) > 0 ? `GPS (${Number(v.gpsMeses)} meses)` : "GPS")
          : "GPS",
        v: v.gpsValor,
        type: "money",
      },
    ];

    // Garantía extendida: SOLO crédito propio
    if (showGarantiaExtendida) {
      leftRows.push({
        k: v.geMeses > 0 ? `Garantía extendida (${v.geMeses} meses)` : "Garantía extendida",
        v: v.geMeses > 0 ? v.geValor : null,
        type: "moneyOrDash",
      });
    }

    // Póliza: se renombra a "Garantía extendida" en contado/terceros (solo texto/cálculo)
    if (num(v.polizaValor) > 0 || (v.polizaCodigo && String(v.polizaCodigo) !== "0")) {
      leftRows.push({ k: polizaLabel, v: safe(v.polizaCodigo, "—"), type: "text" });
      leftRows.push({ k: `Valor ${polizaLabel.toLowerCase()}`, v: v.polizaValor, type: "money" });
    }

    leftRows.push({ k: "Cuota inicial", v: v.cuotaInicial, type: "money" });

    const rightRows = [
      { k: "Seguro todo riesgo adicional", v: v.otrosSeguros },
      { k: "Cascos y accesorios", v: v.accesorios },
      // Descuento negativo (solo visual)
      { k: "Descuento / plan de marca", v: -Math.abs(v.descuentos) },
      { k: "Inscripción RUNT", v: v.runt },
      { k: "Licencias", v: v.licencia },
      { k: "Defensas", v: v.defensas },
      { k: "Hand savers", v: v.hand },
      { k: "Otros adicionales", v: v.otrosAd },
      { k: "TOTAL", v: v.total },
    ];

    return (
      <>
        <SectionTitle title={`Moto ${side}`} tag={safe(label)} />

        <View style={styles.miniRow} wrap={false}>
          <MiniBox label="TOTAL" value={fmtCOP(v.total)} />
          <MiniBox label="Cuota inicial" value={fmtCOP(v.cuotaInicial)} />
          <MiniBox label="Saldo a financiar" value={fmtCOP(v.saldo)} />
        </View>

        <View style={styles.motoCard} wrap={false}>
          <View style={styles.motoHeader} wrap={false}>
            <Text style={styles.motoTitle}>{safe(label)}</Text>
          </View>

          <View style={styles.motoBodyRow} wrap={false}>
            <View style={bigger ? styles.motoLeftColB : styles.motoLeftCol} wrap={false}>
              {img ? (
                <>
                  <Image src={img} style={bigger ? styles.motoImageB : styles.motoImage} />
                  <Text style={styles.motoImageLabel}>Imagen referencia</Text>
                </>
              ) : (
                <Text style={styles.motoNoImg}>Sin imagen</Text>
              )}
            </View>

            <View style={styles.motoRightCol} wrap={false}>
              <View style={styles.motoTablesRow} wrap={false}>
                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Concepto</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {leftRows.map((item, idx) => (
                    <View style={styles.tableRow} key={`L-${side}-${item.k}-${idx}`}>
                      <Text style={styles.tableCell}>{item.k}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>
                        {item.type === "money"
                          ? fmtCOP(item.v)
                          : item.type === "moneyOrDash"
                          ? item.v ? fmtCOP(item.v) : "—"
                          : safe(item.v)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Resumen</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {rightRows.map((item, idx) => (
                    <View style={styles.tableRow} key={`R-${side}-${item.k}-${idx}`}>
                      <Text style={styles.tableCell}>{item.k}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(item.v)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {cuotasList.length ? (
                <View wrap={false}>
                  <Text style={styles.label}>Cuotas</Text>
                  <View style={styles.table} wrap={false}>
                    <View style={styles.table3Header}>
                      <Text style={styles.t3h}>Plazo</Text>
                      <Text style={styles.t3h}>Valor</Text>
                      <Text style={[styles.t3h, styles.t3Last]}>Tipo</Text>
                    </View>

                    {cuotasList.map(([p, val]) => (
                      <View style={styles.table3Row} key={`C-${side}-${p}`}>
                        <Text style={styles.t3c}>{p} meses</Text>
                        <Text style={styles.t3c}>{fmtCOP(val)}</Text>
                        <Text style={[styles.t3c, styles.t3Last]}>{tipoPago}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {segurosDetalle && segurosDetalle !== "—" ? (
                <Text
                  style={{
                    fontSize: bigger ? 7.6 : 7.0,
                    color: "#374151",
                    marginTop: 3,
                    lineHeight: 1.05,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>Detalle seguros: </Text>
                  {segurosDetalle}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderHabeasFirmasFooter = () => (
    <>
      {/* Observaciones */}
      <View style={styles.observacionesBox} wrap={false}>
        <Text style={styles.observacionesLabel}>Observaciones</Text>
        {/* Si quieres imprimir comentario, descomenta:
        <Text style={styles.observacionesText}>{pickComentario(d)}</Text>
        */}
      </View>

      <SectionTitle title="Autorización de habeas data y firmas" />
      <View style={styles.box} wrap={false}>
        <Text style={styles.habeasTitle}>
          Autorización de tratamiento de datos personales (Habeas Data)
        </Text>

        <Text style={styles.habeasText}>
          Con la firma del presente documento, el cliente autoriza de manera libre, previa, expresa e
          informada a Moto Para Todos S.A.S. para recolectar, almacenar, usar y tratar sus datos
          personales suministrados por medios físicos o digitales, con el fin de gestionar la
          cotización, venta, financiación, contacto comercial y envío de información relacionada con
          sus productos y servicios. Los datos tratados incluyen, entre otros, información de
          identificación y contacto. El titular declara conocer que, de conformidad con la Ley 1581
          de 2012, puede conocer, actualizar, rectificar y solicitar la supresión de sus datos, así
          como revocar esta autorización cuando no se respeten las disposiciones legales.
        </Text>

        <View style={styles.firmaRow} wrap={false}>
          <View style={styles.firmaBox}>
            <Text style={styles.firmaLabel}>Firma del cliente</Text>
          </View>
          <View style={styles.firmaBox}>
            <Text style={styles.firmaLabel}>Firma del asesor</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Precios y promociones sujetos a cambios sin previo aviso o hasta agotar existencias. La
        información será tratada según Ley 1581 de 2012.
      </Text>
      <Text style={styles.footerCenter}>MOTO PARA TODOS S.A.S - Hacemos tu sueño realidad</Text>
    </>
  );

  const renderPageA = () => (
    // ✅ CARTA (LETTER)
    <Page size="LETTER" style={styles.page} wrap={false}>
      {/* HEADER */}
      <View style={styles.header} wrap={false}>
        <View style={styles.headerLeft}>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <Text style={styles.title}>Cotización #{safe(d.id, "")} · Moto A</Text>
          <Text style={styles.subtitle}>Fecha: {fmtDateTime(d.fecha_creacion)}</Text>
          <Text style={styles.subtitle}>Actualización: {fmtDateTime(d.fecha_actualizacion)}</Text>
        </View>

        <View style={styles.headerRight}>
          {empresa?.nombre ? <Text style={styles.subtitle}>{empresa.nombre}</Text> : null}
          <Text style={styles.subtitle}>
            {almacen} · {ciudad}
          </Text>
          {empresa?.nit ? <Text style={styles.subtitle}>NIT: {empresa.nit}</Text> : null}
          {empresa?.telefono ? <Text style={styles.subtitle}>Tel: {empresa.telefono}</Text> : null}
          {empresa?.direccion ? <Text style={styles.subtitle}>{empresa.direccion}</Text> : null}
        </View>
      </View>

      {/* RESUMEN */}
      <View style={styles.resumenWrapper} wrap={false}>
        <View style={styles.resumenCol}>
          <Text style={styles.resumenHeader}>Cliente</Text>
          <Text style={styles.resumenLine}>{safe(nombreCompletoCliente)}</Text>
          <Text style={styles.resumenLine}>CC: {safe(d.cedula)}</Text>
          <Text style={styles.resumenLine}>Cel: {safe(d.celular)}</Text>
          <Text style={styles.resumenLine}>Email: {safe(d.email)}</Text>
        </View>

        <View style={styles.resumenCol}>
          <Text style={styles.resumenHeader}>Comercial</Text>
          <Text style={styles.resumenLine}>Asesor: {safe(d.asesor)}</Text>
          <Text style={styles.resumenLine}>Tipo pago: {safe(d.tipo_pago || d.metodo_pago)}</Text>
          <Text style={styles.resumenLine}>Prospecto: {safe(d.prospecto)}</Text>
          <Text style={styles.resumenLine}>Fecha: {fechaCorta}</Text>
        </View>
      </View>

      {/* INFO CLAVE */}
      <SectionTitle title="Información clave" />
      <View style={styles.box} wrap={false}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Canal de contacto</Text>
            <Text style={styles.value}>{safe(d.canal_contacto)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Financiera</Text>
            <Text style={styles.value}>{safe(d.financiera)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Necesidad / Motivo</Text>
            <Text style={styles.value}>{safe(d.pregunta)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Observación</Text>
            <Text style={styles.value}>{pickComentario(d)}</Text>
          </View>
        </View>
      </View>

      {/* BLOQUE MOTO A */}
      {renderMotoBlock("A")}

      {/* ✅ Si NO hay Moto B, aquí va lo último (firmas) */}
      {!hayMotoB ? renderHabeasFirmasFooter() : null}
    </Page>
  );

  const renderPageB = () => (
    // ✅ CARTA (LETTER)
    <Page size="LETTER" style={styles.pageB} wrap={false}>
      {/* Header mínimo en B (sin repetir cliente/comercial/etc.) */}
      <View style={styles.header} wrap={false}>
        <View style={styles.headerLeft}>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <Text style={styles.title}>Cotización #{safe(d.id, "")} · Moto B</Text>
          <Text style={styles.subtitle}>Fecha: {fmtDateTime(d.fecha_creacion)}</Text>
        </View>

        <View style={styles.headerRight}>
          {empresa?.nombre ? <Text style={styles.subtitle}>{empresa.nombre}</Text> : null}
        </View>
      </View>

      {/* SOLO bloque Moto B */}
      {renderMotoBlock("B", { bigger: true })}

      {/* ✅ SIEMPRE al final del documento cuando hay 2 motos */}
      {renderHabeasFirmasFooter()}
    </Page>
  );

  return (
    <Document>
      {renderPageA()}
      {hayMotoB ? renderPageB() : null}
    </Document>
  );
};
