// src/components/cotizaciones/TablaCotizaciones.tsx
import React from 'react';
import { Eye, ScanEye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCotizaciones } from '../../services/cotizacionesServices';
import { useAuthStore } from '../../store/auth.store';

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
const btnActive = `${btnBase} btn-primary text-primary-content`;
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
const tipoFrom = (r: any) => {
  switch (Number(r?.tipo_pago)) {
    case 1: return "Contado";
    case 2: return "Credibike de Colombia";
    case 3: return "Crédito de terceros";
    default: return "N/A";
  }
};

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
        default:
            return 'badge-ghost';
    }
};

/* =======================
   Componente principal
   ======================= */
const TablaCotizaciones: React.FC = () => {
    // server-side pagination (como lo tienes actualmente)
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);

    const { data, isLoading, isError, isFetching } = useCotizaciones(page, perPage);

    const rows = data?.data ?? [];
    const total = Number(data?.pagination?.total ?? rows.length ?? 0) || 0;
    const serverPerPage = Number(data?.pagination?.per_page ?? perPage) || perPage;
    const currentPage = Number(data?.pagination?.current_page ?? page) || page;
    const lastPage = Number(data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage)));

    const items = React.useMemo(() => getPaginationItems(currentPage, lastPage), [currentPage, lastPage]);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

    const user = useAuthStore((state) => state.user);


    if (isLoading) {
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">
                Cargando cotizaciones…
            </div>
        );
    }

    if (isError) {
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
                Error al cargar cotizaciones
            </div>
        );
    }

    const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
    const end = Math.min(currentPage * serverPerPage, total);

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
            <div className="px-4 pt-4 flex items-center w-full justify-between gap-3 flex-wrap my-3">
                <h3 className="text-sm font-semibold tracking-wide text-base-content/70">Módulo de cotizaciones</h3>


                {user?.rol === "Asesor" && (
                    <>
                        <Link to="/cotizaciones/crear-cotizaciones">
                            <button className="btn bg-[#2BB352] text-white">Crear Cotización</button>
                        </Link>
                    </>
                )}


            </div>

            <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
                <div className="flex items-center gap-2">
                    <label className="text-xs opacity-70">Filas:</label>
                    <select
                        className="select select-bordered select-xs"
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
                </div>
            </div>

            <div className="relative overflow-x-auto max-w-full px-4">
                <table className="table table-zebra table-pin-rows min-w-[1000px]">
                    <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th>Asesor</th>
                            <th>Nombre cliente</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Prospecto</th>
                            <th>Actualizado</th>
                            <th className="text-right pr-6">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="[&>tr:hover]:bg-base-200/40">
                        {rows.map((r: any) => (
                            <tr key={r.id} className="transition-colors">
                                <td className="text-sm text-base-content/70">{r?.asesor || '—'}</td>
                                <td className="font-medium">{fullName(r)}</td>
                                <td className="text-sm text-base-content/70">{r.celular || ''}</td>
                                <td>{tipoFrom(r)}</td>
                                <td>
                                    <span className={`badge ${estadoBadgeClass(r?.estado)}`}>{r?.estado || 'Sin estado'}</span>
                                </td>
                                <td>
                                    <span className={`badge ${prospectoFrom(r) === 'SI' ? 'badge-success' : 'badge-ghost'}`}>
                                        {prospectoFrom(r)}
                                    </span>
                                </td>
                                <td className="text-sm text-base-content/70">
                                    {humanizeDesde(r?.fecha_actualizacion)} · {formatFechaLarga(r?.fecha_actualizacion)}
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link to={`/cotizaciones/${r.id}`} className="btn btn-sm bg-white btn-circle" title="Ver cotización">
                                            <Eye size="18px" />
                                        </Link>


                                        {user?.rol === "Asesor" && (
                                            <>

                                                <Link
                                                    to={`/cotizaciones/estado/${r.id}`}
                                                    className="btn btn-sm bg-white btn-circle"
                                                    title="Cambiar estado"
                                                >
                                                    <ScanEye size="18px" />
                                                </Link>
                                            </>
                                        )}


                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot className="bg-base-200/60">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
                            <th>Asesor</th>
                            <th>Nombre cliente</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Prospecto</th>
                            <th>Actualizado</th>
                            <th className="text-right pr-6">Acciones</th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <span className="text-xs text-base-content/50">
                    Mostrando {start}–{end} de {total}
                </span>

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
            </div>
        </div>
    );
};

export default TablaCotizaciones;
