export const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(isFinite(n) ? Math.max(0, Math.round(n)) : 0);

export const numberParser = (v: any) => {
  if (v === "" || v == null) return 0;
  const n = Number(String(v).replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
};
