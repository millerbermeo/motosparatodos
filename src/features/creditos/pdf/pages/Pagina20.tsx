// Pagina20.tsx
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
  labelLine: {
    fontSize: 8.5,
    marginBottom: 4,
  },
  strong: {
    fontWeight: "bold",
  },
  table: {
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 0.7,
  },
  tableRow: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "40%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
  },
  cellValue: {
    width: "60%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 8,
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  listItem: {
    fontSize: 8,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  welcome: {
    fontSize: 8.5,
    marginTop: 6,
    marginBottom: 6,
  },
  firmaTexto: {
    fontSize: 8.2,
    marginTop: 8,
    marginBottom: 14,
  },
  firmasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  firmaCol: {
    width: "45%",
    alignItems: "center",
  },
  boxFirma: {
    width: 90,
    height: 90,
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
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina20Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  fechaDocumento: string;
  nombreCliente: string;

  marcaMoto: string;
  lineaMoto: string;
  modeloMoto: string;
  colorMoto: string;
  numeroMotor: string;
  numeroChasis: string;

  valorTotal: string;
  cuotaInicial: string;
  numeroCuotas: number;
  valorCuotaMensual: string;
  fechaPagoCuota: string;

  garantiaMeses: string; // ej "12"
  garantiaKm: string;    // ej "10.000"

  compradorNombre: string;
  compradorCc: string;
  codeudorNombre: string;
  codeudorCc: string;
}

export const Pagina20: React.FC<Pagina20Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  fechaDocumento,
  nombreCliente,
  marcaMoto,
  lineaMoto,
  modeloMoto,
  colorMoto,
  numeroMotor,
  numeroChasis,
  valorTotal,
  cuotaInicial,
  numeroCuotas,
  valorCuotaMensual,
  fechaPagoCuota,
  garantiaMeses,
  garantiaKm,
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
        CONSTANCIA DE ENTREGA DE MOTOCICLETA Y DOCUMENTOS
      </Text>

      {/* DATOS CABECERA */}
      <Text style={styles.labelLine}>FECHA: {fechaDocumento}</Text>
      <Text style={styles.labelLine}>
        NOMBRE DEL CLIENTE: <Text style={styles.strong}>{nombreCliente}</Text>
      </Text>

      <Text style={[styles.labelLine, { marginTop: 6 }]}>
        Es muy grato para nosotros hacer entrega de la siguiente motocicleta:
      </Text>

      {/* TABLA MOTO */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>MARCA DE LA MOTO</Text>
          <Text style={styles.cellValue}>{marcaMoto}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>LÍNEA DE LA MOTO</Text>
          <Text style={styles.cellValue}>{lineaMoto}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>MODELO</Text>
          <Text style={styles.cellValue}>{modeloMoto}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>COLOR</Text>
          <Text style={styles.cellValue}>{colorMoto}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>NÚMERO DE MOTOR</Text>
          <Text style={styles.cellValue}>{numeroMotor}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>NÚMERO DE CHASIS</Text>
          <Text style={styles.cellValue}>{numeroChasis}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>VALOR</Text>
          <Text style={styles.cellValue}>{valorTotal}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>CUOTA INICIAL</Text>
          <Text style={styles.cellValue}>{cuotaInicial}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>NÚMERO DE CUOTAS</Text>
          <Text style={styles.cellValue}>{numeroCuotas}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>VALOR CUOTA MENSUAL</Text>
          <Text style={styles.cellValue}>{valorCuotaMensual}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cellLabel}>FECHA DE PAGO DE LA CUOTA</Text>
          <Text style={styles.cellValue}>{fechaPagoCuota}</Text>
        </View>
      </View>

      {/* LISTA DE DOCUMENTOS */}
      <Text style={styles.listItem}>
        1. Factura de venta N° _________ original
      </Text>
      <Text style={styles.listItem}>
        2. Manual de propietario y accesorios (_______________________________)
      </Text>
      <Text style={styles.listItem}>
        3. Recibo de pago de la cuota inicial en original
      </Text>
      <Text style={styles.listItem}>
        4. Contrato de crédito para la adquisición de una motocicleta
      </Text>
      <Text style={styles.listItem}>5. Tabla de amortización.</Text>
      <Text style={styles.listItem}>
        6. Copia del contrato de la póliza de deudores
      </Text>

      {/* PÁRRAFOS INFORMATIVOS */}
      <Text style={styles.paragraph}>
        La motocicleta tiene una garantía de {garantiaMeses} meses o {garantiaKm} km,
        lo primero que se cumpla, el manual de garantía o certificado de
        garantía que se entrega a favor del vehículo adquirido tiene todas las
        especificaciones necesarias y puede hacerse efectivas a través de su
        red de distribuidores y centros de servicios autorizados. La garantía
        cubre desperfectos de fabricación o ensamble, no daños o defectos
        ocasionados por accidentes, maltrato o abuso, golpes o uso de piezas no
        originales.
      </Text>

      <Text style={styles.paragraph}>
        Aclaramos que para poder tramitar la matrícula de su motocicleta es
        necesario que usted compre el seguro obligatorio y realice de forma
        inmediata la inscripción ante el run y en la oficina de tránsito del
        municipio.
      </Text>

      <Text style={styles.paragraph}>
        1. Le informamos que el atraso en el pago de sus cuotas genera intereses
        por mora desde el momento del vencimiento, de igual forma se le
        reitera que somos un establecimiento afiliado a las centrales de riesgo{" "}
        TRANSUNION Y DATA CRÉDITO y al momento de incurrir en mora con una (1)
        cuota su saldo será reportado como incumplimiento de pago en forma
        negativa.{"\n"}
        2. En caso de cambio de dirección residencial o número de teléfono
        actualizar datos en el almacén.{"\n"}
        3. No entregar ningún dinero a cobradores o funcionarios del almacén,
        sus pagos deben ser únicamente en la caja de nuestros puntos de venta
        más cercano de {nombreCliente ? "VERIFICARTE AAA S.A.S." : "VERIFICARTE AAA S.A.S."}
      </Text>

      <Text style={styles.welcome}>Bienvenido a nuestra familia</Text>

      <Text style={styles.firmaTexto}>
        Como constancia de entrega se firma a los ______ días del mes de
        __________
      </Text>

      {/* FIRMAS */}
      <View style={styles.firmasRow}>
        <View style={styles.firmaCol}>
          <View style={styles.boxFirma} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>COMPRADOR</Text>
          <Text style={styles.firmaLabel}>CC. No. {compradorCc}</Text>
        </View>

        <View style={styles.firmaCol}>
          <View style={styles.boxFirma} />
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
