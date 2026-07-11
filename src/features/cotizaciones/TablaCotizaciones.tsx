// src/components/cotizaciones/TablaCotizaciones.tsx
import React, { useState } from 'react';
import { Eye, ReceiptText, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCotizaciones } from '../../services/cotizacionesServices';
import { useAuthStore } from '../../store/auth.store';
import SelectCotizaciones from './SelectCotizaciones';
import { useCotizacionById } from '../../services/cotizacionesServices';
import { useLoaderStore } from '../../store/loader.store';
import { fmtFecha, timeAgo } from '../../utils/date';
import { buildFullName } from '../../utils/fullName';
import { DataTable } from '../../shared/components/datatable/DataTable';
import type { DataTableColumn } from '../../shared/components/datatable/types';

const estadoLabel = (estado?: string) => {
    if (!estado || estado === 'Sin estado') return 'Sin revisar';
    if (estado === 'Solicitar facturación') return 'En facturación';
    if (estado === 'Solicitar prefacturación') return 'Solicitud de Facturación';
    return estado;
};

/* =======================
   Utils de presentación
   ======================= */
const fullName = buildFullName;

// Relativo: "hace X minutos/horas/días"
const humanizeDesde = (dateStr?: string) => timeAgo(dateStr, { includeWeeks: true });

// Absoluto: formato global (año-mes-día, hora 12h a. m./p. m.)
const formatFechaLarga = (dateStr?: string) => fmtFecha(dateStr) || '—';

// 1 = contado, 2 = Credibike, 3 = terceros


const prospectoFrom = (r: any) => {
    if (typeof r?.prospecto === 'string' && r.prospecto.trim() !== '') {
        return r.prospecto.trim().toUpperCase(); // "SI" | "NO"
    }
    const has = (v: any) => v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== '0';
    return has(r?.pregunta) || has(r?.comentario) ? 'SI' : 'NO';
};

const tipoBadgeClass = (tipo?: string) => {
    const t = (tipo ?? '').toLowerCase();
    if (t.includes('tercero')) return 'badge-warning';
    if (t.includes('credito') || t.includes('crédito')) return 'badge-info';
    if (t.includes('contado') || t.includes('directo')) return 'badge-success';
    return 'badge-ghost';
};

const estadoBadgeClass = (estado?: string) => {
    switch (estado) {
        case 'Continúa interesado':
            return 'badge-warning';
        case 'Alto interés':
            return 'badge-secondary';
        case 'Solicitar facturación':
            return 'badge-success';
        case 'Solicitar prefacturación':
            return 'badge-info';
        case 'Solicitar crédito express':
            return 'badge-info';
        case 'Sin interés':
            return 'badge-error';
        case 'Solicitar crédito':
            return 'badge-primary';
        case 'Facturado':
            return 'badge-accent';
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
    const [perPage, setPerPage] = useState(10);
    const [cotizacionId, setCotizacionId] = useState<number | null>(null);
    const [estadoFilter, setEstadoFilter] = useState<string>('');
    const [tipoFilter, setTipoFilter] = useState<string>('');


    const {
        data,
        isLoading,
        isError,
        isFetching
    } = cotizacionId ? useCotizacionById(cotizacionId) : useCotizaciones(page, perPage, estadoFilter, tipoFilter);

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

    const cleanFilters = () => {
        setCotizacionId(null);
        setPage(1);
        setPerPage(10);
        setEstadoFilter('');
        setTipoFilter('');
    };

    const columns: DataTableColumn<any>[] = [
        { key: 'item', header: 'Item', className: 'text-sm text-base-content/70', render: (r) => r?.id || '—' },
        {
            key: 'acciones',
            header: 'Acciones',
            className: 'text-sm text-base-content/70',
            render: (r) => (
                <div className="flex justify-start gap-2">
                    <Link to={`/cotizaciones/${r.id}`} onClick={() => show()} className="btn btn-sm bg-base-100 btn-circle" title="Ver cotización">
                        <div className='text-info'>
                            <Eye size="18px" />
                        </div>
                    </Link>

                    {user?.rol === "Asesor" && (
                        r?.estado === "Sin estado" ||
                        r?.estado === "Alto interés" ||
                        r?.estado === "Continúa interesado" ||
                        r?.estado === "Sin interés" ||
                        r?.is_state === 1
                    ) && (
                            <Link
                                to={`/cotizaciones/estado/${r.id}`}
                                className="btn btn-sm bg-base-100 btn-circle"
                                title="Cambiar estado"
                            >
                                <div className='text-warning'>
                                    <RefreshCcw size="18px" />
                                </div>
                            </Link>
                        )}

                    {user?.rol === "Asesor" &&
                        (r?.estado === "Solicitar facturación" || r?.estado === "Solicitar prefacturación") &&
                        !(() => {
                            const tp = String(r?.tipo_pago ?? '').toLowerCase();
                            return !tp.includes('tercero') &&
                                (tp.includes('directo') || tp.includes('credito') || tp.includes('crédito') || tp.includes('propio'));
                        })() && (
                            <Link
                                to={`/solicitudes/${r.id}`}
                                className="btn btn-sm bg-base-100 btn-circle"
                                title="Cambiar estado"
                            >
                                <div className='text-success'>
                                    <ReceiptText size="18px" />
                                </div>
                            </Link>
                        )}

                    {user?.rol === "Asesor" &&
                        (r?.estado === "Solicitar facturación" || r?.estado === "Solicitar prefacturación") &&
                        r?.codigo_credito &&
                        (() => {
                            const tp = String(r?.tipo_pago ?? '').toLowerCase();
                            return !tp.includes('tercero') &&
                                (tp.includes('directo') || tp.includes('credito') || tp.includes('crédito') || tp.includes('propio'));
                        })() && (
                            <Link
                                to={`/creditos/detalle/facturar-credito/${r.codigo_credito}/${r.id}`}
                                className="btn btn-sm bg-base-100 btn-circle"
                                title="Solicitud de facturación"
                            >
                                <div className='text-success'>
                                    <ReceiptText size="18px" />
                                </div>
                            </Link>
                        )}
                </div>
            ),
        },
        { key: 'asesor', header: 'Asesor', className: 'text-sm text-base-content/70', render: (r) => r?.asesor || '—' },
        { key: 'nombre', header: 'Nombre cliente', className: 'font-medium', render: (r) => fullName(r) },
        { key: 'celular', header: 'Teléfono', className: 'text-sm text-base-content/70', render: (r) => r.celular || '' },
        {
            key: 'tipo',
            header: 'Tipo',
            render: (r) => (
                <span className={`badge whitespace-nowrap ${tipoBadgeClass(r?.tipo_pago)}`}>{r.tipo_pago}</span>
            ),
        },
        {
            key: 'estado',
            header: 'Estado',
            className: 'whitespace-nowrap',
            render: (r) => (
                <span className={`badge whitespace-nowrap ${estadoBadgeClass(r?.estado)}`}>{estadoLabel(r?.estado)}</span>
            ),
        },
        {
            key: 'prospecto',
            header: 'Prospecto',
            className: 'whitespace-nowrap',
            render: (r) => (
                <span className={`badge whitespace-nowrap ${prospectoFrom(r) === 'SI' ? 'badge-success' : 'badge-ghost'}`}>
                    {prospectoFrom(r)}
                </span>
            ),
        },
        {
            key: 'actualizado',
            header: 'Actualizado',
            className: 'text-sm text-base-content/70',
            render: (r) => (
                <>
                    {humanizeDesde(r?.fecha_actualizacion)} · {formatFechaLarga(r?.fecha_actualizacion)}
                </>
            ),
        },
    ];

    return (
        <DataTable
            filters={
                <>
                    <div className="pt-4 my-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-end">
                            <SelectCotizaciones
                                className="w-full min-w-0"
                                onSelect={(id: string | number | null) => {
                                    if (id === null || id === '') return setCotizacionId(null);
                                    const n = typeof id === 'string' ? Number(id) : id;
                                    setCotizacionId(Number.isNaN(n) ? null : n);
                                }}
                            />

                            <select
                                className="select select-bordered select-md w-full"
                                value={estadoFilter}
                                onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">Todos los estados</option>
                                <option value="Sin estado">Sin revisar</option>
                                <option value="Sin interés">Sin interés</option>
                                <option value="Continúa interesado">Continúa interesado</option>
                                <option value="Alto interés">Alto interés</option>
                                <option value="Solicitar prefacturación">Solicitud de Facturacion</option>
                                <option value="Solicitar crédito">Solicitud de crédito</option>
                                <option value="Solicitar facturación">En facturación</option>
                                <option value="Facturado">Facturado</option>
                            </select>

                            <select
                                className="select select-bordered select-md w-full"
                                value={tipoFilter}
                                onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="contado">Contado</option>
                                <option value="credito">Crédito propio</option>
                                <option value="Credito de terceros">Crédito de terceros</option>
                            </select>

                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <button onClick={cleanFilters} className="btn btn-accent w-full sm:flex-1">
                                    Limpiar Filtros
                                </button>

                                {user?.rol === "Asesor" && (
                                    <Link to="/cotizaciones/crear-cotizaciones" className="w-full sm:flex-1">
                                        <button className="btn bg-[#2BB352] text-white w-full">
                                            Crear Cotización
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            }
            tableClassName="min-w-250"
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Error al cargar cotizaciones"
            pagination={{
                page: currentPage,
                totalPages: lastPage,
                totalItems: total,
                pageSize: serverPerPage,
                onPageChange: setPage,
                onPageSizeChange: (v) => {
                    setPerPage(v || 10);
                    setPage(1);
                },
                pageSizeOptions: [10, 20, 50],
                isFetching,
                hideControls: isDetail,
            }}
        />
    );
};

export default TablaCotizaciones;
