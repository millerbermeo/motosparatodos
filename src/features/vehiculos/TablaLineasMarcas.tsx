import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useLineas, useDeleteLinea } from "../../services/lineasMarcasServices"; // ajusta si tu ruta real es lineasServices
import FormularioLineas from "./forms/FormularioLineas";
import { useLoaderStore } from "../../store/loader.store";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActions, RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { useClientPagination } from "../../shared/hooks/useClientPagination";
import { confirmDelete } from "../../utils/confirmDelete";

const TablaLineas: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // ✅ filtros locales
  const [marca, setMarca] = React.useState("");
  const [linea, setLinea] = React.useState("");
  const [cilindraje, setCilindraje] = React.useState("");

  // ✅ debounce
  const [debounced, setDebounced] = React.useState({
    marca: "",
    linea: "",
    cilindraje: "",
  });

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced({
        marca: marca.trim(),
        linea: linea.trim(),
        cilindraje: cilindraje.trim(),
      });
    }, 500);

    return () => window.clearTimeout(t);
  }, [marca, linea, cilindraje]);

  // ✅ hook con filtros
  const { data, isPending, isError } = useLineas(debounced);
  const deleteLinea = useDeleteLinea();

  const lineasArr = Array.isArray(data) ? data : data ?? [];

  const { page, setPage, pageSize, setPageSize, totalPages, pageItems, totalItems } =
    useClientPagination(lineasArr, 10);

  // ✅ reset página al cambiar filtro
  React.useEffect(() => {
    setPage(1);
  }, [debounced.marca, debounced.linea, debounced.cilindraje]);

  const openCrear = () =>
    open(<FormularioLineas key="create" />, "Crear línea", {
      size: "lg",
      position: "center",
    });

  const openEditar = (l: any) =>
    open(
      <FormularioLineas key={`edit-${l.id}`} initialValues={l} mode="edit" />,
      `Editar línea: ${l.marca} - ${l.linea}`,
      { size: "lg", position: "center" }
    );

  const confirmarEliminar = async (id: number, nombre: string) => {
    const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar línea");
    if (ok) deleteLinea.mutate(id);
  };

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  const clearFilters = () => {
    setMarca("");
    setLinea("");
    setCilindraje("");
    setDebounced({ marca: "", linea: "", cilindraje: "" }); // vuelve a traer todo
  };

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "#", className: "w-12", render: (l) => <span className="text-base-content/50">{l.id}</span> },
    { key: "marca", header: "Marca", className: "font-medium", render: (l) => l.marca ?? "—" },
    { key: "linea", header: "Línea", className: "font-medium", render: (l) => l.linea ?? "—" },
    { key: "cilindraje", header: "Cilindraje", className: "font-medium", render: (l) => l.cilindraje ?? "—" },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      render: (l) => (
        <RowActions>
          <RowActionButton icon={<Pen size="18px" color="green" />} title="Editar" onClick={() => openEditar(l)} />
          <RowActionButton
            icon={<Trash2 size="18px" color="#ef4444" />}
            title="Eliminar"
            onClick={() => confirmarEliminar(Number(l.id), `${l.marca} ${l.linea}`)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <DataTable
      title="Módulo de líneas"
      toolbar={
        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Línea
        </button>
      }
      filters={
        <div className="bg-base-100 rounded-xl border border-base-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Filtrar por marca</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Ej: STARKER"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Filtrar por línea</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Ej: COOLJOY"
                value={linea}
                onChange={(e) => setLinea(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Filtrar por cilindraje</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Ej: 500"
                inputMode="numeric"
                value={cilindraje}
                onChange={(e) => {
                  // solo permite números o vacío
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) setCilindraje(v);
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} disabled={!marca && !linea && !cilindraje}>
              Limpiar filtros
            </button>
            <span className="text-xs opacity-70">
              {isPending ? "Cargando..." : `Resultados: ${lineasArr.length}`}
            </span>
          </div>
        </div>
      }
      columns={columns}
      rows={pageItems}
      rowKey={(l, idx) => l.id ?? idx}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar líneas"
      emptyMessage="No hay resultados con esos filtros."
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

export default TablaLineas;
