// utilsFacturacion.ts

import { toNum } from "../../../utils/convertirNumeroSeguro";

export type Num = number | undefined | null;

export const pick = <T,>(...vals: (T | undefined | null | "")[]): T | undefined => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
};

export const sum = (...vals: Num[]): number | undefined => {
  const arr = vals
    .map(toNum)
    .filter((n): n is number => typeof n === "number");

  return arr.length ? arr.reduce((a, b) => a + b, 0) : undefined;
};

export const max0 = (n?: number) =>
  typeof n === "number" && Number.isFinite(n)
    ? Math.max(n, 0)
    : undefined;