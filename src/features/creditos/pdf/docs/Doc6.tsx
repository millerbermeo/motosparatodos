// Doc6.tsx — Documento 6 de 11 (2 páginas)
// CONTRATO DE PRENDA SIN TENENCIA DEL ACREEDOR SOBRE VEHÍCULO AUTOMOTOR
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

export const Doc6: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <>
      <DocLayout {...p} docIndex={6} pageIndex={1} pageCount={2}>
        <Text style={styles.docTitle}>
          CONTRATO DE PRENDA SIN TENENCIA DEL ACREEDOR SOBRE VEHÍCULO AUTOMOTOR
        </Text>
        <Text style={styles.paragraph}>
          El presente contrato se celebra entre los suscritos, a saber: por un lado,{" "}
          <Text style={styles.strong}>{p.empresaNombre}</Text>, sociedad legalmente
          constituida, identificada con NIT{" "}
          <Text style={styles.strong}>{p.empresaNit}</Text>, quien en adelante se
          denominará LA ACREEDORA; y por otra parte,{" "}
          <Blank value={nombre} width={220} />, mayor de edad, identificado(a) con
          cédula de ciudadanía No. <Blank value={cc} width={120} />, quien en adelante
          se denominará EL DEUDOR. Entre las Partes se celebra un contrato de prenda
          abierta de primer grado sin tenencia del acreedor, el cual, de conformidad
          con el artículo 3 de la Ley 1676 de 2013, surte los efectos de una garantía
          mobiliaria, y se regirá por las siguientes cláusulas:
        </Text>
        <C t="PRIMERA – OBJETO:">
          EL DEUDOR constituye a favor de LA ACREEDORA derecho de prenda abierta sin
          tenencia del acreedor, para garantizar el cumplimiento de las obligaciones de
          crédito presentes y futuras, hasta por la suma que se pacte en los documentos
          correspondientes.
        </C>
        <C t="SEGUNDA – ESPECIFICACIONES DEL BIEN PRENDADO:">
          La prenda recae sobre el siguiente vehículo automotor, de exclusiva propiedad
          del DEUDOR:
        </C>
        <VehiculoTable
          marca={p.marca}
          linea={p.linea}
          modelo={p.modelo || p.modeloMoto}
          color={p.color}
          motor={p.motor || p.numeroMotor}
          chasis={p.chasis || p.numeroChasis}
          placa={p.placa}
          servicio
        />
        <C t="TERCERA – TENENCIA E INSPECCIÓN:">
          EL DEUDOR conserva la tenencia del vehículo dado en prenda, pero está
          obligado a permitir a LA ACREEDORA, o a quien ésta designe, la inspección del
          bien para comprobar su estado y existencia, así como a mantenerlo asegurado y
          en correcto estado de uso, funcionamiento y conservación. Para efectos de sus
          obligaciones y responsabilidades sobre el bien, las del DEUDOR son las mismas
          de un depositario.
        </C>
        <C t="CUARTA – COBERTURA DEL GRAVAMEN:">
          El gravamen prendario garantiza a LA ACREEDORA todas las obligaciones que
          surjan a su favor y a cargo del DEUDOR, presentes o futuras, incluyendo
          capital, intereses remuneratorios y moratorios, honorarios, gastos de
          cobranza y demás accesorios, hasta el monto máximo que se pacte en los
          documentos de crédito. La prenda se mantendrá vigente mientras existan
          obligaciones a cargo del DEUDOR, aun cuando éstas se renueven o reestructuren,
          sin necesidad de constituir una nueva prenda.
        </C>
        <C t="QUINTA – CRÉDITOS RESPALDADOS:">
          Los créditos respaldados podrán constar en pagarés, contratos o cualquier otro
          documento en el que figure EL DEUDOR como deudor, avalista o codeudor.
        </C>
        <C t="SEXTA – INSCRIPCIÓN DEL GRAVAMEN:">
          La presente prenda se inscribirá ante el organismo de tránsito correspondiente,
          para su anotación en el Registro Nacional Automotor – RUNT como limitación a la
          propiedad del vehículo, de conformidad con la Ley 769 de 2002 y las normas que
          regulan los trámites ante los organismos de tránsito. Lo anterior, sin perjuicio
          de que LA ACREEDORA pueda inscribir adicionalmente la garantía en el Registro de
          Garantías Mobiliarias administrado por Confecámaras, para efectos de su
          oponibilidad, prelación y de la utilización de los mecanismos de ejecución
          previstos en la Ley 1676 de 2013. Los gastos de inscripción, modificación y
          levantamiento del gravamen serán de cargo del DEUDOR.
        </C>
        <C t="SÉPTIMA – VENCIMIENTO ANTICIPADO:">
          El incumplimiento del DEUDOR en el pago de las cuotas o de cualquiera de sus
          obligaciones permitirá a LA ACREEDORA declarar vencida la obligación, hacer
          exigible en forma inmediata el pago total de la deuda garantizada y ejercer los
          mecanismos de ejecución de la garantía y las acciones judiciales y
          extrajudiciales a que haya lugar.
        </C>
        <C t="OCTAVA – EJECUCIÓN Y PAGO DIRECTO:">
          En razón de que la presente prenda surte los efectos de garantía mobiliaria
          (artículo 3 de la Ley 1676 de 2013), las Partes pactan expresamente el mecanismo
          de pago directo previsto en el artículo 60 de dicha ley. En consecuencia, ante el
          incumplimiento del DEUDOR, LA ACREEDORA podrá satisfacer su crédito directamente
          con el bien prendado, previo avalúo realizado por perito conforme a la ley. Si el
          valor del bien excede el monto de la obligación garantizada, LA ACREEDORA
          entregará el saldo al DEUDOR; si fuere inferior, subsistirá la obligación por el
          saldo insoluto. Lo anterior, sin perjuicio de la ejecución judicial de la
          garantía, a elección de la acreedora, y del procedimiento de transferencia de la
          propiedad del vehículo por ejecución de la garantía previsto en el Decreto 1835 de
          2015.
        </C>
      </DocLayout>

      <DocLayout {...p} docIndex={6} pageIndex={2} pageCount={2}>
        <C t="NOVENA – SEGUROS:">
          EL DEUDOR se compromete a mantener vigente el seguro sobre el vehículo objeto de
          la prenda, cediendo a favor de LA ACREEDORA los derechos derivados de la póliza
          hasta por el valor de la deuda.
        </C>
        <C t="DÉCIMA – GASTOS Y HONORARIOS:">
          Todos los gastos judiciales, extrajudiciales, de cobranza, seguros, impuestos y
          demás costos ocasionados por el incumplimiento serán de cargo del DEUDOR.
        </C>
        <C t="DÉCIMA PRIMERA – CESIÓN:">
          EL DEUDOR acepta desde ahora cualquier traspaso, endoso o cesión que LA ACREEDORA
          o sus causahabientes hicieren de los instrumentos a su cargo, así como de la
          prenda, con todas las consecuencias que la ley señale, en cuyo caso el nuevo
          acreedor quedará facultado para ejercer los mismos derechos aquí conferidos.
        </C>
        <C t="DÉCIMA SEGUNDA – ENAJENACIÓN DEL BIEN:">
          El bien dado en prenda podrá ser enajenado por EL DEUDOR, pero sólo se verificará
          la tradición al adquirente cuando LA ACREEDORA lo autorice o esté cubierto en su
          totalidad el crédito, debiendo hacerse constar el respectivo hecho en este
          documento o en notas suscritas por la acreedora.
        </C>
        <C t="DÉCIMA TERCERA – CLÁUSULA PENAL:">
          Si EL DEUDOR incumple cualquiera de las cláusulas pactadas en virtud de este
          contrato, pagará a LA ACREEDORA la suma de
          ________________________________________ ($________________) a título de pena
          pecuniaria, sin exceder los límites del artículo 867 del Código de Comercio y sin
          perjuicio de las demás acciones legales que correspondan, incluidas las derivadas
          del artículo 255 de la Ley 599 de 2000 (disposición de bien propio gravado con
          prenda), que EL DEUDOR manifiesta conocer.
        </C>
        <C t="DÉCIMA CUARTA – CANCELACIÓN DEL GRAVAMEN:">
          Una vez pagada la totalidad de las obligaciones garantizadas, se dará por
          terminada la garantía, quedando obligada LA ACREEDORA a entregar los documentos
          necesarios para el levantamiento de la prenda ante el organismo de tránsito y la
          correspondiente anotación en los registros respectivos.
        </C>
        <C t="DÉCIMA QUINTA – JURISDICCIÓN:">
          Para todos los efectos derivados del presente contrato, las Partes fijan como
          domicilio contractual la ciudad de <Blank value={p.ciudad} width={120} />, sin
          perjuicio de las reglas de competencia previstas en la ley.
        </C>
        <Text style={styles.paragraph}>
          Para constancia se firma a los ______ días del mes de ______________ de ________,
          en dos (2) ejemplares de un mismo tenor: uno con destino al organismo de tránsito
          y otro para el paquete de crédito.
        </Text>

        <View style={styles.signaturesRow}>
          <View style={styles.signatureBlock}>
            <View style={{ height: 28 }} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabelBold}>LA ACREEDORA</Text>
            <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
            <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
          </View>
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
        </View>
      </DocLayout>
    </>
  );
};
