// src/pages/DetalleCambiarEstado.tsx
import React, { useState } from 'react';
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
import { useLoaderStore } from '../../store/loader.store';
import { useAuthStore } from '../../store/auth.store';

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

// Tipo de pago (texto, no numérico)
const tipoPagoLabel = (row: any) =>
    (safeText(row?.tipo_pago) || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase();

const esCreditoDirecto = (row: any) =>
    tipoPagoLabel(row) === 'credito directo';

// Opciones de estado (según tipo de pago)
const opcionesEstados = (row: any): any[] => {
    const soloCreditoEnDirecto = esCreditoDirecto(row);
    return [
        { value: '', label: 'Seleccione...' },
        { value: '3', label: 'Continúa interesado' },
        { value: '4', label: 'Alto interés' },
        soloCreditoEnDirecto
            ? { value: '5', label: 'Solicitar crédito' }
            : { value: '6', label: 'Solicitar facturación' },
        { value: '7', label: 'Solicitar crédito express' },
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

// suma valores del JSON de seguros (string o array)
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
        // ignora parse errors
    }
    return undefined;
};

type MotoCalc = {
    precioBase: number;
    precioDocumentos: number;
    accesoriosYMarcacion: number;
    descuentos: number;
    seguros: number;
    garantia: boolean;
    totalSinSeguros: number;
    total: number;
    cuotaInicial: number;
};

const buildMotoCalc = (row: any, side: 'a' | 'b'): MotoCalc => {
    const sfx = `_${side}`;

    const precioBase = Number(row?.[`precio_base${sfx}`]) || 0;
    const precioDocumentos = Number(row?.[`precio_documentos${sfx}`]) || 0;

    const accesorios = Number(row?.[`accesorios${sfx}`]) || 0;
    const marcacion = Number(row?.[`marcacion${sfx}`]) || 0;
    const accesoriosYMarcacion = accesorios + marcacion;

    const descuentos = Number(row?.[`descuentos${sfx}`]) || 0;

    const segurosJson = row?.[`seguros${sfx}`];
    const segurosFromJson = sumSegurosFromJson(segurosJson);
    const seguros = typeof segurosFromJson === 'number'
        ? segurosFromJson
        : (Number(row?.[`seguro_vida${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_s${sfx}`]) || 0) +
        (Number(row?.[`seguro_mascota_a${sfx}`]) || 0) +
        (Number(row?.[`otro_seguro${sfx}`]) || 0);

    const gStr = String(row?.[`garantia${sfx}`] ?? '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const garantia = gStr === 'si' || gStr === 'sí' || gStr === 'true' || gStr === '1';

    const totalSinSeguros = Number(row?.[`total_sin_seguros${sfx}`]) ||
        (precioBase + precioDocumentos + accesoriosYMarcacion - descuentos);

    const total = Number(row?.[`precio_total${sfx}`]) || (totalSinSeguros + seguros);

    const cuotaInicial = Number(row?.[`cuota_inicial${sfx}`]) || 0;

    return {
        precioBase,
        precioDocumentos,
        accesoriosYMarcacion,
        descuentos,
        seguros,
        garantia,
        totalSinSeguros,
        total,
        cuotaInicial,
    };
};

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
    const [loading, setLoading] = useState(false);

    // ⬇️ Redirigir si la cotización ya está marcada para facturación (is_state = 1)
    React.useEffect(() => {
        if (isLoading) return;     // espera a que termine la carga
        if (!row || !id) return;

        const isState = Number((row as any).is_state ?? 0);
        if (isState === 1) {
            // Aviso opcional (puedes quitar este Swal si no lo quieres)
            Swal.fire({
                icon: 'info',
                title: 'Ya solicitada la facturación',
                text: 'Te llevaremos al detalle de la solicitud.',
                timer: 1200,
                showConfirmButton: false,
            }).then(() => {
                navigate(`/solicitudes/${id}`, { replace: true });
            });
        }
    }, [row, id, isLoading, navigate]);


    React.useEffect(() => {
        if (!row) return;
        const preEstado = typeof row?.estado === 'string' ? row.estado.trim() : '';
        const labelsValidos = new Set(opcionesEstados(row).map(o => o.label));
        setEstadoNombre(preEstado && labelsValidos.has(preEstado) ? preEstado : '');
        setComentario2(safeText(row?.comentario2) || '');
    }, [row]);

    const user = useAuthStore((s) => s.user);

    const esSolicitarCredito = (s?: string) =>
        (s || '')
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .trim()
            .toLowerCase() === 'solicitar credito';

    // Submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
            setLoading(true);

            const resp = await api.put('/actualizar_cotizacion.php', {
                id: Number(id),
                estado: estadoNombre, // el backend recibe el NOMBRE
                comentario2: comentario2.trim(),
                nombre_usuario: user?.name || 'Desconocido',
                rol_usuario: user?.rol || 'Usuario',
            });

            const codigoCredito: string | undefined =
                resp?.data?.codigo_credito ?? resp?.data?.data?.codigo_credito;

            await Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `Nuevo estado: ${estadoNombre}`,
                timer: 1400,
                showConfirmButton: false,
            });

            if (esSolicitarCredito(estadoNombre) && codigoCredito) {
                navigate(`/creditos/registrar/${encodeURIComponent(codigoCredito)}`);
            } else if (
                estadoNombre
                    .normalize('NFD')
                    .replace(/\p{Diacritic}/gu, '')
                    .trim()
                    .toLowerCase() === 'solicitar facturacion'
            ) {
                navigate(`/solicitudes/${id}`);
            } else {
                navigate('/cotizaciones');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'No se pudo actualizar el estado.';
            Swal.fire({ icon: 'error', title: 'Error', text: String(msg) });
        } finally {
            setLoading(false);
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

    const { show, hide } = useLoaderStore();
    React.useEffect(() => {
        if (isLoading) {
            show();
        } else {
            hide();
        }
    }, [isLoading, show, hide]);

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
    const telefono = safeText((row as any)?.celular) || '—';
    const estadoActual = safeText(row?.estado) || 'Sin estado';
    const creada = fmtFecha(row?.fecha_creacion);

    // Motos
    const showMotoA = hasMoto(row, 'a');
    const showMotoB = hasMoto(row, 'b');

    const motoA = showMotoA ? buildMotoCalc(row, 'a') : undefined;
    const motoB = showMotoB ? buildMotoCalc(row, 'b') : undefined;

    return (
        <main className="w-full min-h-screen px-4 md:px-6 pb-6">
            <section className="w-full mb-6">
                <div className='pt-4 mb-3'>
                    <ButtonLink to="/cotizaciones" label="Volver a cotizaciones" />
                </div>
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

            {/* Motocicletas */}
            <section className="card bg-base-100 shadow-sm rounded-2xl mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                        <Bike className="w-5 h-5" />
                        <h2 className="card-title text-lg">Motocicletas</h2>
                    </div>

                    {/* Moto A */}
                    {showMotoA && motoA && (
                        <article className="overflow-hidden rounded-xl shadow-sm mb-4">
                            <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white">
                                {modeloMoto(row, 'a')}
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                <InfoKV label="Precio base:" value={fmtCOP(motoA.precioBase)} />
                                <InfoKV label="Precio documentos:" value={fmtCOP(motoA.precioDocumentos)} />
                                <InfoKV label="Accesorios + Marcación:" value={fmtCOP(motoA.accesoriosYMarcacion)} />
                                <InfoKV label="Descuentos:" value={motoA.descuentos > 0 ? `-${fmtCOP(motoA.descuentos)}` : fmtCOP(0)} />
                                <InfoKV label="Seguros:" value={fmtCOP(motoA.seguros)} />
                                <InfoKV label="Garantía:" value={motoA.garantia ? 'Sí' : 'No'} />
                                <InfoKV label="Total sin seguros:" value={fmtCOP(motoA.totalSinSeguros)} />
                                <InfoKV label="Total:" value={fmtCOP(motoA.total)} />
                                <InfoKV label="Cuota inicial:" value={fmtCOP(motoA.cuotaInicial)} />
                            </div>
                        </article>
                    )}

                    {/* Moto B */}
                    {showMotoB && motoB && (
                        <article className="overflow-hidden rounded-xl shadow-sm">
                            <header className="px-4 py-2 font-semibold bg-[#3498DB]/70 text-white">
                                {modeloMoto(row, 'b')}
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                <InfoKV label="Precio base:" value={fmtCOP(motoB.precioBase)} />
                                <InfoKV label="Precio documentos:" value={fmtCOP(motoB.precioDocumentos)} />
                                <InfoKV label="Accesorios + Marcación:" value={fmtCOP(motoB.accesoriosYMarcacion)} />
                                <InfoKV label="Descuentos:" value={motoB.descuentos > 0 ? `-${fmtCOP(motoB.descuentos)}` : fmtCOP(0)} />
                                <InfoKV label="Seguros:" value={fmtCOP(motoB.seguros)} />
                                <InfoKV label="Garantía:" value={motoB.garantia ? 'Sí' : 'No'} />
                                <InfoKV label="Total sin seguros:" value={fmtCOP(motoB.totalSinSeguros)} />
                                <InfoKV label="Total:" value={fmtCOP(motoB.total)} />
                                <InfoKV label="Cuota inicial:" value={fmtCOP(motoB.cuotaInicial)} />
                            </div>
                        </article>
                    )}

                    {!showMotoA && !showMotoB && (
                        <div className="text-sm opacity-70">Sin información de motocicletas.</div>
                    )}
                </div>
            </section>

            {/* Formulario cambiar estado */}
            {useAuthStore.getState().user?.rol === "Asesor" && (safeText(row?.estado) || 'Sin estado') !== 'Sin interés' && (
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

                                <button
                                    type="submit"
                                    className="btn btn-success btn-sm"
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>✓ Aceptar</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}
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
