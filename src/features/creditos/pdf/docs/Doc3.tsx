// Doc3.tsx — Documento 3 de 11 — PAGARÉ
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, Firma, type DocBaseProps } from "../paqueteShared";

const C: React.FC<{ t: string; children: React.ReactNode }> = ({ t, children }) => (
  <Text style={styles.paragraph}>
    <Text style={styles.clauseTitle}>{t}</Text> {children}
  </Text>
);

export const Doc3: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={3} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>
        PAGARÉ No. {p.codigo || "______________"}
      </Text>
      <Text style={styles.paragraph}>
        Yo (nosotros), <Blank value={nombre} width={240} />, identificado(a) con
        cédula de ciudadanía No. <Blank value={cc} width={140} />, declaro
        (declaramos) que por virtud del presente título valor pagaré (pagaremos) en
        forma solidaria e incondicional a la orden de{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, o a quien represente
        sus derechos, en la ciudad de <Blank value={p.ciudad} width={120} />, la
        suma de <Blank value={p.valorMoto} width={200} /> ($
        <Blank value={p.valorMoto} width={120} />), en las fechas de amortización
        por cuotas señaladas en la cláusula tercera de este pagaré, más los
        intereses señalados en la cláusula segunda de este título valor.
      </Text>
      <C t="SEGUNDA – INTERESES:">
        Sobre la suma debida reconoceré (reconoceremos) intereses remuneratorios
        equivalentes al ________% mensual efectivo, sobre el capital o saldo
        insoluto. En caso de mora reconoceré (reconoceremos) intereses moratorios a
        la tasa máxima legal autorizada por la Superintendencia Financiera de
        Colombia o la norma que la modifique, sobre el saldo vencido.
      </C>
      <C t="TERCERA – PLAZO:">
        Pagaré (pagaremos) el capital indicado en la cláusula primera y sus
        intereses mediante <Blank value={p.cuotas} width={40} /> cuotas mensuales y
        sucesivas de <Blank value={p.valorCuota} width={180} /> ($
        <Blank value={p.valorCuota} width={120} />) cada una. El primer pago se
        efectuará el día ______ del mes de ______________ de ________, y las
        subsiguientes en igual fecha de cada mes.
      </C>
      <C t="CUARTA – CLÁUSULA ACELERATORIA:">
        El tenedor podrá declarar vencidos los plazos de esta obligación y exigir el
        pago total de la deuda más los intereses causados cuando se presente alguna
        de las siguientes circunstancias: a) la aprehensión de nuestros bienes en
        proceso de embargo o secuestro; b) nuestra declaración en liquidación
        obligatoria o insolvencia; c) el incumplimiento en el pago de cualquiera de
        las cuotas pactadas; d) la inexactitud o falsedad de la información
        suministrada; e) cualquier otro evento de incumplimiento previsto en la ley
        o en el contrato que dio origen a este pagaré.
      </C>
      <C t="QUINTA:">
        Renuncio (renunciamos) al beneficio de excusión y división, así como a
        cualquier otro que en derecho me (nos) favorezca, y reconozco (reconocemos)
        desde ya la existencia de una obligación clara, expresa y exigible a favor de{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>.
      </C>
      <C t="SEXTA – AUTORIZACIÓN PARA VERIFICACIÓN Y REPORTE:">
        Autorizo (autorizamos) expresamente a {p.empresaNombre} para consultar,
        verificar, reportar y actualizar mi (nuestra) información en centrales de
        riesgo, así como para efectuar las gestiones de cobro prejudicial y judicial
        que considere pertinentes.
      </C>
      <C t="SÉPTIMA – IMPUESTO DE TIMBRE:">
        El impuesto de timbre a que esté sujeto este título valor será de cargo única
        y exclusivamente del (de los) deudor(es).
      </C>
      <Text style={styles.paragraph}>
        En constancia de lo anterior, se suscribe este documento el día ______ del
        mes de ______________ de ________.
      </Text>

      <View style={styles.signaturesRow}>
        <Firma rol="DEUDOR" nombre={nombre} cc={cc} />
        <Firma rol="CODEUDOR" nombre={p.codeudorNombre} cc={p.codeudorCc} />
      </View>
    </DocLayout>
  );
};
