// Pagina11.tsx
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
  table: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 0.7,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellLabel: {
    width: "35%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCellValue: {
    width: "65%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
  },
  firmaTexto: {
    fontSize: 8.1,
    marginTop: 10,
    marginBottom: 10,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  firmaBlock: {
    width: "45%",
    alignItems: "center",
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

export interface Pagina11Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  deudorNombre: string;
  deudorCc: string;

  acreedorNombre: string; // normalmente VERIFICARTE AAA S.A.S
  acreedorId: string;     // NIT o CC

  placa: string;
  color: string;
  marca: string;
  chasis: string;
  motor: string;
  linea: string;
  modelo: string;
  cilindraje: string;

  valorVehiculo: string;   // ej: "$ 5.000.000"
  valorObligacion: string; // ej: "$ 5.000.000"

  logoSrc?: string;
}

export const Pagina11: React.FC<Pagina11Props> = ({
  codigo,
  fecha,
  ciudad,
  deudorNombre,
  deudorCc,
  acreedorNombre,
  acreedorId,
  placa,
  color,
  marca,
  chasis,
  motor,
  linea,
  modelo,
  cilindraje,
  valorVehiculo,
  valorObligacion,
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
      <Text style={styles.sectionTitle}>CONTRATO DE DACI&Oacute;N EN PAGO</Text>

      {/* CUERPO PRINCIPAL */}
      <Text style={styles.paragraph}>
        El presente contrato se celebra entre los suscritos a saber: Por un
        lado, <Text style={styles.strong}>{acreedorNombre}</Text>, sociedad
        legalmente constituida, quien en adelante y para todos los efectos de
        este contrato se denominará simplemente como{" "}
        <Text style={styles.strong}>EL ACREEDOR</Text>; y{" "}
        <Text style={styles.strong}>{deudorNombre}</Text>, mayor de edad,
        identificado con cédula de ciudadanía No. {deudorCc}, quien en adelante
        se denominará como <Text style={styles.strong}>EL DEUDOR</Text>. Las
        partes han convenido celebrar el presente contrato de{" "}
        <Text style={styles.strong}>DACI&Oacute;N EN PAGO</Text>, que se
        regirá por las disposiciones legales aplicables y las siguientes
        cláusulas:
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          PRIMERA - OBLIGACIONES VENCIDAS:
        </Text>{" "}
        EL DEUDOR debe al ACREEDOR las sumas que se encuentran en mora
        derivadas del crédito otorgado, incluidos capital, intereses, gastos,
        honorarios y demás conceptos a cargo del DEUDOR. El valor total de la
        obligación vencida asciende a {valorObligacion}.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SEGUNDA - LIQUIDE DEUDOR:
        </Text>{" "}
        Debido a su situación económica, EL DEUDOR transfiere el título de
        dación para pagar la obligación determinada en la cláusula anterior.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          TERCERA - VALOR:
        </Text>{" "}
        Para efectos del presente acto jurídico se acepta como valor del
        vehículo entregado la suma de {valorVehiculo}, que se imputa{" "}
        <Text style={styles.strong}>A T&Iacute;TULO DE DACI&Oacute;N</Text> para
        el pago parcial o total de la obligación determinada en este contrato.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          CUARTA - PROPIEDAD DEL VEH&Iacute;CULO:
        </Text>{" "}
        EL DEUDOR manifiesta que entrega el siguiente vehículo de su propiedad
        a título de dación en pago:
      </Text>

      {/* TABLA VEHÍCULO */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>PLACA</Text>
          <Text style={styles.tableCellValue}>{placa}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>COLOR</Text>
          <Text style={styles.tableCellValue}>{color}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MARCA</Text>
          <Text style={styles.tableCellValue}>{marca}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>CHASIS No.</Text>
          <Text style={styles.tableCellValue}>{chasis}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MOTOR No.</Text>
          <Text style={styles.tableCellValue}>{motor}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>LÍNEA</Text>
          <Text style={styles.tableCellValue}>{linea}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>MODELO</Text>
          <Text style={styles.tableCellValue}>{modelo}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellLabel}>CILINDRAJE</Text>
          <Text style={styles.tableCellValue}>{cilindraje}</Text>
        </View>
      </View>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          QUINTA - PROPIEDAD DEL VEH&Iacute;CULO:
        </Text>{" "}
        EL ACREEDOR acepta la dación en pago sobre el vehículo descrito, el
        cual se recibe en el estado físico y mecánico en que se encuentra, sin
        que ello implique saneamiento por evicción o vicios redhibitorios más
        allá de lo contemplado por la ley.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SEXTA - ENTREGA MATERIAL:
        </Text>{" "}
        Con la firma del presente contrato se entiende realizada la entrega
        material del bien, junto con los documentos necesarios para realizar el
        traspaso ante la autoridad de tránsito correspondiente.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SÉPTIMA - GASTOS:
        </Text>{" "}
        Todos los gastos notariales, de traspaso, impuestos y demás costos que
        genere la dación en pago correrán por cuenta de{" "}
        <Text style={styles.strong}>EL DEUDOR</Text>, salvo pacto en contrario.
      </Text>

      <Text style={styles.firmaTexto}>
        Para constancia se firma a los ________ días del mes __________ de
        __________.
      </Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        <View style={styles.firmaBlock}>
          <View style={styles.signatureBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>COMPRADOR</Text>
          <Text style={styles.firmaLabel}>
            C.C. No. {deudorCc}
          </Text>
        </View>

        <View style={styles.firmaBlock}>
          <View style={styles.signatureBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>ACREEDOR</Text>
          <Text style={styles.firmaLabel}>{acreedorNombre}</Text>
          <Text style={styles.firmaLabel}>C.C / NIT. {acreedorId}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
