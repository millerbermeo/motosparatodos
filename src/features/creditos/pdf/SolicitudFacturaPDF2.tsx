// src/pdf/SolicitudFacturaPDF2.tsx
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
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#111827",
  },

  sheet: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 16,
    paddingHorizontal: 18,
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
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 150,
    fontSize: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 700,
  },
  headerMeta: {
    fontSize: 8,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#9ca3af",
    marginVertical: 6,
  },

  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 4,
  },

  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tKey: {
    width: 160,
    fontSize: 8,
    color: "#374151",
  },
  tVal: {
    flex: 1,
    fontSize: 8,
  },

  twoCol: {
    flexDirection: "row",
    marginTop: 4,
  },
  colLeft: { flex: 1, marginRight: 4 },
  colRight: { flex: 1, marginLeft: 4 },

  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cardHeader: {
    backgroundColor: "#111827",
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  cardHeaderText: {
    color: "#f9fafb",
    fontSize: 8,
    fontWeight: 700,
  },
  cardBody: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  moneyRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  moneyKey: { fontSize: 8 },
  moneyVal: { marginLeft: "auto", fontSize: 8 },

  totalCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#16a34a",
    backgroundColor: "#ecfdf3",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  totalRow: {
    flexDirection: "row",
    fontWeight: 700,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    marginLeft: "auto",
    fontSize: 10,
  },
});

/* ============================
   PROPS
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
  telefono?: string | null;
  direccion?: string | null;

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
  cn_valorMotoDesc?: Num;
  cn_valorBruto?: Num;
  cn_iva?: Num;
  cn_total?: Num;

  // Documentos
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

  // Logo opcional en base64
  logoDataUrl?: string;
};

/* ============================
   COMPONENTES REUTILIZABLES
   ============================ */

const RowTable = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <View style={styles.tRow}>
    <Text style={styles.tKey}>{k}</Text>
    <Text style={styles.tVal}>{v as any}</Text>
  </View>
);

const MoneyRow = ({ k, v }: { k: string; v?: Num }) => (
  <View style={styles.moneyRow}>
    <Text style={styles.moneyKey}>{k}</Text>
    <Text style={styles.moneyVal}>{fmtCOP(v)}</Text>
  </View>
);

/* ============================
   DOCUMENTO
   ============================ */

const SolicitudFacturaPDF2: React.FC<SolicitudFacturaPDFProps> = (props) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.sheet}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <Image
              src={props.logoDataUrl || "/motomax.png"}
              style={styles.logo}
            />

            <View style={styles.headerCenter}>
              <Text style={styles.title}>SOLICITUD DE FACTURA</Text>
              <Text style={styles.companyName}>MOTOMAX DEL VALLE S.A.S.</Text>
              <Text style={styles.headerMeta}>NIT. 900139218-1</Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.headerMeta}>
                Código de factura: {NR(String(props.codigoFactura ?? ""))}
              </Text>
              <Text style={styles.headerMeta}>
                Código de cotización: {NR(String(props.codigoCredito ?? ""))}
              </Text>
              <Text style={styles.headerMeta}>
                Fecha: {NR(props.fecha ?? "")}
              </Text>
              <Text style={styles.headerMeta}>
                Agencia: {NR(props.agencia ?? "")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DEUDOR */}
          <Text style={styles.sectionTitle}>
            Deudor / Información personal
          </Text>
          <View style={styles.table}>
            <RowTable
              k="Documento de identidad"
              v={NR(props.cedula ?? "")}
            />
            <RowTable k="Nombre" v={NR(props.nombre ?? "")} />
            <RowTable
              k="Dirección de residencia"
              v={NR(props.direccion ?? "")}
            />
            <RowTable k="Teléfono" v={NR(props.telefono ?? "")} />
          </View>

          {/* DETALLE + CONDICIONES */}
          <Text style={styles.sectionTitle}>
            Detalle de la venta / Condiciones del negocio
          </Text>

          <View style={styles.twoCol}>
            {/* Detalle de la venta */}
            <View style={styles.colLeft}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    Detalle de la venta
                  </Text>
                </View>
                <View style={styles.cardBody}>
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
            </View>

            {/* Condiciones del negocio */}
            <View style={styles.colRight}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    Condiciones del negocio
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <MoneyRow
                    k="Valor moto"
                    v={props.cn_valor_moto ?? props.cn_total}
                  />
                  <MoneyRow k="Descuento" v={props.cn_descuento ?? 0} />
                  <MoneyRow
                    k="Descuento autorizado por jefe de zona"
                    v={props.cn_desc_auto ?? 0}
                  />
                  <MoneyRow
                    k="Valor moto - descuentos"
                    v={props.cn_valorMotoDesc ?? props.cn_valor_moto}
                  />
                  <MoneyRow k="Valor bruto" v={props.cn_valorBruto} />
                  <MoneyRow k="IVA" v={props.cn_iva} />
                  <MoneyRow k="Total" v={props.cn_total} />
                </View>
              </View>
            </View>
          </View>

          {/* ACCESORIOS + RESUMEN */}
          <Text style={styles.sectionTitle}>Accesorios / Totales</Text>
          <View style={styles.twoCol}>
            {/* Accesorios */}
            <View style={styles.colLeft}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Accesorios</Text>
                </View>
                <View style={styles.cardBody}>
                  <MoneyRow
                    k="Valor bruto"
                    v={props.accesorios_bruto}
                  />
                  <MoneyRow
                    k="IVA"
                    v={props.accesorios_iva}
                  />
                  <MoneyRow
                    k="Total accesorios"
                    v={props.accesorios_total}
                  />
                </View>
              </View>
            </View>

            {/* Resumen documentos + total */}
            <View style={styles.colRight}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    Resumen de valores
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <MoneyRow k="Valor moto" v={props.cn_total} />
                  <MoneyRow k="SOAT" v={props.soat} />
                  <MoneyRow k="Matrícula" v={props.matricula} />
                  <MoneyRow k="Impuestos" v={props.impuestos} />
                  <MoneyRow
                    k="Accesorios"
                    v={props.accesorios_total}
                  />
                  <MoneyRow
                    k="TOTAL"
                    v={props.totalGeneral}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* TOTAL GENERAL */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL GENERAL</Text>
              <Text style={styles.totalValue}>
                {fmtCOP(props.totalGeneral)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudFacturaPDF2;
