// src/pages/TablaAmortizacionPDFDoc.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

/* ==========================
   Tipos base (ajusta a tu API)
   ========================== */

export interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;

  soat?: string | number;
  matricula?: string | number;
  impuestos?: string | number;
  accesorios_total?: string | number;
  precio_seguros?: string | number;          // total seguro (para dividir)
  garantia_extendida_valor?: string | number;
}

type EmpresaInfo = {
  nombre?: string;
  ciudad?: string;
  nit?: string;
};

type ClienteInfo = {
  nombre?: string;
  documento?: string;
  direccion?: string;
  telefono?: string;
};

export type TablaAmortizacionPDFProps = {
  credito: CreditoApi;
  /** tasa mensual como % (ej: 1.96 para 1,96%) */
  tasaMensualPorcentaje: number;

  /** código interno del crédito / plan */
  codigoPlan?: string;
  /** fecha del plan en string (YYYY-MM-DD o similar) */
  fechaPlan?: string;

  empresa?: EmpresaInfo;
  cliente?: ClienteInfo;
  logoUrl?: string;
};

/* ==========================
   Helpers
   ========================== */

const ACCENT = "#1f2937";
const ACCENT_LIGHT = "#f3f4f6";
const BORDER = "#d1d5db";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 40,
    marginRight: 10,
  },
  empresaNombre: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  empresaSub: {
    fontSize: 8.5,
    color: "#4b5563",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 3,
  },
  headerLine: {
    fontSize: 8.5,
    color: "#374151",
  },

  /* BLOQUE INFO PRINCIPAL */
  infoBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#111827",
  },
  infoValue: {
    fontSize: 8.5,
    color: "#111827",
  },

  /* RESUMEN ECONÓMICO */
  resumenBox: {
    flexDirection: "row",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: ACCENT_LIGHT,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  resumenCol: {
    flex: 1,
    paddingRight: 10,
  },
  resumenTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  resumenLine: {
    fontSize: 8.5,
    color: "#111827",
    marginBottom: 2,
  },

  /* TABLA */
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
  },
  th: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    textAlign: "center",
    color: "#111827",
  },
  thFirst: {
    flex: 0.4,
  },
  thLast: {
    borderRightWidth: 0,
  },
  td: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "right",
  },
  tdFirst: {
    flex: 0.4,
    textAlign: "center",
  },
  tdLast: {
    borderRightWidth: 0,
  },

  footer: {
    marginTop: 10,
    fontSize: 7.5,
    color: "#6b7280",
  },
});

const fmtCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);

const fmtDateShort = (raw?: string) => {
  if (!raw) return "";
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
};

const safe = (v: any, fallback: string = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

/* ==========================
   Lógica de amortización
   ========================== */

type AmortRow = {
  periodo: number;
  saldoInicial: number;
  interes: number;
  abonoCapital: number;
  cuotaTotal: number;
  saldoFinal: number;
};

const buildSchedule = (
  principal: number,
  tasaMensual: number,
  meses: number,
  cuotaConSeguro: number
): AmortRow[] => {
  if (!principal || !tasaMensual || !meses) return [];

  const r = tasaMensual;
  const n = meses;
  const cuotaBase =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const schedule: AmortRow[] = [];
  let saldo = principal;

  for (let i = 1; i <= n; i++) {
    const saldoInicial = saldo;
    const interes = saldoInicial * r;
    let abonoCapital = cuotaBase - interes;
    let saldoFinal = saldoInicial - abonoCapital;

    // Ajuste última cuota
    if (i === n) {
      abonoCapital = saldoInicial;
      saldoFinal = 0;
    }

    schedule.push({
      periodo: i,
      saldoInicial,
      interes,
      abonoCapital,
      cuotaTotal: cuotaConSeguro, // mostramos cuota total que paga el cliente
      saldoFinal: saldoFinal < 1 ? 0 : saldoFinal,
    });

    saldo = saldoFinal;
  }

  return schedule;
};

/* ==========================
   Componente principal PDF
   ========================== */

export const TablaAmortizacionPDFDoc: React.FC<TablaAmortizacionPDFProps> = ({
  credito,
  tasaMensualPorcentaje,
  empresa,
  cliente,
  logoUrl,
  codigoPlan,
  fechaPlan,
}) => {
  const plazo = credito.plazo_meses ?? 0;

  const valorProducto = toNumber(credito.valor_producto);
  const cuotaInicial = toNumber(credito.cuota_inicial);
  const soat = toNumber(credito.soat);
  const matricula = toNumber(credito.matricula);
  const impuestos = toNumber(credito.impuestos);
  const accesorios = toNumber(credito.accesorios_total);
  const precioSeguros = toNumber(credito.precio_seguros);
  const garantiaExt = toNumber(credito.garantia_extendida_valor);

  const baseFinanciada =
    valorProducto + soat + matricula + impuestos + accesorios + garantiaExt;

  const principal = Math.max(baseFinanciada - cuotaInicial, 0);
  const seguroMensual = plazo > 0 ? precioSeguros / plazo : 0;

  const tasaMensual = tasaMensualPorcentaje / 100; // de % a decimal
  const tasaEfectivaAnual =
    tasaMensual > 0 ? (Math.pow(1 + tasaMensual, 12) - 1) * 100 : 0;

  // cuota base SIN seguro
  const r = tasaMensual;
  const n = plazo || 1;
  const cuotaBase =
    principal && r
      ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : 0;

  const cuotaTotalMensual = cuotaBase + seguroMensual;

  const schedule = buildSchedule(principal, tasaMensual, plazo, cuotaTotalMensual);

  const fecha = fmtDateShort(fechaPlan);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.empresaNombre}>
                {empresa?.nombre ?? "PLAN DE PAGOS"}
              </Text>
              {empresa?.nit && (
                <Text style={styles.empresaSub}>NIT: {empresa.nit}</Text>
              )}
              {empresa?.ciudad && (
                <Text style={styles.empresaSub}>Ciudad: {empresa.ciudad}</Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>PLAN DE PAGOS</Text>
            {codigoPlan && (
              <Text style={styles.headerLine}>Código: {codigoPlan}</Text>
            )}
            {fecha && (
              <Text style={styles.headerLine}>Fecha: {fecha}</Text>
            )}
            {empresa?.ciudad && (
              <Text style={styles.headerLine}>Ciudad: {empresa.ciudad}</Text>
            )}
          </View>
        </View>

        {/* INFO PRINCIPAL */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{safe(cliente?.nombre)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cédula/NIT:</Text>
            <Text style={styles.infoValue}>{safe(cliente?.documento)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>{safe(cliente?.direccion)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{safe(cliente?.telefono)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Producto:</Text>
            <Text style={styles.infoValue}>Motocicleta</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor moto:</Text>
            <Text style={styles.infoValue}>{fmtCOP(valorProducto)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plazo (meses):</Text>
            <Text style={styles.infoValue}>{plazo}</Text>
          </View>
        </View>

        {/* RESUMEN ECONÓMICO */}
        <View style={styles.resumenBox}>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenTitle}>Resumen del crédito</Text>
            <Text style={styles.resumenLine}>
              Cuota inicial: {fmtCOP(cuotaInicial)}
            </Text>
            <Text style={styles.resumenLine}>
              Base financiada (incl. gastos): {fmtCOP(baseFinanciada)}
            </Text>
            <Text style={styles.resumenLine}>
              Valor a financiar: {fmtCOP(principal)}
            </Text>
          </View>
          <View style={styles.resumenCol}>
            <Text style={styles.resumenTitle}>Condiciones</Text>
            <Text style={styles.resumenLine}>
              Tasa mensual efectiva: {tasaMensualPorcentaje.toFixed(2)}%
            </Text>
            <Text style={styles.resumenLine}>
              Tasa efectiva anual: {tasaEfectivaAnual.toFixed(2)}%
            </Text>
            <Text style={styles.resumenLine}>
              Cuota mensual: {fmtCOP(cuotaTotalMensual)}{" "}
              {seguroMensual > 0
                ? `(base ${fmtCOP(cuotaBase)} + seguro ${fmtCOP(seguroMensual)})`
                : ""}
            </Text>
          </View>
        </View>

        {/* TABLA DE AMORTIZACIÓN */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.thFirst]}>Período</Text>
            <Text style={styles.th}>Saldo inicial</Text>
            <Text style={styles.th}>Intereses</Text>
            <Text style={styles.th}>Abono a capital</Text>
            <Text style={styles.th}>Cuota mensual</Text>
            <Text style={[styles.th, styles.thLast]}>Saldo final</Text>
          </View>

          {schedule.map((row) => (
            <View key={row.periodo} style={styles.tableRow}>
              <Text style={[styles.td, styles.tdFirst]}>
                {row.periodo}
              </Text>
              <Text style={styles.td}>{fmtCOP(Math.round(row.saldoInicial))}</Text>
              <Text style={styles.td}>{fmtCOP(Math.round(row.interes))}</Text>
              <Text style={styles.td}>
                {fmtCOP(Math.round(row.abonoCapital))}
              </Text>
              <Text style={styles.td}>{fmtCOP(Math.round(row.cuotaTotal))}</Text>
              <Text style={[styles.td, styles.tdLast]}>
                {fmtCOP(Math.round(row.saldoFinal))}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Este plan de pagos es un documento informativo. Los valores pueden
          variar ligeramente por redondeos y ajustes operativos de la entidad
          financiera.
        </Text>
      </Page>
    </Document>
  );
};

export default TablaAmortizacionPDFDoc;
