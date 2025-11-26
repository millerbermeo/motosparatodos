// Pagina15.tsx
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
    marginTop: 10,
    marginBottom: 18,
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
  acreedorSignatureImage: {
    width: 140,
    height: 40,
    marginBottom: 8,
    objectFit: "contain",
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

export interface Pagina15Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  acreedorNombre: string;   // ej: "Jose Gabriel Araque M."
  acreedorCc?: string;
  deudorNombre: string;
  deudorCc: string;

  logoSrc?: string;
  acreedorFirmaSrc?: string; // imagen de la firma del acreedor (opcional)
}

export const Pagina15: React.FC<Pagina15Props> = ({
  codigo,
  fecha,
  ciudad,
  acreedorNombre,
  acreedorCc = "",
  deudorNombre,
  deudorCc,
  logoSrc,
  acreedorFirmaSrc,
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

      {/* TEXTO FINAL DEL CONTRATO DE PRENDA */}
      <Text style={styles.paragraph}>
        El deudor desde ahora acepta cualquier traspaso o cesión que la
        acreedora o sus habientes hicieren de los instrumentos a su cargo,
        así como la prenda con toda la consecuencia que la ley señale.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA SÉPTIMA.</Text> El bien dado en
        prenda podrá ser enajenado por el acreedor, pero solo se verificará la
        tradición al adquirente cuando la acreedora lo autorice o esté cubierto
        en su totalidad el crédito, debiendo hacerse constar el respectivo
        hecho en el presente documento, en notas suscritas por la acreedora.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA OCTAVA.</Text> Si el deudor
        incumple cualquiera de las cláusulas pactadas en virtud de este
        contrato, pagará a la acreedora la suma de{" "}
        <Text style={styles.line}>________________</Text> ($
        <Text style={styles.line}>__________</Text>) a título de pena
        pecuniaria, sin importar las acciones legales que la acreedora inicie
        por el hecho contemplado en el art. 255 de la ley 599 del año 2000, la
        cual manifiesta conocer el deudor.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA NOVENA.</Text> El deudor se
        compromete a mantener el vehículo dado en prenda en normal estado de
        funcionamiento y prestación. Para efectos de sus obligaciones y
        responsabilidades son las mismas de un depositario.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>VIGÉSIMA.</Text> Una vez restituido el
        monto que se indica en la numeral DÉCIMO SEGUNDO de este contrato, se
        le darán 40 días de plazo para cancelar el valor de las cuotas
        atrasadas o la totalidad de la obligación en mora; en ese momento, si
        transcurridos los 40 días mencionados en este artículo el acreedor
        podrá vender y comercializar la moto sin derecho a pagar indemnización
        alguna del deudor.
      </Text>

      <Text style={styles.firmaTexto}>
        Para constancia se firma a los{" "}
        <Text style={styles.line}>______</Text> del mes{" "}
        <Text style={styles.line}>__________</Text> de{" "}
        <Text style={styles.line}>__________</Text>.
      </Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        {/* ACREEDOR */}
        <View style={styles.firmaBlock}>
          {acreedorFirmaSrc && (
            <Image
              style={styles.acreedorSignatureImage}
              src={acreedorFirmaSrc}
            />
          )}
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>ACREEDOR</Text>
          <Text style={styles.firmaLabel}>{acreedorNombre}</Text>
          {acreedorCc && (
            <Text style={styles.firmaLabel}>C.C. No. {acreedorCc}</Text>
          )}
        </View>

        {/* DEUDOR */}
        <View style={styles.firmaBlock}>
          <View style={styles.signatureBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>DEUDOR</Text>
          <Text style={styles.firmaLabel}>{deudorNombre}</Text>
          <Text style={styles.firmaLabel}>C.C. No. {deudorCc}</Text>
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
