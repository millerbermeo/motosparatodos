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
  X,
} from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuthStore } from '../../store/auth.store';
import { useLoaderStore } from '../../store/loader.store';
import { useGarantiaExtByCotizacionId } from '../../services/garantiaExtServices';
import { CotizacionDetalladaPDFDoc } from './CotizacionDetalladaPDFDoc';

const BaseUrl = import.meta.env.VITE_API_URL ?? "http://tuclick.vozipcolombia.net.co/motos/back";

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
  seguros: number;                 // TOTAL seguros (ya viene sumado, aunque no lo mostramos)
  garantia: boolean;               // si/no
  garantiaExtendidaMeses?: number; // meses de garantía extendida
  totalSinSeguros: number;         // backend o calculado (con docs + adicionales, pero sin seguros)
  total: number;
  cuotas: Cuotas;
  lado: 'A' | 'B';

  soat?: number;
  matricula?: number;
  impuestos?: number;

  // Adicionales
  adicionalesRunt?: number;
  adicionalesLicencia?: number;
  adicionalesDefensas?: number;
  adicionalesHandSavers?: number;
  adicionalesOtros?: number;
  adicionalesTotal?: number;

  // Saldo a financiar
  saldoFinanciar: number;
  // 👇 NUEVO
  otrosSeguros?: number;
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

type MotoImageProps = {
  src?: string;
  alt?: string;
  thumbClassName?: string;
};

const MotoImage: React.FC<MotoImageProps> = ({
  src,
  alt = "Imagen de la moto",
  thumbClassName = "w-24 h-24",
}) => {
  const [error, setError] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const uid = React.useId();

  const showPlaceholder = !src || error;

  const openModal = () => {
    if (!showPlaceholder) {
      dialogRef.current?.showModal();
    }
  };

  const closeModal = () => dialogRef.current?.close();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Thumb / disparador */}
      <button
        type="button"
        onClick={openModal}
        className={`hover:opacity-90 transition ${showPlaceholder ? "cursor-not-allowed" : "cursor-zoom-in"}`}
        aria-haspopup="dialog"
        aria-controls={`moto-modal-${uid}`}
        aria-disabled={showPlaceholder}
        title={showPlaceholder ? "Sin imagen" : "Ver imagen"}
      >
        <div className="rounded-xl border border-base-300/60 overflow-hidden bg-base-200 flex items-center justify-center p-2">
          {showPlaceholder ? (
            <div className="text-center p-4">
              <Bike className="w-10 h-10 opacity-40 mx-auto mb-2" />
              <p className="text-xs opacity-60">Aquí va la imagen de la moto</p>
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              className={`${thumbClassName} object-contain size-44`}
              onError={() => setError(true)}
              loading="lazy"
            />
          )}
        </div>
      </button>

      {/* Modal daisyUI */}
      <dialog ref={dialogRef} id={`moto-modal-${uid}`} className="modal">
        <div className="modal-box max-w-4xl p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
            <h3 className="font-semibold text-base">{alt}</h3>
            <button onClick={closeModal} className="btn btn-ghost btn-sm" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-0">
            {!showPlaceholder && (
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-[75vh] object-contain bg-base-200"
                onError={() => setError(true)}
              />
            )}
            {showPlaceholder && (
              <div className="w-full h-[60vh] bg-base-200 flex flex-col items-center justify-center">
                <Bike className="w-16 h-16 opacity-40 mb-3" />
                <p className="opacity-70">No hay imagen disponible</p>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
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

// Convierte una ruta relativa (p.e. "img_motos/...jpg") en URL absoluta contra BaseUrl
const buildImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const root = (BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

// Obtiene la foto según el tab actual 'A' | 'B' (busca foto_a / foto_b en el payload)
const getFotoUrl = (payload: any, lado: 'A' | 'B'): string | undefined => {
  const key = `foto_${lado.toLowerCase()}`; // "foto_a" | "foto_b"
  return buildImageUrl(payload?.[key]);
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

  // Descuentos
  const descuentos = Number(data?.[`descuentos${suffix}`]) || 0;

  // Accesorios + marcación
  const accesorios = Number(data?.[`accesorios${suffix}`]) || 0;
  const marcacion = Number(data?.[`marcacion${suffix}`]) || 0;
  const accesoriosYMarcacion = accesorios + marcacion;
  const otrosSeguros = Number(data?.[`otro_seguro${suffix}`]) || 0;

  // Seguros (aunque ya no los mostramos)
  const seguros = otrosSeguros;


  const soat = Number(data?.[`soat${suffix}`]) || 0;
  const matricula = Number(data?.[`matricula${suffix}`]) || 0;
  const impuestos = Number(data?.[`impuestos${suffix}`]) || 0;

  // Adicionales (RUNT, licencias, defensas, etc.) vienen como _1 o _2
  const isA = lado === 'A';

  const adicionalesRunt = Number(data?.[isA ? 'runt_1' : 'runt_2']) || 0;
  const adicionalesLicencia = Number(data?.[isA ? 'licencia_1' : 'licencia_2']) || 0;
  const adicionalesDefensas = Number(data?.[isA ? 'defensas_1' : 'defensas_2']) || 0;
  const adicionalesHandSavers = Number(data?.[isA ? 'hand_savers_1' : 'hand_savers_2']) || 0;
  const adicionalesOtros = Number(data?.[isA ? 'otros_adicionales_1' : 'otros_adicionales_2']) || 0;

  const adicionalesTotal =
    Number(data?.[isA ? 'total_adicionales_1' : 'total_adicionales_2']) ||
    (adicionalesRunt +
      adicionalesLicencia +
      adicionalesDefensas +
      adicionalesHandSavers +
      adicionalesOtros);

  // Garantía si/no
  const garantiaStr = String(data?.[`garantia${suffix}`] ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const garantia = garantiaStr === 'si' || garantiaStr === 'sí' || garantiaStr === 'true' || garantiaStr === '1';

  // Garantía extendida (meses)
  const geRaw = data?.[`garantia_extendida${suffix}`];
  const garantiaExtendidaMeses = (() => {
    const num = Number(geRaw);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  })();

  const totalSinSeguros =
    Number(data?.[`total_sin_seguros${suffix}`]) ||
    (precioBase +
      precioDocumentos +
      accesoriosYMarcacion +
      adicionalesTotal -
      descuentos);

  const total =
    Number(data?.[`precio_total${suffix}`]) ||
    (totalSinSeguros + seguros);

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

  // SALDO A FINANCIAR: siempre total - cuota inicial
  const saldoFinanciar = Math.max(total - (cuotas.inicial || 0), 0);

  return {
    modelo: modeloLabel,
    precioBase,
    precioDocumentos,
    descuentos,
    accesoriosYMarcacion,
    seguros,
    garantia,
    garantiaExtendidaMeses,
    totalSinSeguros,
    total,
    cuotas,
    lado,
    soat,
    matricula,
    impuestos,
    adicionalesRunt,
    adicionalesLicencia,
    adicionalesDefensas,
    adicionalesHandSavers,
    adicionalesOtros,
    adicionalesTotal,
    saldoFinanciar,
    otrosSeguros,
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
    {
      fecha: fmtFecha(data?.fecha_actualizacion),
      titulo: 'Actualización de cotización',
      etiqueta: data?.estado || 'Sin estado',
      color: 'info',
    },
    {
      fecha: fmtFecha(data?.fecha_creacion),
      titulo: 'Se crea la cotización',
      etiqueta: data?.estado || 'Sin estado',
      color: 'warning',
    },
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

  // Garantía extendida por cotizacion_id (toma prioridad sobre lo que venga en la cotización)
  const { data: geResp, isLoading: geLoading } = useGarantiaExtByCotizacionId(id);
  const ge = geResp?.data; // { meses_a, valor_a, meses_b, valor_b, ... }

  type ActividadItem = { fecha: string; titulo: string; etiqueta?: string; color?: string };

  const mapActividad = (rows: any[] = []): ActividadItem[] =>
    rows.map((r) => ({
      fecha: fmtFecha(r?.fecha_creacion),
      titulo: r?.comentario || '—',
      etiqueta: r?.rol_usuario ? `${r.nombre_usuario} · ${r.rol_usuario}` : r?.nombre_usuario,
      color: 'info',
    }));

  const actividadItems = React.useMemo(() => mapActividad(actividades), [actividades]);

  // Estado de tab (A/B)
  const [tab, setTab] = React.useState<'A' | 'B'>('A');
  React.useEffect(() => {
    if (q?.motoB) setTab('A');
  }, [q?.motoB]);

  const moto = tab === 'A' ? q?.motoA : q?.motoB;

  // Determinar si la moto seleccionada tiene cuotas
  const hasCuotas = React.useMemo(() => {
    if (!moto) return false;
    const c = moto.cuotas || ({} as Cuotas);
    return (
      (c.inicial ?? 0) > 0 ||
      typeof c.meses6 === 'number' ||
      typeof c.meses12 === 'number' ||
      typeof c.meses18 === 'number' ||
      typeof c.meses24 === 'number' ||
      typeof c.meses30 === 'number' ||
      typeof c.meses36 === 'number'
    );
  }, [moto]);

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
      {/* Header */}
      <div className="pt-4 mb-3">
        <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" direction="back" />
      </div>

      <section className="w-full mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-info p-6">
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
                label="Primer Comentario"
                value={[
                  q.cliente.comentario || '',
                  q.cliente.comentario2 || ''
                ]}
                full
              />
            </div>

            {/* Datos comerciales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 mt-2">
              <InfoPill icon={<UserCircle2 className="w-4 h-4" />} label="Asesor" value={q.comercial?.asesor || '—'} />
              <InfoPill icon={<Fingerprint className="w-4 h-4" />} label="Tipo de pago" value={q.comercial?.tipo_pago || '—'} />
              <InfoPill icon={<MessageSquareQuote className="w-4 h-4" />} label="Canal de contacto" value={q.comercial?.canal_contacto || '—'} />
              <InfoPill icon={<BadgeCheck className="w-4 h-4" />} label="Prospecto" value={q.comercial?.prospecto || '—'} />
              <InfoPill icon={<MessageSquareQuote className="w-4 h-4" />} label="Pregunta" value={q.comercial?.pregunta || '—'} />
              <InfoPill icon={<Building2 className="w-4 h-4" />} label="Financiera" value={q.comercial?.financiera || 'No aplica'} />
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
              <div className="mb-3 flex gap-5 items-center">
                <span className="badge badge-ghost">{moto.modelo}</span>
              </div>
            )}

            {/* Detalle precios AGRUPADO en 2 columnas + TOTALES */}
            {moto ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Columna izquierda: Vehículo + Documentos + Adicionales/Accesorios */}
                <div className="space-y-3 rounded-xl border border-base-300/60 p-3 bg-base-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">
                    Vehículo
                  </h3>

                  <DataRow
                    label="Precio base"
                    value={fmtCOP(moto.precioBase)}
                  />
                  <DataRow
                    label="Descuentos"
                    value={fmtCOP(moto.descuentos)}
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
                      <DataRow
                        label="SOAT"
                        value={fmtCOP(moto.soat || 0)}
                      />
                      <DataRow
                        label="Matrícula"
                        value={fmtCOP(moto.matricula || 0)}
                      />
                      <DataRow
                        label="Impuestos"
                        value={fmtCOP(moto.impuestos || 0)}
                      />
                      <DataRow
                        label="TOTAL documentos"
                        value={fmtCOP(
                          (moto.soat || 0) +
                          (moto.matricula || 0) +
                          (moto.impuestos || 0)
                        )}
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
                        <DataRow2
                          label="RUNT"
                          value={fmtCOP(moto.adicionalesRunt || 0)}
                        />
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
                        value={fmtCOP(
                          (moto.precioDocumentos || 0) +
                          (moto.accesoriosYMarcacion || 0) +
                          (moto.adicionalesTotal || 0)
                        )}
                        strong
                      />
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Resumen + Imagen */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-base-300/60 p-3 bg-base-100 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">
                      Resumen
                    </h3>

                    <div className="space-y-1.5 mt-1">
                      <DataRowText
                        label="Garantía"
                        value={moto.garantia ? 'Sí' : 'No'}
                      />

                      <DataRowText
                        label="Garantía extendida"
                        value={
                          typeof moto.garantiaExtendidaMeses === 'number'
                            ? `${moto.garantiaExtendidaMeses} meses`
                            : 'No aplica'
                        }
                      />

                      {/* Totales sin/ con documentos y adicionales */}
                      <div className="mt-2 pt-2 border-t border-dashed border-base-300/80 space-y-1.5">
                        <DataRow
                          label="Total sin documentos / adicionales / accesorios / seguros"
                          value={fmtCOP(
                            (moto.precioBase || 0) -
                            (moto.descuentos || 0) +
                            (moto.accesoriosYMarcacion || 0)
                          )}
                        />

                        <DataRow
                          label="Total con documentos / adicionales / accesorios /  seguros"
                          value={fmtCOP(moto.totalSinSeguros + (moto.seguros || 0))}
                          strong
                        />

                        {/* 👇 NUEVO: mostrar otros seguros */}
                        <DataRow
                          label="Otros seguros"
                          value={fmtCOP(moto.otrosSeguros || 0)}
                        />

                        {/* Solo mostrar si aplica */}
                        {moto.cuotas.inicial > 0 && (
                          <DataRow
                            label="Cuota inicial"
                            value={fmtCOP(moto.cuotas.inicial)}

                            valueClass="text-error font-semibold"
                          />
                        )}

                        <DataRow
                          label="Saldo a financiar"
                          value={fmtCOP(moto.saldoFinanciar)}
                          strong
                          valueClass="text-success font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-base-300/60 bg-base-100 p-3 flex items-center justify-center">
                    <MotoImage
                      src={getFotoUrl(payload, tab)}
                      alt={`Moto ${tab} – ${moto?.modelo || ""}`}
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

        {/* ======================= Garantía extendida (toggle A/B) ======================= */}
        <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5" />
                <h2 className="card-title text-lg">Garantía extendida</h2>
                {geLoading && <span className="loading loading-spinner loading-xs" />}
              </div>

              {/* Toggle A/B reutilizando el mismo estado `tab` */}
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

            {/* Contenido según tab */}
            {(() => {
              const isA = tab === 'A';
              const meses = isA
                ? (ge?.meses_a ?? (q?.motoA?.garantiaExtendidaMeses ?? null))
                : (ge?.meses_b ?? (q?.motoB?.garantiaExtendidaMeses ?? null));

              const valor = isA ? ge?.valor_a : ge?.valor_b;

              // const plan = isA
              //   ? (ge?.garantia_extendida_a ??
              //     (typeof q?.motoA?.garantiaExtendidaMeses === 'number'
              //       ? `${q?.motoA?.garantiaExtendidaMeses}m` : '—'))
              //   : (ge?.garantia_extendida_b ??
              //     (typeof q?.motoB?.garantiaExtendidaMeses === 'number'
              //       ? `${q?.motoB?.garantiaExtendidaMeses}m` : '—'));

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="badge badge-ghost">{isA ? 'Moto A' : 'Moto B'}</div>

                    <DataRowText
                      label="Meses"
                      value={typeof meses === 'number' && meses > 0 ? `${meses} meses` : 'No aplica'}
                    />

                    <DataRow
                      label="Valor garantía extendida"
                      value={
                        typeof valor === 'number'
                          ? fmtCOP(valor)
                          : (typeof meses === 'number' && meses > 0 ? fmtCOP(0) : '—')
                      }
                    />

                    {/* <DataRowText
                      label="Plan"
                      value={plan || '—'}
                    /> */}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Cuotas – solo de la moto seleccionada en el tab (oculto, pero lo dejo armado) */}
        {moto && hasCuotas && (
          <section className="card hidden bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5" />
                <h2 className="card-title text-lg">
                  Cuotas {q.motoB ? `(${tab})` : ''}
                </h2>
              </div>

              <>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {typeof moto.cuotas.inicial === 'number' && moto.cuotas.inicial > 0 && (
                    <StatTile
                      label="Cuota inicial"
                      value={fmtCOP(moto.cuotas.inicial)}
                      badge="Inicial"
                    />
                  )}
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
            </div>
          </section>
        )}

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

      {/* Barra de acciones (inferior) – PDF detallado */}
      <section className="sticky bottom-0 mt-4 bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-end gap-2">
          {payload && (
            <PDFDownloadLink
              document={
                <CotizacionDetalladaPDFDoc
                  cotizacion={{ success: true, data: payload }}
                  garantiaExt={
                    ge
                      ? { success: true, data: ge }
                      : undefined
                  }
                  logoUrl="/moto3.png"
                  empresa={{
                    nombre: "Feria de la Movilidad",
                    ciudad: "Cali",
                    almacen: "Feria de la Movilidad",
                    nit: "123.456.789-0",
                    telefono: "300 000 0000",
                    direccion: "Dirección ejemplo 123",
                  }}
                />
              }
              fileName={`Cotizacion_detallada_${q?.id || id}.pdf`}
            >
              {({ loading }) => (
                <button
                  className="btn btn-success btn-sm"
                  type="button"
                  disabled={loading}
                  title="Descargar PDF cotización"
                >
                  <FileDown className="w-4 h-4" />
                  {loading ? "Generando PDF…" : "PDF Cotización"}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </section>

      {/* Barra de acciones (inferior) – botones de gestión */}
      <section className="sticky bottom-0 mt-4 bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-end gap-2">
          {useAuthStore.getState().user?.rol === "Asesor" &&
            q.estado !== 'Sin interés' &&
            q.estado !== 'Solicitar facturación' &&
            q.estado !== 'Facturado' &&
            q.estado !== 'Solicitar crédito' &&
            q.estado !== 'Solicitar crédito express' && (
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

          {useAuthStore.getState().user?.rol === "Administrador" && (
            <>
              <button
                className="btn btn-success.btn-sm"
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

const DataRow2: React.FC<{ label: string; value: React.ReactNode; strong?: boolean; valueClass?: string }> = ({
  label,
  value,
  strong,
  valueClass,
}) => (
  <div className="flex items-center justify-between bg-success/70 text-white px-3 py-2 rounded-md">
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
