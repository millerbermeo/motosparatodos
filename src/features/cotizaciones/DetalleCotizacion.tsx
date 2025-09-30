// src/pages/DetalleCotizacion.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCotizacionActividades, useCotizacionById } from '../../services/cotizacionesServices';
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
} from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CotizacionPDFDoc, type QuotePayload } from "./CotizacionPDFDoc";
import { useAuthStore } from '../../store/auth.store';
import { useLoaderStore } from '../../store/loader.store';

/* =======================
   Tipos
   ======================= */
type Cuotas = {
  inicial: number;
  meses6?: number;
  meses12?: number;
  meses18?: number;
  meses24?: number;
  meses30?: number;
  meses36?: number;
};

type Motocicleta = {
  modelo: string;                  // "YAMAHA R7 – 2024"
  precioBase: number;
  precioDocumentos: number;
  descuentos: number;              // descuentos_a / descuentos_b
  accesoriosYMarcacion: number;    // accesorios + marcación
  seguros: number;                 // suma de seguros
  garantia: boolean;               // si/no
  totalSinSeguros: number;         // backend o calculado
  total: number;
  cuotas: Cuotas;
  lado: 'A' | 'B';
};

type Evento = {
  fecha: string;
  titulo: string;
  etiqueta?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
};

type Cotizacion = {
  id: string;
  estado: any;
  creada: string;
  cliente: {
    nombres: string;
    apellidos?: string;
    email?: string;
    celular?: string;
    comentario?: string;
    comentario2?: string;
    cedula?: string;
  };
  comercial?: {
    asesor?: string;
    canal_contacto?: string;
    financiera?: string | null;
    tipo_pago?: string | null;
    prospecto?: string | null;
    pregunta?: string | null;
  };
  motoA?: Motocicleta;
  motoB?: Motocicleta;
  actividad: Evento[];
};

/* =======================
   Helpers
   ======================= */
const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v ?? 0);

const estadoBadgeClass = (estado?: string) => {
  switch (estado) {
    case 'Continúa interesado':
    case 'Alto interés':
      return 'badge-warning';
    case 'Solicitar facturación':
    case 'Solicitar crédito':
      return 'badge-success';
    case 'Solicitar crédito express':
      return 'badge-info';
    case 'Sin interés':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

// "2025-08-19 05:53:12" -> "19 de agosto de 2025, 5:53 a. m."
const fmtFecha = (isoLike?: string) => {
  if (!isoLike) return '';
  const d = new Date(isoLike.replace(' ', 'T'));
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const sanitizePhone = (v: any): string | undefined => {
  const s = String(v ?? "").trim();
  if (!s || s === "0" || s === "-") return undefined;
  const digits = s.replace(/\D+/g, "");
  return digits || undefined;
};

const numOrUndef = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// Suma valores de un JSON de seguros (string o array)
const sumSegurosFromJson = (raw: unknown): number | undefined => {
  try {
    if (Array.isArray(raw)) {
      return raw.reduce((acc, it: any) => acc + (Number(it?.valor) || 0), 0);
    }
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.reduce((acc, it: any) => acc + (Number(it?.valor) || 0), 0);
      }
    }
  } catch {
    // ignora y devuelve undefined
  }
  return undefined;
};

/* =======================
   Mapeo de API -> UI
   ======================= */
const buildMoto = (data: any, lado: 'A' | 'B'): Motocicleta | undefined => {
  const suffix = lado === 'A' ? '_a' : '_b';

  const marca = data?.[`marca${suffix}`];
  const linea = data?.[`linea${suffix}`];

  // Si no hay marca/linea ni precios, no devolvemos la moto
  const hasCore =
    marca || linea || data?.[`precio_base${suffix}`] || data?.[`precio_total${suffix}`];

  if (!hasCore) return undefined;

  const modeloLabel = [marca, linea].filter(Boolean).join(' ').trim() || '—';

  const precioBase = Number(data?.[`precio_base${suffix}`]) || 0;
  const precioDocumentos = Number(data?.[`precio_documentos${suffix}`]) || 0;

  // Descuentos (nuevas columnas)
  const descuentos = Number(data?.[`descuentos${suffix}`]) || 0;

  // Accesorios + marcación
  const accesorios = Number(data?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(data?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;

  // Seguros (prioriza JSON; si no viene, suma por campos)
  const segurosJson = data?.[`seguros${suffix}`];
  const segurosFromJson = sumSegurosFromJson(segurosJson);

  const seguros =
    typeof segurosFromJson === 'number'
      ? segurosFromJson
      : (Number(data?.[`seguro_vida${suffix}`]) || 0) +
        (Number(data?.[`seguro_mascota_s${suffix}`]) || 0) +
        (Number(data?.[`seguro_mascota_a${suffix}`]) || 0) +
        (Number(data?.[`otro_seguro${suffix}`]) || 0);

  // Garantía si/no
  const garantiaStr = String(data?.[`garantia${suffix}`] ?? '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const garantia = garantiaStr === 'si' || garantiaStr === 'sí' || garantiaStr === 'true' || garantiaStr === '1';

  // Totales
  const total = Number(data?.[`precio_total${suffix}`]) ||
    (precioBase + precioDocumentos + accesoriosYMarcacion + seguros - descuentos);

  const totalSinSeguros =
    Number(data?.[`total_sin_seguros${suffix}`]) ||
    (precioBase + precioDocumentos + accesoriosYMarcacion - descuentos);

  // Cuotas
  const cuotas: Cuotas = {
    inicial: Number(data?.[`cuota_inicial${suffix}`]) || 0,
    meses6: numOrUndef(data?.[`cuota_6${suffix}`]),
    meses12: numOrUndef(data?.[`cuota_12${suffix}`]),
    meses18: numOrUndef(data?.[`cuota_18${suffix}`]),
    meses24: numOrUndef(data?.[`cuota_24${suffix}`]),
    meses30: numOrUndef(data?.[`cuota_30${suffix}`]),
    meses36: numOrUndef(data?.[`cuota_36${suffix}`]),
  };

  return {
    modelo: modeloLabel,
    precioBase,
    precioDocumentos,
    descuentos,
    accesoriosYMarcacion,
    seguros,
    garantia,
    totalSinSeguros,
    total,
    cuotas,
    lado,
  };
};

const mapApiToCotizacion = (data: any): Cotizacion => {
  // Cliente
  const nombres = [data?.name, data?.s_name].filter(Boolean).join(' ').trim() || '—';
  const apellidos = [data?.last_name, data?.s_last_name].filter(Boolean).join(' ').trim() || undefined;
  const email = data?.email && data.email !== '0' ? String(data.email) : undefined;
  const celular = sanitizePhone(data?.celular ?? data?.cel ?? data?.telefono ?? data?.phone);
  const comentario = data?.comentario && data.comentario !== '' ? String(data.comentario) : undefined;
  const comentario2 = data?.comentario2 && data.comentario2 !== '' ? String(data.comentario2) : undefined;
  const cedula = data?.cedula || undefined;

  // Comercial
  const comercial = {
    asesor: data?.asesor || undefined,
    canal_contacto: data?.canal_contacto || undefined,
    financiera: data?.financiera ?? null,
    tipo_pago: data?.tipo_pago ?? data?.metodo_pago ?? null,
    prospecto: data?.prospecto ?? null,
    pregunta: data?.pregunta ?? null,
  };

  // Motos
  const motoA = buildMoto(data, 'A');
  const motoB = buildMoto(data, 'B');

  // Estado
  const estadoNombre =
    typeof data?.estado === 'string' && data.estado.trim()
      ? String(data.estado).trim()
      : 'Sin estado';

  const creada = fmtFecha(data?.fecha_creacion);

  const actividad: Evento[] = [
    { fecha: fmtFecha(data?.fecha_actualizacion), titulo: 'Actualización de cotización', etiqueta: data?.estado || 'Sin estado', color: 'info' },
    { fecha: fmtFecha(data?.fecha_creacion), titulo: 'Se crea la cotización', etiqueta: data?.estado || 'Sin estado', color: 'warning' },
  ];

  return {
    id: String(data?.id ?? ''),
    estado: estadoNombre,
    creada,
    cliente: { nombres, apellidos, email, celular, comentario, comentario2, cedula },
    comercial,
    motoA,
    motoB,
    actividad,
  };
};

/* =======================
   Componente
   ======================= */
const DetalleCotizacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCotizacionById(id);

  const payload = (data as any)?.data ?? data;
  const q: Cotizacion | undefined = React.useMemo(
    () => (payload ? mapApiToCotizacion(payload) : undefined),
    [payload]
  );

  const { data: actividades = [], isLoading: loadingAct } = useCotizacionActividades(id);

  type ActividadItem = { fecha: string; titulo: string; etiqueta?: string; color?: string };

  const mapActividad = (rows: any[] = []): ActividadItem[] =>
    rows.map((r) => ({
      fecha: fmtFecha(r?.fecha_creacion),
      titulo: r?.comentario || '—',
      etiqueta: r?.rol_usuario ? `${r.nombre_usuario} · ${r.rol_usuario}` : r?.nombre_usuario,
      color: 'info',
    }));

  const actividadItems = React.useMemo(() => mapActividad(actividades), [actividades]);

  // const pdfPayload: QuotePayload | undefined = React.useMemo(
  //   () => (payload ? { success: true, data: payload } : undefined),
  //   [payload]
  // );

  // const pdfName = React.useMemo(
  //   () => `Cotizacion_${q?.id || id}.pdf`,
  //   [q?.id, id]
  // );

  // Estado de tab (A/B)
  const [tab, setTab] = React.useState<'A' | 'B'>('A');
  React.useEffect(() => {
    if (q?.motoB) setTab('A');
  }, [q?.motoB]);

  const moto = tab === 'A' ? q?.motoA : q?.motoB;

  // Loader global
  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  // Blocs de estados
  if (!id) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <span>Falta el parámetro <code>id</code> en la URL. Debe ser <code>/cotizaciones/:id</code></span>
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
    <main className="w-full min-h-screen px-4 md:px-6 pb-6">
      {/* Header */}
      <div className='pt-4 mb-3'>
        <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" direction="back" />
      </div>

      <section className="w-full mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100  border border-info p-6">
          {/* Título y estado */}
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
        {/* Información del cliente */}
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
                label="Comentarios"
                value={[
                  q.cliente.comentario || '—',
                  q.cliente.comentario2 || '—'
                ].join(' | ')}
                full
              />
            </div>

            {/* Datos comerciales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 mt-2">
              <InfoPill icon={<UserCircle2 className="w-4 h-4" />} label="Asesor" value={q.comercial?.asesor || '—'} />
              <InfoPill icon={<Building2 className="w-4 h-4" />} label="Financiera" value={q.comercial?.financiera || '—'} />
              <InfoPill icon={<Fingerprint className="w-4 h-4" />} label="Tipo de pago" value={q.comercial?.tipo_pago || '—'} />
              <InfoPill icon={<MessageSquareQuote className="w-4 h-4" />} label="Canal de contacto" value={q.comercial?.canal_contacto || '—'} />
              <InfoPill icon={<BadgeCheck className="w-4 h-4" />} label="Prospecto" value={q.comercial?.prospecto || '—'} />
              <InfoPill icon={<MessageSquareQuote className="w-4 h-4" />} label="Pregunta" value={q.comercial?.pregunta || '—'} />
            </div>
          </div>
        </section>

        {/* Motocicletas con tabs A/B si aplica */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5" />
                <h2 className="card-title text-lg">Motocicletas</h2>
              </div>

              {/* Tabs A/B si existe B */}
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

            {/* Cabecera del modelo */}
            {moto && (
              <div className="mb-3">
                <span className="badge badge-ghost">{moto.modelo}</span>
              </div>
            )}

            {/* Detalle precios */}
            {moto ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <DataRow label="Precio base" value={fmtCOP(moto.precioBase)} />
                  <DataRow label="Descuentos" value={fmtCOP(moto.descuentos)} valueClass="text-error font-semibold" />
                  <DataRow label="Seguros" value={fmtCOP(moto.seguros)} />
                  <DataRowText label="Garantía" value={moto.garantia ? 'Sí' : 'No'} />
                </div>
                <div className="space-y-2">
                  <DataRow label="Precio documentos" value={fmtCOP(moto.precioDocumentos)} />
                  <DataRow label="Accesorios / Marcación / Personalización" value={fmtCOP(moto.accesoriosYMarcacion)} />
                  <DataRow label="Total sin seguros" value={fmtCOP(moto.totalSinSeguros)} />
                  <DataRow label="Total" value={fmtCOP(moto.total)} strong />
                </div>
              </div>
            ) : (
              <div className="text-sm opacity-70">No hay información de la {tab === 'A' ? 'Moto A' : 'Moto B'}.</div>
            )}
          </div>
        </section>

        {/* Cuotas (opcional – oculto si no quieres) */}
        <section className="card bg-base-100 border border-base-300/60 hidden shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5" />
              <h2 className="card-title text-lg">Cuotas {q.motoB ? `(${tab})` : ''}</h2>
            </div>

            {moto ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  <StatTile label="Cuota inicial" value={fmtCOP(moto.cuotas.inicial)} badge="Inicial" />
                  {renderCuotaTile('6 cuotas', moto.cuotas.meses6)}
                  {renderCuotaTile('12 cuotas', moto.cuotas.meses12)}
                  {renderCuotaTile('18 cuotas', moto.cuotas.meses18)}
                  {renderCuotaTile('24 cuotas', moto.cuotas.meses24)}
                  {renderCuotaTile('30 cuotas', moto.cuotas.meses30)}
                  {renderCuotaTile('36 cuotas', moto.cuotas.meses36)}
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
                      {renderCuotaRow('6 cuotas', moto.cuotas.meses6)}
                      {renderCuotaRow('12 cuotas', moto.cuotas.meses12)}
                      {renderCuotaRow('18 cuotas', moto.cuotas.meses18)}
                      {renderCuotaRow('24 cuotas', moto.cuotas.meses24)}
                      {renderCuotaRow('30 cuotas', moto.cuotas.meses30)}
                      {renderCuotaRow('36 cuotas', moto.cuotas.meses36)}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-sm opacity-70">No hay cuotas para la {tab === 'A' ? 'Moto A' : 'Moto B'}.</div>
            )}
          </div>
        </section>

        {/* Actividad reciente */}
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

              {!loadingAct && actividadItems.map((ev, i) => (
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

      {/* Barra de acciones (inferior) */}
      <section className="sticky bottom-0 mt-4 bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-end gap-2">
          {useAuthStore.getState().user?.rol === "Asesor" && q.estado !== 'Sin interés' && (
            <Link to={`/cotizaciones/estado/${id}`}>
              <button className="btn btn-warning btn-sm" title="Crear recordatorio">
                <Edit className="w-4 h-4" />
                Cambiar estado
              </button>
            </Link>
          )}

          <button className="btn btn-success btn-sm" onClick={() => console.log('Crear recordatorio', q?.id)} title="Crear recordatorio">
            <CalendarPlus className="w-4 h-4" />
            Crear recordatorio
          </button>

          {useAuthStore.getState().user?.rol === "Administrador" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
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
                  ].filter(Boolean).join('\n');
                  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                disabled={!q.cliente.email}
                title="Enviar por correo"
              >
                <MailIcon className="w-4 h-4" />
                Enviar por correo
              </button>
            </>
          )}

          {(() => {
            const pdfPayload: QuotePayload | undefined = payload ? { success: true, data: payload } : undefined;
            const pdfName = `Cotizacion_${q?.id || id}.pdf`;
            return pdfPayload ? (
              <PDFDownloadLink
                document={
                  <CotizacionPDFDoc
                    payload={pdfPayload}
                    logoUrl="/moto3.png"
                    empresa={{ ciudad: "Cali", almacen: "Feria de la Movilidad" }}
                  />
                }
                fileName={pdfName}
              >
                {({ loading }) => (
                  <button className="btn btn-success btn-sm" type="button" disabled={loading}>
                    <FileDown className="w-4 h-4" />
                    {loading ? "Generando PDF…" : "Descargar Cotización"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : null;
          })()}

          {useAuthStore.getState().user?.rol === "Administrador" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/runt.pdf';
                link.download = 'runt.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
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

/* =======================
   Subcomponentes UI
   ======================= */
const InfoRow: React.FC<{ label: string; value: React.ReactNode; full?: boolean }> = ({ label, value, full }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <div className="text-sm opacity-70">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const InfoPill: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
    <span className="opacity-80">{icon}</span>
    <div>
      <div className="text-xs opacity-60">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

const DataRow: React.FC<{ label: string; value: React.ReactNode; strong?: boolean; valueClass?: string }> = ({
  label,
  value,
  strong,
  valueClass,
}) => (
  <div className="flex items-center justify-between bg-[#3498DB]/70 text-white px-3 py-2 rounded-md">
    <span className="font-medium">{label}</span>
    <span className={strong ? 'font-bold' : valueClass || ''}>{value}</span>
  </div>
);

// Para valores que no son dinero (p. ej., Sí/No)
const DataRowText: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between bg-[#3498DB]/70 text-white px-3 py-2 rounded-md">
    <span className="font-medium">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const StatTile: React.FC<{ label: string; value: string; badge?: string }> = ({ label, value, badge }) => (
  <div className="stats shadow-sm bg-[#F5F5F5] w-full rounded-xl">
    <div className="stat">
      <div className="stat-title">{label}</div>
      <div className="stat-value text-lg">{value}</div>
      {badge && (
        <div className="stat-desc">
          <span className="badge badge-ghost">{badge}</span>
        </div>
      )}
    </div>
  </div>
);

const renderCuotaTile = (label: string, valor?: number) =>
  typeof valor === 'number' ? <StatTile key={label} label={label} value={fmtCOP(valor)} /> : null;

const renderCuotaRow = (label: string, valor?: number) =>
  typeof valor === 'number' ? (
    <tr key={label}>
      <td>{label}</td>
      <td className="text-right">{fmtCOP(valor)}</td>
    </tr>
  ) : null;

export default DetalleCotizacion;
