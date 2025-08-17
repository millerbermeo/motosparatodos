import React from "react";
import { Pen, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useLineas, useDeleteLinea } from "../../services/lineasMarcasServices";
import Swal from "sweetalert2";
import FormularioLineas from "./forms/FormularioLineas";

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

const TablaLineas: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { data, isPending, isError } = useLineas();
  const deleteLinea = useDeleteLinea();

  const lineas = Array.isArray(data) ? data : data ?? [];

  const [page, setPage] = React.useState(1);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(lineas.length / PAGE_SIZE)),
    [lineas.length]
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, lineas.length);
  const visible = lineas.slice(start, end);
  const items = getPaginationItems(page, totalPages);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // 👉 key para remount y evitar “datos pegados”
  const openCrear = () =>
    open(<FormularioLineas key="create" />, "Crear línea", { size: "lg", position: "center" });

  const openEditar = (l: any) =>
    open(
      <FormularioLineas key={`edit-${l.id}`} initialValues={l} mode="edit" />,
      `Editar línea: ${l.marca} - ${l.linea}`,
      { size: "lg", position: "center" }
    );

  const confirmarEliminar = async (id: number, nombre: string) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Eliminar línea",
      html: `¿Seguro que deseas eliminar <b>${nombre}</b>?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    if (res.isConfirmed) deleteLinea.mutate(id);
  };

  // Render estados
  if (isPending) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">
        Cargando líneas…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar líneas
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de líneas
        </h3>

        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Línea
        </button>
      </div>

      <table className="table table-zebra table-pin-rows table-pin-cols">
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th className="w-12">#</th>
            <th className="py-4">Marca</th>
            <th className="py-4">Línea</th>
            <th className="py-4 text-right pr-6">Acciones</th>
          </tr>
        </thead>

        <tbody className="[&>tr:hover]:bg-base-200/40">
          {visible.map((l: any, idx: number) => (
            <tr key={l.id ?? `${start + idx}`} className="transition-colors">
              <th className="text-base-content/50">{l.id}</th>
              <td className="font-medium">{l.marca ?? "—"}</td>
              <td className="font-medium">{l.linea ?? "—"}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-sm bg-white btn-circle"
                    onClick={() => openEditar(l)}
                    title="Editar"
                  >
                    <Pen size="18px" color="green" />
                  </button>
                  <button
                    className="btn btn-sm bg-white btn-circle"
                    onClick={() => confirmarEliminar(Number(l.id), `${l.marca} ${l.linea}`)}
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
            <th>Línea</th>
            <th className="text-right pr-6">Acciones</th>
          </tr>
        </tfoot>
      </table>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {lineas.length === 0 ? 0 : start + 1}–{end} de {lineas.length}
        </span>

        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={goPrev} disabled={page === 1} aria-label="Página anterior">
            «
          </button>

          {items.map((it, idx) =>
            it === "..." ? (
              <span key={`e-${idx}`} className={btnEllipsis}>…</span>
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

export default TablaLineas;
