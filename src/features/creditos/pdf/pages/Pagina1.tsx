// Pagina1.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica"
  },
  borderBox: {
    flex: 1,
    borderWidth: 1,
    padding: 20
  },
  header: {
    flexDirection: "row",
    marginBottom: 12
  },
  logoBox: {
    width: 110,
    marginRight: 15,
    justifyContent: "flex-start"
  },
  logo: {
    width: 110,
    height: 60,
    objectFit: "contain"
  },
  headerRight: {
    flex: 1
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6
  },
  headerMeta: {
    fontSize: 9,
    lineHeight: 1.3
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center"
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 4
  },
  strong: {
    fontWeight: "bold"
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 35
  },
  signatureBlock: {
    width: 140,
    alignItems: "center"
  },
  signatureBox: {
    width: 80,
    height: 100,
    borderWidth: 1,
    marginBottom: 18
  },
  signatureLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 4
  },
  signatureLabel: {
    fontSize: 7,
    textAlign: "center"
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7
  }
});

export interface Pagina1Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  nombreTitular1: string;
  nombreTitular2?: string;
  logoSrc?: string; // ruta o url del logo
}

export const Pagina1: React.FC<Pagina1Props> = ({
  codigo,
  fecha,
  ciudad,
  nombreTitular1,
  nombreTitular2,
  logoSrc
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

      {/* TÍTULO BLOQUE TEXTO */}
      <Text style={styles.sectionTitle}>
        AUTORIZACIÓN PARA LA CONSULTA, REPORTE Y PROCESAMIENTO DE DATOS
        CREDITICIOS, FINANCIEROS Y COMERCIALES
      </Text>

      {/* CUERPO DEL DOCUMENTO */}
      <Text style={styles.paragraph}>
        Yo{" "}
        <Text style={styles.strong}>
          {nombreTitular1 || "___________________________"}
        </Text>{" "}
        en mi calidad de titular de la información, actuando de manera previa,
        libre, espontánea, específica e inequívoca, autorizo de manera expresa e
        irrevocable a <Text style={styles.strong}>VERIFICARTE AAA S.A.S.</Text>{" "}
        para que, quienes representen sus derechos, puedan consultar, solicitar,
        suministrar, reportar, procesar y divulgar la información que se refiera
        a mi comportamiento crediticio, financiero y comercial, a las centrales
        de información y a cualquier otra entidad pública o privada que
        administre o maneje bases de datos.
      </Text>

      <Text style={styles.paragraph}>
        Conozco que el alcance de esta autorización implica que el
        comportamiento frente a mis obligaciones será registrado con el objeto
        de suministrar información suficiente y adecuada al mercado sobre el
        estado de mis obligaciones financieras, comerciales, crediticias y de
        servicios.
      </Text>

      <Text style={styles.paragraph}>
        La información podrá ser utilizada para efectos estadísticos, de
        evaluación de riesgo y de gestión de cobranza. Mis derechos de
        actualización y rectificación de los datos se ejercerán de conformidad
        con la normatividad aplicable.
      </Text>

      <Text style={styles.paragraph}>
        Declaro que he leído y comprendido a cabalidad el contenido de la
        presente autorización y acepto la finalidad en ella descrita y las
        condiciones que se derivan de ella.
      </Text>

      {/* FIRMAS */}
      <View style={styles.signaturesContainer}>
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Firma del titular del dato</Text>
          <Text style={styles.signatureLabel}>{nombreTitular1}</Text>
        </View>

        {nombreTitular2 && (
          <View style={styles.signatureBlock}>
            <View style={styles.signatureBox} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Firma del titular del dato
            </Text>
            <Text style={styles.signatureLabel}>{nombreTitular2}</Text>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
