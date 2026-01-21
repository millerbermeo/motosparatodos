import React from "react";
import FormularioUsuarios from "./FormularioUsuarios";
import { useModalStore } from "../../store/modalStore";
import { useUsuarios, type UserFilters } from "../../services/usersServices";
import UsuarioEstadoAlert from "./UsuarioEstadoAlert";
import { Pen } from "lucide-react";
import { useLoaderStore } from "../../store/loader.store";
import FiltrosUsuarios from "./FiltrosUsuarios";

// Paginación
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

  const items: (number | "...")[] = [];
  items.push(...startPages);

  if (siblingsStart > boundaryCount + 2) items.push("...");
  else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < totalPages - boundaryCount - 1) items.push("...");
  else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);

  items.push(...endPages);
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase = "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis = "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const TablaUsuarios: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // ✅ server pagination
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // ✅ filtros
  const [filters, setFilters] = React.useState<UserFilters>({
    q: "",
    rol: "",
    state: "",
  });

  // ✅ debounce para el buscador
  const [debouncedQ, setDebouncedQ] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q ?? ""), 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  // ✅ reset page cuando cambia filtro
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, filters.rol, filters.state, perPage]);

  const { data, isPending, isError, isFetching } = useUsuarios(page, perPage, {
    ...filters,
    q: debouncedQ,
  });

  const usuarios = data?.data ?? [];
  const roles = data?.roles ?? [];

  const total = Number(data?.pagination?.total ?? 0) || 0;
  const currentPage = Number(data?.pagination?.current_page ?? page) || page;
  const lastPage = Number(data?.pagination?.last_page ?? 1) || 1;

  const items = React.useMemo(
    () => getPaginationItems(currentPage, lastPage),
    [currentPage, lastPage]
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  const stateBadge = (s: string | number) => {
    const val = typeof s === "string" ? Number(s) : s;
    const isActive = val === 1;
    return (
      <span className={`badge ${isActive ? "badge-success" : "badge-error"}`}>
        {isActive ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const formatFecha = (f: string) => (!f || f === "0000-00-00" ? "—" : f);

  const openCrear = () =>
    open(<FormularioUsuarios key="create" />, "Crear usuario", {
      size: "4xl",
      position: "center",
    });

  const openEditar = (u: any) => {
    const initialValues = {
      ...u,
      state: typeof u.state === "string" ? Number(u.state) : u.state,
    };

    open(
      <FormularioUsuarios key={`edit-${u.id}`} initialValues={initialValues} mode="edit" />,
      `Editar usuario: ${u.name}`,
      { size: "4xl", position: "center" }
    );
  };

  // Loader global
  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar usuarios
      </div>
    );
  }

  const clearFilters = () => {
    setFilters({ q: "", rol: "", state: "" });
    setPerPage(10);
    setPage(1);
  };

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de usuarios
        </h3>

        <div className="flex items-center gap-3">
          <label className="text-xs opacity-70">Filas:</label>
          <select
            className="select select-accent select-sm select-bordered w-20"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value) || 10);
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
          <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
            Crear Usuario
          </button>
        </div>
      </div>

      {/* ✅ FILTROS */}
      <div className="px-4 pb-3">
        <FiltrosUsuarios
          q={filters.q ?? ""}
          rol={filters.rol ?? ""}
          state={(filters.state as any) ?? ""}
          roles={roles}
          onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
          onClear={clearFilters}
        />
      </div>

      <div className="relative overflow-x-auto max-w-full px-4">
        <table className="table table-zebra table-pin-rows min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th className="w-12">#</th>
              <th className="py-4">Nombre</th>
              <th className="py-4">Usuario</th>
              <th className="py-4">Rol</th>
              <th className="py-4">Estado</th>
              <th className="py-4">Cédula</th>
              <th className="py-4">Fecha exp.</th>
              <th className="py-4 text-right pr-6">Acciones</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {usuarios.map((u: any) => (
              <tr key={u.id} className="transition-colors">
                <th className="text-base-content/50">{u.id}</th>
                <td>
                  <div className="font-medium">{u.name ?? "—"}</div>
                  <div className="text-xs text-base-content/50">
                    {u.lastname ? u.lastname : "—"}
                  </div>
                </td>
                <td>{u.username ?? "—"}</td>
                <td>
                  <span className="badge badge-ghost badge-md">{u.rol ?? "—"}</span>
                </td>
                <td className="flex gap-4">
                  <div className="w-16 min-w-16">{stateBadge(u.state)}</div>
                  <UsuarioEstadoAlert id={Number(u.id)} currentState={u.state} />
                </td>
                <td>{u.cedula ?? "—"}</td>
                <td>{formatFecha(u.fecha_exp)}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-sm bg-white btn-circle" onClick={() => openEditar(u)}>
                      <Pen color="green" size="20px" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!isPending && usuarios.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 opacity-70">
                  No hay resultados con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {start}–{end} de {total}
        </span>

        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
            «
          </button>

          {items.map((it, idx) =>
            it === "..." ? (
              <span key={`e-${idx}`} className={btnEllipsis}>…</span>
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

export default TablaUsuarios;
