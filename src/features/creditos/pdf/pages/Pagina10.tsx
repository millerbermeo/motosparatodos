// Pagina10.tsx
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
    marginTop: 6,
    marginBottom: 8,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
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
  line: {
    textDecoration: "underline",
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
    width: "40%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCellValue: {
    width: "60%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
  },
  firmaTexto: {
    fontSize: 8.1,
    marginTop: 10,
    marginBottom: 12,
  },
  signatureBlock: {
    marginTop: 4,
    width: 180,
  },
  signatureBox: {
    width: 90,
    height: 100,
    borderWidth: 1,
    marginBottom: 10,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 3,
  },
  firmaLabel: {
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina10Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  deudorNombre: string;
  deudorCc: string;
  deudorCiudadExpedicion: string;

  // datos de la moto
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  numeroMotor: string;
  numeroChasis: string;
  placa: string;
  clase: string;

  logoSrc?: string;
}

export const Pagina10: React.FC<Pagina10Props> = ({
  codigo,
  fecha,
  ciudad,
  deudorNombre,
  deudorCc,
  deudorCiudadExpedicion,
  marca,
  linea,
  modelo,
  color,
  numeroMotor,
  numeroChasis,
  placa,
  clase,
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

      {/* TÍTULO */}
      <Text style={styles.sectionTitle}>
        AUTORIZACIÓN PARA LA RETENCIÓN DE LA MOTOCICLETA
      </Text>

      {/* CUERPO */}
      <Text style={styles.paragraph}>
        Yo, <Text style={styles.strong}>{deudorNombre}</Text>, mayor de edad,
        identificado con la cédula de ciudadanía N° {deudorCc} expedida en{" "}
        {deudorCiudadExpedicion}, actuando libre y voluntariamente manifiesto
        haber leído cuidadosamente el contenido de la constancia de entrega de
        esta cláusula y haber comprendido a cabalidad los parámetros y
        reglamentos de esta empresa, razón por la cual, entiendo sus alcances y
        sus implicaciones.
      </Text>

      <Text style={styles.paragraph}>
        Autorizamos de manera expresa e irrevocable a la sociedad comercial{" "}
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> a dar
        aplicación a la cláusula décimo segunda del contrato de crédito suscrito
        por nosotros, que manifiesta que en caso de incumplimiento (mora) en el
        pago de dos o más cuotas, procedan a la inmovilización de la
        motocicleta de las siguientes características:
      </Text>

      {/* TABLA VEHÍCULO */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MARCA DE LA MOTO</Text>
          <Text style={styles.tableCellValue}>{marca}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>LÍNEA DE LA MOTO</Text>
          <Text style={styles.tableCellValue}>{linea}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MODELO</Text>
          <Text style={styles.tableCellValue}>{modelo}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>COLOR</Text>
          <Text style={styles.tableCellValue}>{color}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>NÚMERO DE MOTOR</Text>
          <Text style={styles.tableCellValue}>{numeroMotor}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>NÚMERO DE CHASIS</Text>
          <Text style={styles.tableCellValue}>{numeroChasis}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>PLACA</Text>
          <Text style={styles.tableCellValue}>{placa}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>CLASE</Text>
          <Text style={styles.tableCellValue}>{clase}</Text>
        </View>
      </View>

      <Text style={styles.paragraph}>
        Conocemos que el vehículo en mención no se devolverá hasta tanto no sea
        cancelado el valor total del capital vencido con sus respectivos
        intereses, el cual se debe cancelar en un plazo no mayor de 40 días a
        partir de la fecha de retención del vehículo. De lo contrario se dará
        aplicación a la dación en pago y se continuará con el respectivo
        proceso.
      </Text>

      <Text style={styles.paragraph}>
        En constancia de haber leído, entendido y aceptado los términos
        anteriores, firmo el presente documento, en{" "}
        <Text style={styles.line}>_________________________</Text> a los{" "}
        <Text style={styles.line}>______</Text> días del mes de{" "}
        <Text style={styles.line}>____________</Text> del año 20
        <Text style={styles.line}>____</Text>.
      </Text>

      <Text style={styles.firmaTexto}>Atentamente,</Text>

      {/* FIRMA */}
      <View style={styles.signatureBlock}>
        <View style={styles.signatureBox} />
        <View style={styles.firmaLine} />
        <Text style={styles.firmaLabel}>DEUDOR</Text>
        <Text style={styles.firmaLabel}>C.C. No. {deudorCc}</Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
