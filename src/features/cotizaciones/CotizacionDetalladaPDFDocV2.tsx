// src/pages/CotizacionDetalladaPDFDocV2.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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

export type EmpresaInfo = {
  nombre?: string;
  ciudad?: string;
  almacen?: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
};

type PropsV2 = {
  cotizacion: CotizacionApi;      // JSON completo (una sola moto)
  garantiaExt?: GarantiaExtApi;   // JSON garantía (opcional)
  logoUrl?: string;
  empresa?: EmpresaInfo;

  // URL ya resuelta de la foto de la moto (opcional)
  motoFotoUrl?: string;
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
    marginLeft: 6,
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

  /* ---- MOTO CARD ---- */
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

/* ====== helpers de imagen ====== */

const BaseUrl =
  (import.meta as any)?.env?.VITE_API_URL ??
  "http://tuclick.vozipcolombia.net.co/motos/back";

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
  } catch {}
  return p;
};

/**
 * Foto de la moto:
 *  - Primero `motoFotoUrl` (prop)
 *  - Luego campos del backend: foto / foto_a / product_img / imagen / foto
 *  - Luego placeholder /producto.png
 */
const resolveMotoImg = (d: any, override?: string): string | null => {
  if (override) return override;

  const candidates = [
    d?.foto,      // nuevo campo genérico
    d?.foto_a,    // fallback si backend aún usa *_a
    d?.product_img,
    d?.imagen,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = buildAbsUrl(c);
    if (abs) return abs;
  }

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
   Componente principal PDF v2
   SOLO UNA MOTO (campos genéricos)
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

  const nombreCompletoCliente = [
    d.name,
    d.s_name,
    d.last_name,
    d.s_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  // 🔹 SOLO UNA MOTO: usamos campos genéricos, con fallback a *_a
  const motoLabel = [
    d.marca ?? d.marca_a,
    d.linea ?? d.linea_a,
    d.modelo ?? d.modelo_a,
  ]
    .filter(Boolean)
    .join(" ");

  const fechaCorta = fmtDateShort(d.fecha_creacion);
  const ciudad = empresa?.ciudad || "Cali";
  const almacen = empresa?.almacen || "FERIA DE LA MOVILIDAD";

  // Imagen de la moto (una sola)
  const motoImg = resolveMotoImg(d, motoFotoUrl);

  // ===================== CÁLCULOS ECONÓMICOS (UNA MOTO) =====================

  const totalSinSeguros = num(d.total_sin_seguros ?? d.total_sin_seguros_a);
  const total =
    num(d.precio_total ?? d.precio_total_a) ||
    totalSinSeguros + num(d.otro_seguro ?? d.otro_seguro_a);

  const cuotaInicial = num(d.cuota_inicial ?? d.cuota_inicial_a);
  const saldoAFinanciar =
    d.saldo_financiar ??
    d.saldo_financiar_a ??
    Math.max(total - cuotaInicial, 0);

  const precioBase = d.precio_base ?? d.precio_base_a;
  const precioDocumentos = d.precio_documentos ?? d.precio_documentos_a;
  const accesorios = d.accesorios ?? d.accesorios_a;
  const otrosSeguros = d.otro_seguro ?? d.otro_seguro_a;
  const descuentos = d.descuentos ?? d.descuentos_a;
  const soat = d.soat ?? d.soat_a;
  const impuestos = d.impuestos ?? d.impuestos_a;
  const matricula = d.matricula ?? d.matricula_a;

  const runt = d.runt ?? d.runt_1;
  const licencia = d.licencia ?? d.licencia_1;
  const defensas = d.defensas ?? d.defensas_1;
  const handSavers = d.hand_savers ?? d.hand_savers_1;
  const otrosAdicionales =
    d.otros_adicionales ?? d.otros_adicionales_1;
  const totalAdicionales =
    d.total_adicionales ?? d.total_adicionales_1;

  const garantia = d.garantia ?? d.garantia_a;
  const garantiaExtMoto =
    d.garantia_extendida ?? d.garantia_extendida_a;

  // Datos de garantía extendida (JSON 2) SOLO para esta moto
  const gMoto = g?.moto ?? g?.moto_a;
  const gPlan = g?.garantia_extendida ?? g?.garantia_extendida_a;
  const gMeses = g?.meses ?? g?.meses_a;
  const gValor = g?.valor ?? g?.valor_a;

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
              {safe(d.celular)}
              {empresa?.telefono ? ` · ${empresa.telefono}` : ""}
            </Text>
          </View>
        </View>

        {/* RESUMEN GENERAL (UNA MOTO) */}
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
              Moto: {safe(motoLabel)} · Total: {fmtCOP(total)}
            </Text>
            <Text style={styles.resumenLine}>
              Cuota inicial: {fmtCOP(cuotaInicial)} · Saldo a financiar:{" "}
              {fmtCOP(saldoAFinanciar)}
            </Text>
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

        {/* 3. MOTO (ÚNICA) */}
        <SectionTitle title="3. Opción Moto" tag={safe(motoLabel)} />
        <View style={styles.motoCard}>
          <View style={styles.motoHeader}>
            <Text style={styles.motoTitle}>{safe(motoLabel)}</Text>
            <Text style={styles.motoChip}>
              Garantía: {safe(garantia, "—")} · Ext:{" "}
              {safe(garantiaExtMoto, "—")}
            </Text>
          </View>

          {/* Imagen moto */}
          {motoImg && (
            <View style={styles.motoImageWrapper}>
              <Image src={motoImg} style={styles.motoImage} />
              <Text style={styles.motoImageLabel}>
                Imagen referencia Moto
              </Text>
            </View>
          )}

          {/* Totales clave */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Total sin seguros</Text>
              <Text style={styles.value}>{fmtCOP(totalSinSeguros)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: ACCENT }]}>
                Total Moto
              </Text>
              <Text style={[styles.value, { fontWeight: "bold" }]}>
                {fmtCOP(total)}
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
              ["Precio público", precioBase, "Valor base de la moto"],
              ["Documentos", precioDocumentos, "Trámites de documentos"],
              ["Accesorios", accesorios, "Accesorios adicionales"],
              ["Seguros", otrosSeguros, safe(d.seguros ?? d.seguros_a)],
              ["Descuentos", descuentos, "Descuento aplicado"],
              ["SOAT", soat, ""],
              ["Impuestos", impuestos, ""],
              ["Matrícula", matricula, ""],
              ["RUNT", runt, ""],
              ["Licencia", licencia, ""],
              ["Defensas", defensas, ""],
              ["Hand savers", handSavers, ""],
              ["Otros adicionales", otrosAdicionales, ""],
              ["TOTAL adicionales", totalAdicionales, ""],
              ["Total sin seguros", totalSinSeguros, ""],
              ["Total", total, ""],
              [
                "Saldo a financiar",
                saldoAFinanciar,
                cuotaInicial > 0
                  ? `Total - cuota inicial (${fmtCOP(cuotaInicial)})`
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

        {/* 4. GARANTÍA EXTENDIDA (solo de esta moto, si viene) */}
        {garantiaExt && (
          <>
            <SectionTitle title="4. Garantía extendida" />
            <View style={styles.box}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>ID garantía</Text>
                  <Text style={styles.value}>{safe(g.id)}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Cotización ID</Text>
                  <Text style={styles.value}>{safe(g.cotizacion_id)}</Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableCellHeader}>Moto</Text>
                  <Text style={styles.tableCellHeader}>Plan</Text>
                  <Text style={styles.tableCellHeader}>Meses</Text>
                  <Text
                    style={[styles.tableCellHeader, styles.tableCellLast]}
                  >
                    Valor
                  </Text>
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

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Cliente (garantía)</Text>
                  <Text style={styles.value}>{safe(g.cliente_nombre)}</Text>
                  <Text style={styles.value}>
                    Cédula: {safe(g.cliente_cedula)} · Cel:{" "}
                    {safe(g.cliente_celular)}
                  </Text>
                  <Text style={styles.value}>
                    Email: {safe(g.cliente_email)}
                  </Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Fechas</Text>
                  <Text style={styles.value}>
                    Fecha: {fmtDateTime(g.fecha)}
                  </Text>
                  <Text style={styles.value}>
                    Creado: {fmtDateTime(g.creado_en)}
                  </Text>
                  <Text style={styles.value}>
                    Actualizado: {fmtDateTime(g.actualizado_en)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* 5. BENEFICIOS / OBSERVACIONES / COPIA */}
        <SectionTitle title="5. Beneficios y observaciones" />
        <View style={styles.boxSoft}>
          <InfoRowPDF
            label="Beneficios"
            value={safe(d.beneficios ?? "", "—")}
            colSpan={2}
          />
        </View>

        <View style={styles.boxSoft}>
          <InfoRowPDF
            label="Observaciones"
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

        {/* 6. HABEAS DATA Y FIRMAS */}
        <SectionTitle title="6. Autorización de habeas data y firmas" />
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
            la Ley 1581 de 2012.
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
