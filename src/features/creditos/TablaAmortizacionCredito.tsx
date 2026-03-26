import React, { useMemo } from "react";
import { useConfigPlazoByCodigo } from "../../services/configuracionPlazoService";
import {
  calcularCuotaPMT,
  calcularSeguroDeudorMensual,
} from "../../shared/components/credito/creditoDirecto.utils";

interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;
  precio_seguros?: string | number; // opcional, por si lo quieres mostrar aparte
  garantia_extendida_valor?: string | number;
}

interface TablaAmortizacionCreditoProps {
  credito: CreditoApi;
  fechaCreacion?: string;
}

const fmtCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Math.round(v));

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

const toNumber = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type ScheduleRow = {
  periodo: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  abonoCapital: number;
  saldoFinal: number;
};

type AmortizacionRow = {
  periodo: number;

  saldoInicialNegocio: number;
  cuotaNegocio: number;
  interesNegocio: number;
  abonoCapitalNegocio: number;
  saldoFinalNegocio: number;

  saldoInicialGarantia: number;
  cuotaGarantia: number;
  interesGarantia: number;
  abonoCapitalGarantia: number;
  saldoFinalGarantia: number;

  seguroDeudor: number;
  cuotaTotalMes: number;
};

const buildScheduleFrances = (
  principal: number,
  tasaMensualDecimal: number,
  meses: number,
  cuotaFija: number
): ScheduleRow[] => {
  if (principal <= 0 || meses <= 0) return [];

  const schedule: ScheduleRow[] = [];
  let saldo = principal;

  for (let i = 1; i <= meses; i++) {
    const saldoInicial = saldo;
    const interes = tasaMensualDecimal > 0 ? saldoInicial * tasaMensualDecimal : 0;

    let abonoCapital = cuotaFija - interes;
    let saldoFinal = saldoInicial - abonoCapital;

    if (i === meses || saldoFinal < 1) {
      abonoCapital = saldoInicial;
      saldoFinal = 0;
    }

    schedule.push({
      periodo: i,
      saldoInicial,
      cuota: cuotaFija,
      interes,
      abonoCapital,
      saldoFinal,
    });

    saldo = saldoFinal;
  }

  return schedule;
};

export const TablaAmortizacionCredito: React.FC<TablaAmortizacionCreditoProps> = ({
  credito,
}) => {
  const plazo = toNumber(credito.plazo_meses);

  const {
    data: tasaFinConfig,
    isLoading: loadingTasaFin,
    error: errorTasaFin,
  } = useConfigPlazoByCodigo("TASA_FIN", true);

  const {
    data: tasaGarantiaConfig,
    isLoading: loadingTasaGarantia,
    error: errorTasaGarantia,
  } = useConfigPlazoByCodigo("TASA_GARANTIA", true);

  const { data: garantiaConfig } = useConfigPlazoByCodigo(
    plazo ? `GAR_EXT_${plazo}` : "",
    Boolean(plazo)
  );

  const resultado = useMemo(() => {
    if (!plazo || !tasaFinConfig || !tasaGarantiaConfig) return null;

    const valorProducto = toNumber(credito.valor_producto);
    const cuotaInicial = toNumber(credito.cuota_inicial);

    let valorGarantia = toNumber(credito.garantia_extendida_valor);

    // Si no viene guardado el valor pero existe configuración por %
    if (valorGarantia === 0 && garantiaConfig && garantiaConfig.tipo_valor === "%") {
      valorGarantia = valorProducto * (toNumber(garantiaConfig.valor) / 100);
    }

    // IMPORTANTE:
    // valor_producto YA incluye documentos, papeles, etc.
    // Entonces NO se vuelve a sumar nada.
    const saldoFinanciadoNegocio = Math.max(valorProducto - cuotaInicial, 0);
    const saldoFinanciadoGarantia = Math.max(valorGarantia, 0);

    const tasaFinanciacionMensual =
      tasaFinConfig.tipo_valor === "%"
        ? toNumber(tasaFinConfig.valor) / 100
        : toNumber(tasaFinConfig.valor);

    const tasaGarantiaMensual =
      tasaGarantiaConfig.tipo_valor === "%"
        ? toNumber(tasaGarantiaConfig.valor) / 100
        : toNumber(tasaGarantiaConfig.valor);

    const teaFin = Math.pow(1 + tasaFinanciacionMensual, 12) - 1;
    const teaGarantia = Math.pow(1 + tasaGarantiaMensual, 12) - 1;

    const cuotaNegocio =
      saldoFinanciadoNegocio > 0
        ? Math.floor(
            calcularCuotaPMT(
              saldoFinanciadoNegocio,
              tasaFinanciacionMensual * 100,
              plazo
            )
          )
        : 0;

    const cuotaGarantia =
      saldoFinanciadoGarantia > 0
        ? Math.floor(
            calcularCuotaPMT(
              saldoFinanciadoGarantia,
              tasaGarantiaMensual * 100,
              plazo
            )
          )
        : 0;

    const scheduleNegocio = buildScheduleFrances(
      saldoFinanciadoNegocio,
      tasaFinanciacionMensual,
      plazo,
      cuotaNegocio
    );

    const scheduleGarantia = buildScheduleFrances(
      saldoFinanciadoGarantia,
      tasaGarantiaMensual,
      plazo,
      cuotaGarantia
    );

    const schedule: AmortizacionRow[] = Array.from({ length: plazo }, (_, idx) => {
      const n = scheduleNegocio[idx] ?? {
        periodo: idx + 1,
        saldoInicial: 0,
        cuota: 0,
        interes: 0,
        abonoCapital: 0,
        saldoFinal: 0,
      };

      const g = scheduleGarantia[idx] ?? {
        periodo: idx + 1,
        saldoInicial: 0,
        cuota: 0,
        interes: 0,
        abonoCapital: 0,
        saldoFinal: 0,
      };

      const seguroDeudor =
        n.saldoInicial > 0 ? calcularSeguroDeudorMensual(n.saldoInicial) : 0;

      const cuotaTotalMes = n.cuota + g.cuota + seguroDeudor;

      return {
        periodo: idx + 1,

        saldoInicialNegocio: n.saldoInicial,
        cuotaNegocio: n.cuota,
        interesNegocio: n.interes,
        abonoCapitalNegocio: n.abonoCapital,
        saldoFinalNegocio: n.saldoFinal,

        saldoInicialGarantia: g.saldoInicial,
        cuotaGarantia: g.cuota,
        interesGarantia: g.interes,
        abonoCapitalGarantia: g.abonoCapital,
        saldoFinalGarantia: g.saldoFinal,

        seguroDeudor,
        cuotaTotalMes,
      };
    });

    return {
      plazo,
      valorProducto,
      cuotaInicial,
      valorGarantia,
      saldoFinanciadoNegocio,
      saldoFinanciadoGarantia,
      tasaFinanciacionMensual,
      tasaGarantiaMensual,
      teaFin,
      teaGarantia,
      cuotaNegocio,
      cuotaGarantia,
      schedule,
    };
  }, [credito, plazo, tasaFinConfig, tasaGarantiaConfig, garantiaConfig]);

  if (!plazo) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">
          No hay información de plazo para generar la tabla de amortización.
        </p>
      </section>
    );
  }

  if (loadingTasaFin || loadingTasaGarantia) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">Cargando configuración de tasas...</p>
      </section>
    );
  }

  if (errorTasaFin || errorTasaGarantia || !resultado) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 shadow-sm p-4 sm:p-6">
        <p className="text-sm text-rose-700">
          No fue posible generar la tabla de amortización.
        </p>
      </section>
    );
  }

  const {
    valorProducto,
    cuotaInicial,
    valorGarantia,
    saldoFinanciadoNegocio,
    saldoFinanciadoGarantia,
    tasaFinanciacionMensual,
    tasaGarantiaMensual,
    teaFin,
    teaGarantia,
    cuotaNegocio,
    cuotaGarantia,
    schedule,
  } = resultado;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900 mb-2">Resumen del crédito</p>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Valor total moto:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(valorProducto)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Cuota inicial:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(cuotaInicial)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Saldo financiado negocio:</span>
              <span className="font-semibold text-sky-700">
                {fmtCOP(saldoFinanciadoNegocio)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Valor garantía:</span>
              <span className="font-semibold text-rose-700">
                {fmtCOP(saldoFinanciadoGarantia)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Garantía total:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(valorGarantia)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900 mb-2">Condiciones</p>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Tasa mensual negocio:</span>
              <span className="font-semibold text-slate-900">
                {fmtPct(tasaFinanciacionMensual)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">TEA negocio:</span>
              <span className="font-semibold text-slate-900">{fmtPct(teaFin)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Tasa mensual garantía:</span>
              <span className="font-semibold text-slate-900">
                {fmtPct(tasaGarantiaMensual)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">TEA garantía:</span>
              <span className="font-semibold text-slate-900">{fmtPct(teaGarantia)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Cuota negocio:</span>
              <span className="font-semibold text-sky-700">{fmtCOP(cuotaNegocio)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Cuota garantía:</span>
              <span className="font-semibold text-rose-700">{fmtCOP(cuotaGarantia)}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-425 w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-200 text-slate-800">
                <th className="px-3 py-2 text-left font-semibold" rowSpan={2}>Periodo</th>
                <th className="px-3 py-2 text-center font-semibold" colSpan={5}>
                  Financiación negocio
                </th>
                <th className="px-3 py-2 text-center font-semibold" colSpan={5}>
                  Garantía
                </th>
                <th className="px-3 py-2 text-right font-semibold" rowSpan={2}>
                  Seguro deudor
                </th>
                <th className="px-3 py-2 text-right font-semibold" rowSpan={2}>
                  Cuota total mes
                </th>
              </tr>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-3 py-2 text-right font-semibold">Saldo inicial</th>
                <th className="px-3 py-2 text-right font-semibold">Cuota</th>
                <th className="px-3 py-2 text-right font-semibold">Interés</th>
                <th className="px-3 py-2 text-right font-semibold">Abono capital</th>
                <th className="px-3 py-2 text-right font-semibold">Saldo final</th>

                <th className="px-3 py-2 text-right font-semibold">Saldo inicial</th>
                <th className="px-3 py-2 text-right font-semibold">Cuota</th>
                <th className="px-3 py-2 text-right font-semibold">Interés</th>
                <th className="px-3 py-2 text-right font-semibold">Abono capital</th>
                <th className="px-3 py-2 text-right font-semibold">Saldo final</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {schedule.map((row) => (
                <tr key={row.periodo} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">{row.periodo}</td>

                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.saldoInicialNegocio)}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-sky-700">
                    {fmtCOP(row.cuotaNegocio)}
                  </td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.interesNegocio)}</td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.abonoCapitalNegocio)}</td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.saldoFinalNegocio)}</td>

                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.saldoInicialGarantia)}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-rose-700">
                    {fmtCOP(row.cuotaGarantia)}
                  </td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.interesGarantia)}</td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.abonoCapitalGarantia)}</td>
                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.saldoFinalGarantia)}</td>

                  <td className="px-3 py-1.5 text-right">{fmtCOP(row.seguroDeudor)}</td>
                  <td className="px-3 py-1.5 text-right font-bold">{fmtCOP(row.cuotaTotalMes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          La tabla separa el saldo financiado principal y el saldo de garantía.
          La cuota total del mes es: cuota negocio + cuota garantía + seguro deudor.
        </p>
      </div>
    </section>
  );
};

export default TablaAmortizacionCredito;