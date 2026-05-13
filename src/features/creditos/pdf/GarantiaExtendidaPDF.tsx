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

export interface GarantiaExtendidaPDFProps {
  // encabezado
  codigo: string;
  fecha: string;
  agencia: string;
  logoSrc?: string;

  // titular
  nombreTitular: string;
  ccTitular: string;
  direccionTitular: string;
  ciudadTitular: string;
  telefonoTitular: string;
  emailTitular: string;

  // beneficiario (normalmente igual al titular)
  nombreBeneficiario?: string;
  ccBeneficiario?: string;

  // moto
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  numeroMotor: string;
  numeroChasis: string;
  placa: string;
  tipoServicio?: string;
  codigoFasecolda?: string;
  ciudadMatricula?: string;

  // financiero
  valorMotoNum: number;        // número entero para calcular 13 %
  garantiaAnios?: number;      // cuántos años cubre (default 3)

  // vigencia
  fechaDesde?: string;
  fechaHasta?: string;
  fechaExpedicion?: string;
  ciudadExpedicion?: string;
  formaPago?: string;

  // vendedor
  codigoVendedor?: string;
  nombreVendedor?: string;
  puntoDeVenta?: string;
}

// ─── constantes empresa ────────────────────────────────────────────────────

const EMPRESA = "MOTO PARA TODOS S.A.S";
const NIT_EMPRESA = "901608735-4";
const FOOTER_EMPRESA = `${EMPRESA} - Hacemos tu sueño realidad\nNIT. ${NIT_EMPRESA}`;

// ─── estilos ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 45,
    paddingHorizontal: 35,
    fontSize: 8,
    fontFamily: "Helvetica",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  logo: { width: 70, height: 55, objectFit: "contain", marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  headerMeta: { fontSize: 9 },
  headerMetaBold: { fontSize: 9, fontWeight: "bold" },

  // SECTION LABELS
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  centerBold: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 6,
  },

  // INFO TABLE (2-column key-value)
  infoTable: {
    borderWidth: 0.5,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  infoRowLast: {
    flexDirection: "row",
  },
  infoCellKey: {
    width: "38%",
    backgroundColor: "#e8e8e8",
    fontWeight: "bold",
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    borderRightWidth: 0.5,
    fontSize: 7.5,
  },
  infoCellVal: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    fontSize: 7.5,
  },

  // SERVICES TABLE (3-column)
  servTable: { borderWidth: 0.5, marginBottom: 6 },
  servHeaderRow: { flexDirection: "row", backgroundColor: "#d0d0d0" },
  servRow: { flexDirection: "row", borderTopWidth: 0.5 },
  servCellH: {
    fontWeight: "bold",
    paddingHorizontal: 3,
    paddingVertical: 3,
    fontSize: 7.5,
    textAlign: "center",
  },
  servCell: {
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7,
    lineHeight: 1.35,
  },
  colServicio: { width: "45%" },
  colPeriodo: { width: "25%", borderLeftWidth: 0.5, borderRightWidth: 0.5 },
  colCondiciones: { width: "30%" },

  // VALOR CONTRATO TABLE
  valorTable: { borderWidth: 0.5, marginBottom: 6 },
  valorRow: { flexDirection: "row", borderBottomWidth: 0.5 },
  valorRowLast: { flexDirection: "row" },
  valorCellKey: {
    width: "60%",
    backgroundColor: "#e8e8e8",
    fontWeight: "bold",
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    fontSize: 7.5,
    borderRightWidth: 0.5,
  },
  valorCellVal: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    fontSize: 7.5,
  },

  // VIGENCIA TABLE (5 cols)
  vigTable: { borderWidth: 0.5, marginBottom: 6 },
  vigHeaderRow: { flexDirection: "row", backgroundColor: "#d0d0d0", borderBottomWidth: 0.5 },
  vigRow: { flexDirection: "row" },
  vigCellH: {
    flex: 1,
    fontWeight: "bold",
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7,
    textAlign: "center",
    borderRightWidth: 0.5,
  },
  vigCellHLast: {
    flex: 1,
    fontWeight: "bold",
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7,
    textAlign: "center",
  },
  vigCell: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7,
    textAlign: "center",
    borderRightWidth: 0.5,
  },
  vigCellLast: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7,
    textAlign: "center",
  },

  // VENDEDOR TABLE
  vendTable: { borderWidth: 0.5, marginBottom: 8 },
  vendHeaderRow: { flexDirection: "row", backgroundColor: "#d0d0d0", borderBottomWidth: 0.5 },
  vendRow: { flexDirection: "row" },
  vendCellH: {
    flex: 1,
    fontWeight: "bold",
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7.5,
    textAlign: "center",
    borderRightWidth: 0.5,
  },
  vendCellHLast: {
    flex: 1,
    fontWeight: "bold",
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7.5,
    textAlign: "center",
  },
  vendCell: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7.5,
    textAlign: "center",
    borderRightWidth: 0.5,
  },
  vendCellLast: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    fontSize: 7.5,
    textAlign: "center",
  },

  // FIRMAS
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  firmaCol: { alignItems: "center", width: "40%" },
  firmaBox: {
    width: 100,
    height: 80,
    borderWidth: 1,
    marginBottom: 6,
  },
  firmaLine: { borderTopWidth: 1, width: "100%", marginBottom: 3 },
  firmaLabel: { fontSize: 7.5, textAlign: "center" },

  // FIRMA SIMPLE (página 5)
  firmaColSingle: { alignItems: "flex-start", width: "50%", marginTop: 12 },

  // OBSERVACIONES
  obsBox: {
    borderWidth: 0.5,
    height: 40,
    marginBottom: 6,
    padding: 3,
  },

  // TEXTO CONDICIONES
  condTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textDecoration: "underline",
  },
  condSubTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 2,
  },
  condText: {
    fontSize: 7.2,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  condBold: { fontWeight: "bold" },

  // FOOTER
  footer: {
    position: "absolute",
    left: 35,
    bottom: 15,
    fontSize: 6.5,
    color: "#555",
  },

  // NOTA AL PIE (pág 2)
  nota: {
    fontSize: 6.8,
    lineHeight: 1.3,
    marginTop: 8,
    fontStyle: "italic",
  },
});

// ─── sub-componente: header por página ────────────────────────────────────

const PDFHeader: React.FC<{
  logoSrc?: string;
  codigo: string;
  fecha: string;
  agencia: string;
}> = ({ logoSrc, codigo, fecha, agencia }) => (
  <View style={S.header} fixed>
    {logoSrc ? <Image style={S.logo} src={logoSrc} /> : null}
    <View>
      <Text style={S.headerTitle}>Garantía extendida</Text>
      <Text style={S.headerMeta}>
        <Text style={S.headerMetaBold}>Código: </Text>{codigo}
      </Text>
      <Text style={S.headerMeta}>
        <Text style={S.headerMetaBold}>Fecha: </Text>{fecha}
      </Text>
      <Text style={S.headerMeta}>
        <Text style={S.headerMetaBold}>Agencia: </Text>{agencia}
      </Text>
    </View>
  </View>
);

// ─── sub-componente: fila tabla info ──────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string; last?: boolean }> = ({
  label,
  value,
  last,
}) => (
  <View style={last ? S.infoRowLast : S.infoRow}>
    <Text style={S.infoCellKey}>{label}</Text>
    <Text style={S.infoCellVal}>{value}</Text>
  </View>
);

// ─── servicios contratados (filas fijas) ──────────────────────────────────

const SERVICIOS = [
  {
    servicio:
      "GARANTIA EXTENDIDA 12 MESES/10.000 KM LO PRIMERO QUE OCURRA, PARA MOTOCICLETAS CON GARANTIAS DE FABRICA ENTRE 12 Y 20 MESES Ó 20.000 KMS, LO PRIMERO QUE OCURRA.",
    periodo:
      "12 MESES O 10 MIL KILOMETROS ADICIONALES, LO PRIMERA QUE OCURRA, QUE INICIAN CUANDO TERMINA LA GARANTIA DEL FABRICANTE.",
    condiciones:
      "CUMPLIR PLAN DE MANTENIMIENTO Y POLITICAS DEFINIDAS EN EL MANUAL DE MANTENIMIENTO Y GARANTIA/ ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DEL CREDITO Y DE LA GARANTIA EXTENDIDA.",
  },
  {
    servicio:
      "PARA MOTOCICLETAS QUE TENGAN UNA GARANTIA DE FABRICA DE 4 AÑOS Ó 50.000 KMS, LO QUE PRIMERO OCURRA, ESTA GARANTIA EXTENDIDA Y COMPLEMENTARIA LE RECONOCERA EL VALOR DE LA MANO DE OBRA DE LAS DOS ULTIMAS REVISIONES QUE DE ACUERDO AL PERIODO DEL CREDITO, DEBE REALIZARLE A SU MOTOCICLETA, TENIENDO EN CUENTA EL PLAN DE MANTENIMIENTO PREVENTIVO DEFINIDO POR EL FABRICANTE.",
    periodo:
      "DURANTE EL PERIODO DEL CREDITO Y CUMPLIENDO CON EL PLAN DE MANTENIMIENTO PREVENTIVO DEFINIDO POR EL FABRICANTE DE LA MOTOCICLETA.",
    condiciones:
      "CUMPLIR PLAN DE MANTENIMIENTO Y POLITICAS DEFINIDAS EN EL MANUAL DE MANTENIMIENTO Y GARANTIA/ ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DEL CREDITO Y DE LA GARANTIA EXTENDIDA.",
  },
  {
    servicio:
      "MOTOS USADAS: 3 MESES DE GARANTIA EN EL MOTOR CON OBSEQUIO EN EL CAMBIO DE ACEITE A LOS 3 MESES O 2.000 KM LO QUE PRIMERO OCURRA.",
    periodo:
      "3 MESES DE GARANTIA EN EL MOTOR CON OBSEQUIO EN EL CAMBIO DE ACEITE A LOS 3 MESES O 2.000 KM LO QUE PRIMERO OCURRA.",
    condiciones:
      "ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DEL CREDITO Y DE LA GARANTIA EXTENDIDA.",
  },
  {
    servicio:
      "MOTOS ELECTRICAS GRATIS MANO DE OBRA PARA LAS DOS ULTIMAS REVISIONES SEGÚN PLAN DE MANTENIMIENTO Y 6 MESES ADICIONALES A LA GARANTIA DE FABRICA.",
    periodo: "6 MESES ADICIONALES A LA GARANTIA DE FABRICA.",
    condiciones:
      "CUMPLIR PLAN DE MANTENIMIENTO Y POLITICAS DEFINIDAS EN EL MANUAL DE MANTENIMIENTO Y GARANTIA/ ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DEL CREDITO Y DE LA GARANTIA EXTENDIDA.",
  },
  {
    servicio:
      "TODAS LAS MOTOCICLETAS 70% PERDIDA TOTAL POR DAÑOS",
    periodo:
      "DURANTE EL PERIODO DEL CREDITO Y CUMPLIENDO CON EL PLAN DE MANTENIMIENTO PREVENTIVO DEFINIDO POR EL FABRICANTE DE LA MOTOCICLETA.",
    condiciones:
      "CUMPLIR PLAN MANTENIMIENTO/ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DE LA GARANTIA EXTENDIDA/CUMPLIR CON TRAMITES LEGALES Y TRASPASOS",
  },
  {
    servicio:
      "TODAS LAS MOTOCICLETAS 70% DEL VALOR DE LA MOTO POR PERDIDA TOTAL POR HURTO",
    periodo:
      "DURANTE EL PERIODO DEL CREDITO Y CUMPLIENDO CON EL PLAN DE MANTENIMIENTO PREVENTIVO DEFINIDO POR EL FABRICANTE DE LA MOTOCICLETA.",
    condiciones:
      "CUMPLIR PLAN MANTENIMIENTO/ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DE LA GARANTIA EXTENDIDA/CUMPLIR CON TRAMITES LEGALES Y TRASPASOS",
  },
  {
    servicio:
      "TODAS LAS MOTOCICLETAS 10% DE DESCUENTO EN REPUESTOS Y MANO DE OBRA DURANTE TODO EL PERIODO DEL CREDITO.",
    periodo: "DURANTE EL PERIODO DEL CREDITO",
    condiciones:
      "ESTAR AL DIA POR TODO CONCEPTO CON EL PAGO DE LA GARANTIA EXTENDIDA.",
  },
  {
    servicio:
      "SEGURO CONTRA ACCIDENTES PERSONALAS (AP) POR $10'000.000 EN CASO DE FALLECIMIENTO O INVALIDEZ",
    periodo: "DURANTE EL PERIODO DEL CREDITO",
    condiciones: "ESTAR AL DIA POR TODO CONCEPTO.",
  },
];

// ─── componente principal ─────────────────────────────────────────────────

export const GarantiaExtendidaPDFDoc: React.FC<GarantiaExtendidaPDFProps> = ({
  codigo,
  fecha,
  agencia,
  logoSrc,
  nombreTitular,
  ccTitular,
  direccionTitular,
  ciudadTitular,
  telefonoTitular,
  emailTitular,
  nombreBeneficiario,
  ccBeneficiario,
  marca,
  linea,
  modelo,
  color,
  numeroMotor,
  numeroChasis,
  placa,
  tipoServicio = "Particular",
  codigoFasecolda = "",
  ciudadMatricula = "",
  valorMotoNum,
  garantiaAnios = 3,
  fechaDesde = "",
  fechaHasta = "",
  fechaExpedicion = fecha,
  ciudadExpedicion = ciudadTitular,
  formaPago = "Crédito",
  codigoVendedor = "",
  nombreVendedor = "",
  puntoDeVenta = agencia,
}) => {
  const benefNombre = safe(nombreBeneficiario, nombreTitular);
  const benefCc = safe(ccBeneficiario, ccTitular);

  const pct = 0.13;
  const valorAnio = Math.round(valorMotoNum * pct);
  const valorTotal = valorAnio * garantiaAnios;

  const headerProps = { logoSrc, codigo, fecha, agencia };

  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 1 — Titular + Moto + Servicios
      ═══════════════════════════════════════════════════════════ */}
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        <Text style={S.centerBold}>GARANTÍA EXTENDIDA Y COMPLEMENTARIA</Text>

        {/* TITULAR */}
        <Text style={S.sectionLabel}>NOMBRE DEL TITULAR</Text>
        <View style={S.infoTable}>
          <InfoRow label="NOMBRE O RAZÓN SOCIAL" value={safe(nombreTitular)} />
          <InfoRow label="NIT O NÚMERO DE IDENTIFICACIÓN" value={`CC. No. ${safe(ccTitular)}`} />
          <InfoRow label="DIRECCIÓN" value={safe(direccionTitular)} />
          <InfoRow label="CIUDAD" value={safe(ciudadTitular)} />
          <InfoRow label="TELÉFONO FIJO Y CELULAR" value={`${safe(telefonoTitular)} / ${safe(telefonoTitular)}`} />
          <InfoRow label="CORREO ELECTRÓNICO" value={safe(emailTitular)} last />
        </View>

        {/* BENEFICIARIO */}
        <Text style={S.sectionLabel}>INFORMACIÓN DEL BENEFICIARIO</Text>
        <View style={S.infoTable}>
          <InfoRow label="NOMBRE O RAZÓN SOCIAL" value={safe(benefNombre)} />
          <InfoRow label="NIT O NÚMERO DE IDENTIFICACIÓN" value={`CC. No. ${safe(benefCc)}`} last />
        </View>

        {/* MOTO */}
        <Text style={S.sectionLabel}>INFORMACIÓN BÁSICA DE LA GARANTÍA EXTENDIDA Y COMPLEMENTARIA</Text>
        <View style={S.infoTable}>
          <InfoRow label="MARCA DE LA MOTO" value={safe(marca)} />
          <InfoRow label="LÍNEA DE LA MOTO" value={safe(linea)} />
          <InfoRow label="MODELO" value={safe(modelo)} />
          <InfoRow label="COLOR" value={safe(color)} />
          <InfoRow label="NÚMERO DE MOTOR" value={safe(numeroMotor)} />
          <InfoRow label="NÚMERO DE CHASIS" value={safe(numeroChasis)} />
          <InfoRow label="NÚMERO DE SERIE" value={safe(numeroChasis)} />
          <InfoRow label="PLACA" value={safe(placa)} />
          <InfoRow label="TIPO DE SERVICIO" value={safe(tipoServicio)} />
          <InfoRow label="CÓDIGO FASECOLDA" value={safe(codigoFasecolda)} />
          <InfoRow label="CIUDAD MATRÍCULA" value={safe(ciudadMatricula)} last />
        </View>

        {/* SERVICIOS */}
        <Text style={S.sectionLabel}>SERVICIOS CONTRATADOS</Text>
        <View style={S.servTable}>
          <View style={S.servHeaderRow}>
            <Text style={[S.servCellH, S.colServicio]}>SERVICIOS CONTRATADOS</Text>
            <Text style={[S.servCellH, S.colPeriodo]}>PERIODO</Text>
            <Text style={[S.servCellH, S.colCondiciones]}>CONDICIONES</Text>
          </View>
          {SERVICIOS.map((row, i) => (
            <View style={S.servRow} key={i} wrap={false}>
              <Text style={[S.servCell, S.colServicio]}>{row.servicio}</Text>
              <Text style={[S.servCell, S.colPeriodo]}>{row.periodo}</Text>
              <Text style={[S.servCell, S.colCondiciones]}>{row.condiciones}</Text>
            </View>
          ))}
        </View>

        {/* VALOR CONTRATO */}
        <Text style={S.sectionLabel}>VALOR CONTRATO GARANTIA EXTENDIDA Y COMPLEMENTARIA</Text>
        <View style={S.valorTable} wrap={false}>
          {Array.from({ length: garantiaAnios }, (_, i) => (
            <View style={S.valorRow} key={i}>
              <Text style={S.valorCellKey}>AÑO {i + 1} (13% VALOR MOTO)</Text>
              <Text style={S.valorCellVal}>{fmtCOP(valorAnio)}</Text>
            </View>
          ))}
          <View style={S.valorRowLast}>
            <Text style={[S.valorCellKey, { backgroundColor: "#c0c0c0" }]}>TOTAL</Text>
            <Text style={S.valorCellVal}>{fmtCOP(valorTotal)}</Text>
          </View>
        </View>

        {/* VIGENCIA */}
        <Text style={S.sectionLabel}>VIGENCIA DEL CONTRATO</Text>
        <View style={S.vigTable} wrap={false}>
          <View style={S.vigHeaderRow}>
            <Text style={S.vigCellH}>DESDE</Text>
            <Text style={S.vigCellH}>HASTA</Text>
            <Text style={S.vigCellH}>FECHA DE EXPEDICIÓN</Text>
            <Text style={S.vigCellH}>CIUDAD DE EXPEDICIÓN</Text>
            <Text style={S.vigCellHLast}>FORMA DE PAGO</Text>
          </View>
          <View style={S.vigRow}>
            <Text style={S.vigCell}>{safe(fechaDesde)}</Text>
            <Text style={S.vigCell}>{safe(fechaHasta)}</Text>
            <Text style={S.vigCell}>{safe(fechaExpedicion)}</Text>
            <Text style={S.vigCell}>{safe(ciudadExpedicion)}</Text>
            <Text style={S.vigCellLast}>{safe(formaPago)}</Text>
          </View>
        </View>

        {/* OBSERVACIONES */}
        <Text style={S.sectionLabel}>OBSERVACIONES</Text>
        <View style={S.obsBox} />

        {/* VENDEDOR */}
        <Text style={S.sectionLabel}>INFORMACIÓN DEL VENDEDOR</Text>
        <View style={S.vendTable} wrap={false}>
          <View style={S.vendHeaderRow}>
            <Text style={S.vendCellH}>CÓDIGO VENDEDOR</Text>
            <Text style={S.vendCellH}>NOMBRE VENDEDOR</Text>
            <Text style={S.vendCellHLast}>PUNTO DE VENTA</Text>
          </View>
          <View style={S.vendRow}>
            <Text style={S.vendCell}>{safe(codigoVendedor)}</Text>
            <Text style={S.vendCell}>{safe(nombreVendedor)}</Text>
            <Text style={S.vendCellLast}>{safe(puntoDeVenta)}</Text>
          </View>
        </View>

        {/* FIRMAS */}
        <View style={S.firmasRow} wrap={false}>
          <View style={S.firmaCol}>
            <View style={S.firmaBox} />
            <View style={S.firmaLine} />
            <Text style={S.firmaLabel}>Firma autorizada</Text>
          </View>
          <View style={S.firmaCol}>
            <View style={S.firmaBox} />
            <View style={S.firmaLine} />
            <Text style={S.firmaLabel}>Firma vendedor</Text>
          </View>
        </View>

        <Text style={S.nota}>
          Nota: Este documento solo es válido si está acompañado del recibo de caja cuando su compra es de contado o de la carta de aprobación del cupo de crédito que cubre su valor si su compra es a crédito o credicontado.
        </Text>

        <Text style={S.footer}>{FOOTER_EMPRESA}</Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 2 — Condiciones generales (parte 1)
      ═══════════════════════════════════════════════════════════ */}
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        <Text style={S.condTitle}>
          GARANTIA EXTENDIDA Y COMPLEMENTARIA DE MOTOCICLETA - {EMPRESA} - NIT. {NIT_EMPRESA}
        </Text>
        <Text style={[S.condText, { fontWeight: "bold" }]}>Válido por {garantiaAnios * 12} meses</Text>

        <Text style={S.condSubTitle}>CONDICIONES GENERALES</Text>
        <Text style={S.condText}>
          Las partes en el presente contrato son: De un lado {EMPRESA}, quien en adelante se denominará "LA COMPAÑIA", en el otro lado el adquirente, en adelante "EL TITULAR" y por último el "EL BENEFICIARIO" que será la persona que defina EL TITULAR como su beneficiario en caso de fallecer o cuando esta GARANTIA EXTENDIA Y COMPLEMENTARIA se pague a crédito, EL BENEFICIARIO será la empresa acreedora prendaria que aparezca en la tarjeta de propiedad de la motocicleta, con el fin de saldar el saldo insoluto que se adeude por concepto del pago de esta GARANTIA EXTENDIA Y COMPLEMENTARIA al momento de cualquier siniestro.
        </Text>
        <Text style={S.condText}>
          LA COMPAÑÍA con sujeción a las declaraciones contenidas en los datos proporcionados, a través de cualquier medio establecido en el presente contrato, otorga a EL TITULAR los beneficios contratados (previo al cumplimiento de las obligaciones contenidas en el presente documento), la cual opera UNICAMENTE para cubrir:
        </Text>

        <Text style={S.condSubTitle}>COBERTURAS</Text>
        <Text style={S.condText}>
          Mano de obra y repuestos en caso de falla en el motor en el segundo y tercer año después de la compra del vehículo o entre los 15.000 y los 30.000 kilómetros, lo primero que ocurra, teniendo en cuenta que el primer año y los primeros 15.000 kilómetros los cubre la garantía ofrecida por la ensambladora, siempre y cuando cumpla a cabalidad con el plan de mantenimiento entregado a 24 o 36 meses según sea el servicio contratado o al momento de ocurrir la falla, por ejemplo, si el vehículo presenta alguna falla que amerite una reparación que incluya además de la mano de obra algunos repuestos a los 25.000 km y la motocicleta tiene 30 meses de uso y el servicio contratado cubre estos eventos hasta los 36.000 kilómetros o tres (3) años, este vehículo debe haber asistido sin falta a todas las revisiones o mantenimientos preventivos y cambios de aceite definidos en el plan de mantenimiento preventivo contratado para esta GARANTIA EXTENDIDA Y COMPLEMENTARIA.
        </Text>
        <Text style={S.condText}>
          APP SISIPRO donde encontrara vía llamada telefónica las 24 horas del día y los 7 días de la semana, asesoría jurídica en caso de accidente o robo (no cubre asistencia jurídica), se requiere que EL TITULAR haya pagado la totalidad del valor de los servicios contratados, si la compra se realiza de estricto contado o en su defecto EL TITULAR haya pagado la primera cuota, si la compra se realiza bajo la modalidad de credi contado o crédito y para continuar con este servicio se debe mantener al día con los pagos acordados.
        </Text>
        <Text style={S.condText}>
          PERDIDA TOTAL del vehículo, estos son, hurto o daños superiores al 75% del valor de compra del bien, el cual será diagnosticado sólo en los talleres autorizados por LA COMPAÑÍA, siempre y cuando el accidente o el hurto ocurran durante la vigencia del contrato, EL TITULAR haya pagado la totalidad del valor del servicio contratado o en su defecto se encuentre al día en el pago de las cuotas del presente contrato y se cumplan lo siguiente:
        </Text>
        <Text style={S.condText}>
          <Text style={S.condBold}>ACCIDENTAL: </Text>LA COMPAÑÍA se compromete a hacer efectivo el servicio contratado por perdida del bien mueble identificado en la caratula del presente contrato, en caso de que el bien sufra un accidente durante su vigencia, causando la destrucción del mismo, o cuando sea sujeto pasivo o víctima de hurto calificado o hurto simple y siempre que el vehículo no sea recuperado antes de hacer efectiva la GARANTIA EXTENDIDA Y COMPLEMENTARIA. La indemnización durante la vigencia del contrato será del{" "}
          <Text style={S.condBold}>70% (Setenta por ciento)</Text> del valor que se pagó por la motocicleta al momento de la compra de la misma (aplican descuentos y precios de promoción) valor que se le aplicara a los saldos existentes si los hubiere del valor de la motocicleta y también se tendrán en cuenta si existen saldos de esta GARANTIA EXTENDIDA Y COMPLEMENTARIA y si aún quedara un saldo a favor del titular, este valor se le aplicara para la compra de una nueva motocicleta de los productos de LA COMPAÑIA, esto es: Valor motocicleta + IVA; y en los años siguientes, de acuerdo a la duración del contrato, se repondrá el 70% del valor comercial establecido por FASECOLDA proporcionado al momento de la renovación o adquisición de GARANTIA EXTENDIDA Y COMPLEMENTARIA para motocicleta usada. En caso de adquirir la GARANTIA EXTENDIA Y COMPLEMENTARIA financiada, los efectos del presente contrato solo regirán a partir de la confirmación efectiva del pago de la primera cuota.
        </Text>

        <Text style={S.condSubTitle}>DEFINICIONES</Text>
        <Text style={S.condText}>
          <Text style={S.condBold}>LA COMPAÑÍA: </Text>Empresa distribuidora de motocicletas encargada de la venta de esta GARANTIA EXTENDIA Y COMPLEMENTARIA y eventualmente beneficiario de la indemnización contratada de esta garantía, en caso de que EL TITULAR no se encuentra a paz y salvo con la venta de la garantía extendida y complementaria.
        </Text>
        <Text style={S.condText}>
          <Text style={S.condBold}>TITULAR: </Text>Persona que, obrando por cuenta propia, adquiere esta GARANTIA EXTENDIA Y COMPLEMENTARIA de vehículo. Será expresamente individualizado en la caratula del contrato.
        </Text>
        <Text style={S.condText}>
          <Text style={S.condBold}>BENEFICIARIO: </Text>Es la persona designada por EL TITULAR para recibir la indemnización contratada. O EL ACREEDOR PRENDARIO en caso de haber adquirido un crédito para la compra de la motocicleta y/o de la garantía extendida y complementaria, hasta el monto del crédito adquirido, en caso de existir saldo, éste se entregará al BENEFICIARIO en el orden establecido en la caratula del presente documento.
        </Text>

        <Text style={S.condSubTitle}>CLÁUSULA PRIMERA:</Text>
        <Text style={S.condText}>
          LA COMPAÑÍA se obliga a reconocer los valores a los cuales tiene derecho EL TITULAR, Si: 1.1. Así se ha indicado expresamente en la caratula del contrato de GARANTIA EXTENDIDA Y COMPLEMENTARIA y se encuentra a paz y salvo con la COMPAÑÍA y con el CREDITO adquirido. 1.2. Se notifica a LA COMPAÑÍA dentro de los tres (3) días calendario siguientes, contados a partir de la fecha del accidente o del hurto del bien (motocicleta) que EL CONTRATANTE vinculó por medio del presente contrato, todos los gastos que se generen en el proceso de reclamación estarán a cargo de EL TITULAR. En caso de hurto, EL TITULAR debe aportar el denuncio por hurto ante las autoridades competentes y la documentación específica de traspaso a nombre de LA COMPAÑÍA y cancelación de la matrícula del bien por este motivo, con lo cual, de ser recuperado el bien, será de propiedad de LA COMPAÑÍA. En caso de pérdida total por accidente EL TITULAR estará a cargo de los gastos de traspaso del vehículo a nombre de LA COMPAÑÍA y cancelación de matrícula, en caso de ser necesaria (Instrucción dada por LA COMPAÑÍA). 1.3. El vehículo es destruido a causa de un hecho catastrófico natural como terremoto, inundación o maremoto. 1.4. Si a causa de un accidente en el vehículo objeto de este contrato EL TITULAR fallece y el vehículo resultara en pérdida total, la indemnización producto de la GARANTIA EXTENDIA Y COMPLEMENTARIA se le otorgará primero AL ACREEDOR que aparezca en la tarjeta de propiedad como ACREEDOR PRENDARIO, hasta el monto de la deuda para efectuar el pago total del crédito que ampara el gravamen prendario y, de presentarse saldo, a quien aparezca como beneficiario, en la caratula del contrato. 1.5. A EL TITULAR le corresponderá pagar el valor total de los trámites ante la Secretaria de Tránsito y Transporte correspondiente. En caso de poseer crédito vigente por la adquisición de la motocicleta objeto del presente contrato, el pago se hará al ACREEDOR PRENDARIO primer BENEFICIARIO quien debe aparecer en la tarjeta de propiedad de la motocicleta en calidad de acreedor prendario; en caso de presentarse saldo a favor de EL TITULAR, éste se pagará al TITULAR mediante consignación a la cuenta bancaria que nos indique, o al segundo BENEFICIARIO si EL TITULAR así lo desea. En caso de realizarse la reposición por una motocicleta nueva, el mayor valor del vehículo nuevo, será asumido por EL TITULAR. 1.6. Al momento de la reclamación el vehículo deberá tener SOAT vigente. En caso de tener comparendos estos deberán ser pagados por EL TITULAR para proceder con los trámites de traspaso, o traspaso y cancelación de matrícula, según sea el caso. 1.7. Los gastos generados en el trámite de la reclamación de la GARANTIA EXTENDIA Y COMPLEMENTARIA serán cubiertos en su totalidad por EL TITULAR.
        </Text>

        <Text style={S.condSubTitle}>CLÁUSULA SEGUNDA: EXCLUSIONES.</Text>
        <Text style={S.condText}>
          No habrá Lugar a otorgamiento de la GARANTIA EXTENDIA Y COMPLEMENTARIA en los siguientes eventos: 2.1. Cuando el vehículo sea utilizado en terrenos no apropiados y a raíz de la indebida utilización (competencias deportivas, sobrepeso, no acatar las recomendaciones del fabricante), el bien sea destruido en el porcentaje ya estipulado. 2.2. Cuando el vehículo sea utilizado en alquiler o arrendamiento sin haberse obtenido autorización expresa y de manera escrita por parte de LA COMPAÑÍA. 2.3. Cuando las pérdidas, daños, responsabilidad legal o muerte ocurran llevando a cabo cualquier actividad delictiva. 2.4. Cuando el vehículo sea recuperado antes de LA COMPAÑÍA hacer efectivo el presente contrato de GARANTIA EXTENDIDA Y COMPLEMENTARIA. 2.5. Por presentarse dolo o culpa grave de EL TITULAR o de sus familiares hasta el tercer grado de consanguinidad, segundo de afinidad y único civil. 2.7. En caso de que el contrato sea adquirido a crédito y EL TITULAR se encuentre en mora de pagar la cuota correspondiente, el contrato será suspendido y por tal razón en caso de accidente o de hurto no habrá lugar al pago de ninguno de los servicios contratados.
        </Text>
        <Text style={S.condText}>
          PARAGRAFO I: Este contrato no se podrá suscribir con personas que posean un diagnóstico de incapacidad total y permanente o que presenten perdida del cincuenta por ciento (50 %) de la audición o de la visión, así como aquellos que presenten incapacidad total o funcional de ambas piernas o ambas manos, o una pierna y una mano simultáneamente.
        </Text>
        <Text style={S.condText}>
          PARAGRAFO II: Se excluye del reconocimiento del derecho contenido en el presente contrato a acreedores de EL TITULAR, lo que significa que los titulares del derecho serán única y exclusivamente EL CONTRATANTE, EL TITULAR y los BENEFICIARIOS designados por el TITULAR.
        </Text>

        <Text style={S.condSubTitle}>CLÁUSULA TERCERA — CLÁUSULA CUARTA: DOCUMENTOS ANEXOS.</Text>
        <Text style={S.condText}>
          El presente contrato, junto con la solicitud emitida por EL TITULAR o la solicitud suscrita por EL BENEFICIARIO que aparezca como acreedor prendario, los documentos del vehículo vigentes, documentación requerida por LA COMPAÑÍA y demás documentos anexos, si los hubiere, constituyen la totalidad del contrato.
        </Text>

        <Text style={S.condSubTitle}>CLÁUSULA QUINTA: AUTORIZACIÓN TRATAMIENTO DATOS PERSONALES.</Text>
        <Text style={S.condText}>
          De conformidad con lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377 de 2013, declaro que entrego de forma libre y voluntaria los siguientes datos personales: Nombres y apellidos, documento de identificación, genero, dirección, ciudad, departamento, teléfonos, celular, fecha de nacimiento, correo electrónico a nombre propio, MOTO PARA TODOS S.A.S actúa como responsable del tratamiento de mis datos personales y en caso de existir una compañía que financie este producto y quien por esta condición, será BENEFICIARIO de este contrato, en caso de presentarse algún siniestro, este BENEFICIARIO actuara como encargado del tratamiento de mis datos personales.{"\n"}
          PRIMERO: autorizo a {EMPRESA} a dar tratamiento a mis datos personales para: 1) el desarrollo de su objeto social y de la relación contractual; 2) la administración de los productos y servicios comercializados; 3) la estructuración de ofertas comerciales; 4) Adopción de medidas tendientes a la prevención de actividades ilícitas.{"\n"}
          SEGUNDO: autorizo de manera irrevocable a {EMPRESA} para que consulte, solicite, suministre y reporte información referida a mi comportamiento crediticio, financiero, comercial y de servicios a cualquier operador de información debidamente constituido.{"\n"}
          Para ejercer los derechos anteriormente descritos puede contactarse a finanzas@motoparatodos.com o al teléfono 3015756818.
        </Text>

        <Text style={S.condSubTitle}>CLÁUSULA SEXTA: AVISO DE PRIVACIDAD.</Text>
        <Text style={S.condText}>
          Responsable: {EMPRESA} identificado con NIT. {NIT_EMPRESA}. De conformidad con la ley 1581 de 2012, los datos personales que usted nos ha entregado harán parte de nuestra base de datos para medir niveles de satisfacción, informar sobre campañas de servicio, comunicar campañas promocionales, realizar encuestas, ejecutar campañas de fidelización, enviar invitaciones a eventos, realizar actualización de datos, ofrecimiento de productos y servicios. Dirección: Av. 3 Nte. #40 238, Prados Norte, Cali, Valle del Cauca; Teléfonos: 3015756818; finanzas@motoparatodos.com
        </Text>

        {/* FIRMAS pág 2 */}
        <View wrap={false}>
          <View style={S.firmasRow}>
            <View style={S.firmaCol}>
              <View style={S.firmaBox} />
              <View style={S.firmaLine} />
              <Text style={S.firmaLabel}>EMPRESA</Text>
              <Text style={S.firmaLabel}>Firma autorizada</Text>
            </View>
            <View style={S.firmaCol}>
              <View style={S.firmaBox} />
              <View style={S.firmaLine} />
              <Text style={S.firmaLabel}>TITULAR</Text>
              <Text style={S.firmaLabel}>{safe(nombreTitular)}</Text>
              <Text style={S.firmaLabel}>CC. No. {safe(ccTitular)}</Text>
            </View>
          </View>

          <View style={[S.firmasRow, { justifyContent: "flex-start", marginLeft: 40 }]}>
            <View style={S.firmaCol}>
              <View style={S.firmaBox} />
              <View style={S.firmaLine} />
              <Text style={S.firmaLabel}>BENEFICIARIO</Text>
              <Text style={S.firmaLabel}>{safe(benefNombre)}</Text>
              <Text style={S.firmaLabel}>CC. No. {safe(benefCc)}</Text>
            </View>
          </View>
        </View>

        <Text style={S.footer}>{FOOTER_EMPRESA}</Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 3 — Acreedor prendario + aceptación
      ═══════════════════════════════════════════════════════════ */}
      <Page size="LETTER" style={S.page}>
        <PDFHeader {...headerProps} />

        <Text style={[S.sectionLabel, { marginBottom: 6 }]}>Acreedor prendario</Text>
        <Text style={[S.condText, { marginBottom: 10 }]}>Firma</Text>

        <Text style={S.condText}>
          Declaro que he recibido y acepto la información contenida en el presente contrato de GARANTIA EXTENDIDA Y COMPLEMENTARIA.
        </Text>

        <Text style={[S.sectionLabel, { marginTop: 10 }]}>Motocicleta:</Text>
        <View style={S.infoTable}>
          <InfoRow label="MARCA DE LA MOTO" value={safe(marca)} />
          <InfoRow label="LÍNEA DE LA MOTO" value={safe(linea)} />
          <InfoRow label="MODELO" value={safe(modelo)} />
          <InfoRow label="COLOR" value={safe(color)} />
          <InfoRow label="NÚMERO DE MOTOR" value={safe(numeroMotor)} />
          <InfoRow label="NÚMERO DE CHASIS" value={safe(numeroChasis)} />
          <InfoRow label="PLACA" value={safe(placa)} last />
        </View>

        <View wrap={false} style={{ marginTop: 16 }}>
          <View style={S.firmaBox} />
          <View style={S.firmaLine} />
          <Text style={S.firmaLabel}>TITULAR</Text>
          <Text style={S.firmaLabel}>{safe(nombreTitular)}</Text>
          <Text style={S.firmaLabel}>CC. No. {safe(ccTitular)}</Text>
        </View>

        <Text style={S.footer}>{FOOTER_EMPRESA}</Text>
      </Page>
    </Document>
  );
};
