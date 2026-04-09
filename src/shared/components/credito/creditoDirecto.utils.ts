export type CreditoMotoInput = {
  incluir: boolean;
  mesesGarantia?: number | string | null;
  valorGarantia?: number | string | null;
  saldoFinanciar?: number | string | null;
  tasaFinanciacionPct?: number | string | null; // ej: 1.9122
  tasaGarantiaPct?: number | string | null;     // ej: 1.5000
};

export type CreditoMotoResultado = {
  meses: number;
  valorGarantia: number;
  saldoFinanciar: number;
  tasaFinanciacionPct: number;
  tasaGarantiaPct: number;
  tasaFinanciacionDecimal: number;
  tasaGarantiaDecimal: number;
  cuotaGarantiaExtendida: number;
  seguroDeudor: number;
  garantiaMasSeguro: number;
  cuotaNegocio: number;
  cuotaTotal: number;
};

export const toNumberSafe = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * 🔥 PMT estilo Excel (NEGATIVO)
 */
export const calcularCuotaPMT = (
  valorPresente: unknown,
  tasaPorcentaje: unknown,
  meses: unknown
): number => {
  const PV = toNumberSafe(valorPresente, 0);
  const tasaPct = toNumberSafe(tasaPorcentaje, 0);
  const n = toNumberSafe(meses, 0);

  if (PV <= 0 || n <= 0) return 0;

  const r = tasaPct / 100;

  if (r === 0) return -(PV / n);

  // 🔥 ahora negativo como Excel
  return -(r * PV) / (1 - Math.pow(1 + r, -n));
};

/**
 * 🔥 Seguro (entero como Excel)
 */
export const calcularSeguroDeudorMensual = (
  saldoFinanciar: unknown,
  tasaSeguroDecimal = 0.00043
): number => {
  const saldo = toNumberSafe(saldoFinanciar, 0);
  if (saldo <= 0) return 0;
  return Math.round(saldo * tasaSeguroDecimal);
};

const round2 = (n: number) => Number(n.toFixed(2));

export const calcularCreditoDirectoMoto = (
  input: CreditoMotoInput
): CreditoMotoResultado => {
  const incluir = Boolean(input.incluir);

  const meses = incluir ? toNumberSafe(input.mesesGarantia, 0) : 0;
  const valorGarantia = incluir ? toNumberSafe(input.valorGarantia, 0) : 0;
  const saldoFinanciar = incluir ? toNumberSafe(input.saldoFinanciar, 0) : 0;

  const tasaFinanciacionPct = toNumberSafe(input.tasaFinanciacionPct, 1.9122);
  const tasaGarantiaPct = toNumberSafe(input.tasaGarantiaPct, 1.5);

  const tasaFinanciacionDecimal = tasaFinanciacionPct / 100;
  const tasaGarantiaDecimal = tasaGarantiaPct / 100;

  /**
   * 🔥 GARANTÍA (2 decimales como Excel)
   */
  const cuotaGarantiaRaw =
    meses > 0
      ? valorGarantia *
        ((tasaGarantiaPct / 100) /
          (1 - Math.pow(1 + tasaGarantiaPct / 100, -meses)))
      : 0;

  const cuotaGarantiaExtendida = round2(cuotaGarantiaRaw);

  /**
   * 🔥 SEGURO
   */
  const seguroDeudor = calcularSeguroDeudorMensual(saldoFinanciar);

  /**
   * 🔥 GARANTÍA + SEGURO
   */
  const garantiaMasSeguro = Math.round(
    cuotaGarantiaExtendida + seguroDeudor
  );

  /**
   * 🔥 CUOTA NEGOCIO (REDONDEAR.MENOS EXACTO)
   */
  const cuotaNegocio =
    meses > 0 && saldoFinanciar > 0
      ? Math.abs(
          Math.floor(
            calcularCuotaPMT(
              saldoFinanciar,
              tasaFinanciacionPct,
              meses
            ) + 1e-7 // 🔥 FIX CLAVE
          )
        )
      : 0;

  /**
   * 🔥 TOTAL FINAL
   */
  const cuotaTotal = cuotaNegocio + garantiaMasSeguro;

  return {
    meses,
    valorGarantia,
    saldoFinanciar,
    tasaFinanciacionPct,
    tasaGarantiaPct,
    tasaFinanciacionDecimal,
    tasaGarantiaDecimal,
    cuotaGarantiaExtendida,
    seguroDeudor,
    garantiaMasSeguro,
    cuotaNegocio,
    cuotaTotal,
  };
};

export const logCreditoDirectoMoto = (
  label: string,
  data: CreditoMotoResultado
) => {
  console.group(`CRÉDITO DIRECTO ${label}`);
  console.log("Meses garantía:", data.meses);
  console.log("Valor garantía:", data.valorGarantia);
  console.log("Saldo financiar:", data.saldoFinanciar);
  console.log("Tasa financiación %:", data.tasaFinanciacionPct);
  console.log("Tasa garantía %:", data.tasaGarantiaPct);
  console.log("Tasa financiación decimal:", data.tasaFinanciacionDecimal);
  console.log("Tasa garantía decimal:", data.tasaGarantiaDecimal);
  console.log("Cuota garantía extendida:", data.cuotaGarantiaExtendida);
  console.log("Seguro deudor:", data.seguroDeudor);
  console.log("Garantía + seguro:", data.garantiaMasSeguro);
  console.log("Cuota negocio:", data.cuotaNegocio);
  console.log("Cuota total:", data.cuotaTotal);
  console.groupEnd();
};