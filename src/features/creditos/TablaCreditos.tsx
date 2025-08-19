// src/components/creditos/TablaCreditos.tsx
import React from "react";
import { Pen } from "lucide-react";
import { useCreditos } from "../../services/creditosServices";
import { Link } from "react-router-dom";

const DEFAULT_PAGE_SIZE = 10;
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
        Math.min(
            current - siblingCount,
            totalPages - boundaryCount - siblingCount * 2 - 1
        ),
        boundaryCount + 2
    );
    const siblingsEnd = Math.min(
        Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
        endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
    );
    const items: (number | "...")[] = [];
    items.push(...startPages);
    if (siblingsStart > boundaryCount + 2) items.push("...");
    else if (boundaryCount + 1 < totalPages - boundaryCount)
        items.push(boundaryCount + 1);
    items.push(...range(siblingsStart, siblingsEnd));
    if (siblingsEnd < totalPages - boundaryCount - 1) items.push("...");
    else if (totalPages - boundaryCount > boundaryCount)
        items.push(totalPages - boundaryCount);
    items.push(...endPages);
    return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase =
    "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} btn-primary text-primary-content`;
const btnEllipsis =
    "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const gridToolbar = "flex items-center gap-2 flex-wrap hidden";

// helpers de formato
const moneyCOP = (n: number) => `${Number(n || 0).toLocaleString()} COP`;

const badgeSiNo = (v?: string) => {
    const isYes = String(v || "").toLowerCase().startsWith("s"); // "Sí"/"Si"
    const isNo = String(v || "").toLowerCase().startsWith("n");  // "No"
    const cls = isYes
        ? "badge-success"
        : isNo
            ? "badge-ghost"
            : "badge-ghost";
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

// “hace X …” rápido
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
    const { data, isLoading, isError } = useCreditos();

    // estado de UI
    const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
    const [page, setPage] = React.useState(1);
    const [q, setQ] = React.useState("");
    const [estadoFilter, setEstadoFilter] = React.useState<string>("");

    const creditos = Array.isArray(data) ? data : data ?? [];

    // opciones de estado (dinámicas desde data)
    const estados = React.useMemo(() => {
        const set = new Set<string>();
        creditos.forEach((c: any) => c?.estado && set.add(c.estado));
        return Array.from(set).sort();
    }, [creditos]);

    // filtro y búsqueda
    const filtrados = React.useMemo(() => {
        const term = q.trim().toLowerCase();
        return creditos.filter((c: any) => {
            const estadoOK = !estadoFilter || c.estado === estadoFilter;
            if (!estadoOK) return false;
            if (!term) return true;
            const hay = [
                c.asesor,
                c.codigo_credito,
                c.nombre_cliente,
                c.producto,
                c.estado,
                c.analista,
            ]
                .join(" ")
                .toLowerCase()
                .includes(term);
            return hay;
        });
    }, [q, estadoFilter, creditos]);

    // paginación
    const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
    React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, filtrados.length);
    const visible = filtrados.slice(start, end);
    //   const items = getPaginationItems(page, totalPages);
    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

    if (isLoading) {
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">
                Cargando créditos…
            </div>
        );
    }
    if (isError) {
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
                Error al cargar créditos
            </div>
        );
    }

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
            {/* Toolbar */}
            <div className="px-4 pt-4 my-3 justify-between flex flex-wrap gap-3">
                <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
                    Créditos
                </h3>

                      <Link to="/cotizaciones/crear-cotizaciones">
                                    <button className="btn bg-[#2BB352] text-white">Crear Credito</button>
                                </Link>

                <div className={gridToolbar}>
                    {/* Búsqueda */}
                    <label className="input input-sm input-bordered flex items-center gap-2 w-64">
                        <input
                            className="grow"
                            placeholder="Busque por cliente, producto, código…"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
                    </label>

                    {/* Filtro estado */}
                    <select
                        className="select select-sm select-bordered"
                        value={estadoFilter}
                        onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Estado</option>
                        {estados.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>

                    {/* Page size */}
                    <select
                        className="select select-sm select-bordered"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    >
                        {[10, 25, 50].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="relative overflow-x-auto max-w-full px-4">
                <table className="table table-zebra table-pin-rows min-w-[1100px]">
                    <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th>Asesor</th>
                            <th>Código del crédito</th>
                            <th>Nombre cliente</th>
                            <th>Producto</th>
                            <th>Valor producto</th>
                            <th>Plazo(meses)</th>
                            <th>Estado</th>
                            <th>Proaprobado</th>
                            <th>Analista</th>
                            <th>Revisado</th>
                            <th>¿Entrega autorizada?</th>
                            <th>¿Entregado?</th>
                            <th>¿Cambio CI?</th>
                            <th>Actualizado</th>
                            <th className="text-right pr-4">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="[&>tr:hover]:bg-base-200/40">
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={15} className="text-center py-8 text-base-content/60">
                                    Sin resultados
                                </td>
                            </tr>
                        )}

                        {visible.map((c: any) => (
                            <tr key={c.id}>
                                <td className="font-medium">{c.asesor || "-"}</td>
                                <td>{c.codigo_credito || "-"}</td>
                                <td>{c.nombre_cliente || "-"}</td>
                                <td>{c.producto || "-"}</td>
                                <td className="whitespace-nowrap">{moneyCOP(c.valor_producto)}</td>
                                <td className="text-center">{c.plazo_meses ?? "-"}</td>
                                <td>{badgeEstado(c.estado)}</td>
                                <td>{badgeSiNo(c.poraprobado)}</td>
                                <td>{c.analista || "-"}</td>
                                <td>{badgeSiNo(c.revisado)}</td>
                                <td>{badgeSiNo(c.entrega_autorizada)}</td>
                                <td>{badgeSiNo((c as any).entregado ?? "No")}</td>
                                <td>{badgeSiNo(c.cambio_ci)}</td>
                                <td className="whitespace-nowrap">{timeAgo(c.actualizado)}</td>
                                <td className="text-right">
                                    {/* <button className="btn btn-sm bg-white btn-circle" title="Ver">
                                        <Eye size="18px" />
                                    </button> */}
<Link
  to={`/creditos/registrar/${c.cotizacion_id}${c.deudor_id ? '-' + c.deudor_id : ''}${c.codeudor_id ? '-' + c.codeudor_id : ''}`}
>

                                      <button className="btn btn-sm bg-white btn-circle" title="Ver">
                                        <Pen size="18px" />
                                    </button>
                                      </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot className="bg-base-200/60">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
                            <th>Asesor</th>
                            <th>Código del crédito</th>
                            <th>Nombre cliente</th>
                            <th>Producto</th>
                            <th>Valor producto</th>
                            <th>Plazo(meses)</th>
                            <th>Estado</th>
                            <th>Proaprobado</th>
                            <th>Analista</th>
                            <th>Revisado</th>
                            <th>¿Entrega autorizada?</th>
                            <th>¿Entregado?</th>
                            <th>¿Cambio CI?</th>
                            <th>Actualizado</th>
                            <th className="text-right pr-4">Acciones</th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <span className="text-xs text-base-content/50">
                    Mostrando {filtrados.length === 0 ? 0 : start + 1}–{end} de {filtrados.length}
                </span>
                <div className="flex items-center gap-2">
                    <button className={btnGhost} onClick={goPrev} disabled={page === 1}>
                        «
                    </button>
                    {getPaginationItems(page, totalPages).map((it, i) =>
                        it === "..." ? (
                            <span key={`e-${i}`} className={btnEllipsis}>
                                …
                            </span>
                        ) : (
                            <button
                                key={`p-${it}`}
                                className={it === page ? btnActive : btnGhost}
                                onClick={() => goTo(Number(it))}
                            >
                                {it}
                            </button>
                        )
                    )}
                    <button
                        className={btnGhost}
                        onClick={goNext}
                        disabled={page === totalPages}
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablaCreditos;
