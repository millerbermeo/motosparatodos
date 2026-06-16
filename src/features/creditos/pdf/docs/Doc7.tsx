// Doc7.tsx — Documento 7 de 11
// CONTRATO DE MANDATO – PERSONA NATURAL
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, type DocBaseProps } from "../paqueteShared";

const C: React.FC<{ t: string; children: React.ReactNode }> = ({ t, children }) => (
  <Text style={styles.paragraph}>
    <Text style={styles.clauseTitle}>{t}</Text> {children}
  </Text>
);

export const Doc7: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={7} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>CONTRATO DE MANDATO – PERSONA NATURAL</Text>
      <Text style={styles.paragraph}>
        Entre los suscritos, a saber: <Blank value={nombre} width={220} />, mayor de
        edad, vecino(a) de esta ciudad, identificado(a) con cédula de ciudadanía No.{" "}
        <Blank value={cc} width={120} /> expedida en{" "}
        <Blank value={p.lugarExpedicion} width={120} />, quien para efectos del
        presente contrato se denominará el MANDANTE; y de otro lado,{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, identificada con NIT{" "}
        <Text style={styles.strong}>{p.empresaNit}</Text>, quien para efectos del
        presente contrato se denominará el MANDATARIO, hemos acordado suscribir el
        presente contrato de mandato, dando cumplimiento al artículo 5 de la
        Resolución 12379 de 2012 del Ministerio de Transporte, compilado en el
        artículo 5.1.6 de la Resolución 20223040045295 de 2022, el cual se regirá por
        las normas civiles y comerciales que regulan la materia y por las siguientes
        cláusulas:
      </Text>
      <C t="PRIMERA – OBJETO DEL CONTRATO:">
        El MANDATARIO, por cuenta y riesgo del MANDANTE, queda facultado para
        solicitar, realizar, radicar y retirar los trámites ante el organismo de
        tránsito de esta ciudad o de otra ciudad, y en general para realizar todas las
        actuaciones necesarias que se requieran para el perfeccionamiento del trámite
        solicitado, respecto del vehículo de propiedad del MANDANTE identificado con
        placa <Blank value={p.placa} width={100} />. Para tal efecto, el MANDANTE
        confiere poder especial, amplio y suficiente al MANDATARIO para representarlo
        ante la autoridad competente.
      </C>
      <C t="SEGUNDA – OBLIGACIONES DEL MANDANTE:">
        El MANDANTE declara que la información contenida en los documentos que se
        anexan a la solicitud de trámite es veraz y auténtica, y que será responsable
        ante la autoridad competente de cualquier irregularidad que los mismos puedan
        contener.
      </C>
      <Text style={styles.paragraph}>
        Para constancia se firma en la ciudad de <Blank value={p.ciudad} width={120} />,
        a los ______ días del mes de ______________ del año ________.
      </Text>

      <View style={styles.signaturesRow}>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>MANDANTE</Text>
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
          <Text style={styles.signatureLabelBold}>MANDATARIO</Text>
          <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
          <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
        </View>
      </View>
    </DocLayout>
  );
};
