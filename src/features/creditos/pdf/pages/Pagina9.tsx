// Pagina9.tsx
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
    marginBottom: 6,
  },
  signatureBlock: {
    marginTop: 6,
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

export interface Pagina9Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  deudorNombre: string;
  deudorCc: string;

  // texto de la ciudad en la cláusula inicial (por ej. "Cali" o "Florida")
  ciudadEntrega: string;

  // valor adeudado
  montoAdeudado: string; // ejemplo: "$ 2.000.000"

  // datos del vehículo
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  numeroMotor: string;
  numeroChasis: string;
  placa: string;
  clase: string;

  // cuenta bancaria
  bancoNombre: string; // ej: "BANCOLOMBIA"
  tipoCuenta: string;  // ej: "CUENTA DE AHORROS"
  numeroCuenta: string;
  logoSrc?: string;
}

export const Pagina9: React.FC<Pagina9Props> = ({
  codigo,
  fecha,
  ciudad,
  deudorNombre,
  deudorCc,
  ciudadEntrega,
  montoAdeudado,
  marca,
  linea,
  modelo,
  color,
  numeroMotor,
  numeroChasis,
  placa,
  clase,
  bancoNombre,
  tipoCuenta,
  numeroCuenta,
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
        ENTREGA VOLUNTARIA DEL VEHÍCULO AUTOMOTOR
      </Text>

      {/* INTRO */}
      <Text style={styles.paragraph}>
        En la ciudad de {ciudadEntrega} a los{" "}
        <Text style={styles.line}>______</Text> días del mes de{" "}
        <Text style={styles.line}>____________</Text> de{" "}
        <Text style={styles.line}>________</Text>, el señor(a){" "}
        <Text style={styles.strong}>{deudorNombre}</Text> en su calidad de
        deudor se presenta al establecimiento de comercio denominado{" "}
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>, el cual es
        representado legalmente por quien corresponda, a realizar la entrega
        voluntaria del vehículo automotor bajo las siguientes cláusulas:
      </Text>

      {/* CLÁUSULAS */}
      <Text style={styles.paragraph}>
        <Text style={styles.strong}>PRIMERA - OBJETO:</Text> Declaro que, de
        forma voluntaria, libre de cualquier coacción, amenaza, constreñimiento
        o imposición, realizo la entrega de la motocicleta que se describe en
        mi condición de propietario:
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
        <Text style={styles.strong}>SEGUNDA - FUNDAMENTO DE LA ENTREGA:</Text>{" "}
        Que debido a mi incumplimiento y la mora que se presentó con mi
        obligación crediticia con el acreedor prendario, a la fecha se ha
        causado la suma de {montoAdeudado} por concepto de capital, intereses
        de plazo, intereses de mora, honorarios de abogado y notificaciones.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>TERCERA - AUTORIZACIONES:</Text> Si a
        partir de la fecha en que se realiza esta entrega del vehículo y
        transcurrido un mes no realizo el pago total de la obligación, autorizo
        de manera irrevocable al acreedor prendario a disponer del vehículo
        entregado, previo avalúo para establecer el valor por el cual se
        recibe, dado el caso que no alcance el valor del vehículo para cubrir
        la deuda con el acreedor y obligo para con el acreedor a cancelar el
        saldo faltante si de esta manera saldaré la totalidad de la deuda.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>CUARTA - PAGO:</Text> El pago de su
        obligación debe ser cancelado a <Text style={styles.strong}>
          VERIFICARTE AAA S.A.S
        </Text>{" "}
        en la respectiva caja del acreedor prendario, no se responsabiliza por
        el dinero entregado a terceras personas; de igual forma puede realizar
        su pago en las siguientes entidades bancarias:
      </Text>

      <Text style={styles.paragraph}>
        {bancoNombre}-<Text style={styles.strong}>{tipoCuenta}</Text>{" "}
        {numeroCuenta} a nombre de <Text style={styles.strong}>
          VERIFICARTE AAA S.A.S
        </Text>
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>NOTA:</Text> POR FAVOR REALIZAR LA ENTREGA
        DE CONSIGNACIÓN EN EL ALMACÉN CORRESPONDIENTE O ENVIARLA AL CORREO
        ELECTRÓNICO: ________________________________
      </Text>

      <Text style={styles.firmaTexto}>
        Para constancia firma el deudor prendado
      </Text>

      {/* FIRMA */}
      <View style={styles.signatureBlock}>
        <View style={styles.signatureBox} />
        <View style={styles.firmaLine} />
        <Text style={styles.firmaLabel}>CC. No. {deudorCc}</Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
