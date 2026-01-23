import React from "react";
import { Pen, Trash2, Building2, Globe, IdCard, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { useModalStore } from "../../store/modalStore";
import { usePuntos, useDeletePunto } from "../../services/puntosServices";
import { useEmpresas } from "../../services/empresasServices";
import FormularioPuntos from "./FormularioPuntos";
import { useLoaderStore } from "../../store/loader.store";

const PAGE_SIZE = 10;
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

const BASE_URL =
    import.meta.env.VITE_API_URL ?? "https://tuclick.vozipcolombia.net.co/motos/back";



/* helpers de paginación */
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
        Math.max(
            current + siblingCount,
            boundaryCount + siblingCount * 2 + 2
        ),
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

/** Modal simple de info empresa (la “más importante”) */
function EmpresaInfo({ p }: { p: any }) {
    const nombre = (p?.nombre_empresa ?? "").toString().trim() || "—";
    const slogan = (p?.slogan_empresa ?? "").toString().trim();
    const nit = (p?.nit_empresa ?? "").toString().trim();
    const web = (p?.sitio_web ?? "").toString().trim();

    const correoGarantias = (p?.correo_garantias ?? "").toString().trim();
    const telGarantias = (p?.telefono_garantias ?? "").toString().trim();

    const correoSiniestros = (p?.correo_siniestros ?? "").toString().trim();
    const telSiniestros = (p?.telefono_siniestros ?? "").toString().trim();
    const dirSiniestros = (p?.direccion_siniestros ?? "").toString().trim();

    const foto = (p?.empresa_foto ?? "").toString().trim();

    const fotoSrc = foto
        ? /^https?:\/\//.test(foto)
            ? foto
            : `${BASE_URL}/${foto}`
        : "";
    return (
        <div className="space-y-6">
            {/* Header empresa */}
            <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="w-24 h-24 rounded-3xl bg-base-200 flex items-center justify-center overflow-hidden shadow">
                    {foto ? (
                        <img
                            src={fotoSrc}
                            alt={nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <Building2 size={40} className="opacity-60" />
                    )}
                </div>

                {/* Info principal */}
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-2xl leading-tight">{nombre}</h4>

                    {slogan && (
                        <p className="mt-1 text-base text-base-content/70">
                            {slogan}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                        {nit && (
                            <span className="badge badge-lg badge-ghost gap-2 px-4 py-3">
                                <IdCard size={16} /> NIT: {nit}
                            </span>
                        )}

                        {web && (
                            <a
                                href={/^https?:\/\//.test(web) ? web : `https://${web}`}
                                target="_blank"
                                rel="noreferrer"
                                className="badge badge-lg badge-outline gap-2 px-4 py-3 hover:opacity-80"
                            >
                                <Globe size={16} /> {web}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Garantías */}
                <div className="rounded-3xl border border-base-300 p-5 bg-base-100 shadow-sm">
                    <p className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
                        Garantías
                    </p>

                    <div className="mt-3 space-y-2 text-base">
                        <p>
                            <span className="font-medium">Correo:</span>{" "}
                            {correoGarantias || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Teléfono:</span>{" "}
                            {telGarantias || "—"}
                        </p>
                    </div>
                </div>

                {/* Siniestros */}
                <div className="rounded-3xl border border-base-300 p-5 bg-base-100 shadow-sm">
                    <p className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
                        Siniestros
                    </p>

                    <div className="mt-3 space-y-2 text-base">
                        <p>
                            <span className="font-medium">Correo:</span>{" "}
                            {correoSiniestros || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Teléfono:</span>{" "}
                            {telSiniestros || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Dirección:</span>{" "}
                            {dirSiniestros || "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

}

const TablaPuntos: React.FC = () => {
    const open = useModalStore((s) => s.open);
    const del = useDeletePunto();
    const { data, isPending, isError } = usePuntos();
    const { data: empresas } = useEmpresas();

    // ✅ Ajuste CLAVE: tu API viene como { success, count, puntos: [...] }
    const puntos = React.useMemo(() => {
        if (Array.isArray(data)) return data;
        return data ?? [];
    }, [data]);

    const [page, setPage] = React.useState(1);
    const totalPages = React.useMemo(
        () => Math.max(1, Math.ceil(puntos.length / PAGE_SIZE)),
        [puntos.length]
    );

    React.useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, puntos.length);
    const visible = puntos.slice(start, end);
    const items = getPaginationItems(page, totalPages);

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
    const goTo = (p: number) =>
        setPage(Math.min(Math.max(1, p), totalPages));

    const nombreEmpresa = (p: any) => {
        // 1) si viene en el punto, úsalo
        const directo = (p?.nombre_empresa ?? "").toString().trim();
        if (directo) return directo;

        // 2) fallback: map con useEmpresas
        const empresa_id = Number(p?.empresa_id);
        return (
            empresas?.find((e: any) => Number(e.id) === empresa_id)?.nombre_empresa ??
            `#${empresa_id}`
        );
    };

    const openCrear = () =>
        open(<FormularioPuntos key="create" />, "Crear punto", {
            size: "4xl",
            position: "center",
        });

    const openEditar = (p: any) =>
        open(
            <FormularioPuntos key={`edit-${p.id}`} initialValues={p} mode="edit" />,
            `Editar punto: ${p.nombre_punto}`,
            { size: "4xl", position: "center" }
        );

    const openEmpresa = (p: any) =>
        open(<EmpresaInfo p={p} />, "Información de la empresa", {
            size: "3xl",
            position: "center",
        });

    const confirmarEliminar = async (id: number, nombre: string) => {
        const res = await Swal.fire({
            icon: "warning",
            title: "Eliminar punto",
            html: `¿Seguro que deseas eliminar <b>${nombre}</b>?`,
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
        });
        if (res.isConfirmed) del.mutate(id);
    };

    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isPending) show();
        else hide();
    }, [isPending, show, hide]);

    if (isError)
        return (
            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
                Error al cargar puntos
            </div>
        );

    return (
        <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
            <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
                <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
                    Módulo de Agencias
                </h3>
                <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
                    Crear Punto
                </button>
            </div>

            <div className="relative overflow-x-auto max-w-full px-4">
                <table className="table table-zebra table-pin-rows min-w-[900px]">
                    <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                        <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
                            <th className="w-12">#</th>
                            <th>Pertenece a la Empresa</th>
                            {/* Opcional: columna “importante” */}
                            <th>NIT</th>
                            <th>Nombre Agencia</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                            <th className="text-right pr-6">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="[&>tr:hover]:bg-base-200/40">
                        {visible.map((p: any) => (
                            <tr key={p.id} className="transition-colors">
                                <th className="text-base-content/50">{p.id}</th>

                                {/* ✅ Click para ver info importante */}
                                <td className="max-w-[240px] cursor-pointer" title={nombreEmpresa(p)}>
                                    <button
                                        type="button"
                                        onClick={() => openEmpresa(p)}
                                        className="flex items-center gap-2 w-full text-left hover:opacity-90"
                                    >
                                        <Eye size={16} className="shrink-0 cursor-pointer opacity-70" />
                                        <span className="truncate link link-hover font-medium max-w-[210px]">
                                            {nombreEmpresa(p)}
                                        </span>
                                    </button>
                                </td>


                                <td className="max-w-[180px] truncate" title={p?.nit_empresa ?? ""}>
                                    {(p?.nit_empresa ?? "—").toString().trim() || "—"}
                                </td>

                                <td className="font-medium">{p.nombre_punto ?? "—"}</td>
                                <td>{p.telefono ?? "—"}</td>
                                <td>{p.correo ?? "—"}</td>
                                <td className="max-w-[320px] truncate" title={p.direccion ?? ""}>
                                    {p.direccion ?? "—"}
                                </td>

                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn btn-sm bg-white btn-circle"
                                            onClick={() => openEditar(p)}
                                            title="Editar"
                                            aria-label="Editar punto"
                                        >
                                            <Pen size="18px" color="green" />
                                        </button>
                                        <button
                                            className="btn btn-sm bg-white btn-circle"
                                            onClick={() =>
                                                confirmarEliminar(Number(p.id), p.nombre_punto)
                                            }
                                            title="Eliminar"
                                            aria-label="Eliminar punto"
                                        >
                                            <Trash2 size="18px" color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <span className="text-xs text-base-content/50">
                    Mostrando {puntos.length === 0 ? 0 : start + 1}–{end} de {puntos.length}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        className={btnGhost}
                        onClick={goPrev}
                        disabled={page === 1}
                        aria-label="Anterior"
                    >
                        «
                    </button>
                    {items.map((it, i) =>
                        it === "..." ? (
                            <span key={`e-${i}`} className={btnEllipsis}>
                                …
                            </span>
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
                    <button
                        className={btnGhost}
                        onClick={goNext}
                        disabled={page === totalPages}
                        aria-label="Siguiente"
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablaPuntos;
