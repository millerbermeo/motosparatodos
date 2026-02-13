// src/pages/CotizacionDetalladaPDFDocV2.tsx
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

export type EmpresaInfo = {
  nombre?: string;
  ciudad?: string;
  almacen?: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
};

type PropsV2 = {
  cotizacion: CotizacionApi;
  garantiaExt?: GarantiaExtApi;
  logoUrl?: string;
  empresa?: EmpresaInfo;
  motoFotoUrl?: string;
};

/* ============================
   Helpers
============================ */

const ACCENT = "#0f766e";
const ACCENT_LIGHT = "#ecfdf5";
const BORDER = "#d1d5db";
const GRAY_BG = "#f3f4f6";

const styles = StyleSheet.create({
  // ✅ Más grande para ocupar la carta
  page: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    fontSize: 9.0,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.12,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 7,
  },
  headerLeft: { flexDirection: "column", maxWidth: "65%" },
  headerRight: { flexDirection: "column", alignItems: "flex-end", maxWidth: "35%" },
  logo: { width: 88, height: 38, marginBottom: 3, objectFit: "contain" },
  title: { fontSize: 14.0, fontWeight: "bold", color: ACCENT, marginBottom: 5 },
  subtitle: { fontSize: 8.4, marginBottom: 1, color: "#4b5563" },

  /* RESUMEN */
  resumenWrapper: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 7,
    paddingHorizontal: 7,
    marginBottom: 7,
  },
  resumenCol: { flex: 1, paddingRight: 7 },
  resumenHeader: { fontSize: 9.6, fontWeight: "bold", color: ACCENT, marginBottom: 3 },
  resumenLine: { fontSize: 8.4, color: "#064e3b", marginBottom: 1 },

  /* SECTION TITLE */
  sectionTitleWrapper: {
    backgroundColor: GRAY_BG,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 6,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: { fontSize: 10.2, fontWeight: "bold", color: "#111827" },
  sectionTitleTag: { fontSize: 8.2, color: "#6b7280" },

  /* BOX */
  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 7,
    marginBottom: 7,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  col: { flex: 1, paddingRight: 7 },
  label: { fontWeight: "bold", color: "#374151", marginBottom: 1, fontSize: 8.4 },
  value: { fontSize: 8.4, color: "#111827" },

  /* Mini resumen */
  miniRow: { flexDirection: "row", gap: 7, marginBottom: 7 },
  miniBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  miniLabel: { fontSize: 7.8, color: "#064e3b" },
  miniValue: { fontSize: 11.4, fontWeight: "bold", color: ACCENT, marginTop: 2 },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: { flexDirection: "row", backgroundColor: ACCENT_LIGHT },
  tableRow: { flexDirection: "row" },
  tableCellHeader: {
    flex: 1,
    paddingVertical: 3.2,
    paddingHorizontal: 4.2,
    fontSize: 8.0,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 3.2,
    paddingHorizontal: 4.2,
    fontSize: 8.0,
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
    borderRadius: 7,
    padding: 7,
    marginBottom: 7,
  },
  motoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 7,
  },
  motoTitle: { fontSize: 10.0, fontWeight: "bold", color: "#111827", flexGrow: 1 },
  motoChip: { fontSize: 8.2, color: "#374151" },

  motoBodyRow: { flexDirection: "row", gap: 7 },

  // ✅ Más grande para que se vea mejor en carta
  motoLeftCol: {
    width: 170,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,
    backgroundColor: "#f9fafb",
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  motoImage: { width: 160, height: 96, objectFit: "contain" },

  motoImageLabel: { fontSize: 7.8, color: "#6b7280", marginTop: 3, textAlign: "center" },
  motoNoImg: { fontSize: 8.0, color: "#6b7280", textAlign: "center" },

  motoRightCol: { flex: 1, gap: 7 },
  motoTablesRow: { flexDirection: "row", gap: 7 },
  half: { flex: 1 },

  /* Cuotas 3 col */
  table3Header: { flexDirection: "row", backgroundColor: ACCENT_LIGHT },
  table3Row: { flexDirection: "row" },
  t3h: {
    width: "33.33%",
    paddingVertical: 3.2,
    paddingHorizontal: 4.2,
    fontSize: 7.8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  t3c: {
    width: "33.33%",
    paddingVertical: 3.2,
    paddingHorizontal: 4.2,
    fontSize: 7.8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  t3Last: { borderRightWidth: 0 },

  /* HABEAS / FIRMAS */
  habeasTitle: {
    fontSize: 8.8,
    fontWeight: "bold",
    marginBottom: 3,
    marginTop: 1,
    color: "#111827",
  },
  habeasText: {
    fontSize: 7.4,
    color: "#374151",
    lineHeight: 1.12,
    marginBottom: 3,
  },

  firmaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 35 },
  firmaBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 4 },
  firmaLabel: { fontSize: 8.2, color: "#111827" },

  /* FOOTER */
  footer: { fontSize: 7.6, color: "#6b7280", marginTop: 5, lineHeight: 1.2, textAlign: "center" },
  footerCenter: { fontSize: 7.6, color: "#374151", marginTop: 3, textAlign: "center" },

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

const resolveMotoImg = (d: any, override?: string): string | null => {
  if (override) return override;

  const candidates = [d?.foto_a, d?.product_img, d?.imagen, d?.foto].filter(Boolean) as string[];

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

export const CotizacionDetalladaPDFDocV2: React.FC<PropsV2> = ({
  cotizacion,
  garantiaExt,
  logoUrl,
  empresa,
  motoFotoUrl,
}) => {
  const d = cotizacion?.data || {};
  const g = garantiaExt?.data || {};

  const nombreCompletoCliente = [d.name, d.s_name, d.last_name, d.s_last_name]
    .filter(Boolean)
    .join(" ");

  // ✅ 1 sola moto: usa campos sin suffix si vienen, si no cae a _a
  const motoLabel = [d.marca ?? d.marca_a, d.linea ?? d.linea_a].filter(Boolean).join(" ");

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";
  const tipoPago = safe(d.tipo_pago || d.metodo_pago);

  const motoImg = resolveMotoImg(d, motoFotoUrl);

  const getGE = () => {
    const meses = num(g?.meses_a ?? g?.meses) || num(d?.garantia_extendida_a ?? d?.garantia_extendida);
    const valor = num(g?.valor_a ?? g?.valor) || num(d?.valor_garantia_extendida_a ?? d?.valor_garantia_extendida);
    const plan = safe(g?.garantia_extendida_a ?? g?.garantia_extendida ?? d?.garantia_extendida_a ?? d?.garantia_extendida, "—");
    return { meses, valor, plan };
  };

  const getMotoValues = () => {
    const s = "_a";

    const precioBase = num(d[`precio_base${s}`] ?? d.precio_base);
    const descuentos = num(d[`descuentos${s}`] ?? d.descuentos);

    const accesorios = num(d[`accesorios${s}`] ?? d.accesorios);
    const marcacion = num(d[`marcacion${s}`] ?? d.marcacion);
    const accesoriosMarcacion = accesorios + marcacion;

    const otrosSeguros = num(d[`otro_seguro${s}`] ?? d.otro_seguro);

    const soat = num(d[`soat${s}`] ?? d.soat);
    const matricula = num(d[`matricula${s}`] ?? d.matricula);
    const impuestos = num(d[`impuestos${s}`] ?? d.impuestos);
    const docsReal = soat + matricula + impuestos;

    const runt = num(d["runt_1"] ?? d.runt);
    const licencia = num(d["licencia_1"] ?? d.licencia);
    const defensas = num(d["defensas_1"] ?? d.defensas);
    const hand = num(d["hand_savers_1"] ?? d.hand_savers);
    const otrosAd = num(d["otros_adicionales_1"] ?? d.otros_adicionales);

    const adicionalesTotal = num(d["total_adicionales_1"]) || (runt + licencia + defensas + hand + otrosAd);

    const gpsMeses = d[`gps_meses${s}`] ?? d.gps_meses;
    const gpsValor = num(d[`valor_gps${s}`] ?? d.valor_gps);

    const polizaCodigo = d[`poliza${s}`] ?? d.poliza ?? null;
    const polizaValor = num(d[`valor_poliza${s}`] ?? d.valor_poliza);

    const totalSinSeguros =
      num(d[`total_sin_seguros${s}`] ?? d.total_sin_seguros) ||
      (precioBase + docsReal + accesoriosMarcacion + adicionalesTotal - descuentos + polizaValor);

    const total = num(d[`precio_total${s}`] ?? d.precio_total) || (totalSinSeguros + otrosSeguros);

    const cuotaInicial = num(d[`cuota_inicial${s}`] ?? d.cuota_inicial);
    const saldo = Math.max(total - cuotaInicial, 0);

    const cuotas = {
      c6: num(d[`cuota_6${s}`] ?? d.cuota_6),
      c12: num(d[`cuota_12${s}`] ?? d.cuota_12),
      c18: num(d[`cuota_18${s}`] ?? d.cuota_18),
      c24: num(d[`cuota_24${s}`] ?? d.cuota_24),
      c30: num(d[`cuota_30${s}`] ?? d.cuota_30),
      c36: num(d[`cuota_36${s}`] ?? d.cuota_36),
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
      totalSinSeguros,
      total,
      cuotaInicial,
      saldo,
      cuotas,
      polizaCodigo,
      polizaValor,
    };
  };

  const ge = getGE();
  const v = getMotoValues();

  const cuotasList = [
    ["6", v.cuotas.c6],
    ["12", v.cuotas.c12],
    ["18", v.cuotas.c18],
    ["24", v.cuotas.c24],
    ["30", v.cuotas.c30],
    ["36", v.cuotas.c36],
  ].filter(([, val]) => Number(val) > 0);

  const segurosDetalle = formatSeguros(d.seguros ?? d.seguros_a);

  const renderHabeasFirmasFooter = () => (
    <>

        {/* Observaciones */}
          <View style={styles.observacionesBox} wrap={false}>
            <Text style={styles.observacionesLabel}>Observaciones</Text>
    
          </View>
    

      <SectionTitle title="Autorización de habeas data y firmas" />
      <View style={styles.box} wrap={false}>
        <Text style={styles.habeasTitle}>Autorización de tratamiento de datos personales (Habeas Data)</Text>


        <Text style={styles.habeasText}>
          Con la firma del presente documento, el cliente autoriza de manera libre, previa, expresa e informada a Moto Para Todos S.A.S. para recolectar, almacenar, usar y tratar sus datos personales suministrados por medios físicos o digitales, con el fin de gestionar la cotización, venta, financiación, contacto comercial y envío de información relacionada con sus productos y servicios.
          Los datos tratados incluyen, entre otros, información de identificación y contacto. El titular declara conocer que, de conformidad con la Ley 1581 de 2012, puede conocer, actualizar, rectificar y solicitar la supresión de sus datos, así como revocar esta autorización cuando no se respeten las disposiciones legales.
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
        Precios y promociones sujetos a cambios sin previo aviso o hasta agotar existencias. La información será tratada
        según Ley 1581 de 2012.
      </Text>
      <Text style={styles.footerCenter}>MOTO PARA TODOS S.A.S - Hacemos tu sueño realidad</Text>
    </>
  );

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap={false}>
        {/* HEADER */}
        <View style={styles.header} wrap={false}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <Text style={styles.title}>Cotización #{safe(d.id, "")} · Moto</Text>
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
            <Text style={styles.resumenLine}>CC: {safe(d.cedula)} · Cel: {safe(d.celular)}</Text>
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

        {/* BLOQUE MOTO (1 sola) */}
        <SectionTitle title="Moto" tag={safe(motoLabel)} />

        <View style={styles.miniRow} wrap={false}>
          <MiniBox label="TOTAL" value={fmtCOP(v.total)} />
          <MiniBox label="Cuota inicial" value={fmtCOP(v.cuotaInicial)} />
          <MiniBox label="Saldo a financiar" value={fmtCOP(v.saldo)} />
        </View>

        <View style={styles.motoCard} wrap={false}>
          <View style={styles.motoHeader} wrap={false}>
            <Text style={styles.motoTitle}>{safe(motoLabel)}</Text>
          </View>

          <View style={styles.motoBodyRow} wrap={false}>
            <View style={styles.motoLeftCol} wrap={false}>
              {motoImg ? (
                <>
                  <Image src={motoImg} style={styles.motoImage} />
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
                  {[
                    { k: "Precio base", vv: v.precioBase, type: "money" },
                    { k: "Docs (total)", vv: v.docsReal, type: "money" },
                    { k: "Marcación", vv: v.marcacion, type: "money" },

                    // ✅ GPS (24 meses) -> $valor
                    {
                      k: Number(v.gpsMeses) > 0 ? `GPS (${Number(v.gpsMeses)} meses)` : "GPS",
                      vv: v.gpsValor,
                      type: "money",
                    },

                    // ✅ Garantía extendida (24 meses) -> $valor
                    {
                      k: ge.meses > 0 ? `Garantía extendida (${ge.meses} meses)` : "Garantía extendida",
                      vv: ge.meses > 0 ? ge.valor : null,
                      type: "moneyOrDash",
                    },

                    { k: "Cuota inicial", vv: v.cuotaInicial, type: "money" },
                  ].map((item, idx) => (
                    <View style={styles.tableRow} key={`L-ONE-${item.k}-${idx}`}>
                      <Text style={styles.tableCell}>{item.k}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>
                        {item.type === "money"
                          ? fmtCOP(item.vv)
                          : item.type === "moneyOrDash"
                            ? item.vv ? fmtCOP(item.vv) : "—"
                            : "—"}
                      </Text>
                    </View>
                  ))}

                </View>

                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Resumen</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {[
                    { k: "Seguro todo riesgo adicional", vv: v.otrosSeguros },
                    { k: "Cascos y accesorios", vv: v.accesorios },
                    { k: "Descuento / plan de marca", vv: v.descuentos },
                    { k: "Inscripción RUNT", vv: v.runt },
                    { k: "Licencias", vv: v.licencia },
                    { k: "Defensas", vv: v.defensas },
                    { k: "Hand savers", vv: v.hand },
                    { k: "Otros adicionales", vv: v.otrosAd },
                    { k: "TOTAL", vv: v.total },
                  ].map((item, idx) => (
                    <View style={styles.tableRow} key={`R-ONE-${item.k}-${idx}`}>
                      <Text style={styles.tableCell}>{item.k}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(item.vv)}</Text>
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
                      <View style={styles.table3Row} key={`C-ONE-${p}`}>
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
                    fontSize: 8.0,
                    color: "#374151",
                    marginTop: 4,
                    lineHeight: 1.1,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>Detalle seguros: </Text>
                  {segurosDetalle}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* GARANTÍA EXTENDIDA (opcional) */}
        {ge.meses > 0 ? (
          <>
            <SectionTitle title="Garantía extendida" />
            <View style={styles.box} wrap={false}>
              <View style={styles.table} wrap={false}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableCellHeader}>Moto</Text>
                  <Text style={styles.tableCellHeader}>Plan</Text>
                  <Text style={styles.tableCellHeader}>Meses</Text>
                  <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>{safe(motoLabel)}</Text>
                  <Text style={styles.tableCell}>{safe(ge.plan)}</Text>
                  <Text style={styles.tableCell}>{String(ge.meses)}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(ge.valor)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {/* HABEAS + FIRMAS + FOOTER */}
        {renderHabeasFirmasFooter()}
      </Page>
    </Document>
  );
};
