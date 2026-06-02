import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── helpers ───────────────────────────────────────────────────────────────

const fmtCOP = (n: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

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

// ─── estilos ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 42,
    paddingHorizontal: 40,
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },

  // ── HEADER ─────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#c0392b",
  },
  logo: {
    width: 72,
    height: 58,
    objectFit: "contain",
    marginRight: 14,
  },
  headerTextBlock: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  headerMeta: { fontSize: 9, lineHeight: 1.4 },
  headerMetaBold: { fontSize: 9, fontWeight: "bold" },

  // ── CLIENTE / ASESOR ────────────────────────────────────────
  topRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  topColLeft: { flex: 1, paddingRight: 10 },
  topColRight: { flex: 1, paddingLeft: 10, borderLeftWidth: 0.5, borderLeftColor: "#ccc" },
  topLabel: { fontSize: 8, fontWeight: "bold", color: "#555", marginBottom: 2, textTransform: "uppercase" },
  topValue: { fontSize: 9.5, fontWeight: "bold", marginBottom: 1 },
  topSub: { fontSize: 8.5, color: "#333" },

  // ── TABLA PRINCIPAL ─────────────────────────────────────────
  dataTable: {
    borderWidth: 0.7,
    borderColor: "#bbb",
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  dataRowLast: { flexDirection: "row" },
  dataCellKey: {
    width: "52%",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: "#bbb",
    textAlign: "center",
    fontWeight: "bold",
  },
  dataCellKeyHighlight: {
    width: "52%",
    backgroundColor: "#2c3e50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: "#bbb",
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  dataCellVal: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8.5,
    textAlign: "center",
  },
  dataCellValHighlight: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
    color: "#c0392b",
  },

  // ── TEXTOS ──────────────────────────────────────────────────
  paragraph: {
    fontSize: 8,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 6,
    color: "#333",
  },
  bold: { fontWeight: "bold" },

  // ── LISTA NUMERADA ──────────────────────────────────────────
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listNum: {
    width: 16,
    fontSize: 8,
    color: "#c0392b",
    fontWeight: "bold",
  },
  listText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    color: "#333",
  },

  // ── FIDELIZACIÓN ────────────────────────────────────────────
  fidTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
    marginTop: 4,
    color: "#2c3e50",
    letterSpacing: 0.5,
  },

  // ── FOOTER ──────────────────────────────────────────────────
  footer: {
    position: "absolute",
    left: 40,
    bottom: 14,
    fontSize: 7,
    color: "#888",
  },

  divider: {
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    marginVertical: 8,
  },

  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#c0392b",
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 2,
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
      <Text style={S.headerMeta}>
        <Text style={S.headerMetaBold}>Código: </Text>{codigo}{"   "}
        <Text style={S.headerMetaBold}>Fecha: </Text>{fecha}{"   "}
        <Text style={S.headerMetaBold}>Ciudad: </Text>{ciudad}
      </Text>
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

const ListItem: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <View style={S.listItem}>
    <Text style={S.listNum}>{n}.</Text>
    <Text style={S.listText}>{text}</Text>
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
  modeloMoto,
  plazo,
  precioVentaTotal,
  cuotaInicial,
  garantiaExtendida = 0,
  valorAFinanciar,
  valorCuotaMensual = 0,
  fechaVencimientoPrimeraCuota = "",
}) => {
  const headerProps = { logoSrc, codigo, fecha, ciudad };

  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════
          PÁGINA 1 — Datos del crédito + info de pagos
      ═══════════════════════════════════════════════════════ */}
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        {/* CLIENTE + ASESOR */}
        <View style={S.topRow} wrap={false}>
          <View style={S.topColLeft}>
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
          <DataRow label="Modelo" value={safe(modeloMoto)} />
          <DataRow
            label="Facturar a nombre de: (quien debe firmar las prendas; esto es en caso de multas)"
            value=""
          />
          <DataRow label="Garantía" value="Prenda sobre la motocicleta" />
          <DataRow label="Plazo" value={String(plazo)} />
          <DataRow label="Precio de venta total" value={fmtCOP(precioVentaTotal)} />
          <DataRow label="Cuota inicial" value={fmtCOP(cuotaInicial)} />
          {garantiaExtendida > 0 && (
            <DataRow label="Garantía y seguros" value={fmtCOP(garantiaExtendida)} />
          )}
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
          Sus pagos los puede realizar en cualquiera punto de red VIA BALOTO, Efecty, corresponsal bancario o por medio de transferencia.
        </Text>

        <View style={S.divider} />
        <Text style={S.sectionLabel}>Canales de pago</Text>

        <ListItem n={1} text="Red VIA Baloto código #272727 más número de convenio o# 1434 y numero de cedula del titular del crédito." />
        <ListItem n={2} text="Bancolombia cuenta de ahorro #62100027815 Nit de la empresa #901.279.292" />
        <ListItem n={3} text="Pagos PSE al link https://portal.psepagos.com.co/web/bancoomeva/buscador — Debes dar click en el link, en la barra escribe el nombre de Verificarte, dar opción pagar, debes llenar los campos con tus datos y hacer efectivo el pago." />
        <ListItem n={4} text="Convenio en Efecty número de convenio #112823 y número de cedula del titular del crédito." />
        <ListItem n={5} text="El personal del área de cartera de Verificarte AAA SAS realizara las aplicaciones de pago correspondientes y enviara vía al correo electrónico registrado en nuestros sistema, el recibo de caja original a cada cliente en un tiempo máximo de 3 días y cada tres meses un estado de cuenta o cuando el cliente lo desee." />

        <View style={S.divider} />

        <Text style={S.paragraph}>
          Los puntos de venta de las empresas Motomax del Valle S.A.S, Verificarte AAA S.A.S, Hasback S.A.S y Mazza Store S.A.S, y sus salas de venta a nivel nacional también funcionan como convenio de recaudo, donde también podrá realizar sus pagos.
        </Text>

        <Text style={S.paragraph}>
          Le invitamos a que se comunique con el área de cartera donde podrá realizar sus solicitudes o manifestar sus inquietudes a los teléfonos{" "}
          <Text style={S.bold}>316 5214859 - 315 8416424 - 304 6702525 - 315 4254067</Text>{" "}
          o al correo electrónico{" "}
          <Text style={S.bold}>credibikecartera@gmail.com</Text>.
        </Text>

        <Text style={S.footer}>{FOOTER_TEXT}</Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PÁGINA 2 — Plan de fidelización
      ═══════════════════════════════════════════════════════ */}
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        <Text style={S.fidTitle}>PLAN DE FIDELIZACIÓN</Text>

        <ListItem
          n={1}
          text="Obtener descuentos del 10% en mano de obra, repuestos y accesorios durante los dos primeros años de uso de su motocicleta."
        />
        <ListItem
          n={2}
          text="Pertenecer a la comunidad TuClick, el primer centro comercial virtual de la movilidad en Colombia que le conectara con puntos de venta, financieras, aseguradoras, proveedores de repuestos, secretarias de tránsito, escuelas de conducción, CDA´s – Centros de Diagnóstico Automotor para hacer la Revisión Técnico-Mecánica, talleres de servicio técnico, retomadores, y más servicios a nivel nacional."
        />
        <ListItem
          n={3}
          text="Activar un cupo de crédito rotativo que puede utilizar para renovar soat, comprar repuestos, pagar mano de obra en nuestros talleres, comprar cascos y accesorios, pagar seguros todo riesgo, y muchos otros beneficios. Aplican T&C: Deberá cumplir el plan de mantenimiento preventivo correspondiente al periodo de garantía de fábrica de su motocicleta, y en el mes 11 podrá solicitar la activación del cupo de crédito rotativo."
        />
        <ListItem
          n={4}
          text="Acceder a nuestra asesoría en finanzas personales para que pueda hacer un análisis de su situación actual financiera y definir estrategias que le permitan mejorarla, todo esto enfocado en un análisis de riesgo, que buscara a través de la educación y el manejo de herramientas financieras minimizar los riesgos de sus proyectos e inversiones. *Aplica también para finanzas empresariales."
        />
        <ListItem
          n={5}
          text="Solicitar una vez por año durante el periodo del crédito, un diagnostico gratuito SEMAFORO ESTADO GENERAL DEL VEHICULO que le informara a través de los colores VERDE-AMARILLO-ROJO la vida útil de las partes componentes de desgaste de su vehículo y del estado de funcionamiento del motor de su vehículo."
        />
        <ListItem
          n={6}
          text="Es muy importante aclarar que, a todos estos beneficios, además de los puntos contratados con la empresa que le vende el vehículo con garantía y seguros y complementaria, podrá acceder si mantiene su crédito al día. Nuestro aliado IKIGAI SEGUROS, ofrece las mejores soluciones en seguros para las personas, para la movilidad y para las empresas."
        />
        <ListItem
          n={7}
          text="Condiciones de prepago: El cliente podrá realizar pagos anticipados de su obligación, en los términos establecidos por la ley 1555 de 2012, así como en las normas que la modifiquen o sustituyan, sin incurrir en ningún tipo de penalización. En este Evento, el cliente podrá decidir si el pago anticipado que realice se abonará a capital con disminución del plazo inicialmente pactado o con disminución del valor de la cuota de la respectiva obligación. Para estos efectos, deberá informar su decisión a Verificarte AAA SAS, a más tardar dentro de los 15 días hábiles, siguientes a la fecha del pago anticipado, si transcurrido este plazo el cliente no indica cómo aplicar este pago anticipado, Verificarte AAA SAS abonará a capital con disminución del plazo, conservando el mismo valor de cuota definido dentro de las condiciones iniciales del crédito."
        />

        <Text style={S.footer}>{FOOTER_TEXT}</Text>
      </Page>
    </Document>
  );
};
