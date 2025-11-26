// Pagina19.tsx
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
    fontSize: 8,
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
  paraConstancia: {
    fontSize: 8.1,
    marginTop: 8,
    marginBottom: 16,
  },
  empresaBlock: {
    marginBottom: 35,
  },
  empresaTitle: {
    fontSize: 8.3,
    fontWeight: "bold",
  },
  empresaNit: {
    fontSize: 8.1,
    marginBottom: 10,
  },
  firmaEmpresaLabel: {
    fontSize: 8.1,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: 180,
    marginTop: 16,
    marginBottom: 4,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  firmaCol: {
    width: "45%",
  },
  firmaColTitle: {
    fontSize: 8.3,
    fontWeight: "bold",
    marginBottom: 10,
  },
  firmaLineFull: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 4,
  },
  firmaColLabel: {
    fontSize: 8,
    marginBottom: 1,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina19Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  empresaNombre?: string;
  nitEmpresa?: string;

  // Representante de la empresa
  empresaRepresentanteNombre?: string;
  empresaRepresentanteCc?: string;

  // Deudor
  deudorNombre: string;
  deudorCc: string;
  deudorTelefono: string;
  deudorDireccion: string;

  // Codeudor
  codeudorNombre: string;
  codeudorCc: string;
  codeudorTelefono: string;
  codeudorDireccion: string;
}

export const Pagina19: React.FC<Pagina19Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  empresaNombre = "VERIFICARTE AAA S.A.S",
  nitEmpresa = "901155548-8",
  empresaRepresentanteNombre = "",
  empresaRepresentanteCc = "",
  deudorNombre,
  deudorCc,
  deudorTelefono,
  deudorDireccion,
  codeudorNombre,
  codeudorCc,
  codeudorTelefono,
  codeudorDireccion,
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

      {/* TEXTO FINAL DEL CONTRATO */}
      <Text style={styles.paragraph}>
        El consumidor deberá devolver en dinero al (los) Deudor (es) todas las
        sumas pagadas sin que proceda a hacer descuentos o retenciones por
        concepto alguno. En todo caso la devolución del dinero al consumidor no
        podrá exceder de treinta (30) días calendario desde el momento en que
        ejerció este derecho. Las devoluciones de dinero en virtud del
        Retracto, solo se realizarán por el mismo medio en que fue efectuado el
        pago del valor de este Contrato por el (los) Deudor(es).
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>23. IMPUESTOS. </Text>
        Los impuestos que se causen con ocasión de la celebración o ejecución
        del presente Contrato y en especial el impuesto de timbre, serán
        asumidos por el (los) Deudor(es).
      </Text>

      <Text style={styles.paraConstancia}>
        Para constancia se firma, en la ciudad de{" "}
        <Text style={styles.line}>__________________</Text>, el día{" "}
        <Text style={styles.line}>____</Text> de{" "}
        <Text style={styles.line}>____________</Text> de 20
        <Text style={styles.line}>____</Text>, en dos ejemplares de un mismo tenor.
      </Text>

      {/* BLOQUE EMPRESA */}
      <View style={styles.empresaBlock}>
        <Text style={styles.empresaTitle}>{empresaNombre}</Text>
        <Text style={styles.empresaNit}>NIT: {nitEmpresa}</Text>

        <Text style={styles.firmaEmpresaLabel}>Firma:</Text>
        <Text style={styles.firmaEmpresaLabel}>Nombre: {empresaRepresentanteNombre || "__________________________"}</Text>
        <Text style={styles.firmaEmpresaLabel}>C.C.: {empresaRepresentanteCc || "__________________________"}</Text>
      </View>

      {/* FIRMAS DEUDOR / CODEUDOR */}
      <View style={styles.firmasRow}>
        {/* DEUDOR */}
        <View style={styles.firmaCol}>
          <Text style={styles.firmaColTitle}>EL DEUDOR</Text>
          <View style={styles.firmaLineFull} />
          <Text style={styles.firmaColLabel}>Firma:</Text>
          <Text style={styles.firmaColLabel}>Nombre: {deudorNombre}</Text>
          <Text style={styles.firmaColLabel}>C.C: {deudorCc}</Text>
          <Text style={styles.firmaColLabel}>Teléfono: {deudorTelefono}</Text>
          <Text style={styles.firmaColLabel}>Dirección: {deudorDireccion}</Text>
          <Text style={styles.firmaColLabel}>En nombre propio.</Text>
          <Text style={styles.firmaColLabel}>En representación legal de: _________</Text>
        </View>

        {/* CODEUDOR */}
        <View style={styles.firmaCol}>
          <Text style={styles.firmaColTitle}>EL CODEUDOR</Text>
          <View style={styles.firmaLineFull} />
          <Text style={styles.firmaColLabel}>Firma:</Text>
          <Text style={styles.firmaColLabel}>Nombre: {codeudorNombre}</Text>
          <Text style={styles.firmaColLabel}>C.C: {codeudorCc}</Text>
          <Text style={styles.firmaColLabel}>Teléfono: {codeudorTelefono}</Text>
          <Text style={styles.firmaColLabel}>Dirección: {codeudorDireccion}</Text>
          <Text style={styles.firmaColLabel}>En nombre propio.</Text>
          <Text style={styles.firmaColLabel}>En representación legal de: _________</Text>
        </View>
      </View>

      {/* FOOTER INFERIOR */}
      <Text style={styles.footer}>
        {empresaNombre} {"\n"}
        NIT. {nitEmpresa}
      </Text>
    </View>
  </Page>
);
