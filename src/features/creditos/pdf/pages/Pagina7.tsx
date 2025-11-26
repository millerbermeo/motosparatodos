// Pagina7.tsx
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
    marginBottom: 8,
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
  firmaTexto: {
    fontSize: 8.1,
    marginTop: 12,
    marginBottom: 18,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  firmaBlock: {
    width: "48%",
    alignItems: "flex-start",
  },
  firmaLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 4,
  },
  firmaRole: {
    fontSize: 8,
    fontWeight: "bold",
  },
  firmaCc: {
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina7Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  mandanteNombre: string;
  mandanteCc: string;
  mandatarioNombre: string;
  mandatarioCc: string;
  logoSrc?: string;
}

export const Pagina7: React.FC<Pagina7Props> = ({
  codigo,
  fecha,
  ciudad,
  mandanteNombre,
  mandanteCc,
  mandatarioNombre,
  mandatarioCc,
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
        CONTRATO DE MANDATO PERSONA NATURAL
      </Text>

      {/* CUERPO DEL CONTRATO */}
      <Text style={styles.paragraph}>
        Entre los suscritos a saber{" "}
        <Text style={styles.line}>__________________________________</Text>{" "}
        mayor de edad, vecino de esta ciudad, identificado con la cédula de
        ciudadanía n°{" "}
        <Text style={styles.line}>__________________</Text> expedida en{" "}
        <Text style={styles.line}>__________________</Text>, quien para efectos
        del presente contrato se denominará el <Text style={styles.strong}>
          mandante
        </Text>
        , y de otro{" "}
        <Text style={styles.line}>__________________________________</Text> también
        mayor de edad vecino de esta ciudad identificado con la cédula de
        ciudadanía n°{" "}
        <Text style={styles.line}>__________________</Text>, quien para efectos
        del presente contrato se denominará el{" "}
        <Text style={styles.strong}>mandatario</Text>, hemos acordado suscribir
        el siguiente contrato de mandato dando cumplimiento a la resolución
        12379 expedida por el Ministerio de Transporte el 28 de diciembre de
        2013 (art 5), que se regirá por las normas civiles y comerciales que
        regulen la materia y las siguientes cláusulas:
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          PRIMERA: OBJETO DEL CONTRATO:
        </Text>{" "}
        El <Text style={styles.strong}>MANDATARIO</Text> por cuenta y riesgo
        del mandante queda facultado para solicitar, realizar, radicar y
        retirar los trámites ante el organismo de tránsito de esta ciudad o de
        otra ciudad, y en general realizar todas las actuaciones necesarias que
        se requieran para el perfeccionamiento del trámite solicitado, respecto
        del vehículo de propiedad del mandante, identificado con placa{" "}
        <Text style={styles.line}>__________</Text>. Para tal efecto, el
        mandante confiere poder especial, amplio y suficiente al mandatario
        para representarlo ante la autoridad competente.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SEGUNDA: OBLIGACIONES DEL MANDANTE:
        </Text>{" "}
        El mandante declara que la información contenida en los documentos que
        se anexan a la solicitud de trámite es veraz y auténtica, y que será
        responsable ante la autoridad competente de cualquier irregularidad que
        los mismos puedan contener.
      </Text>

      <Text style={styles.firmaTexto}>
        Para constancia se firma en la ciudad de{" "}
        <Text style={styles.line}>______________________</Text>, a los{" "}
        <Text style={styles.line}>______</Text> días del mes de{" "}
        <Text style={styles.line}>____________</Text> del año{" "}
        <Text style={styles.line}>__________</Text>.
      </Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        <View style={styles.firmaBlock}>
          <View style={styles.firmaLine} />
          <Text style={styles.firmaRole}>MANDANTE</Text>
          <Text style={styles.firmaCc}>CC. N. {mandanteCc}</Text>
          <Text style={styles.firmaCc}>{mandanteNombre}</Text>
        </View>

        <View style={styles.firmaBlock}>
          <View style={styles.firmaLine} />
          <Text style={styles.firmaRole}>MANDATARIO</Text>
          <Text style={styles.firmaCc}>CC. N. {mandatarioCc}</Text>
          <Text style={styles.firmaCc}>{mandatarioNombre}</Text>
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
