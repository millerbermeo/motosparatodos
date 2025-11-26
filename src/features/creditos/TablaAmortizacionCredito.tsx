import React, { useMemo } from 'react';
import { useConfigPlazoByCodigo } from '../../services/configuracionPlazoService'; // 👈 ajusta la ruta del import

// Ajusta este tipo a lo que realmente devuelve tu backend/hook
// type ConfigPlazo = {
//   codigo: string;
//   servicio: string;
//   plazo_meses: number;
//   tipo_valor: '%' | '$';
//   valor: number;
// };

interface CreditoApi {
  valor_producto: number;
  cuota_inicial: number;
  plazo_meses: number;

  soat?: string | number;
  matricula?: string | number;
  impuestos?: string | number;
  accesorios_total?: string | number;
  precio_seguros?: string | number;          // total seguro (para dividir entre meses)
  garantia_extendida_valor?: string | number;
}

interface TablaAmortizacionCreditoProps {
  credito: CreditoApi;
  fechaCreacion?: string;   // 👈 nueva prop
}

const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

type AmortRow = {
  periodo: number;
  cuotaBase: number;
  seguroMensual: number;
  cuotaTotal: number;
  interes: number;
  capital: number;
  saldo: number;
  fechaCuota?: Date;   // 👈 nueva propiedad
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  // Pequeño ajuste por si el mes no tiene ese día (p.ej. 31)
  if (d.getDate() < day) {
    d.setDate(0);
  }

  return d;
};

const buildSchedule = (
  principal: number,
  tasaMensual: number,
  meses: number,
  seguroMensual: number,
  fechaInicio?: Date       // 👈 nueva param opcional
): { cuotaBase: number; schedule: AmortRow[] } => {
  if (principal <= 0 || tasaMensual <= 0 || meses <= 0) {
    return { cuotaBase: 0, schedule: [] };
  }

  const r = tasaMensual;
  const n = meses;

  // Fórmula cuota fija (método francés)
  const cuotaBase =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const schedule: AmortRow[] = [];
  let saldo = principal;

  for (let i = 1; i <= n; i++) {
    const interes = saldo * r;
    let capital = cuotaBase - interes;
    let nuevoSaldo = saldo - capital;

    if (i === n) {
      capital = saldo;
      nuevoSaldo = 0;
    }

    // 👇 calcular fecha de la cuota (i-ésima) a partir de fechaInicio
    const fechaCuota = fechaInicio
      ? addMonths(fechaInicio, i - 1)  // cuota 1 => +0 meses, cuota 2 => +1, etc.
      : undefined;

    schedule.push({
      periodo: i,
      cuotaBase,
      seguroMensual,
      cuotaTotal: cuotaBase + seguroMensual,
      interes,
      capital,
      saldo: nuevoSaldo < 1 ? 0 : nuevoSaldo,
      fechaCuota,               // 👈 la guardamos en el row
    });

    saldo = nuevoSaldo;
  }

  return { cuotaBase, schedule };
};

export const TablaAmortizacionCredito: React.FC<TablaAmortizacionCreditoProps> = ({
  credito,
  fechaCreacion,
}) => {
  const plazo = credito.plazo_meses ?? 0;

  // 🔹 Tasa de financiación (mensual) desde backend
  const {
    data: tasaFinConfig,
    isLoading: loadingTasa,
    error: errorTasa,
  } = useConfigPlazoByCodigo('TASA_FIN', true);

  // Opcional: configuración de garantía extendida por plazo (ejemplo)
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

    // Si la garantía del crédito viene en 0, podríamos calcularla por porcentaje:
    if (garantiaExt === 0 && garantiaConfig && garantiaConfig.tipo_valor === '%') {
      const porcentaje = garantiaConfig.valor / 100; // p.ej. 35% para 24 meses
      garantiaExt = valorProducto * porcentaje;
    }

    const baseFinanciada =
      valorProducto + soat + matricula + impuestos + accesorios + garantiaExt;

    const principal = Math.max(baseFinanciada - cuotaInicial, 0);

    // Seguro mensual: dividimos el total entre los meses
    const seguroMensual = plazo > 0 ? precioSeguros / plazo : 0;

    // Tasa FIN viene como porcentaje mensual, p.ej. 1.88
    const tasaMensual =
      tasaFinConfig.tipo_valor === '%'
        ? tasaFinConfig.valor / 100
        : tasaFinConfig.valor;

    // 👇 fecha inicial tomada de la fecha de creación del crédito
    const fechaInicio = fechaCreacion ? new Date(fechaCreacion) : undefined;

    const { cuotaBase, schedule } = buildSchedule(
      principal,
      tasaMensual,
      plazo,
      seguroMensual,
      fechaInicio          // 👈 ahora sí se pasa a la función
    );

    return {
      principal,
      tasaMensual,
      seguroMensual,
      cuotaBase,
      cuotaTotal: cuotaBase + seguroMensual,
      schedule,
      baseFinanciada,
      cuotaInicial,
      valorProducto,
    };
  }, [credito, tasaFinConfig, garantiaConfig, plazo, fechaCreacion]);

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
    principal,
    tasaMensual,
    seguroMensual,
    cuotaBase,
    cuotaTotal,
    schedule,
    baseFinanciada,
    cuotaInicial,
    valorProducto,
  } = resultado;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-6 space-y-4">
  

        {/* Resumen superior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-slate-500">Valor motocicleta</p>
            <p className="font-semibold text-slate-900">
              {fmtCOP(valorProducto)}
            </p>
            <p className="text-slate-500 mt-2">Base financiada (incl. gastos)</p>
            <p className="font-semibold text-slate-900">
              {fmtCOP(baseFinanciada)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-slate-500">Cuota inicial</p>
            <p className="font-semibold text-slate-900">
              {fmtCOP(cuotaInicial)}
            </p>
            <p className="text-slate-500 mt-2">Monto financiado</p>
            <p className="font-semibold text-slate-900">
              {fmtCOP(principal)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-slate-500">Tasa de financiación mensual</p>
            <p className="font-semibold text-slate-900">
              {(tasaMensual * 100).toFixed(2)}%
            </p>
            <p className="text-slate-500 mt-2">Cuota</p>
            <p className="font-semibold text-slate-900">
              {fmtCOP(cuotaTotal)}{' '}
              <span className="text-xs text-slate-500">
                (base {fmtCOP(cuotaBase)} + seguro {fmtCOP(seguroMensual)})
              </span>
            </p>
          </div>
        </div>

        {/* Tabla de amortización */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Mes</th>
                <th className="px-3 py-2 text-left font-semibold">Año</th>
                <th className="px-3 py-2 text-right font-semibold">
                  Cuota base
                </th>
                <th className="px-3 py-2 text-right font-semibold">
                  Seguro
                </th>
                <th className="px-3 py-2 text-right font-semibold">
                  Cuota total
                </th>
                <th className="px-3 py-2 text-right font-semibold">
                  Interés
                </th>
                <th className="px-3 py-2 text-right font-semibold">
                  Capital
                </th>
                <th className="px-3 py-2 text-right font-semibold">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((row) => {
                const mes = row.fechaCuota
                  ? row.fechaCuota.toLocaleDateString('es-CO', { month: 'long' })
                  : '—';
                const anio = row.fechaCuota
                  ? row.fechaCuota.getFullYear()
                  : '—';

                return (
                  <tr key={row.periodo} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">{row.periodo}</td>
                    <td className="px-3 py-1.5 capitalize">{mes}</td>
                    <td className="px-3 py-1.5">{anio}</td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.cuotaBase))}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.seguroMensual))}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.cuotaTotal))}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.interes))}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.capital))}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtCOP(Math.round(row.saldo))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};

export default TablaAmortizacionCredito;
