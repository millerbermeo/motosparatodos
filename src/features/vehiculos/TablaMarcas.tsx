import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useMarcas, useDeleteMarca } from "../../services/marcasServices";
import Swal from "sweetalert2";
import FormularioMarcas from "./forms/FormularioMarcas";

// Paginación
const PAGE_SIZE = 10;
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

  if (siblingsStart > boundaryCount + 2) {
    items.push("...");
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < totalPages - boundaryCount - 1) {
    items.push("...");
  } else if (totalPages - boundaryCount > boundaryCount) {
    items.push(totalPages - boundaryCount);
  }

  items.push(...endPages);
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} btn-primary text-primary-content`;
const btnEllipsis =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const TablaMarcas: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { data, isPending, isError } = useMarcas();
  const deleteMarca = useDeleteMarca();

  // Asegura arreglo
  const marcas = Array.isArray(data) ? data : data ?? [];

  // Hooks
  const [page, setPage] = React.useState(1);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(marcas.length / PAGE_SIZE)),
    [marcas.length]
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, marcas.length);
  const visible = marcas.slice(start, end);
  const items = getPaginationItems(page, totalPages);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // 👉 Usamos key para forzar remount y evitar "datos pegados"
  const openCrear = () =>
    open(<FormularioMarcas key="create" />, "Crear marca", {
      size: "md",
      position: "center",
    });

  const openEditar = (m: any) =>
    open(
      <FormularioMarcas key={`edit-${m.id}`} initialValues={m} mode="edit" />,
      `Editar marca: ${m.marca}`,
      { size: "md", position: "center" }
    );

  const confirmarEliminar = async (id: number, nombre: string) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Eliminar marca",
      html: `¿Seguro que deseas eliminar <b>${nombre}</b>?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    if (res.isConfirmed) {
      deleteMarca.mutate(id);
    }
  };

  // Render estados
  if (isPending) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">
        Cargando marcas…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar marcas
      </div>
    );
  }

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de marcas
        </h3>

        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Marca
        </button>
      </div>

      <div className="relative overflow-x-auto max-w-full px-4">

        <table className="table table-zebra table-pin-rows">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th className="w-12">#</th>
              <th className="py-4">Marca</th>
              <th className="py-4 text-right pr-6">Acciones</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {visible.map((m: any, idx: number) => (
              <tr key={m.id ?? `${start + idx}`} className="transition-colors">
                <th className="text-base-content/50">{m.id}</th>
                <td className="font-medium">{m.marca ?? "—"}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm bg-white btn-circle"
                      onClick={() => openEditar(m)}
                      title="Editar"
                    >
                      <Pen size="18px" color="green" />
                    </button>
                    <button
                      className="btn btn-sm bg-white btn-circle"
                      onClick={() => confirmarEliminar(Number(m.id), m.marca)}
                      title="Eliminar"
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
              <th></th>
              <th>Marca</th>
              <th className="text-right pr-6">Acciones</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {marcas.length === 0 ? 0 : start + 1}–{end} de {marcas.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            className={btnGhost}
            onClick={goPrev}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            «
          </button>

          {items.map((it, idx) =>
            it === "..." ? (
              <span key={`e-${idx}`} className={btnEllipsis}>
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
            aria-label="Página siguiente"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaMarcas;
