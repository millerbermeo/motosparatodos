import React from "react";
import FormularioUsuarios from "./FormularioUsuarios";
import { useModalStore } from "../../store/modalStore";
import { useUsuarios } from "../../services/usersServices";

type Row = {
  id: number;
  name: string;
  job: string;
  color: string;
  avatar: string;
};

const PAGE_SIZE = 5; // 👈 cámbialo si quieres más/menos filas por página
const SIBLING_COUNT = 1; // números alrededor de la página actual
const BOUNDARY_COUNT = 1; // cuántos mostrar al inicio/fin

// Utilidad para crear rangos numéricos
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Devuelve un arreglo como: [1, 2, 3, "...", 10]
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

  // Inicio
  items.push(...startPages);
  // Ellipsis después del inicio
  if (siblingsStart > boundaryCount + 2) {
    items.push("...");
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  // Zona media
  items.push(...range(siblingsStart, siblingsEnd));

  // Ellipsis antes del final
  if (siblingsEnd < totalPages - boundaryCount - 1) {
    items.push("...");
  } else if (totalPages - boundaryCount > boundaryCount) {
    items.push(totalPages - boundaryCount);
  }

  // Fin
  items.push(...endPages);

  // Limpieza por si se repiten números
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} btn-primary text-primary-content`;
const btnEllipsis =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const TablaUsuarios: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // 🔹 MOCK de datos (puedes reemplazar con los que vienen de tu servicio)
  const rows: Row[] = React.useMemo(() => {
    const jobs = [
      "Quality Control Specialist",
      "Desktop Support Technician",
      "Tax Accountant",
      "UI/UX Designer",
      "DevOps Engineer",
      "Product Manager",
    ];
    const colors = ["Blue", "Purple", "Red", "Green", "Yellow", "Orange"];
    return Array.from({ length: 32 }, (_, i) => ({
      id: i + 1,
      name: `Usuario ${i + 1}`,
      job: jobs[i % jobs.length],
      color: colors[i % colors.length],
      avatar: `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
    }));
  }, []);

  // Estado de paginación
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  // Si cambia el total y la página actual se sale de rango, corrígela
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Slice de filas visibles
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, rows.length);
  const visible = rows.slice(start, end);

  const items = getPaginationItems(page, totalPages);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));


    const {data, isPending, isError} = useUsuarios()

  if (isPending) {
      return "cargando usuarios"
  }

  if (isError) {
      return "error al caragar usuarios"
  }


  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4">
        <button
          className="btn bg-[#7DCEA0] text-white"
          onClick={() =>
            open(<FormularioUsuarios />, "Crear usuario", {
              size: "4xl",
              position: "center",
            })
          }
        >
          Crear Usuario
        </button>

        <h3 className="text-sm font-semibold tracking-wide text-base-content/70 mt-5">
          Modulo de usuarios
        </h3>
      </div>

      <table className="table table-zebra table-pin-rows table-pin-cols">
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th className="w-12">#</th>
            <th className="py-4">Name</th>
            <th className="py-4">Job</th>
            <th className="py-4">Favorite Color</th>
          </tr>
        </thead>

        <tbody className="[&>tr:hover]:bg-base-200/40">
          {visible.map((u) => (
            <tr key={u.id} className="transition-colors">
              <th className="text-base-content/50">{u.id}</th>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                      <img src={u.avatar} alt={u.name} />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-base-content/50">
                      ID: {String(u.id).padStart(3, "0")}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge badge-ghost badge-md">{u.job}</span>
              </td>
              <td>
                <span className="badge badge-outline">{u.color}</span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="bg-base-200/60">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {rows.length === 0 ? 0 : start + 1}–{end} de {rows.length}
        </span>

        {/* Pagination pills estilo screenshot */}
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

export default TablaUsuarios;
