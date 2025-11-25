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

/* ============================
   ESTILOS
   ============================ */

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 34,
    paddingBottom: 32,
    fontSize: 10,
    color: "#111827", // slate-900
    backgroundColor: "#f3f4f6", // gray-100 de fondo general
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#111827",
    borderRadius: 6,
  },
  logo: {
    width: 110,
    height: 40,
    objectFit: "contain",
    marginRight: 12,
  },
  headerText: {
    flexDirection: "column",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f9fafb",
    marginBottom: 2,
  },
  headerMeta: {
    fontSize: 9,
    color: "#e5e7eb",
  },

  /* SUB HEADER / INFO SUPERIOR */
  subHeaderWrapper: {
    marginTop: 10,
    marginBottom: 14,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb", // gray-200
  },
  kvRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  kvKey: { width: 130, color: "#4b5563" }, // slate-600
  kvVal: { flex: 1, fontWeight: 700 },

  divider: {
    height: 1,
    backgroundColor: "#9ca3af",
    marginVertical: 8,
  },

  /* TITULOS DE SECCION */
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
    color: "#111827",
  },

  /* CARD GENÉRICA */
  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    padding: 8,
    marginBottom: 10,
  },

  /* TABLA SIMPLE (llave/valor en filas) */
  table: {
    borderTopWidth: 1,
    borderColor: "#d1d5db",
    marginTop: 4,
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb", // slate-200
  },
  tKey: { width: 160, color: "#374151" },
  tVal: { flex: 1 },

  /* LAYOUT DOS COLUMNAS (DETALLE VS CONDICIONES) */
  twoCol: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  col: { flex: 1 },

  /* ENCABEZADO DE CADA CARD DE TABLA */
  cardHeader: {
    borderRadius: 5,
    backgroundColor: "#111827",
    color: "#f9fafb",
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 10,
    marginBottom: 4,
  },

  /* FILAS DE DINERO (alineadas a la derecha) */
  moneyRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  right: { marginLeft: "auto" },

  /* TOTAL FINAL */
  totalRowCard: {
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#16a34a",
    backgroundColor: "#ecfdf3",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    fontWeight: 700,
  },
  totalLabel: {
    fontSize: 11,
  },
  totalValue: {
    marginLeft: "auto",
    fontSize: 11,
  },
});

/* ============================
   FILAS REUTILIZABLES
   ============================ */

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
  cn_valor_moto?: Num;
  cn_descuento?: Num;
  cn_desc_auto?: Num;
  cn_jefeZona?: string | null;
  cn_valorMotoDesc?: Num;
  cn_valorBruto?: Num;
  cn_iva?: Num;
  cn_total?: Num;

  // Documentos (si quieres usarlos luego)
  soat?: Num;
  matricula?: Num;
  impuestos?: Num;

  // Accesorios
  accesorios_bruto?: Num;
  accesorios_iva?: Num;
  accesorios_total?: Num;
  seguros_total?: Num;

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

/* ============================
   DOCUMENTO
   ============================ */

const SolicitudFacturaPDF: React.FC<SolicitudFacturaPDFProps> = (props) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          {props.logoDataUrl ? (
            <Image src={props.logoDataUrl} style={styles.logo} />
          ) : null}
          <View style={styles.headerText}>
            <Text style={styles.title}>SOLICITUD DE FACTURA</Text>
            <Text style={styles.headerMeta}>
              Agencia: {NR(props.agencia ?? "")}
            </Text>
            <Text style={styles.headerMeta}>
              Fecha: {NR(props.fecha ?? "")} · Crédito:{" "}
              {NR(String(props.codigoCredito ?? ""))}
            </Text>
          </View>
        </View>

        {/* SUB-HEADER (códigos y fecha) */}
        <View style={styles.subHeaderWrapper}>
          <RowKV
            k="Código de factura:"
            v={NR(String(props.codigoFactura ?? ""))}
          />
          <RowKV
            k="Código de crédito:"
            v={NR(String(props.codigoCredito ?? ""))}
          />
          <RowKV k="Fecha:" v={NR(props.fecha ?? "")} />
          <RowKV k="Agencia:" v={NR(props.agencia ?? "")} />
        </View>

        <View style={styles.divider} />

        {/* DEUDOR */}
        <Text style={styles.sectionTitle}>Deudor / Información personal</Text>
        <View style={styles.card}>
          <View style={styles.table}>
            <RowTable k="Documento de identidad" v={NR(props.cedula ?? "")} />
            <RowTable k="Nombre" v={NR(props.nombre ?? "")} />
            <RowTable k="Dirección de residencia" v={NR(props.direccion ?? "")} />
            <RowTable k="Ciudad" v={NR(props.ciudad ?? "")} />
            <RowTable k="Teléfono" v={NR(props.telefono ?? "")} />
            <RowTable k="Estado civil" v={NR(props.estadoCivil ?? "")} />
            <RowTable k="Empresa" v={NR(props.empresa ?? "")} />
            <RowTable k="Ocupación" v={NR(props.ocupacion ?? "")} />
            <RowTable
              k="Personas a cargo"
              v={NR(String(props.personasACargo ?? ""))}
            />
            <RowTable
              k="Valor de arriendo"
              v={NR(String(props.valorArriendo ?? ""))}
            />
            <RowTable k="Finca raíz" v={NR(props.fincaRaiz ?? "")} />
            <RowTable k="Inmueble" v={NR(props.inmueble ?? "")} />
            <RowTable
              k="Tipo de vivienda"
              v={NR(props.tipoVivienda ?? "")}
            />
          </View>
        </View>

        {/* DETALLE DE LA VENTA / CONDICIONES DEL NEGOCIO */}
        <Text style={styles.sectionTitle}>
          Detalle de la venta y condiciones del negocio
        </Text>
        <View style={styles.twoCol}>
          {/* Columna izquierda: Detalle venta */}
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Detalle de la venta</Text>
              <View style={styles.table}>
                <RowTable
                  k="Recibo de pago"
                  v={NR(props.reciboPago ?? "")}
                />
                <RowTable
                  k="Motocicleta"
                  v={NR(props.motocicleta ?? "")}
                />
                <RowTable k="Modelo" v={NR(props.modelo ?? "")} />
                <RowTable
                  k="Número de motor"
                  v={NR(props.numeroMotor ?? "")}
                />
                <RowTable
                  k="Número de chasis"
                  v={NR(props.numeroChasis ?? "")}
                />
                <RowTable k="Color" v={NR(props.color ?? "")} />
              </View>
            </View>
          </View>

          {/* Columna derecha: Condiciones negocio */}
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Condiciones del negocio</Text>
              <View style={styles.table}>
                <MoneyRow
                  k="Valor moto"
                  v={props.cn_valor_moto ?? props.cn_total}
                />
                <MoneyRow
                  k="Descuento"
                  v={props.cn_descuento ?? 0}
                />
                <MoneyRow
                  k="Descuento autorizado por jefe de zona"
                  v={props.cn_desc_auto ?? 0}
                />
                <RowTable
                  k="Jefe de zona"
                  v={NR(props.cn_jefeZona ?? "")}
                />
                <MoneyRow
                  k="Valor moto - descuento"
                  v={props.cn_valorMotoDesc ?? props.cn_valor_moto}
                />
                <MoneyRow
                  k="Valor bruto"
                  v={props.cn_valorBruto}
                />
                <MoneyRow k="IVA" v={props.cn_iva} />
                <MoneyRow k="Total" v={props.cn_total} />
              </View>
            </View>
          </View>
        </View>

        {/* ACCESORIOS / SEGUROS */}
        <Text style={styles.sectionTitle}>Accesorios y seguros</Text>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Accesorios</Text>
          <View style={styles.table}>
            <MoneyRow k="Valor bruto" v={props.accesorios_bruto} />
            <MoneyRow k="IVA (19%)" v={props.accesorios_iva} />
            <MoneyRow k="Total accesorios" v={props.accesorios_total} />
            {typeof props.seguros_total === "number" ? (
              <MoneyRow k="Seguros" v={props.seguros_total} />
            ) : null}
          </View>
        </View>

        {/* TOTAL GENERAL */}
        <View style={styles.totalRowCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL GENERAL</Text>
            <Text style={styles.totalValue}>
              {fmtCOP(props.totalGeneral)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudFacturaPDF;
