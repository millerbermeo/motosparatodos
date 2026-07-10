// SolicitudCreditoWord.ts
// Genera el .docx "SOLICITUD DE CRÉDITO" (deudor + codeudor + firmas), 2 páginas.
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
  ImageRun,
  VerticalAlign,
} from "docx";

const FONT = "Calibri";
const SZ = 18; // 9pt
const BLUE = "2E74B5";
const GRAY = "F0F0F0";

const blank = (v: any, n = 20): string =>
  v != null && String(v).trim() !== "" ? String(v) : "_".repeat(n);

export interface PersonaInfoWord {
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaExpedicion?: string;
  lugarExpedicion?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  nivelEstudios?: string;
  ciudadResidencia?: string;
  barrioResidencia?: string;
  direccionResidencia?: string;
  telefonoFijo?: string;
  celular?: string;
  email?: string;
  estadoCivil?: string;
  personasACargo?: string | number;
  tipoVivienda?: string;
  fincaRaiz?: string;
}

export interface LaboralInfoWord {
  empresa?: string;
  direccionEmpleador?: string;
  telefonoEmpleador?: string;
  cargo?: string;
  tipoContrato?: string;
  tiempoServicio?: string;
  salario?: string | number;
}

export interface ReferenciaWord {
  nombre?: string;
  direccion?: string;
  tipo?: string;
  telefono?: string;
}

export interface SolicitudCreditoWordData {
  // ---- Información de la solicitud ----
  estado?: string;
  creada?: string;
  agencia?: string;
  registradaPor?: string;

  // ---- Información del crédito ----
  motocicleta?: string;
  valorMotocicleta?: string;
  numeroCuotas?: string | number;
  cuotaInicial?: string;
  fechaPago?: string;
  valorCuota?: string;
  numeroChasis?: string;
  numeroMotor?: string;
  placa?: string;
  fechaEntrega?: string;

  // ---- Deudor ----
  deudorNombreCompleto?: string;
  deudorCc?: string;
  deudorPersonal?: PersonaInfoWord;
  deudorLaboral?: LaboralInfoWord;
  deudorReferencias?: ReferenciaWord[];

  // ---- Codeudor (opcional) ----
  codeudorNombreCompleto?: string;
  codeudorCc?: string;
  codeudorPersonal?: PersonaInfoWord;
  codeudorLaboral?: LaboralInfoWord;
  codeudorReferencias?: ReferenciaWord[];

  // ---- Empresa (para el texto de declaración) ----
  nombreEmpresa?: string;
}

/* ===== Celdas ===== */
const cellLabel = (text: string) =>
  new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { fill: GRAY, color: "auto", type: "clear" as any },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({ children: [new TextRun({ text, bold: !!text, font: FONT, size: SZ })] }),
    ],
  });

const cellValue = (text: string) =>
  new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: SZ })] })],
  });

/* ===== Tabla de pares label/valor a 2 columnas (4 celdas por fila) ===== */
const pairTable = (rows: [string, string, string, string][]) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [cellLabel(r[0]), cellValue(r[1]), cellLabel(r[2]), cellValue(r[3])],
        })
    ),
  });

// Combina dos columnas de [label, value] de distinto largo en filas de 4 celdas,
// rellenando con celdas vacías cuando un lado se queda sin campos.
const zipRows = (
  left: [string, string][],
  right: [string, string][]
): [string, string, string, string][] => {
  const max = Math.max(left.length, right.length);
  const rows: [string, string, string, string][] = [];
  for (let i = 0; i < max; i++) {
    const l = left[i] ?? ["", ""];
    const r = right[i] ?? ["", ""];
    rows.push([l[0], l[0] ? blank(l[1]) : "", r[0], r[0] ? blank(r[1]) : ""]);
  }
  return rows;
};

/* ===== Tabla de referencias (encabezado + filas de datos) ===== */
const referenciasTable = (refs: ReferenciaWord[] = []) => {
  const headerCell = (text: string) =>
    new TableCell({
      width: { size: 25, type: WidthType.PERCENTAGE },
      shading: { fill: GRAY, color: "auto", type: "clear" as any },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: FONT, size: SZ })] })],
    });
  const dataCell = (text: string) =>
    new TableCell({
      width: { size: 25, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: SZ })] })],
    });

  const filas = [...refs];
  while (filas.length < 3) filas.push({});

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          headerCell("Nombres y apellidos"),
          headerCell("Dirección"),
          headerCell("Tipo de referencia"),
          headerCell("Número telefónico"),
        ],
      }),
      ...filas.map(
        (r) =>
          new TableRow({
            children: [
              dataCell(r.nombre ?? ""),
              dataCell(r.direccion ?? ""),
              dataCell(r.tipo ?? ""),
              dataCell(r.telefono ?? ""),
            ],
          })
      ),
    ],
  });
};

/* ===== Títulos ===== */
const docTitle = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 32, color: BLUE })],
  });

const sectionTitle = (text: string) =>
  new Paragraph({
    spacing: { before: 240, after: 90 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 20 })],
  });

const para = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 90 },
    children: [new TextRun({ text, font: FONT, size: SZ })],
  });

/* ===== Sección de una persona (personal + laboral + referencias) ===== */
const seccionPersona = (
  titulo: "DEUDOR" | "CODEUDOR",
  p: PersonaInfoWord = {},
  lab: LaboralInfoWord = {},
  refs: ReferenciaWord[] = []
) => {
  const personalIzq: [string, string][] = [
    ["Tipo de documento", p.tipoDocumento ?? ""],
    ["Número de documento", p.numeroDocumento ?? ""],
    ["Fecha de expedición", p.fechaExpedicion ?? ""],
    ["Lugar de expedición", p.lugarExpedicion ?? ""],
    ["Nombres", p.nombres ?? ""],
    ["Apellidos", p.apellidos ?? ""],
    ["Fecha de nacimiento", p.fechaNacimiento ?? ""],
    ["Nivel de estudios", p.nivelEstudios ?? ""],
  ];
  const personalDer: [string, string][] = [
    ["Ciudad de residencia", p.ciudadResidencia ?? ""],
    ["Barrio de residencia", p.barrioResidencia ?? ""],
    ["Dirección de residencia", p.direccionResidencia ?? ""],
    ["Teléfono fijo", p.telefonoFijo ?? ""],
    ["Número de celular", p.celular ?? ""],
    ["Email", p.email ?? ""],
    ["Estado civil", p.estadoCivil ?? ""],
    ["Personas a cargo", p.personasACargo != null ? String(p.personasACargo) : ""],
    ["Tipo de vivienda", p.tipoVivienda ?? ""],
    ["Finca raíz", p.fincaRaiz ?? ""],
  ];

  const laboralIzq: [string, string][] = [
    ["Empresa donde labora", lab.empresa ?? ""],
    ["Dirección empleador", lab.direccionEmpleador ?? ""],
    ["Teléfono del empleador", lab.telefonoEmpleador ?? ""],
    ["Cargo", lab.cargo ?? ""],
  ];
  const laboralDer: [string, string][] = [
    ["Tipo de contrato", lab.tipoContrato ?? ""],
    ["Tiempo de servicio", lab.tiempoServicio ?? ""],
    ["Salario", lab.salario != null ? String(lab.salario) : ""],
  ];

  return [
    sectionTitle(`INFORMACIÓN PERSONAL DEL ${titulo}`),
    pairTable(zipRows(personalIzq, personalDer)),

    sectionTitle(`INFORMACIÓN LABORAL DEL ${titulo}`),
    pairTable(zipRows(laboralIzq, laboralDer)),

    sectionTitle(`REFERENCIAS DEL ${titulo}`),
    referenciasTable(refs),
  ];
};

/* ===== Firmas ===== */
const firmasTable = (d: SolicitudCreditoWordData) => {
  const cell = (lines: string[]) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: lines.map(
        (l) => new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: l, font: FONT, size: SZ })] })
      ),
    });

  const headerCell = (text: string) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      shading: { fill: GRAY, color: "auto", type: "clear" as any },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: FONT, size: SZ })] })],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("DEUDOR"), headerCell("CODEUDOR")] }),
      new TableRow({
        children: [
          cell([
            "Firma: __________________",
            `Nombre: ${blank(d.deudorNombreCompleto, 28)}`,
            `C.C.: ${blank(d.deudorCc, 18)}`,
            "Huella índice derecho: __________________",
          ]),
          cell([
            "Firma: __________________",
            `Nombre: ${blank(d.codeudorNombreCompleto, 28)}`,
            `C.C.: ${blank(d.codeudorCc, 18)}`,
            "Huella índice derecho: __________________",
          ]),
        ],
      }),
    ],
  });
};

/* ===== Documento completo ===== */
const buildSolicitudCreditoDoc = (
  d: SolicitudCreditoWordData,
  logo?: { data: ArrayBuffer; type: "png" | "jpg" }
) => {
  const logoBlock = logo
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new ImageRun({ type: logo.type, data: logo.data, transformation: { width: 90, height: 70 } }),
          ],
        }),
      ]
    : [];

  const empresaNombre = d.nombreEmpresa || "[NOMBRE DE LA EMPRESA]";

  return new Document({
    sections: [
      {
        properties: {},
        children: [
          docTitle("SOLICITUD DE CRÉDITO"),
          ...logoBlock,

          sectionTitle("INFORMACIÓN DE LA SOLICITUD"),
          pairTable([
            ["Estado", blank(d.estado), "Creada", blank(d.creada)],
            ["Agencia", blank(d.agencia), "Registrada por", blank(d.registradaPor)],
          ]),

          sectionTitle("INFORMACIÓN DEL CRÉDITO"),
          pairTable([
            ["Motocicleta", blank(d.motocicleta, 26), "Valor de motocicleta", blank(d.valorMotocicleta)],
            ["Número de cuotas", blank(d.numeroCuotas != null ? String(d.numeroCuotas) : ""), "Cuota inicial", blank(d.cuotaInicial)],
            ["Fecha de pago", blank(d.fechaPago), "Valor cuota", blank(d.valorCuota)],
            ["Número de chasis", blank(d.numeroChasis), "Número de motor", blank(d.numeroMotor)],
            ["Placa", blank(d.placa), "Fecha de entrega", blank(d.fechaEntrega)],
          ]),

          ...seccionPersona("DEUDOR", d.deudorPersonal, d.deudorLaboral, d.deudorReferencias),

          // Página 2
          new Paragraph({ pageBreakBefore: true, children: [] }),
          ...seccionPersona("CODEUDOR", d.codeudorPersonal, d.codeudorLaboral, d.codeudorReferencias),

          sectionTitle("DECLARACIONES Y AUTORIZACIONES"),
          para(
            `Declaro que la información suministrada es veraz y autorizo a ${empresaNombre} para verificarla, consultar, reportar y actualizar mi información financiera, comercial y crediticia ante operadores de información y centrales de riesgo, así como tratar mis datos personales conforme a la Ley 1266 de 2008, la Ley 1581 de 2012 y el Decreto 1074 de 2015.`
          ),

          sectionTitle("FIRMAS"),
          firmasTable(d),
        ],
      },
    ],
  });
};

/** Genera el Blob .docx listo para descargar. */
export const generarSolicitudCreditoWord = async (
  data: SolicitudCreditoWordData,
  logo?: { data: ArrayBuffer; type: "png" | "jpg" }
): Promise<Blob> => {
  const doc = buildSolicitudCreditoDoc(data, logo);
  return await Packer.toBlob(doc);
};
