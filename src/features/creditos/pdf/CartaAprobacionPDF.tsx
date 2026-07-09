import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { fmtCOP } from "../../../utils/money";

// ─── helpers ───────────────────────────────────────────────────────────────

const safe = (v: any, fallback = ""): string =>
  v != null && String(v).trim() !== "" ? String(v).trim() : fallback;

// ─── props ─────────────────────────────────────────────────────────────────

export interface CartaAprobacionPDFProps {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  // cliente
  nombreCliente: string;
  ccCliente: string;

  // asesor
  nombreAsesor: string;
  telefonoAsesor?: string;

  // moto / crédito
  producto: string;          // "HERO ECO DELUXE CW - 2027"
  modeloMoto: string;        // "2027"
  plazo: number;             // meses: 24, 36…
  precioVentaTotal: number;
  cuotaInicial: number;
  garantiaExtendida?: number;
  valorAFinanciar: number;
  valorCuotaMensual?: number;
  fechaVencimientoPrimeraCuota?: string;
}

// ─── constantes empresa ────────────────────────────────────────────────────

const EMPRESA = "VERIFICARTE AAA S.A.S.";
const NIT = "901155548-8";
const FOOTER_TEXT = `${EMPRESA}\nNIT. ${NIT}`;

// ─── paleta ────────────────────────────────────────────────────────────────

const ACCENT = "#c0392b";
const DARK = "#2c3e50";
const INK = "#2b2b2b";
const MUTED = "#6b7280";

// ─── estilos ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 44,
    paddingHorizontal: 44,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: INK,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 520,
  },

  // ── HEADER ─────────────────────────────────────────────────
  header: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
  },
  logo: {
    width: 70,
    height: 56,
    objectFit: "contain",
    marginRight: 16,
  },
  headerTextBlock: { flexShrink: 1 },
  headerTitle: {
    fontSize: 21,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    color: DARK,
    marginBottom: 5,
    textAlign: "center",
  },
  headerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerMetaItem: { fontSize: 8.5, color: MUTED, marginRight: 16 },
  headerMetaBold: { fontFamily: "Helvetica-Bold", color: INK },

  // ── CLIENTE / ASESOR ────────────────────────────────────────
  topRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  topCol: { flex: 1 },
  topColRight: {
    flex: 1,
    paddingLeft: 14,
    borderLeftWidth: 0.6,
    borderLeftColor: "#e2e2e2",
  },
  topLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  topValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2, color: DARK },
  topSub: { fontSize: 8.5, color: "#444" },

  // ── TABLA PRINCIPAL ─────────────────────────────────────────
  dataTable: {
    borderWidth: 0.8,
    borderColor: "#cfcfcf",
    borderRadius: 2,
    marginBottom: 18,
    overflow: "hidden",
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e3e3e3",
  },
  dataRowLast: { flexDirection: "row" },
  dataCellKey: {
    width: "52%",
    backgroundColor: "#f5f6f7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 8.5,
    borderRightWidth: 0.5,
    borderRightColor: "#cfcfcf",
    textAlign: "center",
    color: "#3a3a3a",
  },
  dataCellKeyHighlight: {
    width: "52%",
    backgroundColor: DARK,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 8.5,
    borderRightWidth: 0.5,
    borderRightColor: DARK,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#fff",
  },
  dataCellVal: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 9,
    textAlign: "center",
    color: INK,
  },
  dataCellValHighlight: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 9.5,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },

  // ── TEXTOS ──────────────────────────────────────────────────
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.45,
    textAlign: "justify",
    marginBottom: 8,
    color: "#333",
  },
  bold: { fontFamily: "Helvetica-Bold", color: INK },

  // ── LISTA NUMERADA ──────────────────────────────────────────
  listBlock: {
    marginVertical: 4,
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  listNum: {
    width: 16,
    fontSize: 8.5,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },
  listText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.4,
    textAlign: "justify",
    color: "#333",
  },

  divider: {
    borderTopWidth: 0.5,
    borderTopColor: "#e3e3e3",
    marginVertical: 10,
  },

  // ── FOOTER ──────────────────────────────────────────────────
  footer: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 16,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#e3e3e3",
    fontSize: 7,
    color: MUTED,
  },
});

// ─── header component ─────────────────────────────────────────────────────

const PDFHeader: React.FC<{
  logoSrc?: string;
  codigo: string;
  fecha: string;
  ciudad: string;
}> = ({ logoSrc, codigo, fecha, ciudad }) => (
  <View style={S.header} fixed>
    {logoSrc ? <Image style={S.logo} src={logoSrc} /> : null}
    <View style={S.headerTextBlock}>
      <Text style={S.headerTitle}>CARTA DE APROBACIÓN</Text>
      <View style={S.headerMetaRow}>
        <Text style={S.headerMetaItem}>
          <Text style={S.headerMetaBold}>Código: </Text>
          {codigo}
        </Text>
        <Text style={S.headerMetaItem}>
          <Text style={S.headerMetaBold}>Fecha: </Text>
          {fecha}
        </Text>
        <Text style={S.headerMetaItem}>
          <Text style={S.headerMetaBold}>Ciudad: </Text>
          {ciudad}
        </Text>
      </View>
    </View>
  </View>
);

// ─── fila tabla ───────────────────────────────────────────────────────────

const DataRow: React.FC<{
  label: string;
  value: string;
  last?: boolean;
  highlight?: boolean;
}> = ({ label, value, last, highlight }) => (
  <View style={last ? S.dataRowLast : S.dataRow}>
    <Text style={highlight ? S.dataCellKeyHighlight : S.dataCellKey}>{label}</Text>
    <Text style={highlight ? S.dataCellValHighlight : S.dataCellVal}>{value}</Text>
  </View>
);

// ─── lista ────────────────────────────────────────────────────────────────

const ListItem: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <View style={S.listItem}>
    <Text style={S.listNum}>{n}.</Text>
    <Text style={S.listText}>{children}</Text>
  </View>
);

// ─── componente principal ─────────────────────────────────────────────────

export const CartaAprobacionPDFDoc: React.FC<CartaAprobacionPDFProps> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  nombreCliente,
  ccCliente,
  nombreAsesor,
  telefonoAsesor = "",
  producto,
  plazo,
  precioVentaTotal,
  valorAFinanciar,
  valorCuotaMensual = 0,
  fechaVencimientoPrimeraCuota = "",
}) => {
  const headerProps = { logoSrc, codigo, fecha, ciudad };

  return (
    <Document>
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        <View style={S.content}>
        {/* CLIENTE + ASESOR */}
        <View style={S.topRow} wrap={false}>
          <View style={S.topCol}>
            <Text style={S.topLabel}>Señor/a:</Text>
            <Text style={S.topValue}>{safe(nombreCliente)}</Text>
            <Text style={S.topSub}>CC {safe(ccCliente)}</Text>
          </View>
          <View style={S.topColRight}>
            <Text style={S.topLabel}>Asesor</Text>
            <Text style={S.topValue}>{safe(nombreAsesor)}</Text>
            {telefonoAsesor ? <Text style={S.topSub}>{telefonoAsesor}</Text> : null}
          </View>
        </View>

        {/* TABLA PRINCIPAL */}
        <View style={S.dataTable} wrap={false}>
          <DataRow label="Producto" value={safe(producto)} />
          <DataRow label="Plazo" value={String(plazo)} />
          <DataRow label="Precio de venta total" value={fmtCOP(precioVentaTotal)} />
          <DataRow label="Valor a financiar" value={fmtCOP(valorAFinanciar)} />
          <DataRow
            label="Valor cuota mensual"
            value={valorCuotaMensual > 0 ? fmtCOP(valorCuotaMensual) : "—"}
            highlight
          />
          <DataRow
            label="Fecha de vencimiento primera cuota"
            value={safe(fechaVencimientoPrimeraCuota)}
            last
          />
        </View>

        {/* VIGENCIA */}
        <Text style={S.paragraph}>
          Esta aprobación tiene una vigencia de 30 días calendario a partir de la fecha, pasado este tiempo el cliente deberá aportar nuevamente la documentación que requiere {EMPRESA} para realizar un nuevo estudio de crédito.
        </Text>

        {/* COMPORTAMIENTO CREDITICIO */}
        <Text style={S.paragraph}>
          Estimado cliente le recordamos que el 10 de cada mes reportamos a las Centrales de riesgo y que con su buen comportamiento crediticio y habito de pago puede pertenecer a la Familia VERIFICARTE AAA S.A.S., como cliente PREFERENCIAL donde fácilmente puede adquirir su nuevo crédito.
        </Text>

        {/* CANALES DE PAGO */}
        <Text style={S.paragraph}>
          Sus pagos los puede realizar en corresponsal bancario Bancolombia o por medio de transferencia.
        </Text>

        <View style={S.listBlock}>
          <ListItem n={1}>
            Verificarte Bancolombia cuenta de ahorro #71000000131 Nit de la empresa #901.155.548-8
          </ListItem>
          <ListItem n={2}>
            Moto para todos Bancolombia cuenta de ahorro # 81000002773 Nit de la empresa #901.608.735-4
          </ListItem>
          <ListItem n={3}>
            El personal del área de cartera de Verificarte AAA SAS realizara las aplicaciones de pago correspondientes y enviara vía whatsapp al número registrado en nuestro sistema, el recibo de caja original a cada cliente en un tiempo máximo de 5 días y un estado de cuenta cuando el cliente lo desee.
          </ListItem>
        </View>

        <Text style={S.paragraph}>
          Los puntos de venta de la empresa, Verificarte AAA S.A.S, y sus salas de venta a nivel nacional también funcionan como convenio de recaudo, donde también podrá realizar sus pagos.
        </Text>

        <Text style={S.paragraph}>
          Le invitamos a que se comunique con el área de cartera donde podrá realizar sus solicitudes o manifestar sus inquietudes a los teléfonos{" "}
          <Text style={S.bold}>320 7209413 - 304 2190432 - 317 4379680</Text>{" "}
          o al correo electrónico{" "}
          <Text style={S.bold}>verificartecartera@gmail.com</Text>.
        </Text>
        </View>

        <Text style={S.footer}>{FOOTER_TEXT}</Text>
      </Page>
    </Document>
  );
};
