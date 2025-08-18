// src/pages/DetalleCotizacion.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCotizacionById } from '../../services/cotizacionesServices'; // ajusta ruta si cambia

/* =======================
   Tipos (igual que los tuyos)
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
  modelo: string;
  precioBase: number;
  precioDocumentos: number;
  descuentos: number;
  accesorios: number;
  seguros: number;
  garantiaExtendida: number;
  total: number;
  cuotas: Cuotas;
};

type Evento = {
  fecha: string;
  titulo: string;
  etiqueta?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
};

type Cotizacion = {
  id: string;
  estado: 'abierta' | 'aprobada' | 'rechazada' | 'borrador';
  creada: string;
  cliente: {
    nombres: string;
    apellidos?: string;
    email?: string;
    telefono?: string;
    comentario?: string;
  };
  moto: Motocicleta;
  actividad: Evento[];
};

/* =======================
   Ejemplo estático (fallback)
   ======================= */
const demo: Cotizacion = {
  id: 'COT-2025-00123',
  estado: 'abierta',
  creada: 'agosto 14 2025, 1:01 pm',
  cliente: {
    nombres: 'Germán',
    apellidos: 'Muñoz',
    email: '',
    telefono: '3115380028',
    comentario: 'Venta prueba',
  },
  moto: {
    modelo: 'SUZUKI GN 125 EURO 3 2024',
    precioBase: 6_280_000,
    precioDocumentos: 770_001,
    descuentos: 0,
    accesorios: 0,
    seguros: 0,
    garantiaExtendida: 816_400,
    total: 7_050_001,
    cuotas: {
      inicial: 0,
      meses6: 1_225_000,
      meses12: 670_000,
      meses18: 523_000,
      meses24: 435_000,
      meses30: 386_000,
      meses36: 354_000,
    },
  },
  actividad: [
    { fecha: 'agosto 14 2025, 1:06 pm', titulo: 'Se inicia la solicitud de crédito', etiqueta: 'solicitud de crédito', color: 'success' },
    { fecha: 'agosto 14 2025, 1:01 pm', titulo: 'Primer recordatorio', etiqueta: 'sin estado', color: 'warning' },
    { fecha: 'agosto 14 2025, 1:01 pm', titulo: 'Se crea la cotización', etiqueta: 'sin estado', color: 'warning' },
  ],
};

/* =======================
   Helpers
   ======================= */
const fmt = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const badgeEstado = (estado: Cotizacion['estado']) => {
  const map: Record<Cotizacion['estado'], string> = {
    abierta: 'badge-info',
    aprobada: 'badge-success',
    rechazada: 'badge-error',
    borrador: 'badge-ghost',
  };
  return map[estado];
};

const waUrl = (tel?: string, msg?: string) =>
  tel ? `https://wa.me/57${tel.replace(/\D/g, '')}?text=${encodeURIComponent(msg || 'Hola, sobre tu cotización…')}` : '#';

const renderCuotaTile = (label: string, valor?: number) =>
  typeof valor === 'number' ? <StatTile key={label} label={label} value={fmt(valor)} /> : null;

// Formatea fecha "YYYY-MM-DD HH:mm:ss" -> "agosto 18 2025, 8:27 pm"
const fmtFecha = (isoLike?: string) => {
  if (!isoLike) return '';
  const parts = isoLike.replace(' ', 'T'); // "2025-08-18T20:27:17"
  const d = new Date(parts);
  return d.toLocaleString('es-CO', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Mapea el JSON del backend -> Cotizacion (lado A por defecto)
const mapApiToCotizacion = (data: any): Cotizacion => {
  const nombres = [data.name, data.s_name].filter(Boolean).join(' ').trim() || '—';
  const apellidos = [data.last_name, data.s_last_name].filter(Boolean).join(' ').trim() || undefined;
  const email = data.email && data.email !== '0' ? String(data.email) : undefined;
  const comentario = data.comentario && data.comentario !== '0' ? String(data.comentario) : undefined;

  const modelo = [data.marca_a, data.linea_a].filter(Boolean).join(' ');
  const precioBase = Number(data.precio_base_a) || 0;
  const precioDocumentos = Number(data.precio_documentos_a) || 0;
  const total = Number(data.precio_total_a) || precioBase + precioDocumentos;

  // Si accesorios/seguros llegan como 0/1, aquí no hay valores $, así que los dejamos en 0 monetario
  const accesorios = 0;
  const seguros = 0;
  const garantiaExtendida = 0; // "3 años" no es valor monetario

  const cuotas: Cuotas = {
    inicial: Number(data.cuota_inicial_a) || 0,
    meses6: Number(data.cuota_6_a) || undefined,
    meses12: Number(data.cuota_12_a) || undefined,
    meses18: Number(data.cuota_18_a) || undefined,
    meses24: Number(data.cuota_24_a) || undefined,
    meses30: Number(data.cuota_30_a) || undefined,
    meses36: Number(data.cuota_36_a) || undefined,
  };

  const estadoBackend = (data.estado || '').toString().toLowerCase();
  const estado: Cotizacion['estado'] =
    estadoBackend.includes('aprob') ? 'aprobada'
    : estadoBackend.includes('rechaz') ? 'rechazada'
    : estadoBackend.includes('borr') ? 'borrador'
    : 'abierta';

  const creadaFmt = fmtFecha(data.fecha_creacion);

  const actividad: Evento[] = [
    { fecha: fmtFecha(data.fecha_actualizacion), titulo: 'Actualización de cotización', etiqueta: data.estado || 'sin estado', color: 'info' },
    { fecha: fmtFecha(data.fecha_creacion), titulo: 'Se crea la cotización', etiqueta: data.estado || 'sin estado', color: 'warning' },
  ];

  return {
    id: String(data.id ?? ''),
    estado,
    creada: creadaFmt,
    cliente: { nombres, apellidos, email, telefono: undefined, comentario },
    moto: {
      modelo: modelo || '—',
      precioBase,
      precioDocumentos,
      descuentos: 0,
      accesorios,
      seguros,
      garantiaExtendida,
      total,
      cuotas,
    },
    actividad,
  };
};

/* =======================
   Componente principal
   ======================= */
const DetalleCotizacion: React.FC = () => {
  // 1) tomar id de la URL: /cotizaciones/:id
  const { id } = useParams<{ id: string }>();

  // 2) pedir al backend usando tu hook
  const { data, isLoading, error } = useCotizacionById(id);

  // 3) elegir qué mostrar
  const q: Cotizacion = React.useMemo(() => {
    const payload = data?.data; // tu backend: { success, data }
    if (payload) return mapApiToCotizacion(payload);
    return demo; // fallback mientras no hay data
  }, [data]);

  if (!id) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <span>Falta el parámetro <code>id</code> en la URL. Debe ser /cotizaciones/:id</span>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-lg">
          <span>Hubo un problema cargando la cotización #{id}. Mostrando demo.</span>
        </div>
        {/* Aún así renderizamos abajo con demo */}
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-base-100 px-4 md:px-6 py-6">
      {/* Header / título y acciones */}
      <section className="w-full mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Información de la cotización</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className={`badge ${badgeEstado(q.estado)}`}>{q.estado}</span>
              <span className="opacity-70">Creada:</span>
              <span className="font-medium">{q.creada || '—'}</span>
              <span className="opacity-70">| ID:</span>
              <span className="font-mono">{q.id}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a className="btn btn-primary btn-sm" href="#" onClick={(e) => e.preventDefault()}>
              <PdfIcon className="w-4 h-4" /> Descargar PDF
            </a>
            <a className="btn btn-outline btn-sm" href={waUrl(q.cliente.telefono, `Hola ${q.cliente.nombres}, te comparto la cotización ${q.id}`)} target="_blank" rel="noopener noreferrer">
              <WhatsIcon className="w-4 h-4" /> WhatsApp
            </a>
            <a
              className="btn btn-ghost btn-sm"
              href={`mailto:${q.cliente.email || ''}?subject=${encodeURIComponent('Tu cotización')}&body=${encodeURIComponent('Adjuntamos detalle de tu cotización…')}`}
            >
              <MailIcon className="w-4 h-4" /> Email
            </a>
            <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              <CopyIcon className="w-4 h-4" /> Copiar link
            </button>
          </div>
        </div>
      </section>

      {/* Secciones */}
      <div className="flex flex-col gap-6">
        {/* Información del cliente */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5" />
              <h2 className="card-title text-lg">Información del cliente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Nombres" value={q.cliente.nombres} />
              <InfoRow label="Apellidos" value={q.cliente.apellidos || '—'} />
              <InfoRow label="Email" value={q.cliente.email || '—'} />
              <InfoRow label="Teléfono" value={q.cliente.telefono || '—'} />
              <InfoRow label="Comentario" value={q.cliente.comentario || '—'} full />
            </div>
          </div>
        </section>

        {/* Motocicleta */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <BikeIcon className="w-5 h-5" />
                <h2 className="card-title text-lg">Motocicletas</h2>
              </div>
              <span className="badge badge-ghost">{q.moto.modelo}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Col 1 */}
              <div className="space-y-2">
                <DataRow label="Precio base" value={fmt(q.moto.precioBase)} />
                <DataRow label="Descuentos" value={fmt(q.moto.descuentos)} valueClass="text-error font-semibold" />
                <DataRow label="Seguros" value={fmt(q.moto.seguros)} />
                <DataRow label="Garantía extendida" value={fmt(q.moto.garantiaExtendida)} />
              </div>
              {/* Col 2 */}
              <div className="space-y-2">
                <DataRow label="Precio Documentos" value={fmt(q.moto.precioDocumentos)} />
                <DataRow label="Accesorios / Marcadas / Personalizadas" value={fmt(q.moto.accesorios)} />
                <DataRow label="Total" value={fmt(q.moto.total)} strong />
              </div>
            </div>
          </div>
        </section>

        {/* Cuotas */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <CalcIcon className="w-5 h-5" />
              <h2 className="card-title text-lg">Cuotas</h2>
            </div>

            {/* Tiles resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <StatTile label="Cuota inicial" value={fmt(q.moto.cuotas.inicial)} badge="Inicial" />
              {renderCuotaTile('6 cuotas', q.moto.cuotas.meses6)}
              {renderCuotaTile('12 cuotas', q.moto.cuotas.meses12)}
              {renderCuotaTile('18 cuotas', q.moto.cuotas.meses18)}
              {renderCuotaTile('24 cuotas', q.moto.cuotas.meses24)}
              {renderCuotaTile('30 cuotas', q.moto.cuotas.meses30)}
              {renderCuotaTile('36 cuotas', q.moto.cuotas.meses36)}
            </div>

            {/* Tabla compacta de cuotas */}
            <div className="overflow-x-auto mt-4">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Plazo</th>
                    <th className="text-right">Valor cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCuotaRow('6 cuotas', q.moto.cuotas.meses6)}
                  {renderCuotaRow('12 cuotas', q.moto.cuotas.meses12)}
                  {renderCuotaRow('18 cuotas', q.moto.cuotas.meses18)}
                  {renderCuotaRow('24 cuotas', q.moto.cuotas.meses24)}
                  {renderCuotaRow('30 cuotas', q.moto.cuotas.meses30)}
                  {renderCuotaRow('36 cuotas', q.moto.cuotas.meses36)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Actividad reciente */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <ActivityIcon className="w-5 h-5" />
              <h2 className="card-title text-lg">Actividad reciente</h2>
            </div>

            <ol className="relative border-s border-base-300">
              {q.actividad.map((ev, i) => (
                <li key={i} className="ms-6 mb-5">
                  <span className="absolute -start-2 mt-1 w-3 h-3 rounded-full bg-base-300"></span>
                  <div className="flex flex-wrap items-center gap-2 text-sm opacity-70">
                    <span>{ev.fecha}</span>
                    {ev.etiqueta && <span className={`badge badge-${ev.color || 'ghost'} badge-sm`}>{ev.etiqueta}</span>}
                  </div>
                  <div className="font-medium mt-1">{ev.titulo}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
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

const DataRow: React.FC<{ label: string; value: React.ReactNode; strong?: boolean; valueClass?: string }> = ({
  label,
  value,
  strong,
  valueClass,
}) => (
  <div className="flex items-center justify-between bg-base-200 px-3 py-2 rounded-md">
    <span className="font-medium">{label}</span>
    <span className={strong ? 'font-bold' : valueClass || ''}>{value}</span>
  </div>
);

const StatTile: React.FC<{ label: string; value: string; badge?: string }> = ({ label, value, badge }) => (
  <div className="stats shadow-sm bg-base-100 w-full">
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

const renderCuotaRow = (label: string, valor?: number) =>
  typeof valor === 'number' ? (
    <tr key={label}>
      <td>{label}</td>
      <td className="text-right">{fmt(valor)}</td>
    </tr>
  ) : null;

/* =======================
   Íconos (SVG inline)
   ======================= */
const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity=".2" />
    <path d="M14 2v6h6M9 13h6M9 17h6M9 9h3" />
  </svg>
);

const WhatsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .1 5.36.1 11.96c0 2.1.56 4.1 1.63 5.88L0 24l6.29-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.25-6.22-3.51-8.39z" />
    <path d="M17.27 14.2c-.23-.11-1.37-.68-1.58-.76-.21-.08-.36-.11-.52.11-.15.22-.6.75-.73.9-.13.15-.27.17-.5.06-.23-.11-.98-.36-1.86-1.12-.69-.61-1.16-1.36-1.3-1.59-.13-.23-.01-.35.1-.46.11-.11.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.28-.02-.4-.06-.11-.52-1.26-.71-1.72-.18-.43-.37-.37-.52-.38h-.45c-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.11.15 1.6 2.45 3.87 3.33.54.23.96.37 1.29.47.54.17 1.03.15 1.42.09.43-.06 1.37-.56 1.56-1.1.19-.54.19-1 .13-1.1-.06-.11-.21-.17-.44-.28z" />
  </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8.24l7.4 5.55a1 1 0 0 0 1.2 0L20 8.24V18H4Z" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
  </svg>
);

const BikeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M5 17a4 4 0 1 1 3.874-5h2.252l-1.2-3H8a1 1 0 0 1 0-2h3a1 1 0 0 1 .94.66l2.5 6.34H12.5A4 4 0 1 1 5 17Zm14 0a4 4 0 1 0-3.874-5h-1.9l.8 2H19a4 4 0 0 0 0 8 4 4 0 0 0 0-8Z" />
  </svg>
);

const CalcIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm3 4h6v4H9V6zm-2 7h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 3h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
  </svg>
);

const ActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 13h3l3-8 4 14 3-6h5" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
  </svg>
);

export default DetalleCotizacion;
