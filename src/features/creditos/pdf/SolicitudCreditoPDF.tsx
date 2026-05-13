import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── utils ─────────────────────────────────────────────────────────────────

const fmtCOP = (v?: number | null) => {
  if (v == null || Number.isNaN(Number(v))) return "$0";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(v));
  } catch {
    return `${v}`;
  }
};

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
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

const calcEdad = (fecha?: string | null): string => {
  if (!fecha) return "—";
  const dt = new Date(fecha);
  if (Number.isNaN(dt.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - dt.getFullYear();
  const m = today.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dt.getDate())) age--;
  return String(Math.max(0, age));
};

const safe = (v: any, fallback = "—"): string =>
  v != null && String(v).trim() !== "" ? String(v).trim() : fallback;

// ─── estilos ───────────────────────────────────────────────────────────────

const BORDER = "#bbb";
const HEADER_BG = "#f0f0f0";

const S = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingHorizontal: 28,
    paddingBottom: 28,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
    color: "#111",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  logo: { width: 52, height: 44, objectFit: "contain", marginRight: 10 },
  headerRight: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 2 },
  headerMeta: { fontSize: 8, lineHeight: 1.3 },
  headerBold: { fontWeight: "bold" },

  // SEPARADOR SECCIÓN
  sectionBar: { marginTop: 5, marginBottom: 2 },
  sectionLine1: { height: 1.2, backgroundColor: "#111" },
  sectionLine2: { height: 0.5, backgroundColor: "#111", marginTop: 1 },
  sectionTitle: { fontSize: 8, fontWeight: "bold", marginTop: 1, marginBottom: 0 },

  // TABLA DATOS
  table: { borderWidth: 0.5, borderColor: BORDER },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: "row" },
  cellLabel: {
    backgroundColor: HEADER_BG,
    fontWeight: "bold",
    fontSize: 6.5,
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
    width: "22%",
  },
  cellVal: {
    fontSize: 7,
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  cellValLast: {
    fontSize: 7,
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    flex: 1,
  },
  cellLabelHalf: {
    backgroundColor: HEADER_BG,
    fontWeight: "bold",
    fontSize: 6.5,
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
    width: "28%",
  },
  cellValHalf: {
    fontSize: 7,
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    width: "22%",
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },

  // REFERENCIAS
  refRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    alignItems: "stretch",
  },
  refNum: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
    backgroundColor: HEADER_BG,
    paddingVertical: 2,
  },
  refNumText: { fontSize: 7.5, fontWeight: "bold" },
  refTipo: {
    width: "13%",
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
    fontSize: 6.5,
    fontWeight: "bold",
    justifyContent: "center",
  },
  refCell: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  refCellLast: { flex: 1, paddingHorizontal: 3, paddingVertical: 2 },
  refCellLabel: { fontSize: 5.5, fontWeight: "bold", color: "#555" },
  refCellVal: { fontSize: 7 },

  // DETALLE / CONDICIONES (2 col)
  twoCol: { flexDirection: "row", borderWidth: 0.5, borderColor: BORDER, marginTop: 3 },
  detCol: { flex: 1, borderRightWidth: 0.5, borderRightColor: BORDER },
  condCol: { flex: 1 },
  detHeader: {
    backgroundColor: HEADER_BG,
    fontWeight: "bold",
    fontSize: 7.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  lineItemTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: "#e8e8e8",
  },
  lineItemCuota: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: "#2c3e50",
  },
  lineKey: { fontSize: 7, color: "#333" },
  lineVal: { fontSize: 7, fontWeight: "bold" },
  lineTotalKey: { fontSize: 7.5, fontWeight: "bold" },
  lineTotalVal: { fontSize: 7.5, fontWeight: "bold" },
  lineCuotaKey: { fontSize: 7.5, fontWeight: "bold", color: "#fff" },
  lineCuotaVal: { fontSize: 8, fontWeight: "bold", color: "#fff" },

  // LEGAL
  legalBlock: {
    marginTop: 5,
    fontSize: 5.8,
    lineHeight: 1.25,
    textAlign: "justify",
    color: "#333",
  },

  // FIRMA
  firmaBox: { width: 180, height: 50, borderWidth: 1, borderColor: "#111", marginTop: 6 },
  firmaLine: { width: 180, borderTopWidth: 0.8, borderTopColor: "#111", marginTop: 5 },
  firmaText: { fontSize: 8, marginTop: 2 },
  firmaSub: { fontSize: 7, color: "#555", marginTop: 1 },

  // FOOTER
  footer: { position: "absolute", left: 28, bottom: 10, fontSize: 6.5, color: "#888" },
});

// ─── sub-componentes ───────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <View style={S.sectionBar}>
    <Text style={S.sectionTitle}>{title}</Text>
    <View style={S.sectionLine1} />
    <View style={S.sectionLine2} />
  </View>
);

// Fila tabla 2-col (label | val | label | val)
const TR4: React.FC<{ l1: string; v1: string; l2: string; v2: string; last?: boolean }> = ({
  l1, v1, l2, v2, last,
}) => (
  <View style={last ? S.tableRowLast : S.tableRow}>
    <Text style={S.cellLabel}>{l1}</Text>
    <Text style={S.cellVal}>{v1}</Text>
    <Text style={S.cellLabel}>{l2}</Text>
    <Text style={S.cellValLast}>{v2}</Text>
  </View>
);

// ─── props ─────────────────────────────────────────────────────────────────

export interface SolicitudCreditoPDFProps {
  codigo_credito: string;
  credito: any;
  deudorData: any;
  logoUrl?: string;
  cotData?: any;
  sufCot?: string;
}

// ─── componente ────────────────────────────────────────────────────────────

export const SolicitudCreditoPDFDoc: React.FC<SolicitudCreditoPDFProps> = ({
  codigo_credito,
  credito,
  deudorData,
  logoUrl = "/verificarte.jpg",
  cotData,
  sufCot = "a",
}) => {
  const ip = deudorData?.informacion_personal ?? {};
  const il = deudorData?.informacion_laboral ?? {};
  const refs: any[] = deudorData?.referencias ?? [];

  const nombreCompleto = [
    ip?.primer_nombre, ip?.segundo_nombre, ip?.primer_apellido, ip?.segundo_apellido,
  ].filter(Boolean).join(" ") || "—";

  const edad = calcEdad(ip?.fecha_nacimiento);
  const fecha = fmtDate(credito?.fecha_creacion);
  const ciudad = safe(ip?.ciudad_residencia, credito?.ciudad ?? "Cali");

  // producto desde cotizacion o fallback en credito
  const marcaCot = cotData?.[`marca_${sufCot}`];
  const lineaCot = cotData?.[`linea_${sufCot}`];
  const modeloCot = cotData?.[`modelo_${sufCot}`];
  const producto = [marcaCot, lineaCot, modeloCot].filter(Boolean).join(" ") || safe(credito?.producto);

  // valores financieros
  const precioVenta = Number(credito?.valor_producto ?? 0);
  const gastosMatricula = Number(credito?.gasto_matricula ?? 0);
  const soatVal = Number(credito?.soat ?? 0);
  const segurosOtros = 0;
  const descuento = 0;
  const garantiaExt = Number(credito?.garantia_extendida_valor ?? 0);
  const cuotaInicial = Number(credito?.cuota_inicial ?? 0);
  const precioTotal = precioVenta + gastosMatricula + soatVal;
  const valorFinanciar = Math.max(0, precioTotal + garantiaExt - cuotaInicial);
  const plazo = credito?.plazo_meses ?? "—";
  const cuotaMensual = credito?.valor_cuota ?? null;

  const firmaCc = ip?.numero_documento ? `CC ${ip.numero_documento}` : "";

  return (
    <Document>
      <Page size="LETTER" style={S.page}>

        {/* ── HEADER ── */}
        <View style={S.header}>
          <Image src={logoUrl} style={S.logo} />
          <View style={S.headerRight}>
            <Text style={S.headerTitle}>SOLICITUD DE CRÉDITO</Text>
            <Text style={S.headerMeta}>
              <Text style={S.headerBold}>Código: </Text>{safe(String(codigo_credito))}{"   "}
              <Text style={S.headerBold}>Fecha: </Text>{fecha}{"   "}
              <Text style={S.headerBold}>Ciudad: </Text>{ciudad}
            </Text>
          </View>
        </View>

        {/* ── INFO PERSONAL ── */}
        <SectionTitle title="Deudor / Información personal" />
        <View style={S.table}>
          <TR4
            l1="Documento de identidad"
            v1={safe(ip?.numero_documento)}
            l2="De"
            v2={safe(ip?.lugar_expedicion)}
          />
          <TR4
            l1="Nombre"
            v1={nombreCompleto}
            l2="Edad"
            v2={edad}
          />
          <TR4
            l1="Dirección de residencia"
            v1={safe(ip?.direccion_residencia)}
            l2="Teléfono"
            v2={`${ip?.telefono_fijo ? ip.telefono_fijo + " - " : ""}${safe(ip?.celular)}`}
          />
          <TR4
            l1="Estado civil"
            v1={safe(ip?.estado_civil)}
            l2="Personas a cargo"
            v2={safe(ip?.personas_a_cargo)}
          />
          <View style={S.tableRow}>
            <Text style={S.cellLabel}>Finca raíz</Text>
            <Text style={[S.cellVal, { width: "13%" }]}>{safe(ip?.finca_raiz)}</Text>
            <Text style={S.cellLabel}>Inmueble</Text>
            <Text style={[S.cellVal, { width: "13%" }]}>{safe(ip?.tipo_vivienda)}</Text>
            <Text style={S.cellLabel}>Valor de arriendo</Text>
            <Text style={S.cellValLast}>{fmtCOP(Number(ip?.costo_arriendo) || 0)}</Text>
          </View>
          <TR4
            l1="Vehículo"
            v1={safe(credito?.producto)}
            l2="Placa"
            v2={safe(credito?.placa)}
            last
          />
        </View>

        {/* ── INFO LABORAL ── */}
        <SectionTitle title="Deudor / Información laboral" />
        <View style={S.table}>
          <TR4
            l1="Empresa"
            v1={safe(il?.empresa)}
            l2="Cargo"
            v2={safe(il?.cargo)}
          />
          <TR4
            l1="Dirección"
            v1={safe(il?.direccion_empleador)}
            l2="Teléfono"
            v2={safe(il?.telefono_empleador)}
          />
          <TR4
            l1="Tiempo de servicio"
            v1={safe(il?.tiempo_servicio)}
            l2="Salario"
            v2={fmtCOP(Number(il?.salario) || 0)}
            last
          />
        </View>

        {/* ── REFERENCIAS ── */}
        <SectionTitle title="Deudor / Referencias" />
        <View style={S.table}>
          {/* header */}
          <View style={[S.tableRow, { backgroundColor: HEADER_BG }]}>
            <Text style={[S.cellLabel, { width: 20, textAlign: "center" }]}>#</Text>
            <Text style={[S.cellLabel, { width: "13%", fontWeight: "bold" }]}>Tipo</Text>
            <Text style={[S.cellLabel, { flex: 1 }]}>Nombre</Text>
            <Text style={[S.cellLabel, { flex: 1 }]}>Dirección</Text>
            <Text style={[S.cellValLast, { fontWeight: "bold", backgroundColor: HEADER_BG, fontSize: 7.5 }]}>Teléfono</Text>
          </View>
          {(refs.length ? refs : [{}, {}, {}]).map((r: any, i: number) => (
            <View key={i} style={i < 2 ? S.tableRow : S.tableRowLast}>
              <View style={[S.refNum, { width: 20 }]}>
                <Text style={S.refNumText}>{i + 1}</Text>
              </View>
              <Text style={[S.cellVal, { width: "13%", fontSize: 7.5 }]}>
                {safe(r?.tipo_referencia)}
              </Text>
              <Text style={[S.cellVal, { flex: 1 }]}>{safe(r?.nombre_completo)}</Text>
              <Text style={[S.cellVal, { flex: 1 }]}>{safe(r?.direccion)}</Text>
              <Text style={S.cellValLast}>{safe(r?.telefono)}</Text>
            </View>
          ))}
        </View>

        {/* ── DETALLE / CONDICIONES ── */}
        <SectionTitle title="" />
        <View style={S.twoCol} wrap={false}>
          {/* columna izquierda: detalle de la venta */}
          <View style={S.detCol}>
            <Text style={S.detHeader}>Detalle de la venta</Text>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>Producto</Text>
              <Text style={[S.lineVal, { fontSize: 7.5 }]}>{producto}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>+ Precio de venta</Text>
              <Text style={S.lineVal}>{fmtCOP(precioVenta)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>+ Gastos de matrícula</Text>
              <Text style={S.lineVal}>{fmtCOP(gastosMatricula)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>+ SOAT</Text>
              <Text style={S.lineVal}>{fmtCOP(soatVal)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>+ Seguros / Otros</Text>
              <Text style={S.lineVal}>{fmtCOP(segurosOtros)}</Text>
            </View>
            <View style={S.lineItemTotal}>
              <Text style={S.lineTotalKey}>= Valor total</Text>
              <Text style={S.lineTotalVal}>{fmtCOP(precioTotal)}</Text>
            </View>
          </View>

          {/* columna derecha: condiciones */}
          <View style={S.condCol}>
            <Text style={S.detHeader}>Condiciones del negocio</Text>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>- Descuento</Text>
              <Text style={S.lineVal}>{fmtCOP(descuento)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>- Cuota inicial</Text>
              <Text style={S.lineVal}>{fmtCOP(cuotaInicial)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>+ Garantía extendida</Text>
              <Text style={S.lineVal}>{fmtCOP(garantiaExt)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>= Valor a financiar</Text>
              <Text style={S.lineVal}>{fmtCOP(valorFinanciar)}</Text>
            </View>
            <View style={S.lineItem}>
              <Text style={S.lineKey}>Plazo</Text>
              <Text style={S.lineVal}>{plazo} meses</Text>
            </View>
            <View style={S.lineItemCuota}>
              <Text style={S.lineCuotaKey}>Total de cuota mensual</Text>
              <Text style={S.lineCuotaVal}>
                {cuotaMensual != null ? fmtCOP(Number(cuotaMensual)) : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── LEGAL ── */}
        <Text style={S.legalBlock}>
          <Text style={{ fontWeight: "bold" }}>1. AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES </Text>
          Con mi firma Autorizo de manera expresa, e inequívoca a VERIFICARTE AAA S.A.S, o quien haga sus veces al tratamiento de mis datos personales aquí consignados para que sean reportados, consultados, cedidos o verificados con terceras personas, incluyendo bancos de datos o centrales de riesgo. Igualmente autorizo que los mismos sean almacenados, usados y puestos en circulación o suprimidos conforme a la Política de Tratamiento de Información que la empresa ha adoptado. En desarrollo de la presente autorización VERIFICARTE AAA S.A.S podrá mantener conmigo, contacto de manera comercial por medios físicos o tecnológicos, enviar mensajes a mi correo electrónico o mensajes SMS y/o mi WhatsApp celular, realizar transferencia internacional de mis datos y en general, ejecutar las actividades necesarias en etapas precontractuales, contractuales o post-contractuales.{"\n"}
          <Text style={{ fontWeight: "bold" }}>2. DECLARACIÓN DE ORÍGENES DE FONDOS </Text>
          Declaro que mi ocupación económica y de origen de los ingresos que presento en este documento proceden de actividades licitas y los dentro de los marcos legales.{"\n"}
          <Text style={{ fontWeight: "bold" }}>3. DECLARACIONES DE SUMINISTRO DE INFORMACIÓN: </Text>
          Declaro y acepto que la información suministrada es veraz, que la aprobación del crédito queda sujeta a validación y que esas autorizaciones las imparto desde el instante en que tramite con VERIFICARTE AAA S.A.S esta solicitud. Me comprometo con VERIFICARTE AAA S.A.S. y/o quien represente sus derechos a informar por cualquier medio que ponga a mi disposición y oportunamente cualquier cambio en los datos y a actualizar dicha información con una periodicidad como mínimo anual tal como lo establece la ley 1581/2012 art 8.{"\n"}
          <Text style={{ fontWeight: "bold" }}>4. AUTORIZACIÓN PARA CONSULTA Y REPORTE A CENTRALES DE INFORMACIÓN FINANCIERA </Text>
          Autorizo a VERIFICARTE AAA S.A.S. y/o a quien represente sus derechos para que, con fines estadísticos, de control, supervisión y de información comercial reporte, consulte, solicite, comparta, procese, aclare, modifique, actualice, retire o divulgue ante las centrales de información financiera o cualquier otra entidad que maneje bases de datos con los mismos fines, el nacimiento, modificación, extinción y cumplimiento de obligaciones contraídas o que llegue a contraer fruto de cualquier relación financiera o proceso con VERIFICARTE AAA S.A.S.{"\n"}
          <Text style={{ fontWeight: "bold" }}>5. AUTORIZACIÓN DE DESEMBOLSO: </Text>
          Declaro que conozco previamente las condiciones de aprobación del crédito solicitado dadas a conocer previamente por el asesor comercial, agencia, portal web, correo electrónico o telefónicamente y acepto lo establecido en ellas por lo cual autorizo a VERIFICARTE AAA S.A.S que el desembolso del crédito aprobado a mi nombre sea realizado a la cuenta bancaria indicada por mí.
        </Text>

        {/* ── FIRMA ── */}
        <View wrap={false}>
          <View style={S.firmaBox} />
          <View style={S.firmaLine} />
          <Text style={S.firmaText}>Firma Deudor 1</Text>
          <Text style={S.firmaSub}>{firmaCc}</Text>
        </View>

        {/* ── FOOTER ── */}
        <Text style={S.footer}>VERIFICARTE AAA S.A.S.{"\n"}NIT. 901155548-8</Text>

      </Page>
    </Document>
  );
};
