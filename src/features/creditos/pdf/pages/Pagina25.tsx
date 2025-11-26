// Pagina25.tsx
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
    marginBottom: 8,
  },
  table: {
    borderWidth: 0.7,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "40%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  cellValue: {
    width: "60%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
  },
  table2: {
    borderWidth: 0.7,
    marginTop: 6,
    marginBottom: 20,
  },
  cellHalfLabel: {
    width: "40%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  cellHalfValue: {
    width: "60%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 8,
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginTop: 6,
    marginBottom: 6,
  },
  firmaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 20,
  },
  firmaBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    marginRight: 16,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: 220,
    marginBottom: 3,
  },
  firmaLabel: {
    fontSize: 8,
  },
  strong: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina25Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  fechaDiligenciamiento?: string;
  numeroSolicitud?: string;

  tipoDocumento?: string; // "CC", "CE", "Pasaporte"
  numeroDocumento?: string;
  nombreSolicitante?: string;
  apellidosSolicitante?: string;

  codigoDesembolso?: string;
  nombreBeneficiario?: string;
  docBeneficiario?: string;
  banco?: string;
  tipoCuenta?: string; // ahorros / corriente
  numeroCuenta?: string;
  valor?: string;

  empresaNombre?: string;
  nitEmpresa?: string;
}

export const Pagina25: React.FC<Pagina25Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  fechaDiligenciamiento = "___/___/_____",
  numeroSolicitud = "",
  tipoDocumento = "",
  numeroDocumento = "",
  nombreSolicitante = "",
  apellidosSolicitante = "",
  codigoDesembolso = "",
  nombreBeneficiario = "",
  docBeneficiario = "",
  banco = "",
  tipoCuenta = "",
  numeroCuenta = "",
  valor = "",
  empresaNombre = "VERIFICARTE AAA S.A.S",
  nitEmpresa = "901155548-8",
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
        AUTORIZACIÓN DE DESEMBOLSO PARA DEL CRÉDITO
      </Text>

      {/* TABLA CABECERA (FECHA / SOLICITUD) */}
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Fecha de diligenciamiento</Text>
          <Text style={styles.cellValue}>{fechaDiligenciamiento}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Número de solicitud</Text>
          <Text style={styles.cellValue}>{numeroSolicitud}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Tipo de documento de identidad</Text>
          <Text style={styles.cellValue}>{tipoDocumento}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Número de documento de identidad</Text>
          <Text style={styles.cellValue}>{numeroDocumento}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Nombre del solicitante del crédito</Text>
          <Text style={styles.cellValue}>{nombreSolicitante}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Apellidos del solicitante del crédito</Text>
          <Text style={styles.cellValue}>{apellidosSolicitante}</Text>
        </View>
      </View>

      {/* TEXTO AUTORIZACIÓN */}
      <Text style={styles.paragraph}>
        Autorizo a <Text style={styles.strong}>{empresaNombre}</Text> para que el
        desembolso en pesos producto del crédito otorgado sea consignado a la
        sociedad comercial identificada de la siguiente forma:
      </Text>

      {/* TABLA DATOS DESEMBOLSO */}
      <View style={styles.table2}>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>Código de desembolso</Text>
          <Text style={styles.cellHalfValue}>{codigoDesembolso}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>Nombre del beneficiario</Text>
          <Text style={styles.cellHalfValue}>{nombreBeneficiario}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>No. del documento de identidad</Text>
          <Text style={styles.cellHalfValue}>{docBeneficiario}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>Banco</Text>
          <Text style={styles.cellHalfValue}>{banco}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>
            Tipo de cuenta (ahorros o corriente)
          </Text>
          <Text style={styles.cellHalfValue}>{tipoCuenta}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>Número de cuenta</Text>
          <Text style={styles.cellHalfValue}>{numeroCuenta}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellHalfLabel}>Valor</Text>
          <Text style={styles.cellHalfValue}>{valor}</Text>
        </View>
      </View>

      {/* FIRMA */}
      <View style={styles.firmaRow}>
        <View style={styles.firmaBox} />
        <View>
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>Firma del solicitante del crédito</Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        {empresaNombre} {"\n"}
        NIT. {nitEmpresa}
      </Text>
    </View>
  </Page>
);
