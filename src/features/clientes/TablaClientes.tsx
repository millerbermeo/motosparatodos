// src/components/clientes/TablaClientes.tsx
import React, { useState } from "react";
import { useClientes } from "../../services/clientesServices";
import { useLoaderStore } from "../../store/loader.store";

/* =======================
   Paginación (mismo estilo que cotizaciones)
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
    Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? Number(endPages[0]) - 2 : totalPages - 1
  );
  const items: (number | '...')[] = [];
  items.push(...startPages);
  if (siblingsStart > boundaryCount + 2) items.push('...');
  else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < totalPages - boundaryCount - 1) items.push('...');
  else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);
  items.push(...endPages);
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase = 'btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0';
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis = 'btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none';

/* =======================
   Utils de presentación
   ======================= */
const fullName = (r: any) =>
  [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || '—';

const formatDate = (date?: string) => {
  if (!date) return '—';
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : d.toLocaleDateString('es-CO');
};

/* =======================
   Componente principal
   ======================= */
const TablaClientes: React.FC = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [filters, setFilters] = useState({
    cedula: '',
    nombre: '',
  });

  const [search, setSearch] = useState('');

  /* 🔍 debounce simple para búsqueda por nombre */
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        nombre: search,
      }));
      setPage(1);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  const { data, isPending, isError, isFetching } = useClientes(page, perPage, filters);

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) {
      show();
    } else {
      hide();
    }
  }, [isPending, show, hide]);

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar clientes
      </div>
    );
  }

  const clientes = data?.data ?? [];

  const total = Number(data?.pagination?.total ?? clientes.length ?? 0) || 0;
  const serverPerPage = Number(data?.pagination?.per_page ?? perPage) || perPage;
  const currentPage = Number(data?.pagination?.current_page ?? page) || page;
  const lastPage = Number(
    data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage))
  );

  const items = React.useMemo(
    () => getPaginationItems(currentPage, lastPage),
    [currentPage, lastPage]
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

  const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
  const end = Math.min(currentPage * serverPerPage, total);

  const cleanFilters = () => {
    setFilters({ cedula: '', nombre: '' });
    setSearch('');
    setPage(1);
    setPerPage(10);
  };

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">

      <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-4 my-3">

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 flex-1 min-w-62.5">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="input input-bordered input-md min-w-45 max-w-50 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Filtrar por cédula"
            className="input input-bordered input-md min-w-45 max-w-50 flex-1"
            value={filters.cedula}
            onChange={(e) => {
              setFilters({ ...filters, cedula: e.target.value });
              setPage(1);
            }}
          />

          <button
            onClick={cleanFilters}
            className="btn btn-accent min-w-37.5"
          >
            Limpiar Filtros
          </button>
        </div>

        {/* Opciones de paginación */}
        <div className="flex flex-wrap items-center gap-3 min-w-55 justify-end">
          <label className="text-xs opacity-70">Filas:</label>
          <select
            className="select select-accent select-sm select-bordered w-20"
            value={serverPerPage}
            onChange={(e) => {
              const v = Number(e.target.value) || 10;
              setPerPage(v);
              setPage(1);
            }}
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


      <div className="relative overflow-x-auto max-w-full px-4">
        <table className="table table-zebra table-pin-rows min-w-250">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th>Item</th>
              <th>Codigo</th>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Nacimiento</th>
              <th>Creación</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">

            {clientes.map((c: any, i: number) => {
              const index = (currentPage - 1) * serverPerPage + i + 1;

              return (
                <tr key={c.id} className="transition-colors">
                  <td className="text-sm font-semibold text-base-content/70">{index}</td>

                  <td className="text-sm text-base-content/70">{c?.id || '—'}</td>
                  <td className="text-sm text-base-content/70">{c.cedula || '—'}</td>
                  <td className="font-medium">{fullName(c)}</td>
                  <td className="text-sm text-base-content/70">{c.celular || ''}</td>
                  <td className="text-sm text-base-content/70">{c.email || '—'}</td>
                  <td className="text-sm text-base-content/70">{formatDate(c.fecha_nacimiento)}</td>
                  <td className="text-sm text-base-content/70">{formatDate(c.fecha_creacion)}</td>
                </tr>
              );
            })}

            {!isPending && clientes.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-5 opacity-60">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {start}–{end} de {total}
        </span>

        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
            «
          </button>
          {items.map((it, i) =>
            it === '...' ? (
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
          <button className={btnGhost} onClick={goNext} disabled={currentPage === lastPage}>
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaClientes;