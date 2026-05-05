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

/* ============================================================
   Tipos
   ============================================================ */

export interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;
  soat?: string | number;
  matricula?: string | number;
  impuestos?: string | number;
  accesorios_total?: string | number;
  precio_seguros?: string | number;
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
  /** Tasa de financiación mensual como % (ej: 1.9189) */
  tasaMensualPorcentaje: number;
  /** Tasa de garantía mensual como % (ej: 1.5) */
  tasaGarantiaPorcentaje?: number;
  codigoPlan?: string;
  fechaPlan?: string;
  empresa?: EmpresaInfo;
  cliente?: ClienteInfo;
  producto?: string;
  logoUrl?: string;
};

/* ============================================================
   Estilos
   ============================================================ */

const DARK = "#1f2937";
const BORDER = "#d1d5db";
const LIGHT_BG = "#f9fafb";
const HEADER_BG = "#374151";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  /* CABECERA EMPRESA */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: DARK,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 80, height: 36, marginRight: 8 },
  empresaNombre: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111827" },
  empresaSub: { fontSize: 7.5, color: "#4b5563", marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 2,
  },
  headerSub: { fontSize: 7.5, color: "#374151", marginTop: 1 },

  /* RESUMEN 3 COLUMNAS */
  summaryRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginBottom: 10,
  },
  summaryCol: {
    flex: 1,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  summaryColLast: { flex: 1, padding: 7 },
  summaryColTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2.5,
  },
  summaryLabel: { fontSize: 7.5, color: "#4b5563", flex: 1 },
  summaryValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "right",
  },
  summaryValueAccent: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    textAlign: "right",
  },
  summaryValueRose: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#be123c",
    textAlign: "right",
  },
  summaryValueGreen: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
    textAlign: "right",
  },
  summaryDivider: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },

  /* TABLA */
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: HEADER_BG,
  },
  tableRow: { flexDirection: "row" },
  tableRowAlt: { flexDirection: "row", backgroundColor: LIGHT_BG },

  th: {
    paddingVertical: 5,
    paddingHorizontal: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
    borderRightWidth: 0.5,
    borderRightColor: "#6b7280",
  },
  thCenter: { textAlign: "center" },
  thLast: { borderRightWidth: 0 },

  td: {
    paddingVertical: 2.5,
    paddingHorizontal: 3,
    fontSize: 7,
    color: "#111827",
    textAlign: "right",
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  tdCenter: { textAlign: "center", color: "#6b7280" },
  tdBold: { fontFamily: "Helvetica-Bold", color: "#065f46" },
  tdRose: { fontFamily: "Helvetica-Bold", color: "#be123c" },
  tdLast: { borderRightWidth: 0 },

  /* PIE */
  footer: {
    marginTop: 10,
    fontSize: 7,
    color: "#6b7280",
    fontStyle: "italic",
  },

  /* FIRMAS */
  signatureSection: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signatureBlock: {
    width: "40%",
    alignItems: "center",
  },
  signatureSpace: { height: 48 },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: DARK,
    width: "100%",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
  },
  signatureSub: {
    fontSize: 7,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
  },
});

/* ============================================================
   Helpers
   ============================================================ */

const fmtCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? Math.round(v) : 0);

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safe = (v: unknown, fallback = "—") =>
  v === null || v === undefined || String(v).trim() === "" ? fallback : String(v);

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const parseLocalDate = (raw: string): Date => {
  const s = raw.substring(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtFechaMes = (fecha: Date): string =>
  `${MESES_ES[fecha.getMonth()]}/${fecha.getFullYear()}`;

const fmtFechaCorta = (raw?: string): string => {
  if (!raw) return "—";
  const d = parseLocalDate(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

/* PMT positivo (igual a calcularCuotaPMT pero sin negativo) */
const pmt = (principal: number, tasaPct: number, meses: number): number => {
  if (principal <= 0 || meses <= 0) return 0;
  const r = tasaPct / 100;
  if (r === 0) return principal / meses;
  return (r * principal) / (1 - Math.pow(1 + r, -meses));
};

/* Seguro deudor — igual a calcularSeguroDeudorMensual */
const calcSeguro = (saldo: number): number =>
  saldo > 0 ? Math.round(saldo * 0.00043) : 0;

/* ============================================================
   Tipo fila
   ============================================================ */

type ScheduleRow = {
  periodo: number;
  fecha: Date;
  interes: number;
  abonoCapital: number;
  garantiaYSeguros: number;
  cuotaTotalMes: number;
  saldoFinal: number;
};

const buildSchedule = (
  principal: number,
  tasaFinMensual: number,
  cuotaNegocio: number,
  garantiaYSeguros: number,
  meses: number,
  fechaInicio: Date
): ScheduleRow[] => {
  if (principal <= 0 || meses <= 0) return [];
  const rows: ScheduleRow[] = [];
  let saldo = principal;

  for (let i = 1; i <= meses; i++) {
    const saldoInicial = saldo;
    const interes = saldoInicial * tasaFinMensual;
    let abonoCapital = cuotaNegocio - interes;
    let saldoFinal = saldoInicial - abonoCapital;

    if (i === meses || saldoFinal < 1) {
      abonoCapital = saldoInicial;
      saldoFinal = 0;
    }

    rows.push({
      periodo: i,
      fecha: addMonths(fechaInicio, i),
      interes,
      abonoCapital,
      garantiaYSeguros,
      cuotaTotalMes: cuotaNegocio + garantiaYSeguros,
      saldoFinal,
    });

    saldo = saldoFinal;
  }
  return rows;
};

/* ============================================================
   Flex por columna
   ============================================================ */
const F_PER  = 0.35;
const F_FECH = 0.8;
const F_DEF  = 1;

/* ============================================================
   Componente PDF
   ============================================================ */

export const TablaAmortizacionPDFDoc: React.FC<TablaAmortizacionPDFProps> = ({
  credito,
  tasaMensualPorcentaje,
  tasaGarantiaPorcentaje = 1.5,
  empresa,
  cliente,
  producto,
  logoUrl,
  codigoPlan,
  fechaPlan,
}) => {
  const plazo          = toNumber(credito.plazo_meses);
  const valorProducto  = toNumber(credito.valor_producto);
  const cuotaInicial   = toNumber(credito.cuota_inicial);
  const valorGarantia  = toNumber(credito.garantia_extendida_valor);

  // valorTotal = precio completo de la moto (valorProducto ya viene sin garantía)
  const valorTotal    = valorProducto + valorGarantia;
  const saldoNegocio  = Math.max(valorProducto - cuotaInicial, 0);
  const saldoGarantia = Math.max(valorGarantia, 0);

  const tasaFinMensual = tasaMensualPorcentaje / 100;
  const teaFin         = Math.pow(1 + tasaFinMensual, 12) - 1;

  const cuotaNegocio    = Math.floor(pmt(saldoNegocio,  tasaMensualPorcentaje,  plazo));
  const cuotaGarantia   = Math.floor(pmt(saldoGarantia, tasaGarantiaPorcentaje, plazo));
  const seguroFijo      = Math.floor(calcSeguro(saldoNegocio));
  const garantiaYSeg    = cuotaGarantia + seguroFijo;
  const cuotaTotalMes   = cuotaNegocio + garantiaYSeg;

  const fechaInicio = fechaPlan ? parseLocalDate(fechaPlan) : new Date();
  const schedule    = buildSchedule(saldoNegocio, tasaFinMensual, cuotaNegocio, garantiaYSeg, plazo, fechaInicio);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>

        {/* ── CABECERA EMPRESA ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.empresaNombre}>{empresa?.nombre ?? "PLAN DE PAGOS"}</Text>
              {empresa?.nit    && <Text style={styles.empresaSub}>NIT: {empresa.nit}</Text>}
              {empresa?.ciudad && <Text style={styles.empresaSub}>Ciudad: {empresa.ciudad}</Text>}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>TABLA DE AMORTIZACIÓN</Text>
            <Text style={styles.headerSub}>Sistema Francés — Crédito Directo</Text>
            {codigoPlan && <Text style={styles.headerSub}>Código: {codigoPlan}</Text>}
          </View>
        </View>

        {/* ── RESUMEN 3 COLUMNAS ── */}
        <View style={styles.summaryRow}>

          {/* Col 1 — Cliente */}
          <View style={styles.summaryCol}>
            <Text style={styles.summaryColTitle}>Datos del cliente</Text>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Cédula:</Text>
              <Text style={styles.summaryValue}>{safe(cliente?.documento)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Nombre:</Text>
              <Text style={styles.summaryValue}>{safe(cliente?.nombre)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Dirección:</Text>
              <Text style={styles.summaryValue}>{safe(cliente?.direccion)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Teléfono:</Text>
              <Text style={styles.summaryValue}>{safe(cliente?.telefono)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Fecha desembolso:</Text>
              <Text style={styles.summaryValue}>{fmtFechaCorta(fechaPlan)}</Text>
            </View>
          </View>

          {/* Col 2 — Valores */}
          <View style={styles.summaryCol}>
            <Text style={styles.summaryColTitle}>Información del crédito</Text>
            {producto ? (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Producto:</Text>
                <Text style={styles.summaryValue}>{producto.toUpperCase()}</Text>
              </View>
            ) : null}
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryValue}>{fmtCOP(valorTotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Cuota Inicial:</Text>
              <Text style={styles.summaryValue}>{fmtCOP(cuotaInicial)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Valor a financiar:</Text>
              <Text style={styles.summaryValueAccent}>{fmtCOP(saldoNegocio)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Garantía y Seguros:</Text>
              <Text style={styles.summaryValueRose}>{fmtCOP(garantiaYSeg)}</Text>
            </View>
          </View>

          {/* Col 3 — Tasas */}
          <View style={styles.summaryColLast}>
            <Text style={styles.summaryColTitle}>Condiciones</Text>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Tasa efectiva mensual:</Text>
              <Text style={styles.summaryValue}>{tasaMensualPorcentaje.toFixed(4)}%</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Tasa efectiva anual:</Text>
              <Text style={styles.summaryValue}>{fmtPct(teaFin)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Plazo (Meses):</Text>
              <Text style={styles.summaryValue}>{plazo}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Cuota:</Text>
              <Text style={styles.summaryValueAccent}>{fmtCOP(cuotaNegocio)}</Text>
            </View>
            <View style={[styles.summaryLine, styles.summaryDivider]}>
              <Text style={[styles.summaryLabel, { fontFamily: "Helvetica-Bold" }]}>CuotaTotal Mes:</Text>
              <Text style={styles.summaryValueGreen}>{fmtCOP(cuotaTotalMes)}</Text>
            </View>
          </View>
        </View>

        {/* ── TABLA AMORTIZACIÓN ── */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.thCenter, { flex: F_PER  }]}>Per.</Text>
            <Text style={[styles.th, styles.thCenter, { flex: F_FECH }]}>Fecha</Text>
            <Text style={[styles.th, { flex: F_DEF }]}>Intereses</Text>
            <Text style={[styles.th, { flex: F_DEF }]}>Abono Capital</Text>
            <Text style={[styles.th, { flex: F_DEF }]}>Garantía y Seguros</Text>
            <Text style={[styles.th, { flex: F_DEF }]}>Total Cuota Mes</Text>
            <Text style={[styles.th, styles.thLast, { flex: F_DEF }]}>Saldo Final</Text>
          </View>

          {schedule.map((row, idx) => (
            <View key={row.periodo} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.td, styles.tdCenter, { flex: F_PER  }]}>{row.periodo}</Text>
              <Text style={[styles.td, styles.tdCenter, { flex: F_FECH }]}>{fmtFechaMes(row.fecha)}</Text>
              <Text style={[styles.td, { flex: F_DEF }]}>{fmtCOP(row.interes)}</Text>
              <Text style={[styles.td, { flex: F_DEF }]}>{fmtCOP(row.abonoCapital)}</Text>
              <Text style={[styles.td, styles.tdRose, { flex: F_DEF }]}>{fmtCOP(row.garantiaYSeguros)}</Text>
              <Text style={[styles.td, styles.tdBold, { flex: F_DEF }]}>{fmtCOP(row.cuotaTotalMes)}</Text>
              <Text style={[styles.td, styles.tdLast, { flex: F_DEF }]}>{fmtCOP(row.saldoFinal)}</Text>
            </View>
          ))}
        </View>

        {/* ── NOTA PIE ── */}
        <Text style={styles.footer}>
          Simulación inicial del crédito bajo los parámetros básicos, no contiene ajustes o acuerdos de pago.
          Los valores pueden variar ligeramente por redondeos operativos.
        </Text>

        {/* ── FIRMAS ── */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma del Cliente</Text>
            <Text style={styles.signatureSub}>{safe(cliente?.nombre)}</Text>
            <Text style={styles.signatureSub}>C.C. {safe(cliente?.documento)}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma del Asesor</Text>
            <Text style={styles.signatureSub}>{safe(empresa?.nombre)}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default TablaAmortizacionPDFDoc;
