// Doc8.tsx — Documento 8 de 11
// PODER PARA TRÁMITE DE TRASPASO
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, Blank, type DocBaseProps } from "../paqueteShared";

const Row: React.FC<{ k: string; v?: string; last?: boolean }> = ({ k, v, last }) => (
  <View style={last ? styles.kvRowLast : styles.kvRow}>
    <Text style={styles.kvKey}>{k}</Text>
    <Text style={styles.kvVal}>{v || "_________________________"}</Text>
  </View>
);

export const Doc8: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={8} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>PODER PARA TRÁMITE DE TRASPASO</Text>
      <Text style={styles.paragraph}>Señores</Text>
      <Text style={[styles.paragraph, styles.strong]}>
        DEPARTAMENTO ADMINISTRATIVO DE TRÁNSITO Y TRANSPORTE
      </Text>
      <Text style={styles.paragraph}>La ciudad</Text>
      <Text style={styles.paragraph}>
        Referencia: Poder para trámite de traspaso
      </Text>
      <Text style={styles.paragraph}>
        Yo, <Blank value={nombre} width={240} />, mayor de edad, identificado(a) con
        cédula de ciudadanía No. <Blank value={cc} width={120} /> expedida en{" "}
        <Blank value={p.lugarExpedicion} width={120} />, por medio del presente
        documento otorgo poder especial, amplio y suficiente a{" "}
        <Text style={styles.strong}>{p.empresaNombre}</Text>, o a quien represente sus
        derechos, para que en mi nombre y representación realice el trámite de traspaso
        del vehículo automotor que a continuación se describe:
      </Text>

      <View style={styles.kvTable}>
        <Row k="CLASE" v="Motocicleta" />
        <Row k="MARCA" v={p.marca} />
        <Row k="LÍNEA" v={p.linea} />
        <Row k="MODELO" v={p.modelo || p.modeloMoto} />
        <Row k="COLOR" v={p.color} />
        <Row k="No. MOTOR" v={p.motor || p.numeroMotor} />
        <Row k="No. CHASIS" v={p.chasis || p.numeroChasis} />
        <Row k="PLACA" v={p.placa} last />
      </View>

      <Text style={styles.paragraph}>
        Mi apoderado está facultado para realizar todos los actos, gestiones y
        diligencias que sean necesarios para el perfeccionamiento del contrato de
        compraventa. Por lo anterior, solicito tener a la persona anteriormente
        mencionada como mi apoderado para los efectos descritos en este memorial.
      </Text>
      <Text style={styles.paragraph}>Atentamente,</Text>

      <View style={styles.signaturesRow}>
        <View style={styles.signatureBlock}>
          <View style={{ height: 28 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabelBold}>PODERDANTE</Text>
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
          <Text style={styles.signatureLabelBold}>ACEPTO – APODERADO</Text>
          <Text style={styles.signatureLabelBold}>{p.empresaNombre}</Text>
          <Text style={styles.signatureLabel}>NIT {p.empresaNit}</Text>
        </View>
      </View>
    </DocLayout>
  );
};
