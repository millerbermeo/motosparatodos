// src/components/cotizaciones/TablaCotizaciones.tsx
import React, { useState } from 'react';
import { Eye, ScanEye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCotizaciones } from '../../services/cotizacionesServices';
import { useAuthStore } from '../../store/auth.store';
import SelectCotizaciones from './SelectCotizaciones';
import { useCotizacionById } from '../../services/cotizacionesServices';
import { useLoaderStore } from '../../store/loader.store';


/* =======================
   Paginación (mismo estilo que motos)
   ======================= */
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationItems(
    current: number,
    totalPages: number,
    siblingCount = SIBLING_COUNT,
    boundaryCount = BOUNDARY_COUNT
) {
    if (totalPages <= 1) return [1];
    const startPages = range(1, Math.min(boundaryCount, totalPages));
    const endPages = range(
        Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
        totalPages
    );
    const siblingsStart = Math.max(
        Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
        boundaryCount + 2
    );
    const siblingsEnd = Math.min(
        Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
        endPages.length > 0 ? Number(endPages[0]) - 2 : totalPages - 1
    );
    const items: (number | '...')[] = [];
    items.push(...startPages);
    if (siblingsStart > boundaryCount + 2) items.push('...');
    else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);
    items.push(...range(siblingsStart, siblingsEnd));
    if (siblingsEnd < totalPages - boundaryCount - 1) items.push('...');
    else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);
    items.push(...endPages);
    return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase = 'btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0';
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis = 'btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none';


/* =======================
   Utils de presentación
   ======================= */
const fullName = (r: any) =>
    [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim() || '—';

// Relativo: "hace X minutos/horas/días"
const humanizeDesde = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr.replace(' ', 'T')); // backend: "YYYY-MM-DD HH:mm:ss"
    if (isNaN(d.getTime())) return '—';

    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return 'justo ahora';

    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);
    const weeks = Math.floor(days / 7);

    if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hrs > 0) return `hace ${hrs} hora${hrs > 1 ? 's' : ''}`;
    if (min > 0) return `hace ${min} minuto${min > 1 ? 's' : ''}`;
    return 'justo ahora';
};

// Absoluto: con AM/PM en es-CO. Descomenta timeZone si quieres fijar Bogotá.
const formatFechaLarga = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    const fmt = new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        // timeZone: 'America/Bogota',
    });
    return fmt.format(d); // ej: 18/08/2025, 9:33:49 p. m.
};

// 1 = contado, 2 = Credibike, 3 = terceros


const prospectoFrom = (r: any) => {
    if (typeof r?.prospecto === 'string' && r.prospecto.trim() !== '') {
        return r.prospecto.trim().toUpperCase(); // "SI" | "NO"
    }
    const has = (v: any) => v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== '0';
    return has(r?.pregunta) || has(r?.comentario) ? 'SI' : 'NO';
};

const estadoBadgeClass = (estado?: string) => {
    switch (estado) {
        case 'Continúa interesado':
            return 'badge-warning';
        case 'Alto interés':
            return 'badge-warning';
        case 'Solicitar facturación':
            return 'badge-success';
        case 'Solicitar crédito express':
            return 'badge-info';
        case 'Sin interés':
            return 'badge-error';

        case 'Solicitar crédito':
            return 'badge-info';


        default:
            return 'badge-ghost';
    }
};

/* =======================
   Componente principal
   ======================= */
const TablaCotizaciones: React.FC = () => {
    // server-side pagination (como lo tienes actualmente)
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10); // 👈 arranca en 20
    const [cotizacionId, setCotizacionId] = useState<number | null>(null);
    const [estadoFilter, setEstadoFilter] = useState<string>('');


    const {
        data,
        isLoading,
        isError,
        isFetching
    } = cotizacionId ? useCotizacionById(cotizacionId) : useCotizaciones(page, perPage, estadoFilter);

    // ¿estamos en modo "detalle por id"?
    const isDetail = Boolean(cotizacionId);

    // Normaliza rows:
    // - En lista: data?.data (como ya lo tenías)
    // - En detalle: toma SOLO data.data (no el wrapper {success,...})
    const rows = React.useMemo(() => {
        if (isDetail) {
            const one = Array.isArray(data?.data) ? data?.data?.[0] : data?.data;
            return one ? [one] : [];
        }
        return data?.data ?? [];
    }, [isDetail, data]);

    // Contadores/paginación: en detalle todo es 1 (o 0) y ocultamos los controles
    const total = isDetail ? rows.length : Number(data?.pagination?.total ?? rows.length ?? 0) || 0;
    const serverPerPage = isDetail ? rows.length : Number(data?.pagination?.per_page ?? perPage) || perPage;
    const currentPage = isDetail ? 1 : Number(data?.pagination?.current_page ?? page) || page;
    const lastPage = isDetail ? 1 : Number(
        data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage))
    );

    const items = React.useMemo(() => getPaginationItems(currentPage, lastPage), [currentPage, lastPage]);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

    const user = useAuthStore((state) => state.user);
    const { show, hide } = useLoaderStore();


    // En el componente principal
    React.useEffect(() => {
        if (isLoading) {
            show(); // 👈 abre el Loader global
        } else {
            hide(); // 👈 cierra cuando termina
        }
    }, [isLoading, show, hide]);

    if (isError) {
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
                Error al cargar cotizaciones
            </div>
        );
    }

    const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
    const end = Math.min(currentPage * serverPerPage, total);


    const cleanFilters = () => {
        setCotizacionId(null);   // salir del modo detalle
        setPage(1);              // volver a la primera página
        setPerPage(10);          // tamaño por defecto (ajústalo si quieres 20)
        setEstadoFilter('')
    };

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">


            <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-4 my-3">

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 flex-1 min-w-[250px]">
                    <SelectCotizaciones
                        onSelect={(id: string | number | null) => {
                            if (id === null || id === '') return setCotizacionId(null);
                            const n = typeof id === 'string' ? Number(id) : id;
                            setCotizacionId(Number.isNaN(n) ? null : n);
                        }}
                    />

                    <select
                        className="select select-bordered select-md min-w-[180px] max-w-[200px] flex-1"
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Sin estado">Sin estado</option>
                        <option value="Sin interés">Sin interés</option>
                        <option value="Continúa interesado">Continúa interesado</option>
                        <option value="Alto interés">Alto interés</option>
                        <option value="Solicitar crédito">Solicitud de crédito</option>
                        <option value="En facturación">En facturación</option>
                        <option value="Facturado">Facturado</option>
                    </select>

                    <button
                        onClick={cleanFilters}
                        className="btn btn-accent min-w-[150px]"
                    >
                        Limpiar Filtros
                    </button>
                </div>

                {/* Opciones de paginación y crear */}
                <div className="flex flex-wrap items-center gap-3 min-w-[220px] justify-end">
                    <label className="text-xs opacity-70">Filas:</label>
                    <select
                        className="select select-accent select-sm select-bordered w-20"
                        value={serverPerPage}
                        onChange={(e) => {
                            const v = Number(e.target.value) || 10;
                            setPerPage(v);
                            setPage(1);
                        }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                    {isFetching && <span className="loading loading-spinner loading-xs" />}

                    {user?.rol === "Asesor" && (
                        <Link to="/cotizaciones/crear-cotizaciones">
                            <button className="btn bg-[#2BB352] text-white min-w-[160px]">
                                Crear Cotización
                            </button>
                        </Link>
                    )}
                </div>
            </div>


            <div className="relative overflow-x-auto max-w-full px-4">
                <table className="table table-zebra table-pin-rows min-w-[1000px]">
                    <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th>Item</th>
                            <th>Acciones</th>
                            <th>Asesor</th>
                            <th>Nombre cliente</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Prospecto</th>
                            <th>Actualizado</th>
                        </tr>
                    </thead>

                    <tbody className="[&>tr:hover]:bg-base-200/40">

                        {rows.map((r: any) => (
                            <tr key={r.id} className="transition-colors">
                                <td className="text-sm text-base-content/70">{r?.id || '—'}</td>
                                <td className="text-sm text-base-content/70">
                                    <div className="flex justify-start gap-2">
                                        <Link to={`/cotizaciones/${r.id}`} className="btn btn-sm bg-white btn-circle" title="Ver cotización">
                                            <div className='text-info'>
                                                <Eye size="18px" />
                                            </div>
                                        </Link>


                                        {user?.rol === "Asesor" && r?.estado === "Sin estado" && (
                                            <>

                                                <Link
                                                    to={`/cotizaciones/estado/${r.id}`}
                                                    className="btn btn-sm bg-white btn-circle"
                                                    title="Cambiar estado"
                                                >
                                                    <div className='text-warning'>
                                                        <ScanEye size="18px" />
                                                    </div>
                                                </Link>
                                            </>
                                        )}


                                    </div>
                                </td>

                                <td className="text-sm text-base-content/70">{r?.asesor || '—'}</td>
                                <td className="font-medium">{fullName(r)}</td>
                                <td className="text-sm text-base-content/70">{r.celular || ''}</td>
                                <td>{r.tipo_pago}</td>
                                <td className="whitespace-nowrap">
                                    <span className={`badge whitespace-nowrap ${estadoBadgeClass(r?.estado)}`}>
                                        {r?.estado || 'Sin estado'}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap">
                                    <span className={`badge whitespace-nowrap ${prospectoFrom(r) === 'SI' ? 'badge-success' : 'badge-ghost'}`}>
                                        {prospectoFrom(r)}
                                    </span>
                                </td>

                                <td className="text-sm text-base-content/70">
                                    {humanizeDesde(r?.fecha_actualizacion)} · {formatFechaLarga(r?.fecha_actualizacion)}
                                </td>

                            </tr>
                        ))}
                    </tbody>

                    <tfoot className="bg-base-200/60">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
                            <th>Acciones</th>
                            <th>Asesor</th>
                            <th>Nombre cliente</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Prospecto</th>
                            <th>Actualizado</th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <span className="text-xs text-base-content/50">
                    Mostrando {start}–{end} de {total}
                </span>

                {!cotizacionId && (
                    <div className="flex items-center gap-2">
                        <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
                            «
                        </button>
                        {items.map((it, i) =>
                            it === '...' ? (
                                <span key={`e-${i}`} className={btnEllipsis}>
                                    …
                                </span>
                            ) : (
                                <button
                                    key={`p-${it}`}
                                    className={Number(it) === currentPage ? btnActive : btnGhost}
                                    onClick={() => goTo(Number(it))}
                                >
                                    {it}
                                </button>
                            )
                        )}
                        <button className={btnGhost} onClick={goNext} disabled={currentPage === lastPage}>
                            »
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TablaCotizaciones;
