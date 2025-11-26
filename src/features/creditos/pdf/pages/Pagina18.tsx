// Pagina18.tsx
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
  paragraph: {
    fontSize: 7.8,
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

export interface Pagina18Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  logoSrc?: string;

  nombreEmpresa?: string;
  nitEmpresa?: string;

  porcentajeHonorariosExtrajudicial?: string; // ej: "10%"
  porcentajeHonorariosJudicial?: string;      // ej: "20%"
  diasCobranzaExtrajudicial?: number;        // ej: 90
  diasRetracto?: number;                     // ej: 5
}

export const Pagina18: React.FC<Pagina18Props> = ({
  codigo,
  fecha,
  ciudad,
  logoSrc,
  nombreEmpresa = "VERIFICARTE AAA S.A.S",
  nitEmpresa = "901155548-8",
  porcentajeHonorariosExtrajudicial = "10%",
  porcentajeHonorariosJudicial = "20%",
  diasCobranzaExtrajudicial = 90,
  diasRetracto = 5,
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

      {/* CLÁUSULA 14 - DACIÓN EN PAGO */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>14. DACIÓN EN PAGO. </Text>
        El Deudor, con la firma del presente documento, manifiesta y acepta de
        forma expresa que, en caso de incumplimiento del Contrato, podrá
        ofrecer a {nombreEmpresa} la dación en pago de la motocicleta u otro
        bien objeto del crédito, para que sea aplicada al pago de la obligación
        principal y sus accesorios, previa aceptación y avalúo realizado por la
        Acreedora.
      </Text>

      {/* CLÁUSULA 15 - LISTA DE RIESGOS */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>15. LISTA DE RIESGOS. </Text>
        El(los) Deudor(es) declara(n) expresamente que entiende(n) que{" "}
        {nombreEmpresa} podrá dar por terminado el presente Contrato y exigir
        el pago inmediato de la obligación, cuando se presenten situaciones
        relacionadas con actividades ilícitas, lavado de activos, financiación
        del terrorismo, uso indebido de la información, falsedad documental o
        cualquier otra circunstancia que pueda implicar riesgo para la
        Acreedora, de conformidad con las políticas de prevención de lavado de
        activos y gestión de riesgos.
      </Text>

      {/* CLÁUSULA 16 - HONORARIOS Y GASTOS DE COBRANZA */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>16. HONORARIOS Y GASTOS DE COBRANZA. </Text>
        El Deudor reconoce que, en caso de mora, se generarán gastos de
        gestión de cobro a cargo suyo. En la etapa de{" "}
        <Text style={styles.strong}>cobranza prejudicial</Text>, que podrá
        extenderse hasta por {diasCobranzaExtrajudicial} días calendario
        contados a partir de la fecha de incumplimiento, los honorarios podrán
        ser hasta del {porcentajeHonorariosExtrajudicial} sobre el valor de la
        obligación vencida, además de los gastos de comunicación, llamadas,
        visitas y demás costos razonables de gestión.
      </Text>

      <Text style={styles.paragraph}>
        En caso de que la obligación pase a{" "}
        <Text style={styles.strong}>cobranza judicial</Text>, el Deudor acepta
        el pago de los gastos y honorarios que se liquiden de conformidad con
        la normativa vigente, sin que éstos excedan el{" "}
        {porcentajeHonorariosJudicial} del valor de la obligación en cobro, más
        impuestos, tasas y contribuciones que sean aplicables.
      </Text>

      {/* CLÁUSULA 17 - MODIFICACIONES EN BENEFICIO DEL DEUDOR */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>
          17. MODIFICACIONES EN BENEFICIO DE LOS DEUDORES.
        </Text>{" "}
        Las Partes acuerdan que {nombreEmpresa} podrá modificar unilateralmente
        el presente Contrato siempre que dicha modificación constituya un
        beneficio para el Deudor, tales como disminución de tasas de interés,
        ampliación de plazo o reducción de cuotas. Toda modificación será
        comunicada al Deudor por los canales establecidos.
      </Text>

      {/* CLÁUSULA 18 - ENVÍO DE INFORMACIÓN */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>18. ENVÍO DE INFORMACIÓN. </Text>
        El Deudor autoriza a {nombreEmpresa} para enviarle información
        relacionada con el crédito, extractos, estados de cuenta, avisos de
        cobro, campañas comerciales y demás comunicaciones a través de correo
        físico, correo electrónico, mensajes de texto, llamadas telefónicas,
        aplicaciones de mensajería o cualquier otro medio disponible.
      </Text>

      {/* CLÁUSULA 19 - AUTORIZACIONES DE DATOS */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>19. AUTORIZACIONES. </Text>
        El Deudor autoriza irrevocablemente a {nombreEmpresa} para consultar,
        reportar, procesar y divulgar su información crediticia, financiera,
        comercial y de contacto en las centrales de riesgo y demás bases de
        datos que la ley autorice, así como para compartirla con entidades
        aliadas, siempre con la finalidad de administrar, evaluar y recuperar
        el crédito otorgado.
      </Text>

      {/* CLÁUSULA 20 - CESIÓN DE DERECHOS / PETICIONES Y RETRACTO */}
      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>20. CESIÓN, PETICIONES Y RETRACTO. </Text>
        {nombreEmpresa} podrá ceder total o parcialmente los derechos derivados
        del presente Contrato a favor de terceros, sin necesidad de
        autorización adicional del Deudor, manteniendo éste las mismas
        condiciones pactadas. El Deudor podrá presentar peticiones, quejas o
        recursos relacionados con el crédito a través de los canales de
        atención de {nombreEmpresa}, los cuales serán tramitados dentro de los
        términos legales.
      </Text>

      <Text style={styles.paragraph}>
        De conformidad con lo previsto en la normativa de protección al
        consumidor financiero, el Deudor reconoce que cuenta con un plazo de{" "}
        {diasRetracto} días hábiles contados a partir de la fecha de firma del
        presente Contrato para ejercer el derecho de retracto cuando sea
        procedente, en los términos establecidos por la ley, lo cual podrá
        implicar la devolución del bien financiado y el pago de los gastos en
        que se haya incurrido.
      </Text>

      {/* FOOTER */}
      <Text style={styles.footer}>
        {nombreEmpresa} {"\n"}
        NIT. {nitEmpresa}
      </Text>
    </View>
  </Page>
);
