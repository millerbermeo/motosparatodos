// TablaLineasMarcas.tsx
import React from "react";
import { useModalStore } from "../../store/modalStore";
import LineasMarcasFormulario from "./LineasMarcasFormulario";

type LineaMarca = {
  id: number;
  nombre: string;
  marcaId: string; // relación a la marca
};

// Lista estática de marcas (id -> nombre)
const marcasMoto = [
  { id: "1", nombre: "Yamaha" },
  { id: "2", nombre: "Honda" },
  { id: "3", nombre: "Suzuki" },
  { id: "4", nombre: "Kawasaki" },
  { id: "5", nombre: "Ducati" },
];

const PAGE_SIZE = 5;
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationItems(
  current: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1
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

const TablaLineasMarcas: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // 🔹 MOCK de líneas de marca (reemplaza por datos reales del backend)
  const rows: LineaMarca[] = React.useMemo(
    () =>
      Array.from({ length: 23 }, (_, i) => {
        const marca = marcasMoto[i % marcasMoto.length];
        return {
          id: i + 1,
          nombre: `Línea ${i + 1}`,
          marcaId: marca.id,
        };
      }),
    []
  );

  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, rows.length);
  const visible = rows.slice(start, end);

  const items = getPaginationItems(page, totalPages);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // helper para mostrar el nombre de la marca
  const getMarcaNombre = (id: string) =>
    marcasMoto.find((m) => m.id === id)?.nombre ?? "—";

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() =>
            open(<LineasMarcasFormulario />, "Crear línea de marca", {
              size: "lg",
              position: "center",
            })
          }
        >
          Crear Línea de Marca
        </button>
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de líneas de marca
        </h3>
      </div>

      <table className="table table-zebra">
        <caption className="sr-only">
          Listado paginado de líneas de marca con su marca asociada
        </caption>
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th className="w-12">#</th>
            <th className="py-4">Línea</th>
            <th className="py-4">Marca</th>
          </tr>
        </thead>

        <tbody className="[&>tr:hover]:bg-base-200/40">
          {visible.map((l) => (
            <tr key={l.id}>
              <td className="text-base-content/50">{l.id}</td>
              <td className="font-medium">{l.nombre}</td>
              <td>
                <span className="badge badge-outline">
                  {getMarcaNombre(l.marcaId)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="bg-base-200/60">
          <tr>
            <th></th>
            <th>Línea</th>
            <th>Marca</th>
          </tr>
        </tfoot>
      </table>

      {/* Footer de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 pb-4 pt-2">
          <span className="text-xs text-base-content/50">
            Mostrando {rows.length === 0 ? 0 : start + 1}–{end} de {rows.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
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
                  type="button"
                  aria-current={it === page ? "page" : undefined}
                  aria-label={`Ir a página ${it}`}
                  className={it === page ? btnActive : btnGhost}
                  onClick={() => goTo(Number(it))}
                >
                  {it}
                </button>
              )
            )}

            <button
              type="button"
              className={btnGhost}
              onClick={goNext}
              disabled={page === totalPages}
              aria-label="Página siguiente"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaLineasMarcas;
