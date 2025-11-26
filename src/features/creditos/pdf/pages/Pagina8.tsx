// Pagina8.tsx
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
  paragraph: {
    fontSize: 8.3,
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
  destinatario: {
    fontSize: 8.5,
    marginBottom: 2,
  },
  refLine: {
    fontSize: 8.5,
    marginTop: 10,
    marginBottom: 8,
  },
  bloqueDatos: {
    marginTop: 8,
    marginBottom: 8,
  },
  datoLinea: {
    fontSize: 8.3,
    marginBottom: 1,
  },
  firmaTexto: {
    fontSize: 8.3,
    marginTop: 16,
    marginBottom: 18,
  },
  firmaNombre: {
    fontSize: 8.3,
    marginTop: 30,
  },
  firmaLinea: {
    marginTop: 24,
    borderTopWidth: 1,
    width: 200,
  },
  firmaCc: {
    fontSize: 8.1,
    marginTop: 3,
  },
  acepta: {
    fontSize: 8.3,
    marginTop: 18,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina8Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  // poderdante (quien otorga el poder)
  poderdanteNombre: string;
  poderdanteCc: string;
  poderdanteCiudadExpedicion: string;
  // apoderado (VERIFICARTE o quien sea)
  apoderadoNombre: string; // ej: VERIFICARTE AAA S.A.S
  // datos del vehículo
  clase: string;
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  motor: string;
  chasis: string;
  cilindraje: string;
  logoSrc?: string;
}

export const Pagina8: React.FC<Pagina8Props> = ({
  codigo,
  fecha,
  ciudad,
  poderdanteNombre,
  poderdanteCc,
  poderdanteCiudadExpedicion,
  apoderadoNombre,
  clase,
  marca,
  linea,
  modelo,
  color,
  motor,
  chasis,
  cilindraje,
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

      {/* DESTINATARIO */}
      <Text style={styles.destinatario}>SEÑORES:</Text>
      <Text style={styles.destinatario}>
        DEPARTAMENTO ADMINISTRATIVO DE TRANSITO Y TRANSPORTE
      </Text>
      <Text style={[styles.destinatario, { marginBottom: 10 }]}>
        La ciudad
      </Text>

      {/* REFERENCIA */}
      <Text style={styles.refLine}>Referencia Poder trámite de traspaso</Text>

      {/* CUERPO */}
      <Text style={styles.paragraph}>
        Yo, <Text style={styles.strong}>{poderdanteNombre}</Text>, mayor de
        edad, identificado con la cédula de ciudadanía N°
        {poderdanteCc ? " " + poderdanteCc : " _____________"} expedida en{" "}
        {poderdanteCiudadExpedicion || "__________"}, por medio del presente
        documento otorgo poder especial amplio y suficiente a{" "}
        <Text style={styles.strong}>{apoderadoNombre}</Text> o a quien
        represente sus derechos para que en mi nombre y representación realice
        trámite de traspaso del vehículo automotor que a continuación se
        describe:
      </Text>

      {/* DATOS DEL VEHÍCULO */}
      <View style={styles.bloqueDatos}>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>CLASE:</Text> {clase}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>MARCA:</Text> {marca}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>LÍNEA:</Text> {linea}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>MODELO:</Text> {modelo}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>COLOR:</Text> {color}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>MOTOR No.:</Text> {motor}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>CHASIS No.:</Text> {chasis}
        </Text>
        <Text style={styles.datoLinea}>
          <Text style={styles.strong}>CILINDRAJE:</Text> {cilindraje}
        </Text>
      </View>

      <Text style={styles.paragraph}>
        Mi apoderado está facultado para realizar todo el acto, gestiones y
        diligencias que sean necesarios para el perfeccionamiento del contrato
        de compraventa. Por lo anterior solicito se sirva tener la persona
        anteriormente mencionada como mi apoderado para los efectos descritos
        en este memorial.
      </Text>

      <Text style={styles.firmaTexto}>Atentamente:</Text>

      {/* FIRMA PODERDANTE */}
      <View>
        <View style={styles.firmaLinea} />
        <Text style={styles.firmaCc}>C.C. No. {poderdanteCc}</Text>
      </View>

      {/* ACEPTA APODERADO */}
      <Text style={styles.acepta}>ACEPTO</Text>

      <View>
        <View style={styles.firmaLinea} />
        <Text style={styles.firmaCc}>C.C. No.</Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
