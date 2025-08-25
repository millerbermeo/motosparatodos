import React, { Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCredito, useDeudor } from "../../../services/creditosServices";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// ================= Utils =================
const fmtCOP = (v?: number | null) => {
  if (v === undefined || v === null || Number.isNaN(v)) return "$0";
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${v}`;
  }
};

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return d;
  }
};

// ================= Styles (clonado del diseño) =================
const styles = StyleSheet.create({
  page: { paddingTop: 24, paddingHorizontal: 28, paddingBottom: 24, fontSize: 10, color: "#111" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 92, height: 92, objectFit: "contain" },
  headerText: { marginLeft: 20 },
  title: { fontSize: 26, fontWeight: 700 },
  metaLine: { fontSize: 12, marginTop: 4 },
  metaBold: { fontWeight: 700 },

  hrWrap: { marginTop: 6, marginBottom: 4 },
  hr1: { height: 2, backgroundColor: "#111" },
  hr2: { height: 1, backgroundColor: "#111", marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 10 },

  row: { flexDirection: "row", alignItems: "stretch" },
  cell: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#9CA3AF",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  cellR: {
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "#9CA3AF",
  },
  label: { fontSize: 8, fontWeight: 700, color: "#111" },
  value: { fontSize: 10, marginTop: 2 },

  twoCols: { flexDirection: "row", gap: 18, marginTop: 12 },
  col: { flex: 1 },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#9CA3AF",
    paddingVertical: 5,
  },
  lineLabel: { fontSize: 10 },
  lineValue: { fontSize: 10, fontWeight: 700 },

  legal: { marginTop: 10, fontSize: 8, lineHeight: 1.35, textAlign: "justify" },

  signatureBox: { marginTop: 20, width: 220, height: 150, borderWidth: 1, borderStyle: "solid", borderColor: "#111" },
  signatureLine: { marginTop: 18, width: 220, height: 0, borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#111" },
  signatureText: { fontSize: 10, marginTop: 4 },
});

// Helper de fila de dos columnas
const Row2 = ({ l1, v1, l2, v2 }: { l1: string; v1: React.ReactNode; l2: string; v2: React.ReactNode }) => (
  <View style={styles.row}>
    <View style={[styles.cell, styles.cellR, { flex: 1 }]}>
      <Text style={styles.label}>{l1}</Text>
      <Text style={styles.value}>{v1 ?? "—"}</Text>
    </View>
    <View style={[styles.cell, { flex: 1 }]}>
      <Text style={styles.label}>{l2}</Text>
      <Text style={styles.value}>{v2 ?? "—"}</Text>
    </View>
  </View>
);

// ================= PDF Document (clonado del diseño) =================
export const SolicitudCreditoPDFDoc: React.FC<{
  codigo_credito: string;
  credito: any | undefined;
  deudorData: any | undefined;
  logoUrl?: string;
}> = ({ codigo_credito, credito, deudorData, logoUrl }) => {
  const ip = deudorData?.informacion_personal ?? {};
  const refs: any[] = deudorData?.referencias ?? [];

  const detalle = {
    producto: credito?.producto,
    precioVenta: typeof credito?.valor_producto === "number" ? credito?.valor_producto : undefined,
    descuento: 0,
    gastosMatricula: credito?.gasto_matricula ?? 420000,
    soat: credito?.soat ?? 388000,
    garantiaExtendida: credito?.garantia_ext ?? 247475,
    segurosOtros: 1,
    valorTotal: credito?.valor_total ?? 10707001,
    valorFinanciar: typeof credito?.valor_financiar === "number" ? credito?.valor_financiar : 10954464,
    cuotaInicial: typeof credito?.cuota_inicial === "number" ? credito?.cuota_inicial : 12,
    plazo: credito?.plazo_meses ?? 4,
    cuotaMensual: credito?.valor_cuota ?? 2875000,
  };

  const firmaCc = ip?.numero_documento ?? "CC 444444";

  const fecha = fmtDate(credito?.fecha_creacion);
  const ciudad = ip?.ciudad_residencia || credito?.ciudad || "Cali";

  const LogoSrc =
    logoUrl || (import.meta as any)?.env?.VITE_LOGO_URL || "/moto3.png"; // usa tu CDN si lo tienes

  // Render PDF
  return (
    <Document>
<Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LogoSrc} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>SOLICITUD DE CRÉDITO</Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Código:</Text> {codigo_credito || "—"}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Fecha:</Text> {fecha}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Ciudad:</Text> {ciudad}
            </Text>
          </View>
        </View>

        {/* Doble línea */}
        <View style={styles.hrWrap}>
          <View style={styles.hr1} />
          <View style={styles.hr2} />
        </View>

        {/* Deudor / Información personal */}
        <Text style={styles.sectionTitle}>Deudor / Información personal</Text>
        <View style={styles.hr2} />
        <Row2 l1="Documento de identidad" v1={ip?.numero_documento ?? "CC 444444"} l2="De" v2={ip?.lugar_expedicion ?? "Neiva"} />
        <Row2
          l1="Nombre"
          v1={`${ip?.primer_nombre ?? "prueba"} ${ip?.segundo_nombre ?? "Alberto"} ${ip?.primer_apellido ?? "Muñoz"} ${ip?.segundo_apellido ?? "Pérez"}`.replace(/\s+/g, " ").trim()}
          l2="Edad"
          v2={ip?.edad ?? "0"}
        />
        <Row2 l1="Dirección de residencia" v1={ip?.direccion_residencia ?? "calle"} l2="Teléfono" v2={`${ip?.telefono_fijo ? ip.telefono_fijo + " - " : "- "}${ip?.celular ?? "3115380029"}`} />
        <Row2 l1="Estado civil" v1={ip?.estado_civil ?? "Soltero(a)"} l2="Personas a cargo" v2={ip?.personas_a_cargo ?? "0"} />
        <Row2 l1="Finca raiz" v1={ip?.finca_raiz ?? "No"} l2="Inmueble" v2={ip?.tipo_vivienda ?? "Propia"} />
        <Row2 l1="Valor de arriendo" v1={fmtCOP(Number(ip?.costo_arriendo) || 0)} l2="" v2="" />
        <Row2 l1="Vehículo" v1={ip?.vehiculo ?? "NR"} l2="Placa" v2={ip?.placa ?? "NR"} />

        {/* Referencias */}
        <Text style={styles.sectionTitle}>Deudor / Referencias</Text>
        <View style={styles.hr2} />
        {(refs?.length
          ? refs
          : [1, 2, 3].map((i) => ({
              nombre_completo: "dev",
              direccion: i === 1 ? "dev" : "calle",
              tipo_referencia: "Familiar",
              telefono: i === 2 ? "21212112" : i === 1 ? "122112" : "12212121",
            })) // fallback para mantener el look
        ).map((r: any, idx: number) => (
          <View key={idx}>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "#111",
                  borderRadius: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 6,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: 700 }}>{idx + 1}</Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: 700 }}>Tipo</Text>
            </View>
            <Row2 l1="Familiar" v1="" l2="Nombre" v2={r?.nombre_completo ?? "dev"} />
            <Row2 l1="Dirección" v1={r?.direccion ?? "dev"} l2="Teléfono" v2={r?.telefono ?? ""} />
          </View>
        ))}

        {/* Dos columnas: Detalle de la venta / Condiciones del negocio */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Detalle de la venta</Text>
        <View style={styles.hr2} />
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>Producto</Text>
              <Text style={styles.lineValue}>{detalle.producto ?? ""}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>+ Precio de venta</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.precioVenta)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>- Descuento</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.descuento)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>+ Gastos de matrícula</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.gastosMatricula)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>+ SOAT</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.soat)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>+ Seguros / Otros</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.segurosOtros)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={[styles.lineLabel, { fontWeight: 700 }]}>= Valor total</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.valorTotal)}</Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Condiciones del negocio</Text>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>- Cuota inicial</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.cuotaInicial)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>+ Garantía extendida</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.garantiaExtendida)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>= Valor a financiar</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.valorFinanciar)}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>Plazo</Text>
              <Text style={styles.lineValue}>{`${detalle.plazo} meses`}</Text>
            </View>
            <View style={styles.lineItem}>
              <Text style={[styles.lineLabel, { fontWeight: 700 }]}>Total de cuota mensual</Text>
              <Text style={styles.lineValue}>{fmtCOP(detalle.cuotaMensual)}</Text>
            </View>
          </View>
        </View>

        {/* Legales (copiados del formato) */}
        <View style={styles.legal}>
          <Text>
            1. AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES Con mi firma Autorizo de manera expresa, e inequívoca a
            VERIFICARTE AAA S.A.S, o quien haga sus veces al tratamiento de mis datos personales aquí consignados para que
            sean reportados, consultados, cedidos o verificados con terceras personas, incluyendo bancos de datos o centrales
            de riesgo. Igualmente autorizo que los mismos sean almacenados, usados y puestos en circulación o suprimidos conforme
            a la Política de Tratamiento de Información que la empresa ha adoptado. En desarrollo de la presente autorización
            VERIFICARTE AAA S.A.S podrá mantener conmigo, contacto de manera comercial por medios físicos o tecnológicos, enviar
            mensajes a mi correo electrónico o mensajes SMS y/o mi WhatsApp celular, realizar transferencia internacional de mis
            datos y en general, ejecutar las actividades necesarias en etapas precontractuales, contractuales o post-contractuales
            que VERIFICARTE AAA S.A.S llegare a establecer.
          </Text>
          <Text>
            2. DECLARACIÓN DE ORÍGENES DE FONDOS Declaro que mi ocupación económica y de origen de los ingresos que presento en
            este documento proceden de actividades lícitas y dentro de los marcos legales.
          </Text>
          <Text>
            3. DECLARACIONES DE SUMINISTRO DE INFORMACIÓN: Declaro y acepto que la información suministrada es veraz, que la
            aprobación del crédito queda sujeta a validación y que esas autorizaciones las imparto desde el instante en que tramite
            con VERIFICARTE AAA S.A.S esta solicitud. Me comprometo con VERIFICARTE AAA S.A.S. y/o quien represente sus derechos a
            informar por cualquier medio oportunamente cualquier cambio en los datos y a actualizar dicha información con
            periodicidad mínima anual (Ley 1581/2012 art 8). En caso de suministrar información falsa, no verificable, o negarme a
            actualizar la información VERIFICARTE AAA S.A.S y/o quien represente sus derechos podrá por esta causa unilateralmente
            declarar por terminada la relación comercial.
          </Text>
          <Text>
            4. AUTORIZACIÓN PARA CONSULTA Y REPORTE A CENTRALES DE INFORMACIÓN FINANCIERA Autorizo a VERIFICARTE AAA S.A.S. y/o a
            quien represente sus derechos para que, con fines estadísticos, de control, supervisión y de información comercial
            reporte, consulte, solicite, comparta, procese, aclare, modifique, actualice, retire o divulgue ante las centrales de
            información financiera o cualquier otra entidad que maneje bases de datos con los mismos fines, el nacimiento,
            modificación, extinción y cumplimiento de obligaciones contraídas o que llegue a contraer fruto de cualquier relación
            financiera o proceso con VERIFICARTE AAA S.A.S.
          </Text>
          <Text>
            5. AUTORIZACIÓN DE DESEMBOLSO: Declaro que conozco previamente las condiciones de aprobación del crédito solicitado
            dadas a conocer previamente por el asesor comercial, agencia, portal web, correo electrónico o telefónicamente y
            acepto lo establecido en ellas por lo cual autorizo a VERIFICARTE AAA S.A.S que el desembolso del crédito aprobado a mi
            nombre sea realizado a la cuenta bancaria indicada por mí.
          </Text>
        </View>

        {/* Firma */}
        <View style={styles.signatureBox} />
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>Firma Deudor 1</Text>
        <Text style={styles.signatureText}>{firmaCc}</Text>
      </Page>
    </Document>
  );
};

// ================= Contenedor web (NO usa View/Text) =================
const SolicitudCreditoPDF: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  const { data: datos, isLoading, error } = useCredito({ codigo_credito }, !!codigo_credito);
  const { data: deudor } = useDeudor(codigo_credito);

  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  const credito = (datos as any)?.creditos?.[0];

  const fileName = useMemo(
    () => `SolicitudCredito_${codigo_credito || "sin_codigo"}.pdf`,
    [codigo_credito]
  );

  if (!codigo_credito) {
    return <div className="p-2 text-sm text-red-700 bg-red-50 rounded-lg">No se encontró el código de crédito en la URL.</div>;
  }
  if (error) {
    return <div className="p-2 text-sm text-red-700 bg-red-50 rounded-lg">Ocurrió un error al cargar el crédito.</div>;
  }

  return (
    <div className="inline-flex items-center gap-3">
      {isLoading ? (
        <span className="text-sm text-slate-600">Preparando documento…</span>
      ) : (
        <Fragment>
          <PDFDownloadLink
            document={
              <SolicitudCreditoPDFDoc
                codigo_credito={codigo_credito}
                credito={credito}
                deudorData={deudorData}
                logoUrl={logoUrl}
              />
            }
            fileName={fileName}
          >
            {({ loading }) => (
              <button className="btn bg-success hover:bg-green-600 text-white" type="button">
                {loading ? "Generando PDF…" : "Descargar Solicitud"}
              </button>
            )}
          </PDFDownloadLink>
        </Fragment>
      )}
    </div>
  );
};

export default SolicitudCreditoPDF;
