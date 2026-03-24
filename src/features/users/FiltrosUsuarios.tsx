import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import InputFilter from "../../shared/components/InputFilter";
import SelectFilter from "../../shared/components/SelectFilter";

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
    <div className="bg-linear-to-r from-slate-50 to-slate-100 border border-info rounded-2xl shadow-sm">
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
          className={`btn btn-sm rounded-xl ${hasFilters ? "btn-accent" : "btn-ghost opacity-50 pointer-events-none"
            }`}
        >
          <RotateCcw size={16} />
          Limpiar
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

          {/* Buscar */}
          <InputFilter
            label="Buscar"
            value={q}
            placeholder="name, username, lastname o phone..."
            icon={<Search size={16} />}
            onChange={(value) => onChange({ q: value })}
          />

          {/* Rol */}
          <SelectFilter
            label="Rol"
            value={rol}
            options={roles.map((r) => ({
              label: r,
              value: r,
            }))}
            onChange={(value) => onChange({ rol: value })}
          />

          {/* Estado */}
          <SelectFilter
            label="Estado"
            value={state}
            options={[
              { label: "Activo", value: "1" },
              { label: "Inactivo", value: "0" },
            ]}
            onChange={(value) => onChange({ state: value as any })}
          />
        </div>

        {/* Chips */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 justify-start">
            {q?.trim() && (
              <span className="badge badge-outline rounded-xl">
                Buscar: {q.trim()}
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