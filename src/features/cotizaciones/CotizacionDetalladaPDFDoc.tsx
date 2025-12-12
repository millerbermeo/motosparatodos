// src/pages/CotizacionDetalladaPDFDoc.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";


const formatSeguros = (raw: any): string => {
  if (!raw) return "—";

  // Si ya es un texto simple sin JSON, lo devolvemos tal cual
  if (typeof raw === "string" && !raw.includes("[")) {
    return raw.trim();
  }

  try {
    let data: any = raw;

    // Si viene como string con texto + JSON, extraemos la parte del JSON
    if (typeof raw === "string") {
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        const jsonPart = raw.slice(start, end + 1);
        data = JSON.parse(jsonPart);
      } else {
        // Intenta parsear todo el string
        data = JSON.parse(raw);
      }
    }

    if (!Array.isArray(data)) {
      return String(raw);
    }

    // Tomamos solo los seguros "activos" (valor = 1, true, etc.)
    const nombres = data
      .filter(
        (item) =>
          item &&
          (item.valor === 1 ||
            item.valor === true ||
            item.seleccionado === true)
      )
      .map((item) => item.nombre)
      .filter(Boolean);

    // Si no hay nombres válidos, devolvemos guion largo
    if (!nombres.length) return "—";

    // "Otros seguros - Seguro X - Seguro Y"
    return nombres.join(" - ");
  } catch {
    // En caso de error de parseo, devolvemos la parte de texto antes del JSON
    if (typeof raw === "string") {
      return raw.split("[")[0].trim();
    }
    return String(raw);
  }
};


/* ============================
   Tipos de los payloads
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
  cotizacion: CotizacionApi;      // JSON 1 completo
  garantiaExt?: GarantiaExtApi;   // JSON 2 completo (opcional)
  logoUrl?: string;
  empresa?: EmpresaInfo;

  // URLs ya resueltas de las fotos de las motos (opcionales)
  motoFotoAUrl?: string;
  motoFotoBUrl?: string;
};

/* ============================
   Helpers
   ============================ */

const ACCENT = "#0f766e"; // verde teal
const ACCENT_LIGHT = "#ecfdf5"; // verde muy claro
const GRAY_BG = "#f3f4f6";
const BORDER = "#d1d5db";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  /* ---- HEADER ---- */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 12,
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
  logo: {
    width: 100,
    height: 50,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9.5,
    marginBottom: 2,
    color: "#4b5563",
  },

  /* ---- ENCABEZADO COTIZACIÓN ---- */
  encabezadoCotizacion: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GRAY_BG,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  encabezadoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  encabezadoLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111827",
    width: 90,
  },
  encabezadoValue: {
    fontSize: 9.5,
    color: "#111827",
  },

  /* ---- SECTION TITLES ---- */
  sectionTitleWrapper: {
    backgroundColor: GRAY_BG,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 18,
    marginBottom: 8,
    flexDirection: "row",
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitleTag: {
    fontSize: 9,
    color: "#6b7280",
  },

  /* ---- BASIC BLOCKS ---- */
  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
    marginTop: 2,
  },
  boxSoft: {
    borderRadius: 5,
    backgroundColor: GRAY_BG,
    padding: 10,
    marginBottom: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  col: {
    flex: 1,
    paddingRight: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 1,
    fontSize: 9.5,
  },
  value: {
    fontSize: 9.5,
    color: "#111827",
  },

  /* ---- TABLES ---- */
  table: {
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: ACCENT_LIGHT,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellHeader: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 9,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    color: "#064e3b",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 8.8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellLast: {
    borderRightWidth: 0,
  },

  /* ---- RESUMEN ---- */
  resumenWrapper: {
    flexDirection: "row",
    borderRadius: 7,
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 18,
    marginTop: 4,
  },
  resumenCol: {
    flex: 1,
    paddingRight: 10,
  },
  resumenHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 4,
  },
  resumenLine: {
    fontSize: 9,
    color: "#064e3b",
    marginBottom: 3,
  },

  /* ---- MOTO CARDS ---- */
  motoCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    marginBottom: 18,
    marginTop: 2,
  },
  motoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  motoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  motoChip: {
    fontSize: 9,
    color: "#374151",
  },
  motoImageWrapper: {
    marginTop: 8,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 6,
    backgroundColor: "#f9fafb",
  },
  motoImage: {
    width: 210,
    height: 125,
    objectFit: "contain",
  },
  motoImageLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 3,
  },

  /* ---- COPIA COTIZACIÓN / HABEAS / FIRMAS ---- */
  copiaWrapper: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  copiaTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },
  habeasTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 4,
    color: "#111827",
  },
  habeasText: {
    fontSize: 8.5,
    color: "#374151",
    lineHeight: 1.3,
    marginBottom: 4,
  },
  firmaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  firmaBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 4,
  },
  firmaLabel: {
    fontSize: 9,
    color: "#111827",
  },

  /* ---- FOOTER ---- */
  smallMuted: {
    fontSize: 8.5,
    color: "#6b7280",
    marginTop: 10,
    lineHeight: 1.4,
  },
  smallMutedCenter: {
    fontSize: 8.5,
    color: "#374151",
    marginTop: 6,
    textAlign: "center",
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

/* ====== helpers de imagen (igual concepto que tu otro PDF) ====== */

const BaseUrl =
  (import.meta as any)?.env?.VITE_API_URL ??
  "https://tuclick.vozipcolombia.net.co/motos/back";

const buildAbsUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const root = String(BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

const publicUrl = (p: string) => {
  try {
    if (typeof window !== "undefined" && window?.location?.origin) {
      return window.location.origin + p;
    }
  } catch { }
  return p;
};

/**
 * Devuelve la mejor URL de imagen para la moto A/B:
 * 1) override que viene por props (motoFotoAUrl / motoFotoBUrl)
 * 2) campos del backend: foto_a / foto_b, product_img, imagen, foto
 * 3) placeholder /producto.png
 */
const resolveMotoImg = (
  d: any,
  side: "A" | "B",
  override?: string
): string | null => {
  if (override) return override;

  const key = side === "A" ? "foto_a" : "foto_b";
  const sideSpecific = d?.[key];

  const candidates = [
    sideSpecific,
    d?.product_img,
    d?.imagen,
    d?.foto,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }

  // Placeholder desde /public
  return publicUrl("/producto.png");
};

/* ============ Mini componentes internos ============ */

const SectionTitle: React.FC<{ title: string; tag?: string }> = ({
  title,
  tag,
}) => (
  <View style={styles.sectionTitleWrapper}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {tag ? <Text style={styles.sectionTitleTag}>{tag}</Text> : null}
  </View>
);

const InfoRowPDF: React.FC<{
  label: string;
  value: string;
  colSpan?: 1 | 2;
}> = ({ label, value, colSpan = 1 }) => (
  <View
    style={[
      colSpan === 2
        ? { marginBottom: 6 }
        : styles.row,
    ]}
  >
    <View style={[styles.col, colSpan === 2 ? { flex: 0 } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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

  const nombreCompletoCliente = [
    d.name,
    d.s_name,
    d.last_name,
    d.s_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const motoALabel = [d.marca_a, d.linea_a, d.modelo_a]
    .filter(Boolean)
    .join(" ");
  const motoBLabel = [d.marca_b, d.linea_b, d.modelo_b]
    .filter(Boolean)
    .join(" ");

  const hayMotoB = !!d.marca_b || !!d.linea_b || !!d.precio_base_b;

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";

  // 🔹 Resolver URLs reales de las imágenes de las motos
  const motoImgA = resolveMotoImg(d, "A", motoFotoAUrl);
  const motoImgB = hayMotoB ? resolveMotoImg(d, "B", motoFotoBUrl) : null;

  // ===================== CÁLCULOS ECONÓMICOS (A / B) =====================

  // Moto A
  const totalSinSegurosA = num(d.total_sin_seguros_a);
  const totalA =
    num(d.precio_total_a) || totalSinSegurosA + num(d.otro_seguro_a);
  const cuotaInicialA = num(d.cuota_inicial_a);
  const saldoAFinanciarA = Math.max(totalA - cuotaInicialA, 0);

  // Moto B
  const totalSinSegurosB = num(d.total_sin_seguros_b);
  const totalB =
    num(d.precio_total_b) || totalSinSegurosB + num(d.otro_seguro_b);
  const cuotaInicialB = num(d.cuota_inicial_b);
  const saldoAFinanciarB = Math.max(totalB - cuotaInicialB, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <Text style={styles.title}>Cotización #{safe(d.id, "")}</Text>
            <Text style={styles.subtitle}>
              Fecha de creación: {fmtDateTime(d.fecha_creacion)}
            </Text>
            <Text style={styles.subtitle}>
              Última actualización: {fmtDateTime(d.fecha_actualizacion)}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>
              Estado: {safe(d.estado, "Sin estado")}
            </Text>
            {empresa?.nombre && (
              <Text style={styles.subtitle}>{empresa.nombre}</Text>
            )}
            {empresa?.almacen && (
              <Text style={styles.subtitle}>{empresa.almacen}</Text>
            )}
            {empresa?.ciudad && (
              <Text style={styles.subtitle}>{empresa.ciudad}</Text>
            )}
            {empresa?.nit && (
              <Text style={styles.subtitle}>NIT: {empresa.nit}</Text>
            )}
            {empresa?.telefono && (
              <Text style={styles.subtitle}>Tel: {empresa.telefono}</Text>
            )}
            {empresa?.direccion && (
              <Text style={styles.subtitle}>{empresa.direccion}</Text>
            )}
          </View>
        </View>

        {/* ENCABEZADO TIPO FORMATO */}
        <View style={styles.encabezadoCotizacion}>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Cotización</Text>
            <Text style={styles.encabezadoValue}>#{safe(d.id, "")}</Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Fecha</Text>
            <Text style={styles.encabezadoValue}>{fechaCorta}</Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Ciudad</Text>
            <Text style={styles.encabezadoValue}>{ciudad}</Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Almacén</Text>
            <Text style={styles.encabezadoValue}>{almacen}</Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>A nombre de</Text>
            <Text style={styles.encabezadoValue}>
              {safe(nombreCompletoCliente)}
            </Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Atendido por</Text>
            <Text style={styles.encabezadoValue}>{safe(d.asesor)}</Text>
          </View>
          <View style={styles.encabezadoRow}>
            <Text style={styles.encabezadoLabel}>Teléfonos</Text>
            <Text style={styles.encabezadoValue}>
              {safe(d.celular)}{empresa?.telefono ? ` · ${empresa.telefono}` : ""}
            </Text>
          </View>
        </View>

        {/* RESUMEN GENERAL */}
        <View style={styles.resumenWrapper}>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Resumen cliente</Text>
            <Text style={styles.resumenLine}>
              Cliente: {safe(nombreCompletoCliente)}
            </Text>
            <Text style={styles.resumenLine}>Cédula: {safe(d.cedula)}</Text>
            <Text style={styles.resumenLine}>
              Celular: {safe(d.celular)} · Email: {safe(d.email)}
            </Text>
            <Text style={styles.resumenLine}>
              Canal de contacto: {safe(d.canal_contacto)}
            </Text>
          </View>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenHeader}>Resumen económico</Text>
            <Text style={styles.resumenLine}>
              Moto A: {safe(motoALabel)} · Total: {fmtCOP(totalA)}
            </Text>
            {hayMotoB && (
              <Text style={styles.resumenLine}>
                Moto B: {safe(motoBLabel)} · Total: {fmtCOP(totalB)}
              </Text>
            )}
            <Text style={styles.resumenLine}>
              Tipo de pago: {safe(d.tipo_pago || d.metodo_pago)}
            </Text>
            <Text style={styles.resumenLine}>
              Prospecto: {safe(d.prospecto)} · Asesor: {safe(d.asesor)}
            </Text>
          </View>
        </View>

        {/* 1. CLIENTE */}
        <SectionTitle title="1. Información del cliente" />
        <View style={styles.box}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nombre completo</Text>
              <Text style={styles.value}>{safe(nombreCompletoCliente)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Cédula</Text>
              <Text style={styles.value}>{safe(d.cedula)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Celular</Text>
              <Text style={styles.value}>{safe(d.celular)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Text style={styles.value}>{safe(d.email)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Fecha de nacimiento</Text>
              <Text style={styles.value}>{safe(d.fecha_nacimiento)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Canal de contacto</Text>
              <Text style={styles.value}>{safe(d.canal_contacto)}</Text>
            </View>
          </View>
        </View>

        {/* Necesidad / Comentarios lado a lado */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Necesidad / Motivo de compra</Text>
            <Text style={styles.value}>{safe(d.pregunta)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Comentarios</Text>
            <Text style={styles.value}>{safe(d.comentario)}</Text>
          </View>
        </View>

        {/* 2. COMERCIAL */}
        <SectionTitle title="2. Información comercial" />
        <View style={styles.boxSoft}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Asesor</Text>
              <Text style={styles.value}>{safe(d.asesor)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Tipo de pago</Text>
              <Text style={styles.value}>
                {safe(d.tipo_pago || d.metodo_pago)}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Prospecto</Text>
              <Text style={styles.value}>{safe(d.prospecto)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Financiera</Text>
              <Text style={styles.value}>{safe(d.financiera)}</Text>
            </View>
          </View>
        </View>

        {/* 3. MOTO A */}
        <SectionTitle title="3. Opción Moto A" tag={safe(motoALabel)} />
        <View style={styles.motoCard}>
          <View style={styles.motoHeader}>
            <Text style={styles.motoTitle}>{safe(motoALabel)}</Text>
            <Text style={styles.motoChip}>
              Garantía: {safe(d.garantia_a, "—")} · Ext:{" "}
              {safe(d.garantia_extendida_a, "—")}
            </Text>
          </View>

          {/* Imagen moto A */}
          {motoImgA && (
            <View style={styles.motoImageWrapper}>
              <Image src={motoImgA} style={styles.motoImage} />
              <Text style={styles.motoImageLabel}>
                Imagen referencia Moto A
              </Text>
            </View>
          )}

          {/* Totales clave */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Total sin seguros</Text>
              <Text style={styles.value}>{fmtCOP(totalSinSegurosA)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: ACCENT }]}>Total Moto A</Text>
              <Text style={[styles.value, { fontWeight: "bold" }]}>
                {fmtCOP(totalA)}
              </Text>
            </View>
          </View>

          {/* Tabla de conceptos */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableCellHeader}>Concepto</Text>
              <Text style={styles.tableCellHeader}>Valor</Text>
              <Text style={[styles.tableCellHeader, styles.tableCellLast]}>
                Detalle
              </Text>
            </View>

            {[
              ["Precio público", d.precio_base_a, "Valor base de la moto"],
              ["Documentos", d.precio_documentos_a, "Trámites de documentos"],
              ["Accesorios", d.accesorios_a, "Accesorios adicionales"],
              ["Seguros", d.otro_seguro_a, formatSeguros(d.seguros_a)],
              ["Descuentos", d.descuentos_a, "Descuento aplicado"],
              ["SOAT", d.soat_a, ""],
              ["Impuestos", d.impuestos_a, ""],
              ["Matrícula", d.matricula_a, ""],
              ["RUNT", d.runt_1, ""],
              ["Licencia", d.licencia_1, ""],
              ["Defensas", d.defensas_1, ""],
              ["Hand savers", d.hand_savers_1, ""],
              ["Otros adicionales", d.otros_adicionales_1, ""],
              ["TOTAL adicionales", d.total_adicionales_1, ""],
              ["Total sin seguros", totalSinSegurosA, ""],
              ["Total", totalA, ""],
              [
                "Saldo a financiar",
                saldoAFinanciarA,
                cuotaInicialA > 0
                  ? `Total - cuota inicial (${fmtCOP(cuotaInicialA)})`
                  : "Total (incluye seguros)",
              ],
            ].map(([label, val, detail], idx) => (
              <View style={styles.tableRow} key={String(label) + idx}>
                <Text style={styles.tableCell}>{label}</Text>
                <Text style={styles.tableCell}>{fmtCOP(val)}</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>
                  {detail as string}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. MOTO B (si existe) */}
        {hayMotoB && (
          <>
            <SectionTitle title="4. Opción Moto B" tag={safe(motoBLabel)} />
            <View style={styles.motoCard}>
              <View style={styles.motoHeader}>
                <Text style={styles.motoTitle}>{safe(motoBLabel)}</Text>
                <Text style={styles.motoChip}>
                  Garantía: {safe(d.garantia_b, "—")} · Ext:{" "}
                  {safe(d.garantia_extendida_b, "—")}
                </Text>
              </View>

              {/* Imagen moto B */}
              {motoImgB && (
                <View style={styles.motoImageWrapper}>
                  <Image src={motoImgB} style={styles.motoImage} />
                  <Text style={styles.motoImageLabel}>
                    Imagen referencia Moto B
                  </Text>
                </View>
              )}

              {/* Totales clave */}
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Total sin seguros</Text>
                  <Text style={styles.value}>
                    {fmtCOP(totalSinSegurosB)}
                  </Text>
                </View>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: ACCENT }]}>
                    Total Moto B
                  </Text>
                  <Text style={[styles.value, { fontWeight: "bold" }]}>
                    {fmtCOP(totalB)}
                  </Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableCellHeader}>Concepto</Text>
                  <Text style={styles.tableCellHeader}>Valor</Text>
                  <Text style={[styles.tableCellHeader, styles.tableCellLast]}>
                    Detalle
                  </Text>
                </View>

                {[
                  ["Precio público", d.precio_base_b, ""],
                  ["Documentos", d.precio_documentos_b, ""],
                  ["Accesorios", d.accesorios_b, ""],
                  ["Seguros", d.otro_seguro_b, formatSeguros(d.seguros_b)],
                  ["Descuentos", d.descuentos_b, ""],
                  ["SOAT", d.soat_b, ""],
                  ["Impuestos", d.impuestos_b, ""],
                  ["Matrícula", d.matricula_b, ""],
                  ["RUNT", d.runt_2, ""],
                  ["Licencia", d.licencia_2, ""],
                  ["Defensas", d.defensas_2, ""],
                  ["Hand savers", d.hand_savers_2, ""],
                  ["Otros adicionales", d.otros_adicionales_2, ""],
                  ["TOTAL adicionales", d.total_adicionales_2, ""],
                  ["Total sin seguros", totalSinSegurosB, ""],
                  ["Total", totalB, ""],
                  [
                    "Saldo a financiar",
                    saldoAFinanciarB,
                    cuotaInicialB > 0
                      ? `Total - cuota inicial (${fmtCOP(cuotaInicialB)})`
                      : "Total (incluye seguros)",
                  ],
                ].map(([label, val, detail], idx) => (
                  <View style={styles.tableRow} key={String(label) + idx}>
                    <Text style={styles.tableCell}>{label}</Text>
                    <Text style={styles.tableCell}>{fmtCOP(val)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellLast]}>
                      {detail as string}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* 5. GARANTÍA EXTENDIDA */}
        <SectionTitle title="5. Garantía extendida" />
        <View style={styles.box}>
          {/* <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>ID garantía</Text>
              <Text style={styles.value}>{safe(g.id)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Cotización ID</Text>
              <Text style={styles.value}>{safe(g.cotizacion_id)}</Text>
            </View>
          </View> */}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableCellHeader}>Moto</Text>
              <Text style={styles.tableCellHeader}>Plan</Text>
              <Text style={styles.tableCellHeader}>Meses</Text>
              <Text style={[styles.tableCellHeader, styles.tableCellLast]}>
                Valor
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{safe(g.moto_a)}</Text>
              <Text style={styles.tableCell}>{safe(g.garantia_extendida_a)}</Text>
              <Text style={styles.tableCell}>{safe(g.meses_a)}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}>
                {fmtCOP(g.valor_a)}
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{safe(g.moto_b)}</Text>
              <Text style={styles.tableCell}>{safe(g.garantia_extendida_b)}</Text>
              <Text style={styles.tableCell}>{safe(g.meses_b)}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}>
                {g.valor_b != null ? fmtCOP(g.valor_b) : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Cliente (garantía)</Text>
              <Text style={styles.value}>{safe(g.cliente_nombre)}</Text>
              <Text style={styles.value}>
                Cédula: {safe(g.cliente_cedula)} · Cel: {safe(g.cliente_celular)}
              </Text>
              <Text style={styles.value}>Email: {safe(g.cliente_email)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Fechas</Text>
              <Text style={styles.value}>Fecha: {fmtDateTime(g.fecha)}</Text>
              <Text style={styles.value}>
                Creado: {fmtDateTime(g.creado_en)}
              </Text>
              <Text style={styles.value}>
                Actualizado: {fmtDateTime(g.actualizado_en)}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. BENEFICIOS / OBSERVACIONES / COPIA */}
        <SectionTitle title="6. Beneficios y observaciones" />
        {/* <View style={styles.boxSoft}>
          <InfoRowPDF
            label="Beneficios"
            value={safe(d.beneficios ?? "", "—")}
            colSpan={2}
          />
        </View> */}

        <View style={styles.boxSoft}>
          <InfoRowPDF
            label=""
            value={safe(d.comentario2 ?? d.comentario ?? "", "—")}
            colSpan={2}
          />
        </View>

        <View style={styles.copiaWrapper}>
          <Text style={styles.copiaTitle}>Copia de cotización</Text>
          <Text style={styles.value}>
            Fecha: {fechaCorta} · Ciudad: {ciudad} · Almacén: {almacen}
          </Text>
          <Text style={styles.value}>
            A nombre de: {safe(nombreCompletoCliente)} · Atendido por:{" "}
            {safe(d.asesor)}
          </Text>
          <Text style={styles.value}>
            Teléfonos: {safe(d.celular)}
            {empresa?.telefono ? ` · ${empresa.telefono}` : ""}
          </Text>
        </View>

        {/* 7. HABEAS DATA Y FIRMAS */}
        <SectionTitle title="7. Autorización de habeas data y firmas" />
        <View style={styles.box}>
          <Text style={styles.habeasTitle}>
            Autorización de habeas data:
          </Text>
          <Text style={styles.habeasText}>
            Con la firma del presente documento y con el suministro libre,
            espontáneo y voluntario de sus datos generales de comunicación,
            entiéndase: nombre completo, cédula de ciudadanía, correo
            electrónico, número de dispositivo móvil, número de teléfono fijo,
            whatsapp y todos aquellos que sean utilizados por redes sociales; se
            entenderá que la empresa queda autorizada para el uso de los datos a
            fin de suministrar, a través de documentos digitales y/o en físico
            la información comercial y de venta al consumidor de la siguiente
          </Text>
          <Text style={styles.habeasText}>
            También quedan facultadas la empresa y el consumidor para: a)
            Conocer, actualizar y rectificar en cualquier momento los datos
            personales; b) Solicitar prueba de la autorización otorgada; c) Ser
            informado, previa solicitud, respecto del uso que se ha dado a los
            datos personales; d) Presentar ante la Superintendencia de Industria
            y Comercio quejas por infracciones de conformidad con la ley; e)
            Revocar y suspender la autorización y/o solicitar la supresión de un
            dato cuando en el tratamiento no se respeten las normas; f) Acceder
            en forma gratuita a los datos personales que hayan sido objeto de
            tratamiento, y en general todas aquellas facultades consagradas en
            la Ley 1581 de 2012. Para conocer más detalles de nuestra política
            de tratamiento y protección de datos personales, consulte nuestro
            manual de tratamiento en www.tuclickmotos.com
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

        {/* PIE TEXTOS LEGALES Y SLOGAN */}
        <Text style={styles.smallMuted}>
          Todos los precios y/o promociones publicados en este documento están
          sujetos a cambio sin previo aviso o hasta agotar existencias. La
          motocicleta se entrega con kit de herramienta básico. La información
          suministrada será tratada acorde a lo estipulado por la Ley 1581 de
          2012.
        </Text>
        <Text style={styles.smallMutedCenter}>
          MOTO PARA TODOS S.A.S - Hacemos tu sueño realidad
        </Text>
      </Page>
    </Document>
  );
};
