import React from "react";
import { Pen, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useModalStore } from "../../store/modalStore";
import { useEmpresas, useDeleteEmpresa } from "../../services/empresasServices";
import FormularioEmpresas from "./FormularioEmpresas";

const PAGE_SIZE = 10;
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

// Ideal: mueve a un config global o .env
const BASE_URL = "http://tuclick.vozipcolombia.net.co/motos/back";

/* ========= helpers de paginación (mismos que motos) ========= */
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
        endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
    );
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

/* ========= estilos de botones de paginación (mismos que motos) ========= */
const btnBase = "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} btn-primary text-primary-content`;
const btnEllipsis = "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const TablaEmpresas: React.FC = () => {
    const open = useModalStore((s) => s.open);
    const { data, isPending, isError } = useEmpresas();
    const del = useDeleteEmpresa();

    const empresas = Array.isArray(data) ? data : data ?? [];
    const [page, setPage] = React.useState(1);
    const totalPages = React.useMemo(
        () => Math.max(1, Math.ceil(empresas.length / PAGE_SIZE)),
        [empresas.length]
    );

    React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, empresas.length);
    const visible = empresas.slice(start, end);
    const items = getPaginationItems(page, totalPages);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
    const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

    const openCrear = () =>
        open(<FormularioEmpresas key="create" />, "Crear empresa", { size: "5xl", position: "center" });

    const openEditar = (e: any) =>
        open(
            <FormularioEmpresas key={`edit-${e.id}`} initialValues={e} mode="edit" />,
            `Editar empresa: ${e.nombre_empresa}`,
            { size: "5xl", position: "center" }
        );

    const confirmarEliminar = async (id: number, nombre: string) => {
        const res = await Swal.fire({
            icon: "warning",
            title: "Eliminar empresa",
            html: `¿Seguro que deseas eliminar <b>${nombre}</b>?`,
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
        });
        if (res.isConfirmed) del.mutate(id);
    };

    if (isPending)
        return <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">Cargando empresas…</div>;
    if (isError)
        return <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">Error al cargar empresas</div>;

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
            <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
                <h3 className="text-sm font-semibold tracking-wide text-base-content/70">Módulo de empresas</h3>
                <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>Crear Empresa</button>
            </div>

            <div className="relative overflow-x-auto max-w-full px-4">
                 <table className="table table-zebra table-pin-rows  min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th className="w-12">#</th>
                            <th>Logo</th>
                            <th>Empresa</th>
                            <th>NIT</th>
                            <th>Garantías</th>
                            <th>Siniestros</th>
                            <th>Dirección Siniestros</th>
                            <th>Sitio</th>
                            <th className="text-right pr-6">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="[&>tr:hover]:bg-base-200/40">
                        {visible.map((e: any) => (
                            <tr key={e.id} className="transition-colors">
                                <th className="text-base-content/50">{e.id}</th>
                                <td>
                                    {e.foto ? (
                                        <img
                                            src={/^https?:\/\//.test(e.foto) ? e.foto : `${BASE_URL}/${e.foto}`}
                                            alt={e.nombre_empresa}
                                            className="h-10 w-10 object-cover rounded-md border"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 bg-base-200 rounded-md grid place-content-center text-xs opacity-60">N/A</div>
                                    )}
                                </td>
                                <td className="font-medium max-w-[240px] truncate" title={e.nombre_empresa}>{e.nombre_empresa ?? "—"}</td>
                                <td>{e.nit_empresa ?? "—"}</td>
                                <td>
                                    <div className="text-sm leading-tight">
                                        <div>{e.correo_garantias ?? "—"}</div>
                                        <div className="opacity-70">{e.telefono_garantias ?? "—"}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="text-sm leading-tight">
                                        <div>{e.correo_siniestros ?? "—"}</div>
                                        <div className="opacity-70">{e.telefono_siniestros ?? "—"}</div>
                                    </div>
                                </td>
                                <td className="max-w-[260px] truncate" title={e.direccion_siniestros ?? ""}>
                                    {e.direccion_siniestros ?? "—"}
                                </td>
                                <td className="max-w-[200px] truncate" title={e.sitio_web ?? ""}>
                                    {e.sitio_web ? (
                                        <a
                                            className="link"
                                            target="_blank"
                                            rel="noreferrer"
                                            href={/^https?:\/\//.test(e.sitio_web) ? e.sitio_web : `https://${e.sitio_web}`}
                                        >
                                            {e.sitio_web}
                                        </a>
                                    ) : "—"}
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="btn btn-sm bg-white btn-circle" onClick={() => openEditar(e)} title="Editar" aria-label="Editar empresa">
                                            <Pen size="18px" color="green" />
                                        </button>
                                        <button
                                            className="btn btn-sm bg-white btn-circle"
                                            onClick={() => confirmarEliminar(Number(e.id), e.nombre_empresa)}
                                            title="Eliminar"
                                            aria-label="Eliminar empresa"
                                        >
                                            <Trash2 size="18px" color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-base-200/60">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
                            <th></th><th>Logo</th><th>Empresa</th><th>NIT</th><th>Garantías</th><th>Siniestros</th><th>Dirección Siniestros</th><th>Sitio</th><th className="text-right pr-6">Acciones</th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <span className="text-xs text-base-content/50">
                    Mostrando {empresas.length === 0 ? 0 : start + 1}–{end} de {empresas.length}
                </span>
                <div className="flex items-center gap-2">
                    <button className={btnGhost} onClick={goPrev} disabled={page === 1} aria-label="Página anterior">«</button>
                    {items.map((it, i) =>
                        it === "..." ? (
                            <span key={`e-${i}`} className={btnEllipsis}>…</span>
                        ) : (
                            <button
                                key={`p-${it}`}
                                className={it === page ? btnActive : btnGhost}
                                onClick={() => goTo(Number(it))}
                                aria-current={it === page ? "page" : undefined}
                            >
                                {it}
                            </button>
                        )
                    )}
                    <button className={btnGhost} onClick={goNext} disabled={page === totalPages} aria-label="Página siguiente">»</button>
                </div>
            </div>
        </div>
    );
};

export default TablaEmpresas;
