// src/components/clientes/TablaCumpleanos.tsx
import React from "react";
import { useCumpleanosClientes } from "../../services/cumpleanosServices";
import { useLoaderStore } from "../../store/loader.store";
import { buildFullName } from "../../utils/fullName";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";

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

const fullName = buildFullName;

const estadoTexto = (r: any) => {
  if (r?.days_until === 0) return "🎉 Hoy cumple";
  return r?.has_had_birthday
    ? `✅ Ya cumplió (${r?.days_until} días para el próximo)`
    : `🎂 Faltan ${r?.days_until} días`;
};

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

  const columns: DataTableColumn<any>[] = [
    { key: "cedula", header: "Cédula", render: (r) => r.cedula },
    { key: "nombre", header: "Nombre", render: (r) => fullName(r) },
    { key: "fecha_nacimiento", header: "F. Nacimiento", render: (r) => r.fecha_nacimiento || "—" },
    { key: "edad", header: "Edad", render: (r) => r.age_this_year ?? "—" },
    { key: "dias", header: "Días hasta cumple", render: (r) => r.days_until ?? "—" },
    { key: "estado", header: "Estado", render: (r) => estadoTexto(r) },
  ];

  return (
    <DataTable
      theadVariant="plain"
      toolbar={
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:w-auto">
          <input
            className="input input-bordered w-full sm:w-auto sm:flex-1 sm:min-w-48 sm:max-w-[16rem]"
            placeholder="Buscar por cédula..."
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query.refetch()}
          />

          <select
            className="select select-bordered w-full sm:w-auto sm:min-w-40]"
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
            className="select select-bordered w-full sm:w-auto sm:min-w-40"
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
      }
      columns={columns}
      rows={rows}
      rowKey={(r) => r.cedula}
      isLoading={query.isLoading}
      isError={false}
      emptyMessage="No hay resultados."
      pagination={{
        page,
        totalPages: lastPage,
        totalItems: total,
        pageSize: perPage,
        onPageChange: setPage,
        onPageSizeChange: (v) => {
          setPerPage(v);
          setPage(1);
        },
        pageSizeOptions: [10, 20, 50],
        isFetching: query.isFetching,
        variant: "simple",
      }}
    />
  );
};

export default TablaCumpleanos;
