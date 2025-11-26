// Pagina24.tsx
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
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  strong: {
    fontWeight: "bold",
  },
  datosBlock: {
    fontSize: 8.3,
    marginBottom: 10,
  },
  datoLinea: {
    marginBottom: 2,
  },
  firmaTexto: {
    fontSize: 8.2,
    marginTop: 12,
    marginBottom: 16,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  firmaCol: {
    width: "45%",
    alignItems: "center",
  },
  firmaBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    marginBottom: 8,
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

export interface Pagina24Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  linea: string;
  marca: string;
  color: string;
  modelo: string;
  motor: string;
  chasis: string;
  cilindraje: string;

  compradorNombre: string;
  compradorCc: string;
  codeudorNombre: string;
  codeudorCc: string;
}

export const Pagina24: React.FC<Pagina24Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  linea,
  marca,
  color,
  modelo,
  motor,
  chasis,
  cilindraje,
  compradorNombre,
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
        ACTA DE ENTREGA DE MOTOCICLETA SIN DOCUMENTOS
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> le hace entrega de la siguiente
        motocicleta:
      </Text>

      {/* DATOS MOTO */}
      <View style={styles.datosBlock}>
        <Text style={styles.datoLinea}>Línea: {linea}</Text>
        <Text style={styles.datoLinea}>Marca: {marca}</Text>
        <Text style={styles.datoLinea}>Color: {color}</Text>
        <Text style={styles.datoLinea}>Modelo: {modelo}</Text>
        <Text style={styles.datoLinea}>Motor No.: {motor}</Text>
        <Text style={styles.datoLinea}>Chasis No.: {chasis}</Text>
        <Text style={styles.datoLinea}>Cilindraje: {cilindraje}</Text>
      </View>

      <Text style={styles.paragraph}>
        El vehículo anteriormente descrito se entrega a solicitud y responsabilidad
        del comprador, el señor(a) {compradorNombre} <Text style={styles.strong}>SIN MATRÍCULA</Text>{" "}
        (PLACA, TARJETA DE PROPIEDAD) ni SOAT.
      </Text>

      <Text style={styles.paragraph}>
        La sociedad comercial <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> le advierte al
        señor que el vehículo en mención no podrá transitar por el territorio
        nacional sin estos documentos, tal como lo expresan las normas
        contenidas en el Código Nacional de Tránsito. Por lo tanto, la sociedad
        comercial VERIFICARTE AAA S.A.S no se hace responsable de las sanciones,
        comparendos o accidentes de tránsito que ocurran por transitar este
        vehículo sin los documentos anteriormente mencionados.
      </Text>

      <Text style={styles.firmaTexto}>
        Como constancia se firma a los ____________ del mes ______________ de
        ____________.
      </Text>

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
