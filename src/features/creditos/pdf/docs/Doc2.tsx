// Doc2.tsx — Documento 2 de 11 (2 páginas)
// CONTRATO DE CRÉDITO PARA LA ADQUISICIÓN DE UNA MOTOCICLETA
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, Firma, type DocBaseProps } from "../paqueteShared";

const C: React.FC<{ t: string; children: React.ReactNode }> = ({ t, children }) => (
  <Text style={styles.paragraph}>
    <Text style={styles.clauseTitle}>{t}</Text> {children}
  </Text>
);

export const Doc2: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <>
      <DocLayout {...p} docIndex={2} pageIndex={1} pageCount={2}>
        <Text style={styles.docTitle}>
          CONTRATO DE CRÉDITO PARA LA ADQUISICIÓN DE UNA MOTOCICLETA
        </Text>
        <Text style={styles.paragraph}>
          El presente contrato se celebra entre los suscritos a saber: (i) por un
          lado, <Text style={styles.strong}>{p.empresaNombre}</Text>, sociedad
          legalmente constituida bajo las leyes de Colombia, identificada con NIT{" "}
          <Text style={styles.strong}>{p.empresaNit}</Text> (la "Acreedora"); y (ii)
          por el otro, <Blank value={nombre} width={240} />, identificado(a) con
          cédula de ciudadanía No. <Blank value={cc} width={140} /> (el "Deudor").
          La Acreedora y el Deudor, conjuntamente las "Partes", han convenido
          suscribir el presente contrato de crédito para la adquisición de una
          motocicleta (el "Contrato"), que se regirá por las siguientes cláusulas:
        </Text>
        <C t="1. CONDICIONES PARTICULARES DEL CRÉDITO.">
          Las condiciones particulares del Contrato son las relacionadas en el
          documento "Condiciones del Crédito" ("Anexo No. 1"), el cual hace parte
          integral del presente Contrato. Para el otorgamiento del crédito, la
          Acreedora requiere la suscripción de un pagaré y de la carta de
          instrucciones para su diligenciamiento, como garantía de cumplimiento de
          la obligación.
        </C>
        <C t="2. PLAZO.">
          El plazo del presente Contrato será igual a la vigencia del crédito.
          Cualquier evento en que este documento autorice a la Acreedora a dar por
          terminado el Contrato la faculta para dar por exigible la totalidad de la
          obligación a cargo del (de los) Deudor(es).
        </C>
        <C t="3. CLÁUSULA ACELERATORIA.">
          La Acreedora podrá declarar exigible el plazo y exigir el pago total de lo
          adeudado cuando se presenten eventos de mora, incumplimiento u otras
          causales previstas en este Contrato, sin necesidad de requerimiento
          judicial o extrajudicial.
        </C>
        <C t="4. FORMA DE PAGO.">
          El pago del crédito se realizará en las cuotas y periodicidades acordadas
          en el Anexo No. 1, mediante consignación, débito automático, pago en caja
          o los demás mecanismos autorizados por la Acreedora.
        </C>
        <C t="5. INTERESES REMUNERATORIOS.">
          El Contrato generará intereses remuneratorios sobre el saldo insoluto del
          capital, calculados a la tasa señalada en las Condiciones del Crédito, sin
          exceder en ningún caso la tasa máxima certificada por la Superintendencia
          Financiera de Colombia.
        </C>
        <C t="6. INTERESES DE MORA.">
          En caso de falta de pago oportuno, se causarán intereses de mora sobre las
          sumas vencidas a la tasa máxima permitida por las normas comerciales
          vigentes en la República de Colombia.
        </C>
        <C t="7. FECHA LÍMITE DE PAGO DE LAS CUOTAS.">
          Será la que figure en el cronograma de pagos del crédito; el no pago
          oportuno generará mora y habilitará las consecuencias previstas en este
          Contrato.
        </C>
        <C t="8. IMPUTACIÓN DE PAGOS.">
          Los pagos efectuados por el Deudor se imputarán primero a gastos de
          cobranza, luego a intereses de mora, intereses remuneratorios y finalmente
          a capital, salvo pacto en contrario.
        </C>
        <C t="9. PAGO ANTICIPADO TOTAL O PARCIAL.">
          El Deudor podrá efectuar pagos anticipados totales o parciales del
          crédito, caso en el cual se liquidarán los intereses hasta la fecha
          efectiva de pago, conforme a la normatividad aplicable.
        </C>
        <C t="10. OBLIGACIONES DEL (DE LOS) DEUDOR(ES).">
          Además de las obligaciones de pago, el Deudor deberá mantener el bien
          objeto de financiación en correcto estado de funcionamiento, cumplir con
          las normas de tránsito y seguros obligatorios, y actualizar sus datos de
          contacto cuando se le solicite.
        </C>
        <C t="11. GESTIÓN DE COBRO.">
          Durante la vigencia del Contrato, la Acreedora podrá adelantar gestiones
          de cobro prejurídico y jurídico para obtener el pago de la obligación,
          pudiendo acudir a oficinas propias o a terceros especializados.
        </C>
        <C t="12. CONDICIONES EN CASO DE INCUMPLIMIENTO.">
          El incumplimiento de las obligaciones a cargo del Deudor faculta a la
          Acreedora para declarar vencido el plazo, exigir el pago total de la
          obligación y reportar la información negativa a las centrales de riesgo
          autorizadas, previa comunicación al Deudor en los términos del artículo 12
          de la Ley 1266 de 2008.
        </C>
        <C t="13. COBROS ADICIONALES Y GASTOS.">
          El Deudor asumirá los costos y gastos de cobranza, notificaciones,
          honorarios de abogados y cualquier otro concepto que se genere por la mora
          en el pago de la obligación, en los términos establecidos por la ley y este
          Contrato.
        </C>
        <C t="14. DACIÓN EN PAGO.">
          En caso de incumplimiento del Contrato, el Deudor podrá ofrecer a la
          Acreedora la dación en pago de la motocicleta u otro bien objeto del
          crédito, para que sea aplicada al pago de la obligación principal y sus
          accesorios, previa aceptación y avalúo realizado por la Acreedora, conforme
          a la autorización de retención y dación en pago que hace parte del paquete
          de crédito.
        </C>
      </DocLayout>

      <DocLayout {...p} docIndex={2} pageIndex={2} pageCount={2}>
        <C t="15. LISTA DE RIESGOS.">
          La Acreedora podrá dar por terminado el presente Contrato y exigir el pago
          inmediato de la obligación cuando se presenten situaciones relacionadas con
          actividades ilícitas, lavado de activos, financiación del terrorismo, uso
          indebido de la información, falsedad documental o cualquier otra
          circunstancia que pueda implicar riesgo para la Acreedora, de conformidad
          con sus políticas de prevención de lavado de activos y gestión de riesgos.
        </C>
        <C t="16. HONORARIOS Y GASTOS DE COBRANZA.">
          En caso de mora se generarán gastos de gestión de cobro a cargo del Deudor.
          En la etapa de cobranza prejudicial, que podrá extenderse hasta por 90 días
          calendario contados a partir de la fecha de incumplimiento, los honorarios
          podrán ser hasta del 10% sobre el valor de la obligación vencida, además de
          los gastos de comunicación, llamadas, visitas y demás costos razonables de
          gestión. Si la obligación pasa a cobranza judicial, el Deudor acepta el pago
          de los gastos y honorarios que se liquiden de conformidad con la normativa
          vigente, sin que éstos excedan el 20% del valor de la obligación en cobro,
          más impuestos, tasas y contribuciones aplicables.
        </C>
        <C t="17. MODIFICACIONES EN BENEFICIO DEL DEUDOR.">
          La Acreedora podrá modificar unilateralmente el presente Contrato siempre
          que dicha modificación constituya un beneficio para el Deudor, tales como
          disminución de tasas de interés, ampliación de plazo o reducción de cuotas.
          Toda modificación será comunicada al Deudor por los canales establecidos.
        </C>
        <C t="18. ENVÍO DE INFORMACIÓN.">
          El Deudor autoriza a la Acreedora para enviarle información relacionada con
          el crédito, extractos, estados de cuenta, avisos de cobro, campañas
          comerciales y demás comunicaciones a través de correo físico, correo
          electrónico, mensajes de texto, llamadas telefónicas, aplicaciones de
          mensajería o cualquier otro medio disponible.
        </C>
        <C t="19. AUTORIZACIONES.">
          El Deudor autoriza irrevocablemente a la Acreedora para consultar, reportar,
          procesar y divulgar su información crediticia, financiera, comercial y de
          contacto en las centrales de riesgo y demás bases de datos que la ley
          autorice, así como para compartirla con entidades aliadas, siempre con la
          finalidad de administrar, evaluar y recuperar el crédito otorgado.
        </C>
        <C t="20. CESIÓN, PETICIONES Y RETRACTO.">
          La Acreedora podrá ceder total o parcialmente los derechos derivados del
          presente Contrato a favor de terceros, sin necesidad de autorización
          adicional del Deudor, manteniendo éste las mismas condiciones pactadas. El
          Deudor podrá presentar peticiones, quejas o recursos relacionados con el
          crédito a través de los canales de atención de la Acreedora, los cuales
          serán tramitados dentro de los términos legales. El Deudor cuenta con un
          plazo de cinco (5) días hábiles contados a partir de la fecha de firma del
          presente Contrato para ejercer el derecho de retracto cuando sea
          procedente, en los términos establecidos por la ley, lo cual podrá implicar
          la devolución del bien financiado y el pago de los gastos en que se haya
          incurrido. Las devoluciones de dinero en virtud del retracto se realizarán
          por el mismo medio en que fue efectuado el pago, dentro de los treinta (30)
          días calendario siguientes al ejercicio del derecho.
        </C>
        <C t="21. IMPUESTOS.">
          Los impuestos que se causen con ocasión de la celebración o ejecución del
          presente Contrato, y en especial el impuesto de timbre, serán asumidos por
          el (los) Deudor(es).
        </C>
        <Text style={styles.paragraph}>
          Para constancia se firma en la ciudad de{" "}
          <Blank value={p.ciudad} width={120} />, el día ______ de ______________ de
          20____, en dos ejemplares de un mismo tenor.
        </Text>

        <View style={{ marginTop: 20 }}>
          <View style={[styles.signatureLine, { width: 260 }]} />
          <Text style={styles.signatureLabelBold}>LA ACREEDORA</Text>
          <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
          <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
          <Text style={styles.signatureLabel}>
            Representante: _______________________ C.C. No. _____________
          </Text>
        </View>

        <View style={styles.signaturesRow}>
          <Firma rol="EL DEUDOR" nombre={nombre} cc={cc} extra={[
            { label: "Tel.", value: p.celular },
            { label: "Dir.", value: p.direccionResidencia },
          ]} />
          <Firma rol="EL CODEUDOR" nombre={p.codeudorNombre} cc={p.codeudorCc} extra={[
            { label: "Tel.", value: p.codeudorTelefono },
            { label: "Dir.", value: p.codeudorDireccion },
          ]} />
        </View>
      </DocLayout>
    </>
  );
};
