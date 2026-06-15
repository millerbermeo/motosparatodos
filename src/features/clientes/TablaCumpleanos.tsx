// src/components/clientes/TablaCumpleanos.tsx
import React from "react";
import { useCumpleanosClientes } from "../../services/cumpleanosServices";
import { useLoaderStore } from "../../store/loader.store";

const meses = [
  { value: "", label: "Todos" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const estados = [
  { value: "", label: "Todos" },
  { value: "cumplidos", label: "Cumplidos" },
  { value: "por_cumplir", label: "Por cumplir" },
];

const TablaCumpleanos: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [cedula, setCedula] = React.useState("");
  const [month, setMonth] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");

  const { show, hide } = useLoaderStore();

  const query = useCumpleanosClientes(page, perPage, {
    cedula: cedula.trim() || undefined,
    month: month ? Number(month) : undefined,
    status: status as any,
  });

  React.useEffect(() => {
    if (query.isLoading) show();
    else hide();
  }, [query.isLoading, show, hide]);

  const cleanFilters = () => {
    setCedula("");
    setMonth("");
    setStatus("");
    setPage(1);
    setTimeout(() => query.refetch(), 0);
  };

  // 🔧 Normaliza data a arreglo SIEMPRE para evitar el union type (ClienteCumple | ClienteCumple[])
  const rows = React.useMemo(() => {
    const d = query.data?.data as unknown;
    if (Array.isArray(d)) return d;
    return d ? [d] : [];
  }, [query.data]);

  const total = query.data?.pagination?.total ?? rows.length;
  const lastPage = query.data?.pagination?.last_page ?? 1;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));

  const fullName = (r: any) =>
    [r?.name, r?.s_name, r?.last_name, r?.s_last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "—";

  const estadoTexto = (r: any) => {
    if (r?.days_until === 0) return "🎉 Hoy cumple";
    return r?.has_had_birthday
      ? `✅ Ya cumplió (${r?.days_until} días para el próximo)`
      : `🎂 Faltan ${r?.days_until} días`;
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl N">
      {/* Header filtros */}
      <div className="p-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:w-auto">
          <input
            className="input input-bordered w-full sm:w-auto sm:flex-1 sm:min-w-[12rem] sm:max-w-[16rem]"
            placeholder="Buscar por cédula..."
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query.refetch()}
          />

          <select
            className="select select-bordered w-full sm:w-auto sm:min-w-[10rem]"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
          >
            {meses.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full sm:w-auto sm:min-w-[10rem]"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {estados.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            Buscar
          </button>

          <button className="btn btn-accent w-full sm:w-auto" onClick={cleanFilters}>
            Limpiar
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <label className="text-xs opacity-70">Filas:</label>
          <select
            className="select select-accent select-sm select-bordered w-20"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {query.isFetching && (
            <span className="loading loading-spinner loading-xs" />
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto px-4">
        <table className="table table-zebra">
          <thead className="bg-[#3498DB] text-white">
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>F. Nacimiento</th>
              <th>Edad</th>
              <th>Días hasta cumple</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-base-content/60">
                  No hay resultados.
                </td>
              </tr>
            )}

            {rows.map((r: any) => (
              <tr key={r.cedula}>
                <td>{r.cedula}</td>
                <td>{fullName(r)}</td>
                <td>{r.fecha_nacimiento || "—"}</td>
                <td>{r.age_this_year ?? "—"}</td>
                <td>{r.days_until ?? "—"}</td>
                <td>{estadoTexto(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer paginación */}
      <div className="flex justify-between items-center p-4">
        <span className="text-xs opacity-70">
          Página {page} de {lastPage} — Total: {total}
        </span>

        <div className="join">
          <button
            className="btn join-item"
            onClick={goPrev}
            disabled={page === 1}
          >
            «
          </button>
          <button
            className="btn join-item"
            onClick={goNext}
            disabled={page === lastPage}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaCumpleanos;
