import React, { Fragment, useMemo } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Rect,
} from "@react-pdf/renderer";

// ===== Types =====
export type QuotePayload = {
  success: boolean;
  data: {
    id: number;
    name: string; s_name: string; last_name: string; s_last_name: string;
    cedula: string; celular: string; fecha_nacimiento: string;
    marca_a: string | null; linea_a: string | null; garantia_a: string | null;
    accesorios_a: number | null; email: string | null;
    seguro_vida_a: number | null; seguro_mascota_s_a: number | null; seguro_mascota_a_a: number | null; otro_seguro_a: number | null;
    precio_base_a: number | null; precio_documentos_a: number | null; precio_total_a: number | null;
    comentario: string | null; canal_contacto: string | null; pregunta: string | null;
    tipo_pago: string | null; cuota_inicial_a: number | null; financiera: string | null; cant_cuotas: number | null;
    fecha_creacion: string; fecha_actualizacion: string; estado: string; comentario2: string | null; asesor: string | null; prospecto: string | null;

    // 👇 Si tu backend ya trae la imagen con otro nombre, igual la detectamos abajo
    product_img?: string | null;
    imagen?: string | null;
    foto?: string | null;
  };
};

// ===== Utils =====
const n = (v?: number | null) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
const fmtCOP = (v?: number | null) => {
  if (v === undefined || v === null || Number.isNaN(v)) return "$0";
  try { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v); } catch { return `${v}`; }
};
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try { const dt = new Date(d.replace(" ", "T")); if (Number.isNaN(dt.getTime())) return d; return dt.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }); } catch { return d; }
};
// Placeholder AZUL cuando falta info
const missing = (ej: string) => <Text style={{ color: "#1E40AF" }}>{ej}</Text>;

// ===== Styles =====
const styles = StyleSheet.create({
  page: { paddingTop: 24, paddingHorizontal: 28, paddingBottom: 24, fontSize: 10, color: "#111" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 92, height: 92, objectFit: "contain" },
  headerText: { marginLeft: 20 },
  title: { fontSize: 26, fontWeight: 700 },
  metaLine: { fontSize: 12, marginTop: 4 },
  metaBold: { fontWeight: 700 },
  hrWrap: { marginTop: 6, marginBottom: 4 },
  hr1: { height: 2, backgroundColor: "#111" },
  hr2: { height: 1, backgroundColor: "#111", marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 10 },
  row: { flexDirection: "row", alignItems: "stretch" },
  cell: { borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#9CA3AF", paddingVertical: 6, paddingHorizontal: 6 },
  cellR: { borderRightWidth: 1, borderRightStyle: "solid", borderRightColor: "#9CA3AF" },
  label: { fontSize: 8, fontWeight: 700, color: "#111" },
  value: { fontSize: 10, marginTop: 2 },
  twoCols: { flexDirection: "row", gap: 18, marginTop: 12 },
  col: { flex: 1 },
  lineItem: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#9CA3AF", paddingVertical: 5 },
  lineLabel: { fontSize: 10 },
  lineValue: { fontSize: 10, fontWeight: 700 },
  legal: { marginTop: 10, fontSize: 8, lineHeight: 1.35, textAlign: "justify" },
  footer: { marginTop: 14, fontSize: 8, color: "#374151" },
  signatureLine: { marginTop: 18, width: 220, height: 0, borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#111" },

  // Página 2
  page2Header: { borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#111", paddingBottom: 8, marginBottom: 10, alignItems: "center" },

  // Imagen producto
  productImgWrap: { marginTop: 8, marginBottom: 8, width: "100%", height: 140, borderWidth: 1, borderStyle: "solid", borderColor: "#9CA3AF" },
});

// Helper de fila 2 celdas
const Row2 = ({ l1, v1, l2, v2 }: { l1: string; v1: React.ReactNode; l2: string; v2: React.ReactNode }) => (
  <View style={styles.row}>
    <View style={[styles.cell, styles.cellR, { flex: 1 }]}>
      <Text style={styles.label}>{l1}</Text>
      <Text style={styles.value}>{(v1 as any) ?? "—"}</Text>
    </View>
    <View style={[styles.cell, { flex: 1 }]}>
      <Text style={styles.label}>{l2}</Text>
      <Text style={styles.value}>{(v2 as any) ?? "—"}</Text>
    </View>
  </View>
);

// ====== Documento PDF (2 páginas) ======
export const CotizacionPDFDoc: React.FC<{
  payload: QuotePayload;
  logoUrl?: string; // si no la pasas, tomamos de /public
  empresa?: { nombre?: string; ciudad?: string; almacen?: string; };
}> = ({ payload, logoUrl, empresa }) => {
  const d = payload.data;

  // Logo desde public si no llega por prop
  const LogoSrc =
    logoUrl ||
    (import.meta as any)?.env?.VITE_LOGO_URL ||
    "/logo.png"; // <- pon aquí tu archivo real en /public

  // Imagen del producto: intenta con varios campos; si no, usa estática de /public
  const productImgUrl =
    d.product_img || d.imagen || d.foto || "/producto.png"; // <- coloca una imagen en /public/producto.png

  const cliente = `${d.name} ${d.s_name} ${d.last_name} ${d.s_last_name}`.replace(/\s+/g, " ").trim();
  const fecha = fmtDate(d.fecha_creacion) || missing("26/08/2025");
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "Feria de la Movilidad";
  const asesor = d.asesor || missing("Asesor");

  // Números
  const base = n(d.precio_base_a);
  const documentos = n(d.precio_documentos_a);
  const accesorios = n(d.accesorios_a);
  const seguros = n(d.seguro_vida_a) + n(d.seguro_mascota_s_a) + n(d.seguro_mascota_a_a) + n(d.otro_seguro_a);
  const total = n(d.precio_total_a) || base + documentos + accesorios + seguros;

  const distribucion = [
    { k: "Precio base", v: base, color: "#1f77b4" },
    { k: "Documentos", v: documentos, color: "#ff7f0e" },
    { k: "Accesorios", v: accesorios, color: "#2ca02c" },
    ...(seguros > 0 ? [{ k: "Seguros", v: seguros, color: "#d62728" } as const] : []),
  ];
  const sum = distribucion.reduce((a, b) => a + b.v, 0) || 1;

  return (
    <Document>
      {/* ========== Página 1 ========== */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {LogoSrc ? (
            <Image src={LogoSrc} style={styles.logo} />
          ) : (
            <Svg width={92} height={92}><Rect x={0} y={0} width={92} height={92} fill="#E5E7EB" /></Svg>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.metaLine}><Text style={styles.metaBold}>Fecha:</Text> {fecha}</Text>
            <Text style={styles.metaLine}><Text style={styles.metaBold}>Ciudad:</Text> {ciudad || missing("Cali")}</Text>
            <Text style={styles.metaLine}><Text style={styles.metaBold}>Almacén:</Text> {almacen || missing("Feria de la Movilidad")}</Text>
          </View>
        </View>
        <View style={styles.hrWrap}><View style={styles.hr1} /><View style={styles.hr2} /></View>

        {/* Datos del cliente */}
        <Text style={styles.sectionTitle}>Datos del cliente</Text>
        <View style={styles.hr2} />
        <Row2 l1="Nombre" v1={cliente || missing("Nombre Apellido")} l2="Cédula" v2={d.cedula || missing("00000000")} />
        <Row2 l1="Celular" v1={d.celular || missing("3001234567")} l2="Canal de contacto" v2={d.canal_contacto || missing("Sala de venta")} />
        <Row2 l1="Estado" v1={d.estado || missing("Solicitar crédito")} l2="Asesor" v2={asesor} />

        {/* Producto */}
        <Text style={styles.sectionTitle}>Producto</Text>
        <View style={styles.hr2} />
        <Row2
          l1="Marca / Línea"
          v1={`${d.marca_a ?? ""} ${d.linea_a ?? ""}`.trim() || missing("Yamaha FZ 250 – 2025")}
          l2="Garantía"
          v2={d.garantia_a || missing("Sí")}
        />

        {/* Imagen del producto (desde objeto o estática) */}
        <View style={styles.productImgWrap}>
          {productImgUrl ? (
            <Image src={productImgUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Svg width="100%" height="100%"><Rect x={0} y={0} width="100%" height="100%" fill="#EFF6FF" /></Svg>
          )}
        </View>

        {/* Valores + gráfica */}
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Valores</Text>
            <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(base) || missing("$—")}</Text></View>
            <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(documentos)}</Text></View>
            <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(accesorios)}</Text></View>
            <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(seguros)}</Text></View>
            <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(total)}</Text></View>
          </View>

          <View style={styles.col}>
            <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Distribución de costos</Text>
            <View style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#9CA3AF", padding: 6 }}>
              <Svg width="100%" height="24">
                <Rect x={0} y={0} width="100%" height={24} fill="#fff" />
                {(() => {
                  let accX = 0;
                  return distribucion.map((item, idx) => {
                    const w = (item.v / sum) * 500; // ancho relativo
                    const r = <Rect key={idx} x={accX} y={0} width={w} height={24} fill={item.color} />;
                    accX += w;
                    return r;
                  });
                })()}
              </Svg>
              {distribucion.map((dd, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text>{dd.k}</Text>
                  <Text>{fmtCOP(dd.v)}</Text>
                </View>
              ))}
              <View style={{ borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#9CA3AF", marginTop: 6, paddingTop: 4, flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: 700 }}>Total</Text>
                <Text style={{ fontWeight: 700 }}>{fmtCOP(total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Observaciones */}
        <View style={styles.legal}>
          <Text>
            Los precios y promociones están sujetos a cambios sin previo aviso o hasta agotar existencias. La información
            suministrada se trata conforme a la Ley 1581 de 2012 (protección de datos personales).
          </Text>
        </View>
        <View style={styles.footer}>
          <Text>Este documento es una copia de cotización para el cliente.</Text>
        </View>

        <View style={styles.signatureLine} />
        <Text>Firma del cliente</Text>
      </Page>

      {/* ========== Página 2: Copia + Legales ========== */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.page2Header}>
          <Text style={{ fontSize: 22, fontWeight: 700 }}>Copia de cotización</Text>
          <Text style={{ marginTop: 6 }}>
            <Text style={styles.metaBold}>Fecha: </Text>{fecha}{"   "}
            <Text style={styles.metaBold}>Ciudad: </Text>{ciudad || missing("Cali")}{"   "}
            <Text style={styles.metaBold}>Almacén: </Text>{almacen || missing("Feria de la Movilidad")}
          </Text>
        </View>

        {/* Resumen cliente/asesor */}
        <Row2 l1="A nombre de" v1={cliente || missing("Nombre Apellido")} l2="Atendido por" v2={asesor} />

        {/* Detalle valores (otra vez, como en copia) */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
          Opción 1 {`${d.marca_a ?? ""} ${d.linea_a ?? ""}`.trim() || "—"}
        </Text>
        <View style={styles.hr2} />
        <View style={{ marginTop: 6 }}>
          <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(base)}</Text></View>
          <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(documentos)}</Text></View>
          <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(accesorios)}</Text></View>
          <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(seguros)}</Text></View>
          <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(total)}</Text></View>
        </View>

        {/* Legales / habeas data */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Autorización de habeas data</Text>
        <View style={styles.hr2} />
        <View style={styles.legal}>
          <Text>
            Con la firma del presente documento y/o en el suministro libre, expreso e informado de mis datos personales,
            autorizo a MOTO PARA TODOS S.A.S. para el tratamiento de estos con finalidades de contacto comercial, envío de
            información y acompañamiento postventa; así como para consultas y reportes ante terceros autorizados.
          </Text>
          <Text>
            Declaro conocer la política de tratamiento de datos y mis derechos de acceso, corrección, actualización y
            supresión conforme a la Ley 1581 de 2012. Podré revocar esta autorización en cualquier momento mediante los
            canales dispuestos por la compañía.
          </Text>
          <Text>
            Igualmente autorizo el envío de comunicaciones a través de correo electrónico y/o mensajería instantánea.
          </Text>
        </View>

        {/* Firma */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.signatureLine} />
          <Text>Firma de cliente</Text>
        </View>
      </Page>
    </Document>
  );
};

// ===== Contenedor Web (descarga) =====
const CotizacionPDF: React.FC<{ payload: QuotePayload; logoUrl?: string }>= ({ payload, logoUrl }) => {
  const fileName = useMemo(() => `Cotizacion_${payload?.data?.cedula || "cliente"}.pdf`, [payload]);
  return (
    <div className="inline-flex items-center gap-3">
      <Fragment>
        <PDFDownloadLink
          document={
            <CotizacionPDFDoc
              payload={payload}
              logoUrl={logoUrl} // si no la pasas, toma /logo.png en public
              empresa={{ ciudad: "Cali", almacen: "Feria de la Movilidad" }}
            />
          }
          fileName={fileName}
        >
          {({ loading }) => (
            <button className="btn bg-primary text-white" type="button">
              {loading ? "Generando PDF…" : "Descargar Cotización"}
            </button>
          )}
        </PDFDownloadLink>
      </Fragment>
    </div>
  );
};

export default CotizacionPDF;
