import React from "react";
import { Document } from "@react-pdf/renderer";

// importa todas las páginas
import { Pagina1 } from "./pages/Pagina1";
import { Pagina2 } from "./pages/Pagina2";
import { Pagina3 } from "./pages/Pagina3";
import { Pagina4 } from "./pages/Pagina4";
import { Pagina5 } from "./pages/Pagina5";
import { Pagina6 } from "./pages/Pagina6";
import { Pagina7 } from "./pages/Pagina7";
import { Pagina8 } from "./pages/Pagina8";
import { Pagina9 } from "./pages/Pagina9";
import { Pagina10 } from "./pages/Pagina10";
import { Pagina11 } from "./pages/Pagina11";
import { Pagina12 } from "./pages/Pagina12";
import { Pagina13 } from "./pages/Pagina13";
import { Pagina14 } from "./pages/Pagina14";
import { Pagina15 } from "./pages/Pagina15";
import { Pagina16 } from "./pages/Pagina16";
import { Pagina17 } from "./pages/Pagina17";
import { Pagina18 } from "./pages/Pagina18";
import { Pagina19 } from "./pages/Pagina19";
import { Pagina20 } from "./pages/Pagina20";
import { Pagina21 } from "./pages/Pagina21";
import { Pagina22 } from "./pages/Pagina22";
import { Pagina23 } from "./pages/Pagina23";
import { Pagina24 } from "./pages/Pagina24";
import { Pagina25 } from "./pages/Pagina25";

// 🔴 para no pelearnos con TypeScript por ahora
type PaginaComponent = React.FC<any>;

const paginas: PaginaComponent[] = [
  Pagina1 as PaginaComponent,
  Pagina2 as PaginaComponent,
  Pagina3 as PaginaComponent,
  Pagina4 as PaginaComponent,
  Pagina5 as PaginaComponent,
  Pagina6 as PaginaComponent,
  Pagina7 as PaginaComponent,
  Pagina8 as PaginaComponent,
  Pagina9 as PaginaComponent,
  Pagina10 as PaginaComponent,
  Pagina11 as PaginaComponent,
  Pagina12 as PaginaComponent,
  Pagina13 as PaginaComponent,
  Pagina14 as PaginaComponent,
  Pagina15 as PaginaComponent,
  Pagina16 as PaginaComponent,
  Pagina17 as PaginaComponent,
  Pagina18 as PaginaComponent,
  Pagina19 as PaginaComponent,
  Pagina20 as PaginaComponent,
  Pagina21 as PaginaComponent,
  Pagina22 as PaginaComponent,
  Pagina23 as PaginaComponent,
  Pagina24 as PaginaComponent,
  Pagina25 as PaginaComponent,
];

export interface PaqueteCreditoPDFDocProps {
  data: any; // luego lo tipeamos bonito, por ahora “mientras”
}

/**
 * Adaptador: toma tu objeto `data` y crea alias para que coincida con
 * los nombres de props que usan las páginas (nombreTitular1, numeroMotor, etc).
 */
const adaptData = (data: any) => {
  // normalizar algunas fechas (por si vienen con hora)
  const safeFecha = (data.fecha ?? "").toString().split(" ")[0] || data.fecha;
  const safeFechaNac = (data.fechaNacimiento ?? "").toString().split("T")[0];
  const safeFechaExp = (data.fechaExpedicion ?? "").toString().split("T")[0];

  // nombre completo
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

  return {
    ...data,

    // ======== GENERALES / ENCABEZADO =========
    codigo: data.codigo,
    fecha: safeFecha,
    ciudad: data.ciudad ?? data.ciudadResidencia ?? "Cali",
    logoSrc: data.logoSrc ?? "/verificarte.jpg",
    estadoCredito: data.estadoCredito,
    agencia: data.agencia,
    asesor: data.asesor,

    // ======== TITULAR / DEUDOR =========
    nombre: nombreCompleto,
    nombreTitular1: data.nombreTitular1 ?? nombreCompleto,
    nombreCompleto: nombreCompleto,

    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    tipoDocumentoTitular1:
      data.tipoDocumentoTitular1 ?? data.tipoDocumento ?? "Cédula de ciudadanía",
    numeroDocumentoTitular1:
      data.numeroDocumentoTitular1 ?? data.numeroDocumento,
    cc: data.cc ?? data.numeroDocumento,
    ccTitular1: data.ccTitular1 ?? data.cc ?? data.numeroDocumento,

    fechaExpedicion: safeFechaExp,
    lugarExpedicion: data.lugarExpedicion,
    fechaExpedicionTitular1: safeFechaExp,
    lugarExpedicionTitular1: data.lugarExpedicion,

    fechaNacimiento: safeFechaNac,
    fechaNacimientoTitular1: safeFechaNac,

    ciudadResidencia: data.ciudadResidencia ?? data.ciudad,
    barrioResidencia: data.barrioResidencia ?? "",
    direccionResidencia: data.direccionResidencia,
    telefonoFijo: data.telefonoFijo ?? "",
    celular: data.celular,
    email: data.email,
    estadoCivil: data.estadoCivil,
    personasACargo: data.personasACargo,
    tipoVivienda: data.tipoVivienda,
    costoArriendo: data.costoArriendo,
    fincaRaiz: data.fincaRaiz,

    ciudadTitular1: data.ciudadTitular1 ?? data.ciudadResidencia ?? data.ciudad,
    barrioTitular1: data.barrioTitular1 ?? data.barrioResidencia ?? "",
    direccionTitular1:
      data.direccionTitular1 ?? data.direccionResidencia ?? "",
    telefonoTitular1: data.telefonoTitular1 ?? data.celular,
    telefonoFijoTitular1: data.telefonoFijoTitular1 ?? data.telefonoFijo,
    emailTitular1: data.emailTitular1 ?? data.email,
    estadoCivilTitular1: data.estadoCivilTitular1 ?? data.estadoCivil,

    // ======== LABORAL TITULAR =========
    empresaTitular1: data.empresaTitular1 ?? "",
    direccionEmpresaTitular1: data.direccionEmpresaTitular1 ?? "",
    telefonoEmpresaTitular1: data.telefonoEmpresaTitular1 ?? "",
    cargoTitular1: data.cargoTitular1 ?? "",
    tipoContratoTitular1: data.tipoContratoTitular1 ?? "",
    tiempoServicioTitular1: data.tiempoServicioTitular1 ?? "",
    salarioTitular1: data.salarioTitular1 ?? "0.00",

    // ======== MOTO / CRÉDITO =========
    marca: data.marca,
    linea: data.linea ?? data.modeloMoto ?? data.modelo,
    modeloMoto: data.modeloMoto ?? data.modelo,
    modelo: data.modeloMoto ?? data.modelo,
    color: data.color ?? "negro",
    motor: data.motor,
    numeroMotor: data.numeroMotor ?? data.motor,
    chasis: data.chasis,
    numeroChasis: data.numeroChasis ?? data.chasis,
    placa: data.placa,
    valorMoto: data.valorMoto,
    cuotaInicial: data.cuotaInicial,
    cuotas: data.cuotas,
    valorCuota: data.valorCuota,
    fechaEntrega: data.fechaEntrega,

    // ====== otros alias típicos por si alguna página los pide ======
    nombreCliente: nombreCompleto,
    documentoCliente: data.numeroDocumento,
    ciudadCliente: data.ciudadResidencia ?? data.ciudad,
    direccionCliente: data.direccionResidencia,
    telefonoCliente: data.celular,
  };
};

export const PaqueteCreditoPDFDoc: React.FC<PaqueteCreditoPDFDocProps> = ({
  data,
}) => {
  const datosAdaptados = adaptData(data);

  console.log("Generando PDF con data original:", data);
  console.log("Generando PDF con data adaptada:", datosAdaptados);

  return (
    <Document>
      {paginas.map((Pagina, index) => (
        <Pagina key={index} {...datosAdaptados} />
      ))}
    </Document>
  );
};
