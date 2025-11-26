// Pagina17.tsx
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
  title: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 2,
  },
  strong: {
    fontWeight: "bold",
  },
  clauseTitle: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina17Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  deudorNombre: string;
  deudorTipoId?: string; // CC, TI, etc.
  deudorDocumento: string;

  nitEmpresa?: string; // por defecto NIT de Verificarte
  nombreEmpresa?: string;
  ciudadEmpresa?: string;
}

export const Pagina17: React.FC<Pagina17Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  deudorNombre,
  deudorTipoId = "C.C.",
  deudorDocumento,
  nitEmpresa = "901155548-8",
  nombreEmpresa = "VERIFICARTE AAA S.A.S",
  ciudadEmpresa = "CALI (VALLE)",
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

      {/* TÍTULO CONTRATO */}
      <Text style={styles.title}>
        CONTRATO DE CRÉDITO PARA LA ADQUISICIÓN DE UNA MOTOCICLETA
      </Text>

      {/* INTRODUCCIÓN */}
      <Text style={styles.paragraph}>
        El presente contrato se celebra entre los suscritos a saber: (i) Por un
        lado <Text style={styles.strong}>{nombreEmpresa}</Text>, sociedad
        legalmente constituida bajo las leyes de Colombia, domiciliada en el
        municipio de {ciudadEmpresa}, identificada con el NIT {nitEmpresa} (la{" "}
        <Text style={styles.strong}>“Acreedora”</Text>); y (ii) por el otro,
        {" "}
        <Text style={styles.strong}>{deudorNombre}</Text>, identificado con{" "}
        {deudorTipoId} No. {deudorDocumento} (en adelante el{" "}
        <Text style={styles.strong}>“Deudor”</Text>). La Acreedora y el Deudor,
        conjuntamente las <Text style={styles.strong}>“Partes”</Text>, han
        convenido suscribir el presente contrato de crédito para la adquisición
        de una motocicleta (en adelante el{" "}
        <Text style={styles.strong}>“Contrato”</Text>), que se regirá por las
        siguientes:
      </Text>

      <Text style={styles.subtitle}>CLÁUSULAS</Text>

      {/* CLÁUSULAS (respetando el número y títulos) */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>1. CONDICIONES PARTICULARES DEL CRÉDITO. </Text>
        Las condiciones particulares del Contrato son las relacionadas e
        identificadas en el Documento “Condiciones del Crédito” (en adelante
        “Anexo Nro. 1”), el cual hace parte integral del presente Contrato.
        Mediante dicho anexo {nombreEmpresa} requiere para el otorgamiento del
        crédito la suscripción de un pagaré y carta de instrucciones de
        diligenciamiento como garantía de cumplimiento de la obligación.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>2. PLAZO. </Text>
        El plazo del presente Contrato será igual a la vigencia del crédito.
        Cualquier evento en que este documento autorice a {nombreEmpresa} a dar
        por terminado el Contrato faculta a la Acreedora para dar por exigible
        la totalidad de la obligación a cargo del (los) Deudor(es).
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>3. CLÁUSULA ACELERATORIA. </Text>
        Las partes acuerdan que {nombreEmpresa} podrá declarar exigible el
        plazo y exigir el pago total de lo adeudado, cuando se presenten los
        eventos de mora, incumplimiento u otras causales previstas en este
        Contrato, sin necesidad de requerimiento judicial o extrajudicial.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>4. FORMA DE PAGO. </Text>
        El pago del crédito se realizará en las cuotas y periodicidades
        acordadas en el Anexo Nro. 1, mediante consignación, débito automático,
        pago en caja o los demás mecanismos autorizados por {nombreEmpresa}.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>5. INTERESES REMUNERATORIOS. </Text>
        El presente Contrato generará intereses remuneratorios sobre el saldo
        insoluto del capital, calculados a la tasa máxima permitida por la ley
        o la tasa señalada en las Condiciones del Crédito, siempre dentro de
        los límites legales vigentes.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>6. INTERESES DE MORA. </Text>
        En caso de falta de pago oportuno, se causarán intereses de mora sobre
        las sumas vencidas a la tasa máxima permitida por las normas
        comerciales vigentes en la República de Colombia.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>7. FECHA LÍMITE DE PAGO DE LAS CUOTAS. </Text>
        Se establecerá como fecha límite de pago aquella que figure en el
        cronograma de pago del crédito; el no pago oportuno generará mora y
        habilitará las consecuencias previstas en este Contrato.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>8. IMPUTACIÓN DE PAGOS. </Text>
        Los pagos efectuados por el Deudor se imputarán primero a gastos de
        cobranza, luego a intereses de mora, intereses remuneratorios y
        finalmente a capital, salvo pacto en contrario.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>9. PAGO ANTICIPADO TOTAL O PARCIAL. </Text>
        El Deudor podrá efectuar pagos anticipados totales o parciales del
        crédito, caso en el cual se liquidarán los intereses hasta la fecha
        efectiva de pago, conforme a lo previsto en la normatividad aplicable.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>10. OBLIGACIONES DEL (LOS) DEUDOR(ES). </Text>
        Además de las obligaciones de pago, el Deudor deberá mantener el bien
        objeto de financiación en correcto estado de funcionamiento, cumplir
        con las normas de tránsito y seguros obligatorios, y actualizar sus
        datos de contacto cuando se le solicite.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>11. GESTIÓN DE COBRO. </Text>
        Durante la vigencia del presente Contrato, {nombreEmpresa} podrá
        adelantar gestiones de cobro prejurídico y jurídico para obtener el
        pago de la obligación, pudiendo acudir a oficinas propias o terceros
        especializados.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>12. CONDICIONES EN CASO DE INCUMPLIMIENTO. </Text>
        El incumplimiento de las obligaciones a cargo del Deudor faculta a la
        Acreedora para declarar vencido el plazo, exigir el pago total de la
        obligación y reportar la información negativa a las centrales de riesgo
        autorizadas, de acuerdo con la legislación vigente.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>13. COBROS ADICIONALES Y GASTOS. </Text>
        El Deudor reconoce que deberá asumir los costos y gastos de cobranza,
        notificaciones, honorarios de abogados y cualquier otro concepto que
        se genere por la mora en el pago de la obligación, en los términos
        establecidos por la ley y este Contrato.
      </Text>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. {nitEmpresa}
      </Text>
    </View>
  </Page>
);
