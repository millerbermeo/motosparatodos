import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCredito, useDeudor } from '../../../services/creditosServices';
import { CalendarDays, User2 } from 'lucide-react';
import {
  useSolicitudesPorCodigoCredito,
} from '../../../services/solicitudServices';
import FacturaFinalDownload from '../pdf/FacturaFinal';
import ButtonLink from '../../../shared/components/ButtonLink';
import { useDistribuidoras } from '../../../services/distribuidoraServices';

// 🔹 NUEVOS: endpoint full + IVA
import { useCotizacionFullById } from '../../../services/fullServices';
import { useIvaDecimal } from '../../../services/ivaServices';
import FacturarCreditoForm from '../../../shared/components/credito/FacturarCreditoForm';

type MaybeNum = number | undefined | null;

// -------------------- Constantes --------------------

// --- Helpers de formato / casting ---
const toNum = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const fmtCOP = (v?: MaybeNum | string) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  if (num === undefined || num === null || isNaN(Number(num)) || Number(num) === 0)
    return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(num));
};

const safeStr = (v?: unknown) => (typeof v === 'string' ? v : '');

const FacturarCredito: React.FC = () => {
  const { id: codigoFromUrl, cot } = useParams<{ id: string; cot: string }>();
  const codigo_credito = String(codigoFromUrl ?? '');
  const id_cotizacion = String(cot ?? '');

  const { data: datos, isLoading, error } = useCredito(
    { codigo_credito },
    !!codigo_credito
  );
  const { data: deudor } = useDeudor(codigo_credito);

  // 🔹 FULL (cotización + crédito + solicitud)
  const {
    data: fullData,
    isLoading: loadingFull,
    error: errorFull,
  } = useCotizacionFullById(id_cotizacion);

  const cotizacion: any = fullData?.data?.cotizacion ?? null;

  // 🔹 IVA dinámico
  const {
    ivaDecimal,
    isLoading: ivaLoading,
    error: ivaError,
  } = useIvaDecimal();
  const IVA_DEC = ivaLoading || ivaError ? 0.19 : ivaDecimal ?? 0.19;

  // ➕ Consultar si ya hay solicitud para este crédito
  const { data: solicitudesCredito, isLoading: loadingSolic } =
    useSolicitudesPorCodigoCredito(codigo_credito);
  const solicitud = solicitudesCredito?.[0] ?? null;

  // si hay solicitud -> ocultar formulario
  const [yaRegistrada, setYaRegistrada] = useState(false);
  useEffect(() => {
    setYaRegistrada(!!solicitud);
  }, [solicitud]);

  // -------------------- Distribuidoras (HOOK DINÁMICO) --------------------
  const {
    data: distribuidorasResponse,
    isLoading: loadingDistribuidoras,
    error: errorDistribuidoras,
  } = useDistribuidoras({ page: 1, limit: 200 });

  const distribuidorasActivas = useMemo(
    () =>
      distribuidorasResponse?.data?.filter(
        (d: any) => d.estado === 1 // solo activas
      ) ?? [],
    [distribuidorasResponse]
  );



  // Fuente de verdad (mismo criterio que usas en otras vistas)
  const deudorData = (deudor as any)?.data ?? (datos as any)?.data ?? {};
  const credito = datos?.creditos?.[0];

  // --- Cliente ---
  const clienteNombre = [
    deudorData?.informacion_personal?.primer_nombre,
    deudorData?.informacion_personal?.segundo_nombre,
    deudorData?.informacion_personal?.primer_apellido,
    deudorData?.informacion_personal?.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');
  const clienteDoc = `${safeStr(
    deudorData?.informacion_personal?.tipo_documento
  )} ${safeStr(deudorData?.informacion_personal?.numero_documento)}`.trim();
  const clienteDireccion = [
    safeStr(deudorData?.informacion_personal?.ciudad_residencia),
    safeStr(deudorData?.informacion_personal?.direccion_residencia),
  ]
    .filter(Boolean)
    .join(', ');
  const clienteTelefono =
    safeStr(deudorData?.informacion_personal?.celular) ||
    safeStr(deudorData?.informacion_personal?.telefono_fijo);
  const clienteCorreo = safeStr(deudorData?.informacion_personal?.email);

  // -------------------- SELECCIÓN MOTO A / B (usando full) --------------------
  let motoSeleccionada: 'a' | 'b' | undefined;
  if (cotizacion) {
    const prod = safeStr(credito?.producto).toLowerCase();

    const descA = `${safeStr(cotizacion.marca_a)} ${safeStr(
      cotizacion.linea_a
    )}`.toLowerCase();
    const descB = `${safeStr(cotizacion.marca_b)} ${safeStr(
      cotizacion.linea_b
    )}`.toLowerCase();

    const lineaA = safeStr(cotizacion.linea_a).toLowerCase();
    const lineaB = safeStr(cotizacion.linea_b).toLowerCase();

    if (prod && descA && prod.includes(descA)) motoSeleccionada = 'a';
    else if (prod && descB && prod.includes(descB)) motoSeleccionada = 'b';
    else if (prod && lineaA && prod.includes(lineaA)) motoSeleccionada = 'a';
    else if (prod && lineaB && prod.includes(lineaB)) motoSeleccionada = 'b';
  }

  // helper para campos *_a / *_b
  const pickMotoField = (base: string): any => {
    if (!cotizacion) return undefined;
    const anyCot: any = cotizacion;
    const a = anyCot[`${base}_a`];
    const b = anyCot[`${base}_b`];

    if (motoSeleccionada === 'a') return a ?? b ?? anyCot[base];
    if (motoSeleccionada === 'b') return b ?? a ?? anyCot[base];

    // fallback si no se pudo detectar
    if (a && !b) return a;
    if (b && !a) return b;
    return anyCot[base] ?? a ?? b;
  };

  // --- Moto (nombre, motor, chasis, color) ---
  const motoNombre = safeStr(credito?.producto); // texto del crédito (ej: "YAMAHA 18 – 2024")
  const numMotor = safeStr(credito?.numero_motor);
  const numChasis = safeStr(credito?.numero_chasis);
  const color = safeStr((credito as any)?.color);

  // ===================== COSTOS / IVA / TOTALES =====================

  // 1) Total general del crédito (valor del producto)
  const valorProducto: number | undefined =
    toNum(credito?.valor_producto) ?? toNum(pickMotoField('precio_total'));

  // 2) Documentos: preferimos la descomposición de la cotización (soat_b, matricula_b, impuestos_b)
  const soat: MaybeNum =
    toNum(pickMotoField('soat')) ?? toNum((credito as any)?.soat);
  const matricula: MaybeNum =
    toNum(pickMotoField('matricula')) ??
    toNum(pickMotoField('precio_documentos')) ??
    toNum((credito as any)?.matricula);
  const impuestos: MaybeNum =
    toNum(pickMotoField('impuestos')) ?? toNum((credito as any)?.impuestos);

  // 3) Seguros y accesorios (desde el crédito)
  const accesoriosTotal: MaybeNum = toNum((credito as any)?.accesorios_total); // ej: 70000
  const precioSeguros: MaybeNum = toNum((credito as any)?.precio_seguros); // ej: 120000

  const accesoriosYSeguros: MaybeNum = useMemo(() => {
    const a = typeof accesoriosTotal === 'number' ? accesoriosTotal : 0;
    const s = typeof precioSeguros === 'number' ? precioSeguros : 0;
    const sum = a + s;
    return sum > 0 ? sum : undefined;
  }, [accesoriosTotal, precioSeguros]);

  // 4) Subtotal documentos
  const subtotalDocumentos: MaybeNum = useMemo(() => {
    const parts = [soat, matricula, impuestos].filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
    );
    return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
  }, [soat, matricula, impuestos]);

  // 5) Valor de la moto (sin documentos ni seguros ni accesorios)
  let valorMoto: number | undefined;
  if (typeof valorProducto === 'number' && Number.isFinite(valorProducto)) {
    const docs =
      (typeof soat === 'number' ? soat : 0) +
      (typeof matricula === 'number' ? matricula : 0) +
      (typeof impuestos === 'number' ? impuestos : 0);
    const extras =
      (typeof accesoriosTotal === 'number' ? accesoriosTotal : 0) +
      (typeof precioSeguros === 'number' ? precioSeguros : 0);

    const base = valorProducto - docs - extras;
    valorMoto = base > 0 ? base : valorProducto;
  } else {
    // fallback: usa precio_base de la moto
    valorMoto =
      toNum(pickMotoField('precio_base')) ?? toNum(credito?.valor_producto);
  }

  // 6) Desglose de IVA de la moto (bruto + IVA)
  let valorBruto: number | undefined;
  let ivaCalc: number | undefined;
  if (
    typeof valorMoto === 'number' &&
    Number.isFinite(valorMoto) &&
    valorMoto > 0
  ) {
    const bruto = Math.round(valorMoto / (1 + IVA_DEC));
    const iva = Math.max(valorMoto - bruto, 0);
    valorBruto = bruto;
    ivaCalc = iva;
  }

  // 7) TOTAL general (coherente con el crédito)
  const totalGeneral: number | undefined =
    typeof valorProducto === 'number' && Number.isFinite(valorProducto)
      ? valorProducto
      : (() => {
        const parts = [
          valorMoto,
          soat,
          matricula,
          impuestos,
          accesoriosYSeguros,
        ].filter(
          (n): n is number =>
            typeof n === 'number' && Number.isFinite(n) && n > 0
        );
        return parts.length ? parts.reduce((a, b) => a + b, 0) : undefined;
      })();

  const fechaCreacion = safeStr(credito?.fecha_creacion);
  const asesor = safeStr(credito?.asesor);
  const numeroSolicitud = credito?.cotizacion_id ?? codigo_credito;

  // Observaciones (cuota inicial y saldo)
  const cuotaInicial: MaybeNum = toNum((credito as any)?.cuota_inicial);
  const saldoFinanciar: number | undefined =
    typeof totalGeneral === 'number' && typeof cuotaInicial === 'number'
      ? Math.max(totalGeneral - cuotaInicial, 0)
      : undefined;

  // Garantía extendida (si existe)
  const garantiaExtendida: MaybeNum = toNum(
    (credito as any)?.garantia_extendida_valor
  );

 
  const BaseUrl =
    import.meta.env.VITE_API_URL ??
    'https://tuclick.vozipcolombia.net.co/motos/back';

  return (
    <main className="min-h-screen w-full bg-slate-50">
      {/* Header / Migas */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-start gap-5">
          <div className="pt-4 mb-3">
            <ButtonLink
              to="/solicitudes"
              label="Volver a facturación"
              direction="back"
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight badge badge-soft badge-success">
            Solicitudes de facturación
          </h1>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {(isLoading ||
          loadingSolic ||
          loadingDistribuidoras ||
          loadingFull ||
          ivaLoading) && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              Cargando información…
            </div>
          )}

        {(error || errorDistribuidoras || errorFull || ivaError) && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Ocurrió un error al cargar la información del crédito o la cotización.
          </div>
        )}

        {/* Encabezado: Información del cliente + caja lateral con solicitud */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold text-emerald-700 mb-3">
                Información del cliente
              </h2>
              <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                <div className="font-medium text-slate-900">{clienteNombre}</div>
                <div className="text-slate-600">{clienteDoc}</div>
                <div className="text-slate-600">{clienteDireccion}</div>
                <div>
                  <span className="font-semibold text-slate-700">Teléfono:</span>{' '}
                  <span className="text-slate-600">{clienteTelefono || ''}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Correo:</span>{' '}
                  <span className="text-slate-600">{clienteCorreo}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    Solicitud #{numeroSolicitud ?? ''}
                  </div>
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
            <RowRight
              label="Total:"
              value={fmtCOP(valorMoto)}
              bold
              badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
            />
          </div>
        </section>

        {/* Precio de documentos */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm">
            Precio de documentos
          </div>
          <div className="divide-y divide-slate-200">
            <RowRight label="SOAT:" value={fmtCOP(soat)} />
            <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
            <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
            <RowRight
              label="Subtotal documentos:"
              value={fmtCOP(subtotalDocumentos)}
              bold
            />
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
              <RowRight label="Accesorios:" value={fmtCOP(accesoriosTotal)} />
              <RowRight label="Seguros:" value={fmtCOP(precioSeguros)} />
              <RowRight
                label="Valor bruto:"
                value={fmtCOP(
                  accesoriosYSeguros
                    ? Math.round((accesoriosYSeguros as number) / (1 + IVA_DEC))
                    : undefined
                )}
              />
              <RowRight
                label="IVA:"
                value={fmtCOP(
                  accesoriosYSeguros
                    ? (accesoriosYSeguros as number) -
                    Math.round(
                      (accesoriosYSeguros as number) / (1 + IVA_DEC)
                    )
                    : undefined
                )}
              />
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
              <RowRight
                label="Seguros y accesorios:"
                value={fmtCOP(accesoriosYSeguros)}
              />
              <RowRight
                label="TOTAL:"
                value={fmtCOP(totalGeneral)}
                bold
                badge="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5"
              />
            </div>
          </div>
        </section>

        {/* Observaciones */}
        <section className="rounded-xl border border-success bg-[#F1FCF6] p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Observaciones</h3>
          <ul className="list-disc pl-6 text-sm leading-7 text-slate-700 space-y-1">
            <li>
              Crédito aprobado por{' '}
              <span className="font-semibold text-slate-900">
                Crédito directo
              </span>
            </li>
            <li>
              El crédito tiene una cuota inicial de{' '}
              <span className="font-semibold text-slate-900">
                {fmtCOP(cuotaInicial)}
              </span>
            </li>
            <li>
              El saldo a financiar del producto es{' '}
              <span className="font-semibold text-slate-900">
                {fmtCOP(saldoFinanciar)}
              </span>
            </li>
            <li>
              La garantía extendida tiene un valor de{' '}
              <span className="font-semibold text-slate-900">
                {fmtCOP(garantiaExtendida)}
              </span>
            </li>
          </ul>
        </section>

        {/* Formulario inferior */}
{!yaRegistrada ? (
  <FacturarCreditoForm
    codigoCredito={codigo_credito}
    idCotizacion={id_cotizacion}
    clienteNombre={clienteNombre}
    distribuidorasActivas={distribuidorasActivas}
    loadingDistribuidoras={loadingDistribuidoras}
    errorDistribuidoras={errorDistribuidoras}
  />
) : (
          /* Si hay solicitud registrada, mostramos el detalle */
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Solicitud registrada
              </h3>

              {/* Badges de estado (DaisyUI) */}
              <div className="hidden md:flex flex-wrap items-center gap-2">
                <span className={estadoBadge(solicitud?.autorizado).clase}>
                  Autorizado: {estadoBadge(solicitud?.autorizado).texto}
                </span>
                <span className={estadoBadge(solicitud?.facturado).clase}>
                  Facturado: {estadoBadge(solicitud?.facturado).texto}
                </span>
                <span className={estadoBadge(solicitud?.entregaAutorizada).clase}>
                  Entrega: {estadoBadge(solicitud?.entregaAutorizada).texto}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Datos de la solicitud */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Datos de la solicitud
                </h4>

                <dl className="text-sm text-slate-700 grid grid-cols-1 gap-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Agencia</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.agencia ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Distribuidora</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.distribuidora ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Código</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.codigo ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Código crédito</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.codigoCredito ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Cliente</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.cliente ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Tipo</dt>
                    <dd className="text-right">
                      <span className="badge badge-info badge-sm font-medium">
                        {solicitud?.tipo ?? '—'}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Recibo pago</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.numeroRecibo ?? '—'}
                    </dd>
                  </div>

                  {/* Badges en detalle también */}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Autorizado</dt>
                    <dd className="text-right">
                      <span className={estadoBadge(solicitud?.autorizado).clase}>
                        {estadoBadge(solicitud?.autorizado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Facturado</dt>
                    <dd className="text-right">
                      <span className={estadoBadge(solicitud?.facturado).clase}>
                        {estadoBadge(solicitud?.facturado).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Entrega autorizada</dt>
                    <dd className="text-right">
                      <span
                        className={estadoBadge(
                          solicitud?.entregaAutorizada
                        ).clase}
                      >
                        {estadoBadge(solicitud?.entregaAutorizada).texto}
                      </span>
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Creado</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.fechaCreacion ?? '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Actualizado</dt>
                    <dd className="font-medium text-right">
                      {solicitud?.actualizado ?? '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Documentos */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Documentos</h4>

                <ul className="text-sm text-slate-700 space-y-3">
                  {/* Cédula */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Cédula</span>
                      <span className="text-xs text-slate-500">
                        Documento de identidad
                      </span>
                    </div>

                    {solicitud?.cedulaPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={`${BaseUrl}/${solicitud.cedulaPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar cédula"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={badgeNeutro('No adjunta').clase}>
                        {badgeNeutro('No adjunta').texto}
                      </span>
                    )}
                  </li>

                  {/* Manifiesto */}
                  <li className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium block">Manifiesto</span>
                      <span className="text-xs text-slate-500">
                        Soporte de manifiesto
                      </span>
                    </div>

                    {solicitud?.manifiestoPath ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={`${BaseUrl}/${solicitud.manifiestoPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver o descargar manifiesto"
                      >
                        Ver / descargar
                      </a>
                    ) : (
                      <span className={badgeNeutro('No adjunto').clase}>
                        {badgeNeutro('No adjunto').texto}
                      </span>
                    )}
                  </li>

                  <li className=" items-center justify-between gap-4 hidden">
                    <div className="min-w-0">
                      <span className="font-medium block">Factura</span>
                      <span className="text-xs text-slate-500">
                        Factura electrónica (demo)
                      </span>
                    </div>
                    <FacturaFinalDownload />
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end">
              <Link to={`/creditos/detalle/${codigo_credito}`}>
                <button
                  type="button"
                  className="btn border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  aria-label="Volver al detalle del crédito"
                  title="Volver al detalle del crédito"
                >
                  ⟵ Volver
                </button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

const RowRight: React.FC<{
  label: string;
  value?: string;
  bold?: boolean;
  badge?: string;
}> = ({ label, value = '', bold, badge = '' }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div
      className={`col-span-4 sm:col-span-2 text-right ${bold ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
        }`}
    >
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);

export default FacturarCredito;

// Helper para badges DaisyUI
const estadoBadge = (ok?: boolean) => ({
  clase: `badge ${ok ? 'badge-success' : 'badge-error'} badge-sm font-medium`,
  texto: ok ? 'Sí' : 'No',
});

const badgeNeutro = (texto?: string) => ({
  clase: `badge badge-ghost badge-sm font-medium`,
  texto: texto ?? '—',
});
