// src/pages/CartaAprobacion.tsx
import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

/* ============================
   Tipos
   ============================ */

export type CotizacionApi = {
  success: boolean;
  data: any;
};

type CartaAprobacionPDFProps = {
  cotizacion: CotizacionApi;          // mismo JSON de cotización
  codigo?: string;                    // Código de la carta, por defecto "342"
  ciudad?: string;                    // Ciudad, por defecto "Cali"
  empresaNombre?: string;             // VERIFICARTE AAA S.A.S.
  empresaNit?: string;                // NIT. 901155548-8
};

/* ============================
   Helpers
   ============================ */

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  headerLine: {
    marginTop: 6,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
  },
  block: {
    marginBottom: 10,
  },
  labelLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  strong: {
    fontWeight: "bold",
  },
  spacedLine: {
    marginTop: 4,
    marginBottom: 2,
    fontSize: 10,
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 6,
    textAlign: "justify",
    lineHeight: 1.3,
  },
  bulletList: {
    marginTop: 6,
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletIndex: {
    width: 12,
    fontSize: 10,
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    textAlign: "justify",
  },
  footerLine: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
  },
  footerText: {
    marginTop: 4,
    fontSize: 9,
    textAlign: "center",
  },
});

const fmtCOP = (v: any) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

const safe = (v: any, fallback: string = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const fmtDateShort = (raw?: string) => {
  if (!raw) return "";
  try {
    const d = new Date(raw.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return raw;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return raw ?? "";
  }
};

const addDays = (raw: string | undefined, days: number): string => {
  if (!raw) return "";
  try {
    const d = new Date(raw.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return raw;
    d.setDate(d.getDate() + days);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return raw ?? "";
  }
};

/* ============================
   Documento PDF
   ============================ */

export const CartaAprobacionPDF: React.FC<CartaAprobacionPDFProps> = ({
  cotizacion,
  codigo = "342",
  ciudad = "Cali",
  empresaNombre = "VERIFICARTE AAA S.A.S.",
  empresaNit = "901155548-8",
}) => {
  const d = cotizacion?.data || {};

  const nombreCompletoCliente = [
    d.name,
    d.s_name,
    d.last_name,
    d.s_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const asesor = safe(d.asesor, "Asesor");
  const cedula = safe(d.cedula);
  const celular = safe(d.celular);

  const motoALabel = [d.marca_a, d.linea_a, d.modelo_a]
    .filter(Boolean)
    .join(" ");

  const fechaCarta = fmtDateShort(d.fecha_creacion);
  const precioTotal = fmtCOP(d.precio_total_a);
  const cuotaInicial = fmtCOP(d.cuota_inicial_a);
  const valorGarantiaExt = fmtCOP(d.valor_garantia_extendida_a);

  const valorFinanciar = fmtCOP(d.saldo_financiar_a);

  // Elegimos una cuota mensual representativa (por ejemplo, 24 meses; si no, la primera disponible)
  const cuotaMensual = (() => {
    if (d.cuota_24_a) return fmtCOP(d.cuota_24_a);
    if (d.cuota_12_a) return fmtCOP(d.cuota_12_a);
    if (d.cuota_36_a) return fmtCOP(d.cuota_36_a);
    return fmtCOP(0);
  })();

  const fechaPrimeraCuota = addDays(d.fecha_creacion, 30);

  return (
    <Document>
      {/* ========== PÁGINA 1 ========== */}
      <Page size="A4" style={styles.page}>
        {/* Encabezado tipo carta */}
        <Text style={styles.headerTitle}>CARTA DE APROBACIÓN</Text>
        <Text style={styles.headerSub}>Código: {codigo}</Text>
        <Text style={styles.headerSub}>
          Fecha: {fechaCarta || "—"}   ·   Ciudad: {ciudad}
        </Text>
        <Text style={styles.headerSub}>{empresaNombre}</Text>
        <Text style={styles.headerSub}>NIT. {empresaNit}</Text>
        <View style={styles.headerLine} />

        {/* Bloque de datos del cliente y producto */}
        <View style={styles.block}>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Señor/a: </Text>
            {asesor}
          </Text>
          <Text style={styles.labelLine}>
            {safe(nombreCompletoCliente)}   {celular}
          </Text>
          <Text style={styles.labelLine}>
            CC {cedula}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Producto:</Text>{" "}
            {motoALabel || "Saldo"}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Precio de venta total:</Text>{" "}
            {precioTotal}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Cuota inicial:</Text>{" "}
            {cuotaInicial}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Garantía extendida:</Text>{" "}
            {valorGarantiaExt}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Valor a financiar:</Text>{" "}
            {valorFinanciar}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>Valor cuota mensual:</Text>{" "}
            {cuotaMensual}
          </Text>
          <Text style={styles.labelLine}>
            <Text style={styles.strong}>
              Fecha de vencimiento primera cuota:
            </Text>{" "}
            {fechaPrimeraCuota}
          </Text>
        </View>

        {/* Texto explicativo / vigencia */}
        <View style={styles.block}>
          <Text style={styles.paragraph}>
            Esta aprobación tiene una vigencia de 30 días calendario a partir de
            la fecha, pasado este tiempo el cliente deberá aportar nuevamente la
            documentación que requiere Verificarte AAA S.A.S. para realizar un
            nuevo estudio de crédito.
          </Text>
          <Text style={styles.paragraph}>
            Estimado cliente, le recordamos que el 10 de cada mes reportamos a
            las centrales de riesgo y que con su buen comportamiento crediticio
            y hábito de pago puede pertenecer a la familia VERIFICARTE AAA
            S.A.S., como cliente PREFERENCIAL, donde fácilmente puede adquirir
            su nuevo crédito.
          </Text>
          <Text style={styles.paragraph}>
            Sus pagos los puede realizar en cualquier punto de recaudo habilitado
            por Verificarte AAA S.A.S., tales como redes aliadas, corresponsales
            bancarios o por medio de transferencia electrónica, según la
            información suministrada por el área de cartera.
          </Text>
        </View>

        <View style={styles.footerLine} />
        <Text style={styles.footerText}>
          {empresaNombre} · NIT {empresaNit}
        </Text>
      </Page>

      {/* ========== PÁGINA 2: PLAN DE FIDELIZACIÓN ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerTitle}>CARTA DE APROBACIÓN</Text>
        <Text style={styles.headerSub}>Código: {codigo}</Text>
        <Text style={styles.headerSub}>
          Fecha: {fechaCarta || "—"}   ·   Ciudad: {ciudad}
        </Text>
        <Text style={styles.headerSub}>{empresaNombre}</Text>
        <Text style={styles.headerSub}>NIT. {empresaNit}</Text>
        <View style={styles.headerLine} />

        <Text style={[styles.spacedLine, styles.strong]}>
          PLAN DE FIDELIZACIÓN
        </Text>

        {/* Lista de puntos (texto tal cual tu carta) */}
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>1.</Text>
            <Text style={styles.bulletText}>
              Obtener descuentos del 10% en mano de obra, repuestos y accesorios
              durante los dos primeros años de uso de su motocicleta.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>2.</Text>
            <Text style={styles.bulletText}>
              Pertenecer a la comunidad TuClick, el primer centro comercial
              virtual de la movilidad en Colombia que le conectará con puntos de
              venta, financieras, aseguradoras, proveedores de repuestos,
              secretarías de tránsito, escuelas de conducción, CDA´s – Centros de
              Diagnóstico Automotor para hacer la Revisión Técnico-Mecánica,
              talleres de servicio técnico, retomadores y más servicios a nivel
              nacional.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>3.</Text>
            <Text style={styles.bulletText}>
              Activar un cupo de crédito rotativo que puede utilizar para renovar
              SOAT, comprar repuestos, pagar mano de obra en nuestros talleres,
              comprar cascos y accesorios, pagar seguros todo riesgo y muchos
              otros beneficios. Aplican T&C: deberá cumplir el plan de
              mantenimiento preventivo correspondiente al periodo de garantía de
              fábrica de su motocicleta, y en el mes 11 podrá solicitar la
              activación del cupo de crédito rotativo.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>4.</Text>
            <Text style={styles.bulletText}>
              Acceder a nuestra asesoría en finanzas personales para que pueda
              hacer un análisis de su situación actual financiera y definir
              estrategias que le permitan mejorarla, todo esto enfocado en un
              análisis de riesgo que buscará, a través de la educación y el
              manejo de herramientas financieras, minimizar los riesgos de sus
              proyectos e inversiones. *Aplica también para finanzas
              empresariales.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>5.</Text>
            <Text style={styles.bulletText}>
              Solicitar una vez por año, durante el periodo del crédito, un
              diagnóstico gratuito “Semáforo Estado General del Vehículo”, que le
              informará a través de los colores VERDE-AMARILLO-ROJO la vida útil
              de las partes de desgaste de su vehículo y del estado de
              funcionamiento del motor del mismo.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>6.</Text>
            <Text style={styles.bulletText}>
              Es muy importante aclarar que a todos estos beneficios, además de
              los puntos contratados con la empresa que le vende el vehículo con
              garantía extendida y complementaria, podrá acceder si mantiene su
              crédito al día. Nuestro aliado IKIGAI SEGUROS ofrece las mejores
              soluciones en seguros para las personas, para la movilidad y para
              las empresas.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletIndex}>7.</Text>
            <Text style={styles.bulletText}>
              Condiciones de prepago: el cliente podrá realizar pagos anticipados
              de su obligación, en los términos establecidos por la Ley 1555 de
              2012, así como en las normas que la modifiquen o sustituyan, sin
              incurrir en ningún tipo de penalización. En este evento, el cliente
              podrá decidir si el pago anticipado que realice se abonará a
              capital con disminución del plazo inicialmente pactado o con
              disminución del valor de la cuota de la respectiva obligación. Para
              estos efectos, deberá informar su decisión a Verificarte AAA S.A.S.,
              a más tardar dentro de los 15 días hábiles siguientes a la fecha del
              pago anticipado; si transcurrido este plazo el cliente no indica
              cómo aplicar este pago anticipado, Verificarte AAA S.A.S. abonará a
              capital con disminución del plazo, conservando el mismo valor de
              cuota definido dentro de las condiciones iniciales del crédito.
            </Text>
          </View>
        </View>

        <View style={styles.footerLine} />
        <Text style={styles.footerText}>
          {empresaNombre} · NIT {empresaNit}
        </Text>
      </Page>
    </Document>
  );
};

/* ============================
   Componente de descarga Web
   ============================ */

const CartaAprobacion: React.FC<{
  cotizacion: CotizacionApi;
}> = ({ cotizacion }) => {
  const d = cotizacion?.data || {};
  const fileName = useMemo(
    () =>
      `CartaAprobacion_${d?.cedula || d?.id || "cliente"}.pdf`,
    [d?.cedula, d?.id]
  );

  return (
    <PDFDownloadLink
      document={<CartaAprobacionPDF cotizacion={cotizacion} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <button className="btn btn-success btn-sm" type="button">
          {loading ? "Generando carta…" : "Descargar Carta de Aprobación"}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default CartaAprobacion;
