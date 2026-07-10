import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useEmpresas, useDeleteEmpresa } from "../../services/empresasServices";
import FormularioEmpresas from "./FormularioEmpresas";
import { useLoaderStore } from "../../store/loader.store";
import { toAbsoluteUrl } from "../../utils/files";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActions, RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { useClientPagination } from "../../shared/hooks/useClientPagination";
import { confirmDelete } from "../../utils/confirmDelete";

const TablaEmpresas: React.FC = () => {
    const open = useModalStore((s) => s.open);
    const { data, isPending, isError } = useEmpresas();
    const del = useDeleteEmpresa();

    const empresas: any[] = Array.isArray(data) ? data : data ?? [];
    const { page, setPage, pageSize, totalPages, pageItems, totalItems } =
        useClientPagination(empresas, 10);

    const openCrear = () =>
        open(<FormularioEmpresas key="create" />, "Crear empresa", { size: "5xl", position: "center" });

    const openEditar = (e: any) =>
        open(
            <FormularioEmpresas key={`edit-${e.id}`} initialValues={e} mode="edit" />,
            `Editar empresa: ${e.nombre_empresa}`,
            { size: "5xl", position: "center" }
        );

    const confirmarEliminar = async (id: number, nombre: string) => {
        const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar empresa");
        if (ok) del.mutate(id);
    };

    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isPending) {
            show();   // 🔵 muestra overlay
        } else {
            hide();   // 🔵 lo oculta
        }
    }, [isPending, show, hide]);

    const columns: DataTableColumn<any>[] = [
        { key: "id", header: "#", className: "w-12", render: (e) => <span className="text-base-content/50">{e.id}</span> },
        {
            key: "logo",
            header: "Logo",
            render: (e) =>
                e.foto ? (
                    <img
                        src={toAbsoluteUrl(e.foto) ?? undefined}
                        alt={e.nombre_empresa}
                        className="h-10 w-10 object-cover rounded-md border"
                    />
                ) : (
                    <div className="h-10 w-10 bg-base-200 rounded-md grid place-content-center text-xs opacity-60">N/A</div>
                ),
        },
        {
            key: "nombre",
            header: "Empresa",
            className: "font-medium max-w-60 truncate",
            render: (e) => <span title={e.nombre_empresa}>{e.nombre_empresa ?? "—"}</span>,
        },
        { key: "nit", header: "NIT", render: (e) => e.nit_empresa ?? "—" },
        {
            key: "garantias",
            header: "Garantías",
            render: (e) => (
                <div className="text-sm leading-tight">
                    <div>{e.correo_garantias ?? "—"}</div>
                    <div className="opacity-70">{e.telefono_garantias ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "siniestros",
            header: "Siniestros",
            render: (e) => (
                <div className="text-sm leading-tight">
                    <div>{e.correo_siniestros ?? "—"}</div>
                    <div className="opacity-70">{e.telefono_siniestros ?? "—"}</div>
                </div>
            ),
        },
        {
            key: "direccion_siniestros",
            header: "Dirección Siniestros",
            className: "max-w-65 truncate",
            render: (e) => <span title={e.direccion_siniestros ?? ""}>{e.direccion_siniestros ?? "—"}</span>,
        },
        {
            key: "sitio",
            header: "Sitio",
            className: "max-w-50 truncate",
            render: (e) => (
                <span title={e.sitio_web ?? ""}>
                    {e.sitio_web ? (
                        <a
                            className="link"
                            target="_blank"
                            rel="noreferrer"
                            href={/^https?:\/\//.test(e.sitio_web) ? e.sitio_web : `https://${e.sitio_web}`}
                        >
                            {e.sitio_web}
                        </a>
                    ) : (
                        "—"
                    )}
                </span>
            ),
        },
        {
            key: "acciones",
            header: "Acciones",
            align: "right",
            headerClassName: "pr-6",
            render: (e) => (
                <RowActions>
                    <RowActionButton icon={<Pen size="18px" color="green" />} title="Editar" onClick={() => openEditar(e)} />
                    <RowActionButton
                        icon={<Trash2 size="18px" color="#ef4444" />}
                        title="Eliminar"
                        onClick={() => confirmarEliminar(Number(e.id), e.nombre_empresa)}
                        hidden
                    />
                </RowActions>
            ),
        },
    ];

    return (
        <DataTable
            title="Módulo de empresas"
            toolbar={
                <button className="btn bg-[#2BB352] text-white w-full sm:w-auto" onClick={openCrear}>
                    Crear Empresa
                </button>
            }
            tableClassName="min-w-225"
            columns={columns}
            rows={pageItems}
            rowKey={(e) => e.id}
            isLoading={isPending}
            isError={isError}
            errorMessage="Error al cargar empresas"
            emptyMessage="Sin resultados"
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

export default TablaEmpresas;
