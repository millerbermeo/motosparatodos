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

    // Moto A
    marca_a: string | null; linea_a: string | null; garantia_a: string | null;
    accesorios_a: number | null;
    precio_base_a: number | null; precio_documentos_a: number | null; precio_total_a: number | null;
    seguro_vida_a: number | null; seguro_mascota_s_a: number | null; seguro_mascota_a_a: number | null; otro_seguro_a: number | null;
    descuentos_a?: number | null;
    foto_a?: string | null;
    garantia_extendida_a?: string | number | null; // 👈 NUEVO

    // Moto B
    marca_b?: string | null; linea_b?: string | null; garantia_b?: string | null;
    accesorios_b?: number | null;
    precio_base_b?: number | null; precio_documentos_b?: number | null; precio_total_b?: number | null;
    seguro_vida_b?: number | null; seguro_mascota_s_b?: number | null; seguro_mascota_a_b?: number | null; otro_seguro_b?: number | null;
    descuentos_b?: number | null;
    foto_b?: string | null;
    garantia_extendida_b?: string | number | null; // 👈 NUEVO

    // Cliente / otros
    email: string | null;
    comentario: string | null; canal_contacto: string | null; pregunta: string | null;
    tipo_pago: string | null; cuota_inicial_a: number | null; financiera: string | null; cant_cuotas: number | null;
    fecha_creacion: string; fecha_actualizacion: string; estado: string; comentario2: string | null; asesor: string | null; prospecto: string | null;

    // Posibles campos genéricos de imagen
    product_img?: string | null;
    imagen?: string | null;
    foto?: string | null;
  };
};

// ===== Utils =====
const n = (v?: number | null) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
const has = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== "";
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

// ===== Imagenes: Base URL + helpers =====
const BaseUrl =
  (import.meta as any)?.env?.VITE_API_URL ??
  "https://tuclick.vozipcolombia.net.co/motos/back";

// Construye URL absoluta para imágenes del backend (p.e. "img_motos/archivo.jpg")
const buildAbsUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const root = String(BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

// Public URL segura (cuando el PDF se renderiza en cliente)
const publicUrl = (p: string) => {
  try {
    if (typeof window !== "undefined" && window?.location?.origin) {
      return window.location.origin + p;
    }
  } catch {}
  return p;
};

// Resuelve la mejor imagen disponible del payload para un lado
const resolveProductImgBySide = (d: QuotePayload["data"], side: "A" | "B"): string | null => {
  const key = side === "A" ? "foto_a" : "foto_b";
  const sideSpecific = (d as any)[key] as string | null | undefined;

  const candidates = [
    sideSpecific,
    d.product_img,
    d.imagen,
    d.foto,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }
  // Si no hay nada, usa placeholder local
  return publicUrl("/producto.png");
};

// ===== Styles =====
const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 32, paddingBottom: 28, fontSize: 10, color: "#111" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logo: { width: 92, height: 92, objectFit: "contain" },
  headerText: { marginLeft: 20 },
  title: { fontSize: 26, fontWeight: 700 },
  metaLine: { fontSize: 12, marginTop: 4 },
  metaBold: { fontWeight: 700 },
  hrWrap: { marginTop: 8, marginBottom: 6 },
  hr1: { height: 2, backgroundColor: "#111" },
  hr2: { height: 1, backgroundColor: "#111", marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "stretch" },
  cell: { borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#9CA3AF", paddingVertical: 7, paddingHorizontal: 8 },
  cellR: { borderRightWidth: 1, borderRightStyle: "solid", borderRightColor: "#9CA3AF" },
  label: { fontSize: 8, fontWeight: 700, color: "#111" },
  value: { fontSize: 10, marginTop: 2 },
  twoCols: { flexDirection: "row", gap: 18, marginTop: 12 },
  col: { flex: 1 },
  lineItem: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#9CA3AF", paddingVertical: 6 },
  lineLabel: { fontSize: 10 },
  lineValue: { fontSize: 10, fontWeight: 700 },
  legal: { marginTop: 12, fontSize: 8, lineHeight: 1.35, textAlign: "justify" },
  footer: { marginTop: 14, fontSize: 8, color: "#374151" },
  signatureLine: { marginTop: 18, width: 220, height: 0, borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#111" },

  // Página 2
  page2Header: { borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#111", paddingBottom: 8, marginBottom: 12, alignItems: "center" },

  // Imagen producto (cuadro centrado)
  productBox: {
    marginTop: 8,
    marginBottom: 10,
    width: "100%",
    height: 150,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#9CA3AF",
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  productPlaceholderText: { marginTop: 6, color: "#1E40AF", fontSize: 10, textAlign: "center" },
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

// Icono de moto para PDF (placeholder)
const BikeIconPDF: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Rect x="6" y="38" width="14" height="14" rx="7" fill={color} />
    <Rect x="44" y="38" width="14" height="14" rx="7" fill={color} />
    <Rect x="18" y="28" width="20" height="4" fill={color} />
    <Rect x="36" y="24" width="4" height="12" fill={color} />
    <Rect x="32" y="30" width="18" height="4" fill={color} />
  </Svg>
);

// Componente de Imagen con Fallback para PDF
const ProductImgBox: React.FC<{ src?: string | null; alt?: string }> = ({ src }) => {
  return (
    <View style={styles.productBox}>
      {src ? (
        <Image src={src} style={styles.productImg} />
      ) : (
        <View style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BikeIconPDF size={56} color="#9CA3AF" />
          <Text style={styles.productPlaceholderText}>Aquí va la imagen de la moto</Text>
        </View>
      )}
    </View>
  );
};

// ===== Modelo de datos por moto =====
type MotoCalc = {
  label: string;               // "Opción 1" / "Opción 2"
  marca: string;
  linea: string;
  garantia: string;
  garantiaExtMeses?: number | null; // 👈 NUEVO
  base: number;
  documentos: number;
  accesorios: number;
  seguros: number;
  total: number;
  imgUrl: string | null;
};

const buildMoto = (d: QuotePayload["data"], side: "A" | "B"): MotoCalc | null => {
  const sx = side.toLowerCase() as "a" | "b";

  const marca = (d as any)[`marca_${sx}`] ?? null;
  const linea = (d as any)[`linea_${sx}`] ?? null;

  // Si no hay marca/linea ni precios, no devolvemos la moto
  const hasCore =
    has(marca) || has(linea) || has((d as any)[`precio_base_${sx}`]) || has((d as any)[`precio_total_${sx}`]);
  if (!hasCore) return null;

  const garantia = ((d as any)[`garantia_${sx}`] ?? "—") as string;

  // Garantía extendida (meses)
  const geRaw = (d as any)[`garantia_extendida_${sx}`];
  const garantiaExtMeses = (() => {
    const num = Number(geRaw);
    return Number.isFinite(num) && num > 0 ? num : null;
  })();

  const base = n((d as any)[`precio_base_${sx}`]);
  const documentos = n((d as any)[`precio_documentos_${sx}`]);
  const accesorios = n((d as any)[`accesorios_${sx}`]);
  const seguros =
    n((d as any)[`seguro_vida_${sx}`]) +
    n((d as any)[`seguro_mascota_s_${sx}`]) +
    n((d as any)[`seguro_mascota_a_${sx}`]) +
    n((d as any)[`otro_seguro_${sx}`]);

  const total =
    n((d as any)[`precio_total_${sx}`]) ||
    (base + documentos + accesorios + seguros);

  const imgUrl = resolveProductImgBySide(d, side);

  return {
    label: side === "A" ? "Opción 1" : "Opción 2",
    marca: String(marca ?? ""),
    linea: String(linea ?? ""),
    garantia: String(garantia ?? "—"),
    garantiaExtMeses,
    base,
    documentos,
    accesorios,
    seguros,
    total,
    imgUrl,
  };
};

// Barra apilada simple (SVG) según distribución
const DistribucionCostos: React.FC<{ base: number; documentos: number; accesorios: number; seguros: number; total: number; }> = ({
  base, documentos, accesorios, seguros, total
}) => {
  const items = [
    { k: "Precio base", v: base, color: "#1f77b4" },
    { k: "Documentos", v: documentos, color: "#ff7f0e" },
    { k: "Accesorios", v: accesorios, color: "#2ca02c" },
    ...(seguros > 0 ? [{ k: "Seguros", v: seguros, color: "#d62728" } as const] : []),
  ];
  const sum = items.reduce((a, b) => a + b.v, 0) || 1;

  return (
    <View style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#9CA3AF", padding: 6 }}>
      <Svg width="100%" height="24">
        <Rect x={0} y={0} width="100%" height={24} fill="#fff" />
        {(() => {
          let accX = 0;
          return items.map((item, idx) => {
            const w = (item.v / sum) * 500; // escala horizontal
            const r = <Rect key={idx} x={accX} y={0} width={w} height={24} fill={item.color} />;
            accX += w;
            return r;
          });
        })()}
      </Svg>
      {items.map((dd, i) => (
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
  );
};

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

  // Motos calculadas
  const motoA = buildMoto(d, "A");
  const motoB = buildMoto(d, "B");

  const cliente = `${d.name} ${d.s_name} ${d.last_name} ${d.s_last_name}`.replace(/\s+/g, " ").trim();
  const fecha = fmtDate(d.fecha_creacion) || missing("26/08/2025");
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "Feria de la Movilidad";
  const asesor = d.asesor || missing("Asesor");

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

        {/* Producto(s) */}
        <Text style={styles.sectionTitle}>Producto</Text>
        <View style={styles.hr2} />

        {/* Moto A si existe */}
        {motoA && (
          <>
            <Row2
              l1="Marca / Línea"
              v1={`${motoA.marca} ${motoA.linea}`.trim() || missing("Yamaha FZ 250 – 2025")}
              l2="Garantía"
              v2={motoA.garantia || missing("Sí")}
            />
            {/* 👇 NUEVO: fila de Garantía extendida */}
            <Row2
              l1="Garantía extendida"
              v1={motoA.garantiaExtMeses ? `${motoA.garantiaExtMeses} meses` : "—"}
              l2=" "
              v2=" "
            />

            {/* Imagen A */}
            <ProductImgBox src={motoA.imgUrl} />

            {/* Valores + gráfica A */}
            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Valores ({motoA.label})</Text>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(motoA.base) || missing("$—")}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(motoA.documentos)}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(motoA.accesorios)}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(motoA.seguros)}</Text></View>
                <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(motoA.total)}</Text></View>
              </View>

              <View style={styles.col}>
                <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Distribución de costos ({motoA.label})</Text>
                <DistribucionCostos
                  base={motoA.base}
                  documentos={motoA.documentos}
                  accesorios={motoA.accesorios}
                  seguros={motoA.seguros}
                  total={motoA.total}
                />
              </View>
            </View>
          </>
        )}

        {/* Separador si hay dos */}
        {motoA && motoB && <View style={{ marginTop: 12 }}><View style={styles.hr2} /></View>}

        {/* Moto B si existe */}
        {motoB && (
          <>
            <Row2
              l1="Marca / Línea"
              v1={`${motoB.marca} ${motoB.linea}`.trim() || missing("Yamaha FZ 250 – 2025")}
              l2="Garantía"
              v2={motoB.garantia || missing("Sí")}
            />
            {/* 👇 NUEVO: fila de Garantía extendida */}
            <Row2
              l1="Garantía extendida"
              v1={motoB.garantiaExtMeses ? `${motoB.garantiaExtMeses} meses` : "—"}
              l2=" "
              v2=" "
            />

            {/* Imagen B */}
            <ProductImgBox src={motoB.imgUrl} />

            {/* Valores + gráfica B */}
            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Valores ({motoB.label})</Text>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(motoB.base) || missing("$—")}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(motoB.documentos)}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(motoB.accesorios)}</Text></View>
                <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(motoB.seguros)}</Text></View>
                <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(motoB.total)}</Text></View>
              </View>

              <View style={styles.col}>
                <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Distribución de costos ({motoB.label})</Text>
                <DistribucionCostos
                  base={motoB.base}
                  documentos={motoB.documentos}
                  accesorios={motoB.accesorios}
                  seguros={motoB.seguros}
                  total={motoB.total}
                />
              </View>
            </View>
          </>
        )}

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

        {/* Opción 1 (Moto A) */}
        {motoA && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
              {motoA.label} {`${motoA.marca} ${motoA.linea}`.trim() || "—"}
            </Text>
            <View style={styles.hr2} />
            <View style={{ marginTop: 6 }}>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Garantía</Text><Text style={styles.lineValue}>{motoA.garantia}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Garantía extendida</Text><Text style={styles.lineValue}>{motoA.garantiaExtMeses ? `${motoA.garantiaExtMeses} meses` : "—"}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(motoA.base)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(motoA.documentos)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(motoA.accesorios)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(motoA.seguros)}</Text></View>
              <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(motoA.total)}</Text></View>
            </View>
          </>
        )}

        {/* Opción 2 (Moto B) */}
        {motoB && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
              {motoB.label} {`${motoB.marca} ${motoB.linea}`.trim() || "—"}
            </Text>
            <View style={styles.hr2} />
            <View style={{ marginTop: 6 }}>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Garantía</Text><Text style={styles.lineValue}>{motoB.garantia}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Garantía extendida</Text><Text style={styles.lineValue}>{motoB.garantiaExtMeses ? `${motoB.garantiaExtMeses} meses` : "—"}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Precio público</Text><Text style={styles.lineValue}>{fmtCOP(motoB.base)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Documentos</Text><Text style={styles.lineValue}>{fmtCOP(motoB.documentos)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Accesorios</Text><Text style={styles.lineValue}>{fmtCOP(motoB.accesorios)}</Text></View>
              <View style={styles.lineItem}><Text style={styles.lineLabel}>Seguros</Text><Text style={styles.lineValue}>{fmtCOP(motoB.seguros)}</Text></View>
              <View style={styles.lineItem}><Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Total</Text><Text style={styles.lineValue}>{fmtCOP(motoB.total)}</Text></View>
            </View>
          </>
        )}

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
