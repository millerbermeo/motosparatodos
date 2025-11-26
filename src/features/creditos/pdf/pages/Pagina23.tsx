// Pagina23.tsx
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
    marginTop: 8,
    marginBottom: 4,
  },
  table: {
    borderWidth: 0.7,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "35%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  cellValue: {
    width: "65%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  bigBox: {
    borderWidth: 0.7,
    height: 150,
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina23Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  marca: string;
  linea: string;
  modelo: string;
  color: string;
  numeroMotor: string;
  numeroChasis: string;
  placa: string;
}

export const Pagina23: React.FC<Pagina23Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  marca,
  linea,
  modelo,
  color,
  numeroMotor,
  numeroChasis,
  placa,
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

      <Text style={styles.centerTitle}>IMPRONTAS</Text>

      {/* TABLA DATOS DEL VEHÍCULO */}
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>MARCA</Text>
          <Text style={styles.cellValue}>{marca}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>LÍNEA MOTO</Text>
          <Text style={styles.cellValue}>{linea}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>MODELO</Text>
          <Text style={styles.cellValue}>{modelo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>COLOR</Text>
          <Text style={styles.cellValue}>{color}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>No. MOTOR</Text>
          <Text style={styles.cellValue}>{numeroMotor}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>No. CHASIS</Text>
          <Text style={styles.cellValue}>{numeroChasis}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>PLACA</Text>
          <Text style={styles.cellValue}>{placa}</Text>
        </View>
      </View>

      {/* CAJA IMPRONTA MOTOR */}
      <Text style={styles.sectionLabel}>MOTOR</Text>
      <View style={styles.bigBox} />

      {/* CAJA IMPRONTA CHASIS */}
      <Text style={styles.sectionLabel}>CHASIS</Text>
      <View style={styles.bigBox} />

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155548-8
      </Text>
    </View>
  </Page>
);
