// Doc4.tsx — Documento 4 de 11
// CARTA DE INSTRUCCIONES Y AUTORIZACIÓN PARA DILIGENCIAR EL PAGARÉ
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, Firma, type DocBaseProps } from "../paqueteShared";

export const Doc4: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={4} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>
        CARTA DE INSTRUCCIONES Y AUTORIZACIÓN PARA DILIGENCIAR EL PAGARÉ
      </Text>
      <Text style={styles.paragraph}>
        Ciudad y fecha: <Blank value={p.ciudad ? `${p.ciudad}, ${p.fecha ?? ""}` : ""} width={260} />
      </Text>
      <Text style={styles.paragraph}>Señores</Text>
      <Text style={[styles.paragraph, styles.strong]}>{p.empresaNombre}</Text>
      <Text style={styles.paragraph}>
        Los firmantes, mayores de edad, identificados como aparece al pie de nuestras
        correspondientes firmas, quienes en adelante nos denominaremos los DEUDORES,
        en los términos del artículo 622 del Código de Comercio, facultamos de manera
        expresa e irrevocable a <Text style={styles.strong}>{p.empresaNombre}</Text>,
        o a quien en el futuro ostente la calidad de acreedor o tenedor legítimo del
        pagaré identificado con el número <Blank value={p.codigo} width={140} />, para
        llenar los espacios en blanco de dicho instrumento, de conformidad con las
        siguientes instrucciones:
      </Text>
      <Text style={styles.paragraph}>
        1. En el espacio reservado en la cláusula primera del pagaré para colocar una
        suma de dinero se escribirá la cuantía a la que asciendan las obligaciones
        insolutas que por cualquier concepto mantengamos contraídas, directa o
        indirectamente, con {p.empresaNombre}, incluidas sus prórrogas, renovaciones y
        reestructuraciones.
      </Text>
      <Text style={styles.paragraph}>
        2. En el espacio reservado en la cláusula segunda del pagaré se escribirá la
        tasa de interés remuneratorio y de mora que corresponda conforme a lo pactado
        en el respectivo contrato o documento soporte, sin exceder los límites legales.
      </Text>
      <Text style={styles.paragraph}>
        3. Como fecha de vencimiento de dicho pagaré, {p.empresaNombre} deberá colocar
        la del día en que lo llene o diligencie.
      </Text>
      <Text style={styles.paragraph}>
        4. {p.empresaNombre} podrá diligenciar el pagaré en cualquier tiempo, sin
        necesidad de requerimiento judicial o extrajudicial, cuando se presenten
        eventos de mora o incumplimiento en el pago de cualquiera de las obligaciones a
        nuestro cargo, incluyendo capital, intereses, honorarios y demás conceptos
        derivados de los contratos suscritos.
      </Text>
      <Text style={styles.paragraph}>
        5. Aceptamos incondicionalmente todo traspaso, endoso o cesión que{" "}
        {p.empresaNombre} haga del presente instructivo junto con el pagaré, el cual
        amparará las obligaciones allí contenidas, con sus prórrogas y demás
        modificaciones.
      </Text>
      <Text style={styles.paragraph}>
        Se firma en la ciudad de <Blank value={p.ciudad} width={120} />, a los ______
        días del mes de ______________ del año ________.
      </Text>

      <View style={styles.signaturesRow}>
        <Firma rol="DEUDOR" nombre={nombre} extra={[
          { label: "C.C. o NIT", value: cc },
          { label: "Dirección", value: p.direccionResidencia },
          { label: "Teléfono", value: p.celular },
        ]} cc={undefined as any} />
        <Firma rol="CODEUDOR" nombre={p.codeudorNombre} extra={[
          { label: "C.C. o NIT", value: p.codeudorCc },
          { label: "Dirección", value: p.codeudorDireccion },
          { label: "Teléfono", value: p.codeudorTelefono },
        ]} cc={undefined as any} />
      </View>
    </DocLayout>
  );
};
