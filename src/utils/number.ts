export const aNumeroOUndefined = (v: unknown): number | undefined => {
  if (v == null || v === '') return undefined;

  const cleaned = String(v)
    .replace(/[^\d.,-]/g, '') // deja números, punto, coma
    .replace(/\./g, '')       // quita separadores de miles
    .replace(',', '.');       // convierte coma decimal a punto

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};