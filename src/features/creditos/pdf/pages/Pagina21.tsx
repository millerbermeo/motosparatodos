// Pagina21.tsx
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
  centerTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 8.2,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 4,
  },
  strong: {
    fontWeight: "bold",
  },
  table: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 0.7,
  },
  row: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "40%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  cellValue: {
    width: "60%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
  },
  firmaTexto: {
    fontSize: 8.2,
    marginTop: 10,
    marginBottom: 14,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  firmaCol: {
    width: "45%",
    alignItems: "center",
  },
  firmaBox: {
    width: 90,
    height: 90,
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
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina21Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  clienteNombre: string;
  clienteCc: string;
  clienteLugarExpedicion: string;

  marcaMoto: string;
  lineaMoto: string;
  modeloMoto: string;
  colorMoto: string;
  numeroMotor: string;
  numeroChasis: string;

  ciudadMatricula: string;   // ciudad donde se va a matricular
  departamentoMatricula: string;

  ciudadFirma: string;
  compradorNombre: string;
  compradorCc: string;
  codeudorNombre: string;
  codeudorCc: string;
}

export const Pagina21: React.FC<Pagina21Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  clienteNombre,
  clienteCc,
  clienteLugarExpedicion,
  marcaMoto,
  lineaMoto,
  modeloMoto,
  colorMoto,
  numeroMotor,
  numeroChasis,
  ciudadMatricula,
  departamentoMatricula,
  ciudadFirma,
  compradorCc,
  codeudorCc,
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

      <Text style={styles.centerTitle}>
        AUTORIZACIÓN PARA MATRICULAR LA MOTOCICLETA EN OTRA CIUDAD
      </Text>

      {/* TEXTO INICIAL */}
      <Text style={styles.paragraph}>
        Yo, <Text style={styles.strong}>{clienteNombre}</Text>, mayor de edad,
        identificado con la cédula de ciudadanía N° {clienteCc} expedida en{" "}
        {clienteLugarExpedicion}, por medio del presente escrito autorizo a la
        sociedad comercial <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>{" "}
        a realizar el trámite de matrícula del vehículo descrito a
        continuación:
      </Text>

      {/* TABLA MOTO */}
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>MARCA DE LA MOTO</Text>
          <Text style={styles.cellValue}>{marcaMoto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>LÍNEA DE LA MOTO</Text>
          <Text style={styles.cellValue}>{lineaMoto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>MODELO</Text>
          <Text style={styles.cellValue}>{modeloMoto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>COLOR</Text>
          <Text style={styles.cellValue}>{colorMoto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>NÚMERO DE MOTOR</Text>
          <Text style={styles.cellValue}>{numeroMotor}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>NÚMERO DE CHASIS</Text>
          <Text style={styles.cellValue}>{numeroChasis}</Text>
        </View>
      </View>

      <Text style={styles.paragraph}>
        en la ciudad de {ciudadMatricula} del departamento de{" "}
        {departamentoMatricula}, debido a la imposibilidad de conseguir el
        seguro obligatorio en el departamento de residencia.
      </Text>

      <Text style={styles.paragraph}>
        Esta autorización la realizo de manera libre y espontánea, y
        entendiendo que fui notificado de este trámite y con el convencimiento
        de que en otras ciudades se realizan el cobro de diferentes impuestos.
      </Text>

      <Text style={styles.paragraph}>
        Declaro que los impuestos que se cobren en la ciudad donde se matricule
        la moto serán asumidos en su totalidad a mi costa.
      </Text>

      <Text style={styles.firmaTexto}>
        Se firma en la ciudad de {ciudadFirma} a los __________ días del mes de
        __________ de ____________________.
      </Text>

      <Text style={{ fontSize: 8.3, marginBottom: 6 }}>Atentamente,</Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        {/* COMPRADOR */}
        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>COMPRADOR</Text>
          <Text style={styles.firmaLabel}>CC. No. {compradorCc}</Text>
        </View>

        {/* CODEUDOR */}
        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>CODEUDOR</Text>
          <Text style={styles.firmaLabel}>CC. No. {codeudorCc}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155548-8
      </Text>
    </View>
  </Page>
);
