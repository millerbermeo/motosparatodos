// src/pages/DetalleCambiarEstado.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCotizacionById } from '../../services/cotizacionesServices';
import { api } from '../../services/axiosInstance';
import Swal from 'sweetalert2';
import {
    UserRound,
    CalendarDays,
    Mail,
    Phone,
    BadgeInfo,
    Bike,
} from 'lucide-react';
import ButtonLink from '../../shared/components/ButtonLink';

/* =======================
   Estados (mismo mapping de la tabla)
   ======================= */


/* =======================
   Helpers
   ======================= */
const safeText = (v: any) => {
    if (v === null || v === undefined) return undefined;
    const s = String(v).trim();
    if (!s || s === '0') return undefined;
    return s;
};

const fullName = (r: any) =>
    [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
        .map(safeText)
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim() || '—';

// "YYYY-MM-DD HH:mm:ss" → local es-CO
const fmtFecha = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
};

const fmtCOP = (v: any) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v || 0));

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


// Normaliza strings
// const norm = (v: any) => (safeText(v) || '').toLowerCase();

// ❌ Elimina todo esto
// const esCreditoDirecto = (row: any) => { ... }

// ✅ Agrega esto
// ✅ Reemplaza los helpers de tipo de pago (quita el numérico)
const tipoPagoLabel = (row: any) =>
  (safeText(row?.tipo_pago) || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

const esCreditoDirecto = (row: any) =>
  tipoPagoLabel(row) === 'credito directo';


// ✅ Actualiza las opciones de estados
const opcionesEstados = (row: any): any[] => {
  const soloCreditoEnDirecto = esCreditoDirecto(row); // true solo si "Crédito directo"

  return [
    { value: '', label: 'Seleccione...' },
    { value: '3', label: 'Continúa interesado' },
    { value: '4', label: 'Alto interés' },

    // Solo "Solicitar crédito" cuando es "Crédito directo", en los otros dos "Solicitar facturación"
    soloCreditoEnDirecto
      ? { value: '5', label: 'Solicitar crédito' }
      : { value: '6', label: 'Solicitar facturación' },

    { value: '7', label: 'Solicitar crédito express' }, // lo dejo como estaba (visible siempre)
    { value: '2', label: 'Sin interés' },
  ];
};


/* =======================
   Motos helpers
   ======================= */
const hasMoto = (row: any, side: 'a' | 'b') => {
    return (
        safeText(row?.[`marca_${side}`]) ||
        safeText(row?.[`linea_${side}`]) ||
        Number(row?.[`precio_base_${side}`]) ||
        Number(row?.[`precio_total_${side}`])
    );
};

const modeloMoto = (row: any, side: 'a' | 'b') =>
    [safeText(row?.[`marca_${side}`]), safeText(row?.[`linea_${side}`])]
        .filter(Boolean)
        .join(' ')
        .trim() || '—';

/* =======================
   Componente
   ======================= */
const DetalleCambiarEstado: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, error } = useCotizacionById(id);

    // Payload tal cual tu backend ({ success, data }) o data directa
    const row = (data as any)?.data ?? data;
    const opts = React.useMemo(() => opcionesEstados(row), [row]);

    // Estado de form
    const [estadoNombre, setEstadoNombre] = React.useState<string>('');
    const [comentario2, setComentario2] = React.useState<string>('');

    React.useEffect(() => {
        if (!row) return;

        const preEstado = typeof row?.estado === 'string' ? row.estado.trim() : '';
        const labelsValidos = new Set(opcionesEstados(row).map(o => o.label));

        setEstadoNombre(preEstado && labelsValidos.has(preEstado) ? preEstado : '');
        setComentario2(safeText(row?.comentario2) || '');
    }, [row]);


    const esSolicitarCredito = (s?: string) =>
        (s || '')
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .trim()
            .toLowerCase() === 'solicitar credito';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!estadoNombre) {
            Swal.fire({ icon: 'warning', title: 'Selecciona un estado' });
            return;
        }
        if (!comentario2.trim()) {
            Swal.fire({ icon: 'warning', title: 'Escribe un comentario' });
            return;
        }

        try {
            // Hacemos el update y capturamos la respuesta
            const resp = await api.put('/actualizar_cotizacion.php', {
                id: Number(id),
                estado: estadoNombre, // el backend recibe el NOMBRE
                comentario2: comentario2.trim(),
            });

            // El backend puede devolver codigo_credito en la raíz o dentro de data
            const codigoCredito: string | undefined =
                resp?.data?.codigo_credito ?? resp?.data?.data?.codigo_credito;

            await Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `Nuevo estado: ${estadoNombre}`,
                timer: 1400,
                showConfirmButton: false,
            });

            // Navegación según el estado
            if (esSolicitarCredito(estadoNombre) && codigoCredito) {
                // Solo si es "Solicitar crédito" y hay código → /credito/{codigo}
                navigate(`/creditos/registrar/${encodeURIComponent(codigoCredito)}`);
            } else {
                // Para cualquier otro estado (o si no vino código) → /credito
                navigate('/creditos');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'No se pudo actualizar el estado.';
            Swal.fire({ icon: 'error', title: 'Error', text: String(msg) });
        }
    };

    // Loading / errores
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
                    <span>Hubo un problema cargando la cotización #{id}.</span>
                </div>
            </main>
        );
    }

    if (!row) {
        return (
            <main className="w-full min-h-screen flex items-center justify-center">
                <div className="alert alert-info max-w-lg">
                    <span>No se encontró información para la cotización #{id}.</span>
                </div>
            </main>
        );
    }

    // Datos personales
    const nombres = fullName(row);
    const apellidos =
        [safeText(row?.last_name), safeText(row?.s_last_name)].filter(Boolean).join(' ') || '—';
    const email = safeText(row?.email) || '—';
    const telefono = safeText((row as any)?.telefono) || '—'; // si luego llega
    const estadoActual = safeText(row?.estado) || 'Sin estado';
    const creada = fmtFecha(row?.fecha_creacion);

    // Motos
    const showMotoA = hasMoto(row, 'a');
    const showMotoB = hasMoto(row, 'b');

    return (
        <main className="w-full min-h-screen px-4 md:px-6 pb-6">
            <section className="w-full mb-6">
                <div className='pt-4 mb-3'>
                    <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" />
                </div>
{/* 
                {row} */}

            </section>

            {/* Tarjeta: Información de la cotización */}
            <section className="card bg-white border border-base-300/60 shadow-sm rounded-2xl mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-2 bg-[#3498DB]/70 text-white p-2 rounded-xl">
                        <BadgeInfo className="w-5 h-5" />
                        <h2 className="card-title text-lg">Información de la cotización</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm opacity-70">Estado:</span>
                            <span className={`badge ${estadoBadgeClass(estadoActual)}`}>{estadoActual}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 opacity-70" />
                            <span className="text-sm opacity-70">Creada:</span>
                            <span className="font-medium">{creada}</span>
                        </div>
                    </div>

                    {/* Información del cliente */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <UserRound className="w-5 h-5" />
                            <h3 className="text-base font-semibold">Información del cliente</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                            <InfoRow label="Nombres" value={nombres} />
                            <InfoRow label="Apellidos" value={apellidos} />
                            <InfoRow
                                label="Email"
                                value={
                                    email !== '—' ? (
                                        <a className="link link-primary inline-flex items-center gap-1" href={`mailto:${email}`}>
                                            <Mail className="w-4 h-4" />
                                            {email}
                                        </a>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                            <InfoRow
                                label="Teléfono"
                                value={
                                    telefono !== '—' ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {telefono}
                                        </span>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Motocicletas (como en la imagen) */}
            <section className="card bg-base-100  shadow-sm rounded-2xl mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                        <Bike className="w-5 h-5" />
                        <h2 className="card-title text-lg">Motocicletas</h2>
                    </div>

                    {/* Moto A */}
                    {showMotoA && (
                        <article className="overflow-hidden rounded-xl shadow-sm mb-4">
                            <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white">
                                {modeloMoto(row, 'a')}
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ">
                                <InfoKV label="Precio base:" value={fmtCOP(row?.precio_base_a)} />
                                <InfoKV label="Precio Documentos:" value={fmtCOP(row?.precio_documentos_a)} />
                                <InfoKV label="Descuentos :" value={fmtCOP(0)} />
                                <InfoKV label="Total :" value={fmtCOP(row?.precio_total_a)} />
                            </div>
                        </article>
                    )}

                    {/* Moto B (si existe) */}
                    {showMotoB && (
                        <article className="overflow-hidden rounded-xl shadow-sm">
                            <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white">
                                {modeloMoto(row, 'b')}
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                <InfoKV label="Precio base:" value={fmtCOP(row?.precio_base_b)} />
                                <InfoKV label="Precio Documentos:" value={fmtCOP(row?.precio_documentos_b)} />
                                <InfoKV label="Descuentos :" value={fmtCOP(0)} />
                                <InfoKV label="Total :" value={fmtCOP(row?.precio_total_b)} />
                            </div>
                        </article>
                    )}

                    {!showMotoA && !showMotoB && (
                        <div className="text-sm opacity-70">Sin información de motocicletas.</div>
                    )}
                </div>
            </section>

            {/* Formulario cambiar estado */}
            <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
                <div className="card-body">
                    <h2 className="card-title text-lg mb-2">Actualizar estado</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label w-28">
                                <span className="label-text">
                                    Estado <span className="text-error">*</span>
                                </span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={estadoNombre}
                                onChange={(e) => setEstadoNombre(e.target.value)}
                                required
                            >
                                {opts.map(({ value, label }) => (
                                    <option key={value || 'empty'} value={label} disabled={value === ''}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="form-control">
                            <label className="label w-28">
                                <span className="label-text">
                                    Comentario <span className="text-error">*</span>
                                </span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered min-h-28"
                                placeholder="Escribe un comentario"
                                value={comentario2}
                                onChange={(e) => setComentario2(e.target.value)}
                                maxLength={500}
                                required
                            />
                            <div className="text-xs opacity-60 text-right mt-1">{comentario2.length} / 500</div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                className="btn btn-error btn-sm"
                                onClick={() => navigate(-1)}
                            >
                                ← Volver
                            </button>

                            <button type="submit" className="btn btn-success btn-sm">
                                ✓ Aceptar
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
};

/* =======================
   Subcomponentes UI
   ======================= */
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <div className="text-sm opacity-70">{label}</div>
        <div className="font-medium">{value}</div>
    </div>
);

const InfoKV: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="opacity-70">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

export default DetalleCambiarEstado;
