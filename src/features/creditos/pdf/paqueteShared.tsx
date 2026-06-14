// paqueteShared.tsx
// Piezas reutilizables para el Paquete de Crédito (11 documentos).
// Conserva el diseño elegante: caja con borde, logo a la izquierda,
// encabezado con empresa/NIT dinámicos y pie "Documento X de 11".
import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

export interface EmpresaPDF {
  nombre: string;
  nit: string;
  logoSrc?: string;
  ciudad?: string;
}

/** Datos comunes que recibe cada documento del paquete. */
export interface DocBaseProps {
  empresaNombre: string;
  empresaNit: string;
  logoSrc?: string;
  codigo?: string;
  fecha?: string;
  ciudad?: string;
  [key: string]: any;
}

export const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  borderBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#111",
    padding: 16,
  },
  /* ===== Header ===== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
    marginBottom: 3,
  },
  logoBox: {
    width: 100,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    width: 100,
    height: 54,
    objectFit: "contain",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  headerEmpresa: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    paddingHorizontal: 4,
    paddingBottom: 5,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
  },
  metaItem: { fontSize: 8 },
  /* ===== Body ===== */
  docTitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 8.4,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 4,
  },
  clauseTitle: { fontFamily: "Helvetica-Bold" },
  strong: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8 },
  /* ===== Tabla vehículo ===== */
  vehTable: {
    borderWidth: 1,
    borderColor: "#111",
    marginVertical: 6,
  },
  vehRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  vehRowLast: { flexDirection: "row" },
  vehLabel: {
    width: 80,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    padding: 3,
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderRightColor: "#111",
  },
  vehValue: {
    flex: 1,
    fontSize: 8,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: "#111",
  },
  vehValueLast: { flex: 1, fontSize: 8, padding: 3 },
  /* ===== Tabla genérica clave/valor (desembolso) ===== */
  kvTable: { borderWidth: 1, borderColor: "#111", marginVertical: 6 },
  kvRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  kvRowLast: { flexDirection: "row" },
  kvKey: {
    width: 200,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    padding: 4,
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderRightColor: "#111",
  },
  kvVal: { flex: 1, fontSize: 8, padding: 4 },
  /* ===== Firmas ===== */
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  signatureBlock: { width: 230 },
  signatureBlockFull: { width: 260, marginTop: 28 },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#111",
    width: "100%",
    marginBottom: 3,
    height: 1,
  },
  signatureLabel: { fontSize: 7.5, lineHeight: 1.35 },
  signatureLabelBold: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  /* ===== Impronta ===== */
  improntaTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  improntaBox: {
    borderWidth: 1,
    borderColor: "#111",
    height: 150,
  },
  /* ===== Footer ===== */
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    fontSize: 7,
    textAlign: "center",
    color: "#444",
  },
});

/** Línea de relleno para campos en blanco. */
export const Blank: React.FC<{ value?: any; width?: number | string }> = ({
  value,
  width = 90,
}) =>
  value ? (
    <Text style={styles.strong}>{String(value)}</Text>
  ) : (
    <Text>{"_".repeat(typeof width === "number" ? Math.round(width / 4) : 24)}</Text>
  );

/** Encabezado + pie de cada documento. Envuelve el contenido. */
export const DocLayout: React.FC<
  DocBaseProps & {
    docIndex: number;
    pageIndex?: number;
    pageCount?: number;
    children: React.ReactNode;
  }
> = ({
  empresaNombre,
  empresaNit,
  logoSrc,
  codigo,
  fecha,
  ciudad,
  docIndex,
  pageIndex = 1,
  pageCount = 1,
  children,
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.borderBox}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          {logoSrc ? <Image style={styles.logo} src={logoSrc} /> : null}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PAQUETE DE CRÉDITO</Text>
          <Text style={styles.headerEmpresa}>
            {empresaNombre} – NIT {empresaNit || "______________"}
          </Text>
        </View>
        <View style={{ width: 100 }} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaItem}>Código: {codigo || "____________"}</Text>
        <Text style={styles.metaItem}>Fecha: {fecha || "____________"}</Text>
        <Text style={styles.metaItem}>Ciudad: {ciudad || "____________"}</Text>
      </View>

      {children}
    </View>

    <Text style={styles.footer} fixed>
      Documento {docIndex} de 11 – Página {pageIndex}/{pageCount}
    </Text>
  </Page>
);

/** Tabla de identificación del vehículo (2 columnas). */
export const VehiculoTable: React.FC<{
  marca?: string;
  linea?: string;
  modelo?: string;
  color?: string;
  motor?: string;
  chasis?: string;
  placa?: string;
  servicio?: boolean;
}> = ({ marca, linea, modelo, color, motor, chasis, placa, servicio }) => {
  const cell = (
    label: string,
    value: any,
    last = false
  ): React.ReactNode => (
    <>
      <Text style={styles.vehLabel}>{label}</Text>
      <Text style={last ? styles.vehValueLast : styles.vehValue}>
        {value ? String(value) : "____________________"}
      </Text>
    </>
  );
  return (
    <View style={styles.vehTable}>
      <View style={styles.vehRow}>
        <Text style={styles.vehLabel}>CLASE</Text>
        <Text style={styles.vehValue}>Motocicleta</Text>
        {cell("MARCA", marca, true)}
      </View>
      <View style={styles.vehRow}>
        {cell("LÍNEA", linea)}
        {cell("MODELO", modelo, true)}
      </View>
      <View style={styles.vehRow}>
        {cell("COLOR", color)}
        {cell("No. MOTOR", motor, true)}
      </View>
      <View style={servicio ? styles.vehRow : styles.vehRowLast}>
        {cell("No. CHASIS", chasis)}
        {cell("PLACA", placa, true)}
      </View>
      {servicio && (
        <View style={styles.vehRowLast}>
          <Text style={styles.vehLabel}>SERVICIO</Text>
          <Text style={styles.vehValue}>Particular</Text>
          <Text style={styles.vehLabel}> </Text>
          <Text style={styles.vehValueLast}> </Text>
        </View>
      )}
    </View>
  );
};

/** Bloque de firma con línea, etiqueta y datos. */
export const Firma: React.FC<{
  rol: string;
  nombre?: string;
  cc?: string;
  extra?: { label: string; value?: string }[];
  full?: boolean;
}> = ({ rol, nombre, cc, extra, full }) => (
  <View style={full ? styles.signatureBlockFull : styles.signatureBlock}>
    <View style={{ height: 28 }} />
    <View style={styles.signatureLine} />
    <Text style={styles.signatureLabelBold}>{rol}</Text>
    {nombre !== undefined && (
      <Text style={styles.signatureLabel}>
        Nombre: {nombre || "______________________________"}
      </Text>
    )}
    {cc !== undefined && (
      <Text style={styles.signatureLabel}>
        C.C. No. {cc || "_____________________"}
      </Text>
    )}
    {extra?.map((e, i) => (
      <Text key={i} style={styles.signatureLabel}>
        {e.label}: {e.value || "_____________________"}
      </Text>
    ))}
  </View>
);
