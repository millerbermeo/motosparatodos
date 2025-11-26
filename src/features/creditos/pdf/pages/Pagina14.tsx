// Pagina14.tsx
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

export interface Pagina14Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  acreedorNombre: string;
  acreedorNit: string;

  deudorNombre: string;
  deudorCc: string;

  // datos del vehículo
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

export const Pagina14: React.FC<Pagina14Props> = ({
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

      {/* TEXTO (similar a la pág. 12) */}
      <Text style={styles.paragraph}>
        El presente contrato se celebra entre los suscritos a saber: por un
        lado, <Text style={styles.strong}>{acreedorNombre}</Text>, sociedad
        legalmente constituida identificada con NIT {acreedorNit}, quien en
        adelante se denominará <Text style={styles.strong}>LA ACREEDORA</Text>;
        y por otra parte <Text style={styles.strong}>{deudorNombre}</Text>,
        mayor de edad, identificado con cédula de ciudadanía No. {deudorCc},
        quien en adelante se denominará <Text style={styles.strong}>EL DEUDOR</Text>.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>PRIMERA. OBJETO:</Text> EL DEUDOR
        constituye a favor de <Text style={styles.strong}>
          {acreedorNombre}
        </Text>{" "}
        derecho de prenda abierta sin tenencia para garantizar a LA ACREEDORA el
        cumplimiento de las obligaciones de crédito hasta por la suma que se
        pacte en los documentos correspondientes.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SEGUNDA. ESPECIFICACIONES DEL BIEN PRENDADO:
        </Text>{" "}
        La prenda recae sobre el siguiente vehículo automotor de exclusiva
        propiedad del DEUDOR:
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

      {/* CLÁUSULAS RESUMIDAS (como en el escaneo) */}
      <Text style={styles.paragraph}>
        <Text style={styles.strong}>TERCERA. TENENCIA E INSPECCIÓN:</Text> EL
        DEUDOR conserva la tenencia del vehículo a nombre de LA ACREEDORA en
        calidad de prenda y se obliga a permitir la inspección del bien, así
        como mantenerlo en adecuado estado de uso y conservación.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>CUARTA. GRAVAMEN:</Text> El gravamen de
        prenda garantiza a LA ACREEDORA todas las obligaciones que por
        cualquier causa tenga a su favor frente al DEUDOR, presentes o futuras,
        hasta el monto que se pacte en los respectivos títulos valores.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>QUINTA. CRÉDITOS RESPALDADOS:</Text> Los
        créditos respaldados podrán constar en pagarés, contratos o cualquier
        otro documento en el que figure EL DEUDOR como deudor, avalista o
        codeudor.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEXTA. FECHA DE VENCIMIENTO:</Text> Para
        los efectos legales se tomará como fecha de vencimiento la de la
        obligación garantizada por la prenda; vencida la obligación sin que sea
        cancelada, LA ACREEDORA podrá hacer efectivos sus derechos sobre el
        bien prendado.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA TERCERA.:</Text> El incumplimiento
        de cualquiera de las obligaciones del DEUDOR faculta a LA ACREEDORA
        para exigir el pago inmediato de la totalidad del saldo pendiente y
        ejercer las acciones judiciales y extrajudiciales a que haya lugar.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA CUARTA.:</Text> Esta prenda se
        entenderá vigente mientras existan obligaciones a cargo del DEUDOR a
        favor de LA ACREEDORA, aun cuando se renueven o reestructuren las
        obligaciones, sin necesidad de constituir una nueva prenda.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA QUINTA.:</Text> Para todos los
        efectos derivados del presente contrato, las partes fijan como
        domicilio contractual la ciudad de {ciudad}, renunciando a cualquier
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
