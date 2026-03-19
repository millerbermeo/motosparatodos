export const getMatricula = (m: any, metodo: "contado" | "credibike" | "terceros") =>
  metodo === "contado" ? Number(m.matricula_contado) : Number(m.matricula_credito);

export const calcGarantia = (precioBase: number, cfg: any | null) => {
  if (!cfg || precioBase <= 0) return 0;
  const v = Number(cfg.valor) || 0;
  return cfg.tipo_valor === "%" ? Math.round(precioBase * (v / 100)) : Math.round(v);
};

export const calcPoliza = (precioBase: number, cfg: any | null) => {
  if (!cfg || precioBase <= 0) return 0;
  const v = Number(cfg.valor) || 0;
  return cfg.tipo_valor === "%" ? Math.round(precioBase * (v / 100)) : Math.round(v);
};

export const calcGps = (precioBase: number, cfg: any | null) => {
  if (!cfg) return 0;
  const v = Number(cfg.valor) || 0;
  return cfg.tipo_valor === "%" ? Math.round(precioBase * (v / 100)) : Math.round(v);
};

export const calcCuotaConInteres = (saldo: number, meses: number, tasaMes: number): number => {
  if (saldo <= 0 || meses <= 0 || tasaMes <= 0) return 0;
  const r = tasaMes;
  const pow = Math.pow(1 + r, meses);
  const factor = (r * pow) / (pow - 1);
  return Math.round(saldo * factor);
};