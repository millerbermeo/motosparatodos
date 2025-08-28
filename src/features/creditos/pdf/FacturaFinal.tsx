import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from '@react-pdf/renderer'

// --- Estilos ---
const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  card: {
    borderWidth: 1,
    borderColor: '#555',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  titleLeft: {
    width: '58%',
    textAlign: 'center',
  },
  titleRight: {
    width: '40%',
    textAlign: 'center',
  },
  h1: { fontSize: 12, fontWeight: 700 },
  h2: { fontSize: 10, fontWeight: 700 },
  small: { fontSize: 8 },
  grid: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#666',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#666',
  },
  cellRight: { textAlign: 'right' },
  cellCenter: { textAlign: 'center' },
  bold: { fontWeight: 700 },
  blockTitle: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#666',
    fontWeight: 700,
  },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  rightBox: {
    width: '40%',
    alignSelf: 'flex-end',
  },
})

// Una celda de etiqueta:valor para los bloques de datos generales
const Labeled: React.FC<{ label: string; value?: string; wLabel?: number; wValue?: number }>
= ({ label, value = '', wLabel = 38, wValue = 62 }) => (
  <View style={[styles.row]}> 
    <View style={[styles.cell, { width: `${wLabel}%` }]}> 
      <Text style={styles.bold}>{label}</Text>
    </View>
    <View style={[styles.cell, { width: `${wValue}%` }]}> 
      {/* Evitar desbordes con saltos automáticos */}
      <Text>{value}</Text>
    </View>
  </View>
)

// --- Documento ---
const FacturaFinalPDF: React.FC = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* CABECERA */}
      <View style={[styles.card]}> 
        <View style={styles.headerRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.h2}>VERIFICARTE AAA SAS</Text>
            <Text><Text style={styles.bold}>NIT:</Text> 901155548-8</Text>
            <Text><Text style={styles.bold}>Dirección:</Text> CALLE 81C 23 A 84</Text>
            <Text><Text style={styles.bold}>Teléfonos:</Text> 3013465340</Text>
            <Text><Text style={styles.bold}>E-mail:</Text> edisoncastro.197269@gmail.com</Text>
            <Text><Text style={styles.bold}>Ciudad:</Text> Cali - Valle del Cauca - Colombia</Text>
            <Text><Text style={styles.bold}>Departamento:</Text> Valle del Cauca</Text>
          </View>
          <View style={styles.titleRight}>
            <Text style={styles.h2}>FACTURA ELECTRONICA DE VENTA</Text>
            <Text style={styles.h1}>No. VRH662</Text>
            <Text>FACTURAS ELECTRÓNICAS</Text>
            <Text>S/N RES No.: 18764088752926</Text>
            <Text>Vigencia desde <Text style={styles.bold}>12/02/2025</Text> hasta <Text style={styles.bold}>12/02/2027</Text></Text>
            <Text>No. <Text style={styles.bold}>VRH1</Text> A <Text style={styles.bold}>VRH5000</Text></Text>
          </View>
        </View>

        {/* CLIENTE / DATOS GENERALES */}
        <View style={[styles.grid]}> 
          <View style={[styles.row]}> 
            <View style={{ width: '60%' }}>
              <Labeled label="Cliente:" value="JUAN PÉREZ LÓPEZ" />
              <Labeled label="NIT / C.C.:" value="1023456789" />
              <Labeled label="Dirección:" value="CL 45 # 10-22" />
              <Labeled label="Teléfono:" value="3205558899" />
              <Labeled label="E-mail:" value="juan.perez@gmail.com" />
              <Labeled label="Ciudad:" value="Cali - Colombia" />
              <Labeled label="Departamento:" value="Valle del Cauca" />
              <Labeled label="Régimen:" value="Persona Natural" />
              <Labeled label="Sucursal:" value="ADMINISTRACIÓN" />
            </View>
            <View style={{ width: '40%' }}>
              <Labeled label="Fecha de Emisión:" value="27/08/2025 17:33:47" />
              <Labeled label="Fecha de Validación:" value="27/08/2025 17:33:47" />
              <Labeled label="Fecha de Vencimiento:" value="27/08/2025" />
              <Labeled label="Forma de Pago:" value="Contado" />
              <Labeled label="Medio de Pago:" value="Efectivo" />
              <Labeled label="Período de Facturación:" value="12/02/2025 - 12/02/2027" />
              <Labeled label="Nro. Orden Compra:" value="" />
              <Labeled label="Nro. Doc. Despacho:" value="" />
              <Labeled label="Moneda Aplicable:" value="COP" />
              <Labeled label="Vendedor:" value="CARLOS GÓMEZ" />
            </View>
          </View>
          <View style={[styles.row]}> 
            <View style={[styles.cell, { width: '100%' }]}> 
              <Text><Text style={styles.bold}>Cufe:</Text> 85accc9878103410395959c446655b789a5ee4748d7be29c4fce0038716c205461f98d9a13d2f26d09e4ebdba629e13d1</Text>
            </View>
          </View>
        </View>
      </View>

      {/* DETALLES */}
      <Text style={[styles.blockTitle, styles.mt8]}>DETALLES</Text>
      <View style={[styles.grid]}> 
        {/* Header de tabla */}
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 0.6, fontWeight: 700 }]}>Línea</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: 700 }]}>Código</Text>
          <Text style={[styles.cell, { flex: 3, fontWeight: 700 }]}>Descripción</Text>
          <Text style={[styles.cell, { flex: 1, fontWeight: 700 }]}>Lote</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: 700 }]}>Vence</Text>
          <Text style={[styles.cell, { flex: 0.9, fontWeight: 700 }]}>Cantidad</Text>
          <Text style={[styles.cell, { flex: 1, fontWeight: 700 }]}>U. Medida</Text>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: 700, textAlign: 'right' }]}>Precio Unit.</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: 700, textAlign: 'right' }]}>Desc.</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: 700 }]}>% Impuesto</Text>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: 700, textAlign: 'right' }]}>Total Impuesto</Text>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: 700, textAlign: 'right' }]}>Total Neto</Text>
          <Text style={[styles.cell, { flex: 0.9, fontWeight: 700 }]}>Notas</Text>
        </View>
        {/* Fila 1 */}
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 0.6 }]}>1</Text>
          <Text style={[styles.cell, { flex: 1.6 }]}>9FMHC1S39FT009617</Text>
          <Text style={[styles.cell, { flex: 3 }]}>MOTOCICLETA HONDA CB100 NEGRO AZUL 2026</Text>
          <Text style={[styles.cell, { flex: 1 }]}></Text>
          <Text style={[styles.cell, { flex: 1.1 }]}>2025-08-27</Text>
          <Text style={[styles.cell, { flex: 0.9, textAlign: 'right' }]}>1.00</Text>
          <Text style={[styles.cell, { flex: 1 }]}>Unidad</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'right' }]}>4,789,916.00</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'right' }]}>126,932.77</Text>
          <Text style={[styles.cell, { flex: 1.1 }]}>IVA 19.00%</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'right' }]}>885,966.81</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'right' }]}>4,789,916.00</Text>
          <Text style={[styles.cell, { flex: 0.9 }]}></Text>
        </View>
        {/* Total línea */}
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 0.6 }]}>Total</Text>
          <Text style={[styles.cell, { flex: 11.1 }]}>TOTAL DE LINEA 1</Text>
          <Text style={[styles.cell, { flex: 1.4 }]}></Text>
          <Text style={[styles.cell, { flex: 0.9 }]}></Text>
        </View>
      </View>

      {/* DESCUENTOS Y RECARGOS */}
      <Text style={[styles.blockTitle, styles.mt8]}>DESCUENTOS Y RECARGOS GLOBALES</Text>
      <View style={[styles.grid]}> 
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: 700 }]}>Tipo</Text>
          <Text style={[styles.cell, { flex: 3, fontWeight: 700 }]}>Descripción</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: 700, textAlign: 'right' }]}>Valor Base</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: 700, textAlign: 'right' }]}>%Desc</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: 700, textAlign: 'right' }]}>Valor</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 1.2 }]}>Descuento</Text>
          <Text style={[styles.cell, { flex: 3 }]}></Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right' }]}>4,789,916.00</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'right' }]}>2.65%</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right' }]}>126,932.77</Text>
        </View>
      </View>

      {/* NOTAS FINALES */}
      <Text style={[styles.blockTitle, styles.mt8]}>NOTAS FINALES</Text>
      <View style={[styles.grid]}> 
        <View style={styles.row}>
          <Text style={[styles.cell, { width: '100%' }]}>CONTADO - PLAN TÁCTICO $151.000</Text>
        </View>
      </View>

      {/* IMPUESTOS + QR + TOTALES */}
      <View style={[styles.row, styles.mt12]}> 
        {/* Impuestos */}
        <View style={{ width: '55%' }}>
          <View style={[styles.grid]}> 
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 2.5, fontWeight: 700 }]}>Tipo de Impuestos</Text>
              <Text style={[styles.cell, { flex: 1.5, fontWeight: 700, textAlign: 'right' }]}>Monto Base</Text>
              <Text style={[styles.cell, { flex: 1.3, fontWeight: 700, textAlign: 'right' }]}>Total</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 2.5 }]}>IVA 19.00%</Text>
              <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>4,662,983.23</Text>
              <Text style={[styles.cell, { flex: 1.3, textAlign: 'right' }]}>885,966.81</Text>
            </View>
          </View>

          {/* QR + totales izquierda */}
          <View style={[styles.row, styles.mt8]}> 
            <View style={[styles.card, { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }]}> 
              <Image
                style={{ width: 100, height: 100 }}
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/640px-QR_code_for_mobile_English_Wikipedia.svg.png"
              />
            </View>
            <View style={{ marginLeft: 10, flexGrow: 1 }}>
              <View style={[styles.grid]}> 
                {[
                  ['Total Valor Bruto', '4,789,916.00'],
                  ['Total Base Imponible', '4,662,983.23'],
                  ['IVA:', '885,966.81'],
                  ['Impuesto Consumo:', '0.00'],
                  ['Impuesto Saludable:', '0.00'],
                  ['Total Descuentos:', '126,932.77'],
                  ['Total Cargos:', '0.00'],
                  ['Total Anticipos', '0.00'],
                ].map(([k, v]) => (
                  <View key={k} style={styles.row}>
                    <Text style={[styles.cell, { width: '50%', fontWeight: 700 }]}>{k}</Text>
                    <Text style={[styles.cell, { width: '50%', textAlign: 'left' }]}>{v}</Text>
                  </View>
                ))}
                <View style={styles.row}>
                  <Text style={[styles.cell, { width: '50%', fontWeight: 700 }]}>Valor Total (COP)</Text>
                  <Text style={[styles.cell, { width: '50%', textAlign: 'left' }]}>5,548,950.04</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Valor en letras */}
          <View style={[styles.grid, styles.mt8]}> 
            <View style={styles.row}>
              <Text style={[styles.cell, { width: '100%' }]}>CINCO MILLONES QUINIENTOS CUARENTA Y OCHO MIL NOVECIENTOS CINCUENTA PESOS COLOMBIANOS CON CUATRO CENTAVOS (COP)</Text>
            </View>
          </View>
        </View>

        {/* Totales derecha */}
        <View style={{ width: '45%', paddingLeft: 12 }}>
          <View style={[styles.grid]}> 
            <View style={styles.row}>
              <Text style={[styles.cell, { width: '60%', fontWeight: 700 }]}>Rete Fuente</Text>
              <Text style={[styles.cell, { width: '40%', textAlign: 'right' }]}>0.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: '60%', fontWeight: 700 }]}>Rete IVA</Text>
              <Text style={[styles.cell, { width: '40%', textAlign: 'right' }]}>0.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: '60%', fontWeight: 700 }]}>Rete ICA</Text>
              <Text style={[styles.cell, { width: '40%', textAlign: 'right' }]}>0.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: '60%', fontWeight: 700 }]}>Valor a Pagar (COP)</Text>
              <Text style={[styles.cell, { width: '40%', textAlign: 'right' }]}>5,548,950.04</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Notas finales inferiores */}
      <View style={[styles.mt12]}> 
        <Text style={styles.small}>Nota:</Text>
        <Text style={styles.small}>Condiciones comerciales:</Text>
        <Text style={styles.small}>Firma Elaborado por:</Text>
        <Text style={styles.small}>Firma Recibido por:</Text>
      </View>

      {/* Pie de página */}
      <View style={[styles.mt12]}> 
        <Text style={styles.small}>Factura No: VRH - 662 - Fecha y Hora de Generación: 2025-08-27 - 17:33:47</Text>
        <Text style={styles.small}>CUFE: 85accc9878103410395959c446655b789a5ee4748d7be29c4fce0038716c205461f98d9a13d2f26d09e4ebdba629e13d1</Text>
        <Text style={styles.small}>Generado por ZIur Software Colombia SAS® NIT:900595497-0 - Emisión electrónica Software propio. Web: www.ziursoftware.com</Text>
      </View>
    </Page>
  </Document>
)

// Componente listo para usar en la app: muestra un botón de descarga
const FacturaFinalDownload: React.FC = () => (
  <PDFDownloadLink document={<FacturaFinalPDF />} fileName="Factura_VRH662_JuanPerez.pdf">
    {({ loading }) => (
      <span className="inline-flex items-center px-3 py-2 rounded-xl shadow btn btn-success">
        {loading ? 'Generando PDF…' : 'Descargar Factura (VRH662)'}
      </span>
    )}
  </PDFDownloadLink>
)

export { FacturaFinalPDF }
export default FacturaFinalDownload