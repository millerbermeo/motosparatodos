import React, { useMemo } from "react";
import { useConfigPlazoByCodigo } from "../../services/configuracionPlazoService";
import { useTasasCotizacion } from "../../services/tasaCotiService";
import {
  calcularCuotaPMT,
  calcularSeguroDeudorMensual,
} from "../../shared/components/credito/creditoDirecto.utils";

interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;
  precio_seguros?: string | number;
  garantia_extendida_valor?: string | number;
}

interface TablaAmortizacionCreditoProps {
  credito: CreditoApi;
  fechaCreacion?: string;
  cotizacionId: number;
  nombreCliente?: string;
  cedula?: string;
  direccion?: string;
  telefono?: string;
  producto?: string;
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

// Usa día 1 para evitar overflow (ej: marzo 31 + 1 mes → abril 31 → mayo 1)
const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

// Parsea "YYYY-MM-DD" como fecha local evitando el desfase UTC
const parseLocalDate = (raw: string): Date => {
  const s = raw.substring(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtFechaMes = (fecha: Date): string => {
  const mes = fecha.toLocaleDateString("es-CO", { month: "long" }).toLowerCase();
  return `${mes}/${fecha.getFullYear()}`;
};

const fmtFechaCorta = (fecha: Date): string =>
  fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type ScheduleRow = {
  periodo: number;
  fecha: Date;
  interes: number;
  abonoCapital: number;
  saldoFinal: number;
  garantiaYSeguros: number;
  cuotaTotalMes: number;
};

const buildSchedule = (
  principal: number,
  tasaMensual: number,
  meses: number,
  cuotaFija: number,
  cuotaGarantiaFija: number,
  seguroDeudorFijo: number,
  fechaInicio: Date
): ScheduleRow[] => {
  if (principal <= 0 || meses <= 0) return [];

  const garantiaYSeguros = cuotaGarantiaFija + seguroDeudorFijo;
  const rows: ScheduleRow[] = [];
  let saldo = principal;

  for (let i = 1; i <= meses; i++) {
    const saldoInicial = saldo;
    const interes = tasaMensual > 0 ? saldoInicial * tasaMensual : 0;

    let abonoCapital = cuotaFija - interes;
    let saldoFinal = saldoInicial - abonoCapital;

    if (i === meses || saldoFinal < 1) {
      abonoCapital = saldoInicial;
      saldoFinal = 0;
    }

    rows.push({
      periodo: i,
      fecha: addMonths(fechaInicio, i),
      interes,
      abonoCapital,
      saldoFinal,
      garantiaYSeguros,
      cuotaTotalMes: cuotaFija + garantiaYSeguros,
    });

    saldo = saldoFinal;
  }

  return rows;
};

export const TablaAmortizacionCredito: React.FC<TablaAmortizacionCreditoProps> = ({
  credito,
  cotizacionId,
  fechaCreacion,
  nombreCliente,
  cedula,
  direccion,
  telefono,
  producto,
}) => {
  const plazo = toNumber(credito.plazo_meses);

  const {
    data: tasasCotizacion,
    isLoading: loadingTasas,
    error: errorTasas,
  } = useTasasCotizacion(cotizacionId);

  const { data: garantiaConfig } = useConfigPlazoByCodigo(
    plazo ? `GAR_EXT_${plazo}` : "",
    Boolean(plazo)
  );

  const resultado = useMemo(() => {
    if (!plazo || !tasasCotizacion) return null;

    const valorProducto = toNumber(credito.valor_producto);
    const cuotaInicial = toNumber(credito.cuota_inicial);

    let valorGarantia = toNumber(credito.garantia_extendida_valor);
    if (valorGarantia === 0 && garantiaConfig?.tipo_valor === "%") {
      valorGarantia = valorProducto * (toNumber(garantiaConfig.valor) / 100);
    }

    const saldoFinanciadoNegocio = Math.max(valorProducto - cuotaInicial, 0);
    const saldoFinanciadoGarantia = Math.max(valorGarantia, 0);

    const tasaFinanciacionMensual = toNumber(tasasCotizacion.tasa_financiacion) / 100;
    const tasaGarantiaMensual = toNumber(tasasCotizacion.tasa_garantia) / 100;
    const teaFin = Math.pow(1 + tasaFinanciacionMensual, 12) - 1;

    const cuotaNegocio =
      saldoFinanciadoNegocio > 0
        ? Math.floor(
            Math.abs(calcularCuotaPMT(saldoFinanciadoNegocio, tasaFinanciacionMensual * 100, plazo))
          )
        : 0;

    const cuotaGarantia =
      saldoFinanciadoGarantia > 0
        ? Math.floor(
            Math.abs(calcularCuotaPMT(saldoFinanciadoGarantia, tasaGarantiaMensual * 100, plazo))
          )
        : 0;

    // Seguro fijo sobre saldo inicial (igual al comportamiento del Excel)
    const seguroDeudorFijo =
      saldoFinanciadoNegocio > 0
        ? Math.floor(calcularSeguroDeudorMensual(saldoFinanciadoNegocio))
        : 0;

    const garantiaYSeguros = cuotaGarantia + seguroDeudorFijo;
    const cuotaTotalMes = cuotaNegocio + garantiaYSeguros;
    const fechaInicio = fechaCreacion ? parseLocalDate(fechaCreacion) : new Date();

    const schedule = buildSchedule(
      saldoFinanciadoNegocio,
      tasaFinanciacionMensual,
      plazo,
      cuotaNegocio,
      cuotaGarantia,
      seguroDeudorFijo,
      fechaInicio
    );

    return {
      valorTotal: valorProducto + saldoFinanciadoGarantia, // precio total moto
      valorProducto,
      cuotaInicial,
      saldoFinanciadoNegocio,
      saldoFinanciadoGarantia,
      tasaFinanciacionMensual,
      teaFin,
      cuotaNegocio,
      garantiaYSeguros,
      cuotaTotalMes,
      fechaInicio,
      schedule,
    };
  }, [credito, plazo, tasasCotizacion, garantiaConfig, fechaCreacion]);

  if (!plazo) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">
          No hay información de plazo para generar la tabla de amortización.
        </p>
      </section>
    );
  }

  if (loadingTasas) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">Cargando tasas de la cotización...</p>
      </section>
    );
  }

  if (errorTasas || !resultado) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 shadow-sm p-4 sm:p-6">
        <p className="text-sm text-rose-700">
          No fue posible generar la tabla de amortización.
        </p>
      </section>
    );
  }

  const {
    valorTotal,
    cuotaInicial,
    saldoFinanciadoNegocio,
    tasaFinanciacionMensual,
    teaFin,
    cuotaNegocio,
    garantiaYSeguros,
    cuotaTotalMes,
    fechaInicio,
    schedule,
  } = resultado;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Barra título */}
      <div className="bg-slate-700 px-5 py-3">
        <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">
          Tabla de Amortización — Sistema Francés
        </h2>
      </div>

      {/* Resumen 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-sm">
        {/* Col 1 — Cliente */}
        <div className="px-5 py-4 space-y-1.5">
          {cedula && (
            <div className="flex gap-2">
              <span className="text-slate-500 w-36 shrink-0">Cédula:</span>
              <span className="font-semibold text-slate-800">{cedula}</span>
            </div>
          )}
          {nombreCliente && (
            <div className="flex gap-2">
              <span className="text-slate-500 w-36 shrink-0">Nombre:</span>
              <span className="font-semibold text-slate-800 uppercase">{nombreCliente}</span>
            </div>
          )}
          {direccion && (
            <div className="flex gap-2">
              <span className="text-slate-500 w-36 shrink-0">Dirección:</span>
              <span className="font-semibold text-slate-800">{direccion}</span>
            </div>
          )}
          {telefono && (
            <div className="flex gap-2">
              <span className="text-slate-500 w-36 shrink-0">Teléfono:</span>
              <span className="font-semibold text-slate-800">{telefono}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-slate-500 w-36 shrink-0">Fecha de desembolso:</span>
            <span className="font-semibold text-slate-800">{fmtFechaCorta(fechaInicio)}</span>
          </div>
        </div>

        {/* Col 2 — Valores */}
        <div className="px-5 py-4 space-y-1.5">
          {producto && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Producto:</span>
              <span className="font-semibold text-slate-800 uppercase text-right">{producto}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Valor:</span>
            <span className="font-semibold text-slate-800">{fmtCOP(valorTotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Cuota Inicial:</span>
            <span className="font-semibold text-slate-800">{fmtCOP(cuotaInicial)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Valor a financiar:</span>
            <span className="font-semibold text-sky-700">{fmtCOP(saldoFinanciadoNegocio)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Garantía y Seguros:</span>
            <span className="font-semibold text-rose-600">{fmtCOP(garantiaYSeguros)}</span>
          </div>
        </div>

        {/* Col 3 — Tasas */}
        <div className="px-5 py-4 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Tasa efectiva mensual:</span>
            <span className="font-semibold text-slate-800">{`${(tasaFinanciacionMensual * 100).toFixed(4)}%`}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Tasa efectiva anual:</span>
            <span className="font-semibold text-slate-800">{fmtPct(teaFin)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Plazo (Meses):</span>
            <span className="font-semibold text-slate-800">{plazo}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Cuota:</span>
            <span className="font-semibold text-sky-700">{fmtCOP(cuotaNegocio)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200">
            <span className="text-slate-600 font-medium">CuotaTotal Mes:</span>
            <span className="font-bold text-emerald-700 text-base">{fmtCOP(cuotaTotalMes)}</span>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-700 text-white text-left">
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Período</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Fecha</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Intereses</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Abono Capital</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Garantía y Seguros</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Total Cuota Mensual</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Saldo Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((row, idx) => (
              <tr
                key={row.periodo}
                className={
                  idx % 2 === 0
                    ? "bg-white hover:bg-blue-50 transition-colors"
                    : "bg-slate-50 hover:bg-blue-50 transition-colors"
                }
              >
                <td className="px-4 py-2 text-center font-medium text-slate-500">
                  {row.periodo}
                </td>
                <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                  {fmtFechaMes(row.fecha)}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">
                  {fmtCOP(row.interes)}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">
                  {fmtCOP(row.abonoCapital)}
                </td>
                <td className="px-4 py-2 text-right text-rose-600 font-medium">
                  {fmtCOP(row.garantiaYSeguros)}
                </td>
                <td className="px-4 py-2 text-right font-bold text-emerald-700">
                  {fmtCOP(row.cuotaTotalMes)}
                </td>
                <td className="px-4 py-2 text-right font-medium text-slate-800">
                  {fmtCOP(row.saldoFinal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie de página */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500 italic">
          Simulación inicial del crédito bajo los parámetros básicos, no contiene ajustes o acuerdos de pago.
        </p>
      </div>
    </section>
  );
};

export default TablaAmortizacionCredito;
