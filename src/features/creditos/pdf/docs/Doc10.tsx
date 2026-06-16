// Doc10.tsx — Documento 10 de 11
// AUTORIZACIÓN DE RETENCIÓN Y DACIÓN EN PAGO DEL VEHÍCULO AUTOMOTOR
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

export const Doc10: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={10} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>
        AUTORIZACIÓN DE RETENCIÓN Y DACIÓN EN PAGO DEL VEHÍCULO AUTOMOTOR
      </Text>
      <Text style={styles.paragraph}>
        En la ciudad de <Blank value={p.ciudad} width={120} />, a los ______ días del
        mes de ______________ de ________, entre{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, identificada con NIT{" "}
        <Text style={styles.strong}>{p.empresaNit}</Text>, quien en adelante se
        denominará EL ACREEDOR, y <Blank value={nombre} width={220} />, mayor de edad,
        identificado(a) con cédula de ciudadanía No. <Blank value={cc} width={120} />,
        quien en adelante se denominará EL DEUDOR, se suscribe la presente
        autorización respecto del siguiente vehículo:
      </Text>
      <VehiculoTable
        marca={p.marca}
        linea={p.linea}
        modelo={p.modelo || p.modeloMoto}
        color={p.color}
        motor={p.motor || p.numeroMotor}
        chasis={p.chasis || p.numeroChasis}
        placa={p.placa}
      />
      <C t="PRIMERA – AUTORIZACIÓN DE RETENCIÓN:">
        EL DEUDOR, actuando libre y voluntariamente, autoriza de manera expresa e
        irrevocable al ACREEDOR para que, en caso de incumplimiento (mora) en el pago
        de dos (2) o más cuotas de la obligación crediticia, proceda a la inmovilización
        y retención del vehículo descrito. EL DEUDOR conoce que el vehículo no será
        devuelto hasta tanto no sea cancelado el valor total del capital vencido con sus
        respectivos intereses, dentro de un plazo no mayor de cuarenta (40) días contados
        a partir de la fecha de retención.
      </C>
      <C t="SEGUNDA – DACIÓN EN PAGO:">
        Si transcurrido el plazo de cuarenta (40) días desde la retención del vehículo EL
        DEUDOR no normaliza la obligación, la cual a esa fecha comprenderá capital,
        intereses de plazo, intereses de mora, honorarios y gastos de cobranza y
        notificaciones, autoriza de manera irrevocable al ACREEDOR a disponer del
        vehículo, previo avalúo realizado por perito conforme al mecanismo de pago directo
        pactado en el contrato de prenda sin tenencia (artículo 60 de la Ley 1676 de 2013).
        El valor del avalúo se imputará a título de dación para el pago parcial o total de
        la obligación. Si el valor del vehículo excede el monto de la deuda, EL ACREEDOR
        entregará el saldo al DEUDOR; si no alcanza a cubrirla, EL DEUDOR se obliga a
        cancelar al ACREEDOR el saldo faltante.
      </C>
      <C t="TERCERA – ESTADO DEL BIEN Y ENTREGA MATERIAL:">
        EL ACREEDOR acepta la dación en pago sobre el vehículo descrito, el cual se recibe
        en el estado físico y mecánico en que se encuentre, sin que ello implique
        saneamiento por evicción o vicios redhibitorios más allá de lo contemplado por la
        ley. Perfeccionada la dación, EL DEUDOR entregará los documentos necesarios para
        realizar el traspaso ante la autoridad de tránsito correspondiente.
      </C>
      <C t="CUARTA – GASTOS:">
        Todos los gastos notariales, de traspaso, impuestos y demás costos que genere la
        dación en pago correrán por cuenta del DEUDOR, salvo pacto en contrario.
      </C>
      <C t="QUINTA – PAGO:">
        El pago de la obligación debe ser realizado únicamente en la caja de los puntos de
        venta del ACREEDOR o mediante consignación en la cuenta de ahorros de BANCOLOMBIA a
        nombre de <Text style={styles.strong}>{p.empresaNombre}</Text>. El ACREEDOR no se
        responsabiliza por dineros entregados a terceras personas. El soporte de
        consignación deberá entregarse en el almacén correspondiente o enviarse al correo
        electrónico: _________________________________.
      </C>
      <Text style={styles.paragraph}>
        Para constancia se firma a los ______ días del mes de ______________ de ________.
      </Text>

      <View style={styles.signaturesRow}>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>EL DEUDOR</Text>
          <Text style={styles.signatureLabel}>
            Nombre: {nombre || "______________________________"}
          </Text>
          <Text style={styles.signatureLabel}>
            C.C. No. {cc || "_____________________"}
          </Text>
        </View>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>EL ACREEDOR</Text>
          <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
          <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
        </View>
      </View>
    </DocLayout>
  );
};
