// src/components/clientes/TablaClientes.tsx
import React from "react";
import { useClientes, useClienteByCedula } from "../../services/clientesServices";
import { useLoaderStore } from "../../store/loader.store";

/* =======================
   Paginación (igual a cotizaciones)
   ======================= */
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
    endPages.length > 0 ? Number(endPages[0]) - 2 : totalPages - 1
  );
  const items: (number | "...")[] = [];
  items.push(...startPages);
  if (siblingsStart > boundaryCount + 2) items.push("...");
  else if (boundaryCount + 1 < totalPages - boundaryCount)
    items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < totalPages - boundaryCount - 1) items.push("...");
  else if (totalPages - boundaryCount > boundaryCount)
    items.push(totalPages - boundaryCount);
  items.push(...endPages);
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

/* =======================
   Utils de presentación
   ======================= */
const fullName = (r: any) =>
  [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim() || "—";

const humanizeDesde = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T")); // "YYYY-MM-DD HH:mm:ss"
  if (isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "justo ahora";

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hrs > 0) return `hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  if (min > 0) return `hace ${min} minuto${min > 1 ? "s" : ""}`;
  return "justo ahora";
};

const formatFechaLarga = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  const fmt = new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    // timeZone: 'America/Bogota',
  });
  return fmt.format(d);
};

/* =======================
   Componente principal
   ======================= */
const TablaClientes: React.FC = () => {
  // paginación (server-side)
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // ✅ BÚSQUEDA CONTROLADA POR CLICK/ENTER
  // - cedulaInput: lo que escribe el usuario
  // - cedulaQuery: se setea al hacer click en "Buscar" o presionar Enter
  const [cedulaInput, setCedulaInput] = React.useState("");
  const [cedulaQuery, setCedulaQuery] = React.useState("");

  // queries
  const listQuery = useClientes(page, perPage);           // lista paginada
  const detailQuery = useClienteByCedula(cedulaQuery);    // último por cédula

  // modo detalle activo solo si hay query >= 3 chars
  const isDetail = cedulaQuery.trim().length >= 3;

  // elegir cuál query usar para UI
  const { isLoading, isError, isFetching, data } = isDetail ? detailQuery : listQuery;

  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  // 🔁 Si salimos de detalle (o cambia paginación), refrescar lista
  React.useEffect(() => {
    if (!isDetail) {
      listQuery.refetch();
    }
  }, [isDetail, page, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Normaliza rows
  const rows = React.useMemo(() => {
    if (isDetail) return data ? [data as any] : [];
    const wrapper = listQuery.data;
    return (wrapper?.data as any[]) ?? [];
  }, [isDetail, data, listQuery.data]);

  // Paginación visible (en modo detalle se oculta)
  const total = isDetail ? rows.length : Number(listQuery.data?.pagination?.total ?? rows.length ?? 0) || 0;
  const serverPerPage = isDetail ? rows.length : Number(listQuery.data?.pagination?.per_page ?? perPage) || perPage;
  const currentPage = isDetail ? 1 : Number(listQuery.data?.pagination?.current_page ?? page) || page;
  const lastPage = isDetail ? 1 : Number(listQuery.data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage)));

  const items = React.useMemo(() => getPaginationItems(currentPage, lastPage), [currentPage, lastPage]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

  const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
  const end = Math.min(currentPage * serverPerPage, total);

  // Handlers búsqueda
  const onBuscar = () => {
    const q = cedulaInput.trim();
    if (q.length >= 3) {
      setCedulaQuery(q);             // entra a detalle
    } else {
      setCedulaQuery("");            // vuelve a lista
      setTimeout(() => listQuery.refetch(), 0); // refresco inmediato opcional
    }
    setPage(1);
  };

  const onKeyDownEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onBuscar();
  };

  const onChangeCedula = (v: string) => {
    setCedulaInput(v);
    // Si el usuario borra todo, salir de detalle y refrescar lista
    if (v.trim() === "" && cedulaQuery !== "") {
      setCedulaQuery("");
      setTimeout(() => listQuery.refetch(), 0);
    }
  };

  const cleanFilters = () => {
    setCedulaInput("");
    setCedulaQuery("");   // vuelve a modo lista
    setPage(1);
    setPerPage(10);
    setTimeout(() => listQuery.refetch(), 0); // refresco inmediato
  };

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      {/* Header de filtros/acciones */}
      <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-4 my-3">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 flex-1 min-w-[280px]">
          <div className="join">
            <input
              className="input input-bordered join-item w-64"
              placeholder="Buscar por cédula..."
              value={cedulaInput}
              onChange={(e) => onChangeCedula(e.target.value)}  // ✅ no dispara búsqueda
              onKeyDown={onKeyDownEnter}                        // ✅ Enter también busca
            />
            <button
              className="btn join-item"
              onClick={onBuscar}                                 // ✅ SOLO busca al hacer click
              disabled={cedulaInput.trim().length === 0}
            >
              Buscar
            </button>
          </div>

          <button onClick={cleanFilters} className="btn btn-accent min-w-[150px]">
            Limpiar Filtros
          </button>
        </div>

        {/* Paginación y acciones */}
        <div className="flex flex-wrap items-center gap-3 min-w-[220px] justify-end">
          <label className="text-xs opacity-70">Filas:</label>
          <select
            className="select select-accent select-sm select-bordered w-20"
            value={serverPerPage}
            onChange={(e) => {
              const v = Number(e.target.value) || 10;
              setPerPage(v);
              setPage(1);
            }}
            disabled={isDetail} // en detalle se deshabilita
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {isFetching && <span className="loading loading-spinner loading-xs" />}
        </div>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto max-w-full px-4">
        <table className="table table-zebra table-pin-rows min-w-[1000px]">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th>Item</th>
              <th>Cédula</th>
              <th>Nombre cliente</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>F. Nacimiento</th>
              <th>Creado</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {isError && (
              <tr>
                <td colSpan={7} className="p-4 text-error">
                  Error al cargar clientes
                </td>
              </tr>
            )}

            {!isError && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-base-content/60">
                  No hay clientes para mostrar.
                </td>
              </tr>
            )}

            {rows.map((r: any) => (
              <tr key={`${r.cedula}-${r.id}`} className="transition-colors">
                <td className="text-sm text-base-content/70">{r?.id ?? "—"}</td>
                <td className="font-medium">{r?.cedula ?? "—"}</td>
                <td className="font-medium">{fullName(r)}</td>
                <td className="text-sm text-base-content/70">{r?.celular ?? ""}</td>
                <td className="text-sm text-base-content/70">{r?.email ?? ""}</td>
                <td className="text-sm text-base-content/70">
                  {r?.fecha_nacimiento ?? "—"}
                </td>
                <td className="text-sm text-base-content/70 whitespace-nowrap">
                  {humanizeDesde(r?.fecha_creacion)} · {formatFechaLarga(r?.fecha_creacion)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer de paginación */}
      {!isDetail && (
        <div className="flex items-center justify-between px-4 pb-4 pt-2">
          <span className="text-xs text-base-content/50">
            Mostrando {start}–{end} de {total}
          </span>

          <div className="flex items-center gap-2">
            <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
              «
            </button>
            {items.map((it, i) =>
              it === "..." ? (
                <span key={`e-${i}`} className={btnEllipsis}>
                  …
                </span>
              ) : (
                <button
                  key={`p-${it}`}
                  className={Number(it) === currentPage ? btnActive : btnGhost}
                  onClick={() => goTo(Number(it))}
                >
                  {it}
                </button>
              )
            )}
            <button
              className={btnGhost}
              onClick={goNext}
              disabled={currentPage === lastPage}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaClientes;
