// Pagina2.tsx
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
    marginBottom: 12,
  },
  logoBox: {
    width: 110,
    marginRight: 15,
    justifyContent: "flex-start",
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
  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 8.3,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 3,
  },
  strong: {
    fontWeight: "bold",
  },
  subSectionTitleLeft: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  // Deudores / firmas
  deudoresRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 8,
  },
  deudorBlock: {
    width: "48%",
  },
  deudorLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  deudorValue: {
    fontSize: 8,
    marginBottom: 2,
  },
  avisoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  responsableLine: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 6,
  },
  deudoresRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  footer: {
    position: "absolute",
    left: 40,
    bottom: 25,
    fontSize: 7,
  },
});

export interface Pagina2Props {
  codigo: string;
  fecha: string;
  ciudad: string;
  deudor1Nombre: string;
  deudor1Cc: string;
  deudor2Nombre?: string;
  deudor2Cc?: string;
  logoSrc?: string;
}

export const Pagina2: React.FC<Pagina2Props> = ({
  codigo,
  fecha,
  ciudad,
  deudor1Nombre,
  deudor1Cc,
  deudor2Nombre,
  deudor2Cc,
  logoSrc,
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

      {/* TÍTULO PRINCIPAL */}
      <Text style={styles.sectionTitle}>
        AUTORIZACIÓN TRATAMIENTO DATOS PERSONALES
      </Text>

      {/* CUERPO DEL DOCUMENTO (puedes ajustar el texto exacto si lo necesitas) */}
      <Text style={styles.paragraph}>
        De conformidad con lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377
        de 2013, declaro que entrego de forma libre y voluntaria mis datos
        personales a <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text>,
        quien actúa como responsable del tratamiento de los mismos y a las
        demás sociedades o concesionarios que ésta designe como encargados.
      </Text>

      <Text style={styles.paragraph}>
        PRIMERO: en relación con mis datos personales: Por medio de este
        documento autorizo a <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> para dar
        tratamiento a mis datos personales con la finalidad de desarrollar su
        objeto social y la relación contractual que surja del ejercicio de sus
        servicios. Así mismo, autorizo para que se me envíe información, se
        gestionen mis solicitudes, se generen comunicaciones, extractos de
        cuentas y demás comunicaciones comerciales a través de diferentes
        medios, incluyendo mensajería instantánea (WhatsApp) o correos
        electrónicos.
      </Text>

      <Text style={styles.paragraph}>
        SEGUNDO: en relación con la información comercial: Autorizo de manera
        irrevocable a <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> para que consulte, solicite,
        suministre, reporte, procese, actualice, rectifique y conserve mi
        información en centrales de riesgo u otras fuentes de información
        crediticia y comercial, de acuerdo con la normatividad aplicable.
      </Text>

      <Text style={styles.paragraph}>
        Entiendo que el tratamiento de mis datos implica que estos serán
        almacenados en archivos físicos o electrónicos y podrán ser utilizados
        para fines comerciales, estadísticos, de cobranza, fidelización de
        clientes, evaluación de riesgo, prevención de fraude, conocimiento del
        cliente y demás finalidades compatibles con las aquí descritas.
      </Text>

      <Text style={styles.paragraph}>
        Cuento con los derechos de conocer, actualizar, rectificar y suprimir
        mi información personal, así como a revocar la presente autorización en
        los términos de la ley, mediante comunicación escrita dirigida al
        responsable del tratamiento.
      </Text>

      <Text style={styles.subSectionTitleLeft}>Para constancia firmo:</Text>

      {/* DEUDORES SUPERIOR */}
      <View style={styles.deudoresRowTop}>
        <View style={styles.deudorBlock}>
          <Text style={styles.deudorLabel}>DEUDOR:</Text>
          <Text style={styles.deudorValue}>{deudor1Nombre}</Text>
          <Text style={styles.deudorValue}>CC {deudor1Cc}</Text>
        </View>

        {deudor2Nombre && deudor2Cc && (
          <View style={styles.deudorBlock}>
            <Text style={styles.deudorLabel}>DEUDOR:</Text>
            <Text style={styles.deudorValue}>{deudor2Nombre}</Text>
            <Text style={styles.deudorValue}>CC {deudor2Cc}</Text>
          </View>
        )}
      </View>

      {/* AVISO DE PRIVACIDAD */}
      <Text style={styles.avisoTitle}>AVISO DE PRIVACIDAD</Text>
      <Text style={styles.responsableLine}>
        Responsable: <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> identificada con NIT.
        901155548-8
      </Text>

      <Text style={styles.paragraph}>
        Se informa que los datos personales suministrados serán tratados para
        las siguientes finalidades: medir niveles de satisfacción, informar
        sobre campañas de servicio, contactar para promociones, realizar
        campañas de fidelización, enviar invitaciones a eventos, realizar
        actualización de datos, realizar estudios de mercado, gestión de
        cobranza, comunicaciones sobre productos y servicios ofrecidos por{" "}
        <Text style={styles.strong}>VERIFICARTE AAA S.A.S</Text> y sus aliados
        comerciales, así como cualquier otra finalidad compatible con las
        anteriores.
      </Text>

      <Text style={styles.paragraph}>
        El tratamiento de la información se realizará de acuerdo con lo
        establecido en el “Manual de Políticas y Procedimientos para el
        Tratamiento de Datos Personales”, el cual contiene las políticas
        aplicables, los derechos del titular, y los mecanismos para conocer,
        actualizar, rectificar o suprimir los datos, así como para presentar
        consultas y reclamos relacionados con el tratamiento de los mismos.
      </Text>

      {/* DEUDORES INFERIOR (REPETICIÓN) */}
      <View style={styles.deudoresRowBottom}>
        <View style={styles.deudorBlock}>
          <Text style={styles.deudorLabel}>DEUDOR:</Text>
          <Text style={styles.deudorValue}>{deudor1Nombre}</Text>
          <Text style={styles.deudorValue}>CC {deudor1Cc}</Text>
        </View>

        {deudor2Nombre && deudor2Cc && (
          <View style={styles.deudorBlock}>
            <Text style={styles.deudorLabel}>DEUDOR:</Text>
            <Text style={styles.deudorValue}>{deudor2Nombre}</Text>
            <Text style={styles.deudorValue}>CC {deudor2Cc}</Text>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        VERIFICARTE AAA S.A.S. {"\n"}
        NIT. 901155848-8
      </Text>
    </View>
  </Page>
);
