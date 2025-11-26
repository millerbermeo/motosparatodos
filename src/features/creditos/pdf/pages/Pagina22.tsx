// Pagina22.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  borderBox: {
    flex: 1,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  logoBox: {
    width: 110,
    marginRight: 15,
  },
  logo: {
    width: 110,
    height: 60,
    objectFit: "contain",
  },
  headerRight: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  centerTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 8.4,
    marginTop: 2,
    marginBottom: 1,
  },
  strong: {
    fontWeight: "bold",
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 2,
  },
  tableVehiculo: {
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 0.7,
  },
  row: {
    flexDirection: "row",
  },
  cellLabel: {
    width: "14%",
    borderRightWidth: 0.7,
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 7.5,
    fontWeight: "bold",
  },
  cellValueLong: {
    width: "36%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 7.5,
  },
  cellValueShort: {
    width: "22%",
    borderBottomWidth: 0.7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 7.5,
  },
  firmasRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  firmasRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  firmaCol: {
    width: "45%",
    alignItems: "center",
  },
  firmaBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    marginBottom: 8,
  },
  firmaLine: {
    borderTopWidth: 1,
    width: "100%",
    marginBottom: 3,
  },
  firmaLabel: {
    fontSize: 7.5,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina22Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  // Vendedor
  vendedorNombre: string;
  vendedorId: string;
  vendedorDireccion: string;
  vendedorTelefono: string;

  // Comprador
  compradorNombre: string;
  compradorId: string;
  compradorDireccion: string;
  compradorTelefono: string;

  // Segundo comprador (codeudor/otro comprador)
  comprador2Nombre?: string;
  comprador2Id?: string;

  // Datos vehículo
  clase: string;
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  placa: string;
  motor: string;
  chasis: string;
  ciudadContrato: string;
  fechaContrato: string; // texto libre

  sitioMatricula: string;
  servicio: string;
  capacidad: string;
  actaManifiesto: string;

  precio: string; // valor venta
}

export const Pagina22: React.FC<Pagina22Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  vendedorNombre,
  vendedorId,
  vendedorDireccion,
  vendedorTelefono,
  compradorNombre,
  compradorId,
  compradorDireccion,
  compradorTelefono,
  comprador2Id = "",
  clase,
  marca,
  linea,
  modelo,
  color,
  placa,
  motor,
  chasis,
  ciudadContrato,
  fechaContrato,
  sitioMatricula,
  servicio,
  capacidad,
  actaManifiesto,
  precio,
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.borderBox}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          {logoSrc && <Image style={styles.logo} src={logoSrc} />}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.mainTitle}>Paquete de crédito</Text>
          <Text style={styles.headerMeta}>Código: {codigo}</Text>
          <Text style={styles.headerMeta}>Fecha: {fecha}</Text>
          <Text style={styles.headerMeta}>Ciudad: {ciudad}</Text>
        </View>
      </View>

      <Text style={styles.centerTitle}>COMPRAVENTA DE VEHÍCULO AUTOMOTOR</Text>

      {/* LUGAR Y FECHA / VENDEDOR / COMPRADOR */}
      <Text style={styles.sectionLabel}>
        LUGAR Y FECHA DE CELEBRACIÓN DEL CONTRATO: {ciudadContrato}, {fechaContrato}
      </Text>

      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>NOMBRE VENDEDOR:</Text> {vendedorNombre}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>IDENTIFICACIÓN:</Text> {vendedorId}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>DIRECCIÓN:</Text> {vendedorDireccion}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>TELÉFONO:</Text> {vendedorTelefono}
      </Text>

      <Text style={[styles.sectionLabel, { marginTop: 4 }]}>
        <Text style={styles.strong}>NOMBRE VENDEDOR(ES):</Text> {compradorNombre}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>IDENTIFICACIÓN:</Text> {compradorId}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>DIRECCIÓN:</Text> {compradorDireccion}
      </Text>
      <Text style={styles.sectionLabel}>
        <Text style={styles.strong}>TELÉFONO:</Text> {compradorTelefono}
      </Text>

      <Text style={[styles.paragraph, { marginTop: 4 }]}>
        Las partes arriba detalladas hemos convenido en celebrar un contrato de
        compraventa que se regirá por las normas legales aplicables a la
        materia y en especial por las siguientes cláusulas:
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>PRIMERA. OBJETO DEL CONTRATO: </Text>
        mediante el presente contrato el vendedor se compromete a transferir a
        título de venta al comprador la propiedad del vehículo automotor que se
        identifica a continuación:
      </Text>

      {/* TABLA VEHÍCULO (CLASE / MARCA / LÍNEA / MODELO / COLOR / PLACA / MOTOR / CHASIS / ETC) */}
      <View style={styles.tableVehiculo}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>CLASE</Text>
          <Text style={styles.cellValueLong}>{clase}</Text>
          <Text style={styles.cellLabel}>MARCA</Text>
          <Text style={styles.cellValueLong}>{marca}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>LÍNEA</Text>
          <Text style={styles.cellValueLong}>{linea}</Text>
          <Text style={styles.cellLabel}>MODELO</Text>
          <Text style={styles.cellValueLong}>{modelo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>COLOR</Text>
          <Text style={styles.cellValueLong}>{color}</Text>
          <Text style={styles.cellLabel}>PLACA</Text>
          <Text style={styles.cellValueLong}>{placa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>MOTOR No.</Text>
          <Text style={styles.cellValueLong}>{motor}</Text>
          <Text style={styles.cellLabel}>CHASIS No.</Text>
          <Text style={styles.cellValueLong}>{chasis}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>CIUDAD</Text>
          <Text style={styles.cellValueShort}>{ciudadContrato}</Text>
          <Text style={styles.cellLabel}>FECHA</Text>
          <Text style={styles.cellValueShort}>{fechaContrato}</Text>
          <Text style={styles.cellLabel}>SITIO DE MATRÍCULA</Text>
          <Text style={styles.cellValueShort}>{sitioMatricula}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>SERVICIO</Text>
          <Text style={styles.cellValueShort}>{servicio}</Text>
          <Text style={styles.cellLabel}>CAPACIDAD</Text>
          <Text style={styles.cellValueShort}>{capacidad}</Text>
          <Text style={styles.cellLabel}>ACTA DE MANIFIESTO</Text>
          <Text style={styles.cellValueShort}>{actaManifiesto}</Text>
        </View>
      </View>

      {/* CLÁUSULAS RESUMIDAS */}
      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEGUNDA. PRECIO: </Text>
        como precio del automotor descrito, las partes han acordado la suma de{" "}
        {precio}.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>TERCERA. FORMA DE PAGO: </Text>
        el comprador se compromete a pagar el precio en las condiciones y
        plazos que se acuerden en la cláusula anterior o en documento aparte.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>CUARTA. OBLIGACIONES DEL VENDEDOR: </Text>
        el vendedor se obliga a hacer entrega del vehículo en perfecto estado,
        libre de gravámenes, embargos, multas o procesos que afecten su libre
        comercio.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>QUINTA. RESERVA DE DOMINIO: </Text>
        se reserva la propiedad del vehículo hasta el momento en que el
        comprador haya pagado el precio total.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SEXTA. CLÁUSULA PENAL: </Text>
        Las partes establecen como sanción pecuniaria una pena equivalente al
        perjuicio causado, sin perjuicio de las demás acciones legales.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.strong}>SÉPTIMA. GASTOS: </Text>
        los gastos que se originen con motivo de esta compraventa serán de
        cargo del comprador, salvo los que por ley correspondan al vendedor.
      </Text>

      <Text style={styles.paragraph}>
        En señal de conformidad los contratantes suscriben este documento en
        dos (2) ejemplares del mismo tenor.
      </Text>

      {/* FIRMAS FILA 1: VENDEDORES */}
      <View style={styles.firmasRow1}>
        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>EL VENDEDOR</Text>
          <Text style={styles.firmaLabel}>C.C. No. {vendedorId}</Text>
        </View>

        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>EL VENDEDOR(ES)</Text>
          <Text style={styles.firmaLabel}>C.C. No. ____________</Text>
        </View>
      </View>

      {/* FIRMAS FILA 2: COMPRADORES */}
      <View style={styles.firmasRow2}>
        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>LOS COMPRADORES</Text>
          <Text style={styles.firmaLabel}>C.C. No. {compradorId}</Text>
        </View>

        <View style={styles.firmaCol}>
          <View style={styles.firmaBox} />
          <View style={styles.firmaLine} />
          <Text style={styles.firmaLabel}>LOS COMPRADORES</Text>
          <Text style={styles.firmaLabel}>
            C.C. No. {comprador2Id || "____________"}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155548-8
      </Text>
    </View>
  </Page>
);
