export type SeguroKey = "vidaClasicoAnual" | "mascotasSemestral" | "mascotasAnual";

export type FormValues = {
  canalContacto: string;
  categoriaRelacion: string;

  cedula: string;
  fechaNacimiento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;

  celular: string;
  email: string;

  moto1Marca: string;
  moto1Modelo: string;
  moto2Marca: string;
  moto2Modelo: string;

  garantiaExtendida: "Si" | "No";
  accesoriosValor: number;

  seguros: Partial<Record<SeguroKey, boolean>>;
  otrosSeguros: number;

  matriculaSoat: number;
  descuentos: number;

  comentario: string;
};


export type DocItem = {
  name: string;     // Texto mostrado
  file?: string;    // Nombre exacto del archivo en /public
  url?: string;     // URL absoluta o relativa del backend
};


export type ActividadItem = {
  fecha: string;
  titulo: string;
  etiqueta?: string;
  color?: string;
};

export type MetodoPago = "contado" | "credibike" | "terceros";




// FORMULARIO PARA COTIZACION  VALUES A ENVIAR


export type FormValuesCotizacion = {
    metodoPago: MetodoPago;
    canal: string;
    pregunta: string;
    categoria: string;
    financiera: string;
    cuotas: number | string;
    cedula: string;
    fecha_nac: string;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    celular: string;
    email: string;
    comentario: string;

    gpsContado1?: "si" | "no";
    gpsContado2?: "si" | "no";


    incluirMoto1: boolean;
    incluirMoto2: boolean;

    marca1: string;
    moto1: string;
    garantia1: string;
    accesorios1: string;
    segurosIds1: string[];
    otroSeguro1: string;
    precioDocumentos1: string;
    descuento1: string;
    cuotaInicial1: string;

    marca2: string;
    moto2: string;
    garantia2: string;
    accesorios2: string;
    segurosIds2: string[];
    otroSeguro2: string;
    precioDocumentos2: string;
    descuento2: string;
    cuotaInicial2: string;

    cuota_6_a?: string; cuota_6_b?: string;
    cuota_12_a?: string; cuota_12_b?: string;
    cuota_18_a?: string; cuota_18_b?: string;
    cuota_24_a?: string; cuota_24_b?: string;
    cuota_30_a?: string; cuota_30_b?: string;
    cuota_36_a?: string; cuota_36_b?: string;

    producto1Nombre: string;
    producto1Descripcion: string;
    producto1Precio: string;
    producto1CuotaInicial: string;

    producto2Nombre: string;
    producto2Descripcion: string;
    producto2Precio: string;
    producto2CuotaInicial: string;

    modelo_a: string;
    modelo_b: string;
    nombre_usuario: string;
    rol_usuario: string;

    marcacion1: string;
    marcacion2: string;

    foto_a?: string | null;
    foto_b?: string | null;

    garantiaExtendida1?: "no" | "12" | "24" | "36";
    garantiaExtendida2?: "no" | "12" | "24" | "36";

    // 👇 NUEVOS
    valor_garantia_extendida_a?: string;
    valor_garantia_extendida_b?: string;

    soat_a?: string;
    impuestos_a?: string;
    matricula_a?: string;

    soat_b?: string;
    impuestos_b?: string;
    matricula_b?: string;

    valorRunt1: string;
    valorLicencia1: string;
    valorDefensas1: string;
    valorHandSavers1: string;
    valorOtrosAdicionales1: string;

    // Valores adicionales MOTO 2
    valorRunt2: string;
    valorLicencia2: string;
    valorDefensas2: string;
    valorHandSavers2: string;
    valorOtrosAdicionales2: string;

    gps_a?: string;
    gps_b?: string;

    gps1?: "no" | "12" | "24" | "36";
    gps2?: "no" | "12" | "24" | "36";

    poliza1?: "" | "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"; // Moto A
    poliza2?: "" | "LIGHT" | "TRANQUI" | "TRANQUI_PLUS"; // Moto B

    valor_poliza_a?: string; // valor calculado A
    valor_poliza_b?: string; // valor calculado B



};