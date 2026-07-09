// src/components/clientes/TablaClientes.tsx
import React, { useState } from "react";
import { useClientes } from "../../services/clientesServices";
import { useLoaderStore } from "../../store/loader.store";
import { fmtFechaSolo } from "../../utils/date";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";

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
  return fmtFechaSolo(date) || date;
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

  const clientes = data?.data ?? [];

  const total = Number(data?.pagination?.total ?? clientes.length ?? 0) || 0;
  const serverPerPage = Number(data?.pagination?.per_page ?? perPage) || perPage;
  const currentPage = Number(data?.pagination?.current_page ?? page) || page;
  const lastPage = Number(
    data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage))
  );

  const cleanFilters = () => {
    setFilters({ cedula: '', nombre: '' });
    setSearch('');
    setPage(1);
    setPerPage(10);
  };

  const columns: DataTableColumn<any>[] = [
    {
      key: "item",
      header: "Item",
      render: (_c, i) => (
        <span className="text-sm font-semibold text-base-content/70">
          {(currentPage - 1) * serverPerPage + i + 1}
        </span>
      ),
    },
    { key: "codigo", header: "Codigo", className: "text-sm text-base-content/70", render: (c) => c?.id || "—" },
    { key: "cedula", header: "Cédula", className: "text-sm text-base-content/70", render: (c) => c.cedula || "—" },
    { key: "nombre", header: "Nombre", className: "font-medium", render: (c) => fullName(c) },
    { key: "celular", header: "Teléfono", className: "text-sm text-base-content/70", render: (c) => c.celular || "" },
    { key: "email", header: "Email", className: "text-sm text-base-content/70", render: (c) => c.email || "—" },
    {
      key: "fecha_nacimiento",
      header: "Nacimiento",
      className: "text-sm text-base-content/70",
      render: (c) => formatDate(c.fecha_nacimiento),
    },
    {
      key: "fecha_creacion",
      header: "Creación",
      className: "text-sm text-base-content/70",
      render: (c) => formatDate(c.fecha_creacion),
    },
  ];

  return (
    <DataTable
      toolbar={
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:flex-1 lg:min-w-0">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="input input-bordered input-md w-full sm:w-auto sm:flex-1 sm:min-w-44 sm:max-w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Filtrar por cédula"
            className="input input-bordered input-md w-full sm:w-auto sm:flex-1 sm:min-w-44 sm:max-w-56"
            value={filters.cedula}
            onChange={(e) => {
              setFilters({ ...filters, cedula: e.target.value });
              setPage(1);
            }}
          />

          <button onClick={cleanFilters} className="btn btn-accent w-full sm:w-auto sm:min-w-36">
            Limpiar Filtros
          </button>
        </div>
      }
      tableClassName="min-w-250"
      columns={columns}
      rows={clientes}
      rowKey={(c) => c.id}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar clientes"
      emptyMessage="Sin resultados"
      pagination={{
        page: currentPage,
        totalPages: lastPage,
        totalItems: total,
        pageSize: serverPerPage,
        onPageChange: setPage,
        onPageSizeChange: (v) => {
          setPerPage(v);
          setPage(1);
        },
        pageSizeOptions: [10, 20, 50],
        isFetching,
      }}
    />
  );
};

export default TablaClientes;
