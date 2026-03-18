import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useCotizacionActividades,
  useCotizacionById,
} from '../../services/cotizacionesServices';
import {
  UserRound,
  Bike,
  Calculator,
  Activity,
  CalendarPlus,
  Mail as MailIcon,
  FileDown,
  Fingerprint,
  Building2,
  UserCircle2,
  MessageSquareQuote,
  BadgeCheck,
  Edit,
  Phone,
} from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useAuthStore } from '../../store/auth.store';
import { useLoaderStore } from '../../store/loader.store';
import { useGarantiaExtByCotizacionId } from '../../services/garantiaExtServices';
import { CotizacionDetalladaPDFDoc } from './CotizacionDetalladaPDFDoc';
import { useEmpresaById } from '../../services/empresasServices';
import {
  useSolicitudFacturacionPorIdCotizacion,
  useUltimaSolicitudPorIdCotizacion,
} from '../../services/solicitudServices';
import { VehiculoCamposCollapse } from '../../shared/components/VehiculoCamposCollapse';

import {
  DocumentosFacturacionCards,
  DEFAULT_DOCS,
} from '../../shared/components/DocumentosFacturacionCards';
import type { Cotizacion, Cuotas } from './detalles-cotizacion/detallesCotizacion.type';
import { fmtCOP } from '../../utils/money';
import { fmtFecha } from '../../utils/date';
import { estadoBadgeClass } from './detalles-cotizacion/estados-cotizacion';
import InfoRow from './detalles-cotizacion/sub-components/InfoRow';
import InfoPill from './detalles-cotizacion/sub-components/InfoPill';
import DataRow from './detalles-cotizacion/sub-components/DataRow';
import DataRow2 from './detalles-cotizacion/sub-components/DataRow2';
import DataRowText from './detalles-cotizacion/sub-components/DataRowText';
import StatTile from './detalles-cotizacion/sub-components/StatTile';
import renderCuotaTile from './detalles-cotizacion/sub-components/renderCuotaTile';
import renderCuotaRow from './detalles-cotizacion/sub-components/renderCuotaRow';
import MotoImage from './detalles-cotizacion/sub-components/MotoImage';
import { mapApiToCotizacion } from './detalles-cotizacion/sub-components/detalleCotizacion.mapper';
import { getFotoUrl, toAbsoluteUrl, toAbsoluteUrlOrUndefined } from '../../utils/files';
import { normalizarTexto } from '../../utils/text';
import {
  getGpsTexto,
  getGpsValorAplicado,
} from './detalles-cotizacion/sub-components/moto.utils';
import type { ActividadItem, DocItem } from './types';



const EMPTY_EMPRESA_PDF = {
  nombre: '',
  ciudad: '',
  almacen: '',
  nit: '',
  telefono: '',
  direccion: '',
};

const DetalleCotizacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const user = useAuthStore((state) => state.user);
  const { show, hide } = useLoaderStore();

  const { data, isLoading, error } = useCotizacionById(id);

  const payload = (data as any)?.data ?? data;

  const q: Cotizacion | undefined = React.useMemo(
    () => (payload ? mapApiToCotizacion(payload) : undefined),
    [payload]
  );

  const rawIdEmpresa = payload?.id_empresa_a ?? payload?.id_empresa_b;
  const idEmpresa = Number(rawIdEmpresa);
  const hasEmpresa = Number.isFinite(idEmpresa) && idEmpresa > 0;

  const { data: empresaSeleccionada, isLoading: loadingEmpresa } =
    useEmpresaById(hasEmpresa ? idEmpresa : 0);

  const { data: solicitudFact } = useSolicitudFacturacionPorIdCotizacion(id, {
    enabled: !!id,
  });

  const facturaUrl = React.useMemo(() => {
    return toAbsoluteUrl(solicitudFact?.facturaPath);
  }, [solicitudFact?.facturaPath]);

  const { data: ultimaSolData } = useUltimaSolicitudPorIdCotizacion(id ?? '');

  const ultimaSolRegistro: any = (ultimaSolData as any)?.registro ?? ultimaSolData ?? null;

  const cedulaUrlSolicitud = React.useMemo(() => {
    return toAbsoluteUrl(ultimaSolRegistro?.cedula ?? null);
  }, [ultimaSolRegistro]);

  const manifiestoUrlSolicitud = React.useMemo(() => {
    return toAbsoluteUrl(ultimaSolRegistro?.manifiesto ?? null);
  }, [ultimaSolRegistro]);

  const empresaPDF = React.useMemo(() => {
    if (!empresaSeleccionada) return EMPTY_EMPRESA_PDF;

    return {
      nombre: empresaSeleccionada.nombre_empresa,
      ciudad: 'Cali',
      almacen: empresaSeleccionada.nombre_empresa,
      nit: empresaSeleccionada.nit_empresa,
      telefono: empresaSeleccionada.telefono_garantias ?? '',
      direccion: empresaSeleccionada.direccion_siniestros ?? '',
    };
  }, [empresaSeleccionada]);

  const logoUrl = React.useMemo(() => {
    const fromEmpresa = toAbsoluteUrlOrUndefined(empresaSeleccionada?.foto);
    return fromEmpresa || '/moto3.png';
  }, [empresaSeleccionada]);

  const { data: actividades = [], isLoading: loadingAct } = useCotizacionActividades(id);

  const { data: geResp, isLoading: geLoading } = useGarantiaExtByCotizacionId(id);
  const ge = geResp?.data;

  const actividadItems = React.useMemo<ActividadItem[]>(
    () =>
      (actividades ?? []).map((r: any) => ({
        fecha: fmtFecha(r?.fecha_creacion),
        titulo: r?.comentario || '—',
        etiqueta: r?.rol_usuario ? `${r.nombre_usuario} · ${r.rol_usuario}` : r?.nombre_usuario,
        color: 'info',
      })),
    [actividades]
  );

  const [tab, setTab] = React.useState<'A' | 'B'>('A');

  React.useEffect(() => {
    if (q?.motoB) {
      setTab('A');
    }
  }, [q?.motoB]);

  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  const moto = tab === 'A' ? q?.motoA : q?.motoB;

  const cuotas = moto?.cuotas ?? ({} as Cuotas);

  const totalDocumentos = React.useMemo(() => {
    if (!moto) return 0;
    return (moto.soat || 0) + (moto.matricula || 0) + (moto.impuestos || 0);
  }, [moto]);

  const subtotalExtras = React.useMemo(() => {
    if (!moto) return 0;
    return (
      (moto.precioDocumentos || 0) +
      (moto.accesoriosYMarcacion || 0) +
      (moto.adicionalesTotal || 0)
    );
  }, [moto]);

  const totalSinExtras = React.useMemo(() => {
    if (!moto) return 0;
    return (moto.precioBase || 0) - (moto.descuentos || 0);
  }, [moto]);

  const totalConTodo = React.useMemo(() => {
    if (!moto) return 0;

    const gpsAplicado = getGpsValorAplicado(moto);

    return (
      (moto.precioBase || 0) -
      (moto.descuentos || 0) +
      (moto.accesoriosYMarcacion || 0) +
      totalDocumentos +
      (moto.adicionalesTotal || 0) +
      Number(moto.polizaValor ?? 0) +
      Number(moto.garantiaExtendidaValor ?? 0) +
      gpsAplicado +
      Number(moto.otrosSeguros ?? 0)
    );
  }, [moto, totalDocumentos]);

  const saldoConTodo = React.useMemo(() => {
    if (!moto) return 0;
    const inicial = Number(cuotas?.inicial ?? 0);
    return Math.max(totalConTodo - inicial, 0);
  }, [moto, cuotas, totalConTodo]);

  const hasCuotas = React.useMemo(() => {
    if (!moto) return false;

    return (
      (cuotas.inicial ?? 0) > 0 ||
      typeof cuotas.meses6 === 'number' ||
      typeof cuotas.meses12 === 'number' ||
      typeof cuotas.meses18 === 'number' ||
      typeof cuotas.meses24 === 'number' ||
      typeof cuotas.meses30 === 'number' ||
      typeof cuotas.meses36 === 'number'
    );
  }, [moto, cuotas]);

  const tipoPagoNorm = normalizarTexto(q?.comercial?.tipo_pago);
  const isContado = tipoPagoNorm.includes('contado');
  const isCreditoPropio =
    tipoPagoNorm.includes('directo') || tipoPagoNorm.includes('credibike');
  const isCreditoTerceros = tipoPagoNorm.includes('terceros');

  const showGarantiaExtendida = isCreditoPropio;
  const polizaLabel = isContado || isCreditoTerceros ? 'Garantía extendida' : 'Póliza';

  const isFacturado = normalizarTexto(q?.estado).includes('facturado');
  const tipoVehiculo = isCreditoPropio ? (1 as const) : (2 as const);

  const puedeCambiarEstado =
    user?.rol === 'Asesor' &&
    q?.estado !== 'Sin interés' &&
    q?.estado !== 'Solicitar facturación' &&
    q?.estado !== 'Facturado' &&
    q?.estado !== 'Solicitar crédito' &&
    q?.estado !== 'Solicitar crédito express';

  const puedeGestionAdmin =
    user?.rol === 'Administrador' ||
    user?.rol === 'Lider_marca' ||
    user?.rol === 'Lider_punto';

  const documentosFacturacionCombinados: DocItem[] = React.useMemo(() => {
    const docsBackend: DocItem[] = [
      { name: 'Cédula', url: cedulaUrlSolicitud || undefined },
      { name: 'Manifiesto', url: manifiestoUrlSolicitud || undefined },
    ].filter((d) => !!d.url);

    return [...DEFAULT_DOCS, ...docsBackend];
  }, [cedulaUrlSolicitud, manifiestoUrlSolicitud]);

  const garantiaExtendidaTabData = React.useMemo(() => {
    const isA = tab === 'A';

    const meses = isA
      ? ge?.meses_a ?? q?.motoA?.garantiaExtendidaMeses ?? null
      : ge?.meses_b ?? q?.motoB?.garantiaExtendidaMeses ?? null;

    const valor = isA
      ? ge?.valor_a ?? q?.motoA?.garantiaExtendidaValor ?? 0
      : ge?.valor_b ?? q?.motoB?.garantiaExtendidaValor ?? 0;

    return {
      isA,
      meses,
      valor,
      label: isA ? 'Moto A' : 'Moto B',
    };
  }, [tab, ge, q?.motoA?.garantiaExtendidaMeses, q?.motoA?.garantiaExtendidaValor, q?.motoB?.garantiaExtendidaMeses, q?.motoB?.garantiaExtendidaValor]);

  const handleDescargarRunt = React.useCallback(() => {
    const link = document.createElement('a');
    link.href = '/runt.pdf';
    link.download = 'runt.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleEnviarCorreo = React.useCallback(() => {
    if (!q) return;

    const to = q.cliente.email || '';
    const subject = `Tu cotización #${q.id}`;
    const body = [
      `Hola ${q.cliente.nombres || ''},`,
      '',
      `Te compartimos el detalle de tu cotización #${q.id}.`,
      q.motoA ? `Moto A: ${q.motoA.modelo} | Total: ${fmtCOP(q.motoA.total)}` : '',
      q.motoB ? `Moto B: ${q.motoB.modelo} | Total: ${fmtCOP(q.motoB.total)}` : '',
      '',
      'Quedo atento/a.',
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [q]);

  if (!id) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <span>
            Falta el parámetro <code>id</code> en la URL. Debe ser <code>/cotizaciones/:id</code>
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-lg">
          <span>Hubo un problema cargando la cotización #{id}.</span>
        </div>
      </main>
    );
  }

  if (!q) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-info max-w-lg">
          <span>No se encontró información para la cotización #{id}.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full.min-h-screen px-4 md:px-6 pb-6">
      <div className="pt-4 mb-3">
        <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" direction="back" />
      </div>

      <section className="w-full mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-slate-50 to-slate-100 border border-info p-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                Información de la cotización
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className={`badge ${estadoBadgeClass(q.estado)}`}>{q.estado}</span>
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Creada:</span>
                  <span className="font-medium">{q.creada || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-70">ID:</span>
                  <span className="font-mono">{q.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section className="card bg-white border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2 bg-[#3498DB]/70 text-white p-2 rounded-xl">
              <UserRound className="w-5 h-5" />
              <h2 className="card-title text-lg">Información del cliente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <InfoRow label="Nombres" value={q.cliente.nombres} />
              <InfoRow label="Apellidos" value={q.cliente.apellidos || ''} />
              <InfoRow label="Email" value={q.cliente.email || ''} />
              <InfoRow label="Teléfono" value={q.cliente.celular || ''} />
              <InfoRow label="Cédula" value={q.cliente.cedula || ''} />
              <InfoRow
                label="Primer Comentario"
                value={[q.cliente.comentario || '', q.cliente.comentario2 || '']}
                full
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 mt-2">
              <InfoPill
                icon={<UserCircle2 className="w-4 h-4" />}
                label="Asesor"
                value={q.comercial?.asesor || '—'}
              />

              <InfoPill
                icon={<Phone className="w-4 h-4" />}
                label="Teléfono asesor"
                value={
                  q.comercial?.telefono_asesor ? (
                    <a className="link link-primary" href={`tel:${q.comercial.telefono_asesor}`}>
                      {q.comercial.telefono_asesor}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />

              <InfoPill
                icon={<Fingerprint className="w-4 h-4" />}
                label="Tipo de pago"
                value={q.comercial?.tipo_pago || '—'}
              />

              <InfoPill
                icon={<MessageSquareQuote className="w-4 h-4" />}
                label="Canal de contacto"
                value={q.comercial?.canal_contacto || '—'}
              />

              <InfoPill
                icon={<BadgeCheck className="w-4 h-4" />}
                label="Prospecto"
                value={q.comercial?.prospecto || '—'}
              />

              <InfoPill
                icon={<MessageSquareQuote className="w-4 h-4" />}
                label="Pregunta"
                value={q.comercial?.pregunta || '—'}
              />

              <InfoPill
                icon={<Building2 className="w-4 h-4" />}
                label="Financiera"
                value={q.comercial?.financiera || 'No aplica'}
              />
            </div>
          </div>
        </section>

        <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5" />
                <h2 className="card-title text-lg">Motocicletas</h2>
              </div>

              {q.motoB && (
                <div role="tablist" className="tabs tabs-boxed">
                  <button
                    role="tab"
                    className={`tab rounded-lg px-4 py-2 ${tab === 'A'
                      ? 'tab-active bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    onClick={() => setTab('A')}
                  >
                    Moto A
                  </button>
                  <button
                    role="tab"
                    className={`tab rounded-lg px-4 py-2 ml-2 ${tab === 'B'
                      ? 'tab-active bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    onClick={() => setTab('B')}
                  >
                    Moto B
                  </button>
                </div>
              )}
            </div>

            {moto && (
              <div className="mb-3 flex gap-5 items-center">
                <span className="badge badge-ghost">{moto.modelo}</span>
              </div>
            )}

            {moto ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-3 rounded-xl border border-base-300/60 p-3 bg-base-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Vehículo</h3>

                  <DataRow label="Precio base" value={fmtCOP(moto.precioBase)} />

                  <DataRow
                    label="Descuentos"
                    value={fmtCOP(-Math.abs(moto.descuentos || 0))}
                    valueClass="text-error font-semibold"
                  />

                  <DataRow
                    label="Precio neto vehículo"
                    value={fmtCOP((moto.precioBase || 0) - (moto.descuentos || 0))}
                    strong
                  />

                  <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                      Documentos
                    </div>
                    <div className="space-y-1.5">
                      <DataRow label="SOAT" value={fmtCOP(moto.soat || 0)} />
                      <DataRow label="Matrícula" value={fmtCOP(moto.matricula || 0)} />
                      <DataRow label="Impuestos" value={fmtCOP(moto.impuestos || 0)} />
                      <DataRow
                        label="TOTAL documentos"
                        value={fmtCOP(totalDocumentos)}
                        strong
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                      Adicionales y accesorios
                    </div>

                    <DataRow
                      label="Accesorios / Marcación / Personalización"
                      value={fmtCOP(moto.accesoriosYMarcacion)}
                    />

                    {(moto.adicionalesTotal ?? 0) > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <DataRow2 label="RUNT" value={fmtCOP(moto.adicionalesRunt || 0)} />
                        <DataRow2
                          label="Licencias"
                          value={fmtCOP(moto.adicionalesLicencia || 0)}
                        />
                        <DataRow2
                          label="Defensas"
                          value={fmtCOP(moto.adicionalesDefensas || 0)}
                        />
                        <DataRow2
                          label="Hand savers"
                          value={fmtCOP(moto.adicionalesHandSavers || 0)}
                        />
                        <DataRow2
                          label="Otros adicionales"
                          value={fmtCOP(moto.adicionalesOtros || 0)}
                        />
                        <DataRow2
                          label="TOTAL adicionales"
                          value={fmtCOP(moto.adicionalesTotal || 0)}
                          strong
                        />
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                      <DataRow
                        label="Subtotal extras (docs + accesorios + adicionales)"
                        value={fmtCOP(subtotalExtras)}
                        strong
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-base-300/60 p-3 bg-base-100 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Resumen</h3>

                    <div className="space-y-1.5 mt-1">
                      <DataRowText label="Garantía" value={moto.garantia ? 'Sí' : 'No'} />

                      {showGarantiaExtendida && (
                        <DataRowText
                          label="Garantía extendida"
                          value={
                            typeof moto.garantiaExtendidaMeses === 'number' &&
                              (moto.garantiaExtendidaMeses ?? 0) > 0
                              ? `${moto.garantiaExtendidaMeses} meses`
                              : 'No aplica'
                          }
                        />
                      )}

                      <div className="mt-2 pt-2 border-t border-dashed border-base-300/80 space-y-1.5">
                        <DataRow
                          label="Total sin documentos / adicionales / accesorios / seguros"
                          value={fmtCOP(totalSinExtras)}
                        />

                        <DataRow
                          label="Total con documentos / adicionales / accesorios /  seguros"
                          value={fmtCOP(totalConTodo)}
                          strong
                        />

                        <DataRow
                          label="Otros seguros"
                          value={fmtCOP(moto.otrosSeguros || 0)}
                        />

                        {(Number(moto.polizaValor ?? 0) > 0 ||
                          (moto.polizaCodigo && moto.polizaCodigo !== '0')) && (
                            <>
                              <DataRowText
                                label={polizaLabel}
                                value={moto.polizaCodigo || '—'}
                              />
                              <DataRow
                                label={`Valor ${polizaLabel.toLowerCase()}`}
                                value={fmtCOP(Number(moto.polizaValor ?? 0))}
                              />
                            </>
                          )}

                        {(cuotas?.inicial ?? 0) > 0 && (
                          <DataRow
                            label="Cuota inicial"
                            value={fmtCOP(cuotas.inicial)}
                            valueClass="text-error font-semibold"
                          />
                        )}

                        <DataRow
                          label="Saldo a financiar"
                          value={fmtCOP(saldoConTodo)}
                          strong
                          valueClass="text-black font-bold"
                        />

                        <DataRowText
                          label={isContado ? 'GPS' : 'GPS (meses)'}
                          value={getGpsTexto(moto, isContado)}
                        />

                        <DataRow
                          label="Valor GPS"
                          value={fmtCOP(getGpsValorAplicado(moto))}
                        />

                        {showGarantiaExtendida && (
                          <DataRow
                            label="Valor garantía extendida"
                            value={fmtCOP(Number(moto.garantiaExtendidaValor ?? 0))}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-base-300/60 bg-base-100 p-3 flex items-center justify-center">
                    <MotoImage
                      src={getFotoUrl(payload, tab)}
                      alt={`Moto ${tab} – ${moto?.modelo || ''}`}
                      thumbClassName="w-40 h-28 md:w-64 md:h-40"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm opacity-70">
                No hay información de la {tab === 'A' ? 'Moto A' : 'Moto B'}.
              </div>
            )}
          </div>
        </section>

        {showGarantiaExtendida && (
          <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
            <div className="card-body">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5" />
                  <h2 className="card-title text-lg">Garantía extendida</h2>
                  {geLoading && <span className="loading loading-spinner loading-xs" />}
                </div>

                {q.motoB && (
                  <div role="tablist" className="tabs tabs-boxed">
                    <button
                      role="tab"
                      className={`tab rounded-lg px-4 py-2 ${tab === 'A'
                        ? 'tab-active bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      onClick={() => setTab('A')}
                    >
                      Moto A
                    </button>
                    <button
                      role="tab"
                      className={`tab rounded-lg px-4 py-2 ml-2 ${tab === 'B'
                        ? 'tab-active bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      onClick={() => setTab('B')}
                    >
                      Moto B
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="badge badge-ghost">{garantiaExtendidaTabData.label}</div>

                  <DataRowText
                    label="Meses"
                    value={
                      typeof garantiaExtendidaTabData.meses === 'number' &&
                        garantiaExtendidaTabData.meses > 0
                        ? `${garantiaExtendidaTabData.meses} meses`
                        : 'No aplica'
                    }
                  />

                  <DataRow
                    label="Valor garantía extendida"
                    value={
                      typeof garantiaExtendidaTabData.meses === 'number' &&
                        garantiaExtendidaTabData.meses > 0
                        ? fmtCOP(Number(garantiaExtendidaTabData.valor ?? 0))
                        : '—'
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {moto && hasCuotas && (isCreditoPropio || isCreditoTerceros) && (
          <section className="card flex bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5" />
                <h2 className="card-title text-lg">Cuotas {q.motoB ? `(${tab})` : ''}</h2>
              </div>

              <>
                <div className="grid-cols-1 hidden md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {typeof cuotas.inicial === 'number' && cuotas.inicial > 0 && (
                    <StatTile
                      label="Cuota inicial"
                      value={fmtCOP(cuotas.inicial)}
                      badge="Inicial"
                    />
                  )}
                  {renderCuotaTile('6 cuotas', cuotas.meses6)}
                  {renderCuotaTile('12 cuotas', cuotas.meses12)}
                  {renderCuotaTile('18 cuotas', cuotas.meses18)}
                  {renderCuotaTile('24 cuotas', cuotas.meses24)}
                  {renderCuotaTile('30 cuotas', cuotas.meses30)}
                  {renderCuotaTile('36 cuotas', cuotas.meses36)}
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Plazo</th>
                        <th className="text-right">Valor cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderCuotaRow('6 cuotas', cuotas.meses6)}
                      {renderCuotaRow('12 cuotas', cuotas.meses12)}
                      {renderCuotaRow('18 cuotas', cuotas.meses18)}
                      {renderCuotaRow('24 cuotas', cuotas.meses24)}
                      {renderCuotaRow('30 cuotas', cuotas.meses30)}
                      {renderCuotaRow('36 cuotas', cuotas.meses36)}
                    </tbody>
                  </table>
                </div>
              </>
            </div>
          </section>
        )}

        <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5" />
              <h2 className="card-title text-lg">Actividad reciente</h2>
            </div>

            <ol className="relative border-s border-base-300">
              {loadingAct && (
                <li className="ms-6 my-4 text-sm opacity-70">Cargando actividad…</li>
              )}

              {!loadingAct && actividadItems.length === 0 && (
                <li className="ms-6 my-4 text-sm opacity-70">Sin actividad registrada.</li>
              )}

              {!loadingAct &&
                actividadItems.map((ev, i) => (
                  <li key={i} className="ms-6 mb-5">
                    <span className="absolute -start-2 mt-1 w-3 h-3 rounded-full bg-base-300" />
                    <div className="flex flex-wrap items-center gap-2 text-sm opacity-70">
                      <span>{ev.fecha}</span>
                      {ev.etiqueta && (
                        <span className={`badge badge-${ev.color || 'ghost'} badge-sm`}>
                          {ev.etiqueta}
                        </span>
                      )}
                    </div>
                    <div className="font-medium mt-1">{ev.titulo}</div>
                  </li>
                ))}
            </ol>
          </div>
        </section>
      </div>

      {isFacturado && (
        <>
          <VehiculoCamposCollapse
            idCotizacion={id}
            tipo={tipoVehiculo}
            titulo={tipoVehiculo === 1 ? 'Datos vehículo (Crédito)' : 'Datos vehículo (Facturación)'}
          />

          <div className="mt-4">
            <DocumentosFacturacionCards
              title="Documentos de facturación"
              docs={documentosFacturacionCombinados}
            />
          </div>
        </>
      )}

      <section className="sticky bottom-0 mt-4 bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-end gap-2">
          {facturaUrl && (
            <button
              type="button"
              className="btn btn-info btn-sm"
              onClick={() => window.open(facturaUrl, '_blank', 'noopener,noreferrer')}
              title="Ver factura"
            >
              <FileDown className="w-4 h-4" />
              Ver factura
            </button>
          )}

          {payload && (
            <PDFDownloadLink
              document={
                <CotizacionDetalladaPDFDoc
                  cotizacion={{ success: true, data: payload }}
                  garantiaExt={ge ? { success: true, data: ge } : undefined}
                  logoUrl={logoUrl}
                  empresa={empresaPDF}
                />
              }
              fileName={`Cotizacion_detallada_${q?.id || id}.pdf`}
            >
              {({ loading }) => (
                <button
                  className="btn btn-success btn-sm"
                  type="button"
                  disabled={loading || loadingEmpresa}
                  title="Descargar PDF cotización"
                >
                  <FileDown className="w-4 h-4" />
                  {loading ? 'Generando PDF…' : 'PDF Cotización'}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </section>

      <section className="sticky bottom-0 mt-4 bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-end gap-2">
          {puedeCambiarEstado && (
            <Link to={`/cotizaciones/estado/${id}`}>
              <button className="btn btn-warning btn-sm" title="Cambiar estado de la cotización">
                <Edit className="w-4 h-4" />
                Cambiar estado
              </button>
            </Link>
          )}

          <button
            disabled
            className="btn btn-success btn-sm"
            onClick={() => console.log('Crear recordatorio', q?.id)}
            title="Crear recordatorio"
          >
            <CalendarPlus className="w-4 h-4" />
            Crear recordatorio
          </button>

          {puedeGestionAdmin && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleEnviarCorreo}
              disabled={!q.cliente.email}
              title="Enviar por correo"
            >
              <MailIcon className="w-4 h-4" />
              Enviar por correo
            </button>
          )}

          {puedeGestionAdmin && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleDescargarRunt}
              title="Descargar RUNT"
            >
              <FileDown className="w-4 h-4" />
              Descargar RUNT
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default DetalleCotizacion;