// Doc9.tsx — Documento 9 de 11
// AUTORIZACIÓN DE DESEMBOLSO DEL CRÉDITO
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DocLayout, styles, type DocBaseProps } from "../paqueteShared";

const Row: React.FC<{ k: string; v?: string; last?: boolean }> = ({ k, v, last }) => (
  <View style={last ? styles.kvRowLast : styles.kvRow}>
    <Text style={styles.kvKey}>{k}</Text>
    <Text style={styles.kvVal}>{v || "_________________________"}</Text>
  </View>
);

export const Doc9: React.FC<DocBaseProps> = (p) => {
  const nombre = p.nombre || p.nombreCompleto;
  const cc = p.numeroDocumento || p.cc;
  return (
    <DocLayout {...p} docIndex={9} pageIndex={1} pageCount={1}>
      <Text style={styles.docTitle}>AUTORIZACIÓN DE DESEMBOLSO DEL CRÉDITO</Text>

      <View style={styles.kvTable}>
        <Row k="Fecha de diligenciamiento" v={p.fecha} />
        <Row k="Número de solicitud" v={p.codigo} />
        <Row k="Tipo de documento de identidad" v="Cédula de ciudadanía" />
        <Row k="Número de documento de identidad" v={cc} />
        <Row k="Nombres y apellidos del solicitante" v={nombre} last />
      </View>

      <Text style={styles.paragraph}>
        Autorizo a <Text style={styles.strong}>{p.empresaNombre}</Text> para que el
        desembolso en pesos, producto del crédito otorgado, sea consignado a la
        sociedad comercial identificada de la siguiente forma:
      </Text>

      <View style={styles.kvTable}>
        <Row k="Código de desembolso" v="" />
        <Row k="Nombre del beneficiario" v={p.empresaNombre} />
        <Row k="No. del documento de identidad" v={p.empresaNit} />
        <Row k="Banco" v="BANCOLOMBIA" />
        <Row k="Tipo de cuenta" v="CUENTA DE AHORROS" />
        <Row k="Número de cuenta" v="" />
        <Row k="Valor" v={p.valorMoto ? `$ ${p.valorMoto}` : "$ _________________"} last />
      </View>

      <View style={{ marginTop: 28 }}>
        <View style={[styles.signatureLine, { width: 260 }]} />
        <Text style={styles.signatureLabelBold}>Firma del solicitante del crédito</Text>
        <Text style={styles.signatureLabel}>
          Nombre: {nombre || "_________________________________________"}
        </Text>
        <Text style={styles.signatureLabel}>
          C.C. No. {cc || "_____________________"}
        </Text>
      </View>
    </DocLayout>
  );
};
