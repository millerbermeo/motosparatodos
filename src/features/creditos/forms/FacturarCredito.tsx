import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCredito, useDeudor } from '../../../services/creditosServices';
import { CalendarDays, User2 } from 'lucide-react';

type MaybeNum = number | undefined | null;

const fmtCOP = (v?: MaybeNum) =>
  typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(v)
    : (v === 0 ? '0 COP' : ''); // si no existe, vacío; si es 0, muestra 0 COP

const safeStr = (v?: unknown) => (typeof v === 'string' ? v : '');

const FacturarCredito: React.FC = () => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? '');

  const { data: datos, isLoading, error } = useCredito({ codigo_credito }, !!codigo_credito);
  const { data: deudor } = useDeudor(codigo_credito);

  // Fuente de verdad (mismo criterio que usas en otras vistas)
  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  const credito = datos?.creditos?.[0];

  // --- Cliente ---
  const clienteNombre =
    [deudorData?.informacion_personal?.primer_nombre, deudorData?.informacion_personal?.segundo_nombre, deudorData?.informacion_personal?.primer_apellido, deudorData?.informacion_personal?.segundo_apellido]
      .filter(Boolean)
      .join(' ');
  const clienteDoc = `${safeStr(deudorData?.informacion_personal?.tipo_documento) ?? ''} ${safeStr(deudorData?.informacion_personal?.numero_documento) ?? ''}`.trim();
  const clienteDireccion = [safeStr(deudorData?.informacion_personal?.ciudad_residencia), safeStr(deudorData?.informacion_personal?.direccion_residencia)]
    .filter(Boolean)
    .join(', ');
  const clienteTelefono = safeStr(deudorData?.informacion_personal?.celular) || safeStr(deudorData?.informacion_personal?.telefono_fijo);
  const clienteCorreo = safeStr(deudorData?.informacion_personal?.email);

  // --- Moto ---
  const motoNombre = safeStr(credito?.producto); // p.ej. "Kymco Agility Fusion"
  const numMotor = safeStr(credito?.numero_motor);
  const numChasis = safeStr(credito?.numero_chasis);
  const color = safeStr((credito as any)?.color);

  // --- Costos base ---
  const valorMoto: number | undefined =
    typeof credito?.valor_producto === 'number' ? credito?.valor_producto : undefined;

  // Si hay valorMoto, calculamos bruto + IVA para la primera tabla "Condiciones del negocio".
  // Tomamos el bruto como valorMoto / 1.19 (redondeo a entero) y el IVA como diferencia.
  const { valorBruto, ivaCalc } = useMemo(() => {
    if (typeof valorMoto === 'number' && Number.isFinite(valorMoto) && valorMoto > 0) {
      const bruto = Math.round(valorMoto / 1.19);
      const iva = Math.max(valorMoto - bruto, 0);
      return { valorBruto: bruto, ivaCalc: iva };
    }
    return { valorBruto: undefined, ivaCalc: undefined };
  }, [valorMoto]);

  // Extras opcionales (si no existen, se dejan vacíos)
  const soat: MaybeNum = (credito as any)?.soat;
  const matricula: MaybeNum = (credito as any)?.matricula;
  const impuestos: MaybeNum = (credito as any)?.impuestos;
  const accesoriosYSeguros: MaybeNum = (credito as any)?.accesorios || (credito as any)?.seguros_accesorios;

  // TOTAL general (si alguno no existe, no rompe; suma solo los numéricos)
  const totalGeneral: number | undefined = useMemo(() => {
    const parts = [valorMoto, soat, matricula, impuestos, accesoriosYSeguros].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n)
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [valorMoto, soat, matricula, impuestos, accesoriosYSeguros]);

  const fechaCreacion = safeStr(credito?.fecha_creacion);
  const asesor = safeStr(credito?.asesor);
  const numeroSolicitud = credito?.id ?? credito?.codigo_credito ?? credito?.codigo_credito ?? codigo_credito;

  // Observaciones (cuota inicial y saldo)
  const cuotaInicial: MaybeNum = typeof (credito as any)?.cuota_inicial === 'number' ? (credito as any)?.cuota_inicial : undefined;
  const saldoFinanciar: number | undefined =
    typeof valorMoto === 'number'
      ? Math.max(valorMoto - (typeof cuotaInicial === 'number' ? cuotaInicial : 0), 0)
      : undefined;

  // Garantía extendida (si existe)
  const garantiaExtendida: MaybeNum = (credito as any)?.garantia_extendida_valor;

  return (
    <main className="min-h-screen w-full bg-slate-50">
      {/* Header / Migas */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight badge badge-soft badge-success">Solicitar facturación</h1>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">Cargando información…</div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Ocurrió un error al cargar el crédito.
          </div>
        )}

        {/* Encabezado: Información del cliente + caja lateral con solicitud */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-emerald-700 mb-3">Información del cliente</h2>
              <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                <div className="font-medium text-slate-900">{clienteNombre}</div>
                <div className="text-slate-600">{clienteDoc}</div>
                <div className="text-slate-600">{clienteDireccion}</div>
                <div><span className="font-semibold text-slate-700">Teléfono:</span> <span className="text-slate-600">{clienteTelefono || ''}</span></div>
                <div><span className="font-semibold text-slate-700">Correo:</span> <span className="text-slate-600">{clienteCorreo}</span></div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">Solicitud #{numeroSolicitud ?? ''}</div>
                  <div className="text-sm text-slate-600 inline-flex items-center gap-1 mt-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>{fechaCreacion}</span>
                  </div>
                  <div className="text-sm text-slate-600 inline-flex items-center gap-1 mt-1">
                    <User2 className="w-4 h-4" />
                    <span>Asesor {asesor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabla: Motocicleta */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-semibold px-5 py-2.5 text-sm">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-5">Motocicleta</div>
              <div className="col-span-2"># Motor</div>
              <div className="col-span-3"># Chasis</div>
              <div className="col-span-2 text-right pr-2">Color</div>
            </div>
          </div>
          <div className="px-5 py-3 text-sm text-slate-800">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-5 truncate">{motoNombre}</div>
              <div className="col-span-2 truncate">{numMotor}</div>
              <div className="col-span-3 truncate">{numChasis}</div>
              <div className="col-span-2 text-right pr-2">{color}</div>
            </div>
          </div>
        </section>

        {/* Condiciones del negocio */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
            <span>Condiciones del negocio</span>
            <span>Costos</span>
          </div>
          <div className="divide-y divide-slate-200">
            <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
            <RowRight label="Valor bruto:" value={fmtCOP(valorBruto)} />
            <RowRight label="IVA:" value={fmtCOP(ivaCalc)} />
            <RowRight label="Total:" value={fmtCOP(valorMoto)} bold badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5" />
          </div>
        </section>

        {/* Dos columnas: Seguros y accesorios / TOTAL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seguros y accesorios */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
              Seguros y accesorios
            </div>
            <div className="divide-y divide-slate-200">
              <RowRight label="Valor bruto:" value={fmtCOP(accesoriosYSeguros ? Math.round((accesoriosYSeguros as number) / 1.19) : undefined)} />
              <RowRight label="IVA:" value={fmtCOP(accesoriosYSeguros ? (accesoriosYSeguros as number) - Math.round((accesoriosYSeguros as number) / 1.19) : undefined)} />
              <RowRight label="Total:" value={fmtCOP(accesoriosYSeguros)} />
            </div>
          </div>

          {/* TOTAL */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
              TOTAL
            </div>
            <div className="divide-y divide-slate-200">
              <RowRight label="Valor Moto:" value={fmtCOP(valorMoto)} />
              <RowRight label="SOAT:" value={fmtCOP(soat)} />
              <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
              <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
              <RowRight label="Seguros y accesorios:" value={fmtCOP(accesoriosYSeguros)} />
              <RowRight label="TOTAL:" value={fmtCOP(totalGeneral)} bold badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5" />
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="rounded-xl border border-success bg-[#F1FCF6] p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Observaciones</h3>
          <ul className="list-disc pl-6 text-sm leading-7 text-slate-700 space-y-1">
            <li>
              Crédito aprobado por <span className="font-semibold text-slate-900">Crédito directo</span>
            </li>
            <li>
              El crédito tiene una cuota inicial de <span className="font-semibold text-slate-900">{fmtCOP(cuotaInicial)}</span>
            </li>
            <li>
              El saldo a financiar del producto es <span className="font-semibold text-slate-900">{fmtCOP(saldoFinanciar)}</span>
            </li>
            <li>
              La garantía extendida tiene un valor de <span className="font-semibold text-slate-900">{fmtCOP(garantiaExtendida)}</span>
            </li>
            <li>
              Incluye los siguientes seguros:
            </li>
          </ul>
        </section>

        {/* Formulario inferior */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-center text-slate-900 font-semibold mb-6">Complete la siguiente información</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Distribuidora</label>
              <select className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500">
                <option value="">Seleccione…</option>
                {/* Opciones reales si existen; si no, queda vacío */}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Recibo de pago N° <span className="text-rose-600">*</span></label>
              <input
                type="text"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="Digite el número de recibo de pago"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Copia de la cédula <span className="text-rose-600">*</span></label>
              <button type="button" className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                📂 Buscar cédula…
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Manifiesto <span className="text-rose-600">*</span></label>
              <button type="button" className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                📂 Buscar manifiesto…
              </button>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-sm text-slate-600">Observaciones</label>
              <textarea
                className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                rows={4}
                placeholder="Observaciones"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link to={`/creditos/detalle/${codigo_credito}`}>
            <button className="btn border-slate-300 bg-white hover:bg-slate-50 text-slate-700">⟵ Volver</button>
            </Link>
            <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600">✓ Aceptar</button>
          </div>
        </section>
      </div>
    </main>
  );
};

const RowRight: React.FC<{ label: string; value?: string; bold?: boolean, badge?: string }> = ({ label, value = '', bold, badge = '' }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div className={`col-span-4 sm:col-span-2 text-right ${bold ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

export default FacturarCredito;
