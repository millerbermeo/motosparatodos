import React from "react";
import { Eye, Pen, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useCreditoById } from "../../services/creditosServices";
import { useCreditos } from "../../services/creditosServices"; // <— nuevo hook
import { useAuthStore } from "../../store/auth.store";
import SelectCreditos from "./SelectCreditos";
import { useLoaderStore } from "../../store/loader.store";

const DEFAULT_PAGE_SIZE = 10;
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationItems(current: number, totalPages: number, siblingCount = SIBLING_COUNT, boundaryCount = BOUNDARY_COUNT) {
    if (totalPages <= 1) return [1];
    const startPages = range(1, Math.min(boundaryCount, totalPages));
    const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);
    const siblingsStart = Math.max(Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2);
    const siblingsEnd = Math.min(Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2), endPages.length > 0 ? endPages[0] - 2 : totalPages - 1);
    const items: (number | "...")[] = [];
    items.push(...startPages);
    if (siblingsStart > boundaryCount + 2) items.push("...");
    else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);
    items.push(...range(siblingsStart, siblingsEnd));
    if (siblingsEnd < totalPages - boundaryCount - 1) items.push("...");
    else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);
    items.push(...endPages);
    return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase = "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis = "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const moneyCOP = (n: number) => `${Number(n || 0).toLocaleString()} COP`;

const badgeSiNo = (v?: string) => {
    const value = (v || "").trim().toLowerCase();
    const isYes = value === "si" || value === "sí" || value === "s";
    const isNo = value === "no" || value === "n";
    const cls = isYes ? "badge-success" : isNo ? "badge-ghost" : "badge-ghost";
    const text = isYes ? "Sí" : isNo ? "No" : v ?? "-";
    return <span className={`badge ${cls}`}>{text}</span>;
};

const badgeEstado = (estado?: string) => {
    const e = (estado || "").toLowerCase();
    let cls = "badge-ghost";
    if (e.includes("aprob")) cls = "badge-success";
    else if (e.includes("incompleto")) cls = "badge-warning";
    else if (e.includes("viable") && e.includes("no")) cls = "badge-error";
    else if (e.includes("factur")) cls = "badge-info";
    else if (e.includes("en factura")) cls = "badge-primary";
    return <span className={`badge ${cls}`}>{estado ?? "-"}</span>;
};

const timeAgo = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso.replace(" ", "T"));
    const diffMs = Date.now() - d.getTime();
    if (!Number.isFinite(diffMs)) return iso;
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "justo ahora";
    if (m < 60) return `hace ${m} minuto${m === 1 ? "" : "s"}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} hora${h === 1 ? "" : "s"}`;
    const d2 = Math.floor(h / 24);
    return `hace ${d2} día${d2 === 1 ? "" : "s"}`;
};

const TablaCreditos: React.FC = () => {
    // ---- estado ----
    const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
    const [page, setPage] = React.useState(1);
    const [q, setQ] = React.useState("");
    const [estadoFilter, setEstadoFilter] = React.useState<string>("");
    const [creditoId, setCreditoId] = React.useState<number | null>(null);

    // ---- queries ----
    const oneQry = useCreditoById(creditoId);                    // detalle por id
    const listQry = useCreditos(page, pageSize);         // lista paginada del servidor

    const isDetail = Boolean(creditoId);

    // Dataset visible:
    const serverItems = listQry.data?.items ?? [];
    const serverMeta = listQry.data?.pagination;
    const listLoading = listQry.isLoading;
    const oneLoading = oneQry.isLoading;

    const isLoading = isDetail ? oneLoading : listLoading;
    const isError = isDetail ? oneQry.isError : listQry.isError;

    // Para detalle, mostramos solo ese registro como array de 1
    const baseData = isDetail
        ? (oneQry.data ? [oneQry.data] : [])
        : serverItems;

    // Filtros client-side (solo sobre la página actual)
    const creditosFiltrados = React.useMemo(() => {
        if (isDetail) return baseData;
        const term = q.trim().toLowerCase();
        return baseData.filter((c: any) => {
            const estadoOK = !estadoFilter || c.estado === estadoFilter;
            if (!estadoOK) return false;
            if (!term) return true;
            return [c.asesor, c.codigo_credito, c.nombre_cliente, c.producto, c.estado, c.analista]
                .join(" ").toLowerCase().includes(term);
        });
    }, [isDetail, baseData, q, estadoFilter]);

    // Estados (solo en lista)
    const estados = React.useMemo(() => {
        if (isDetail) return [];
        const set = new Set<string>();
        (serverItems ?? []).forEach((c: any) => c?.estado && set.add(c.estado));
        return Array.from(set).sort();
    }, [serverItems, isDetail]);

    // Paginación (del servidor):
    const totalPages = isDetail ? 1 : (serverMeta?.last_page ?? 1);
    const currentPage = isDetail ? 1 : (serverMeta?.current_page ?? page);
    //   const totalRows   = isDetail ? baseData.length : (serverMeta?.total ?? serverItems.length);

    React.useEffect(() => {
        if (!isDetail && page !== currentPage) setPage(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, isDetail]);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

    const cleanFilters = () => {
        setCreditoId(null);
        setPage(1);
        setPageSize(DEFAULT_PAGE_SIZE);
        setEstadoFilter("");
        setQ("");
    };

    const { show, hide } = useLoaderStore();


    React.useEffect(() => {
        if (isLoading) {
            show();   // 👈 muestra overlay
        } else {
            hide();   // 👈 lo oculta
        }
    }, [isLoading, show, hide]);


    if (isError) {
        return <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
            Error al cargar créditos
        </div>;
    }

    const visible = creditosFiltrados; // ya es la página actual (posible filtrada en cliente)

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
            {/* Toolbar */}
            <div className="px-4 pt-4 my-3 justify-between flex flex-wrap gap-3">
                <div className="flex flex-wrap gap-3 flex-1 min-w-62.5">
                    {/* Selector que setea el ID → modo detalle */}
                    <SelectCreditos onSelect={(id) => { setCreditoId(id ?? null); }} />

                    {/* Filtros (cliente, sobre la página actual) */}
                    {!isDetail && (
                        <>
                            {/* <label className="input input-sm input-bordered flex items-center gap-2 w-64">
                <input
                  className="grow"
                  placeholder="Busque por cliente, producto, código…"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
              </label> */}

                            <select
                                className="select select-md select-bordered"
                                value={estadoFilter}
                                onChange={(e) => { setEstadoFilter(e.target.value); }}
                            >
                                <option value="">Estado</option>
                                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </>
                    )}

                    <button onClick={cleanFilters} className="btn btn-accent min-w-37.5">
                        Limpiar Filtros
                    </button>
                </div>

                <div className="flex items-center gap-3 min-w-55 justify-end">
                    {!isDetail && (
                        <>
                            <label className="text-xs opacity-70">Filas:</label>
                            <select
                                className="select select-accent select-sm select-bordered w-20"
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            >
                                {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </>
                    )}

                    {useAuthStore.getState().user?.rol === "Asesor" && (
                        <Link to="/creditos/crear-cotizaciones-credito">
                            <button className="btn bg-[#2BB352] text-white">Crear Crédito</button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="relative overflow-x-auto max-w-full px-4">
                <table className="table table-zebra table-pin-rows min-w-275">
                    <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th>Id</th>
                            <th className="text-center">Acciones</th>
                            <th>Asesor</th>
                            <th>Código del crédito</th>
                            <th>Nombre cliente</th>
                            <th className="min-w-80">Producto</th>
                            <th>Valor producto</th>
                            <th>Plazo(meses)</th>
                            <th>Estado</th>
                            <th>Preaprobado</th>
                            <th>Analista</th>
                            <th>Revisado</th>
                            <th>¿Entrega autorizada?</th>
                            <th>¿Entregado?</th>
                            <th>¿Cambio CI?</th>
                            <th>Actualizado</th>
                        </tr>
                    </thead>

                    <tbody className="[&>tr:hover]:bg-base-200/40">
                        {visible.length === 0 && (
                            <tr><td colSpan={16} className="text-center py-8 text-base-content/60">Sin resultados</td></tr>
                        )}

                        {visible.map((c: any) => (
                            <tr key={c.id}>
                                <td>{c.id || "-"}</td>
                                <td className="flex h-full pt-5 items-end gap-3">

                                    {(
                                        useAuthStore.getState().user?.rol === "Administrador" ||
                                        useAuthStore.getState().user?.rol === "Lider_marca" ||
                                        useAuthStore.getState().user?.rol === "Lider_punto"
                                    ) && c.estado !== "Aprobado" && (
                                            <Link to={`/creditos/detalle/cambiar-estado/${c.codigo_credito}`}>
                                                <button className="btn btn-sm text-warning bg-white btn-circle" title="Editar Estado">
                                                    <Pencil size="18px" />
                                                </button>
                                            </Link>
                                        )}

                                    <Link to={`/creditos/detalle/${c.codigo_credito}`}>
                                        <button className="btn btn-sm text-success bg-white btn-circle" title="Ver">
                                            <Eye size="18px" />
                                        </button>
                                    </Link>
                                    {useAuthStore.getState().user?.rol === "Asesor" && (
                                        <Link to={`/creditos/registrar/${c.codigo_credito}`}>
                                            <button className="btn btn-sm text-warning bg-white btn-circle" title="Editar">
                                                <Pen size="18px" />
                                            </button>
                                        </Link>
                                    )}

                                </td>
                                <td className="font-medium">{c.asesor || "-"}</td>
                                <td>{c.codigo_credito || "-"}</td>
                                <td>{c.nombre_cliente || "-"}</td>
                                <td>{c.producto || "-"}</td>
                                <td className="whitespace-nowrap">{moneyCOP(c.valor_producto)}</td>
                                <td className="text-center">{c.plazo_meses ?? "-"}</td>
                                <td>{badgeEstado(c.estado)}</td>
                                <td>{badgeSiNo(c.proaprobado)}</td>
                                <td>{c.analista || "-"}</td>
                                <td>{badgeSiNo(c.revisado)}</td>
                                <td>{badgeSiNo(c.entrega_autorizada)}</td>
                                <td>{badgeSiNo((c as any).entregado ?? "No")}</td>
                                <td>{badgeSiNo(c.cambio_ci)}</td>
                                <td className="whitespace-nowrap">{timeAgo(c.actualizado)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación (servidor) */}
            {!isDetail && (
                <div className="flex items-center justify-between px-4 pb-4 pt-2">
                    <span className="text-xs text-base-content/50">
                        {serverMeta
                            ? <>Mostrando página {serverMeta.current_page} de {serverMeta.last_page} — {serverMeta.total} registros</>
                            : <>Mostrando {serverItems.length} registros</>}
                        {(q || estadoFilter) && <span className="ml-2 italic opacity-70">(filtro aplicado sobre la página)</span>}
                    </span>

                    <div className="flex items-center gap-2">
                        <button className={btnGhost} onClick={goPrev} disabled={currentPage <= 1}>«</button>
                        {getPaginationItems(currentPage, totalPages).map((it, i) =>
                            it === "..." ? (
                                <span key={`e-${i}`} className={btnEllipsis}>…</span>
                            ) : (
                                <button key={`p-${it}`} className={Number(it) === currentPage ? btnActive : btnGhost} onClick={() => goTo(Number(it))}>
                                    {it}
                                </button>
                            )
                        )}
                        <button className={btnGhost} onClick={goNext} disabled={currentPage >= totalPages}>»</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablaCreditos;
