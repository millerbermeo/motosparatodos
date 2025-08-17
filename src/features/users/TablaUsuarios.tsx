import React from "react";
import FormularioUsuarios from "./FormularioUsuarios";
import { useModalStore } from "../../store/modalStore";
import { useUsuarios } from "../../services/usersServices";
import UsuarioEstadoAlert from "./UsuarioEstadoAlert";
import { Pen } from "lucide-react";

// Paginación
const PAGE_SIZE = 5;
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

const TablaUsuarios: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { data, isPending, isError } = useUsuarios();

  // Asegura arreglo (cuando no hay data, usa [])
  const usuarios = Array.isArray(data) ? data : data ?? [];

  // Hooks SIEMPRE se ejecutan
  const [page, setPage] = React.useState(1);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(usuarios.length / PAGE_SIZE)),
    [usuarios.length]
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, usuarios.length);
  const visible = usuarios.slice(start, end);
  const items = getPaginationItems(page, totalPages);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

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
    open(<FormularioUsuarios />, "Crear usuario", {
      size: "4xl",
      position: "center",
    });

  const openEditar = (u: any) => {
    const initialValues = {
      ...u,
      state: typeof u.state === "string" ? Number(u.state) : u.state,
    };

    open(
      <FormularioUsuarios initialValues={initialValues} mode="edit" />,
      `Editar usuario: ${u.name}`,
      { size: "4xl", position: "center" }
    );
  };

  // Render condicional DESPUÉS de haber corrido todos los hooks
  if (isPending) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4">
        Cargando usuarios…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar usuarios
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Módulo de usuarios
        </h3>

        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Usuario
        </button>
      </div>

      <table className="table table-zebra table-pin-rows table-pin-cols">
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
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
          {visible.map((u: any, idx: number) => (
            <tr key={u.id ?? `${start + idx}`} className="transition-colors">
              <th className="text-base-content/50">{u.id}</th>
              <td>
                <div className="font-medium">{u.name ?? "—"}</div>
                <div className="text-xs text-base-content/50">
                  {u.lastname ? u.lastname : "—"}
                </div>
              </td>
              <td>{u.username ?? "—"}</td>
              <td>
                <span className="badge badge-ghost badge-md">
                  {u.rol ?? "—"}
                </span>
              </td>
              <td className="flex gap-4"><div className="w-16 min-w-16">{stateBadge(u.state)}</div>  <UsuarioEstadoAlert id={Number(u.id)} currentState={(u.state)} /></td>
              <td>{u.cedula ?? "—"}</td>
              <td>{formatFecha(u.fecha_exp)}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-sm bg-white btn-circle"
                    onClick={() => openEditar(u)}
                  >
                    <Pen color="green" size="20px"/>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="bg-base-200/60">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th></th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Cédula</th>
            <th>Fecha exp.</th>
            <th className="text-right pr-6">Acciones</th>
          </tr>
        </tfoot>
      </table>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {usuarios.length === 0 ? 0 : start + 1}–{end} de {usuarios.length}
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

export default TablaUsuarios;
