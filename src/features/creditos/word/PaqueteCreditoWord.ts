// PaqueteCreditoWord.ts
// Versión Word (docx) del Paquete de Crédito — 11 documentos.
// Componentes propios enfocados en Word, diseño adaptado (logo izq, encabezado
// con empresa/NIT dinámicos, pie "Documento X de 11").
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  VerticalAlign,
  TabStopType,
  type ISectionOptions,
} from "docx";

export interface EmpresaWord {
  nombre: string;
  nit: string;
  ciudad?: string;
}

const FONT = "Helvetica";
const SZ = 17; // 8.5pt (half-points)
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const GRAY = "F0F0F0";

const blank = (v: any, n = 24): string =>
  v != null && String(v).trim() !== "" ? String(v) : "_".repeat(n);

/* ===== Párrafos ===== */
const para = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 90 },
    children: [new TextRun({ text, font: FONT, size: SZ })],
  });

const rich = (runs: TextRun[]) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 90 },
    children: runs,
  });

const t = (text: string, bold = false) =>
  new TextRun({ text, bold, font: FONT, size: SZ });

// Cláusula: etiqueta en negrita + texto
const clause = (label: string, text: string) => rich([t(label, true), t(" " + text)]);

const docTitle = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 140 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 19 })],
  });

/* ===== Tabla vehículo ===== */
const cellLabel = (text: string) =>
  new TableCell({
    width: { size: 18, type: WidthType.PERCENTAGE },
    shading: { fill: GRAY, color: "auto", type: "clear" as any },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({ children: [new TextRun({ text, bold: true, font: FONT, size: 16 })] }),
    ],
  });

const cellValue = (text: string) =>
  new TableCell({
    width: { size: 32, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({ children: [new TextRun({ text, font: FONT, size: 16 })] }),
    ],
  });

const vehTable = (d: any, servicio = false) => {
  const rows = [
    ["CLASE", "Motocicleta", "MARCA", blank(d.marca, 20)],
    ["LÍNEA", blank(d.linea, 20), "MODELO", blank(d.modelo || d.modeloMoto, 20)],
    ["COLOR", blank(d.color, 20), "No. MOTOR", blank(d.motor || d.numeroMotor, 20)],
    ["No. CHASIS", blank(d.chasis || d.numeroChasis, 20), "PLACA", blank(d.placa, 20)],
  ];
  if (servicio) rows.push(["SERVICIO", "Particular", "", ""]);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [cellLabel(r[0]), cellValue(r[1]), cellLabel(r[2]), cellValue(r[3])],
        })
    ),
  });
};

/* ===== Tabla clave/valor (desembolso / poder) ===== */
const kvTable = (rows: [string, string][]) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              shading: { fill: GRAY, color: "auto", type: "clear" as any },
              children: [
                new Paragraph({ children: [new TextRun({ text: k, bold: true, font: FONT, size: 16 })] }),
              ],
            }),
            new TableCell({
              width: { size: 58, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: v, font: FONT, size: 16 })] }),
              ],
            }),
          ],
        })
    ),
  });

/* ===== Firmas ===== */
const firmaLines = (lines: { text: string; bold?: boolean }[]) =>
  [
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: "_".repeat(38), font: FONT, size: SZ })] }),
    ...lines.map(
      (l) =>
        new Paragraph({ children: [new TextRun({ text: l.text, bold: l.bold, font: FONT, size: 15 })] })
    ),
  ];

// Dos firmas lado a lado (tabla sin bordes)
const firmasDobles = (
  izq: { text: string; bold?: boolean }[],
  der: { text: string; bold?: boolean }[]
) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
      insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: firmaLines(izq) }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: firmaLines(der) }),
        ],
      }),
    ],
  });

/* ===== Header / Footer ===== */
const buildHeader = (
  empresa: EmpresaWord,
  metaVals: { codigo?: string; fecha?: string; ciudad?: string },
  logo?: { data: ArrayBuffer; type: "png" | "jpg" }
) => {
  const logoCellChildren = logo
    ? [
        new Paragraph({
          children: [
            new ImageRun({
              type: logo.type,
              data: logo.data,
              transformation: { width: 95, height: 50 },
            }),
          ],
        }),
      ]
    : [new Paragraph({ children: [] })];

  const titleTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
      insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, children: logoCellChildren }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PAQUETE DE CRÉDITO", bold: true, font: FONT, size: 24 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${empresa.nombre} – NIT ${empresa.nit || "______________"}`, bold: true, font: FONT, size: 17 })] }),
            ],
          }),
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
        ],
      }),
    ],
  });

  const meta = new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" } },
    tabStops: [
      { type: TabStopType.CENTER, position: 4500 },
      { type: TabStopType.RIGHT, position: 9020 },
    ],
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `Código: ${blank(metaVals.codigo, 12)}`, font: FONT, size: 15 }),
      new TextRun({ text: `\tFecha: ${blank(metaVals.fecha, 12)}`, font: FONT, size: 15 }),
      new TextRun({ text: `\tCiudad: ${blank(metaVals.ciudad, 18)}`, font: FONT, size: 15 }),
    ],
  });

  return new Header({ children: [titleTable, meta] });
};

const buildFooter = (docIndex: number) =>
  new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Documento ${docIndex} de 11`, font: FONT, size: 13, color: "555555" })],
      }),
    ],
  });

/* ===== Documentos (cuerpo) ===== */
const Doc1 = (d: any, e: EmpresaWord) => [
  docTitle("AUTORIZACIÓN INTEGRADA PARA EL TRATAMIENTO DE DATOS PERSONALES Y PARA LA CONSULTA, REPORTE Y PROCESAMIENTO DE INFORMACIÓN CREDITICIA, FINANCIERA Y COMERCIAL"),
  rich([t("Yo, "), t(blank(d.nombre, 50), true), t(`, mayor de edad, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 20)}, actuando en calidad de titular de la información, de manera previa, libre, expresa, voluntaria e informada, declaro y autorizo lo siguiente a favor de `), t(e.nombre, true), t(", identificada con NIT "), t(e.nit, true), t(", en adelante LA COMPAÑÍA, quien actúa como responsable del tratamiento de mis datos personales:")]),
  clause("PRIMERO – TRATAMIENTO DE DATOS PERSONALES:", "De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, autorizo a LA COMPAÑÍA para recolectar, almacenar, usar, circular, actualizar y suprimir mis datos personales, con la finalidad de desarrollar su objeto social y la relación contractual que surja del ejercicio de sus servicios; gestionar mis solicitudes; generar comunicaciones, extractos de cuenta y demás comunicaciones comerciales y de cobranza a través de cualquier medio, incluyendo correo físico, correo electrónico, mensajes de texto, llamadas telefónicas y aplicaciones de mensajería instantánea (WhatsApp); medir niveles de satisfacción; informar sobre campañas de servicio y fidelización; realizar actualización de datos y estudios de mercado; así como para fines comerciales, estadísticos, de evaluación de riesgo, prevención de fraude, conocimiento del cliente y demás finalidades compatibles con las aquí descritas."),
  clause("SEGUNDO – CONSULTA Y REPORTE EN CENTRALES DE RIESGO:", `En los términos de la Ley 1266 de 2008, autorizo de manera expresa e irrevocable a ${e.nombre}, o a quien represente sus derechos u ostente en el futuro la calidad de acreedor, para consultar, solicitar, suministrar, reportar, procesar, actualizar, rectificar y divulgar ante las centrales de información y riesgo (entre otras, TransUnion – DataCrédito) y ante cualquier entidad pública o privada que administre bases de datos, toda la información referida a mi comportamiento crediticio, financiero, comercial y de servicios. Conozco que el alcance de esta autorización implica que mi comportamiento frente a las obligaciones contraídas será registrado con el objeto de suministrar información suficiente y adecuada al mercado sobre el estado de mis obligaciones.`),
  clause("TERCERO – DERECHOS DEL TITULAR:", "Declaro que conozco mis derechos a conocer, actualizar, rectificar y suprimir mi información personal, a revocar la presente autorización en los términos de la ley y a presentar consultas y reclamos ante el responsable del tratamiento, mediante comunicación escrita dirigida a LA COMPAÑÍA, de acuerdo con su Manual de Políticas y Procedimientos para el Tratamiento de Datos Personales."),
  clause("CUARTO – ACEPTACIÓN:", "Declaro que he leído y comprendido a cabalidad el contenido de la presente autorización y que acepto las finalidades en ella descritas y las condiciones que de ella se derivan."),
  para(`Para constancia se firma en la ciudad de ${blank(d.ciudad, 20)}, el día ______ del mes de ______________ del año ________.`),
  ...firmaLines([
    { text: "EL TITULAR DE LA INFORMACIÓN", bold: true },
    { text: `Nombre: ${blank(d.nombre, 40)}` },
    { text: `C.C. No. ${blank(d.cc, 20)}` },
    { text: `Dirección: ${blank(d.direccionResidencia, 30)}` },
    { text: `Teléfono: ${blank(d.celular, 18)}` },
  ]),
];

const Doc2 = (d: any, e: EmpresaWord) => [
  docTitle("CONTRATO DE CRÉDITO PARA LA ADQUISICIÓN DE UNA MOTOCICLETA"),
  rich([t("El presente contrato se celebra entre los suscritos a saber: (i) por un lado, "), t(e.nombre, true), t(", sociedad legalmente constituida bajo las leyes de Colombia, identificada con NIT "), t(e.nit, true), t(` (la “Acreedora”); y (ii) por el otro, ${blank(d.nombre, 40)}, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 20)} (el “Deudor”). La Acreedora y el Deudor, conjuntamente las “Partes”, han convenido suscribir el presente contrato de crédito para la adquisición de una motocicleta (el “Contrato”), que se regirá por las siguientes cláusulas:`)]),
  clause("1. CONDICIONES PARTICULARES DEL CRÉDITO.", "Las condiciones particulares del Contrato son las relacionadas en el documento “Condiciones del Crédito” (“Anexo No. 1”), el cual hace parte integral del presente Contrato. Para el otorgamiento del crédito, la Acreedora requiere la suscripción de un pagaré y de la carta de instrucciones para su diligenciamiento, como garantía de cumplimiento de la obligación."),
  clause("2. PLAZO.", "El plazo del presente Contrato será igual a la vigencia del crédito. Cualquier evento en que este documento autorice a la Acreedora a dar por terminado el Contrato la faculta para dar por exigible la totalidad de la obligación a cargo del (de los) Deudor(es)."),
  clause("3. CLÁUSULA ACELERATORIA.", "La Acreedora podrá declarar exigible el plazo y exigir el pago total de lo adeudado cuando se presenten eventos de mora, incumplimiento u otras causales previstas en este Contrato, sin necesidad de requerimiento judicial o extrajudicial."),
  clause("4. FORMA DE PAGO.", "El pago del crédito se realizará en las cuotas y periodicidades acordadas en el Anexo No. 1, mediante consignación, débito automático, pago en caja o los demás mecanismos autorizados por la Acreedora."),
  clause("5. INTERESES REMUNERATORIOS.", "El Contrato generará intereses remuneratorios sobre el saldo insoluto del capital, calculados a la tasa señalada en las Condiciones del Crédito, sin exceder en ningún caso la tasa máxima certificada por la Superintendencia Financiera de Colombia."),
  clause("6. INTERESES DE MORA.", "En caso de falta de pago oportuno, se causarán intereses de mora sobre las sumas vencidas a la tasa máxima permitida por las normas comerciales vigentes en la República de Colombia."),
  clause("7. FECHA LÍMITE DE PAGO DE LAS CUOTAS.", "Será la que figure en el cronograma de pagos del crédito; el no pago oportuno generará mora y habilitará las consecuencias previstas en este Contrato."),
  clause("8. IMPUTACIÓN DE PAGOS.", "Los pagos efectuados por el Deudor se imputarán primero a gastos de cobranza, luego a intereses de mora, intereses remuneratorios y finalmente a capital, salvo pacto en contrario."),
  clause("9. PAGO ANTICIPADO TOTAL O PARCIAL.", "El Deudor podrá efectuar pagos anticipados totales o parciales del crédito, caso en el cual se liquidarán los intereses hasta la fecha efectiva de pago, conforme a la normatividad aplicable."),
  clause("10. OBLIGACIONES DEL (DE LOS) DEUDOR(ES).", "Además de las obligaciones de pago, el Deudor deberá mantener el bien objeto de financiación en correcto estado de funcionamiento, cumplir con las normas de tránsito y seguros obligatorios, y actualizar sus datos de contacto cuando se le solicite."),
  clause("11. GESTIÓN DE COBRO.", "Durante la vigencia del Contrato, la Acreedora podrá adelantar gestiones de cobro prejurídico y jurídico para obtener el pago de la obligación, pudiendo acudir a oficinas propias o a terceros especializados."),
  clause("12. CONDICIONES EN CASO DE INCUMPLIMIENTO.", "El incumplimiento de las obligaciones a cargo del Deudor faculta a la Acreedora para declarar vencido el plazo, exigir el pago total de la obligación y reportar la información negativa a las centrales de riesgo autorizadas, previa comunicación al Deudor en los términos del artículo 12 de la Ley 1266 de 2008."),
  clause("13. COBROS ADICIONALES Y GASTOS.", "El Deudor asumirá los costos y gastos de cobranza, notificaciones, honorarios de abogados y cualquier otro concepto que se genere por la mora en el pago de la obligación, en los términos establecidos por la ley y este Contrato."),
  clause("14. DACIÓN EN PAGO.", "En caso de incumplimiento del Contrato, el Deudor podrá ofrecer a la Acreedora la dación en pago de la motocicleta u otro bien objeto del crédito, para que sea aplicada al pago de la obligación principal y sus accesorios, previa aceptación y avalúo realizado por la Acreedora, conforme a la autorización de retención y dación en pago que hace parte del paquete de crédito."),
  clause("15. LISTA DE RIESGOS.", "La Acreedora podrá dar por terminado el presente Contrato y exigir el pago inmediato de la obligación cuando se presenten situaciones relacionadas con actividades ilícitas, lavado de activos, financiación del terrorismo, uso indebido de la información, falsedad documental o cualquier otra circunstancia que pueda implicar riesgo para la Acreedora, de conformidad con sus políticas de prevención de lavado de activos y gestión de riesgos."),
  clause("16. HONORARIOS Y GASTOS DE COBRANZA.", "En caso de mora se generarán gastos de gestión de cobro a cargo del Deudor. En la etapa de cobranza prejudicial, que podrá extenderse hasta por 90 días calendario contados a partir de la fecha de incumplimiento, los honorarios podrán ser hasta del 10% sobre el valor de la obligación vencida, además de los gastos de comunicación, llamadas, visitas y demás costos razonables de gestión. Si la obligación pasa a cobranza judicial, el Deudor acepta el pago de los gastos y honorarios que se liquiden de conformidad con la normativa vigente, sin que éstos excedan el 20% del valor de la obligación en cobro, más impuestos, tasas y contribuciones aplicables."),
  clause("17. MODIFICACIONES EN BENEFICIO DEL DEUDOR.", "La Acreedora podrá modificar unilateralmente el presente Contrato siempre que dicha modificación constituya un beneficio para el Deudor, tales como disminución de tasas de interés, ampliación de plazo o reducción de cuotas. Toda modificación será comunicada al Deudor por los canales establecidos."),
  clause("18. ENVÍO DE INFORMACIÓN.", "El Deudor autoriza a la Acreedora para enviarle información relacionada con el crédito, extractos, estados de cuenta, avisos de cobro, campañas comerciales y demás comunicaciones a través de correo físico, correo electrónico, mensajes de texto, llamadas telefónicas, aplicaciones de mensajería o cualquier otro medio disponible."),
  clause("19. AUTORIZACIONES.", "El Deudor autoriza irrevocablemente a la Acreedora para consultar, reportar, procesar y divulgar su información crediticia, financiera, comercial y de contacto en las centrales de riesgo y demás bases de datos que la ley autorice, así como para compartirla con entidades aliadas, siempre con la finalidad de administrar, evaluar y recuperar el crédito otorgado."),
  clause("20. CESIÓN, PETICIONES Y RETRACTO.", "La Acreedora podrá ceder total o parcialmente los derechos derivados del presente Contrato a favor de terceros, sin necesidad de autorización adicional del Deudor, manteniendo éste las mismas condiciones pactadas. El Deudor podrá presentar peticiones, quejas o recursos relacionados con el crédito a través de los canales de atención de la Acreedora, los cuales serán tramitados dentro de los términos legales. El Deudor cuenta con un plazo de cinco (5) días hábiles contados a partir de la fecha de firma del presente Contrato para ejercer el derecho de retracto cuando sea procedente, en los términos establecidos por la ley, lo cual podrá implicar la devolución del bien financiado y el pago de los gastos en que se haya incurrido. Las devoluciones de dinero en virtud del retracto se realizarán por el mismo medio en que fue efectuado el pago, dentro de los treinta (30) días calendario siguientes al ejercicio del derecho."),
  clause("21. IMPUESTOS.", "Los impuestos que se causen con ocasión de la celebración o ejecución del presente Contrato, y en especial el impuesto de timbre, serán asumidos por el (los) Deudor(es)."),
  para(`Para constancia se firma en la ciudad de ${blank(d.ciudad, 20)}, el día ______ de ______________ de 20____, en dos ejemplares de un mismo tenor.`),
  ...firmaLines([
    { text: "LA ACREEDORA", bold: true },
    { text: e.nombre, bold: true },
    { text: `NIT ${e.nit}` },
    { text: "Representante: _______________________ C.C. No. _____________" },
  ]),
  firmasDobles(
    [
      { text: "EL DEUDOR", bold: true },
      { text: `Nombre: ${blank(d.nombre, 30)}` },
      { text: `C.C. No. ${blank(d.cc, 18)}` },
      { text: `Tel.: ${blank(d.celular, 12)}  Dir.: ${blank(d.direccionResidencia, 16)}` },
    ],
    [
      { text: "EL CODEUDOR", bold: true },
      { text: `Nombre: ${blank(d.codeudorNombre, 30)}` },
      { text: `C.C. No. ${blank(d.codeudorCc, 18)}` },
      { text: `Tel.: ${blank(d.codeudorTelefono, 12)}  Dir.: ${blank(d.codeudorDireccion, 16)}` },
    ]
  ),
];

const Doc3 = (d: any, e: EmpresaWord) => [
  docTitle(`PAGARÉ No. ${blank(d.codigo, 14)}`),
  rich([t(`Yo (nosotros), ${blank(d.nombre, 40)}, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 20)}, declaro (declaramos) que por virtud del presente título valor pagaré (pagaremos) en forma solidaria e incondicional a la orden de `), t(e.nombre, true), t(`, o a quien represente sus derechos, en la ciudad de ${blank(d.ciudad, 20)}, la suma de ${blank(d.valorMoto, 30)} ($${blank(d.valorMoto, 18)}), en las fechas de amortización por cuotas señaladas en la cláusula tercera de este pagaré, más los intereses señalados en la cláusula segunda de este título valor.`)]),
  clause("SEGUNDA – INTERESES:", "Sobre la suma debida reconoceré (reconoceremos) intereses remuneratorios equivalentes al ________% mensual efectivo, sobre el capital o saldo insoluto. En caso de mora reconoceré (reconoceremos) intereses moratorios a la tasa máxima legal autorizada por la Superintendencia Financiera de Colombia o la norma que la modifique, sobre el saldo vencido."),
  clause("TERCERA – PLAZO:", `Pagaré (pagaremos) el capital indicado en la cláusula primera y sus intereses mediante ${blank(d.cuotas, 6)} cuotas mensuales y sucesivas de ${blank(d.valorCuota, 26)} ($${blank(d.valorCuota, 18)}) cada una. El primer pago se efectuará el día ______ del mes de ______________ de ________, y las subsiguientes en igual fecha de cada mes.`),
  clause("CUARTA – CLÁUSULA ACELERATORIA:", "El tenedor podrá declarar vencidos los plazos de esta obligación y exigir el pago total de la deuda más los intereses causados cuando se presente alguna de las siguientes circunstancias: a) la aprehensión de nuestros bienes en proceso de embargo o secuestro; b) nuestra declaración en liquidación obligatoria o insolvencia; c) el incumplimiento en el pago de cualquiera de las cuotas pactadas; d) la inexactitud o falsedad de la información suministrada; e) cualquier otro evento de incumplimiento previsto en la ley o en el contrato que dio origen a este pagaré."),
  rich([t("QUINTA: ", true), t("Renuncio (renunciamos) al beneficio de excusión y división, así como a cualquier otro que en derecho me (nos) favorezca, y reconozco (reconocemos) desde ya la existencia de una obligación clara, expresa y exigible a favor de "), t(e.nombre, true), t(".")]),
  clause("SEXTA – AUTORIZACIÓN PARA VERIFICACIÓN Y REPORTE:", `Autorizo (autorizamos) expresamente a ${e.nombre} para consultar, verificar, reportar y actualizar mi (nuestra) información en centrales de riesgo, así como para efectuar las gestiones de cobro prejudicial y judicial que considere pertinentes.`),
  clause("SÉPTIMA – IMPUESTO DE TIMBRE:", "El impuesto de timbre a que esté sujeto este título valor será de cargo única y exclusivamente del (de los) deudor(es)."),
  para("En constancia de lo anterior, se suscribe este documento el día ______ del mes de ______________ de ________."),
  firmasDobles(
    [{ text: "DEUDOR", bold: true }, { text: `Nombre: ${blank(d.nombre, 30)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }],
    [{ text: "CODEUDOR", bold: true }, { text: `Nombre: ${blank(d.codeudorNombre, 30)}` }, { text: `C.C. No. ${blank(d.codeudorCc, 18)}` }]
  ),
];

const Doc4 = (d: any, e: EmpresaWord) => [
  docTitle("CARTA DE INSTRUCCIONES Y AUTORIZACIÓN PARA DILIGENCIAR EL PAGARÉ"),
  para(`Ciudad y fecha: ${blank(d.ciudad ? `${d.ciudad}, ${d.fecha ?? ""}` : "", 40)}`),
  para("Señores"),
  new Paragraph({ children: [t(e.nombre, true)] }),
  rich([t("Los firmantes, mayores de edad, identificados como aparece al pie de nuestras correspondientes firmas, quienes en adelante nos denominaremos los DEUDORES, en los términos del artículo 622 del Código de Comercio, facultamos de manera expresa e irrevocable a "), t(e.nombre, true), t(`, o a quien en el futuro ostente la calidad de acreedor o tenedor legítimo del pagaré identificado con el número ${blank(d.codigo, 16)}, para llenar los espacios en blanco de dicho instrumento, de conformidad con las siguientes instrucciones:`)]),
  para(`1. En el espacio reservado en la cláusula primera del pagaré para colocar una suma de dinero se escribirá la cuantía a la que asciendan las obligaciones insolutas que por cualquier concepto mantengamos contraídas, directa o indirectamente, con ${e.nombre}, incluidas sus prórrogas, renovaciones y reestructuraciones.`),
  para("2. En el espacio reservado en la cláusula segunda del pagaré se escribirá la tasa de interés remuneratorio y de mora que corresponda conforme a lo pactado en el respectivo contrato o documento soporte, sin exceder los límites legales."),
  para(`3. Como fecha de vencimiento de dicho pagaré, ${e.nombre} deberá colocar la del día en que lo llene o diligencie.`),
  para(`4. ${e.nombre} podrá diligenciar el pagaré en cualquier tiempo, sin necesidad de requerimiento judicial o extrajudicial, cuando se presenten eventos de mora o incumplimiento en el pago de cualquiera de las obligaciones a nuestro cargo, incluyendo capital, intereses, honorarios y demás conceptos derivados de los contratos suscritos.`),
  para(`5. Aceptamos incondicionalmente todo traspaso, endoso o cesión que ${e.nombre} haga del presente instructivo junto con el pagaré, el cual amparará las obligaciones allí contenidas, con sus prórrogas y demás modificaciones.`),
  para(`Se firma en la ciudad de ${blank(d.ciudad, 20)}, a los ______ días del mes de ______________ del año ________.`),
  firmasDobles(
    [{ text: "DEUDOR", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. o NIT: ${blank(d.cc, 18)}` }, { text: `Dirección: ${blank(d.direccionResidencia, 24)}` }, { text: `Teléfono: ${blank(d.celular, 16)}` }],
    [{ text: "CODEUDOR", bold: true }, { text: `Nombre: ${blank(d.codeudorNombre, 28)}` }, { text: `C.C. o NIT: ${blank(d.codeudorCc, 18)}` }, { text: `Dirección: ${blank(d.codeudorDireccion, 24)}` }, { text: `Teléfono: ${blank(d.codeudorTelefono, 16)}` }]
  ),
];

const Doc5 = (d: any, e: EmpresaWord) => [
  docTitle("CONTRATO DE COMPRAVENTA DE VEHÍCULO AUTOMOTOR CON RESERVA DE DOMINIO"),
  rich([t(`Lugar y fecha de celebración: ${blank(d.ciudad, 20)}, ______ de ______________ de ________. Entre los suscritos, a saber: `), t(e.nombre, true), t(", identificada con NIT "), t(e.nit, true), t(`, quien en adelante se denominará EL VENDEDOR; y ${blank(d.nombre, 36)}, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 18)}, con domicilio en ${blank(d.direccionResidencia, 22)} y teléfono ${blank(d.celular, 14)}, quien en adelante se denominará EL COMPRADOR, hemos convenido celebrar un contrato de compraventa que se regirá por las normas legales aplicables, en especial los artículos 952 y siguientes del Código de Comercio, y por las siguientes cláusulas:`)]),
  clause("PRIMERA – OBJETO:", "EL VENDEDOR se compromete a transferir a título de venta al COMPRADOR la propiedad del vehículo automotor que se identifica a continuación:"),
  vehTable(d),
  clause("SEGUNDA – PRECIO:", `Como precio del automotor descrito, las partes han acordado la suma de ${blank(d.valorMoto, 30)} ($${blank(d.valorMoto, 18)}).`),
  clause("TERCERA – FORMA DE PAGO:", `EL COMPRADOR pagará el precio mediante una cuota inicial de $${blank(d.cuotaInicial, 18)} y el saldo en las condiciones y plazos pactados en el contrato de crédito y en la tabla de amortización que hacen parte del paquete de crédito.`),
  clause("CUARTA – OBLIGACIONES DEL VENDEDOR:", "EL VENDEDOR se obliga a hacer entrega del vehículo en perfecto estado, libre de gravámenes, embargos, multas o procesos que afecten su libre comercio, sin perjuicio de las garantías que se constituyan en virtud de la financiación."),
  clause("QUINTA – RESERVA DE DOMINIO:", "De conformidad con los artículos 952 y siguientes del Código de Comercio, EL VENDEDOR se reserva el dominio del vehículo vendido hasta tanto EL COMPRADOR haya pagado la totalidad del precio. En consecuencia, EL COMPRADOR sólo adquirirá la propiedad con el pago total, y su incumplimiento facultará al VENDEDOR para recuperar el bien y obtener la restitución del mismo conforme a la ley, con la correspondiente liquidación de las sumas pagadas y de la indemnización a que haya lugar."),
  clause("SEXTA – CLÁUSULA PENAL:", "Las partes establecen como sanción pecuniaria por el incumplimiento una pena equivalente al perjuicio causado, sin exceder los límites del artículo 867 del Código de Comercio y sin perjuicio de las demás acciones legales."),
  clause("SÉPTIMA – GASTOS:", "Los gastos que se originen con motivo de esta compraventa serán de cargo del COMPRADOR, salvo los que por ley correspondan al VENDEDOR."),
  para("En señal de conformidad, los contratantes suscriben este documento en dos (2) ejemplares del mismo tenor."),
  firmasDobles(
    [{ text: "EL VENDEDOR", bold: true }, { text: e.nombre, bold: true }, { text: `NIT ${e.nit}` }],
    [{ text: "EL COMPRADOR", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }]
  ),
];

const Doc6 = (d: any, e: EmpresaWord) => [
  docTitle("CONTRATO DE PRENDA SIN TENENCIA DEL ACREEDOR SOBRE VEHÍCULO AUTOMOTOR"),
  rich([t("El presente contrato se celebra entre los suscritos, a saber: por un lado, "), t(e.nombre, true), t(", sociedad legalmente constituida, identificada con NIT "), t(e.nit, true), t(`, quien en adelante se denominará LA ACREEDORA; y por otra parte, ${blank(d.nombre, 36)}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 18)}, quien en adelante se denominará EL DEUDOR. Entre las Partes se celebra un contrato de prenda abierta de primer grado sin tenencia del acreedor, el cual, de conformidad con el artículo 3 de la Ley 1676 de 2013, surte los efectos de una garantía mobiliaria, y se regirá por las siguientes cláusulas:`)]),
  clause("PRIMERA – OBJETO:", "EL DEUDOR constituye a favor de LA ACREEDORA derecho de prenda abierta sin tenencia del acreedor, para garantizar el cumplimiento de las obligaciones de crédito presentes y futuras, hasta por la suma que se pacte en los documentos correspondientes."),
  clause("SEGUNDA – ESPECIFICACIONES DEL BIEN PRENDADO:", "La prenda recae sobre el siguiente vehículo automotor, de exclusiva propiedad del DEUDOR:"),
  vehTable(d, true),
  clause("TERCERA – TENENCIA E INSPECCIÓN:", "EL DEUDOR conserva la tenencia del vehículo dado en prenda, pero está obligado a permitir a LA ACREEDORA, o a quien ésta designe, la inspección del bien para comprobar su estado y existencia, así como a mantenerlo asegurado y en correcto estado de uso, funcionamiento y conservación. Para efectos de sus obligaciones y responsabilidades sobre el bien, las del DEUDOR son las mismas de un depositario."),
  clause("CUARTA – COBERTURA DEL GRAVAMEN:", "El gravamen prendario garantiza a LA ACREEDORA todas las obligaciones que surjan a su favor y a cargo del DEUDOR, presentes o futuras, incluyendo capital, intereses remuneratorios y moratorios, honorarios, gastos de cobranza y demás accesorios, hasta el monto máximo que se pacte en los documentos de crédito. La prenda se mantendrá vigente mientras existan obligaciones a cargo del DEUDOR, aun cuando éstas se renueven o reestructuren, sin necesidad de constituir una nueva prenda."),
  clause("QUINTA – CRÉDITOS RESPALDADOS:", "Los créditos respaldados podrán constar en pagarés, contratos o cualquier otro documento en el que figure EL DEUDOR como deudor, avalista o codeudor."),
  clause("SEXTA – INSCRIPCIÓN DEL GRAVAMEN:", "La presente prenda se inscribirá ante el organismo de tránsito correspondiente, para su anotación en el Registro Nacional Automotor – RUNT como limitación a la propiedad del vehículo, de conformidad con la Ley 769 de 2002 y las normas que regulan los trámites ante los organismos de tránsito. Lo anterior, sin perjuicio de que LA ACREEDORA pueda inscribir adicionalmente la garantía en el Registro de Garantías Mobiliarias administrado por Confecámaras, para efectos de su oponibilidad, prelación y de la utilización de los mecanismos de ejecución previstos en la Ley 1676 de 2013. Los gastos de inscripción, modificación y levantamiento del gravamen serán de cargo del DEUDOR."),
  clause("SÉPTIMA – VENCIMIENTO ANTICIPADO:", "El incumplimiento del DEUDOR en el pago de las cuotas o de cualquiera de sus obligaciones permitirá a LA ACREEDORA declarar vencida la obligación, hacer exigible en forma inmediata el pago total de la deuda garantizada y ejercer los mecanismos de ejecución de la garantía y las acciones judiciales y extrajudiciales a que haya lugar."),
  clause("OCTAVA – EJECUCIÓN Y PAGO DIRECTO:", "En razón de que la presente prenda surte los efectos de garantía mobiliaria (artículo 3 de la Ley 1676 de 2013), las Partes pactan expresamente el mecanismo de pago directo previsto en el artículo 60 de dicha ley. En consecuencia, ante el incumplimiento del DEUDOR, LA ACREEDORA podrá satisfacer su crédito directamente con el bien prendado, previo avalúo realizado por perito conforme a la ley. Si el valor del bien excede el monto de la obligación garantizada, LA ACREEDORA entregará el saldo al DEUDOR; si fuere inferior, subsistirá la obligación por el saldo insoluto. Lo anterior, sin perjuicio de la ejecución judicial de la garantía, a elección de la acreedora, y del procedimiento de transferencia de la propiedad del vehículo por ejecución de la garantía previsto en el Decreto 1835 de 2015."),
  clause("NOVENA – SEGUROS:", "EL DEUDOR se compromete a mantener vigente el seguro sobre el vehículo objeto de la prenda, cediendo a favor de LA ACREEDORA los derechos derivados de la póliza hasta por el valor de la deuda."),
  clause("DÉCIMA – GASTOS Y HONORARIOS:", "Todos los gastos judiciales, extrajudiciales, de cobranza, seguros, impuestos y demás costos ocasionados por el incumplimiento serán de cargo del DEUDOR."),
  clause("DÉCIMA PRIMERA – CESIÓN:", "EL DEUDOR acepta desde ahora cualquier traspaso, endoso o cesión que LA ACREEDORA o sus causahabientes hicieren de los instrumentos a su cargo, así como de la prenda, con todas las consecuencias que la ley señale, en cuyo caso el nuevo acreedor quedará facultado para ejercer los mismos derechos aquí conferidos."),
  clause("DÉCIMA SEGUNDA – ENAJENACIÓN DEL BIEN:", "El bien dado en prenda podrá ser enajenado por EL DEUDOR, pero sólo se verificará la tradición al adquirente cuando LA ACREEDORA lo autorice o esté cubierto en su totalidad el crédito, debiendo hacerse constar el respectivo hecho en este documento o en notas suscritas por la acreedora."),
  clause("DÉCIMA TERCERA – CLÁUSULA PENAL:", "Si EL DEUDOR incumple cualquiera de las cláusulas pactadas en virtud de este contrato, pagará a LA ACREEDORA la suma de ________________________________________ ($________________) a título de pena pecuniaria, sin exceder los límites del artículo 867 del Código de Comercio y sin perjuicio de las demás acciones legales que correspondan, incluidas las derivadas del artículo 255 de la Ley 599 de 2000 (disposición de bien propio gravado con prenda), que EL DEUDOR manifiesta conocer."),
  clause("DÉCIMA CUARTA – CANCELACIÓN DEL GRAVAMEN:", "Una vez pagada la totalidad de las obligaciones garantizadas, se dará por terminada la garantía, quedando obligada LA ACREEDORA a entregar los documentos necesarios para el levantamiento de la prenda ante el organismo de tránsito y la correspondiente anotación en los registros respectivos."),
  clause("DÉCIMA QUINTA – JURISDICCIÓN:", `Para todos los efectos derivados del presente contrato, las Partes fijan como domicilio contractual la ciudad de ${blank(d.ciudad, 20)}, sin perjuicio de las reglas de competencia previstas en la ley.`),
  para("Para constancia se firma a los ______ días del mes de ______________ de ________, en dos (2) ejemplares de un mismo tenor: uno con destino al organismo de tránsito y otro para el paquete de crédito."),
  firmasDobles(
    [{ text: "LA ACREEDORA", bold: true }, { text: e.nombre, bold: true }, { text: `NIT ${e.nit}` }],
    [{ text: "EL DEUDOR", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }]
  ),
];

const Doc7 = (d: any, e: EmpresaWord) => [
  docTitle("CONTRATO DE MANDATO – PERSONA NATURAL"),
  rich([t(`Entre los suscritos, a saber: ${blank(d.nombre, 36)}, mayor de edad, vecino(a) de esta ciudad, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 18)} expedida en ${blank(d.lugarExpedicion, 18)}, quien para efectos del presente contrato se denominará el MANDANTE; y de otro lado, `), t(e.nombre, true), t(", identificada con NIT "), t(e.nit, true), t(", quien para efectos del presente contrato se denominará el MANDATARIO, hemos acordado suscribir el presente contrato de mandato, dando cumplimiento al artículo 5 de la Resolución 12379 de 2012 del Ministerio de Transporte, compilado en el artículo 5.1.6 de la Resolución 20223040045295 de 2022, el cual se regirá por las normas civiles y comerciales que regulan la materia y por las siguientes cláusulas:")]),
  clause("PRIMERA – OBJETO DEL CONTRATO:", `El MANDATARIO, por cuenta y riesgo del MANDANTE, queda facultado para solicitar, realizar, radicar y retirar los trámites ante el organismo de tránsito de esta ciudad o de otra ciudad, y en general para realizar todas las actuaciones necesarias que se requieran para el perfeccionamiento del trámite solicitado, respecto del vehículo de propiedad del MANDANTE identificado con placa ${blank(d.placa, 14)}. Para tal efecto, el MANDANTE confiere poder especial, amplio y suficiente al MANDATARIO para representarlo ante la autoridad competente.`),
  clause("SEGUNDA – OBLIGACIONES DEL MANDANTE:", "El MANDANTE declara que la información contenida en los documentos que se anexan a la solicitud de trámite es veraz y auténtica, y que será responsable ante la autoridad competente de cualquier irregularidad que los mismos puedan contener."),
  para(`Para constancia se firma en la ciudad de ${blank(d.ciudad, 20)}, a los ______ días del mes de ______________ del año ________.`),
  firmasDobles(
    [{ text: "MANDANTE", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }],
    [{ text: "MANDATARIO", bold: true }, { text: e.nombre, bold: true }, { text: `NIT ${e.nit}` }]
  ),
];

const Doc8 = (d: any, e: EmpresaWord) => [
  docTitle("PODER PARA TRÁMITE DE TRASPASO"),
  para("Señores"),
  new Paragraph({ children: [t("DEPARTAMENTO ADMINISTRATIVO DE TRÁNSITO Y TRANSPORTE", true)] }),
  para("La ciudad"),
  para("Referencia: Poder para trámite de traspaso"),
  rich([t(`Yo, ${blank(d.nombre, 40)}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 18)} expedida en ${blank(d.lugarExpedicion, 18)}, por medio del presente documento otorgo poder especial, amplio y suficiente a `), t(e.nombre, true), t(", o a quien represente sus derechos, para que en mi nombre y representación realice el trámite de traspaso del vehículo automotor que a continuación se describe:")]),
  kvTable([
    ["CLASE", "Motocicleta"],
    ["MARCA", blank(d.marca, 24)],
    ["LÍNEA", blank(d.linea, 24)],
    ["MODELO", blank(d.modelo || d.modeloMoto, 24)],
    ["COLOR", blank(d.color, 24)],
    ["No. MOTOR", blank(d.motor || d.numeroMotor, 24)],
    ["No. CHASIS", blank(d.chasis || d.numeroChasis, 24)],
    ["PLACA", blank(d.placa, 24)],
  ]),
  para("Mi apoderado está facultado para realizar todos los actos, gestiones y diligencias que sean necesarios para el perfeccionamiento del contrato de compraventa. Por lo anterior, solicito tener a la persona anteriormente mencionada como mi apoderado para los efectos descritos en este memorial."),
  para("Atentamente,"),
  firmasDobles(
    [{ text: "PODERDANTE", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }],
    [{ text: "ACEPTO – APODERADO", bold: true }, { text: e.nombre, bold: true }, { text: `NIT ${e.nit}` }]
  ),
];

const Doc9 = (d: any, e: EmpresaWord) => [
  docTitle("AUTORIZACIÓN DE DESEMBOLSO DEL CRÉDITO"),
  kvTable([
    ["Fecha de diligenciamiento", blank(d.fecha, 24)],
    ["Número de solicitud", blank(d.codigo, 24)],
    ["Tipo de documento de identidad", "Cédula de ciudadanía"],
    ["Número de documento de identidad", blank(d.cc, 24)],
    ["Nombres y apellidos del solicitante", blank(d.nombre, 30)],
  ]),
  rich([t("Autorizo a "), t(e.nombre, true), t(" para que el desembolso en pesos, producto del crédito otorgado, sea consignado a la sociedad comercial identificada de la siguiente forma:")]),
  kvTable([
    ["Código de desembolso", blank("", 24)],
    ["Nombre del beneficiario", e.nombre],
    ["No. del documento de identidad", e.nit],
    ["Banco", "BANCOLOMBIA"],
    ["Tipo de cuenta", "CUENTA DE AHORROS"],
    ["Número de cuenta", blank("", 24)],
    ["Valor", `$ ${blank(d.valorMoto, 20)}`],
  ]),
  ...firmaLines([
    { text: "Firma del solicitante del crédito", bold: true },
    { text: `Nombre: ${blank(d.nombre, 40)}` },
    { text: `C.C. No. ${blank(d.cc, 18)}` },
  ]),
];

const Doc10 = (d: any, e: EmpresaWord) => [
  docTitle("AUTORIZACIÓN DE RETENCIÓN Y DACIÓN EN PAGO DEL VEHÍCULO AUTOMOTOR"),
  rich([t(`En la ciudad de ${blank(d.ciudad, 20)}, a los ______ días del mes de ______________ de ________, entre `), t(e.nombre, true), t(", identificada con NIT "), t(e.nit, true), t(`, quien en adelante se denominará EL ACREEDOR, y ${blank(d.nombre, 36)}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${blank(d.cc, 18)}, quien en adelante se denominará EL DEUDOR, se suscribe la presente autorización respecto del siguiente vehículo:`)]),
  vehTable(d),
  clause("PRIMERA – AUTORIZACIÓN DE RETENCIÓN:", "EL DEUDOR, actuando libre y voluntariamente, autoriza de manera expresa e irrevocable al ACREEDOR para que, en caso de incumplimiento (mora) en el pago de dos (2) o más cuotas de la obligación crediticia, proceda a la inmovilización y retención del vehículo descrito. EL DEUDOR conoce que el vehículo no será devuelto hasta tanto no sea cancelado el valor total vencido con sus respectivos intereses y costos adicionales por inmovilización, dentro de un plazo no mayor de cuarenta (40) días contados a partir de la fecha de retención. Una vez recuperada la motocicleta si se vuelve a presentar el incumplimiento de una cuota, se da la inmovilización de la motocicleta, si se presenta una 3ra inmovilización, se deberá cancelar la totalidad de la obligación para poder devolver la moto en un plazo máximo de 30 días."),
  clause("SEGUNDA – DACIÓN EN PAGO:", "Si transcurrido el plazo de cuarenta (40) días desde la retención del vehículo EL DEUDOR no normaliza la obligación, la cual a esa fecha comprenderá capital, intereses de plazo, intereses de mora, honorarios y gastos de cobranza y notificaciones, autoriza de manera irrevocable al ACREEDOR a disponer del vehículo, previo avalúo realizado por perito conforme al mecanismo de pago directo pactado en el contrato de prenda sin tenencia (artículo 60 de la Ley 1676 de 2013). El valor del avalúo se imputará a título de dación para el pago parcial o total de la obligación. Si el valor del vehículo excede el monto de la deuda, EL ACREEDOR entregará el saldo al DEUDOR; si no alcanza a cubrirla, EL DEUDOR se obliga a cancelar al ACREEDOR el saldo faltante."),
  clause("TERCERA – ESTADO DEL BIEN Y ENTREGA MATERIAL:", "EL ACREEDOR acepta la dación en pago sobre el vehículo descrito, el cual se recibe en el estado físico y mecánico en que se encuentre, sin que ello implique saneamiento por evicción o vicios redhibitorios más allá de lo contemplado por la ley. Perfeccionada la dación, EL DEUDOR entregará los documentos necesarios para realizar el traspaso ante la autoridad de tránsito correspondiente."),
  clause("CUARTA – GASTOS:", "Todos los gastos notariales, de traspaso, impuestos y demás costos que genere la dación en pago correrán por cuenta del DEUDOR, salvo pacto en contrario."),
  rich([t("QUINTA – PAGO: ", true), t(`El pago de la obligación debe ser realizado únicamente en la caja de los puntos de venta del ACREEDOR o mediante consignación en la cuenta de ahorros de BANCOLOMBIA a nombre de `), t(e.nombre, true), t(". El ACREEDOR no se responsabiliza por dineros entregados a terceras personas. El soporte de consignación deberá entregarse en el almacén correspondiente o enviarse al correo electrónico: _________________________________.")]),
  para("Para constancia se firma a los ______ días del mes de ______________ de ________."),
  firmasDobles(
    [{ text: "EL DEUDOR", bold: true }, { text: `Nombre: ${blank(d.nombre, 28)}` }, { text: `C.C. No. ${blank(d.cc, 18)}` }],
    [{ text: "EL ACREEDOR", bold: true }, { text: e.nombre, bold: true }, { text: `NIT ${e.nit}` }]
  ),
];

const Doc11 = (d: any) => [
  docTitle("ANEXO TÉCNICO – IMPRONTAS DEL VEHÍCULO"),
  vehTable(d),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, children: [t("IMPRONTA DEL MOTOR", true)] }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" })] })] })],
  }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, children: [t("IMPRONTA DEL CHASIS", true)] }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" })] })] })],
  }),
];

const DOCS: Array<(d: any, e: EmpresaWord) => any[]> = [
  Doc1, Doc2, Doc3, Doc4, Doc5, Doc6, Doc7, Doc8, Doc9, Doc10, Doc11,
];

/** Construye el documento Word completo (11 secciones). */
export const buildPaqueteCreditoDoc = (
  data: any,
  empresa: EmpresaWord,
  logo?: { data: ArrayBuffer; type: "png" | "jpg" }
): Document => {
  const header = buildHeader(
    empresa,
    { codigo: data.codigo, fecha: data.fecha, ciudad: data.ciudad ?? empresa.ciudad },
    logo
  );

  const sections: ISectionOptions[] = DOCS.map((build, i) => ({
    properties: {
      page: { margin: { top: 1700, bottom: 900, left: 900, right: 900 } },
    },
    headers: { default: header },
    footers: { default: buildFooter(i + 1) },
    children: build(data, empresa),
  }));

  return new Document({
    creator: "MotosParaTodos",
    title: `Paquete de Crédito - ${empresa.nombre}`,
    sections,
  });
};

/** Genera el Blob .docx listo para descargar. */
export const generarPaqueteCreditoWord = async (
  data: any,
  empresa: EmpresaWord,
  logo?: { data: ArrayBuffer; type: "png" | "jpg" }
): Promise<Blob> => {
  const doc = buildPaqueteCreditoDoc(data, empresa, logo);
  return await Packer.toBlob(doc);
};
