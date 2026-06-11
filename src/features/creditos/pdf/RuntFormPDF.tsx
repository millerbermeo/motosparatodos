import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// ══════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════

export type TramiteRunt =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

export type CombustibleRunt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ClaseVehiculoRunt =
  | 'AUTOMOVIL' | 'BUS' | 'BUSETA' | 'CAMION' | 'CAMIONETA'
  | 'CAMPERO' | 'MICROBUS' | 'TRACTOCAMION' | 'MOTOCICLETA'
  | 'MOTOCARRO' | 'MOTOTRICICLO' | 'CUATRIMOTO' | 'VOLQUETA' | 'OTRO';

export type TipoDocRunt =
  | 'CC' | 'NIT' | 'NN' | 'PASAPORTE'
  | 'CEXTRANJ' | 'TIDENTI' | 'NUIP' | 'CDIPLOMATICO';

export type TipoServicioRunt = 1 | 2 | 3 | 4 | 5 | 6;
export type ImportacionTipoRunt = 1 | 2 | 3 | 4 | 5 | 6;

export interface RuntFormData {
  // ── 1. Organismo de tránsito ──
  organismoNombre?: string;
  organismoCiudad?: string;
  organismoCodigo?: string;
  fechaDia?: string;
  fechaMes?: string;
  fechaAnio?: string;

  // ── 2. Placa ──
  placaLetras?: string;
  placaNumeros?: string;

  // ── 3. Trámite solicitado (1–18) ──
  tramite?: TramiteRunt;

  // ── 5. Marca | 6. Línea | 7. Combustible ──
  marca?: string;
  linea?: string;
  combustible?: CombustibleRunt;

  // ── 8–14 ──
  colores?: string;
  modelo?: string;
  cilindrada?: string;
  capacidad?: string;
  blindaje?: boolean;
  resolucionBlindaje?: string;
  fechaResolucionBlindaje?: string;
  desmonteBlindaje?: boolean;
  resolucionDesmonte?: string;
  fechaResolucionDesmonte?: string;
  potenciaHP?: string;

  // ── 4. Clase de vehículo ──
  claseVehiculo?: ClaseVehiculoRunt;

  // ── 15. Carrocería ──
  carroceriaTipo?: string;
  carroceriaCodigo?: string;

  // ── 16. Identificación interna ──
  numeroMotor?: string;
  motorRegrabado?: boolean;
  numeroChasis?: string;
  chasisRegrabado?: boolean;
  numeroSerie?: string;
  serieRegrabado?: boolean;

  // ── 17. Importación o remate ──
  importacionORemate?: boolean;
  importacionTipo?: ImportacionTipoRunt;
  importacionNoDocumento?: string;
  importacionFechaDia?: string;
  importacionFechaMes?: string;
  importacionFechaAnio?: string;
  vinVehiculo?: string;

  // ── 18. Tipo de servicio ──
  tipoServicio?: TipoServicioRunt;

  // ── 19. Empresa vinculadora ──
  empresaNombre?: string;
  empresaNIT?: string;

  // ── 20. Datos de alerta ──
  alerta?: 1 | 2 | 3 | 4 | 5;

  // ── 21. Datos del propietario ──
  propPrimerApellido?: string;
  propSegundoApellido?: string;
  propNombres?: string;
  propTipoDoc?: TipoDocRunt;
  propNumeroDoc?: string;
  propDireccion?: string;
  propCiudad?: string;
  propTelefono?: string;

  // ── 22. Datos del comprador (traspaso) ──
  comprPrimerApellido?: string;
  comprSegundoApellido?: string;
  comprNombres?: string;
  comprTipoDoc?: TipoDocRunt;
  comprNumeroDoc?: string;
  comprDireccion?: string;
  comprCiudad?: string;
  comprTelefono?: string;

  // ── 23. Observaciones ──
  observaciones?: string;
  observacionesTraspaso?: string;

  // ── Logos (URL o base64) ──
  logoMinTransporte?: string;
  logoHunt?: string;
  logoGobierno?: string;
}

// ══════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════

const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    padding: 7,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row' },
  col: { flexDirection: 'column' },

  // Borders
  bAll: { border: '0.5pt solid #000' },
  bR: { borderRight: '0.5pt solid #000' },
  bB: { borderBottom: '0.5pt solid #000' },
  bT: { borderTop: '0.5pt solid #000' },
  bL: { borderLeft: '0.5pt solid #000' },

  // Section header bar
  secBar: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 5.5,
    backgroundColor: '#e0e0e0',
    padding: '1 2',
    borderBottom: '0.5pt solid #000',
  },

  // Field wrapper
  fWrap: { padding: '1 2', flexDirection: 'column' },
  fLabel: { fontSize: 5, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 1 },
  fVal: { fontSize: 7 },

  // Checkbox
  cbRow: { flexDirection: 'row', alignItems: 'center', marginRight: 4, marginBottom: 1 },
  cbBox: {
    width: 6,
    height: 6,
    border: '0.5pt solid #000',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 1.5,
  },
  cbFill: { backgroundColor: '#000' },
  cbX: { fontSize: 4, color: '#fff', fontFamily: 'Helvetica-Bold' },
  cbLbl: { fontSize: 5 },
  cbNum: { fontSize: 5, fontFamily: 'Helvetica-Bold', marginRight: 1 },

  // Tramite item
  tramItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '1.5 2',
    borderRight: '0.5pt solid #000',
    minHeight: 15,
  },
  tramLbl: { fontSize: 5, lineHeight: 1.3 },
  tramNum: { fontSize: 5, fontFamily: 'Helvetica-Bold', marginRight: 1, marginTop: 0.5 },

  // Tipo documento cell
  tdCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '0.5pt solid #000',
    padding: '1 1',
  },

  // Signature space
  signLine: { borderBottom: '0.5pt solid #000', minHeight: 15, marginTop: 2 },

  // Logo placeholder
  logoPh: {
    border: '0.5pt dashed #bbb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginBottom: 2,
  },
  logoPhTxt: { fontSize: 4, color: '#bbb', textAlign: 'center' },
});

// ══════════════════════════════════════════════════════
// HELPER COMPONENTS
// ══════════════════════════════════════════════════════

const CB: React.FC<{
  on?: boolean;
  label?: string;
  num?: number | string;
}> = ({ on, label, num }) => (
  <View style={S.cbRow}>
    <View style={[S.cbBox, on ? S.cbFill : {}]}>
      {on && <Text style={S.cbX}>X</Text>}
    </View>
    {num !== undefined && <Text style={S.cbNum}>{num}</Text>}
    {label && <Text style={S.cbLbl}>{label}</Text>}
  </View>
);

const SiNo: React.FC<{ value?: boolean }> = ({ value }) => (
  <View style={[S.row, { alignItems: 'center' }]}>
    <CB on={value === true} label="SI" />
    <CB on={value === false} label="NO" />
  </View>
);

const Field: React.FC<{
  label: string;
  value?: string;
  flex?: number;
  width?: number;
  minH?: number;
  noBorderR?: boolean;
}> = ({ label, value, flex, width, minH = 10, noBorderR }) => (
  <View style={[
    S.fWrap, S.col,
    !noBorderR ? S.bR : {},
    flex !== undefined ? { flex } : {},
    width !== undefined ? { width } : {},
  ]}>
    <Text style={S.fLabel}>{label}</Text>
    <Text style={[S.fVal, { minHeight: minH }]}>{value ?? ''}</Text>
  </View>
);

const TramItem: React.FC<{
  num: number;
  label: string;
  selected?: boolean;
  last?: boolean;
}> = ({ num, label, selected, last }) => (
  <View style={[S.tramItem, last ? { borderRight: 0 } : {}]}>
    <View style={[S.cbBox, selected ? S.cbFill : {}, { marginTop: 0.5 }]}>
      {selected && <Text style={S.cbX}>X</Text>}
    </View>
    <Text style={S.tramLbl}>
      <Text style={S.tramNum}>{num} </Text>
      {label}
    </Text>
  </View>
);

const TIPO_DOC_ITEMS: { key: TipoDocRunt; label: string; letter: string }[] = [
  { key: 'CC',          label: 'C.C',          letter: 'C' },
  { key: 'NIT',         label: 'NIT',           letter: 'N' },
  { key: 'NN',          label: 'N.N',           letter: 'X' },
  { key: 'PASAPORTE',   label: 'PASAPORTE',     letter: 'P' },
  { key: 'CEXTRANJ',    label: 'C.EXTRANJ.',    letter: 'E' },
  { key: 'TIDENTI',     label: 'T.IDENTI.',     letter: 'T' },
  { key: 'NUIP',        label: 'NUIP',          letter: 'U' },
  { key: 'CDIPLOMATICO', label: 'C.DIPLOMATICO', letter: 'D' },
];

const TipoDocRow: React.FC<{ selected?: TipoDocRunt }> = ({ selected }) => (
  <View style={[S.row, S.bT]}>
    {TIPO_DOC_ITEMS.map((d, i) => (
      <View key={d.key} style={[S.tdCell, i === TIPO_DOC_ITEMS.length - 1 ? { borderRight: 0 } : {}]}>
        <CB on={selected === d.key} />
        <Text style={[S.cbLbl, { textAlign: 'center' }]}>{d.label}</Text>
      </View>
    ))}
  </View>
);

const TipoDocLetters: React.FC<{ selected?: TipoDocRunt }> = ({ selected }) => (
  <View style={[S.row, S.bT]}>
    {TIPO_DOC_ITEMS.map((d, i) => {
      const active = selected === d.key;
      return (
        <View
          key={d.key}
          style={[
            S.tdCell,
            i === TIPO_DOC_ITEMS.length - 1 ? { borderRight: 0 } : {},
            { height: 11 },
            active ? { backgroundColor: '#000' } : {},
          ]}
        >
          <Text style={[S.cbLbl, { fontFamily: 'Helvetica-Bold', color: active ? '#fff' : '#000', textAlign: 'center' }]}>
            {d.letter}
          </Text>
        </View>
      );
    })}
  </View>
);

// ══════════════════════════════════════════════════════
// MAIN DOCUMENT
// ══════════════════════════════════════════════════════

export const RuntFormPDF: React.FC<{ data: RuntFormData }> = ({ data }) => {
  const t = data.tramite;
  const cv = data.claseVehiculo;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>

        {/* ════════ HEADER ════════ */}
        <View style={[S.row, S.bAll, { marginBottom: 2 }]}>

          {/* Logos */}
          <View style={[S.col, { width: 58, alignItems: 'center', justifyContent: 'center', padding: 3, borderRight: '0.5pt solid #000' }]}>
            <View style={[S.logoPh, { width: 50, height: 24 }]}>
              <Text style={S.logoPhTxt}>LOGO{'\n'}MIN. TRANSPORTE</Text>
            </View>
            <View style={[S.logoPh, { width: 50, height: 16 }]}>
              <Text style={S.logoPhTxt}>LOGO HUNT</Text>
            </View>
            <View style={[S.logoPh, { width: 50, height: 14 }]}>
              <Text style={S.logoPhTxt}>LOGO GOBIERNO</Text>
            </View>
          </View>

          {/* Title */}
          <View style={[S.col, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 4, borderRight: '0.5pt solid #000' }]}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center', marginBottom: 3 }}>
              MINISTERIO DE TRANSPORTE
            </Text>
            <Text style={{ fontSize: 7, textAlign: 'center', lineHeight: 1.4 }}>
              FORMULARIO DE SOLICITUD DE{'\n'}TRÁMITES DEL REGISTRO NACIONAL{'\n'}AUTOMOTOR
            </Text>
          </View>

          {/* 1. Organismo de tránsito */}
          <View style={[S.col, { width: 210, borderRight: '0.5pt solid #000' }]}>
            <Text style={S.secBar}>1. ORGANISMO DE TRÁNSITO</Text>
            <View style={[S.fWrap]}>
              <Text style={S.fLabel}>NOMBRE</Text>
              <Text style={[S.fVal, { minHeight: 9 }]}>{data.organismoNombre ?? ''}</Text>
            </View>
            <View style={[S.row, S.bT]}>
              <View style={[S.fWrap, { flex: 2, borderRight: '0.5pt solid #000' }]}>
                <Text style={S.fLabel}>CIUDAD</Text>
                <Text style={[S.fVal, { minHeight: 9 }]}>{data.organismoCiudad ?? ''}</Text>
              </View>
              <View style={[S.fWrap, { flex: 1, borderRight: '0.5pt solid #000' }]}>
                <Text style={S.fLabel}>CÓDIGO</Text>
                <Text style={[S.fVal, { minHeight: 9 }]}>{data.organismoCodigo ?? ''}</Text>
              </View>
              <View style={[S.fWrap, { flex: 2 }]}>
                <Text style={S.fLabel}>FECHA DE TRÁMITE</Text>
                <View style={[S.row, { marginTop: 1 }]}>
                  <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingRight: 1 }}>
                    <Text style={S.fLabel}>DÍA</Text>
                    <Text style={[S.fVal, { minHeight: 8 }]}>{data.fechaDia ?? ''}</Text>
                  </View>
                  <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingHorizontal: 1 }}>
                    <Text style={S.fLabel}>MES</Text>
                    <Text style={[S.fVal, { minHeight: 8 }]}>{data.fechaMes ?? ''}</Text>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 1 }}>
                    <Text style={S.fLabel}>AÑO</Text>
                    <Text style={[S.fVal, { minHeight: 8 }]}>{data.fechaAnio ?? ''}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 2. Placa */}
          <View style={[S.col, { width: 90 }]}>
            <Text style={S.secBar}>2. PLACA</Text>
            <View style={[S.row, { flex: 1 }]}>
              <View style={[S.fWrap, { flex: 1, borderRight: '0.5pt solid #000' }]}>
                <Text style={S.fLabel}>LETRAS</Text>
                <Text style={[S.fVal, { minHeight: 14, textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 10 }]}>
                  {data.placaLetras ?? ''}
                </Text>
              </View>
              <View style={[S.fWrap, { flex: 1 }]}>
                <Text style={S.fLabel}>NÚMEROS</Text>
                <Text style={[S.fVal, { minHeight: 14, textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 10 }]}>
                  {data.placaNumeros ?? ''}
                </Text>
              </View>
            </View>
          </View>

        </View>
        {/* /HEADER */}

        {/* ════════ TRÁMITE + MARCA/LÍNEA/COMBUSTIBLE ════════ */}
        <View style={[S.bAll, { marginBottom: 2 }]}>
          <View style={[S.row]}>

            {/* Sección 3 label */}
            <View style={[S.col, { width: 18, borderRight: '0.5pt solid #000', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 5, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
                3.{'\n'}TRÁM.{'\n'}SOLIC.
              </Text>
            </View>

            {/* Grid de trámites */}
            <View style={[S.col, { flex: 1 }, S.bR]}>
              <View style={[S.row, S.bB]}>
                <TramItem num={1} label="MATRICULA/REGISTRO" selected={t === 1} />
                <TramItem num={2} label="TRASPASO" selected={t === 2} />
                <TramItem num={3} label="TRASLADO MATRICULA/REGISTRO" selected={t === 3} />
                <TramItem num={4} label="RADICADO MATRICULA/REGISTRO" selected={t === 4} />
                <TramItem num={5} label="CAMBIO DE COLOR" selected={t === 5} />
                <TramItem num={6} label="CAMBIO DE SERVICIO" selected={t === 6} last />
              </View>
              <View style={[S.row, S.bB]}>
                <TramItem num={7} label="REGRABAR MOTOR" selected={t === 7} />
                <TramItem num={8} label="REGRABAR CHASIS" selected={t === 8} />
                <TramItem num={9} label="TRANSFORMACIÓN" selected={t === 9} />
                <TramItem num={10} label="DUPLICADO LICENCIA TRÁNSITO" selected={t === 10} />
                <TramItem num={11} label="INSCRIPC. PRENDA" selected={t === 11} />
                <TramItem num={12} label="LEVANTA. PRENDA" selected={t === 12} last />
              </View>
              <View style={[S.row]}>
                <TramItem num={13} label="CANCELACIÓN MATRICULA/REGISTRO" selected={t === 13} />
                <TramItem num={14} label="CAMBIO DE PLACAS" selected={t === 14} />
                <TramItem num={15} label="DUPLICADO DE PLACAS" selected={t === 15} />
                <TramItem num={16} label="REMATRÍCULA" selected={t === 16} />
                <TramItem num={17} label="CAMBIO DE CARROCERÍA" selected={t === 17} />
                <TramItem num={18} label="OTROS" selected={t === 18} last />
              </View>
            </View>

            {/* 5. Marca + 6. Línea */}
            <View style={[S.col, { width: 100 }, S.bR]}>
              <View style={[S.fWrap, S.bB]}>
                <Text style={S.fLabel}>5. MARCA</Text>
                <Text style={[S.fVal, { minHeight: 14 }]}>{data.marca ?? ''}</Text>
              </View>
              <View style={[S.fWrap]}>
                <Text style={S.fLabel}>6. LÍNEA</Text>
                <Text style={[S.fVal, { minHeight: 14 }]}>{data.linea ?? ''}</Text>
              </View>
            </View>

            {/* 7. Combustible */}
            <View style={[S.col, { width: 120 }]}>
              <Text style={S.secBar}>7. COMBUSTIBLE</Text>
              <View style={[S.row, S.bB, { padding: '2 2', flexWrap: 'wrap' }]}>
                <CB on={data.combustible === 1} num={1} label="GASOLINA" />
                <CB on={data.combustible === 2} num={2} label="DIESEL" />
                <CB on={data.combustible === 3} num={3} label="GAS" />
                <CB on={data.combustible === 4} num={4} label="MIXTO" />
              </View>
              <View style={[S.row, { padding: '2 2', flexWrap: 'wrap' }]}>
                <CB on={data.combustible === 5} num={5} label="ELÉCTRICO" />
                <CB on={data.combustible === 6} num={6} label="HIDRÓGENO" />
                <CB on={data.combustible === 7} num={7} label="ETANOL" />
                <CB on={data.combustible === 8} num={8} label="BIODIESEL" />
              </View>
            </View>
          </View>

          {/* Fila: 8–14 */}
          <View style={[S.row, S.bT]}>
            <Field label="8. COLORES"       value={data.colores}    flex={3} minH={11} />
            <Field label="9. MODELO"        value={data.modelo}     flex={2} minH={11} />
            <Field label="10. CILINDRADA"   value={data.cilindrada} flex={2} minH={11} />
            <Field label="11. CAPACIDAD Kg/Psj" value={data.capacidad} flex={2} minH={11} />

            {/* 12. Blindaje */}
            <View style={[S.fWrap, S.col, S.bR, { flex: 3 }]}>
              <View style={[S.row, { alignItems: 'center', marginBottom: 1 }]}>
                <Text style={[S.fLabel, { marginRight: 3 }]}>12. BLINDAJE</Text>
                <SiNo value={data.blindaje} />
              </View>
              <View style={[S.row]}>
                <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingRight: 2 }}>
                  <Text style={S.fLabel}>Resolución No</Text>
                  <Text style={[S.fVal, { minHeight: 6 }]}>{data.resolucionBlindaje ?? ''}</Text>
                </View>
                <View style={{ flex: 1, paddingLeft: 2 }}>
                  <Text style={S.fLabel}>(DD/MM/AÑO)</Text>
                  <Text style={[S.fVal, { minHeight: 6 }]}>{data.fechaResolucionBlindaje ?? ''}</Text>
                </View>
              </View>
            </View>

            {/* 13. Desmonte */}
            <View style={[S.fWrap, S.col, S.bR, { flex: 3 }]}>
              <View style={[S.row, { alignItems: 'center', marginBottom: 1 }]}>
                <Text style={[S.fLabel, { marginRight: 3 }]}>13. DESMONTE BLIND.</Text>
                <SiNo value={data.desmonteBlindaje} />
              </View>
              <View style={[S.row]}>
                <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingRight: 2 }}>
                  <Text style={S.fLabel}>Resolución No</Text>
                  <Text style={[S.fVal, { minHeight: 6 }]}>{data.resolucionDesmonte ?? ''}</Text>
                </View>
                <View style={{ flex: 1, paddingLeft: 2 }}>
                  <Text style={S.fLabel}>(DD/MM/AÑO)</Text>
                  <Text style={[S.fVal, { minHeight: 6 }]}>{data.fechaResolucionDesmonte ?? ''}</Text>
                </View>
              </View>
            </View>

            <Field label="14. POTENCIA/HP" value={data.potenciaHP} flex={2} minH={11} noBorderR />
          </View>
        </View>
        {/* /TRÁMITE */}

        {/* ════════ CLASE DE VEHÍCULO + CARROCERÍA + ID INTERNA ════════ */}
        <View style={[S.row, S.bAll, { marginBottom: 2 }]}>

          {/* 4. Clase de vehículo */}
          <View style={[S.col, { flex: 1 }, S.bR]}>
            <Text style={S.secBar}>4. CLASE DE VEHÍCULO</Text>
            <View style={[S.row, S.bB, { padding: '2 3', flexWrap: 'wrap' }]}>
              {(
                [
                  ['AUTOMOVIL', 'AUTOMÓVIL'], ['BUS', 'BUS'], ['BUSETA', 'BUSETA'],
                  ['CAMION', 'CAMIÓN'], ['CAMIONETA', 'CAMIONETA'], ['CAMPERO', 'CAMPERO'], ['MICROBUS', 'MICROBÚS'],
                ] as [ClaseVehiculoRunt, string][]
              ).map(([key, label]) => (
                <CB key={key} on={cv === key} label={label} />
              ))}
            </View>
            <View style={[S.row, { padding: '2 3', flexWrap: 'wrap' }]}>
              {(
                [
                  ['TRACTOCAMION', 'TRACTOCAMIÓN'], ['MOTOCICLETA', 'MOTOCICLETA'], ['MOTOCARRO', 'MOTOCARRO'],
                  ['MOTOTRICICLO', 'MOTOTRICICLO'], ['CUATRIMOTO', 'CUATRIMOTO'], ['VOLQUETA', 'VOLQUETA'], ['OTRO', 'OTRO TIPO'],
                ] as [ClaseVehiculoRunt, string][]
              ).map(([key, label]) => (
                <CB key={key} on={cv === key} label={label} />
              ))}
            </View>
          </View>

          {/* 15. Carrocería */}
          <View style={[S.col, { width: 85 }, S.bR]}>
            <Text style={S.secBar}>15. CARROCERÍA</Text>
            <View style={[S.fWrap, S.bB]}>
              <Text style={S.fLabel}>TIPO</Text>
              <Text style={[S.fVal, { minHeight: 10 }]}>{data.carroceriaTipo ?? ''}</Text>
            </View>
            <View style={[S.fWrap]}>
              <Text style={S.fLabel}>CÓDIGO</Text>
              <Text style={[S.fVal, { minHeight: 10 }]}>{data.carroceriaCodigo ?? ''}</Text>
            </View>
          </View>

          {/* 16. Identificación interna del vehículo */}
          <View style={[S.col, { width: 210 }]}>
            <Text style={S.secBar}>16. IDENTIFICACIÓN INTERNA DEL VEHÍCULO</Text>
            {[
              { label: 'No. DE MOTOR', value: data.numeroMotor, regrabado: data.motorRegrabado },
              { label: 'No. DE CHASIS', value: data.numeroChasis, regrabado: data.chasisRegrabado },
              { label: 'No. SERIE', value: data.numeroSerie, regrabado: data.serieRegrabado },
            ].map((item, i) => (
              <View key={i} style={[S.row, i < 2 ? S.bB : {}, { alignItems: 'stretch' }]}>
                <View style={[S.fWrap, { width: 65, borderRight: '0.5pt solid #000' }]}>
                  <Text style={S.fLabel}>{item.label}</Text>
                </View>
                <View style={[S.fWrap, { flex: 1, borderRight: '0.5pt solid #000' }]}>
                  <Text style={[S.fVal, { minHeight: 9 }]}>{item.value ?? ''}</Text>
                </View>
                <View style={[S.fWrap, { width: 55 }]}>
                  <Text style={S.fLabel}>REGRABADO</Text>
                  <SiNo value={item.regrabado} />
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* /CLASE VEHÍCULO */}

        {/* ════════ PROPIETARIO (izq) + SECCIONES DERECHA ════════ */}
        <View style={[S.row, S.bAll, { marginBottom: 2 }]}>

          {/* 21. Datos del propietario */}
          <View style={[S.col, { flex: 6 }, S.bR]}>
            <Text style={S.secBar}>21. DATOS DEL PROPIETARIO</Text>
            <View style={[S.row, S.bB]}>
              <Field label="PRIMER APELLIDO"  value={data.propPrimerApellido}  flex={1} />
              <Field label="SEGUNDO APELLIDO" value={data.propSegundoApellido} flex={1} />
              <Field label="NOMBRES"          value={data.propNombres}         flex={2} noBorderR />
            </View>
            <TipoDocRow selected={data.propTipoDoc} />
            <TipoDocLetters selected={data.propTipoDoc} />
            <View style={[S.row, S.bT]}>
              <Field label="No. DOCUMENTO" value={data.propNumeroDoc} flex={2} />
              <View style={[S.fWrap, { flex: 2 }]} />
            </View>
            <View style={[S.row, S.bT]}>
              <Field label="DIRECCIÓN" value={data.propDireccion} flex={3} />
              <Field label="CIUDAD"    value={data.propCiudad}    flex={2} />
              <Field label="TELÉFONO"  value={data.propTelefono}  flex={2} noBorderR />
            </View>
            <View style={[S.fWrap, S.bT]}>
              <Text style={S.fLabel}>FIRMA DEL PROPIETARIO</Text>
              <View style={S.signLine} />
            </View>
          </View>

          {/* Columna derecha: 17 + 20 + 18 + 19 */}
          <View style={[S.col, { flex: 4 }]}>

            {/* 17. Importación o remate */}
            <View style={[S.col, S.bB]}>
              <View style={[S.row, { padding: '1 2', alignItems: 'center', borderBottom: '0.5pt solid #000' }]}>
                <Text style={[S.fLabel, { flex: 1 }]}>17. IMPORTACIÓN O REMATE</Text>
                <SiNo value={data.importacionORemate} />
              </View>
              <View style={[S.row, { padding: '2 2', flexWrap: 'wrap' }]}>
                <CB on={data.importacionTipo === 1} num={1} label="MANIF. O ACTA" />
                <CB on={data.importacionTipo === 2} num={2} label="DEC. DE IMPOR." />
                <CB on={data.importacionTipo === 3} num={3} label="ACTA" />
                <CB on={data.importacionTipo === 4} num={4} label="ENTIDAD" />
                <CB on={data.importacionTipo === 5} num={5} label="LUGAR (CIUDAD)" />
                <CB on={data.importacionTipo === 6} num={6} label="CODIGO" />
              </View>
              <View style={[S.row, S.bT]}>
                <Field label="No. DOCUMENTO" value={data.importacionNoDocumento} flex={2} />
                <View style={[S.fWrap, { flex: 3 }]}>
                  <Text style={S.fLabel}>FECHA</Text>
                  <View style={[S.row]}>
                    <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingRight: 2 }}>
                      <Text style={S.fLabel}>DIA</Text>
                      <Text style={[S.fVal, { minHeight: 8 }]}>{data.importacionFechaDia ?? ''}</Text>
                    </View>
                    <View style={{ flex: 1, borderRight: '0.5pt solid #000', paddingHorizontal: 2 }}>
                      <Text style={S.fLabel}>MES</Text>
                      <Text style={[S.fVal, { minHeight: 8 }]}>{data.importacionFechaMes ?? ''}</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 2 }}>
                      <Text style={S.fLabel}>AÑO</Text>
                      <Text style={[S.fVal, { minHeight: 8 }]}>{data.importacionFechaAnio ?? ''}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={[S.fWrap, S.bT]}>
                <Text style={S.fLabel}>No. DE VIN VEHÍCULOS AUTOMOTORES</Text>
                <Text style={[S.fVal, { minHeight: 9 }]}>{data.vinVehiculo ?? ''}</Text>
              </View>
            </View>

            {/* 20. Datos de alerta */}
            <View style={[S.col, S.bB]}>
              <Text style={S.secBar}>20. DATOS DE ALERTA</Text>
              <View style={[S.row, { padding: '2 2', flexWrap: 'wrap' }]}>
                <CB on={data.alerta === 1} num={1} label="HURTO" />
                <CB on={data.alerta === 2} num={2} label="LIM. PROPIEDAD" />
                <CB on={data.alerta === 3} num={3} label="EMBARGO" />
                <CB on={data.alerta === 4} num={4} label="OTRO" />
                <CB on={data.alerta === 5} num={5} label="A FAVOR DE:" />
              </View>
            </View>

            {/* 18. Tipo de servicio */}
            <View style={[S.col, S.bB]}>
              <Text style={S.secBar}>18. TIPO DE SERVICIO</Text>
              <View style={[S.row, { padding: '2 2', flexWrap: 'wrap' }]}>
                <CB on={data.tipoServicio === 1} num={1} label="PARTICULAR" />
                <CB on={data.tipoServicio === 2} num={2} label="PÚBLICO" />
                <CB on={data.tipoServicio === 3} num={3} label="DIPLOMÁTI." />
                <CB on={data.tipoServicio === 4} num={4} label="OFICIAL" />
                <CB on={data.tipoServicio === 5} num={5} label="ESPECIAL" />
                <CB on={data.tipoServicio === 6} num={6} label="OTROS" />
              </View>
            </View>

            {/* 19. Empresa vinculadora */}
            <View style={[S.col]}>
              <Text style={S.secBar}>19. EMPRESA VINCULADORA</Text>
              <View style={[S.row]}>
                <Field label="NOMBRE" value={data.empresaNombre} flex={3} />
                <Field label="NIT"    value={data.empresaNIT}    flex={1} noBorderR />
              </View>
            </View>

          </View>
        </View>
        {/* /PROPIETARIO */}

        {/* ════════ COMPRADOR (izq) + OBSERVACIONES (der) ════════ */}
        <View style={[S.row, S.bAll]}>

          {/* 22. Datos del comprador */}
          <View style={[S.col, { flex: 6 }, S.bR]}>
            <Text style={S.secBar}>22. DATOS DEL COMPRADOR (TRASPASO)</Text>
            <View style={[S.row, S.bB]}>
              <Field label="PRIMER APELLIDO"  value={data.comprPrimerApellido}  flex={1} />
              <Field label="SEGUNDO APELLIDO" value={data.comprSegundoApellido} flex={1} />
              <Field label="NOMBRES"          value={data.comprNombres}         flex={2} noBorderR />
            </View>
            <TipoDocRow selected={data.comprTipoDoc} />
            <TipoDocLetters selected={data.comprTipoDoc} />
            <View style={[S.row, S.bT]}>
              <Field label="No. DOCUMENTO" value={data.comprNumeroDoc} flex={2} />
              <View style={[S.fWrap, { flex: 2 }]} />
            </View>
            <View style={[S.row, S.bT]}>
              <Field label="DIRECCIÓN" value={data.comprDireccion} flex={3} />
              <Field label="CIUDAD"    value={data.comprCiudad}    flex={2} />
              <Field label="TELÉFONO"  value={data.comprTelefono}  flex={2} noBorderR />
            </View>
            <View style={[S.fWrap, S.bT]}>
              <Text style={S.fLabel}>FIRMA DEL COMPRADOR</Text>
              <View style={S.signLine} />
            </View>
          </View>

          {/* 23. Observaciones */}
          <View style={[S.col, { flex: 4 }]}>
            <Text style={S.secBar}>23. OBSERVACIONES</Text>
            <View style={[S.fWrap, { flex: 1 }]}>
              <Text style={[S.fVal, { minHeight: 28 }]}>{data.observaciones ?? ''}</Text>
            </View>
            <View style={[S.fWrap, S.bT, { flex: 1 }]}>
              <Text style={[S.fLabel, { marginBottom: 2 }]}>
                OBSERVACIONES (PARA TRASPASO DE VEHÍCULOS AUTOMOTORES ANTES DEL RUNT)
              </Text>
              <Text style={[S.fVal, { minHeight: 22 }]}>{data.observacionesTraspaso ?? ''}</Text>
            </View>
          </View>

        </View>
        {/* /COMPRADOR */}

      </Page>
    </Document>
  );
};

export default RuntFormPDF;
