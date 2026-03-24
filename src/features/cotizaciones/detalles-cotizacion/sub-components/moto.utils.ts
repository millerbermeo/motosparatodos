import type { Motocicleta } from '../detallesCotizacion.type';
import { normalizarTexto } from '../../../../utils/text';

export const getGpsTexto = (
  moto?: Motocicleta | null,
  isContado?: boolean
): string => {
  if (!moto) return 'No aplica';

  const valor = Number(moto.gpsValor ?? 0);
  if (!(Number.isFinite(valor) && valor > 0)) return 'No';

  const v = normalizarTexto(moto.gpsMeses);

  if (isContado) return 'Sí';

  if (!v || v === 'si' || v === 'sí') return 'Sí';
  if (v === 'no' || v === '0') return 'Sí';

  return `${moto.gpsMeses} meses`;
};

export const getGpsValorAplicado = (moto?: Motocicleta | null): number => {
  if (!moto) return 0;

  const valor = Number(moto.gpsValor ?? 0);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
};