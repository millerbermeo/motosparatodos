// TablaMotos.tsx
import React from "react";
import { useModalStore } from "../../store/modalStore";
import MotosFormulario from "./MotosFormulario";

// Reutilizamos las listas estáticas para mostrar nombres en la tabla
const marcas = [
  { id: "1", nombre: "Yamaha" },
  { id: "2", nombre: "Honda" },
  { id: "3", nombre: "Suzuki" },
  { id: "4", nombre: "Kawasaki" },
  { id: "5", nombre: "Ducati" },
];

const lineasPorMarca: Record<string, { id: string; nombre: string }[]> = {
  "1": [
    { id: "y-1", nombre: "YZF-R3" },
    { id: "y-2", nombre: "FZ 2.0" },
  ],
  "2": [
    { id: "h-1", nombre: "WAVE 110S" },
    { id: "h-2", nombre: "CB 125F" },
  ],
  "3": [
    { id: "s-1", nombre: "Gixxer 150" },
    { id: "s-2", nombre: "V-Strom 250" },
  ],
  "4": [
    { id: "k-1", nombre: "Ninja 400" },
    { id: "k-2", nombre: "Z400" },
  ],
  "5": [
    { id: "d-1", nombre: "Monster" },
    { id: "d-2", nombre: "Scrambler" },
  ],
};

const empresas = [
  { id: "em-1", nombre: "Empresa A" },
  { id: "em-2", nombre: "Empresa B" },
  { id: "em-3", nombre: "Empresa C" },
];

type MotoRow = {
  id: number;
  marcaId: string;
  lineaId: string;
  modelo: string;
  precioBase: number;
  empresaId: string;
  imagenUrl?: string;
};

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

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const getNombre = (arr: { id: string; nombre: string }[], id: string) =>
  arr.find((x) => x.id === id)?.nombre ?? "—";

const getLineaNombre = (marcaId: string, lineaId: string) =>
  lineasPorMarca[marcaId]?.find((l) => l.id === lineaId)?.nombre ?? "—";

const TablaMotos: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // 🔹 MOCK de datos (reemplaza con fetch a tu API)
  const rows: MotoRow[] = React.useMemo(() => {
    const mock: MotoRow[] = [];
    for (let i = 1; i <= 21; i++) {
      const m = marcas[(i - 1) % marcas.length];
      const linea = lineasPorMarca[m.id][(i - 1) % lineasPorMarca[m.id].length];
      const empresa = empresas[(i - 1) % empresas.length];
      mock.push({
        id: i,
        marcaId: m.id,
        lineaId: linea.id,
        modelo: String(2025 - ((i - 1) % 6)), // 2025..2020
        precioBase: 4500000 + i * 250000,
        empresaId: empresa.id,
        imagenUrl: i % 3 === 0 ? `https://picsum.photos/seed/moto${i}/80/80` : undefined,
      });
    }
    return mock;
  }, []);

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

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() =>
            open(<MotosFormulario />, "Crear moto", {
              size: "4xl",
              position: "center",
            })
          }
        >
          Crear Moto
        </button>
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de motos
        </h3>
      </div>

      <table className="table table-zebra">
        <caption className="sr-only">
          Listado paginado de motos con marca, línea, modelo, precio base y empresa
        </caption>
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th className="w-12">#</th>
            <th className="py-4">Imagen</th>
            <th className="py-4">Marca</th>
            <th className="py-4">Línea</th>
            <th className="py-4">Modelo</th>
            <th className="py-4">Precio base</th>
            <th className="py-4">Empresa</th>
          </tr>
        </thead>

        <tbody className="[&>tr:hover]:bg-base-200/40">
          {visible.map((m) => (
            <tr key={m.id} className="transition-colors">
              <td className="text-base-content/50">{m.id}</td>
              <td>
                {m.imagenUrl ? (
                  <img
                    src={m.imagenUrl}
                    alt={`Moto ${m.id}`}
                    loading="lazy"
                    className="h-12 w-12 object-cover rounded-xl border border-base-300"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-base-200 grid place-content-center text-base-content/40">
                    —
                  </div>
                )}
              </td>
              <td className="font-medium">{getNombre(marcas, m.marcaId)}</td>
              <td>{getLineaNombre(m.marcaId, m.lineaId)}</td>
              <td>
                <span className="badge badge-ghost">{m.modelo}</span>
              </td>
              <td>{fmtCOP(m.precioBase)}</td>
              <td>
                <span className="badge badge-outline">
                  {getNombre(empresas, m.empresaId)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="bg-base-200/60">
          <tr>
            <th></th>
            <th>Imagen</th>
            <th>Marca</th>
            <th>Línea</th>
            <th>Modelo</th>
            <th>Precio base</th>
            <th>Empresa</th>
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

export default TablaMotos;
