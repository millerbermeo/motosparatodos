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
  title: { fontSize: 12.0, fontWeight: "bold", color: ACCENT, marginBottom: 1 },
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

  firmaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  firmaBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 3 },
  firmaLabel: { fontSize: 7.4, color: "#111827" },

  /* FOOTER */
  footer: { fontSize: 6.6, color: "#6b7280", marginTop: 3, lineHeight: 1.1 },
  footerCenter: { fontSize: 6.6, color: "#374151", marginTop: 2, textAlign: "center" },
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

const fmtGpsMeses = (v: any) => {
  if (v === null || v === undefined) return "No aplica";
  const s = String(v).toLowerCase();
  if (s === "no") return "No";
  return `${v} meses`;
};

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

  const motoALabel = [d.marca_a, d.linea_a, d.modelo_a].filter(Boolean).join(" ");
  const motoBLabel = [d.marca_b, d.linea_b, d.modelo_b].filter(Boolean).join(" ");
  const hayMotoB = !!d.marca_b || !!d.linea_b || !!d.precio_base_b || !!d.precio_total_b;

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";
  const tipoPago = safe(d.tipo_pago || d.metodo_pago);

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
    const descuentos = num(d[`descuentos${s}`]);

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

    const gpsMeses = d[`gps_meses${s}`];
    const gpsValor = num(d[`valor_gps${s}`]);


    const totalSinSeguros =
      num(d[`total_sin_seguros${s}`]) ||
      (precioBase + docsReal + accesoriosMarcacion + adicionalesTotal - descuentos);

    const total = num(d[`precio_total${s}`]) || (totalSinSeguros + otrosSeguros);

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
      totalSinSeguros,
      total,
      cuotaInicial,
      saldo,
      cuotas,
    };
  };

  const renderMotoBlock = (side: "A" | "B", opts?: { bigger?: boolean }) => {
    const bigger = !!opts?.bigger;

    const label = side === "A" ? motoALabel : motoBLabel;
    const img = side === "A" ? motoImgA : motoImgB;

    const garantia = side === "A" ? d.garantia_a : d.garantia_b;
    const segurosDetalle = formatSeguros(side === "A" ? d.seguros_a : d.seguros_b);

    const v = getMotoValues(side);
    const geSide = getGE(side);

    const cuotasList = [
      ["6", v.cuotas.c6],
      ["12", v.cuotas.c12],
      ["18", v.cuotas.c18],
      ["24", v.cuotas.c24],
      ["30", v.cuotas.c30],
      ["36", v.cuotas.c36],
    ].filter(([, val]) => Number(val) > 0);

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
            <Text style={styles.motoChip}>
              Garantía: {safe(garantia, "—")} · GE:{" "}
              {geSide.meses > 0 ? `${geSide.meses}m (${fmtCOP(geSide.valor)})` : "No aplica"}
            </Text>
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

                  {[
                    ["Precio base", v.precioBase],
                    ["Descuentos", v.descuentos],
                    ["Accesorios", v.accesorios],
                    ["Marcación", v.marcacion],
                    ["Adicionales", v.adicionalesTotal],
                    ["SOAT", v.soat],
                    ["Matrícula", v.matricula],
                    ["Impuestos", v.impuestos],
                  ].map(([k, val], idx) => (
                    <View style={styles.tableRow} key={`L-${side}-${k}-${idx}`}>
                      <Text style={styles.tableCell}>{k as string}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(val)}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Resumen</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {[
                    ["Docs (total)", v.docsReal],
                    ["Acc + marcación", v.accesoriosMarcacion],
                    ["Otros seguros", v.otrosSeguros],
                    ["GPS (meses)", "TXT"],
                    ["GPS (valor)", v.gpsValor],
                    // ["Bono ensambladora", "BONO"],  // ❌ eliminado
                    ["Garantía extendida", "GEVAL"],
                    ["Total sin seguros", v.totalSinSeguros],
                    ["TOTAL", v.total],
                  ].map(([k, val], idx) => (
                    <View style={styles.tableRow} key={`R-${side}-${k}-${idx}`}>
                      <Text style={styles.tableCell}>{k as string}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>
                        {k === "GPS (meses)"
                          ? fmtGpsMeses(v.gpsMeses)
                          : k === "Garantía extendida"
                            ? geSide.meses > 0
                              ? fmtCOP(geSide.valor)
                              : "—"
                            : fmtCOP(val)}
                      </Text>
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
              <Text style={styles.tableCell}>
                {safe(side === "A" ? g.moto_a ?? motoALabel : g.moto_b ?? motoBLabel)}
              </Text>
              <Text style={styles.tableCell}>{safe(geSide.plan)}</Text>
              <Text style={styles.tableCell}>{geSide.meses > 0 ? String(geSide.meses) : "—"}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}>
                {geSide.meses > 0 ? fmtCOP(geSide.valor) : "—"}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderHabeasFirmasFooter = () => (
    <>
      <SectionTitle title="Autorización de habeas data y firmas" />
      <View style={styles.box} wrap={false}>
        <Text style={styles.habeasTitle}>Autorización de habeas data:</Text>

        <Text style={styles.habeasText}>
          Con la firma del presente documento y con el suministro libre, espontáneo y voluntario de sus datos generales de
          comunicación, entiéndase: nombre completo, cédula de ciudadanía, correo electrónico, número de dispositivo móvil,
          número de teléfono fijo, whatsapp y todos aquellos que sean utilizados por redes sociales; se entenderá que la
          empresa queda autorizada para el uso de los datos a fin de suministrar, a través de documentos digitales y/o en
          físico la información comercial y de venta al consumidor de la siguiente
        </Text>

        <Text style={styles.habeasText}>
          También quedan facultadas la empresa y el consumidor para: a) Conocer, actualizar y rectificar en cualquier momento
          los datos personales; b) Solicitar prueba de la autorización otorgada; c) Ser informado, previa solicitud, respecto
          del uso que se ha dado a los datos personales; d) Presentar ante la Superintendencia de Industria y Comercio quejas
          por infracciones de conformidad con la ley; e) Revocar y suspender la autorización y/o solicitar la supresión de un
          dato cuando en el tratamiento no se respeten las normas; f) Acceder en forma gratuita a los datos personales que
          hayan sido objeto de tratamiento, y en general todas aquellas facultades consagradas en la Ley 1581 de 2012. Para
          conocer más detalles de nuestra política de tratamiento y protección de datos personales, consulte nuestro manual de
          tratamiento en www.tuclickmotos.com
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
          <Text style={styles.subtitle}>Estado: {safe(d.estado, "Sin estado")}</Text>
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
          <Text style={styles.subtitle}>Estado: {safe(d.estado, "Sin estado")}</Text>
          {empresa?.nombre ? <Text style={styles.subtitle}>{empresa.nombre}</Text> : null}
        </View>
      </View>

      {/* SOLO bloque Moto B (y su GE) */}
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
