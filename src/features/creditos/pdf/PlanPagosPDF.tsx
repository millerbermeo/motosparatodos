// src/components/creditos/PlanPagosPDF.tsx
import React, { useMemo } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export type PlanPagosInput = {
  codigo?: string | number;
  ciudad?: string;
  logoUrl?: string;
  cliente: { nombre?: string; documento?: string; direccion?: string; telefono?: string };
  producto: { nombre?: string; valor?: number };
  credito: {
    cuotaInicial?: number; plazoMeses?: number; tasaMensual?: number; tasaAnual?: number;
    fechaInicio?: string | Date; fechaEntrega?: string | null;
  };
};

/* ============ estilos ============ */
const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingHorizontal: 40, paddingBottom: 36, fontSize: 9.5, color: "#111" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  logo: { width: 72, height: 72, objectFit: "contain" },
  titleWrap: { marginLeft: 16 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: 0.2 },
  meta: { fontSize: 9, marginTop: 2 },
  hr: { height: 1, backgroundColor: "#E5E7EB", marginTop: 8, marginBottom: 12 },

  box: { borderWidth: 1, borderStyle: "solid", borderColor: "#D1D5DB", borderRadius: 2, overflow: "hidden" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" },
  cell: { paddingVertical: 6, paddingHorizontal: 8, fontSize: 9.5, borderRightWidth: 1, borderRightStyle: "solid", borderRightColor: "#E5E7EB" },
  head: { backgroundColor: "#F3F4F6", fontWeight: 700 },

  // anchos útiles para que no se amontone
  wHalf: { width: "50%" },
  wThird: { width: "33.3333%" },
  wTwoThird: { width: "66.6666%" },
  wQuarter: { width: "25%" },

  textRight: { textAlign: "right" },
  foot: { marginTop: 18, fontSize: 9, lineHeight: 1.4 },
});

const fmtCOP = (v: number) =>
  (v ?? 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const fdate = (d?: string | Date) => {
  const x = d ? new Date(d) : new Date();
  return x.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const calcCuota = (P: number, r: number, n: number) => (r ? Math.round((r * P) / (1 - Math.pow(1 + r, -n))) : Math.round(P / Math.max(1, n)));

type Row = { periodo: number; saldoInicial: number; intereses: number; abono: number; cuota: number; saldoFinal: number };

function buildTabla({
  valorProducto, cuotaInicial, plazo, tasaMensual,
}: { valorProducto: number; cuotaInicial: number; plazo: number; tasaMensual: number }) {
  const valorFinanciado = Math.max(0, valorProducto - cuotaInicial);
  const cuota = calcCuota(valorFinanciado, tasaMensual, plazo);
  const rows: Row[] = [];
  let saldo = valorFinanciado;

  for (let i = 1; i <= plazo; i++) {
    const intereses = Math.round(saldo * tasaMensual);
    const abono = i === plazo ? saldo : (cuota - intereses);
    const saldoFinal = Math.max(0, saldo - abono);
    rows.push({ periodo: i, saldoInicial: saldo, intereses, abono, cuota, saldoFinal });
    saldo = saldoFinal;
  }
  return { rows, valorFinanciado, cuota };
}

/* ============ documento ============ */
const PlanPagosPDFDoc: React.FC<{ input: PlanPagosInput }> = ({ input }) => {
  const ciudad = input.ciudad || "Cali";
  const fechaDoc = fdate(new Date());
  const fechaEntrega = input.credito?.fechaEntrega ?? "No entregado";

  const productoNombre = input.producto?.nombre || "Motocicleta";
  const valorProducto = Number(input.producto?.valor ?? 0);
  const cuotaInicial = Number(input.credito?.cuotaInicial ?? 0);
  const plazoMeses = Number(input.credito?.plazoMeses ?? 1);
  const tasaMensual = Number(input.credito?.tasaMensual ?? 0.0196);
  const tasaAnual = Number(input.credito?.tasaAnual ?? 0.2352);
  const { rows, valorFinanciado, cuota } = buildTabla({ valorProducto, cuotaInicial, plazo: plazoMeses, tasaMensual });

  const c = input.cliente || {};
  const logoSrc = input.logoUrl || "/logo.png";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.titleWrap}>
            <Text style={styles.title}>PLAN DE PAGOS</Text>
            <Text style={styles.meta}>Código: {String(input.codigo ?? "-")}</Text>
            <Text style={styles.meta}>Fecha: {fechaDoc}</Text>
            <Text style={styles.meta}>Ciudad: {ciudad}</Text>
          </View>
        </View>
        <View style={styles.hr} />

        {/* Datos del cliente / producto */}
        <View style={styles.box}>
          {/* fila 1: nombre (2/3) + documento (1/3) */}
          <View style={[styles.row]}>
            <Text style={[styles.cell, styles.wTwoThird]}>Nombre: {c.nombre || "—"}</Text>
            <Text style={[styles.cell, styles.wThird]}>Cédula/Nit: {c.documento || "—"}</Text>
          </View>
          {/* fila 2: dirección (2/3) + teléfono (1/3) */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.wTwoThird]}>Dirección: {c.direccion || "—"}</Text>
            <Text style={[styles.cell, styles.wThird]}>Teléfono: {c.telefono || "—"}</Text>
          </View>
          {/* fila 3: producto (2/3) + valor (1/3) */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.wTwoThird]}>Producto: {productoNombre}</Text>
            <Text style={[styles.cell, styles.wThird]}>Valor: {fmtCOP(valorProducto)}</Text>
          </View>
          {/* fila 4: inicial / financiar / plazo */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.wThird]}>Cuota inicial: {fmtCOP(cuotaInicial)}</Text>
            <Text style={[styles.cell, styles.wThird]}>Valor a financiar: {fmtCOP(valorFinanciado)}</Text>
            <Text style={[styles.cell, styles.wThird]}>Plazo(Meses): {plazoMeses}</Text>
          </View>
          {/* fila 5: tasas / cuota / entrega */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.wThird]}>TASA mensual efectiva: {(tasaMensual * 100).toFixed(2)}%</Text>
            <Text style={[styles.cell, styles.wThird]}>TASA efectiva anual: {(tasaAnual * 100).toFixed(2)}%</Text>
            <Text style={[styles.cell, styles.wThird]}>Cuota mensual: {fmtCOP(cuota)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.wThird]}>Fecha entrega: {fechaEntrega || "—"}</Text>
            <Text style={[styles.cell, styles.wTwoThird]}> </Text>
          </View>
        </View>

        {/* Tabla de amortización */}
        <View style={[styles.box, { marginTop: 14 }]}>
          <View style={[styles.row, styles.head]}>
            <Text style={[styles.cell, styles.wQuarter]}>Periodo</Text>
            <Text style={[styles.cell, styles.wQuarter]}>Saldo inicial</Text>
            <Text style={[styles.cell, styles.wQuarter]}>Intereses</Text>
            <Text style={[styles.cell, styles.wQuarter]}>Abono a capital</Text>
          </View>
          {rows.map((r) => (
            <View key={r.periodo} style={styles.row}>
              <Text style={[styles.cell, styles.wQuarter]}>{r.periodo}</Text>
              <Text style={[styles.cell, styles.wQuarter, styles.textRight]}>{fmtCOP(r.saldoInicial)}</Text>
              <Text style={[styles.cell, styles.wQuarter, styles.textRight]}>{fmtCOP(r.intereses)}</Text>
              <Text style={[styles.cell, styles.wQuarter, styles.textRight]}>{fmtCOP(r.abono)}</Text>
            </View>
          ))}
        </View>

        {/* Totales / cuota / saldo final en otra cajita para aire visual */}
        <View style={[styles.box, { marginTop: 10 }]}>
          <View style={[styles.row, styles.head]}>
            <Text style={[styles.cell, styles.wThird]}>Total cuota mensual</Text>
            <Text style={[styles.cell, styles.wThird]}>Saldo final</Text>
            <Text style={[styles.cell, styles.wThird]}>Observaciones</Text>
          </View>
          {rows.map((r) => (
            <View key={`t-${r.periodo}`} style={styles.row}>
              <Text style={[styles.cell, styles.wThird, styles.textRight]}>{fmtCOP(r.cuota)}</Text>
              <Text style={[styles.cell, styles.wThird, styles.textRight]}>{fmtCOP(r.saldoFinal)}</Text>
              <Text style={[styles.cell, styles.wThird]}>Periodo {r.periodo}</Text>
            </View>
          ))}
        </View>

        {/* Pie */}
        <View style={styles.foot}>
          <Text>Firma del cliente: _____________________________</Text>
          <Text style={{ marginTop: 10 }}>VERIFICARTE AAA S.A.S.  •  NIT. 901155548-8</Text>
        </View>
      </Page>
    </Document>
  );
};

/* ============ botón descarga ============ */
const PlanPagosPDF: React.FC<{ input: PlanPagosInput; fileName?: string }> = ({ input, fileName }) => {
  const name = useMemo(() => fileName || `plan_pagos_${input?.codigo ?? "credito"}.pdf`, [fileName, input?.codigo]);
  return (
    <div className="inline-flex items-center">
      <PDFDownloadLink document={<PlanPagosPDFDoc input={input} />} fileName={name}>
        {({ loading }) => (
          <button className="btn btn-accent" type="button">
            {loading ? "Generando PDF…" : "Descargar plan de pagos"}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default PlanPagosPDF;
