// Doc1.tsx — Documento 1 de 11
// AUTORIZACIÓN INTEGRADA TRATAMIENTO DE DATOS / CENTRALES DE RIESGO
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, type DocBaseProps } from "../paqueteShared";

export const Doc1: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={1} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>
        AUTORIZACIÓN INTEGRADA PARA EL TRATAMIENTO DE DATOS PERSONALES Y PARA LA
        CONSULTA, REPORTE Y PROCESAMIENTO DE INFORMACIÓN CREDITICIA, FINANCIERA Y
        COMERCIAL
      </Text>

      <Text style={styles.paragraph}>
        Yo, <Blank value={nombre} width={260} />, mayor de edad, identificado(a)
        con cédula de ciudadanía No. <Blank value={cc} width={140} />, actuando en
        calidad de titular de la información, de manera previa, libre, expresa,
        voluntaria e informada, declaro y autorizo lo siguiente a favor de{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, identificada con NIT{" "}
        <Text style={styles.strong}>{p.empresaNit}</Text>, en adelante LA
        COMPAÑÍA, quien actúa como responsable del tratamiento de mis datos
        personales:
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>
          PRIMERO – TRATAMIENTO DE DATOS PERSONALES:
        </Text>{" "}
        De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, autorizo
        a LA COMPAÑÍA para recolectar, almacenar, usar, circular, actualizar y
        suprimir mis datos personales, con la finalidad de desarrollar su objeto
        social y la relación contractual que surja del ejercicio de sus servicios;
        gestionar mis solicitudes; generar comunicaciones, extractos de cuenta y
        demás comunicaciones comerciales y de cobranza a través de cualquier medio,
        incluyendo correo físico, correo electrónico, mensajes de texto, llamadas
        telefónicas y aplicaciones de mensajería instantánea (WhatsApp); medir
        niveles de satisfacción; informar sobre campañas de servicio y
        fidelización; realizar actualización de datos y estudios de mercado; así
        como para fines comerciales, estadísticos, de evaluación de riesgo,
        prevención de fraude, conocimiento del cliente y demás finalidades
        compatibles con las aquí descritas.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>
          SEGUNDO – CONSULTA Y REPORTE EN CENTRALES DE RIESGO:
        </Text>{" "}
        En los términos de la Ley 1266 de 2008, autorizo de manera expresa e
        irrevocable a {p.empresaNombre}, o a quien represente sus derechos u
        ostente en el futuro la calidad de acreedor, para consultar, solicitar,
        suministrar, reportar, procesar, actualizar, rectificar y divulgar ante las
        centrales de información y riesgo (entre otras, TransUnion – DataCrédito) y
        ante cualquier entidad pública o privada que administre bases de datos,
        toda la información referida a mi comportamiento crediticio, financiero,
        comercial y de servicios. Conozco que el alcance de esta autorización
        implica que mi comportamiento frente a las obligaciones contraídas será
        registrado con el objeto de suministrar información suficiente y adecuada al
        mercado sobre el estado de mis obligaciones.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>TERCERO – DERECHOS DEL TITULAR:</Text>{" "}
        Declaro que conozco mis derechos a conocer, actualizar, rectificar y
        suprimir mi información personal, a revocar la presente autorización en los
        términos de la ley y a presentar consultas y reclamos ante el responsable
        del tratamiento, mediante comunicación escrita dirigida a LA COMPAÑÍA, de
        acuerdo con su Manual de Políticas y Procedimientos para el Tratamiento de
        Datos Personales.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.clauseTitle}>CUARTO – ACEPTACIÓN:</Text> Declaro que he
        leído y comprendido a cabalidad el contenido de la presente autorización y
        que acepto las finalidades en ella descritas y las condiciones que de ella
        se derivan.
      </Text>

      <Text style={styles.paragraph}>
        Para constancia se firma en la ciudad de{" "}
        <Blank value={p.ciudad} width={120} />, el día ______ del mes de
        ______________ del año ________.
      </Text>

      <View style={{ marginTop: 30 }}>
        <View style={[styles.signatureLine, { width: 260 }]} />
        <Text style={styles.signatureLabelBold}>EL TITULAR DE LA INFORMACIÓN</Text>
        <Text style={styles.signatureLabel}>
          Nombre: {nombre || "_________________________________________"}
        </Text>
        <Text style={styles.signatureLabel}>
          C.C. No. {cc || "_____________________"}
        </Text>
        <Text style={styles.signatureLabel}>
          Dirección: {p.direccionResidencia || "_______________________________________"}
        </Text>
        <Text style={styles.signatureLabel}>
          Teléfono: {p.celular || "_____________________"}
        </Text>
      </View>
    </DocLayout>
  );
};
