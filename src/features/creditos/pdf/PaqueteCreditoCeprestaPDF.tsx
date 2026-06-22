// PaqueteCreditoCeprestaPDF.tsx
// Paquete Crediticio CEPRESTA — versión PDF (@react-pdf/renderer).
// Misma estructura del documento original (≈10 páginas):
//   1. Autorización de desembolso de crédito
//   2. Pagaré a la orden
//   3. Instrucciones de diligenciamiento del pagaré
//   4. Contrato de prenda sin tenencia del acreedor (garantía mobiliaria)
// Entidades CEPRESTA fijas; cliente / vehículo / valores dinámicos.
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── entidades fijas ─────────────────────────────────────────────────────────

const CEPRESTA_NOMBRE = "COMPAÑÍA ESPECIAL DE PRÉSTAMOS S.A.S.";
const CEPRESTA_SIGLA = "CEPRESTA S.A.S";
const CEPRESTA_NIT = "900.783.733-4";
const REP_LEGAL = "CESAR TULIO VERGARA MENDOZA";
const REP_LEGAL_CC = "14.968.951";
const REP_LEGAL_CIUDAD = "Cali";
const DIST_NOMBRE = "MOTO PARA TODOS S.A.S";
const DIST_NIT = "901.608.735-4";

// ─── helpers ─────────────────────────────────────────────────────────────────

const safe = (v: any): string =>
  v != null && String(v).trim() !== "" ? String(v).trim() : "";

const blank = (v: any, n = 24): string => {
  const s = safe(v);
  return s !== "" ? s : "_".repeat(n);
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "2026-06-21" → "21 de junio de 2026". Si no parsea, devuelve el valor crudo.
const fechaLarga = (v: any): string => {
  const s = safe(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${Number(d)} de ${MESES[Number(mo) - 1]} de ${y}`;
  }
  return s || "____________________";
};

export interface PaqueteCreditoCeprestaPDFProps {
  data: any;
  logoSrc?: string;
}

const adapt = (data: any) => {
  const d = data ?? {};
  return {
    fecha: safe(d.fecha),
    fechaLarga: fechaLarga(d.fecha),
    ciudad: safe(d.ciudad) || "Cali",
    codigo: safe(d.codigo),

    // cliente / deudor
    nombre: safe(d.nombre) || safe(d.nombreCompleto) || safe(d.nombreTitular1),
    cc: safe(d.cc) || safe(d.numeroDocumento),
    direccion: safe(d.direccionResidencia) || safe(d.direccion),
    telefono: safe(d.celular) || safe(d.telefono),
    lugarExpedicion: safe(d.lugarExpedicion),

    // vehículo
    marca: safe(d.marca),
    linea: safe(d.linea),
    clase: safe(d.clase) || "Motocicleta",
    tipo: safe(d.tipo),
    modelo: safe(d.modeloMoto) || safe(d.modelo),
    color: safe(d.color),
    motor: safe(d.motor) || safe(d.numeroMotor),
    chasis: safe(d.chasis) || safe(d.numeroChasis),
    placa: safe(d.placa),
    serie: safe(d.serie),
    servicio: safe(d.tipoServicio) || safe(d.servicio),

    // valores
    valorMoto: safe(d.valorMoto),
    cuantiaPrenda: safe(d.cuantiaPrenda) || safe(d.valorMoto),

    // desembolso
    cuentaDesembolso: safe(d.cuentaDesembolso),
    bancoDesembolso: safe(d.bancoDesembolso),

    // distribuidor (vendedor)
    distNombre: safe(d.distribuidorNombre) || DIST_NOMBRE,
    distNit: safe(d.distribuidorNit) || DIST_NIT,

    // codeudor / deudor solidario
    codeudorNombre: safe(d.codeudorNombre),
    codeudorCc: safe(d.codeudorCc) || safe(d.codeudorCcNit),
  };
};

// ─── paleta / estilos ────────────────────────────────────────────────────────

const ACCENT = "#1f3a93";   // azul Cepresta
const INK = "#2b2b2b";
const MUTED = "#6b7280";
const LINE = "#c9ccd1";

const S = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 46,
    paddingHorizontal: 44,
    fontSize: 8.6,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.42,
  },

  // header: solo logo arriba-derecha (igual al documento original)
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    minHeight: 56,
    marginBottom: 6,
  },
  logo: { width: 78, height: 56, objectFit: "contain" },

  // títulos
  docTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  p: {
    fontSize: 8.6,
    lineHeight: 1.45,
    textAlign: "justify",
    marginBottom: 6,
    color: "#333",
  },
  b: { fontFamily: "Helvetica-Bold", color: INK },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
  small: { fontSize: 8 },

  label: { fontSize: 8, color: MUTED },
  strongCenter: {
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 6,
  },

  // tabla vehículo
  vehTable: {
    borderWidth: 0.8,
    borderColor: LINE,
    borderRadius: 2,
    marginVertical: 8,
    overflow: "hidden",
  },
  vehRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE },
  vehRowLast: { flexDirection: "row" },
  vehKey: {
    width: "16%",
    backgroundColor: "#eef1f7",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 7.6,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  vehVal: {
    width: "34%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 7.8,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  vehValLast: { width: "34%", paddingHorizontal: 6, paddingVertical: 4, fontSize: 7.8 },

  // firmas
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  signCol: { width: "47%" },
  signLine: { borderTopWidth: 0.8, borderTopColor: INK, marginBottom: 3 },
  signLabel: { fontSize: 7.6, lineHeight: 1.4 },
  signBold: { fontSize: 7.6, fontFamily: "Helvetica-Bold" },

  // firma + cuadro de huella (Doc 1)
  huellaRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 30 },
  huellaLeft: { flex: 1, paddingRight: 16 },
  huellaBox: {
    width: 92,
    height: 90,
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 8,
    marginRight: 30,
  },

  // tabla firmas pagaré
  fTable: { borderWidth: 0.8, borderColor: LINE, marginTop: 10 },
  fHeadRow: { flexDirection: "row", backgroundColor: "#eef1f7" },
  fHead: {
    flex: 1,
    padding: 4,
    fontSize: 7.6,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  fHeadLast: { flex: 1, padding: 4, fontSize: 7.6, fontFamily: "Helvetica-Bold", color: ACCENT },
  fRow: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: LINE, minHeight: 16 },
  fCellK: {
    width: 60,
    padding: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#f6f7f9",
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  fCellV: { flex: 1, padding: 3, fontSize: 7.4, borderRightWidth: 0.5, borderRightColor: LINE },
  fCellVLast: { flex: 1, padding: 3, fontSize: 7.4 },
});

// ─── piezas reutilizables ────────────────────────────────────────────────────

const Header: React.FC<{ logoSrc?: string }> = ({ logoSrc }) => (
  <View style={S.header} fixed>
    {logoSrc ? <Image style={S.logo} src={logoSrc} /> : null}
  </View>
);

// Cláusula: etiqueta en negrita + texto corrido
const Clause: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Text style={S.p}>
    <Text style={S.b}>{label} </Text>
    {children}
  </Text>
);

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={S.b}>{children}</Text>
);

const VehiculoTable: React.FC<{ d: ReturnType<typeof adapt> }> = ({ d }) => {
  const cell = (k: string, v: string, last = false) => (
    <>
      <Text style={S.vehKey}>{k}</Text>
      <Text style={last ? S.vehValLast : S.vehVal}>{v || "______________"}</Text>
    </>
  );
  return (
    <View style={S.vehTable} wrap={false}>
      <View style={S.vehRow}>{[cell("MARCA", d.marca), cell("SERIE", d.serie, true)]}</View>
      <View style={S.vehRow}>{[cell("CLASE", d.clase), cell("No. MOTOR", d.motor, true)]}</View>
      <View style={S.vehRow}>{[cell("TIPO", d.tipo), cell("No. CHASIS", d.chasis, true)]}</View>
      <View style={S.vehRow}>{[cell("MODELO", d.modelo), cell("PLACAS", d.placa, true)]}</View>
      <View style={S.vehRowLast}>{[cell("COLOR", d.color), cell("SERVICIO", d.servicio, true)]}</View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DOC 1 — Autorización de desembolso
// ═══════════════════════════════════════════════════════════════════════════
const DocAutorizacion: React.FC<{ d: ReturnType<typeof adapt>; logoSrc?: string }> = ({
  d,
  logoSrc,
}) => (
  <Page size="LETTER" style={S.page}>
    <Header logoSrc={logoSrc} />

    <Text style={[S.p, S.b]}>{d.fechaLarga}</Text>
    <Text style={S.p}>Señores</Text>
    <Text style={[S.p, S.b]}>COMPAÑÍA ESPECIAL DE PRÉSTAMOS - CEPRESTA SAS</Text>
    <Text style={S.p}>LC</Text>
    <Text style={[S.p, S.b, { marginTop: 4 }]}>Asunto: Autorización desembolso de crédito</Text>

    <Text style={[S.p, { marginTop: 10 }]}>
      Yo,_<B>{d.nombre || "____________________"}</B> mayor(es) de edad, identificado(s)
      con la(s) cedula(s) de ciudadanía(s) número <B>{d.cc || "________________"}</B> ,
      autorizo(amos) de manera expresa a <B>{CEPRESTA_SIGLA}</B> para que realice el
      desembolso correspondiente al crédito que estoy tramitando con ustedes, al número de
      cuenta {blank(d.cuentaDesembolso, 26)} del Banco {blank(d.bancoDesembolso, 22)} a
      nombre de <B>{d.distNombre}</B> con NIT {d.distNit}, para el pago de la motocicleta
      que estoy adquiriendo con ellos.
    </Text>

    <Text style={[S.p, { marginTop: 8 }]}>
      Agradezco su atención y quedo atento a cualquier requerimiento adicional.
    </Text>

    <Text style={[S.p, { marginTop: 18 }]}>Cordialmente,</Text>

    <View style={S.huellaRow} wrap={false}>
      <View style={S.huellaLeft}>
        <View style={S.signLine} />
        <Text style={S.signLabel}>Nombre: {d.nombre || "______________________________"}</Text>
        <Text style={S.signLabel}>Cc : {d.cc || "____________________"}</Text>
      </View>
      <View style={S.huellaBox} />
    </View>

    <View style={S.huellaRow} wrap={false}>
      <View style={S.huellaLeft}>
        <View style={S.signLine} />
        <Text style={S.signLabel}>Nombre:</Text>
        <Text style={S.signLabel}>Cc</Text>
      </View>
      <View style={S.huellaBox} />
    </View>

  </Page>
);

// ═══════════════════════════════════════════════════════════════════════════
// DOC 2 — Pagaré a la orden
// ═══════════════════════════════════════════════════════════════════════════
const DocPagare: React.FC<{ d: ReturnType<typeof adapt>; logoSrc?: string }> = ({
  d,
  logoSrc,
}) => (
  <Page size="LETTER" style={S.page}>
    <Header logoSrc={logoSrc} />

    <Text style={S.docTitle}>Pagaré a la orden</Text>

    <Text style={S.p}>
      Nosotros la sociedad <B>{d.distNombre}</B> inscrita en la Cámara de Comercio de Cali
      bajo el N.I.T. <B>{d.distNit}</B> y la (S) persona (s) natural (es) identificada (s)
      como aparece al pie de la(s) correspondientes firmas en adelante el (los) deudores,
      declaro (amos) que: <B>PRIMERO</B> pagar en forma incondicional, solidaria e indivisible
      a la orden de <B>{CEPRESTA_NOMBRE}</B> <B>NIT. {CEPRESTA_NIT}</B> (en adelante
      “{CEPRESTA_SIGLA}”) o quien haga sus veces en sus oficinas de la ciudad de{" "}
      {blank(d.ciudad, 18)} el día {"_".repeat(16)}( ) del año {"_".repeat(16)}( ). 2) la
      suma de {"_".repeat(30)} ($ {"_".repeat(12)}) por concepto de capital. 3) y la suma{" "}
      ({"_".repeat(16)}) por concepto de intereses. 4) y la suma de {"_".repeat(24)} ($
      {"_".repeat(12)}) por concepto de seguros.
    </Text>

    <Clause label="SEGUNDO.">
      En caso de mora, a partir de ella y mientras dure la misma, pagare (mos) a {CEPRESTA_SIGLA}{" "}
      intereses de mora sobre el capital insoluto, a la tasa máxima autorizada por la ley.{" "}
      <B>TERCERO.</B> Autorizo (amos) a {CEPRESTA_SIGLA} el cobro de intereses sobre interés
      en los casos previstos en el artículo 886 del código de comercio colombiano y en los
      demás casos autorizados legalmente o que no se encuentren prohibidos por la ley.{" "}
      <B>CUARTO.</B> GASTOS E IMPUESTOS, serán de mi (nuestro) cargo los gastos e impuestos
      que ocasione la emisión o circulación de este título valor lo mismo que los costos,
      sanciones y gastos de cobranzas prejudicial y judicial tendientes a obtener el pago,
      incluidos los honorarios de abogado de conformidad con las tarifas autorizadas por{" "}
      {CEPRESTA_SIGLA}. Si {CEPRESTA_SIGLA} llegase a cubrir dicho valor me (nos) comprometo
      (emos) a reembolsarle la suma pagada más los intereses a la suma máxima de mora
      autorizada por la ley que se hubieren causado desde la fecha de pago. <B>QUINTO.</B>{" "}
      REGISTRO DE PAGOS, el pago total o parcial tanto de los intereses como del capital se
      podrá hacer constar en los registros escritos o sistematizados que lleve {CEPRESTA_SIGLA},
      o en este pagaré. <B>SEXTO.</B> VIGENCIA Y SOLIDARIDAD: El (los) deudor (es) y el (los)
      avalista (s) declaran que la forma solidaria en que me (nos) obligo (amos) subsiste en
      caso de prorroga(s) renovación (s) o cualquier modificación de las condiciones y durante
      todo el tiempo de la (s) misma (s). Cuando en este pagaré figuren varias obligaciones se
      entenderá que lo han hecho solidariamente. En consecuencia, declaro (amos) que{" "}
      {CEPRESTA_SIGLA} le asiste el derecho de dirigirse indistintamente contra cualquiera de
      los obligados en el presente instrumento, sin necesidad de recurrir a más notificaciones
      y que entre los deudores nos conferimos representación recíproca, en razón de la cual en
      caso de que se pacte prorroga o plazo o reestructuración de la deuda con uno solo de
      nosotros, se mantendrá la solidaridad que adquirimos respecto de las obligaciones
      derivadas de este pagare, así como la vigencia de las garantías otorgadas. <B>SEPTIMO.</B>{" "}
      SUPERVIVENCIA. Si una o más de las disposiciones de este pagare llegare a ser considerada
      invalida, ilegal, nula, inexistente o sin efectos por parte de una autoridad judicial, la
      validez, legalidad o vigencia de las disposiciones restantes de ese pagare no se verán
      afectadas y en consecuencia las misma conservarán plena vigencia.
    </Clause>

    <Text style={S.p}>
      El presente pagare se firma a continuación por el (los) deudor (es) solidario (s)y/o
      avalista(s) en constancia de aceptación de la totalidad de su contenido
    </Text>

    <Text style={S.p}>
      Firmamos en la ciudad de {blank(d.ciudad, 18)} a los {"_".repeat(6)} días del mes de{" "}
      {"_".repeat(16)} del año {"_".repeat(6)}.
    </Text>

    {/* Tabla de firmas */}
    <View style={S.fTable} wrap={false}>
      <View style={S.fHeadRow}>
        <Text style={S.fHead}>DEUDOR</Text>
        <Text style={S.fHeadLast}>DEUDOR SOLIDARIO</Text>
      </View>
      {[
        ["FIRMA", "", "FIRMA", ""],
        ["NOMBRE", d.nombre, "NOMBRE", d.codeudorNombre],
        ["CEDULA", d.cc, "CEDULA", d.codeudorCc],
        ["DIRECCION", d.direccion, "DIRECCION", ""],
      ].map((r, i) => (
        <View style={S.fRow} key={i}>
          <Text style={S.fCellK}>{r[0]}</Text>
          <Text style={S.fCellV}>{r[1]}</Text>
          <Text style={S.fCellK}>{r[2]}</Text>
          <Text style={S.fCellVLast}>{r[3]}</Text>
        </View>
      ))}
      <View style={S.fHeadRow}>
        <Text style={S.fHead}>DEUDOR SOLIDARIO</Text>
        <Text style={S.fHeadLast}>DEUDOR SOLIDARIO</Text>
      </View>
      {[
        ["FIRMA", "", "FIRMA", ""],
        ["NOMBRE", "", "NOMBRE", d.distNombre],
        ["CEDULA", "", "NIT", d.distNit],
        ["DIRECCION", "", "", ""],
      ].map((r, i) => (
        <View style={S.fRow} key={`b${i}`}>
          <Text style={S.fCellK}>{r[0]}</Text>
          <Text style={S.fCellV}>{r[1]}</Text>
          <Text style={S.fCellK}>{r[2]}</Text>
          <Text style={S.fCellVLast}>{r[3]}</Text>
        </View>
      ))}
    </View>

  </Page>
);

// ═══════════════════════════════════════════════════════════════════════════
// DOC 3 — Instrucciones de diligenciamiento
// ═══════════════════════════════════════════════════════════════════════════
const DocInstrucciones: React.FC<{ d: ReturnType<typeof adapt>; logoSrc?: string }> = ({
  d,
  logoSrc,
}) => (
  <Page size="LETTER" style={S.page}>
    <Header logoSrc={logoSrc} />

    <Text style={S.docTitle}>Instrucciones de diligenciamiento</Text>

    <Text style={S.p}>Señores</Text>
    <Text style={[S.p, S.b]}>{CEPRESTA_NOMBRE}</Text>
    <Text style={[S.p, S.b]}>NIT. {CEPRESTA_NIT}</Text>
    <Text style={[S.p, S.b]}>Ciudad.</Text>

    <Text style={[S.p, { marginTop: 6 }]}>
      La (s) persona (s) abajo suscrita (s), identificada (s) como aparece al pie de la (s)
      correspondiente (s) firma (s) (en adelante el (los) Deudor (es), por medio de la
      presente, faculto (amos) de manera expresa, permanente e irrevocable a la sociedad{" "}
      <B>{CEPRESTA_NOMBRE} – NIT {CEPRESTA_NIT}</B> (en adelante <B>CEPRESTA SAS</B>) o quien
      haga sus veces, para que diligencie, en virtud de lo dispuesto en el artículo 622 del
      código de comercio colombiano y demás disposiciones que lo modifiquen o sustituyan,
      todos los espacios en blanco del pagare otorgado por los Deudores a la orden de{" "}
      {CEPRESTA_SIGLA}, (en adelante el “Pagare”), sin previo aviso y de conformidad con las
      siguientes instrucciones:
    </Text>

    <Clause label="PRIMERO:">
      {CEPRESTA_SIGLA} podrá diligenciar y utilizar el Pagare en cualquiera de los siguientes
      eventos: a) En el caso en que el (los) Deudor (es) incurra (n) en mora en el pago de dos
      o más cuotas de capital sucesivas, o de los intereses sobre este, debidas en virtud de
      cualquier obligación que conjunta o separadamente el (los) Deudor (es) haya (n) contraído
      a favor de {CEPRESTA_SIGLA}; b) en el caso en que el (los) Deudor (es) fuere (n)
      demandado (s) en forma conjunta o separada, y sus bienes perseguidos por persona distinta
      o por el mismo {CEPRESTA_SIGLA} como ejecutor de cualquier acción; c) por el giro de
      cheques sin provisión de fondos o devueltos por cualquier causa imputable al girador; d)
      en el evento en que el (los) Deudor (es) o el avalista no constituya (n) las garantías a
      favor del {CEPRESTA_SIGLA} en los plazos acordados; d) por muerte de uno cualquiera de
      los deudores y no fuere sustituido a satisfacción del {CEPRESTA_SIGLA}; e) por verificar{" "}
      {CEPRESTA_SIGLA} que la información y documentación proporcionada es falsa, se encuentra
      alterada o lo ha inducido a error; f) cuando a juicio de {CEPRESTA_SIGLA} la (s) garantía
      (s) o seguridad (es) que constituya (mos) o haya (mos) constituido a favor de{" "}
      {CEPRESTA_SIGLA}, desaparezca (n), o sufriere (n) un deprecio o deterioro de tal naturaleza
      que no represente (n) garantía suficiente para {CEPRESTA_SIGLA}; g) cuando quiera que las
      garantías mobiliarias, personales, reales o bancarias constituidas a favor de{" "}
      {CEPRESTA_SIGLA} no se prorroguen con ocho (8) días hábiles de anticipación a su
      vencimiento; h) si no remitiere (mos) oportunamente la información y/o documentación
      material que requiere {CEPRESTA_SIGLA} para efectos del cumplimiento de la normatividad
      que le es aplicable como entidad financiera; i) cuando se enajene sin autorización de{" "}
      {CEPRESTA_SIGLA} a cualquier título el (los) bien (es) objeto de la (s) garantía (s)
      constituida (s); j) cuando el (los) deudor (es) sea (n) investigado (s) o hayan incurrido
      en algunas de las conductas tipificadas como delito de lavado de activos en el Código
      Penal Colombiano, particularmente, las previstas en los artículos 323 y siguientes o en
      otras disposiciones legales o reglamentarias. Igualmente, cuando cualquiera de los de
      arriba mencionados sea incluido en la lista OFAC o similares expedidas por las autoridades
      nacionales o extranjeras; k) en el evento en que se inicie un proceso de extinción de
      dominio sobre el (los) bien (es) dado (s) en garantía; l) por producirse mi (nuestro)
      retiro por cualquier causa como empleado (s); m) en los demás casos de Ley.
    </Clause>

    <Clause label="SEGUNDO.">
      A {CEPRESTA_SIGLA} le asiste la faculta de declarar extinguido o insubsistente el plazo
      que falte para el pago total de todas las obligaciones contraídas a la fecha en que
      acontezca uno cualquiera de los eventos relacionados en la cláusula anterior, así como la
      de exigir la cancelación inmediata de las obligaciones así vencidas con todos sus
      accesorios.
    </Clause>

    <Clause label="TERCERO.">
      Los espacios en blanco del pagaré se llenarán de la siguiente forma: [1] El lugar para el
      pago de la obligación: serán las oficinas de la ciudad en la cual se hayan contraído las
      obligaciones a mi (nuestro) cargo. [2] La fecha de pago de la obligación será aquella que
      corresponda al día en que se haya llenado el pagaré. [3] El espacio reservado para capital
      corresponderá a la sumatoria del capital de todas las obligaciones a cargo de los Deudores
      y a favor de {CEPRESTA_SIGLA}, por concepto de mutuos, prestamos, operaciones activas de
      crédito, giros, libranzas y, en general, de cualquier operación por virtud de cuya
      celebración {CEPRESTA_SIGLA} tenga como posición acreedora frente al deudor, esté o no
      vencido el plazo, de conformidad con los términos y condiciones establecidos en todos y
      cada uno de los documentos que contienen las respectivas obligaciones. Se incluyen dentro
      de esta suma, sin limitación, los impuestos de cualquier clase, comisiones y cualquier otro
      concepto debido, que se derive de las obligaciones contraídas, incluyendo las sumas de
      intereses que conforme con la legislación vigente sean capitalizables. [4] El espacio
      reservado para intereses corresponderá a la sumatoria de (i) el valor de los intereses
      corrientes pendientes o atrasados que se liquidaran a la fecha de diligenciamiento del
      pagaré conforme a la tasa de intereses corrientes pactada con {CEPRESTA_SIGLA}, en cada una
      de las obligaciones en las que {CEPRESTA_SIGLA} sea acreedor. En el evento en que no exista
      documento en el que conste el pacto de la tasa de interés, esta será la que conste en
      cualquier documento emanado de {CEPRESTA_SIGLA} y relacionado con la obligación, como lo
      serian, entre otros, las liquidaciones de la obligación y los registros físicos o
      electrónicos de {CEPRESTA_SIGLA}, y (ii) el valor de los interés moratorios pendientes o
      atrasados, que se liquidaran a la fecha de diligenciamiento del pagaré a la tasa máxima
      permitida según la ley, para cada una de la obligaciones objeto del presente pagaré.
    </Clause>

    <Clause label="CUARTO.">
      Que expresamente faculta (mos) a {CEPRESTA_SIGLA} para compensar los saldos pendientes por
      pagar a cargo del (de los) Deudor (es), con los dineros que este tenga bajo cualquier
      título en {CEPRESTA_SIGLA} y que sean exigibles.
    </Clause>

    <Clause label="QUINTO.">
      El (los) Deudor (es) autoriza (n) irrevocablemente a {CEPRESTA_SIGLA} obtener de cualquier
      fuente y reportar a cualquier banco de datos, las informaciones y referencias relativas a
      los datos personales del (de los) Deudor (es), su comportamiento de crédito, hábitos de
      pago, manejo de cuentas bancarias y en general, al cumplimiento de sus obligaciones
      pecuniarias.
    </Clause>

    <Clause label="SEXTO.">
      En el evento en que en desarrollo de esta autorización para diligenciar el pagare en
      blanco se cometieren errores involuntarios en su diligenciamiento, o luego de diligenciado
      se normalice la obligación, {CEPRESTA_SIGLA} o quien haga sus veces, queda expresamente
      facultado para aclarar, enmendar y/o corregir los errores, o para sustituir la hoja
      correspondiente, de manera tal que el mismo corresponda a las exigencias legales y del
      negocio.
    </Clause>

    <Clause label="SEPTIMO.">
      Manifiesto (amos) conocer y entender las obligaciones derivadas del presente documento, de
      la carta de instrucciones en él contenida y del correspondiente pagaré.
    </Clause>

    <Text style={S.p}>
      La presente carta de instrucciones se firma a continuación por el (los) deudor (es)
      solidario (s) y avalista (s), en constancia de aceptación de la totalidad de su contenido.
      Firmamos en la ciudad de {blank(d.ciudad, 18)} a los {"_".repeat(6)} días del mes de{" "}
      {"_".repeat(16)} del año {"_".repeat(6)}.
    </Text>

    {/* Firmas */}
    <View style={S.signRow} wrap={false}>
      <View style={S.signCol}>
        <View style={{ height: 22 }} />
        <View style={S.signLine} />
        <Text style={S.signBold}>DEUDOR</Text>
        <Text style={S.signLabel}>Nombre: {d.nombre || "____________________"}</Text>
        <Text style={S.signLabel}>C.C. No. {d.cc || "________________"}</Text>
      </View>
      <View style={S.signCol}>
        <View style={{ height: 22 }} />
        <View style={S.signLine} />
        <Text style={S.signBold}>DEUDOR SOLIDARIO</Text>
        <Text style={S.signLabel}>Nombre: {d.codeudorNombre || "____________________"}</Text>
        <Text style={S.signLabel}>C.C. No. {d.codeudorCc || "________________"}</Text>
      </View>
    </View>
    <View style={[S.signCol, { marginTop: 26 }]} wrap={false}>
      <View style={{ height: 22 }} />
      <View style={S.signLine} />
      <Text style={S.signBold}>DEUDOR SOLIDARIO</Text>
      <Text style={S.signLabel}>{d.distNombre}</Text>
      <Text style={S.signLabel}>NIT {d.distNit}</Text>
    </View>

  </Page>
);

// ═══════════════════════════════════════════════════════════════════════════
// DOC 4 — Contrato de prenda sin tenencia (garantía mobiliaria)
// ═══════════════════════════════════════════════════════════════════════════
const DocPrenda: React.FC<{ d: ReturnType<typeof adapt>; logoSrc?: string }> = ({
  d,
  logoSrc,
}) => (
  <Page size="LETTER" style={S.page}>
    <Header logoSrc={logoSrc} />

    <Text style={S.docTitle}>
      Contrato de prenda sin tenencia del acreedor (garantía mobiliaria)
    </Text>

    <Text style={S.p}>
      Entre los suscritos a saber: <B>{REP_LEGAL}</B>, mayor de edad, vecino de la ciudad de{" "}
      {REP_LEGAL_CIUDAD}, con cédula de ciudadanía número {REP_LEGAL_CC} de {REP_LEGAL_CIUDAD},
      quien obra en nombre y representación de la <B>COMPAÑÍA ESPECIAL DE PRESTAMOS S.A.S.
      CEPRESTA S.A.S.</B>, establecimiento comercial, con domicilio principal en {REP_LEGAL_CIUDAD},
      en su condición de Representante Legal y quien en adelante se denominará{" "}
      <B>EL ACREEDOR GARANTIZADO</B> el (la, los) señor(a)(es): {blank(d.nombre, 40)}, mayor(es)
      de edad y vecino(s) de la ciudad de {blank(d.ciudad, 18)}, identificado(s) con la cedula(s)
      de ciudadanía(s) número {blank(d.cc, 18)}, y quien(es) obra(n) en su propio nombre y
      quien(es) en adelante se denominará(n) <B>EL(LOS) DEUDOR(ES) Y/O CONSTITUYENTE(S)</B>, se
      ha celebrado <B>CONTRATO DE PRENDA ABIERTA SIN TENENCIA DEL ACREEDOR</B>, que se encuentra
      contenida en las siguientes cláusulas:
    </Text>

    <Clause label="PRIMERA.-CONSTITUCION DE PRENDA Y DESCRIPCION DEL BIEN GRAVADO:">
      EL DEUDOR Y/O CONSTITUYENTE, a través de este documento, constituye a favor de EL ACREEDOR
      GARANTIZADO, prenda abierta y sin tenencia sobre el bien de su exclusiva propiedad que a
      continuación se relaciona:
    </Clause>

    <VehiculoTable d={d} />

    <Text style={S.p}>
      El anterior bien quedará sujeto al gravamen prendario conforme a los términos y efectos que
      para la Prenda sin Tenencia, dispone el Código de Comercio en el Libro Cuarto, Titulo IX,
      Capitulo II, Ley 1676 de 2013 y demás normas concordantes. <B>PARÁGRAFO 1:</B> La prenda
      que se constituye por el presente documento, se realiza sobre cuerpo cierto.{" "}
      <B>PARAGRAFO 2:</B> El bien pignorado queda en poder de EL DEUDOR Y/O CONSTITUYENTE quien
      ejercerá sobre éste tenencia en las condiciones de Ley. <B>PARÁGRAFO 3:</B> EL DEUDOR Y/O
      CONSTITUYENTE autoriza de manera expresa e irrevocable a EL ACREEDOR GARANTIZADO para que
      en el evento en que existan discrepancias entre lo aquí señalado y lo indicado en la Tarjeta
      de Propiedad y/o certificado de tradición del bien objeto del gravamen real, la información
      contenida en la Tarjeta de Propiedad y/o certificado de tradición prevalezca para cualquier
      efecto legal sobre los datos aquí señalados o sirvan de soporte para la identificación
      efectiva del bien gravado cuando así lo considere necesario EL ACREEDOR GARANTIZADO. Queda
      entendido y desde ya así lo acepta EL DEUDOR Y/O CONSTITUYENTE que la Tarjeta de Propiedad
      y/o certificado de tradición del bien forma parte integral del presente contrato.
    </Text>

    <Clause label="SEGUNDA. -UBICACIÓN Y SANEAMIENTO:">
      EL DEUDOR Y/O CONSTITUYENTE declara lo siguiente: (i) Que el bien gravado con prenda
      permanecerá y estará a disposición de EL ACREEDOR GARANTIZADO en la siguiente dirección:{" "}
      {blank(d.direccion, 26)} de la ciudad de {blank(d.ciudad, 18)}. <B>PARÁGRAFO:</B> Durante la
      vigencia de la prenda, el bien deberá permanecer en la dirección indicada en la presente
      cláusula. Cuando sea necesario para su uso o para cualquier otro fin su traslado permanente
      a otro sitio, EL DEUDOR Y/O CONSTITUYENTE deberá informar previamente y por escrito a EL
      ACREEDOR GARANTIZADO, indicando el lugar preciso al cual se hará el traslado. (ii) Que
      actualmente se encuentra en posesión material, quieta, pacífica y tranquila del bien
      pignorado, en su condición de propietario exclusivo. (iii) Que el bien dado en prenda se
      encuentra libre de embargos, demandas, gravámenes o limitaciones de dominio y de otras
      garantías constituidas sobre el mismo y que se halla en buen estado de conservación, así
      como declara que el bien no ha sido enajenado en ninguna forma ni prometido en venta. iv)
      Que el bien dado en garantía no hace parte por adhesión o destinación de un bien inmueble ni
      tampoco podrá ser considerado un inmueble por adhesión o destinación.
    </Clause>

    <Clause label="TERCERA. -OBLIGACIONES DE EL DEUDOR Y/O CONSTITUYENTE:">
      EL DEUDOR Y/O CONSTITUYENTE asume todas las obligaciones legales relacionadas con la prenda
      comercial sin tenencia del acreedor y, en especial, las contempladas en el Código del
      Comercio, la Ley 1676 de 2013 y específicamente las contempladas en su artículo 18 y demás
      normas concordantes. Del mismo modo, EL DEUDOR Y/O CONSTITUYENTE: se obliga expresamente
      para con EL ACREEDOR GARANTIZADO a: a) Mantener el bien pignorado en el mismo estado de
      conservación en que a la fecha se encuentra, salvo su deterioro natural, asumiendo en su
      conservación y custodia la responsabilidad de que trata el artículo 1212 del Código de
      Comercio. b) No enajenar, vender, gravar, permutar, alquilar, transformar, modificar,
      cambiar de uso o destinación o de tipo de servicio o entregar, el bien pignorado a ningún
      título, en todo o en parte, sin el previo consentimiento o autorización previa y escrita de
      EL ACREEDOR GARANTIZADO. En caso de que se obtenga autorización de EL ACREEDOR GARANTIZADO
      para tales fines, los adquirientes están obligados a respetar el contrato de prenda, dicha
      obligación también aplicaría en caso de que no se obtenga la autorización previa para el
      efecto. c) No constituir otras garantías mobiliarias sobre el bien objeto de la presente
      garantía, ni ceder o vender los créditos o cuentas por cobrar derivados de la venta, permuta
      o arrendamiento de bien objeto de la presente garantía sin la autorización previa y escrita
      de EL ACREEDOR GARANTIZADO. En caso de que se obtenga autorización de EL ACREEDOR GARANTIZADO
      para tales fines, los adquirientes están obligados a respetar el contrato de prenda. d) No
      trasladar ni en todo, ni en parte el bien dado en prenda de manera permanente a sitio
      distinto del enunciado en la cláusula segunda de este documento, sin el consentimiento previo
      y escrito de {CEPRESTA_SIGLA}. e) Notificar inmediatamente y en debida forma a {CEPRESTA_SIGLA}{" "}
      toda acción o proceso que se inicie en su contra, so pena de hacer exigible la deuda en forma
      anticipada. f) Pagar todos los gastos e impuestos relacionados con el bien dado en garantía.
      g) mantener asegurado contra todo riesgo el bien dado en garantía mediante una póliza de
      seguros expedida por una Compañía Aseguradora en los términos indicados en la cláusula
      séptima del presente contrato. h) las demás contenidas en el presente documento.
    </Clause>

    <Clause label="CUARTA.-OBJETO DE LA GARANTIA:">
      La prenda que se constituye tiene por objeto garantizar a EL ACREEDOR GARANTIZADO cualquier
      obligación que por cualquier concepto tuviere o llegare a contraer EL DEUDOR Y/O
      CONSTITUYENTE, conjunta o separadamente, directa o indirectamente a favor de EL ACREEDOR
      GARANTIZADO, de cualquier naturaleza o moneda u origen, comisiones, gastos o por cualquier
      otra causa, más intereses, sanciones, multas, impuestos y, en general, todas las obligaciones
      que EL DEUDOR Y/O CONSTITUYENTE contrajere para con EL ACREEDOR GARANTIZADO como aceptante,
      endosante, suscriptor u ordenante, avalista, codeudor, fiador, asegurado o parte, ya sea que
      consten en documentos de crédito o en cualquier otra clase de documento, con o sin garantía
      específica, consten o no en documentos separados o de fechas diferentes.
    </Clause>

    <Clause label="QUINTA.-CUANTIA:">
      Se pacta que la presenta prenda garantiza a EL ACREEDOR GARANTIZADO obligaciones presentes
      y/o futuras a cargo de EL DEUDOR Y/O CONSTITUYENTE en los términos indicados en la cláusula
      anterior y subsiguientes, hasta la suma de {blank(d.cuantiaPrenda, 28)} ($
      {blank(d.cuantiaPrenda, 14)}), siendo entendido que la garantía respalda no solamente los
      capitales hasta la suma dicha, sino además los correspondientes intereses corrientes y
      moratorios que generen dichas sumas, las comisiones que deban ser pagadas a EL ACREEDOR
      GARANTIZADO, así como los gastos en que éste incurra con motivo de los actos necesarios para
      llevar a cabo la ejecución de la garantía o pago directo, al igual que los gastos para el
      registro de la constitución, modificación, prorroga y/o cancelación tanto de la garantía
      como de su ejecución, los daños y perjuicios ocasionados por el incumplimiento de las
      obligaciones garantizadas, que sean cuantificados judicialmente o en virtud de un laudo
      arbitral o mediante un contrato de transacción, las diferencias de tasa de interés o de
      cambio cuando a ello hubiere lugar, el valor de los seguros, otros cargos adicionales, gastos
      de cobranzas si fuere del caso, honorarios de abogados y demás condiciones o sanciones que
      contengan los documentos en que conste la obligación a cargo de EL DEUDOR Y/O CONSTITUYENTE,
      sin que estos últimos y demás accesorios computen para efectos del límite señalado, y en
      general cualquier concepto a cargo de EL DEUDOR Y/O CONSTITUYENTE y a favor de EL ACREEDOR
      GARANTIZADO y no solamente las obligaciones contraídas por EL DEUDOR Y/O CONSTITUYENTE a
      favor de EL ACREEDOR GARANTIZADO directa o indirectamente, conjuntas o separadas, con
      anterioridad a la fecha de este documento, sino las que contraiga en lo sucesivo, incluidas
      sus prórrogas, reestructuraciones, renovaciones o novaciones, hasta su total cancelación, así
      se convenga con uno solo de los suscriptores y además, los créditos que EL ACREEDOR
      GARANTIZADO adquiera de EL DEUDOR Y/O CONSTITUYENTE por endoso o cesión de terceras personas.
      <B> PARÁGRAFO:</B> Si EL DEUDOR Y/O CONSTITUYENTE hubiere contraído o llegare a contraer
      obligaciones directas o indirectas, conjuntas o separadas en cuantía superior a la señalada
      en el presente contrato, dichos excesos, cualquiera que sea su valor o naturaleza, lo mismo
      que sus accesorios, quedarán también automáticamente garantizados con la prenda.
    </Clause>

    <Clause label="SEXTA. -VIGENCIA:">
      El presente contrato de prenda estará vigente por un plazo de diez (10) años, contados a
      partir de la fecha de suscripción del presente contrato y será prorrogable automáticamente
      por periodos sucesivos de tres (3) años, a menos de que se dé por terminado previéndose lo
      indicado en la cláusula Décima Séptima de la presente prenda. <B>PARÁGRAFO:</B> No obstante,
      el vencimiento establecido para la obligación garantizada, la prenda conservará su vigencia
      mientras existan obligaciones pendientes de pago, sean directas o indirectas a cargo de EL
      DEUDOR Y/O CONSTITUYENTE y a favor de EL ACREEDOR GARANTIZADO y mientras ésta no se cancele
      en forma expresa ante las autoridades respectivas. La cancelación de la prenda no implicará
      la extinción de la obligación con ella garantizada, salvo que así lo manifieste expresamente
      EL ACREEDOR GARANTIZADO.
    </Clause>

    <Clause label="SEPTIMA.-SEGUROS:">
      EL DEUDOR Y/O CONSTITUYENTE se obliga a contratar con una Compañía de Seguros debidamente
      autorizada por la Superintendencia Financiera de Colombia o quien haga sus veces, un seguro
      contra todo riesgo que ampare el bien pignorado y cubra las condiciones de asegurabilidad
      exigidas, el cual debe incluir como primer beneficiario a EL ACREEDOR GARANTIZADO y una
      cláusula de renovación automática al vencimiento de la póliza, así como de aviso previo a EL
      ACREEDOR GARANTIZADO a la terminación del seguro, de vigencia anual, póliza correspondiente
      que EL DEUDOR Y/O CONSTITUYENTE se obliga a entregar oportunamente a EL ACREEDOR GARANTIZADO,
      así como del nuevo endoso que de dicha póliza se realice a favor de EL ACREEDOR GARANTIZADO.
      Dicho seguro deberá permanecer vigente durante todo el término en que el bien esté gravado,
      para que en caso de ocurrir el riesgo que ampara a EL ACREEDOR GARANTIZADO cobre su valor y
      los aplique a las obligaciones a cargo de EL DEUDOR Y/O CONSTITUYENTE. Dicho seguro no podrá
      tener un valor inferior al avalúo comercial del bien dado en garantía. EL DEUDOR Y/O
      CONSTITUYENTE se obliga a renovar los seguros del bien dado en prenda. De igual manera, EL
      DEUDOR Y/O CONSTITUYENTE, desde este mismo momento, autoriza a EL ACREEDOR GARANTIZADO para
      que incluya el bien dado en garantía en la póliza colectiva que tiene éste contratada para el
      efecto o tome o renueve la póliza correspondiente y ajuste el valor asegurado, pague la prima
      de seguro y cargue a EL DEUDOR Y/O CONSTITUYENTE el valor de la misma en caso de que dicho
      seguro no fuere constituido oportunamente, no se acredite su contratación o no se hiciere por
      EL DEUDOR Y/O CONSTITUYENTE la renovación respectiva con la antelación debida, sin que por
      esta autorización adquiera EL ACREEDOR GARANTIZADO esta obligación, ya que en el evento de
      que EL ACREEDOR GARANTIZADO no lo haga no implica en ningún caso y en ninguna forma
      responsabilidad para el mismo, quien puede no hacer uso de tal facultad. En el evento de que
      EL ACREEDOR GARANTIZADO lo incluya en la póliza colectiva o tome o renueve la póliza
      respectiva, EL DEUDOR Y/O CONSTITUYENTE autoriza cargar en su cuenta los valores
      desembolsados por tal concepto, si hubiera saldo para ello, pero si no lo hubiera, el valor
      de las primas canceladas devengarán intereses a la tasa moratoria máxima de Ley, desde la
      fecha en que se haga su pago y hará parte de las obligaciones aseguradas con la prenda que
      aquí se formaliza y tendrá exigibilidad inmediata en su cobro. Además, EL DEUDOR Y/O
      CONSTITUYENTE se obliga a mantener vigente los seguros que ordene la Ley para esta clase de
      bien.
    </Clause>

    <Clause label="OCTAVA. -INSPECCION.">
      EL DEUDOR Y/O CONSTITUYENTE se obliga para con EL ACREEDOR GARANTIZADO a permitir que éste
      inspeccione el estado y mantenimiento del bien dado en garantía en todas las ocasiones que
      éste lo considere conveniente o necesario.
    </Clause>

    <Clause label="NOVENA.">
      La prenda sin tenencia aquí constituida se extiende igualmente a todos los accesorios
      pertenecientes o que se instalen al bien descrito en la cláusula primera, así como a los
      bienes atribuibles o derivados del mismo, de conformidad con lo dispuesto en el artículo 8°
      de la Ley 1676 de 2013.
    </Clause>

    <Clause label="DECIMA. -GASTOS:">
      Los gastos, impuestos y costos que generen este contrato, su registro, modificación,
      prorroga, su cumplimiento y cobro, los de su cancelación o los que demande la obligación que
      él ampara o el bien dado en garantía, así como los del certificado de la prenda que,
      debidamente complementado a satisfacción de EL ACREEDOR GARANTIZADO, serán de cargo exclusivo
      de EL DEUDOR Y/O CONSTITUYENTE quien así lo acepta. Los documentos que respaldan esta garantía
      quedarán en poder de EL ACREEDOR GARANTIZADO junto con el original del presente documento
      hasta la cancelación de la prenda. El trámite de cancelación de esta garantía ante las
      autoridades de tránsito será efectuado por EL DEUDOR Y/O CONSTITUYENTE, a su costa.
    </Clause>

    <Clause label="DECIMA PRIMERA.">
      EL DEUDOR Y/O CONSTITUYENTE se obliga a responder por las infracciones a las leyes y
      reglamentos y por los daños, perjuicios, lucro cesante e indemnizaciones de cualquier índole,
      que tenga como causa la operación de los bienes pignorados.
    </Clause>

    <Clause label="DECIMA SEGUNDA.-INCUMPLIMIENTO – ACELERACION DE PLAZO:">
      En caso de incumplimiento de EL DEUDOR Y/O CONSTITUYENTE, sea total o parcial y de cualquiera
      de las obligaciones a su cargo, EL ACREEDOR GARANTIZADO o quien represente sus derechos, podrá
      ejercer los derechos y acciones legales, exigiendo el pago inmediato de la obligación que en
      su favor se hubiere contraído, aunque el plazo o plazos no hubiere vencido y/o a juicio de EL
      ACREEDOR GARANTIZADO, exigir la entrega inmediata del bien pignorado a su favor, sin perjuicio
      de las sanciones penales correspondientes. De igual manera podrá proceder, en cualquiera de
      los siguientes eventos: a) en caso de mora en el pago del capital o de intereses de cualquiera
      de las obligaciones garantizadas. b) Si EL DEUDOR Y/O CONSTITUYENTE varía el sitio enunciado,
      en donde ha de permanecer el bien pignorado, sin autorización escrita de EL ACREEDOR
      GARANTIZADO aún antes de haberse efectuado el registro de este contrato de prenda. c) Si EL
      DEUDOR Y/O CONSTITUYENTE enajenare o gravare o permutare o cambiare el uso o destinación o
      tipo de servicio o transformare o modificare o alquilare o entregare a cualquier título, en
      todo o en parte, el bien pignorado sin aviso previo y autorización expresa de EL ACREEDOR
      GARANTIZADO. d) Si EL DEUDOR Y/O CONSTITUYENTE no permite u obstaculiza de cualquier manera la
      inspección del bien dado en prenda en cualquiera de las oportunidades en que EL ACREEDOR
      GARANTIZADO desee verificar su estado. e) Si a juicio de EL ACREEDOR GARANTIZADO el bien
      pignorado sufriere desmejora, deprecio, cambio o modificación de tal naturaleza que no preste
      garantía suficiente para la seguridad del pago de la obligación con él garantizada(s). f) En
      todos los casos en que contra EL DEUDOR Y/O CONSTITUYENTE se inicie cualquier proceso judicial
      o si el bien pignorado fuere perseguido por un tercero. g) En todos los casos en que la
      obligación garantizada con la presente prenda se hiciere exigible antes de la expiración del
      plazo respectivo, según las causales de anticipación estipuladas en el presente contrato. h)
      En todos los demás casos de extinción o pérdida total o parcial del bien materia de la presente
      garantía o que por cualquier otra causa se volviera inservible. En estos casos, EL ACREEDOR
      GARANTIZADO podrá solicitar a EL DEUDOR Y/O CONSTITUYENTE que mejore o reponga la presente
      prenda a su satisfacción en un plazo que le señale para el efecto, si EL DEUDOR Y/O
      CONSTITUYENTE no lo hiciere se generaría el incumplimiento aquí descrito con las consecuencias
      antes anotadas. i) El cambio de compañía de seguros y la póliza expedida no cumpla con las
      condiciones de asegurabilidad exigidas o no se renueve la vigencia del seguro que ampara el
      bien dado en garantía. j) Por ser vinculado EL DEUDOR Y/O CONSTITUYENTE por parte de
      autoridades competentes a cualquier tipo de investigación por delitos de narcotráfico,
      terrorismo, secuestro, lavado de activos o sea incluido en listas para el control de lavado de
      activos administradas por cualquier autoridad nacional o extranjera, tales como la Oficina de
      Control de Activos en el exterior (OFAC) del Departamento del Tesoro de los Estados Unidos de
      América, o condenados por parte de autoridades competentes en cualquier tipo de proceso
      judicial relación con la comisión de cualquier hecho punible. k) Si EL DEUDOR Y/O CONSTITUYENTE
      violare algunas de las disposiciones estipuladas en el presente instrumento o en otros
      documentos otorgados a favor de EL ACREEDOR GARANTIZADO.
    </Clause>

    <Clause label="DECIMA TERCERA. -PAGO DIRECTO:">
      En virtud de lo dispuesto en el artículo 60 de la Ley 1676, las partes acuerdan que en el
      evento de incumplimiento de EL DEUDOR Y/O CONSTITUYENTE, EL ACREEDOR GARANTIZADO podrá optar
      por satisfacer su crédito directamente con los bienes objeto de la presente garantía previo el
      cumplimiento de las siguientes condiciones: 1). EL ACREEDOR GARANTIZADO le notificará al EL
      DEUDOR Y/O CONSTITUYENTE a la dirección física y/o electrónica que haya sido prevista por EL
      DEUDOR Y/O CONSTITUYENTE en la presente prenda o en el formulario registral de inscripción
      inicial o el ultimo formulario de modificación si lo hubiere, su intención de hacer uso del
      derecho a satisfacer su obligación directamente con el bien dado en garantía en virtud de la
      figura del pago directo prevista en la presente clausula, para que en la fecha, hora y sitio
      que indique EL ACREEDOR GARANTIZADO, EL DEUDOR Y/O CONSTITUYENTE proceda a la entrega
      voluntaria del bien objeto de la presente garantía. 2). Se deberá practicar al momento de la
      entrega o apropiación un avaluó del bien objeto de la presente garantía realizado, a elección
      discrecional de EL ACREEDOR GARANTIZADO así: (i) si el bien dado en garantía se cotiza
      habitualmente en el mercado, por el ochenta por ciento (80%) del precio o valor de dicho bien
      que figure en una publicación especializada como Fasecolda o en otra publicación especializada
      de reconocimiento nacional sobre la materia, o en su defecto (ii) por un perito escogido por
      sorteo de la lista que para tal fin disponga la Superintendencia de Sociedades, siendo el
      avaluó que se realice en cualquiera de los dos casos, obligatorio para EL DEUDOR Y/O
      CONSTITUYENTE y EL ACREEDOR GARANTIZADO. 3). Para tal fin, EL DEUDOR Y/O CONSTITUYENTE se
      obliga a permitir la práctica de dicho avalúo. Si EL DEUDOR Y/O CONSTITUYENTE incumpliere esta
      obligación, EL ACREEDOR GARANTIZADO podrá solicitar el apoyo de la autoridad jurisdiccional
      competente. 4). Si en la fecha, hora y sitio indicados no ocurriere la entrega del bien objeto
      de la presente garantía o no se realizare la entrega voluntaria del mismo en poder de EL DEUDOR
      Y/O CONSTITUYENTE, EL ACREEDOR GARANTIZADO solicitará a la autoridad jurisdiccional competente
      que libre orden de aprehensión y entrega del bien, para lo cual bastará la simple petición de
      EL ACREEDOR GARANTIZADO, indicando adicionalmente la ubicación del parqueadero que se haya
      designado por EL ACREEDOR GARANTIZADO para tal fin, a efectos de que una vez capturado el bien
      dado en garantía, se proceda a ser entregado en dicho parqueadero o lugar de ubicación que
      indique EL ACREEDOR GARANTIZADO. En este evento, una vez efectuada la entrega del bien dado en
      garantía a EL ACREEDOR GARANTIZADO, EL DEUDOR Y/O CONSTITUYENTE podrá acudir a la justicia
      ordinaria para hacer valer sus derechos. 5). Si el valor del bien supera el monto de la
      obligación garantizada, EL ACREEDOR GARANTIZADO deberá entregar el saldo correspondiente,
      deducidos los gastos y costos, a otros acreedores inscritos, de acuerdo a la información que
      aparezca en la constancia que para tal efecto obtenga del registro EL ACREEDOR GARANTIZADO, a
      EL DEUDOR o a EL CONSTITUYENTE si fuere persona distinta a EL DEUDOR, según corresponda, para
      lo cual se constituirá un depósito judicial a favor de quien corresponda y siga en orden de
      prelación, cuyo título se remitirá al juzgado correspondiente del domicilio de EL CONSTITUYENTE.
      6). Si al momento en que EL ACREEDOR GARANTIZADO decida ejercer el derecho aquí previsto en los
      términos del artículo 60 de la Ley 1676 de 2013, no existieren otros acreedores prendarios
      inscritos, podrá acordar con EL DEUDOR Y/O CONSTITUYENTE el valor de recibo en pago del bien
      dado en garantía y, por lo tanto, se prescindirá del avalúo por parte del perito designado por
      la Superintendencia de Sociedades. 7.) Si al momento de recibir EL ACREEDOR GARANTIZADO en pago
      directo el bien dado en garantía, el valor del avalúo del mismo no alcanza a cubrir la
      obligación adeudada a esa fecha, EL ACREEDOR GARANTIZADO recibirá en pago el bien dado en
      garantía por el valor que determine el avalúo a la obligación adeudada, cuyo saldo continuará
      vigente a cargo de EL DEUDOR Y/O CONSTITUYENTE y a favor de EL ACREEDOR GARANTIZADO hasta que
      se produzca su pago total y en consecuencia, EL ACREEDOR GARANTIZADO tendrá derecho a demandar
      el pago de dicho saldo a EL DEUDOR Y/O CONSTITUYENTE. 8). Del valor recibido por concepto de
      pago directo en virtud del avalúo realizado al bien dados en garantía, se descontarán todos los
      gastos e impuestos en que haya incurrido EL ACREEDOR GARANTIZADO para poder hacer efectiva esta
      figura de pago directo a su favor. 9). Sin perjuicio de lo establecido en el artículo
      2.2.2.4.2.72 del Decreto 1835 de 2015, para efectos de proceder al traspaso de la propiedad de
      la motocicleta como resultado del pago directo, ejecución especial de la garantía o apropiación
      directa de ser el caso, EL DEUDOR Y/O CONSTITUYENTE mediante la firma del presente contrato
      confiere poder especial, amplio y suficiente a EL ACREEDOR GARANTIZADO para que, a través de su
      representante legal o apoderado, suscriba en su nombre y representación los documentos necesarios
      para el perfeccionamiento del traspaso de propiedad de la motocicleta a nombre de EL ACREEDOR
      GARANTIZADO, así como para que realice ante las autoridades correspondientes los trámites
      tendientes a obtener el traspaso mencionado.
    </Clause>

    <Clause label="DECIMA CUARTA.-MECANISMOS DE EJECUCIÓN:">
      Las partes acuerdan que en el evento de incumplimiento de EL DEUDOR Y/O CONSTITUYENTE, EL
      ACREEDOR GARANTIZADO podrá optar por ejecutar la presente garantía por el mecanismo de
      adjudicación o realización especial de la garantía real regulado en los artículos 467 y 468 del
      Código General del Proceso o la ejecución especial de la garantía en los casos y forma prevista
      en la Ley 1676 de 2013, sin perjuicio de lo indicado en la cláusula décima tercera del presente
      contrato, que consagra la figura del pago directo.
    </Clause>

    <Clause label="DECIMA QUINTA. -CESION:">
      EL DEUDOR Y/O CONSTITUYENTE autoriza expresamente a EL ACREEDOR GARANTIZADO o quien represente
      sus derechos, para ceder, endosar o traspasar los derechos y acciones que se derivan de este
      documento o los que él ampara, así como todas o en parte las obligaciones garantizadas con la
      prenda que aquí se constituye y por consiguiente esta prenda y en consecuencia, autoriza su
      registro de ser el caso.
    </Clause>

    <Clause label="DECIMA SEXTA. -AUTORIZACION:">
      EL DEUDOR Y/O CONSTITUYENTE autoriza expresamente a EL ACREEDOR GARANTIZADO, para designar
      secuestre o depositario del bien, teniéndose tal designación como hecha en forma conjunta, sin
      que ello genere responsabilidad alguna por la conducta de la persona nombrada para ejercer tal
      encargo, puesto que EL DEUDOR Y/O CONSTITUYENTE renuncia a cualquier acción o reclamo por tal
      causa.
    </Clause>

    <Clause label="DECIMA SEPTIMA.">
      La suscripción del presente contrato y sus modificaciones, o de algún documento firmado por EL
      DEUDOR Y/O CONSTITUYENTE en este sentido, serán suficientes para entender que EL DEUDOR Y/O
      CONSTITUYENTE autoriza a EL ACREEDOR GARANTIZADO o a quien éste último delegue, la inscripción
      de la garantía mobiliaria en el registro y sus modificaciones posteriores, prorrogas y
      ejecución, a costa de EL DEUDOR Y/O CONSTITUYENTE, incluso pudiéndolo hacerlo antes del
      otorgamiento de la presente prenda. Por tratarse de una garantía mobiliaria abierta que respalda
      obligaciones presentes y/o futuras a cargo del EL DEUDOR Y/O CONSTITUYENTE y a favor del EL
      ACREEDOR GARANTIZADO, solo a solicitud de EL DEUDOR Y/O CONSTITUYENTE, cuando éste hubiere
      cancelado la totalidad de las obligaciones garantizadas, EL ACREEDOR GARANTIZADO procederá a
      cancelar la garantía a costa de EL DEUDOR Y/O CONSTITUYENTE. El trámite de cancelación de esta
      garantía ante las autoridades de tránsito será efectuado por EL DEUDOR Y/O CONSTITUYENTE, a su
      costa. De igual maneara, de acuerdo con lo previsto en el numeral 6° del artículo 19 de la Ley
      1676 de 2013, las partes acuerdan que solo operará la cancelación o la reducción del valor de la
      garantía o monto de la obligación garantizada o la eliminación de alguno de los bienes dados en
      garantía cuando se hubieren cancelado la totalidad de las obligaciones a cargo del EL DEUDOR Y/O
      CONSTITUYENTE.
    </Clause>

    <Clause label="DECIMA OCTAVA.">
      Por el hecho de constituirse la presente garantía a favor de EL ACREEDOR GARANTIZADO, éste no
      adquiere obligación alguna de conceder a EL DEUDOR Y/O CONSTITUYENTE créditos, prórrogas, ni
      renovaciones de la obligación adquirida o que con posterioridad contraiga.
    </Clause>

    <Clause label="DECIMA NOVENA.-NOTIFICACIONES:">
      EL DEUDOR Y/O CONSTITUYENTE manifiesta que su dirección física y domicilio para todos los
      efectos legales y en especial para recibo de notificaciones judiciales o extrajudiciales o para
      efectos del registro son las siguientes: {blank(d.direccion, 26)} de la ciudad de{" "}
      {blank(d.ciudad, 18)}, al igual que la dirección electrónica es: {"_".repeat(28)} y manifiesta
      que en caso de cambio de la dirección para notificaciones informará inmediatamente a EL ACREEDOR
      GARANTIZADO la nueva dirección, pactándose de manera expresa que las notificaciones realizadas a
      la dirección y domicilio señalados por EL DEUDOR Y/O CONSTITUYENTE producirán plenos efectos de
      acuerdo con lo dispuesto en la ley. En cualquier caso, tratándose de personas jurídicas las
      notificaciones se realizarán en la dirección registrada para tal efecto ante la Cámara de
      Comercio o la entidad que haga sus veces.
    </Clause>

    <Text style={S.p}>
      En constancia se firma en {blank(d.ciudad, 18)}, a los {"_".repeat(6)} días del mes de{" "}
      {"_".repeat(16)} de {"_".repeat(8)}.
    </Text>

    {/* Firmas deudores */}
    <View style={S.signRow} wrap={false}>
      <View style={S.signCol}>
        <View style={{ height: 24 }} />
        <View style={S.signLine} />
        <Text style={S.signBold}>NOMBRE: {d.nombre || "____________________"}</Text>
        <Text style={S.signLabel}>
          C.-C: {d.cc || "________________"} de {d.ciudad || "______"}
        </Text>
        <Text style={S.signBold}>DEUDOR Y/O CONSTITUYENTE</Text>
      </View>
      <View style={S.signCol}>
        <View style={{ height: 24 }} />
        <View style={S.signLine} />
        <Text style={S.signBold}>NOMBRE: {d.codeudorNombre || "."}</Text>
        <Text style={S.signLabel}>C.C.: {d.codeudorCc} de Cali</Text>
        <Text style={S.signBold}>DEUDOR Y/O CONSTITUYENTE</Text>
      </View>
    </View>

    {/* Firma acreedor garantizado */}
    <View style={[S.signCol, { marginTop: 30 }]} wrap={false}>
      <View style={{ height: 24 }} />
      <View style={S.signLine} />
      <Text style={S.signBold}>ACREEDOR GARANTIZADO</Text>
      <Text style={S.signLabel}>{REP_LEGAL}</Text>
      <Text style={S.signLabel}>C.C: {REP_LEGAL_CC} de {REP_LEGAL_CIUDAD}</Text>
      <Text style={S.signLabel}>Representante Legal</Text>
      <Text style={S.signLabel}>{CEPRESTA_SIGLA}.</Text>
      <Text style={S.signLabel}>NIT. {CEPRESTA_NIT}</Text>
    </View>

  </Page>
);

// ═══════════════════════════════════════════════════════════════════════════
// Documento completo
// ═══════════════════════════════════════════════════════════════════════════
export const PaqueteCreditoCeprestaPDFDoc: React.FC<PaqueteCreditoCeprestaPDFProps> = ({
  data,
  logoSrc,
}) => {
  const d = adapt(data);
  const logo = logoSrc ?? data?.logoSrc;
  return (
    <Document>
      <DocAutorizacion d={d} logoSrc={logo} />
      <DocPagare d={d} logoSrc={logo} />
      <DocInstrucciones d={d} logoSrc={logo} />
      <DocPrenda d={d} logoSrc={logo} />
    </Document>
  );
};

export default PaqueteCreditoCeprestaPDFDoc;
