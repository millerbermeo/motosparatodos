import React, { Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCredito, useDeudor } from "../../../services/creditosServices";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ================= Utils =================
const fmtCOP = (v?: number | null) => {
  if (v === undefined || v === null || Number.isNaN(v)) return "$0";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${v}`;
  }
};

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    // Soporta "YYYY-MM-DD" y "YYYY-MM-DD HH:mm:ss"
    const norm = d.replace(" ", "T");
    const dt = new Date(norm);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d;
  }
};

const calcEdad = (fecha?: string | null) => {
  if (!fecha) return "—";
  const dt = new Date(fecha);
  if (Number.isNaN(dt.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - dt.getFullYear();
  const m = today.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dt.getDate())) age--;
  return `${Math.max(0, age)}`;
};

// ================= Styles mejorados =================
const ACCENT = "#0f766e";
const ACCENT_LIGHT = "#ecfdf5";
const GRAY_BG = "#f3f4f6";
const BORDER = "#d1d5db";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 28,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
  },
  logo: { width: 80, height: 80, objectFit: "contain" },
  headerText: { marginLeft: 16, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 700, color: ACCENT },
  metaLine: { fontSize: 10, marginTop: 3, color: "#4b5563" },
  metaBold: { fontWeight: 700 },
  headerPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: ACCENT_LIGHT,
    color: "#065f46",
    fontSize: 9,
    fontWeight: 700,
  },

  // SECCIONES
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 4,
    color: "#111827",
  },
  sectionTag: {
    fontSize: 9,
    color: "#6b7280",
    marginLeft: 6,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 14,
    marginBottom: 4,
  },

  // lineas
  hrWrap: { marginTop: 4, marginBottom: 4 },
  hr1: { height: 2, backgroundColor: "#111" },
  hr2: { height: 1, backgroundColor: "#111", marginTop: 2 },

  // tarjetas / cajas
  box: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  boxSoft: {
    borderRadius: 6,
    backgroundColor: GRAY_BG,
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
  },

  row: { flexDirection: "row", alignItems: "stretch" },
  cell: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  cellR: {
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  label: { fontSize: 8, fontWeight: 700, color: "#374151" },
  value: { fontSize: 9.5, marginTop: 2, color: "#111827" },

  twoCols: { flexDirection: "row", gap: 18, marginTop: 8 },
  col: { flex: 1 },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
  },
  lineLabel: { fontSize: 9.5, color: "#374151" },
  lineValue: { fontSize: 9.5, fontWeight: 700, color: "#111827" },

  legalBlock: {
    marginTop: 10,
    fontSize: 8.5,
    lineHeight: 1.35,
    textAlign: "justify",
    color: "#374151",
  },

  signatureBox: {
    marginTop: 20,
    width: 220,
    height: 80,
    borderWidth: 1,
    borderColor: "#111",
  },
  signatureLine: {
    marginTop: 10,
    width: 220,
    height: 0,
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  signatureText: { fontSize: 10, marginTop: 4, color: "#111827" },
  signatureSub: { fontSize: 9, marginTop: 2, color: "#4b5563" },
});

// Helper de fila de dos columnas
const Row2 = ({
  l1,
  v1,
  l2,
  v2,
}: {
  l1: string;
  v1: React.ReactNode;
  l2: string;
  v2: React.ReactNode;
}) => (
  <View style={styles.row}>
    <View style={[styles.cell, styles.cellR, { flex: 1 }]}>
      <Text style={styles.label}>{l1}</Text>
      <Text style={styles.value}>{v1 ?? "—"}</Text>
    </View>
    <View style={[styles.cell, { flex: 1 }]}>
      {l2 ? <Text style={styles.label}>{l2}</Text> : null}
      {l2 ? <Text style={styles.value}>{v2 ?? "—"}</Text> : null}
    </View>
  </View>
);

// ================= Normalizadores para el JSON del ejemplo =================
function parseSegurosJSON(
  raw?: string | null
): Array<{ id: number; nombre: string; tipo: string | null; valor: number }> {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as any;
    return [];
  } catch {
    return [];
  }
}

function pickOfertaAB(data: any) {
  // Si existe "precio_base_a" o "precio_total_a", elegimos A; si no, B; si no, null
  const hasA =
    data && (data.precio_base_a != null || data.precio_total_a != null);
  const hasB =
    data && (data.precio_base_b != null || data.precio_total_b != null);
  const key = hasA ? "a" : hasB ? "b" : null;
  if (!key) return null;

  const pre = (k: string) => `${k}_${key}`;

  const segurosArr = parseSegurosJSON(data?.[pre("seguros")]);
  const segurosOtros =
    (data?.[pre("otro_seguro")] ?? 0) +
    segurosArr.reduce((acc, s) => acc + (Number(s?.valor) || 0), 0);

  const accesorios = Number(data?.[pre("accesorios")]) || 0;
  const marcacion = Number(data?.[pre("marcacion")]) || 0;
  const documentos = Number(data?.[pre("precio_documentos")]) || 0;
  const soat = Number(data?.[pre("soat")]) || 0;
  const impuestos = Number(data?.[pre("impuestos")]) || 0;
  const matricula = Number(data?.[pre("matricula")]) || 0;
  const descuento = Number(data?.[pre("descuentos")]) || 0;
  const precioVenta = Number(data?.[pre("precio_base")]) || 0;
  const garantiaExtendida =
    Number(data?.[pre("valor_garantia_extendida")]) || 0;
  const cuotaInicial = Number(data?.[pre("cuota_inicial")]) || 0;

  // Preferimos los totales que ya vienen calculados
  const precioTotal =
    data?.[pre("precio_total")] != null
      ? Number(data?.[pre("precio_total")])
      : Math.max(
          0,
          precioVenta -
            descuento +
            documentos +
            soat +
            impuestos +
            matricula +
            accesorios +
            marcacion +
            segurosOtros
        );

  const valorFinanciar = Math.max(
    0,
    precioTotal + garantiaExtendida - cuotaInicial
  );

  const producto = `${data?.[pre("marca")] ?? ""} ${
    data?.[pre("linea")] ?? ""
  }`.trim();
  const modelo = data?.[pre("modelo")] ?? "";

  return {
    key,
    producto: [producto, modelo].filter(Boolean).join(" – "),
    precioVenta,
    descuento,
    documentos,
    soat,
    impuestos,
    matricula,
    accesorios,
    marcacion,
    segurosOtros,
    precioTotal,
    garantiaExtendida,
    cuotaInicial,
    valorFinanciar,
    plazo: data?.cant_cuotas ?? data?.plazo_meses ?? null,
    cuotaMensual: null as number | null, // en el JSON vienen nulas las cuotas; dejamos en blanco
  };
}

function mapPersonaDesdeJSON(data: any, fallbackIP: any = {}) {
  // Convierte el JSON dado al shape esperado por el PDF (cuando no exista deudorData clásico)
  const nombre =
    [data?.name, data?.s_name, data?.last_name, data?.s_last_name]
      .filter(Boolean)
      .join(" ") || undefined;
  return {
    numero_documento: data?.cedula ?? fallbackIP?.numero_documento,
    lugar_expedicion: fallbackIP?.lugar_expedicion ?? "—",
    primer_nombre: undefined,
    segundo_nombre: undefined,
    primer_apellido: undefined,
    segundo_apellido: undefined,
    nombre_completo: nombre,
    edad: calcEdad(data?.fecha_nacimiento),
    direccion_residencia: fallbackIP?.direccion_residencia ?? "—",
    telefono_fijo: fallbackIP?.telefono_fijo ?? undefined,
    celular: data?.celular ?? fallbackIP?.celular,
    email: data?.email ?? fallbackIP?.email,
    estado_civil: fallbackIP?.estado_civil ?? "—",
    personas_a_cargo: fallbackIP?.personas_a_cargo ?? "—",
    finca_raiz: fallbackIP?.finca_raiz ?? "—",
    tipo_vivienda: fallbackIP?.tipo_vivienda ?? "—",
    costo_arriendo: fallbackIP?.costo_arriendo ?? 0,
    vehiculo: fallbackIP?.vehiculo ?? "—",
    placa: fallbackIP?.placa ?? "—",
    ciudad_residencia: fallbackIP?.ciudad_residencia ?? "—",
  };
}

// ================= PDF Document (clonado y acomodado al JSON) =================
export const SolicitudCreditoPDFDoc: React.FC<{
  codigo_credito: string;
  credito: any | undefined; // puede venir en forma "antigua" o como el JSON del ejemplo
  deudorData: any | undefined;
  logoUrl?: string;
}> = ({ codigo_credito, credito, deudorData, logoUrl }) => {
  // Datos personales y laborales
  const ipBase = deudorData?.informacion_personal ?? {};
  const infoLaboral = deudorData?.informacion_laboral ?? {};
  const ip =
    credito && "cedula" in (credito || {})
      ? mapPersonaDesdeJSON(credito, ipBase)
      : ipBase;
  const refs: any[] = deudorData?.referencias ?? [];

  // Info de la solicitud (como en la vista de detalle)
  const estado = credito?.estado ?? "—";
  const agencia = "Agencia";
  const fechaCreacion = fmtDate(credito?.fecha_creacion);
  const registradaPor = credito?.asesor ?? "—";

  // Info de la moto (similar a CreditoDetalle)
  const moto = {
    modelo: credito?.producto,
    numeroCuotas: credito?.plazo_meses,
    fechaPago: undefined as string | undefined,
    numeroChasis: credito?.numero_chasis,
    placa: credito?.placa,
    valorMotocicleta:
      typeof credito?.valor_producto === "number"
        ? credito?.valor_producto
        : undefined,
    cuotaInicial:
      typeof credito?.cuota_inicial === "number"
        ? credito?.cuota_inicial
        : undefined,
    valorCuota: undefined as number | undefined,
    numeroMotor: credito?.numero_motor,
    fechaEntrega: credito?.fecha_entrega,
  };

  // Detalle económico desde el JSON A/B si existe; si no, cae al esquema anterior
  const oferta = credito ? pickOfertaAB(credito) : null;

  const detalle = oferta ?? {
    producto: credito?.producto,
    precioVenta:
      typeof credito?.valor_producto === "number"
        ? credito?.valor_producto
        : undefined,
    descuento: 0,
    documentos: 0,
    impuestos: 0,
    matricula: credito?.gasto_matricula ?? 0,
    soat: credito?.soat ?? 0,
    accesorios: 0,
    marcacion: 0,
    segurosOtros: 0,
    precioTotal: credito?.valor_total,
    valorFinanciar:
      typeof credito?.valor_financiar === "number"
        ? credito?.valor_financiar
        : undefined,
    cuotaInicial:
      typeof credito?.cuota_inicial === "number"
        ? credito?.cuota_inicial
        : undefined,
    garantiaExtendida: credito?.garantia_ext ?? 0,
    plazo: credito?.plazo_meses ?? null,
    cuotaMensual: credito?.valor_cuota ?? null,
  };

  const firmaCc = ip?.numero_documento ? `CC ${ip.numero_documento}` : "";

  const fecha = fmtDate(credito?.fecha_creacion);
  const ciudad = ip?.ciudad_residencia || credito?.ciudad || "—";

  const LogoSrc =
    logoUrl || (import.meta as any)?.env?.VITE_LOGO_URL || "/moto3.png"; // usa tu CDN si lo tienes

  const nombreMostrado =
    ip?.nombre_completo ||
    `${ip?.primer_nombre ?? ""} ${ip?.segundo_nombre ?? ""} ${
      ip?.primer_apellido ?? ""
    } ${ip?.segundo_apellido ?? ""}`
      .replace(/\s+/g, " ")
      .trim() ||
    "—";

  // Render PDF
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LogoSrc} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Solicitud de crédito</Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Código:</Text>{" "}
              {codigo_credito || "—"}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Fecha:</Text> {fecha}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Ciudad:</Text> {ciudad}
            </Text>
          </View>
          <Text style={styles.headerPill}>Formulario</Text>
        </View>

        {/* Información de la solicitud */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>0. Información de la solicitud</Text>
        </View>
        <View style={styles.boxSoft}>
          <View style={styles.row}>
            <View style={[styles.cell, styles.cellR, { flex: 1 }]}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>{estado}</Text>
            </View>
            <View style={[styles.cell, { flex: 1 }]}>
              <Text style={styles.label}>Agencia</Text>
              <Text style={styles.value}>{agencia}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.cell, styles.cellR, { flex: 1 }]}>
              <Text style={styles.label}>Fecha de creación</Text>
              <Text style={styles.value}>{fechaCreacion}</Text>
            </View>
            <View style={[styles.cell, { flex: 1 }]}>
              <Text style={styles.label}>Registrada por</Text>
              <Text style={styles.value}>{registradaPor}</Text>
            </View>
          </View>
        </View>

        {/* Deudor / Información personal */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>1. Deudor / Información personal</Text>
        </View>
        <View style={styles.box}>
          <Row2
            l1="Documento de identidad"
            v1={ip?.numero_documento ?? "—"}
            l2="Lugar de expedición"
            v2={ip?.lugar_expedicion ?? "—"}
          />
          <Row2
            l1="Nombre"
            v1={nombreMostrado}
            l2="Edad"
            v2={ip?.edad ?? "—"}
          />
          <Row2
            l1="Dirección de residencia"
            v1={ip?.direccion_residencia ?? "—"}
            l2="Teléfonos"
            v2={`${
              ip?.telefono_fijo ? ip.telefono_fijo + " - " : ""
            }${ip?.celular ?? "—"}`}
          />
          <Row2
            l1="Correo electrónico"
            v1={ip?.email ?? "—"}
            l2="Estado civil"
            v2={ip?.estado_civil ?? "—"}
          />
          <Row2
            l1="Personas a cargo"
            v1={ip?.personas_a_cargo ?? "—"}
            l2="Ciudad de residencia"
            v2={ip?.ciudad_residencia ?? "—"}
          />
          <Row2
            l1="Finca raíz"
            v1={ip?.finca_raiz ?? "—"}
            l2="Tipo de vivienda"
            v2={ip?.tipo_vivienda ?? "—"}
          />
          <Row2
            l1="Valor de arriendo"
            v1={fmtCOP(Number(ip?.costo_arriendo) || 0)}
            l2="Vehículo"
            v2={ip?.vehiculo ?? "—"}
          />
          <Row2 l1="Placa" v1={ip?.placa ?? "—"} l2="" v2="" />
        </View>

        {/* Información laboral */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>2. Información laboral</Text>
        </View>
        <View style={styles.box}>
          <Row2
            l1="Empresa donde labora"
            v1={infoLaboral?.empresa ?? "—"}
            l2="Cargo"
            v2={infoLaboral?.cargo ?? "—"}
          />
          <Row2
            l1="Dirección del empleador"
            v1={infoLaboral?.direccion_empleador ?? "—"}
            l2="Teléfono del empleador"
            v2={infoLaboral?.telefono_empleador ?? "—"}
          />
          <Row2
            l1="Tipo de contrato"
            v1={infoLaboral?.tipo_contrato ?? "—"}
            l2="Tiempo de servicio"
            v2={infoLaboral?.tiempo_servicio ?? "—"}
          />
          <Row2
            l1="Salario"
            v1={fmtCOP(Number(infoLaboral?.salario) || 0)}
            l2=""
            v2=""
          />
        </View>

        {/* Información de la motocicleta */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>3. Información de la motocicleta</Text>
        </View>
        <View style={styles.box}>
          <Row2
            l1="Motocicleta"
            v1={moto.modelo ?? "—"}
            l2="Número de cuotas"
            v2={moto.numeroCuotas ?? "—"}
          />
          <Row2
            l1="Número de chasis"
            v1={moto.numeroChasis ?? "—"}
            l2="Número de motor"
            v2={moto.numeroMotor ?? "—"}
          />
          <Row2
            l1="Placa"
            v1={moto.placa ?? "—"}
            l2="Fecha de entrega"
            v2={moto.fechaEntrega ?? "—"}
          />
          <Row2
            l1="Valor de la motocicleta"
            v1={
              moto.valorMotocicleta != null
                ? fmtCOP(moto.valorMotocicleta)
                : "—"
            }
            l2="Cuota inicial"
            v2={
              moto.cuotaInicial != null ? fmtCOP(moto.cuotaInicial) : "—"
            }
          />
        </View>

        {/* Referencias */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>4. Referencias del deudor</Text>
        </View>
        <View style={styles.box}>
          {(refs?.length ? refs : []).map((r: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderWidth: 1,
                    borderColor: "#111",
                    borderRadius: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 6,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: 700 }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 9.5, fontWeight: 700 }}>
                  {r?.tipo_referencia ?? "Referencia"}
                </Text>
              </View>
              <Row2
                l1="Nombre"
                v1={r?.nombre_completo ?? "—"}
                l2="Teléfono"
                v2={r?.telefono ?? "—"}
              />
              <Row2
                l1="Dirección"
                v1={r?.direccion ?? "—"}
                l2=""
                v2=""
              />
            </View>
          ))}
          {(!refs || refs.length === 0) && (
            <Text style={{ fontSize: 9, marginTop: 4 }}>
              No se registraron referencias en esta solicitud.
            </Text>
          )}
        </View>

        {/* Dos columnas: Detalle de la venta / Condiciones del negocio */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>5. Detalle de la venta y condiciones</Text>
        </View>
        <View style={styles.boxSoft}>
          <View style={styles.twoCols}>
            <View style={styles.col}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "#111827",
                }}
              >
                Detalle de la venta
              </Text>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>Producto</Text>
                <Text style={styles.lineValue}>{detalle.producto ?? ""}</Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>+ Precio de venta</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(detalle.precioVenta)}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>- Descuento</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(detalle.descuento)}
                </Text>
              </View>
              {"documentos" in detalle && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineLabel}>+ Documentos</Text>
                  <Text style={styles.lineValue}>
                    {fmtCOP((detalle as any).documentos)}
                  </Text>
                </View>
              )}
              {"impuestos" in detalle && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineLabel}>+ Impuestos</Text>
                  <Text style={styles.lineValue}>
                    {fmtCOP((detalle as any).impuestos)}
                  </Text>
                </View>
              )}
              {"matricula" in detalle && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineLabel}>+ Matrícula</Text>
                  <Text style={styles.lineValue}>
                    {fmtCOP((detalle as any).matricula)}
                  </Text>
                </View>
              )}
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>+ SOAT</Text>
                <Text style={styles.lineValue}>{fmtCOP(detalle.soat)}</Text>
              </View>
              {"accesorios" in detalle && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineLabel}>+ Accesorios</Text>
                  <Text style={styles.lineValue}>
                    {fmtCOP((detalle as any).accesorios)}
                  </Text>
                </View>
              )}
              {"marcacion" in detalle && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineLabel}>+ Marcación</Text>
                  <Text style={styles.lineValue}>
                    {fmtCOP((detalle as any).marcacion)}
                  </Text>
                </View>
              )}
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>+ Seguros / Otros</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(detalle.segurosOtros)}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text
                  style={[
                    styles.lineLabel,
                    { fontWeight: 700, color: ACCENT },
                  ]}
                >
                  = Valor total
                </Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(
                    (detalle as any).precioTotal ??
                      (detalle as any).valorTotal
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.col}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "#111827",
                }}
              >
                Condiciones del negocio
              </Text>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>- Cuota inicial</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(detalle.cuotaInicial as any)}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>+ Garantía extendida</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP((detalle as any).garantiaExtendida)}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>= Valor a financiar</Text>
                <Text style={styles.lineValue}>
                  {fmtCOP(
                    (detalle as any).valorFinanciar ??
                      (detalle as any).valorFinanciar
                  )}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>Plazo</Text>
                <Text style={styles.lineValue}>
                  {detalle.plazo ? `${detalle.plazo} meses` : "—"}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text
                  style={[
                    styles.lineLabel,
                    { fontWeight: 700, color: ACCENT },
                  ]}
                >
                  Total de cuota mensual
                </Text>
                <Text style={styles.lineValue}>
                  {detalle.cuotaMensual
                    ? fmtCOP(detalle.cuotaMensual)
                    : "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Legales */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            6. Autorizaciones y declaraciones
          </Text>
        </View>
        <View style={styles.legalBlock}>
          <Text>
            1. AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES Con mi firma
            Autorizo de manera expresa, e inequívoca a VERIFICARTE AAA S.A.S, o
            quien haga sus veces al tratamiento de mis datos personales aquí
            consignados para que sean reportados, consultados, cedidos o
            verificados con terceras personas, incluyendo bancos de datos o
            centrales de riesgo. Igualmente autorizo que los mismos sean
            almacenados, usados y puestos en circulación o suprimidos conforme
            a la Política de Tratamiento de Información que la empresa ha
            adoptado. En desarrollo de la presente autorización VERIFICARTE AAA
            S.A.S podrá mantener conmigo, contacto de manera comercial por
            medios físicos o tecnológicos, enviar mensajes a mi correo
            electrónico o mensajes SMS y/o mi WhatsApp celular, realizar
            transferencia internacional de mis datos y en general, ejecutar las
            actividades necesarias en etapas precontractuales, contractuales o
            post-contractuales que VERIFICARTE AAA S.A.S llegare a establecer.
          </Text>
          <Text>
            2. DECLARACIÓN DE ORÍGENES DE FONDOS Declaro que mi ocupación
            económica y de origen de los ingresos que presento en este documento
            proceden de actividades lícitas y dentro de los marcos legales.
          </Text>
          <Text>
            3. DECLARACIONES DE SUMINISTRO DE INFORMACIÓN: Declaro y acepto que
            la información suministrada es veraz, que la aprobación del crédito
            queda sujeta a validación y que esas autorizaciones las imparto
            desde el instante en que tramite con VERIFICARTE AAA S.A.S esta
            solicitud. Me comprometo con VERIFICARTE AAA S.A.S. y/o quien
            represente sus derechos a informar por cualquier medio
            oportunamente cualquier cambio en los datos y a actualizar dicha
            información con periodicidad mínima anual (Ley 1581/2012 art 8). En
            caso de suministrar información falsa, no verificable, o negarme a
            actualizar la información VERIFICARTE AAA S.A.S y/o quien represente
            sus derechos podrá por esta causa unilateralmente declarar por
            terminada la relación comercial.
          </Text>
          <Text>
            4. AUTORIZACIÓN PARA CONSULTA Y REPORTE A CENTRALES DE INFORMACIÓN
            FINANCIERA Autorizo a VERIFICARTE AAA S.A.S. y/o a quien represente
            sus derechos para que, con fines estadísticos, de control,
            supervisión y de información comercial reporte, consulte, solicite,
            comparta, procese, aclare, modifique, actualice, retire o divulgue
            ante las centrales de información financiera o cualquier otra
            entidad que maneje bases de datos con los mismos fines, el
            nacimiento, modificación, extinción y cumplimiento de obligaciones
            contraídas o que llegue a contraer fruto de cualquier relación
            financiera o proceso con VERIFICARTE AAA S.A.S.
          </Text>
          <Text>
            5. AUTORIZACIÓN DE DESEMBOLSO: Declaro que conozco previamente las
            condiciones de aprobación del crédito solicitado dadas a conocer
            previamente por el asesor comercial, agencia, portal web, correo
            electrónico o telefónicamente y acepto lo establecido en ellas por
            lo cual autorizo a VERIFICARTE AAA S.A.S que el desembolso del
            crédito aprobado a mi nombre sea realizado a la cuenta bancaria
            indicada por mí.
          </Text>
        </View>

        {/* Firma */}
        <View style={styles.signatureBox} />
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>Firma Deudor 1</Text>
        {firmaCc && <Text style={styles.signatureSub}>{firmaCc}</Text>}
      </Page>
    </Document>
  );
};

// ================= Contenedor web (NO usa View/Text) =================
const SolicitudCreditoPDF: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  const { data: datos, isLoading, error } = useCredito(
    { codigo_credito },
    !!codigo_credito
  );
  const { data: deudor } = useDeudor(codigo_credito);

  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  // "creditos?.[0]" puede ser el shape tradicional o el JSON plano que nos envían ahora
  const credito = (datos as any)?.creditos?.[0] ?? (datos as any) ?? undefined;

  const fileName = useMemo(
    () => `SolicitudCredito_${codigo_credito || "sin_codigo"}.pdf`,
    [codigo_credito]
  );

  if (!codigo_credito) {
    return (
      <div className="p-2 text-sm text-red-700 bg-red-50 rounded-lg">
        No se encontró el código de crédito en la URL.
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-2 text-sm text-red-700 bg-red-50 rounded-lg">
        Ocurrió un error al cargar el crédito.
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      {isLoading ? (
        <span className="text-sm text-slate-600">Preparando documento…</span>
      ) : (
        <Fragment>
          <PDFDownloadLink
            document={
              <SolicitudCreditoPDFDoc
                codigo_credito={codigo_credito}
                credito={credito}
                deudorData={deudorData}
                logoUrl={logoUrl}
              />
            }
            fileName={fileName}
          >
            {({ loading }) => (
              <button
                className="btn bg-success hover:bg-green-600 text-white"
                type="button"
              >
                {loading ? "Generando PDF…" : "Descargar Solicitud"}
              </button>
            )}
          </PDFDownloadLink>
        </Fragment>
      )}
    </div>
  );
};

export default SolicitudCreditoPDF;
