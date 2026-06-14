import React from "react";
import { Document } from "@react-pdf/renderer";

import { Doc1 } from "./docs/Doc1";
import { Doc2 } from "./docs/Doc2";
import { Doc3 } from "./docs/Doc3";
import { Doc4 } from "./docs/Doc4";
import { Doc5 } from "./docs/Doc5";
import { Doc6 } from "./docs/Doc6";
import { Doc7 } from "./docs/Doc7";
import { Doc8 } from "./docs/Doc8";
import { Doc9 } from "./docs/Doc9";
import { Doc10 } from "./docs/Doc10";
import { Doc11 } from "./docs/Doc11";

type DocComponent = React.FC<any>;

// Orden de los 11 documentos del paquete
const documentos: DocComponent[] = [
  Doc1,
  Doc2,
  Doc3,
  Doc4,
  Doc5,
  Doc6,
  Doc7,
  Doc8,
  Doc9,
  Doc10,
  Doc11,
];

export interface EmpresaInput {
  nombre: string;
  nit: string;
  logoSrc?: string;
  ciudad?: string;
}

export interface PaqueteCreditoPDFDocProps {
  data: any;
  /** Empresa elegida en el alert (nombre, nit, logo). Si no llega, se toma de data. */
  empresa?: EmpresaInput;
}

const adaptData = (data: any, empresa?: EmpresaInput) => {
  const safeFecha = (data.fecha ?? "").toString().split(" ")[0] || data.fecha;

  const nombreCompleto =
    data.nombre ||
    data.nombreTitular1 ||
    [
      data.primerNombre,
      data.segundoNombre,
      data.primerApellido,
      data.segundoApellido,
    ]
      .filter(Boolean)
      .join(" ");

  const doc = data.numeroDocumento ?? data.cc ?? "";
  const dir = data.direccionResidencia ?? data.direccionTitular1 ?? "";
  const tel = data.celular ?? data.telefonoTitular1 ?? "";
  const ciudad = data.ciudad ?? data.ciudadResidencia ?? "Cali";
  const lugarExp = data.lugarExpedicion ?? data.lugarExpedicionTitular1 ?? "";

  // ===== EMPRESA dinámica (nombre, NIT, logo) =====
  const empresaNombre =
    empresa?.nombre ?? data.empresaNombre ?? data.nombreEmpresa ?? "";
  const empresaNit = empresa?.nit ?? data.empresaNit ?? data.nitEmpresa ?? "";
  const logoSrc = empresa?.logoSrc ?? data.logoSrc;
  const empresaCiudad = empresa?.ciudad ?? ciudad;

  return {
    ...data,

    // ======== EMPRESA / ACREEDOR (dinámico) =========
    empresaNombre,
    empresaNit,
    nombreEmpresa: empresaNombre,
    nitEmpresa: empresaNit,
    logoSrc,

    // ======== ENCABEZADO =========
    codigo: data.codigo,
    fecha: safeFecha,
    ciudad: empresaCiudad,

    // ======== TITULAR / DEUDOR =========
    nombre: nombreCompleto,
    nombreCompleto,
    nombreTitular1: data.nombreTitular1 ?? nombreCompleto,
    numeroDocumento: doc,
    cc: data.cc ?? doc,
    tipoDocumento: data.tipoDocumento ?? "Cédula de ciudadanía",
    lugarExpedicion: lugarExp,
    direccionResidencia: dir,
    celular: tel,
    email: data.email ?? "",

    // ======== MOTO / CRÉDITO =========
    marca: data.marca ?? "",
    linea: data.linea ?? data.modeloMoto ?? data.modelo ?? "",
    modelo: data.modeloMoto ?? data.modelo ?? "",
    modeloMoto: data.modeloMoto ?? data.modelo ?? "",
    color: data.color ?? "",
    motor: data.motor ?? data.numeroMotor ?? "",
    numeroMotor: data.numeroMotor ?? data.motor ?? "",
    chasis: data.chasis ?? data.numeroChasis ?? "",
    numeroChasis: data.numeroChasis ?? data.chasis ?? "",
    placa: data.placa ?? "",
    valorMoto: data.valorMoto ?? "",
    cuotaInicial: data.cuotaInicial ?? "",
    cuotas: data.cuotas ?? "",
    valorCuota: data.valorCuota ?? "",

    // ======== CODEUDOR =========
    codeudorNombre: data.codeudorNombre ?? "",
    codeudorCc: data.codeudorCc ?? data.codeudorCcNit ?? "",
    codeudorDireccion: data.codeudorDireccion ?? "",
    codeudorTelefono: data.codeudorTelefono ?? "",
  };
};

export const PaqueteCreditoPDFDoc: React.FC<PaqueteCreditoPDFDocProps> = ({
  data,
  empresa,
}) => {
  const datosAdaptados = adaptData(data, empresa);

  return (
    <Document>
      {documentos.map((Doc, index) => (
        <Doc key={index} {...datosAdaptados} />
      ))}
    </Document>
  );
};
