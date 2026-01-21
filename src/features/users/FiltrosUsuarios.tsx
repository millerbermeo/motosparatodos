import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";

type Props = {
  q: string;
  rol: string;
  state: "" | "1" | "0";
  roles: string[];
  onChange: (next: { q?: string; rol?: string; state?: "" | "1" | "0" }) => void;
  onClear: () => void;
};

const FiltrosUsuarios: React.FC<Props> = ({
  q,
  rol,
  state,
  roles,
  onChange,
  onClear,
}) => {
  const hasFilters = Boolean((q ?? "").trim() || rol || state);

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-base-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
          <Filter size={16} />
          Filtros
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className={`btn btn-sm rounded-xl ${
            hasFilters ? "btn-accent" : "btn-ghost opacity-50 pointer-events-none"
          }`}
          title="Limpiar filtros"
        >
          <RotateCcw size={16} />
          Limpiar
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {/* ✅ todo alineado a la izquierda + responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          {/* Buscar */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold text-base-content/70">
                Buscar
              </span>
            </label>

            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                <Search size={16} />
              </span>
              <input
                className="input input-bordered w-full pl-9 rounded-xl bg-base-100"
                value={q}
                placeholder="name, username, lastname o phone..."
                onChange={(e) => onChange({ q: e.target.value })}
              />
            </div>
          </div>

          {/* Rol */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold text-base-content/70">
                Rol
              </span>
            </label>
            <select
              className="select select-bordered w-full rounded-xl bg-base-100"
              value={rol}
              onChange={(e) => onChange({ rol: e.target.value })}
            >
              <option value="">Todos</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold text-base-content/70">
                Estado
              </span>
            </label>
            <select
              className="select select-bordered w-full rounded-xl bg-base-100"
              value={state}
              onChange={(e) => onChange({ state: e.target.value as any })}
            >
              <option value="">Todos</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Footer mini: chips opcionales (bonito y útil) */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 justify-start">
            {(q ?? "").trim() && (
              <span className="badge badge-outline rounded-xl">
                Buscar: {(q ?? "").trim()}
              </span>
            )}
            {rol && (
              <span className="badge badge-outline rounded-xl">
                Rol: {rol}
              </span>
            )}
            {state && (
              <span className="badge badge-outline rounded-xl">
                Estado: {state === "1" ? "Activo" : "Inactivo"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosUsuarios;
