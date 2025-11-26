// Pagina5.tsx
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
    marginBottom: 6,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 8.1,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 2,
  },
  strong: {
    fontWeight: "bold",
  },
  line: {
    textDecoration: "underline",
  },
  cityDate: {
    fontSize: 8.3,
    marginTop: 4,
    marginBottom: 6,
  },
  destinatario: {
    fontSize: 8.3,
    marginBottom: 2,
  },
  numeralesContainer: {
    marginTop: 6,
  },
  numeralLine: {
    fontSize: 8.1,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 2,
  },
  firmaTexto: {
    fontSize: 8.1,
    marginTop: 10,
    marginBottom: 6,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  firmaBlock: {
    width: "48%",
  },
  labelMini: {
    fontSize: 7.5,
    marginBottom: 1,
  },
  bigBox: {
    width: "100%",
    height: 80,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 3,
  },
  firmaRole: {
    fontSize: 7,
  },
  firmaName: {
    fontSize: 7,
    textTransform: "capitalize",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina5Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  deudorNombre: string;
  deudorCcNit: string;
  deudorDireccion?: string;
  deudorTelefono?: string;
  codeudorNombre?: string;
  codeudorCcNit?: string;
  codeudorDireccion?: string;
  codeudorTelefono?: string;
  logoSrc?: string;
}

export const Pagina5: React.FC<Pagina5Props> = ({
  codigo,
  fecha,
  ciudad,
  deudorNombre,
  deudorCcNit,
  deudorDireccion = "",
  deudorTelefono = "",
  codeudorNombre = "",
  codeudorCcNit = "",
  codeudorDireccion = "",
  codeudorTelefono = "",
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

      {/* CIUDAD Y FECHA */}
      <Text style={styles.cityDate}>
        Ciudad y fecha ______________________________________________________
      </Text>

      {/* DESTINATARIO */}
      <Text style={styles.destinatario}>Señores</Text>
      <Text style={[styles.destinatario, { marginBottom: 4 }]}>
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S.</Text>
      </Text>

      {/* TÍTULO */}
      <Text style={styles.sectionTitle}>
        CARTA DE INSTRUCCIONES Y AUTORIZACIÓN PARA DILIGENCIAR EL PAGARE
      </Text>

      {/* CUERPO – INTRO */}
      <Text style={styles.paragraph}>
        Los firmantes mayores de edad, identificados como aparece al pie de
        nuestras correspondientes firmas, quienes en adelante nos denominamos{" "}
        <Text style={styles.strong}>los DEUDORES</Text>, en los términos del
        artículo 662 del Código de Comercio, facultamos de manera expresa e
        irrevocable a <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>{" "}
        o a quien en el futuro ostente la calidad de acreedor o tenedor
        legítimo del pagaré identificado con el número{" "}
        <Text style={styles.line}>________________</Text> para llenar los
        espacios en blanco de dicho instrumento, de conformidad con las
        siguientes instrucciones:
      </Text>

      {/* NUMERALES */}
      <View style={styles.numeralesContainer}>
        <Text style={styles.numeralLine}>
          1. En el espacio reservado en la cláusula primera del pagaré para
          colocar una suma de dinero se escribirá la cuantía a la que se
          asciendan las obligaciones insolutas que por cualquier concepto
          mantengamos contraídas directa o indirectamente con{" "}
          <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>, incluidas
          sus prórrogas, renovaciones y reestructuraciones.
        </Text>

        <Text style={styles.numeralLine}>
          2. En el espacio reservado en la cláusula segunda del pagaré se
          escribirá la tasa de interés remuneratorio y de mora que corresponda
          conforme a lo pactado en el respectivo contrato o documento soporte,
          sin exceder los límites legales.
        </Text>

        <Text style={styles.numeralLine}>
          3. Como fecha de vencimiento de dicho pagaré{" "}
          <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> deberá
          colocar la del día en que lo llene o diligencie.
        </Text>

        <Text style={styles.numeralLine}>
          4. <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> podrá
          diligenciar el pagaré en cualquier tiempo, sin necesidad de
          requerimiento judicial o extrajudicial, cuando se presenten eventos
          de mora o incumplimiento en el pago de cualquiera de las obligaciones
          a nuestro cargo, incluyendo capital, intereses, honorarios y demás
          conceptos derivados de los contratos suscritos.
        </Text>

        <Text style={styles.numeralLine}>
          5. Aceptamos incondicionalmente que todo traspaso, endoso o cesión
          que <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> haga del
          presente instructivo junto con el pagaré, amparará las obligaciones
          allí contenidas, con sus prórrogas y demás modificaciones.
        </Text>
      </View>

      {/* FRASE FINALES ANTES DE FIRMAS */}
      <Text style={styles.firmaTexto}>
        Se firma en la ciudad de _____________ a los ______ días del mes
        __________ del año __________.
      </Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        {/* DEUDOR */}
        <View style={styles.firmaBlock}>
          <Text style={styles.labelMini}>NOMBRE:</Text>
          <Text style={styles.labelMini}>{deudorNombre}</Text>
          <Text style={styles.labelMini}>C.C O NIT: {deudorCcNit}</Text>
          <Text style={styles.labelMini}>DIRECCIÓN: {deudorDireccion}</Text>
          <Text style={styles.labelMini}>TELÉFONO: {deudorTelefono}</Text>

          <View style={styles.bigBox} />

          <View style={styles.firmaLine} />
          <Text style={styles.firmaRole}>DEUDOR</Text>
          <Text style={styles.firmaName}>{deudorNombre}</Text>
        </View>

        {/* CODEUDOR */}
        <View style={styles.firmaBlock}>
          <Text style={styles.labelMini}>NOMBRE:</Text>
          <Text style={styles.labelMini}>{codeudorNombre}</Text>
          <Text style={styles.labelMini}>C.C O NIT: {codeudorCcNit}</Text>
          <Text style={styles.labelMini}>
            DIRECCIÓN: {codeudorDireccion}
          </Text>
          <Text style={styles.labelMini}>
            TELÉFONO: {codeudorTelefono}
          </Text>

          <View style={styles.bigBox} />

          <View style={styles.firmaLine} />
          <Text style={styles.firmaRole}>CODEUDOR</Text>
          <Text style={styles.firmaName}>{codeudorNombre}</Text>
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
