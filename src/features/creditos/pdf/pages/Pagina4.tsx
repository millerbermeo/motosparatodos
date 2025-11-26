// Pagina4.tsx
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
    marginBottom: 6,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 8.2,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  strong: {
    fontWeight: "bold",
  },
  inlineUnderline: {
    textDecoration: "underline",
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 28,
  },
  signatureBlock: {
    width: 160,
    alignItems: "center",
  },
  signatureBox: {
    width: 90,
    height: 105,
    borderWidth: 1,
    marginBottom: 18,
  },
  signatureLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 7,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina4Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  pagareNumero: string;
  deudor1Nombre: string;
  deudor1Cc: string;
  deudor2Nombre?: string;
  deudor2Cc?: string;
  logoSrc?: string;
}

export const Pagina4: React.FC<Pagina4Props> = ({
  codigo,
  fecha,
  ciudad,
  pagareNumero,
  deudor1Nombre,
  deudor1Cc,
  deudor2Nombre,
  deudor2Cc,
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

      {/* TÍTULO PAGARÉ */}
      <Text style={styles.sectionTitle}>
        PAGARÉ No. {pagareNumero}
      </Text>

      {/* CUERPO PAGARÉ (mismo contenido que en la página 3) */}
      <Text style={styles.paragraph}>
        Nosotros: <Text style={styles.strong}>{deudor1Nombre}</Text> CC{" "}
        {deudor1Cc}
        {deudor2Nombre && deudor2Cc && (
          <Text>
            {" "}
            y/o <Text style={styles.strong}>{deudor2Nombre}</Text> CC {deudor2Cc}
          </Text>
        )}{" "}
        declaramos que por virtud del presente título valor pagaremos (mos) en
        forma solidaria e incondicionalmente la orden de{" "}
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> o a quien
        represente sus derechos en la ciudad de{" "}
        <Text style={styles.inlineUnderline}>______________________</Text> la
        suma de <Text style={styles.inlineUnderline}>________________</Text>{" "}
        ($<Text style={styles.inlineUnderline}>__________</Text>) en las fechas
        de amortización por cuotas señaladas en la cláusula tercera de este
        pagaré, más los intereses señalados en la cláusula segunda de este
        título valor.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEGUNDA – INTERESES:</Text> Que sobre la
        suma debida reconoceremos intereses remuneratorios equivalentes al{" "}
        (<Text style={styles.inlineUnderline}>______</Text>%) mensual efectivo,
        sobre el capital o saldo insoluto. En caso de mora reconoceremos
        intereses de mora a la tasa máxima legal autorizada por la
        Superintendencia Financiera o la norma que la modifique, sobre el saldo
        vencido.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>TERCERA – PLAZO:</Text> Que pagaremos el
        capital indicado en la cláusula primera y sus intereses mediante cuotas
        mensuales y sucesivas de{" "}
        <Text style={styles.inlineUnderline}>______________</Text> ($
        <Text style={styles.inlineUnderline}>__________</Text>) cada una. El
        primer pago lo efectuaremos el día{" "}
        <Text style={styles.inlineUnderline}>____</Text> del mes de{" "}
        <Text style={styles.inlineUnderline}>________________</Text> de{" "}
        <Text style={styles.inlineUnderline}>________</Text>, y las
        subsiguientes en igual fecha de cada mes.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>CUARTA – CLÁUSULA ACELERATORIA:</Text> El
        tenedor podrá declarar vencidos los plazos de esta obligación y exigir
        el pago total de la deuda más los intereses causados cuando se presente
        alguna de las siguientes circunstancias: a) la aprehensión de nuestros
        bienes en proceso de embargo o secuestro; b) nuestra declaración en
        liquidación obligatoria o concordato; c) el incumplimiento en el pago
        de cualquiera de las cuotas pactadas; d) la inexactitud o falsedad de
        la información suministrada; e) cualquier otro evento de
        incumplimiento previsto en la ley o en el contrato que dio origen a
        este pagaré.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>QUINTA:</Text> Renunciamos al beneficio de
        excusión y división, así como a cualquier otro que en derecho nos
        favorezca, y reconocemos desde ya la existencia de una obligación clara,
        expresa y exigible a favor de{" "}
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>
          SEXTA – AUTORIZACIÓN PARA VERIFICACIÓN Y REPORTE:
        </Text>{" "}
        Autorizamos expresamente a <Text style={styles.strong}>VERIFICARTE AAA
        S.A.S</Text> para consultar, verificar, reportar y actualizar nuestra
        información en centrales de riesgo, así como para efectuar las
        gestiones de cobro prejudicial y judicial que considere pertinentes.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SÉPTIMA – IMPUESTO DE TIMBRE:</Text> El
        impuesto de timbre a que esté sujeto este título valor será de cargo
        único y exclusivamente del (los) deudor(es).
      </Text>

      <Text style={styles.paragraph}>
        En constancia de lo anterior, se suscribe este documento el día{" "}
        <Text style={styles.inlineUnderline}>____</Text> del mes de{" "}
        <Text style={styles.inlineUnderline}>________________</Text> de{" "}
        <Text style={styles.inlineUnderline}>________</Text>.
      </Text>

      {/* FIRMAS */}
      <View style={styles.signaturesContainer}>
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Firma del titular del dato</Text>
          <Text style={styles.signatureLabel}>{deudor1Nombre}</Text>
        </View>

        {deudor2Nombre && (
          <View style={styles.signatureBlock}>
            <View style={styles.signatureBox} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Firma del titular del dato
            </Text>
            <Text style={styles.signatureLabel}>{deudor2Nombre}</Text>
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
