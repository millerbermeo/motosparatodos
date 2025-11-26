// Pagina16.tsx
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
    marginBottom: 12,
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
  lineLabel: {
    fontSize: 8.5,
    marginBottom: 14,
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
  firmaTitulo: {
    fontSize: 8.3,
    marginTop: 10,
    marginBottom: 12,
  },
  firmaBoxesRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  firmaBoxesRowBottom: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  firmaBoxWrap: {
    width: 150,
    alignItems: "center",
  },
  firmaBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    marginBottom: 12,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 3,
  },
  firmaLabel: {
    fontSize: 7.5,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina16Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  destinatarioNombre: string;

  empresaNombre?: string;   // por defecto VERIFICARTE AAA S.A.S
  producto?: string;        // "vehículo (motocicleta)" etc

  fechaPagoPactada: string; // ej: "10 de noviembre de 2025"
  fechaComunicacion: string; // fecha de la carta
  valorCuota: string;       // ej: "$ 350.000"

  deudorNombre: string;
  codeudorNombre?: string;
  jefeCarteraNombre?: string;
}

export const Pagina16: React.FC<Pagina16Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  destinatarioNombre,
  empresaNombre = "VERIFICARTE AAA S.A.S",
  producto = "vehículo (motocicleta)",
  fechaPagoPactada,
  valorCuota,
  deudorNombre,
  codeudorNombre = "",
  jefeCarteraNombre = "JEFE DE CARTERA VERIFICARTE AAA S.A.S",
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

      {/* DESTINATARIO */}
      <Text style={styles.lineLabel}>
        Señor (a): {destinatarioNombre || "_____________________________"}
      </Text>

      <Text style={styles.lineLabel}>Cordial saludo;</Text>

      {/* CUERPO DE LA CARTA */}
      <Text style={styles.paragraph}>
        Le comunicamos que usted se encuentra en mora frente a las obligaciones
        adquiridas con la empresa{" "}
        <Text style={styles.strong}>{empresaNombre}</Text> por medio de
        contrato de compraventa de {producto} mediante el sistema de
        financiación celebrado y aceptado por usted, toda vez que su fecha de
        pago fue el día {fechaPagoPactada}, en la cual usted debió haber pagado
        la suma de {valorCuota}; en consecuencia, de acuerdo con el artículo 12
        de la Ley 1266, le solicitamos ponerse al día y pagar sus obligaciones
        de manera inmediata.
      </Text>

      <Text style={styles.paragraph}>
        Transcurridos 20 días calendario posteriores al envío de esta
        comunicación sin que usted haya efectuado el pago, o demuestre que lo
        realizó, con base en la autorización que usted nos ha otorgado, de
        manera previa a la concesión del crédito y celebración del contrato, en
        ejercicio de su derecho a la libertad de autodeterminación
        informativa, procederemos a reportar en la base de datos{" "}
        <Text style={styles.strong}>TRANSUNION – DATA CRÉDITO</Text> la
        información negativa que refleje el estado actual de su obligación como
        morosa.
      </Text>

      <Text style={styles.paragraph}>
        Esta comunicación se genera con la finalidad expresada en el mismo
        artículo 12 de la mencionada ley, es decir, con el fin de que usted
        pueda demostrar o efectuar el pago de la obligación, así como
        controvertir aspectos tales como el monto de la obligación o cuota y la
        fecha de exigibilidad.
      </Text>

      <Text style={styles.firmaTitulo}>Atentamente,</Text>

      {/* FILA SUPERIOR: JEFE CARTERA / DEUDOR */}
      <View style={styles.firmaBoxesRowTop}>
        <View style={styles.firmaBoxWrap}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>{jefeCarteraNombre}</Text>
        </View>

        <View style={styles.firmaBoxWrap}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>DEUDOR</Text>
          <Text style={styles.firmaLabel}>{deudorNombre}</Text>
        </View>
      </View>

      {/* FILA INFERIOR: CODEUDOR */}
      {codeudorNombre && (
        <View style={styles.firmaBoxesRowBottom}>
          <View style={styles.firmaBoxWrap}>
            <View style={styles.firmaBox} />
            <View style={styles.firmaLine} />
            <Text style={styles.firmaLabel}>CODEUDOR</Text>
            <Text style={styles.firmaLabel}>{codeudorNombre}</Text>
          </View>
        </View>
      )}

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155548-8
      </Text>
    </View>
  </Page>
);
