import React from "react";
import FormularioUsuarios from "./FormularioUsuarios";
import { useModalStore } from "../../store/modalStore";
import { useUsuarios, type UserFilters } from "../../services/usersServices";
import UsuarioEstadoAlert from "./UsuarioEstadoAlert";
import { Pen } from "lucide-react";
import { useLoaderStore } from "../../store/loader.store";
import FiltrosUsuarios from "./FiltrosUsuarios";
import { fmtFechaSolo } from "../../utils/date";
import { PAGE_SIZE } from "../../constants/pagination";
import { useDebouncedValue } from "../../shared/hooks/useDebounce";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";

const TablaUsuarios: React.FC = () => {
  const open = useModalStore((s) => s.open);

  // ✅ server pagination
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(PAGE_SIZE);

  // ✅ filtros
  const [filters, setFilters] = React.useState<UserFilters>({
    q: "",
    rol: "",
    state: "",
  });

  // ✅ debounce para el buscador
  const debouncedQ = useDebouncedValue(filters.q ?? "", 300);

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

  const stateBadge = (s: string | number) => {
    const val = typeof s === "string" ? Number(s) : s;
    const isActive = val === 1;

    return (
      <span className={`badge ${isActive ? "badge-success" : "badge-error"}`}>
        {isActive ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const formatFecha = (f: string) => (!f || f === "0000-00-00" ? "—" : fmtFechaSolo(f) || f);

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

  const clearFilters = () => {
    setFilters({ q: "", rol: "", state: "" });
    setPerPage(PAGE_SIZE);
    setPage(1);
  };

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "#", className: "w-12", render: (u) => <span className="text-base-content/50">{u.id}</span> },
    {
      key: "nombre",
      header: "Nombre",
      render: (u) => (
        <>
          <div className="font-medium">{u.name ?? "—"}</div>
          <div className="text-xs text-base-content/50">{u.lastname ? u.lastname : "—"}</div>
        </>
      ),
    },
    { key: "username", header: "Usuario", render: (u) => u.username ?? "—" },
    {
      key: "rol",
      header: "Rol",
      render: (u) => <span className="badge badge-ghost badge-md">{u.rol ?? "—"}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      className: "flex gap-4",
      render: (u) => (
        <>
          <div className="w-16 min-w-16">{stateBadge(u.state)}</div>
          <UsuarioEstadoAlert id={Number(u.id)} currentState={u.state} />
        </>
      ),
    },
    { key: "cedula", header: "Cédula", render: (u) => u.cedula ?? "—" },
    { key: "fecha_exp", header: "Fecha exp.", render: (u) => formatFecha(u.fecha_exp) },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <button className="btn btn-sm bg-base-100 btn-circle" onClick={() => openEditar(u)}>
            <Pen color="green" size="20px" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      filters={
        <>
          <div className="pt-4">
            <FiltrosUsuarios
              q={filters.q ?? ""}
              rol={filters.rol ?? ""}
              state={(filters.state as any) ?? ""}
              roles={roles}
              onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
              onClear={clearFilters}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 flex-wrap my-3">
            <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
              Crear Usuario
            </button>
          </div>
        </>
      }
      tableClassName="min-w-255"
      columns={columns}
      rows={usuarios}
      rowKey={(u) => u.id}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar usuarios"
      emptyMessage="No hay resultados con esos filtros."
      pagination={{
        page: currentPage,
        totalPages: lastPage,
        totalItems: total,
        pageSize: perPage,
        onPageChange: setPage,
        onPageSizeChange: (v) => {
          setPerPage(v || PAGE_SIZE);
          setPage(1);
        },
        pageSizeOptions: [PAGE_SIZE, 50, 100],
        isFetching,
      }}
    />
  );
};

export default TablaUsuarios;
