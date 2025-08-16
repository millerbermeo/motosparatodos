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
