// Doc11.tsx — Documento 11 de 11
// ANEXO TÉCNICO – IMPRONTAS DEL VEHÍCULO
import React from "react";
import { Text, View } from "@react-pdf/renderer";
import {
  DocLayout,
  styles,
  VehiculoTable,
  type DocBaseProps,
} from "../paqueteShared";

export const Doc11: React.FC<DocBaseProps> = (p) => (
  <DocLayout {...p} docIndex={11} pageIndex={1} pageCount={1}>
    <Text style={styles.docTitle}>ANEXO TÉCNICO – IMPRONTAS DEL VEHÍCULO</Text>
    <VehiculoTable
      marca={p.marca}
      linea={p.linea}
      modelo={p.modelo || p.modeloMoto}
      color={p.color}
      motor={p.motor || p.numeroMotor}
      chasis={p.chasis || p.numeroChasis}
      placa={p.placa}
    />

    <Text style={styles.improntaTitle}>IMPRONTA DEL MOTOR</Text>
    <View style={styles.improntaBox} />

    <Text style={styles.improntaTitle}>IMPRONTA DEL CHASIS</Text>
    <View style={styles.improntaBox} />
  </DocLayout>
);
