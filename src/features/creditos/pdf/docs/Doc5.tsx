// Doc5.tsx — Documento 5 de 11
// CONTRATO DE COMPRAVENTA DE VEHÍCULO AUTOMOTOR CON RESERVA DE DOMINIO
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import {
  DocLayout,
  styles,
  Blank,
  VehiculoTable,
  type DocBaseProps,
} from "../paqueteShared";

const C: React.FC<{ t: string; children: React.ReactNode }> = ({ t, children }) => (
  <Text style={styles.paragraph}>
    <Text style={styles.clauseTitle}>{t}</Text> {children}
  </Text>
);

export const Doc5: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={5} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>
        CONTRATO DE COMPRAVENTA DE VEHÍCULO AUTOMOTOR CON RESERVA DE DOMINIO
      </Text>
      <Text style={styles.paragraph}>
        Lugar y fecha de celebración: <Blank value={p.ciudad} width={120} />, ______
        de ______________ de ________. Entre los suscritos, a saber:{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, identificada con NIT{" "}
        <Text style={styles.strong}>{p.empresaNit}</Text>, quien en adelante se
        denominará EL VENDEDOR; y <Blank value={nombre} width={220} />,
        identificado(a) con cédula de ciudadanía No. <Blank value={cc} width={120} />,
        con domicilio en <Blank value={p.direccionResidencia} width={140} /> y
        teléfono <Blank value={p.celular} width={100} />, quien en adelante se
        denominará EL COMPRADOR, hemos convenido celebrar un contrato de compraventa
        que se regirá por las normas legales aplicables, en especial los artículos 952
        y siguientes del Código de Comercio, y por las siguientes cláusulas:
      </Text>
      <C t="PRIMERA – OBJETO:">
        EL VENDEDOR se compromete a transferir a título de venta al COMPRADOR la
        propiedad del vehículo automotor que se identifica a continuación:
      </C>
      <VehiculoTable
        marca={p.marca}
        linea={p.linea}
        modelo={p.modelo || p.modeloMoto}
        color={p.color}
        motor={p.motor || p.numeroMotor}
        chasis={p.chasis || p.numeroChasis}
        placa={p.placa}
      />
      <C t="SEGUNDA – PRECIO:">
        Como precio del automotor descrito, las partes han acordado la suma de{" "}
        <Blank value={p.valorMoto} width={200} /> ($
        <Blank value={p.valorMoto} width={120} />).
      </C>
      <C t="TERCERA – FORMA DE PAGO:">
        EL COMPRADOR pagará el precio mediante una cuota inicial de $
        <Blank value={p.cuotaInicial} width={120} /> y el saldo en las condiciones y
        plazos pactados en el contrato de crédito y en la tabla de amortización que
        hacen parte del paquete de crédito.
      </C>
      <C t="CUARTA – OBLIGACIONES DEL VENDEDOR:">
        EL VENDEDOR se obliga a hacer entrega del vehículo en perfecto estado, libre de
        gravámenes, embargos, multas o procesos que afecten su libre comercio, sin
        perjuicio de las garantías que se constituyan en virtud de la financiación.
      </C>
      <C t="QUINTA – RESERVA DE DOMINIO:">
        De conformidad con los artículos 952 y siguientes del Código de Comercio, EL
        VENDEDOR se reserva el dominio del vehículo vendido hasta tanto EL COMPRADOR
        haya pagado la totalidad del precio. En consecuencia, EL COMPRADOR sólo
        adquirirá la propiedad con el pago total, y su incumplimiento facultará al
        VENDEDOR para recuperar el bien y obtener la restitución del mismo conforme a la
        ley, con la correspondiente liquidación de las sumas pagadas y de la
        indemnización a que haya lugar.
      </C>
      <C t="SEXTA – CLÁUSULA PENAL:">
        Las partes establecen como sanción pecuniaria por el incumplimiento una pena
        equivalente al perjuicio causado, sin exceder los límites del artículo 867 del
        Código de Comercio y sin perjuicio de las demás acciones legales.
      </C>
      <C t="SÉPTIMA – GASTOS:">
        Los gastos que se originen con motivo de esta compraventa serán de cargo del
        COMPRADOR, salvo los que por ley correspondan al VENDEDOR.
      </C>
      <Text style={styles.paragraph}>
        En señal de conformidad, los contratantes suscriben este documento en dos (2)
        ejemplares del mismo tenor.
      </Text>

      <View style={styles.signaturesRow}>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>EL VENDEDOR</Text>
          <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
          <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
        </View>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>EL COMPRADOR</Text>
          <Text style={styles.signatureLabel}>
            Nombre: {nombre || "______________________________"}
          </Text>
          <Text style={styles.signatureLabel}>
            C.C. No. {cc || "_____________________"}
          </Text>
        </View>
      </View>
    </DocLayout>
  );
};
