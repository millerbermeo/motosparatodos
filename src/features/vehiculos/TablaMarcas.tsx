import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useMarcas, useDeleteMarca, type Marca } from "../../services/marcasServices"; // o "../../api/hooksMarcas" según tu proyecto
import FormularioMarcas from "./forms/FormularioMarcas";
import { useLoaderStore } from "../../store/loader.store";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActions, RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { useClientPagination } from "../../shared/hooks/useClientPagination";
import { confirmDelete } from "../../utils/confirmDelete";

const TablaMarcas: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // ✅ NUEVO: input y debounce
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500); // 👈 medio segundo

    return () => window.clearTimeout(t);
  }, [search]);

  // ✅ ahora el hook recibe el texto ya "debounced"
  const { data, isPending, isError } = useMarcas(debouncedSearch);
  const deleteMarca = useDeleteMarca();

  const marcas: Marca[] = Array.isArray(data) ? data : data ?? [];

  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, totalItems } =
    useClientPagination(marcas, 10);

  // ✅ reset página cuando cambia el filtro
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openCrear = () =>
    open(<FormularioMarcas key="create" />, "Crear marca", {
      size: "md",
      position: "center",
    });

  const openEditar = (m: Marca) =>
    open(
      <FormularioMarcas key={`edit-${m.id}`} initialValues={m} mode="edit" />,
      `Editar marca: ${m.marca}`,
      { size: "md", position: "center" }
    );

  const confirmarEliminar = async (id: number, nombre: string) => {
    const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar marca");
    if (ok) deleteMarca.mutate(id);
  };

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch(""); // 👈 vuelve a traer todas
  };

  const columns: DataTableColumn<Marca>[] = [
    {
      key: "id",
      header: "#",
      className: "w-12",
      render: (m) => <span className="text-base-content/50">{m.id}</span>,
    },
    {
      key: "marca",
      header: "Marca",
      render: (m) => <span className="font-medium">{m.marca ?? "—"}</span>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      render: (m) => (
        <RowActions>
          <RowActionButton icon={<Pen size="18px" color="green" />} title="Editar" onClick={() => openEditar(m)} />
          <RowActionButton
            icon={<Trash2 size="18px" color="#ef4444" />}
            title="Eliminar"
            onClick={() => confirmarEliminar(Number(m.id), m.marca)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <DataTable
      title="Módulo de marcas"
      toolbar={
        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Marca
        </button>
      }
      filters={
        <div className="bg-base-100 rounded-xl border border-base-200 p-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
            <div className="form-control w-full sm:max-w-md">
              <label className="label">
                <span className="label-text">Buscar marca</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Escribe: Yamaha, Honda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt opacity-70">
                  {search.trim() ? "Buscando..." : "Escribe para filtrar"}
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch} disabled={!search}>
                Limpiar
              </button>

              <span className="text-xs opacity-70 self-center">
                {isPending ? "Cargando..." : `Resultados: ${marcas.length}`}
              </span>
            </div>
          </div>
        </div>
      }
      columns={columns}
      rows={pageItems}
      rowKey={(m, idx) => m.id ?? idx}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar marcas"
      emptyMessage={`No hay resultados para "${debouncedSearch}".`}
      pagination={{
        page,
        totalPages,
        totalItems,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        pageSizeOptions: [10, 20, 50],
      }}
    />
  );
};

export default TablaMarcas;
