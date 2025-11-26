// Pagina12.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  borderBox: {
    flex: 1,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  logoBox: {
    width: 110,
    marginRight: 15,
  },
  logo: {
    width: 110,
    height: 60,
    objectFit: "contain",
  },
  headerRight: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 8.1,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  strong: {
    fontWeight: "bold",
  },
  table: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 0.7,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellLabel: {
    width: "20%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCellValue: {
    width: "30%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina12Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  acreedorNombre: string;   // VERIFICARTE AAA S.A.S
  acreedorNit: string;      // NIT

  deudorNombre: string;
  deudorCc: string;

  // datos vehículo
  marca: string;
  tipo: string;
  motor: string;
  color: string;
  linea: string;
  chasis: string;
  modelo: string;
  servicio: string;

  logoSrc?: string;
}

export const Pagina12: React.FC<Pagina12Props> = ({
  codigo,
  fecha,
  ciudad,
  acreedorNombre,
  acreedorNit,
  deudorNombre,
  deudorCc,
  marca,
  tipo,
  motor,
  color,
  linea,
  chasis,
  modelo,
  servicio,
  logoSrc,
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.borderBox}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          {logoSrc && <Image style={styles.logo} src={logoSrc} />}
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.mainTitle}>Paquete de crédito</Text>
          <Text style={styles.headerMeta}>Código: {codigo}</Text>
          <Text style={styles.headerMeta}>Fecha: {fecha}</Text>
          <Text style={styles.headerMeta}>Ciudad: {ciudad}</Text>
        </View>
      </View>

      {/* TÍTULOS */}
      <Text style={styles.sectionTitle}>PRENDA SIN TENENCIA DEL ACREEDOR</Text>
      <Text style={styles.subTitle}>PERSONA NATURAL</Text>

      {/* INTRODUCCIÓN DEL CONTRATO */}
      <Text style={styles.paragraph}>
        El presente contrato se celebra entre los suscritos a saber: por un
        lado, <Text style={styles.strong}>{acreedorNombre}</Text>, sociedad
        legalmente constituida identificada con NIT {acreedorNit}, quien para
        efectos del presente documento se denominará{" "}
        <Text style={styles.strong}>LA ACREEDORA</Text>; y por otra parte{" "}
        <Text style={styles.strong}>{deudorNombre}</Text>, mayor de edad,
        identificado con cédula de ciudadanía No. {deudorCc}, quien en adelante
        se denominará <Text style={styles.strong}>EL DEUDOR</Text>. Entre las
        partes se celebra un contrato de prenda comercial abierta de primer
        grado sin tenencia del acreedor, que se regirá por las siguientes
        cláusulas:
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>PRIMERA. OBJETO:</Text> EL DEUDOR
        constituye a favor de <Text style={styles.strong}>
          {acreedorNombre}
        </Text>{" "}
        derecho de prenda abierta sin tenencia para garantizar a LA ACREEDORA
        el cumplimiento de obligaciones de crédito hasta por la suma que se
        pacte en los documentos correspondientes.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEGUNDA. ESPECIFICACIONES DEL BIEN:</Text>{" "}
        La prenda recae sobre el siguiente vehículo automotor de su exclusiva
        propiedad:
      </Text>

      {/* TABLA VEHÍCULO */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MARCA</Text>
          <Text style={styles.tableCellValue}>{marca}</Text>
          <Text style={styles.tableCellLabel}>TIPO</Text>
          <Text style={styles.tableCellValue}>{tipo}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MOTOR</Text>
          <Text style={styles.tableCellValue}>{motor}</Text>
          <Text style={styles.tableCellLabel}>COLOR</Text>
          <Text style={styles.tableCellValue}>{color}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>CHASIS</Text>
          <Text style={styles.tableCellValue}>{chasis}</Text>
          <Text style={styles.tableCellLabel}>LÍNEA</Text>
          <Text style={styles.tableCellValue}>{linea}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MODELO</Text>
          <Text style={styles.tableCellValue}>{modelo}</Text>
          <Text style={styles.tableCellLabel}>SERVICIO</Text>
          <Text style={styles.tableCellValue}>{servicio}</Text>
        </View>
      </View>

      {/* ALGUNAS CLÁUSULAS RESUMIDAS */}
      <Text style={styles.paragraph}>
        <Text style={styles.strong}>TERCERA. TENENCIA E INSPECCIÓN:</Text> EL
        DEUDOR conserva la tenencia del vehículo dado en prenda, pero está
        obligado a permitir a LA ACREEDORA o a quien ésta designe la inspección
        del bien para comprobar su estado y existencia, así como a mantenerlo
        asegurado y en correcto funcionamiento.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>CUARTA. GRAVAMEN DE PRENDA:</Text> El
        gravamen prendarío garantiza a LA ACREEDORA todas las obligaciones que
        surjan a favor suyo, presentes o futuras, hasta el monto que se pacte
        en los documentos de crédito; la prenda se mantendrá vigente mientras
        exista saldo de la obligación.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>QUINTA. VENCIMIENTO ANTICIPADO:</Text> El
        incumplimiento del DEUDOR en el pago de las cuotas o en cualquiera de
        sus obligaciones permitirá a LA ACREEDORA declarar vencida la obligación
        y hacer exigible en forma inmediata el pago total de la deuda garantizada
        con la prenda.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEXTA. SEGUROS:</Text> EL DEUDOR se
        compromete a mantener vigente el seguro sobre el vehículo objeto de la
        prenda, cediendo en favor de LA ACREEDORA los derechos derivados de la
        póliza hasta por el valor de la deuda.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SÉPTIMA. GASTOS Y HONORARIOS:</Text> Todos
        los gastos judiciales, extrajudiciales, de cobranza, seguros, impuestos
        y demás costos ocasionados por el incumplimiento serán de cargo del
        DEUDOR.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA QUINTA. JURISDICCIÓN:</Text> Para
        todos los efectos derivados del presente contrato, las partes fijan
        como domicilio contractual la ciudad de {ciudad}, renunciando a cualquier
        otro fuero.
      </Text>

      {/* FOOTER */}
      <Text style={styles.footer}>
        {acreedorNombre} {"\n"}
        NIT. {acreedorNit}
      </Text>
    </View>
  </Page>
);
