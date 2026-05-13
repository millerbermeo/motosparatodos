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

const VERIFICARTE_NOMBRE = "VERIFICARTE AAA S.A.S.";
const VERIFICARTE_NIT = "901155548-8";

const adaptData = (data: any) => {
  const safeFecha = (data.fecha ?? "").toString().split(" ")[0] || data.fecha;
  const safeFechaNac = (data.fechaNacimiento ?? "").toString().split("T")[0];
  const safeFechaExp = (data.fechaExpedicion ?? "").toString().split("T")[0];

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

  return {
    ...data,

    // ======== GENERALES / ENCABEZADO =========
    codigo: data.codigo,
    fecha: safeFecha,
    ciudad,
    logoSrc: data.logoSrc ?? "/verificarte.jpg",
    estadoCredito: data.estadoCredito,
    agencia: data.agencia,
    asesor: data.asesor,

    // ======== TITULAR / DEUDOR =========
    nombre: nombreCompleto,
    nombreTitular1: data.nombreTitular1 ?? nombreCompleto,
    nombreCompleto,

    tipoDocumento: data.tipoDocumento ?? "Cédula de ciudadanía",
    numeroDocumento: doc,
    tipoDocumentoTitular1: data.tipoDocumentoTitular1 ?? data.tipoDocumento ?? "Cédula de ciudadanía",
    numeroDocumentoTitular1: data.numeroDocumentoTitular1 ?? doc,
    cc: data.cc ?? doc,
    ccTitular1: data.ccTitular1 ?? data.cc ?? doc,

    fechaExpedicion: safeFechaExp,
    lugarExpedicion: lugarExp,
    fechaExpedicionTitular1: safeFechaExp,
    lugarExpedicionTitular1: lugarExp,

    fechaNacimiento: safeFechaNac,
    fechaNacimientoTitular1: safeFechaNac,

    ciudadResidencia: data.ciudadResidencia ?? ciudad,
    barrioResidencia: data.barrioResidencia ?? "",
    direccionResidencia: dir,
    telefonoFijo: data.telefonoFijo ?? "",
    celular: tel,
    email: data.email ?? "",
    estadoCivil: data.estadoCivil ?? "",
    personasACargo: data.personasACargo ?? "",
    tipoVivienda: data.tipoVivienda ?? "",
    costoArriendo: data.costoArriendo ?? "",
    fincaRaiz: data.fincaRaiz ?? "",

    ciudadTitular1: data.ciudadTitular1 ?? data.ciudadResidencia ?? ciudad,
    barrioTitular1: data.barrioTitular1 ?? data.barrioResidencia ?? "",
    direccionTitular1: data.direccionTitular1 ?? dir,
    telefonoTitular1: data.telefonoTitular1 ?? tel,
    telefonoFijoTitular1: data.telefonoFijoTitular1 ?? data.telefonoFijo ?? "",
    emailTitular1: data.emailTitular1 ?? data.email ?? "",
    estadoCivilTitular1: data.estadoCivilTitular1 ?? data.estadoCivil ?? "",

    // ======== LABORAL TITULAR =========
    empresaTitular1: data.empresaTitular1 ?? "",
    direccionEmpresaTitular1: data.direccionEmpresaTitular1 ?? "",
    telefonoEmpresaTitular1: data.telefonoEmpresaTitular1 ?? "",
    cargoTitular1: data.cargoTitular1 ?? "",
    tipoContratoTitular1: data.tipoContratoTitular1 ?? "",
    tiempoServicioTitular1: data.tiempoServicioTitular1 ?? "",
    salarioTitular1: data.salarioTitular1 ?? "0.00",

    // ======== MOTO / CRÉDITO =========
    marca: data.marca ?? "",
    linea: data.linea ?? data.modeloMoto ?? data.modelo ?? "",
    modeloMoto: data.modeloMoto ?? data.modelo ?? "",
    modelo: data.modeloMoto ?? data.modelo ?? "",
    color: data.color ?? "",
    motor: data.motor ?? "",
    numeroMotor: data.numeroMotor ?? data.motor ?? "",
    chasis: data.chasis ?? "",
    numeroChasis: data.numeroChasis ?? data.chasis ?? "",
    placa: data.placa ?? "",
    valorMoto: data.valorMoto ?? "",
    cuotaInicial: data.cuotaInicial ?? "",
    cuotas: data.cuotas ?? "",
    valorCuota: data.valorCuota ?? "",
    fechaEntrega: data.fechaEntrega ?? "",

    // ======== ALIAS CLIENTE (páginas usan distintos nombres) =========
    nombreCliente: nombreCompleto,
    clienteNombre: nombreCompleto,
    clienteCc: doc,
    clienteLugarExpedicion: lugarExp,
    documentoCliente: doc,
    ciudadCliente: data.ciudadResidencia ?? ciudad,
    direccionCliente: dir,
    telefonoCliente: tel,

    // ======== ALIAS DEUDOR (páginas 5,6,9,10,11,12,13,14,15,19) =========
    deudorNombre: nombreCompleto,
    deudorCc: doc,
    deudorCcNit: doc,
    deudorDocumento: doc,
    deudorTipoId: data.tipoDocumento ?? "CC",
    deudorDireccion: dir,
    deudorTelefono: tel,
    deudorCiudadExpedicion: lugarExp,

    // ======== PAGARÉ (páginas 3,4) =========
    pagareNumero: data.codigo,
    deudor1Nombre: nombreCompleto,
    deudor1Cc: doc,
    deudor2Nombre: data.deudor2Nombre ?? "",
    deudor2Cc: data.deudor2Cc ?? "",

    // ======== CODEUDOR (opcional — si llega en data) =========
    codeudorNombre: data.codeudorNombre ?? "",
    codeudorCcNit: data.codeudorCcNit ?? "",
    codeudorDireccion: data.codeudorDireccion ?? "",
    codeudorTelefono: data.codeudorTelefono ?? "",
    codeudorCc: data.codeudorCc ?? "",

    // ======== MANDANTE / PODER (páginas 7,8) =========
    mandanteNombre: nombreCompleto,
    mandanteCc: doc,
    mandatarioNombre: VERIFICARTE_NOMBRE,
    mandatarioCc: VERIFICARTE_NIT,
    poderdanteNombre: nombreCompleto,
    poderdanteCc: doc,
    poderdanteCiudadExpedicion: lugarExp,
    apoderadoNombre: VERIFICARTE_NOMBRE,

    // ======== ACREEDOR (páginas 11,12,13,14,15) =========
    acreedorNombre: VERIFICARTE_NOMBRE,
    acreedorId: VERIFICARTE_NIT,
    acreedorNit: VERIFICARTE_NIT,
    acreedorCc: VERIFICARTE_NIT,

    // ======== VENDEDOR / COMPRADOR (página 22,24) =========
    vendedorNombre: VERIFICARTE_NOMBRE,
    vendedorId: VERIFICARTE_NIT,
    vendedorDireccion: "Cali, Valle del Cauca",
    vendedorTelefono: "",
    compradorNombre: nombreCompleto,
    compradorId: doc,
    compradorDireccion: dir,
    compradorTelefono: tel,
    compradorCc: doc,
    ciudadContrato: ciudad,
    fechaContrato: safeFecha,

    // ======== DATOS VEHÍCULO (campos fijos para documentos) =========
    clase: "Motocicleta",
    tipo: "Motocicleta",
    cilindraje: data.cilindraje ?? "",
    servicio: "Particular",
    capacidad: data.capacidad ?? "",
    actaManifiesto: "",
    sitioMatricula: ciudad,
    ciudadMatricula: ciudad,
    departamentoMatricula: "Valle del Cauca",
    precio: data.valorMoto ?? "",

    // ======== ALIAS MOTO (páginas 20,21,23,24) =========
    marcaMoto: data.marca ?? "",
    lineaMoto: data.linea ?? data.modeloMoto ?? data.modelo ?? "",
    colorMoto: data.color ?? "",
    valorTotal: data.valorMoto ?? "",
    numeroCuotas: data.cuotas ?? "",
    valorCuotaMensual: data.valorCuota ?? "",
    fechaDocumento: safeFecha,

    // ======== EMPRESA / ACREEDOR (páginas 16,17,18,19) =========
    nombreEmpresa: VERIFICARTE_NOMBRE,
    nitEmpresa: VERIFICARTE_NIT,
    empresaNombre: VERIFICARTE_NOMBRE,
    destinatarioNombre: nombreCompleto,
    deudorNombreEmpresa: data.empresaTitular1 ?? "",
    fechaPagoPactada: safeFecha,
    fechaComunicacion: safeFecha,
    jefeCarteraNombre: "",
    ciudadEntrega: ciudad,
    montoAdeudado: data.valorMoto ?? "",
    bancoNombre: "BANCOLOMBIA",
    tipoCuenta: "CUENTA DE AHORROS",
    numeroCuenta: "",

    // ======== PÁGINA 25 =========
    fechaDiligenciamiento: safeFecha,
    numeroSolicitud: data.codigo,
    nombreSolicitante: nombreCompleto,
    apellidosSolicitante: "",
    codigoDesembolso: "",
    nombreBeneficiario: VERIFICARTE_NOMBRE,
    docBeneficiario: VERIFICARTE_NIT,
    banco: "BANCOLOMBIA",
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
