// moneyUtils.ts
export const unformatNumber = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\D+/g, ""); // "12.345" -> "12345"
};

export const formatThousands = (digitsOnly: string): string =>
  digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // "12345" -> "12.345"

export const toNumberSafe = (v: string | number | null | undefined): number => {
  const raw = unformatNumber(v);
  return raw ? Number(raw) : 0;
};
