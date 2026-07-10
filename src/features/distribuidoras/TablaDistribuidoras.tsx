import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useLoaderStore } from "../../store/loader.store";
import {
  useDistribuidoras,
  useDeleteDistribuidora,
} from "../../services/distribuidoraServices";

import type {
  Distribuidora,
} from "../../services/distribuidoraServices";

import FormularioDistribuidoras from "./FormularioDistribuidoras";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActions, RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { confirmDelete } from "../../utils/confirmDelete";

const PAGE_SIZE = 10;

const TablaDistribuidoras: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { show, hide } = useLoaderStore();

  // estado local para page, limit, q (el backend pagina)
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(PAGE_SIZE);
  const [q, setQ] = React.useState("");

  const { data, isPending, isError } = useDistribuidoras({ page, limit, q });
  const deleteDistribuidora = useDeleteDistribuidora();

  React.useEffect(() => {
    isPending ? show() : hide();
  }, [isPending, show, hide]);

  const total = data?.total ?? 0;
  const items = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openCrear = () =>
    open(<FormularioDistribuidoras key="create" />, "Crear distribuidora", {
      size: "md",
      position: "center",
    });

  const openEditar = (d: Distribuidora) =>
    open(
      <FormularioDistribuidoras
        key={`edit-${d.id}`}
        initialValues={d}
        mode="edit"
      />,
      `Editar distribuidora: ${d.nombre}`,
      { size: "md", position: "center" }
    );

  const confirmarEliminar = async (id: number, nombre: string) => {
    const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar distribuidora");
    if (ok) {
      deleteDistribuidora.mutate(id, {
        onSuccess: () => {
          // si al borrar la página queda sin elementos, retrocede 1 página
          if (items.length === 1 && page > 1) setPage(page - 1);
        },
      });
    }
  };

  const columns: DataTableColumn<Distribuidora>[] = [
    { key: "id", header: "#", className: "w-12", render: (d) => <span className="text-base-content/50">{d.id}</span> },
    { key: "nombre", header: "Nombre", className: "font-medium", render: (d) => d.nombre ?? "—" },
    { key: "telefono", header: "Teléfono", render: (d) => d.telefono ?? "—" },
    { key: "direccion", header: "Dirección", render: (d) => d.direccion ?? "—" },
    {
      key: "estado",
      header: "Estado",
      render: (d) => (
        <span className={d.estado === 1 ? "badge badge-success badge-sm" : "badge badge-ghost badge-sm"}>
          {d.estado === 1 ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      render: (d) => (
        <RowActions>
          <RowActionButton icon={<Pen size="18px" color="green" />} title="Editar" onClick={() => openEditar(d)} />
          <RowActionButton
            icon={<Trash2 size="18px" color="#ef4444" />}
            title="Eliminar"
            onClick={() => confirmarEliminar(d.id, d.nombre)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <DataTable
      title="Módulo de distribuidoras"
      toolbar={
        <>
          <input
            className="input input-sm input-bordered w-full sm:w-60"
            placeholder="Buscar por nombre, teléfono o dirección"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <button className="btn bg-[#2BB352] text-white w-full sm:w-auto" onClick={openCrear}>
            Crear Distribuidora
          </button>
        </>
      }
      columns={columns}
      rows={items}
      rowKey={(d) => d.id}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar distribuidoras"
      emptyMessage="No hay resultados"
      pagination={{
        page,
        totalPages,
        totalItems: total,
        pageSize: limit,
        onPageChange: setPage,
      }}
    />
  );
};

export default TablaDistribuidoras;
