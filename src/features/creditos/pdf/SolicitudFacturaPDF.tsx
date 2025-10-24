// src/pdf/SolicitudFacturaPDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type Num = number | null | undefined;

const fmtCOP = (v?: Num) =>
  typeof v === "number" && Number.isFinite(v)
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(v)
    : v === 0
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(0)
    : "—";

const NR = (v?: string | null) =>
  v === null || v === undefined || v === "" ? "NR" : v;

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 28,
    fontSize: 10,
    color: "#111827", // slate-900
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 110,
    height: 40,
    objectFit: "contain",
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subHeader: {
    marginTop: 6,
    marginBottom: 14,
  },
  line: {
    height: 1,
    backgroundColor: "#111827",
    marginVertical: 6,
  },
  kvRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  kvKey: { width: 130, color: "#374151" }, // slate-600
  kvVal: { flex: 1, fontWeight: 700 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 4,
  },
  table: {
    borderTopWidth: 1,
    borderColor: "#111827",
    marginBottom: 8,
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb", // slate-200
  },
  tKey: { width: 160, color: "#374151" },
  tVal: { flex: 1 },
  // tabla 2 columnas (detalles vs condiciones)
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: { flex: 1 },
  tableHeader: {
    backgroundColor: "#111827",
    color: "white",
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 10,
  },
  moneyRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  right: { marginLeft: "auto" },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderTopWidth: 1,
    borderColor: "#111827",
    fontWeight: 700,
  },
});

export type SolicitudFacturaPDFProps = {
  // Encabezado
  codigoFactura?: string | number;
  codigoCredito?: string | number;
  fecha?: string;
  agencia?: string;

  // Deudor
  cedula?: string | null;
  nombre?: string | null;
  edad?: string | number | null;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  estadoCivil?: string | null;
  empresa?: string | null;
  ocupacion?: string | null;
  personasACargo?: string | number | null;
  valorArriendo?: string | number | null;
  fincaRaiz?: string | null;
  inmueble?: string | null;
  tipoVivienda?: string | null;

  // Vehículo
  reciboPago?: string | null;
  motocicleta?: string | null;
  modelo?: string | null;
  numeroMotor?: string | null;
  numeroChasis?: string | null;
  color?: string | null;

  // Condiciones negocio (moto)
  cn_valor_moto?: Num; // “valor moto” mostrado en ejemplo (neto a cobrar por moto)
  cn_descuento?: Num;
  cn_desc_auto?: Num; // Descuento autorizado por jefe de zona
  cn_jefeZona?: string | null;
  cn_valorMotoDesc?: Num;
  cn_valorBruto?: Num;
  cn_iva?: Num;
  cn_total?: Num;

  // Documentos (para totales a la derecha en la sección de condiciones del negocio)
  soat?: Num;
  matricula?: Num;
  impuestos?: Num;

  // Accesorios
  accesorios_bruto?: Num; // sin IVA
  accesorios_iva?: Num;   // 19% sobre accesorios
  accesorios_total?: Num; // bruto + iva
  seguros_total?: Num;    // si deseas mostrar aparte

  // Totales
  totalGeneral?: Num;
  // Branding
  logoDataUrl?: string; // opcional: base64 del logo
};

const RowKV = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvKey}>{k}</Text>
    <Text style={styles.kvVal}>{v as any}</Text>
  </View>
);

const RowTable = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <View style={styles.tRow}>
    <Text style={styles.tKey}>{k}</Text>
    <Text style={styles.tVal}>{v as any}</Text>
  </View>
);

const MoneyRow = ({ k, v }: { k: string; v?: Num }) => (
  <View style={styles.moneyRow}>
    <Text>{k}</Text>
    <Text style={styles.right}>{fmtCOP(v)}</Text>
  </View>
);

const SolicitudFacturaPDF: React.FC<SolicitudFacturaPDFProps> = (props) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          {props.logoDataUrl ? (
            <Image src={props.logoDataUrl} style={styles.logo} />
          ) : null}
          <Text style={styles.title}>SOLICITUD DE FACTURA</Text>
        </View>

        <View style={styles.subHeader}>
          <RowKV k="Código de factura:" v={NR(String(props.codigoFactura ?? ""))} />
          <RowKV k="Código de crédito:" v={NR(String(props.codigoCredito ?? ""))} />
          <RowKV k="Fecha:" v={NR(props.fecha ?? "")} />
          <RowKV k="Agencia:" v={NR(props.agencia ?? "")} />
        </View>

        <View style={styles.line} />

        {/* Deudor */}
        <Text style={styles.sectionTitle}>Deudor / Información personal</Text>
        <View style={styles.table}>
          <RowTable k="Documento de identidad" v={NR(props.cedula ?? "")} />
          <RowTable k="Nombre" v={NR(props.nombre ?? "")} />
          <RowTable k="Dirección de residencia" v={NR(props.direccion ?? "")} />
          <RowTable k="Ciudad" v={NR(props.ciudad ?? "")} />
          <RowTable k="Teléfono" v={NR(props.telefono ?? "")} />
          <RowTable k="Estado civil" v={NR(props.estadoCivil ?? "")} />
          <RowTable k="Empresa" v={NR(props.empresa ?? "")} />
          <RowTable k="Ocupación" v={NR(props.ocupacion ?? "")} />
          <RowTable k="Personas a cargo" v={NR(String(props.personasACargo ?? ""))} />
          <RowTable k="Valor de arriendo" v={NR(String(props.valorArriendo ?? ""))} />
          <RowTable k="Finca raíz" v={NR(props.fincaRaiz ?? "")} />
          <RowTable k="Inmueble" v={NR(props.inmueble ?? "")} />
          <RowTable k="Tipo de vivienda" v={NR(props.tipoVivienda ?? "")} />
        </View>

        {/* Detalle de la venta vs Condiciones del negocio */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.tableHeader}>Detalle de la venta</Text>
            <View style={styles.table}>
              <RowTable k="Recibo de pago" v={NR(props.reciboPago ?? "")} />
              <RowTable k="Motocicleta" v={NR(props.motocicleta ?? "")} />
              <RowTable k="Modelo" v={NR(props.modelo ?? "")} />
              <RowTable k="Número de motor" v={NR(props.numeroMotor ?? "")} />
              <RowTable k="Número de chasis" v={NR(props.numeroChasis ?? "")} />
              <RowTable k="Color" v={NR(props.color ?? "")} />
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.tableHeader}>Condiciones del negocio</Text>
            <View style={styles.table}>
              <MoneyRow k="Valor moto" v={props.cn_valor_moto ?? props.cn_total} />
              <MoneyRow k="Descuento" v={props.cn_descuento ?? 0} />
              <MoneyRow k="Descuento autorizado por jefe de zona" v={props.cn_desc_auto ?? 0} />
              <RowTable k="Jefe de zona" v={NR(props.cn_jefeZona ?? "")} />
              <MoneyRow k="Valor moto - descuento" v={props.cn_valorMotoDesc ?? props.cn_valor_moto} />
              <MoneyRow k="Valor bruto" v={props.cn_valorBruto} />
              <MoneyRow k="IVA" v={props.cn_iva} />
              <MoneyRow k="Total" v={props.cn_total} />
            </View>
          </View>
        </View>

        {/* Accesorios */}
        <Text style={styles.tableHeader}>Accesorios</Text>
        <View style={styles.table}>
          <MoneyRow k="Valor bruto" v={props.accesorios_bruto} />
          <MoneyRow k="IVA (19%)" v={props.accesorios_iva} />
          <MoneyRow k="Total" v={props.accesorios_total} />
          {typeof props.seguros_total === "number" ? (
            <MoneyRow k="Seguros" v={props.seguros_total} />
          ) : null}
        </View>

        {/* Totales finales */}
        <View style={styles.totalRow}>
          <Text>TOTAL</Text>
          <Text style={styles.right}>{fmtCOP(props.totalGeneral)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudFacturaPDF;
