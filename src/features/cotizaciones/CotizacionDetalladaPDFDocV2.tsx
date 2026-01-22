// src/pages/CotizacionDetalladaPDFDocV2.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

/* ============================
   Helpers
============================ */

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

export type CotizacionApi = { success: boolean; data: any };
export type GarantiaExtApi = { success: boolean; data: any };

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

const ACCENT = "#0f766e";
const ACCENT_LIGHT = "#ecfdf5";
const GRAY_BG = "#f3f4f6";
const BORDER = "#d1d5db";

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

  /* SECTION */
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

  /* Mini resumen (totales) */
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

  /* MOTO - layout horizontal */
  motoCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 5,
    marginBottom: 5,
  },
  motoHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3, gap: 6 },
  motoTitle: { fontSize: 8.6, fontWeight: "bold", color: "#111827", flexGrow: 1 },
  motoChip: { fontSize: 7.2, color: "#374151" },

  motoBodyRow: { flexDirection: "row", gap: 5 },

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
  motoImageLabel: { fontSize: 6.8, color: "#6b7280", marginTop: 2, textAlign: "center" },
  motoNoImg: { fontSize: 7.0, color: "#6b7280", textAlign: "center" },

  motoRightCol: { flex: 1, gap: 5 },
  motoTablesRow: { flexDirection: "row", gap: 5 },
  half: { flex: 1 },

  /* HABEAS / FIRMAS */
  habeasTitle: { fontSize: 7.8, fontWeight: "bold", marginBottom: 2, marginTop: 1, color: "#111827" },
  habeasText: { fontSize: 6.5, color: "#374151", lineHeight: 1.06, marginBottom: 2 },
  firmaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  firmaBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 3 },
  firmaLabel: { fontSize: 7.4, color: "#111827" },

  /* FOOTER */
  smallMuted: { fontSize: 6.6, color: "#6b7280", marginTop: 3, lineHeight: 1.1 },
  smallMutedCenter: { fontSize: 6.6, color: "#374151", marginTop: 2, textAlign: "center" },
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

const resolveMotoImg = (d: any, override?: string): string | null => {
  if (override) return override;

  const candidates = [d?.foto, d?.foto_a, d?.product_img, d?.imagen].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }

  // En V2 lo dejo null para no forzar una imagen grande si no existe
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

/* ============================
   PDF V2 COMPACTO (1 moto)
============================ */

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

  const motoLabel = [d.marca ?? d.marca_a, d.linea ?? d.linea_a, d.modelo ?? d.modelo_a]
    .filter(Boolean)
    .join(" ");

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";

  const motoImg = resolveMotoImg(d, motoFotoUrl);

  // Económicos
  const totalSinSeguros = num(d.total_sin_seguros ?? d.total_sin_seguros_a);
  const total =
    num(d.precio_total ?? d.precio_total_a) ||
    totalSinSeguros + num(d.otro_seguro ?? d.otro_seguro_a);

  const cuotaInicial = num(d.cuota_inicial ?? d.cuota_inicial_a);

  const saldoAFinanciar = num(d.saldo_financiar ?? d.saldo_financiar_a) || Math.max(total - cuotaInicial, 0);

  // Detalles base
  const precioBase = d.precio_base ?? d.precio_base_a;
  const precioDocumentos = d.precio_documentos ?? d.precio_documentos_a;
  const accesorios = d.accesorios ?? d.accesorios_a;
  const otrosSeguros = d.otro_seguro ?? d.otro_seguro_a;
  const descuentos = d.descuentos ?? d.descuentos_a;

  const garantia = d.garantia ?? d.garantia_a;
  const garantiaExtMoto = d.garantia_extendida ?? d.garantia_extendida_a;

  // Garantía extendida (tabla)
  const mostrarGarantia =
    !!garantiaExt &&
    (g?.moto || g?.moto_a || g?.garantia_extendida || g?.garantia_extendida_a || g?.valor || g?.valor_a);

  const gMoto = g?.moto ?? g?.moto_a ?? motoLabel;
  const gPlan = g?.garantia_extendida ?? g?.garantia_extendida_a ?? garantiaExtMoto;
  const gMeses = g?.meses ?? g?.meses_a;
  const gValor = g?.valor ?? g?.valor_a;

  const tipoPago = safe(d.tipo_pago || d.metodo_pago);
  const telefonos = `${safe(d.celular)}${empresa?.telefono ? ` · ${empresa.telefono}` : ""}`;

  const detSeguros = formatSeguros(d.seguros ?? d.seguros_a);

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap={false}>
        {/* HEADER */}
        <View style={styles.header} wrap={false}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <Text style={styles.title}>Cotización #{safe(d.id, "")}</Text>
            <Text style={styles.subtitle}>
              Fecha: {fmtDateTime(d.fecha_creacion)} ({fechaCorta})
            </Text>
            <Text style={styles.subtitle}>Actualización: {fmtDateTime(d.fecha_actualizacion)}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Estado: {safe(d.estado, "Sin estado")}</Text>
            {empresa?.nombre ? <Text style={styles.subtitle}>{empresa.nombre}</Text> : null}
            <Text style={styles.subtitle}>
              {almacen} · {ciudad}
            </Text>
            {empresa?.nit ? <Text style={styles.subtitle}>NIT: {empresa.nit}</Text> : null}
            {empresa?.direccion ? <Text style={styles.subtitle}>{empresa.direccion}</Text> : null}
          </View>
        </View>

        {/* RESUMEN */}
        <View style={styles.resumenWrapper} wrap={false}>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Cliente</Text>
            <Text style={styles.resumenLine}>{safe(nombreCompletoCliente)}</Text>
            <Text style={styles.resumenLine}>CC: {safe(d.cedula)} · Tel: {telefonos}</Text>
            <Text style={styles.resumenLine}>Email: {safe(d.email)}</Text>
          </View>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Cotización</Text>
            <Text style={styles.resumenLine}>Moto: {safe(motoLabel)}</Text>
            <Text style={styles.resumenLine}>
              Total: {fmtCOP(total)} · Inicial: {fmtCOP(cuotaInicial)}
            </Text>
            <Text style={styles.resumenLine}>Saldo: {fmtCOP(saldoAFinanciar)}</Text>
            <Text style={styles.resumenLine}>Pago: {tipoPago} · Asesor: {safe(d.asesor)}</Text>
          </View>
        </View>

        {/* MINI TOTALES (para que el cliente lo vea fácil) */}
        <View style={styles.miniRow} wrap={false}>
          <MiniBox label="TOTAL" value={fmtCOP(total)} />
          <MiniBox label="Cuota inicial" value={fmtCOP(cuotaInicial)} />
          <MiniBox label="Saldo a financiar" value={fmtCOP(saldoAFinanciar)} />
        </View>

        {/* INFO CLAVE */}
        <SectionTitle title="Información clave" />
        <View style={styles.box} wrap={false}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Canal</Text>
              <Text style={styles.value}>{safe(d.canal_contacto)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Prospecto</Text>
              <Text style={styles.value}>{safe(d.prospecto)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Financiera</Text>
              <Text style={styles.value}>{safe(d.financiera)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Motivo / Necesidad</Text>
              <Text style={styles.value}>{safe(d.pregunta)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Comentarios</Text>
              <Text style={styles.value}>{safe(d.comentario2 ?? d.comentario ?? "", "—")}</Text>
            </View>
          </View>
        </View>

        {/* DETALLE MOTO - horizontal (imagen izq + 2 tablas der) */}
        <SectionTitle title="Detalle de la moto" tag={safe(motoLabel)} />
        <View style={styles.motoCard} wrap={false}>
          <View style={styles.motoHeader} wrap={false}>
            <Text style={styles.motoTitle}>{safe(motoLabel)}</Text>
            <Text style={styles.motoChip}>
              Garantía: {safe(garantia, "—")} · Ext: {safe(garantiaExtMoto, "—")}
            </Text>
          </View>

          <View style={styles.motoBodyRow} wrap={false}>
            {/* Imagen pequeña izquierda */}
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

            {/* Tablas derecha */}
            <View style={styles.motoRightCol} wrap={false}>
              <View style={styles.motoTablesRow} wrap={false}>
                {/* Tabla 1 */}
                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Concepto</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {[
                    ["Precio público", precioBase],
                    ["Documentos", precioDocumentos],
                    ["Accesorios", accesorios],
                    ["Seguros", otrosSeguros],
                    ["Descuentos", descuentos],
                  ].map(([k, v], idx) => (
                    <View style={styles.tableRow} key={`t1-${String(k)}-${idx}`}>
                      <Text style={styles.tableCell}>{k as string}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(v)}</Text>
                    </View>
                  ))}
                </View>

                {/* Tabla 2 */}
                <View style={[styles.table, styles.half]} wrap={false}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableCellHeader}>Resumen</Text>
                    <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Valor</Text>
                  </View>

                  {[
                    ["Total sin seguros", totalSinSeguros],
                    ["TOTAL", total],
                    ["Cuota inicial", cuotaInicial],
                    ["Saldo a financiar", saldoAFinanciar],
                  ].map(([k, v], idx) => (
                    <View style={styles.tableRow} key={`t2-${String(k)}-${idx}`}>
                      <Text style={styles.tableCell}>{k as string}</Text>
                      <Text style={[styles.tableCell, styles.tableCellLast]}>{fmtCOP(v)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detalle seguros debajo (si aplica) */}
              {detSeguros && detSeguros !== "—" ? (
                <Text style={styles.value}>
                  <Text style={{ fontWeight: "bold" }}>Detalle seguros: </Text>
                  {detSeguros}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* GARANTÍA EXTENDIDA */}
        {mostrarGarantia ? (
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
                  <Text style={styles.tableCell}>{safe(gMoto)}</Text>
                  <Text style={styles.tableCell}>{safe(gPlan)}</Text>
                  <Text style={styles.tableCell}>{safe(gMeses)}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>
                    {gValor != null ? fmtCOP(gValor) : "—"}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {/* HABEAS + FIRMAS */}
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
            hayan sido objeto de tratamiento, y en general todas aquellas facultades consagradas en la Ley 1581 de 2012.
          </Text>

          <Text style={styles.habeasText}>
            Para conocer más detalles de nuestra política de tratamiento y protección de datos personales, consulte nuestro
            manual de tratamiento en www.tuclickmotos.com
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

        {/* FOOTER */}
        <Text style={styles.smallMuted}>
          Todos los precios y/o promociones publicados en este documento están sujetos a cambio sin previo aviso o hasta
          agotar existencias. La motocicleta se entrega con kit de herramienta básico. La información suministrada será
          tratada acorde a lo estipulado por la Ley 1581 de 2012.
        </Text>
        <Text style={styles.smallMutedCenter}>MOTO PARA TODOS S.A.S - Hacemos tu sueño realidad</Text>
      </Page>
    </Document>
  );
};
