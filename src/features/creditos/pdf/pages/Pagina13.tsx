// Pagina13.tsx
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

export interface Pagina13Props {
  codigo: string;
  fecha: string;
  ciudad: string;

  acreedorNombre: string;   // VERIFICARTE AAA S.A.S o persona
  acreedorCc?: string;
  deudorNombre: string;
  deudorCc: string;

  logoSrc?: string;
  acreedorFirmaSrc?: string; // opcional: imagen escaneada de firma
}

export const Pagina13: React.FC<Pagina13Props> = ({
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

      {/* TEXTO FINAL DE CLÁUSULAS (RESUMEN) */}
      <Text style={styles.paragraph}>
        El deudor desde ahora acepta cualquier traspaso o cesión que la
        acreedora o sus causahabientes hicieren de los instrumentos a su cargo,
        así como la prenda con todas las consecuencias que la ley señale.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA SÉPTIMA.</Text> El bien dado en
        prenda podrá ser enajenado por la acreedora, pero solo se verificará la
        tradición al adquirente cuando la acreedora lo autorice o esté cubierto
        en su totalidad el crédito, debiendo hacerse constar el respectivo
        hecho en este documento o en notas suscritas por la acreedora.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA OCTAVA.</Text> Si el deudor
        incumple cualquiera de las cláusulas pactadas en virtud de este
        contrato, pagará a la acreedora la suma de{" "}
        <Text style={styles.line}>________________</Text> ($
        <Text style={styles.line}>__________</Text>) a título de pena
        pecuniaria, sin perjuicio de las demás acciones legales que le
        correspondan.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>DÉCIMA NOVENA.</Text> El deudor se
        compromete a mantener el vehículo dado en prenda en normal estado de
        funcionamiento y presentación, asumiendo los gastos y responsabilidades
        que se originen por su uso y tenencia.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>VIGÉSIMA.</Text> Una vez restituido el
        monto que se indica en la cláusula DÉCIMO SEGUNDO del contrato de
        prenda, se dará por terminada la garantía real, quedando obligado el
        acreedor a entregar los documentos necesarios para la cancelación del
        gravamen y la correspondiente anotación en el registro.
      </Text>

      <Text style={styles.firmaTexto}>
        Para constancia se firma a los{" "}
        <Text style={styles.line}>______</Text> días del mes{" "}
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
