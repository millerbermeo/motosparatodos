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
    paddingTop: 26,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: "column", maxWidth: "65%" },
  headerRight: { flexDirection: "column", alignItems: "flex-end", maxWidth: "35%" },
  logo: { width: 90, height: 40, marginBottom: 6 },
  title: { fontSize: 15, fontWeight: "bold", color: ACCENT, marginBottom: 2 },
  subtitle: { fontSize: 8.6, marginBottom: 2, color: "#4b5563" },

  /* RESUMEN */
  resumenWrapper: {
    flexDirection: "row",
    borderRadius: 7,
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  resumenCol: { flex: 1, paddingRight: 8 },
  resumenHeader: { fontSize: 10, fontWeight: "bold", color: ACCENT, marginBottom: 3 },
  resumenLine: { fontSize: 8.6, color: "#064e3b", marginBottom: 2 },

  /* SECTION TITLE */
  sectionTitleWrapper: {
    backgroundColor: GRAY_BG,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: { fontSize: 10.5, fontWeight: "bold", color: "#111827" },
  sectionTitleTag: { fontSize: 8.4, color: "#6b7280" },

  /* BOX */
  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
  },
  row: { flexDirection: "row", marginBottom: 5 },
  col: { flex: 1, paddingRight: 6 },
  label: { fontWeight: "bold", color: "#374151", marginBottom: 1, fontSize: 8.6 },
  value: { fontSize: 8.6, color: "#111827" },

  /* TABLE (compacta) */
  table: {
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
  },
  tableHeaderRow: { flexDirection: "row", backgroundColor: ACCENT_LIGHT },
  tableRow: { flexDirection: "row" },
  tableCellHeader: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8.4,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8.4,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLast: { borderRightWidth: 0 },

  /* MOTO */
  motoCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  motoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  motoTitle: { fontSize: 10, fontWeight: "bold", color: "#111827" },
  motoChip: { fontSize: 8.4, color: "#374151" },
  motoImageWrapper: {
    marginTop: 6,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 5,
    backgroundColor: "#f9fafb",
  },
  motoImage: { width: 190, height: 110, objectFit: "contain" },
  motoImageLabel: { fontSize: 7.8, color: "#6b7280", marginTop: 3 },

  /* HABEAS / FIRMAS */
  smallText: { fontSize: 8.2, color: "#374151", lineHeight: 1.25 },
  firmaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  firmaBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 4 },
  firmaLabel: { fontSize: 8.6, color: "#111827" },

  /* FOOTER */
  footer: { fontSize: 7.8, color: "#6b7280", marginTop: 8, lineHeight: 1.25 },
  footerCenter: { fontSize: 7.8, color: "#374151", marginTop: 4, textAlign: "center" },
  habeasTitle: {
  fontSize: 9.6,
  fontWeight: "bold",
  marginBottom: 4,
  marginTop: 2,
  color: "#111827",
},
habeasText: {
  fontSize: 8.2,
  color: "#374151",
  lineHeight: 1.25,
  marginBottom: 4,
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
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
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
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const safe = (v: any, fallback: string = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

/* ====== Imagen helpers ====== */

const BaseUrl =
  (import.meta as any)?.env?.VITE_API_URL ?? "https://tuclick.vozipcolombia.net.co/motos/back";

const buildAbsUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const root = String(BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

const publicUrl = (p: string) => {
  try {
    if (typeof window !== "undefined" && (window as any)?.location?.origin) {
      return window.location.origin + p;
    }
  } catch {}
  return p;
};

const resolveMotoImg = (d: any, side: "A" | "B", override?: string): string | null => {
  if (override) return override;

  const key = side === "A" ? "foto_a" : "foto_b";
  const sideSpecific = d?.[key];

  const candidates = [sideSpecific, d?.product_img, d?.imagen, d?.foto].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }

  return publicUrl("/producto.png");
};

const SectionTitle: React.FC<{ title: string; tag?: string }> = ({ title, tag }) => (
  <View style={styles.sectionTitleWrapper}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {tag ? <Text style={styles.sectionTitleTag}>{tag}</Text> : null}
  </View>
);

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
  const hayMotoB = !!d.marca_b || !!d.linea_b || !!d.precio_base_b;

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";

  const motoImgA = resolveMotoImg(d, "A", motoFotoAUrl);
  const motoImgB = hayMotoB ? resolveMotoImg(d, "B", motoFotoBUrl) : null;

  // Económicos A
  const totalSinSegurosA = num(d.total_sin_seguros_a);
  const totalA = num(d.precio_total_a) || totalSinSegurosA + num(d.otro_seguro_a);
  const cuotaInicialA = num(d.cuota_inicial_a);
  const saldoAFinanciarA = Math.max(totalA - cuotaInicialA, 0);

  // Económicos B
  const totalSinSegurosB = num(d.total_sin_seguros_b);
  const totalB = num(d.precio_total_b) || totalSinSegurosB + num(d.otro_seguro_b);
  const cuotaInicialB = num(d.cuota_inicial_b);
  const saldoAFinanciarB = Math.max(totalB - cuotaInicialB, 0);

  const tipoPago = safe(d.tipo_pago || d.metodo_pago);

  const renderMotoCompact = (opts: {
    title: string;
    label: string;
    img: string | null;
    garantia: any;
    garantiaExtendida: any;
    values: {
      precio_base: any;
      documentos: any;
      accesorios: any;
      seguros_valor: any;
      seguros_detalle: any;
      descuentos: any;
      totalSinSeguros: number;
      total: number;
      cuotaInicial: number;
      saldo: number;
    };
  }) => {
    const { title, label, img, garantia, garantiaExtendida, values } = opts;

    return (
      <>
        <SectionTitle title={title} tag={safe(label)} />
        <View style={styles.motoCard}>
          <View style={styles.motoHeader}>
            <Text style={styles.motoTitle}>{safe(label)}</Text>
            <Text style={styles.motoChip}>
              Garantía: {safe(garantia, "—")} · Ext: {safe(garantiaExtendida, "—")}
            </Text>
          </View>

          {img && (
            <View style={styles.motoImageWrapper}>
              <Image src={img} style={styles.motoImage} />
              <Text style={styles.motoImageLabel}>Imagen referencia</Text>
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableCellHeader}>Concepto</Text>
              <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
            </View>

            {[
              ["Precio público", values.precio_base],
              ["Documentos", values.documentos],
              ["Accesorios", values.accesorios],
              ["Seguros", values.seguros_valor],
              ["Descuentos", values.descuentos],
              ["Total sin seguros", values.totalSinSeguros],
              ["TOTAL", values.total],
              ["Cuota inicial", values.cuotaInicial],
              ["Saldo a financiar", values.saldo],
            ].map(([k, v], idx) => (
              <View style={styles.tableRow} key={String(k) + idx}>
                <Text style={styles.tableCell}>{k as string}</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  {fmtCOP(v)}
                </Text>
              </View>
            ))}
          </View>

          {values.seguros_detalle && values.seguros_detalle !== "—" ? (
            <Text style={styles.smallText}>
              <Text style={{ fontWeight: "bold" }}>Detalle seguros: </Text>
              {values.seguros_detalle}
            </Text>
          ) : null}
        </View>
      </>
    );
  };

  const mostrarGarantia =
    !!g && (g.moto_a || g.garantia_extendida_a || g.valor_a || g.moto_b || g.garantia_extendida_b || g.valor_b);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <Text style={styles.title}>Cotización #{safe(d.id, "")}</Text>
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
          </View>
        </View>

        {/* RESUMEN (sin duplicados) */}
        <View style={styles.resumenWrapper}>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Cliente</Text>
            <Text style={styles.resumenLine}>{safe(nombreCompletoCliente)}</Text>
            <Text style={styles.resumenLine}>CC: {safe(d.cedula)} · Cel: {safe(d.celular)}</Text>
            <Text style={styles.resumenLine}>Email: {safe(d.email)}</Text>
          </View>

          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Comercial</Text>
            <Text style={styles.resumenLine}>Asesor: {safe(d.asesor)}</Text>
            <Text style={styles.resumenLine}>Tipo pago: {tipoPago}</Text>
            <Text style={styles.resumenLine}>Prospecto: {safe(d.prospecto)}</Text>
            <Text style={styles.resumenLine}>Fecha: {fechaCorta}</Text>
          </View>
        </View>

        {/* DATOS IMPORTANTES (compacto) */}
        <SectionTitle title="Información clave" />
        <View style={styles.box}>
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
              <Text style={styles.label}>Observación (principal)</Text>
              <Text style={styles.value}>{safe(d.comentario2 ?? d.comentario ?? "", "—")}</Text>
            </View>
          </View>
        </View>

        {/* MOTO A (compacta) */}
        {renderMotoCompact({
          title: "Moto A",
          label: motoALabel,
          img: motoImgA,
          garantia: d.garantia_a,
          garantiaExtendida: d.garantia_extendida_a,
          values: {
            precio_base: d.precio_base_a,
            documentos: d.precio_documentos_a,
            accesorios: d.accesorios_a,
            seguros_valor: d.otro_seguro_a,
            seguros_detalle: formatSeguros(d.seguros_a),
            descuentos: d.descuentos_a,
            totalSinSeguros: totalSinSegurosA,
            total: totalA,
            cuotaInicial: cuotaInicialA,
            saldo: saldoAFinanciarA,
          },
        })}

        {/* MOTO B (si existe) */}
        {hayMotoB
          ? renderMotoCompact({
              title: "Moto B",
              label: motoBLabel,
              img: motoImgB,
              garantia: d.garantia_b,
              garantiaExtendida: d.garantia_extendida_b,
              values: {
                precio_base: d.precio_base_b,
                documentos: d.precio_documentos_b,
                accesorios: d.accesorios_b,
                seguros_valor: d.otro_seguro_b,
                seguros_detalle: formatSeguros(d.seguros_b),
                descuentos: d.descuentos_b,
                totalSinSeguros: totalSinSegurosB,
                total: totalB,
                cuotaInicial: cuotaInicialB,
                saldo: saldoAFinanciarB,
              },
            })
          : null}

        {/* GARANTÍA EXTENDIDA (solo si trae datos reales) */}
        {mostrarGarantia ? (
          <>
            <SectionTitle title="Garantía extendida" />
            <View style={styles.box}>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableCellHeader}>Moto</Text>
                  <Text style={styles.tableCellHeader}>Plan</Text>
                  <Text style={styles.tableCellHeader}>Meses</Text>
                  <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>{safe(g.moto_a)}</Text>
                  <Text style={styles.tableCell}>{safe(g.garantia_extendida_a)}</Text>
                  <Text style={styles.tableCell}>{safe(g.meses_a)}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(g.valor_a)}</Text>
                </View>

                {hayMotoB ? (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{safe(g.moto_b)}</Text>
                    <Text style={styles.tableCell}>{safe(g.garantia_extendida_b)}</Text>
                    <Text style={styles.tableCell}>{safe(g.meses_b)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellLast]}>
                      {g.valor_b != null ? fmtCOP(g.valor_b) : "—"}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        ) : null}

        {/* HABEAS DATA + FIRMAS (resumido) */}
        <SectionTitle title="Autorización y firmas" />
{/* HABEAS DATA Y FIRMAS (COMPLETO) */}
<SectionTitle title="Autorización de habeas data y firmas" />
<View style={styles.box}>
  <Text style={styles.habeasTitle}>Autorización de habeas data:</Text>

  <Text style={styles.habeasText}>
    Con la firma del presente documento y con el suministro libre, espontáneo y
    voluntario de sus datos generales de comunicación, entiéndase: nombre
    completo, cédula de ciudadanía, correo electrónico, número de dispositivo
    móvil, número de teléfono fijo, whatsapp y todos aquellos que sean utilizados
    por redes sociales; se entenderá que la empresa queda autorizada para el uso
    de los datos a fin de suministrar, a través de documentos digitales y/o en
    físico la información comercial y de venta al consumidor de la siguiente
  </Text>

  <Text style={styles.habeasText}>
    También quedan facultadas la empresa y el consumidor para: a) Conocer,
    actualizar y rectificar en cualquier momento los datos personales; b)
    Solicitar prueba de la autorización otorgada; c) Ser informado, previa
    solicitud, respecto del uso que se ha dado a los datos personales; d)
    Presentar ante la Superintendencia de Industria y Comercio quejas por
    infracciones de conformidad con la ley; e) Revocar y suspender la autorización
    y/o solicitar la supresión de un dato cuando en el tratamiento no se respeten
    las normas; f) Acceder en forma gratuita a los datos personales que hayan
    sido objeto de tratamiento, y en general todas aquellas facultades consagradas
    en la Ley 1581 de 2012. Para conocer más detalles de nuestra política de
    tratamiento y protección de datos personales, consulte nuestro manual de
    tratamiento en www.tuclickmotos.com
  </Text>

  <View style={styles.firmaRow}>
    <View style={styles.firmaBox}>
      <Text style={styles.firmaLabel}>Firma del cliente</Text>
    </View>
    <View style={styles.firmaBox}>
      <Text style={styles.firmaLabel}>Firma del asesor</Text>
    </View>
  </View>
</View>


        {/* FOOTER */}
        <Text style={styles.footer}>
          Precios y promociones sujetos a cambios sin previo aviso o hasta agotar existencias. La información
          será tratada según Ley 1581 de 2012.
        </Text>
        <Text style={styles.footerCenter}>MOTO PARA TODOS S.A.S - Hacemos tu sueño realidad</Text>
      </Page>
    </Document>
  );
};
