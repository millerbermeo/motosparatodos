export type Cuotas = {
  inicial: number;
  meses6?: number;
  meses12?: number;
  meses18?: number;
  meses24?: number;
  meses30?: number;
  meses36?: number;
};

export type Motocicleta = {
  modelo: string;
  precioBase: number;
  precioDocumentos: number;
  descuentos: number;
  accesoriosYMarcacion: number;
  seguros: number;
  garantia: boolean;
  garantiaExtendidaMeses?: number | null;
  garantiaExtendidaValor?: number | null;
  totalSinSeguros: number;
  total: number;
  cuotas: Cuotas;
  lado: 'A' | 'B';
  soat?: number;
  matricula?: number;
  impuestos?: number;
  adicionalesRunt?: number;
  adicionalesLicencia?: number;
  adicionalesDefensas?: number;
  adicionalesHandSavers?: number;
  adicionalesOtros?: number;
  adicionalesTotal?: number;
  saldoFinanciar: number;
  otrosSeguros?: number;
  gpsMeses?: string | number | null;
  gpsValor?: number | null;
  polizaCodigo?: string | null;
  polizaValor?: number | null;
};

export type Evento = {
  fecha: string;
  titulo: string;
  etiqueta?: string;
  color?: any
};

export type Cotizacion = {
  id: string;
  estado: any;
  creada: string;
  cliente: {
    nombres: string;
    apellidos?: string;
    email?: string;
    celular?: string;
    comentario?: string;
    comentario2?: string;
    cedula?: string;
  };
  comercial?: {
    asesor?: string;
    canal_contacto?: string;
    financiera?: string | null;
    tipo_pago?: string | null;
    prospecto?: string | null;
    pregunta?: string | null;
    telefono_asesor?: string;
  };
  motoA?: Motocicleta;
  motoB?: Motocicleta;
  actividad: Evento[];
};

export type MotoImageProps = {
  src?: string;
  alt?: string;
  thumbClassName?: string;
};