import React, { useMemo } from 'react';
import { useConfigPlazoByCodigo } from '../../services/configuracionPlazoService';

interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;

  soat?: string | number;
  matricula?: string | number;
  impuestos?: string | number;
  accesorios_total?: string | number;
  precio_seguros?: string | number; // total seguro (para dividir entre meses)
  garantia_extendida_valor?: string | number;
}

interface TablaAmortizacionCreditoProps {
  credito: CreditoApi;
  fechaCreacion?: string;
}

const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

type AmortRowPdf = {
  periodo: number;
  saldoInicial: number;
  intereses: number;
  abonoCapital: number;
  cuotaMensual: number;
  saldoFinal: number;
};

const buildSchedulePdf = (
  principal: number,
  tasaMensual: number,
  meses: number,
  seguroMensual: number
): { cuotaBase: number; cuotaMensual: number; schedule: AmortRowPdf[] } => {
  if (principal <= 0 || tasaMensual <= 0 || meses <= 0) {
    return { cuotaBase: 0, cuotaMensual: 0, schedule: [] };
  }

  const r = tasaMensual;
  const n = meses;

  // Cuota base (método francés)
  const cuotaBase =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // En el PDF normalmente se muestra una sola "Cuota mensual"
  const cuotaMensual = cuotaBase + seguroMensual;

  const schedule: AmortRowPdf[] = [];
  let saldo = principal;

  for (let i = 1; i <= n; i++) {
    const saldoInicial = saldo;

    const intereses = saldoInicial * r;

    // En tu componente original: capital = cuotaBase - interes
    // Para que el PDF cuadre, usamos la misma lógica:
    // El seguro NO amortiza capital (solo se suma a la cuota mensual).
    let abonoCapital = cuotaBase - intereses;

    let saldoFinal = saldoInicial - abonoCapital;

    // Última cuota: ajustamos para cerrar saldo en 0 exacto
    if (i === n) {
      abonoCapital = saldoInicial;
      saldoFinal = 0;
    }

    schedule.push({
      periodo: i,
      saldoInicial,
      intereses,
      abonoCapital,
      cuotaMensual,
      saldoFinal: saldoFinal < 1 ? 0 : saldoFinal,
    });

    saldo = saldoFinal;
  }

  return { cuotaBase, cuotaMensual, schedule };
};

export const TablaAmortizacionCredito: React.FC<TablaAmortizacionCreditoProps> = ({
  credito,
  fechaCreacion, // (no se usa en la tabla PDF, pero la dejamos por compatibilidad)
}) => {
  const plazo = credito.plazo_meses ?? 0;

  console.log("Datos para tabla de amortización:", fechaCreacion)
  const {
    data: tasaFinConfig,
    isLoading: loadingTasa,
    error: errorTasa,
  } = useConfigPlazoByCodigo('TASA_FIN', true);

  // Opcional: config garantía por plazo (si la usas)
  const { data: garantiaConfig } = useConfigPlazoByCodigo(
    plazo ? `GAR_EXT_${plazo}` : '',
    Boolean(plazo)
  );

  const resultado = useMemo(() => {
    if (!tasaFinConfig || !plazo) return null;

    const valorProducto = toNumber(credito.valor_producto);
    const cuotaInicial = toNumber(credito.cuota_inicial);

    const soat = toNumber(credito.soat);
    const matricula = toNumber(credito.matricula);
    const impuestos = toNumber(credito.impuestos);
    const accesorios = toNumber(credito.accesorios_total);
    const precioSeguros = toNumber(credito.precio_seguros);

    let garantiaExt = toNumber(credito.garantia_extendida_valor);

    // Si viene 0 y existe config en %, la calculamos (igual que tu lógica)
    if (garantiaExt === 0 && garantiaConfig && garantiaConfig.tipo_valor === '%') {
      const porcentaje = garantiaConfig.valor / 100;
      garantiaExt = valorProducto * porcentaje;
    }

    const baseFinanciada =
      valorProducto + soat + matricula + impuestos + accesorios + garantiaExt;

    const principal = Math.max(baseFinanciada - cuotaInicial, 0);

    // Seguro mensual (se suma a la cuota, pero no amortiza capital)
    const seguroMensual = plazo > 0 ? precioSeguros / plazo : 0;

    // Tasa mensual viene como % (ej: 1.83)
    const tasaMensual =
      tasaFinConfig.tipo_valor === '%'
        ? tasaFinConfig.valor / 100
        : tasaFinConfig.valor;

    const tea = Math.pow(1 + tasaMensual, 12) - 1;

    const { cuotaBase, cuotaMensual, schedule } = buildSchedulePdf(
      principal,
      tasaMensual,
      plazo,
      seguroMensual
    );

    return {
      valorProducto,
      cuotaInicial,
      baseFinanciada,
      principal,
      tasaMensual,
      tea,
      cuotaBase,
      cuotaMensual,
      seguroMensual,
      schedule,
    };
  }, [credito, tasaFinConfig, garantiaConfig, plazo]);

  if (!plazo) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">
          No hay información de plazo para generar la tabla de amortización.
        </p>
      </section>
    );
  }

  if (loadingTasa) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
        <p className="text-sm text-slate-600">Cargando configuración de tasa...</p>
      </section>
    );
  }

  if (errorTasa || !tasaFinConfig) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 shadow-sm p-4 sm:p-6">
        <p className="text-sm text-rose-700">
          No fue posible obtener la configuración de la tasa de financiación (TASA_FIN).
        </p>
      </section>
    );
  }

  if (!resultado) return null;

  const {
    valorProducto,
    cuotaInicial,
    baseFinanciada,
    principal,
    tasaMensual,
    tea,
    cuotaMensual,
    schedule,
  } = resultado;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Encabezado tipo PDF (Resumen + Condiciones) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900 mb-2">Resumen del crédito</p>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Cuota inicial:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(cuotaInicial)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Base financiada (incl. gastos):</span>
              <span className="font-semibold text-slate-900">{fmtCOP(baseFinanciada)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Valor a financiar:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(principal)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Valor moto:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(valorProducto)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Plazo (meses):</span>
              <span className="font-semibold text-slate-900">{plazo}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900 mb-2">Condiciones</p>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Tasa mensual efectiva:</span>
              <span className="font-semibold text-slate-900">{fmtPct(tasaMensual)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Tasa efectiva anual:</span>
              <span className="font-semibold text-slate-900">{fmtPct(tea)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-slate-600">Cuota mensual:</span>
              <span className="font-semibold text-slate-900">{fmtCOP(Math.round(cuotaMensual))}</span>
            </div>
          </div>
        </div>

        {/* Tabla igual a PDF */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Periodo</th>
                <th className="px-3 py-2 text-right font-semibold">Saldo inicial</th>
                <th className="px-3 py-2 text-right font-semibold">Intereses</th>
                <th className="px-3 py-2 text-right font-semibold">Abono a capital</th>
                <th className="px-3 py-2 text-right font-semibold">Cuota mensual</th>
                <th className="px-3 py-2 text-right font-semibold">Saldo final</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {schedule.map((row) => (
                <tr key={row.periodo} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">{row.periodo}</td>
                  <td className="px-3 py-1.5 text-right">
                    {fmtCOP(Math.round(row.saldoInicial))}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {fmtCOP(Math.round(row.intereses))}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {fmtCOP(Math.round(row.abonoCapital))}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {fmtCOP(Math.round(row.cuotaMensual))}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {fmtCOP(Math.round(row.saldoFinal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          Este plan de pagos es un documento informativo. Los valores pueden variar ligeramente por redondeos y ajustes operativos de la entidad financiera.
        </p>
      </div>
    </section>
  );
};

export default TablaAmortizacionCredito;
