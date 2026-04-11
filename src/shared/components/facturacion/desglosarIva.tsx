import { toNum } from "../../../utils/convertirNumeroSeguro";

type Num = number | undefined | null;

const max0 = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.max(n, 0) : undefined;

export const desglosarConIva = (
  totalConIva?: Num,
  baseSinIva?: Num,
  ivaExplicito?: Num,
  ivaDec: number = 0.19
) => {
  const total = toNum(totalConIva);
  const base = toNum(baseSinIva);
  const iva = toNum(ivaExplicito);

  // Caso ideal: ya viene todo explícito
  if (base !== undefined && iva !== undefined) {
    return {
      total: base + iva,
      bruto: base,
      iva,
    };
  }

  // Si tengo total y base => IVA = total - base
  if (total !== undefined && base !== undefined) {
    const ivaCalc = max0(total - base);
    return {
      total,
      bruto: base,
      iva: ivaCalc,
    };
  }

  // Si solo tengo total => calculo base e IVA desde total
  if (total !== undefined) {
    const brutoCalc = Math.round(total / (1 + ivaDec));
    const ivaCalc = max0(total - brutoCalc);
    return {
      total,
      bruto: brutoCalc,
      iva: ivaCalc,
    };
  }

  // Si solo tengo base => calculo IVA desde base
  if (base !== undefined) {
    const ivaCalc = Math.round(base * ivaDec);
    return {
      total: base + ivaCalc,
      bruto: base,
      iva: ivaCalc,
    };
  }

  // Si no hay nada
  return {
    total: undefined as number | undefined,
    bruto: undefined as number | undefined,
    iva: undefined as number | undefined,
  };
};
