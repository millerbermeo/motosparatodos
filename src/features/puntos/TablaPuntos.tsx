import React from "react";
import { Pen, Trash2, Building2, Globe, IdCard, Eye } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { usePuntos, useDeletePunto } from "../../services/puntosServices";
import { useEmpresas } from "../../services/empresasServices";
import FormularioPuntos from "./FormularioPuntos";
import { useLoaderStore } from "../../store/loader.store";
import { toAbsoluteUrl } from "../../utils/files";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActions, RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { useClientPagination } from "../../shared/hooks/useClientPagination";
import { confirmDelete } from "../../utils/confirmDelete";

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

    const fotoSrc = toAbsoluteUrl(foto) ?? "";
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

    const { page, setPage, pageSize, totalPages, pageItems, totalItems } =
        useClientPagination(puntos, 10);

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
        const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar punto");
        if (ok) del.mutate(id);
    };

    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isPending) show();
        else hide();
    }, [isPending, show, hide]);

    const columns: DataTableColumn<any>[] = [
        { key: "id", header: "#", className: "w-12", render: (p) => <span className="text-base-content/50">{p.id}</span> },
        {
            key: "empresa",
            header: "Pertenece a la Empresa",
            className: "max-w-60 cursor-pointer",
            render: (p) => (
                <span title={nombreEmpresa(p)}>
                    <button
                        type="button"
                        onClick={() => openEmpresa(p)}
                        className="flex items-center gap-2 w-full text-left hover:opacity-90"
                    >
                        <Eye size={16} className="shrink-0 cursor-pointer opacity-70" />
                        <span className="truncate link link-hover font-medium max-w-52.5">
                            {nombreEmpresa(p)}
                        </span>
                    </button>
                </span>
            ),
        },
        {
            key: "nit",
            header: "NIT",
            className: "max-w-45 truncate",
            render: (p) => (
                <span title={p?.nit_empresa ?? ""}>{(p?.nit_empresa ?? "—").toString().trim() || "—"}</span>
            ),
        },
        { key: "nombre_punto", header: "Nombre Agencia", className: "font-medium", render: (p) => p.nombre_punto ?? "—" },
        { key: "telefono", header: "Teléfono", render: (p) => p.telefono ?? "—" },
        { key: "correo", header: "Correo", render: (p) => p.correo ?? "—" },
        {
            key: "direccion",
            header: "Dirección",
            className: "max-w-[320px] truncate",
            render: (p) => <span title={p.direccion ?? ""}>{p.direccion ?? "—"}</span>,
        },
        {
            key: "acciones",
            header: "Acciones",
            align: "right",
            headerClassName: "pr-6",
            render: (p) => (
                <RowActions>
                    <RowActionButton icon={<Pen size="18px" color="green" />} title="Editar" onClick={() => openEditar(p)} />
                    <RowActionButton
                        icon={<Trash2 size="18px" color="#ef4444" />}
                        title="Eliminar"
                        onClick={() => confirmarEliminar(Number(p.id), p.nombre_punto)}
                    />
                </RowActions>
            ),
        },
    ];

    return (
        <DataTable
            title="Módulo de Agencias"
            toolbar={
                <button className="btn bg-[#2BB352] text-white w-full sm:w-auto" onClick={openCrear}>
                    Crear Punto
                </button>
            }
            tableClassName="min-w-225"
            columns={columns}
            rows={pageItems}
            rowKey={(p) => p.id}
            isLoading={isPending}
            isError={isError}
            errorMessage="Error al cargar puntos"
            pagination={{
                page,
                totalPages,
                totalItems,
                pageSize,
                onPageChange: setPage,
            }}
        />
    );
};

export default TablaPuntos;
