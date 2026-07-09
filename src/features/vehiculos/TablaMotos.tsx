// src/components/motos/TablaMotos.tsx
import React from "react";
import { Banknote, Pen, Percent, Trash2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import {
  useMotos,
  useDeleteMoto,
  useToggleEstadoMoto,
  useMotoFilterOptions,
  type MotoFilters,
} from "../../services/motosServices";
import Swal from "sweetalert2";
import FormularioMotos from "./forms/FormularioMotos";
import ImpuestosMotosFormulario from "./forms/ImpuestosMotosFormulario";
import DescuentosMotosFormulario from "./forms/DescuentosMotosFormulario";
import { useLoaderStore } from "../../store/loader.store";
import { PAGE_SIZE } from "../../constants/pagination";
import { BASE_URL } from "../../utils/url";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { confirmDelete } from "../../utils/confirmDelete";

const TablaMotos: React.FC = () => {
  const open = useModalStore((s) => s.open);

  const [filters, setFilters] = React.useState<MotoFilters>({
    marca: "",
    linea: "",
    modelo: "",
    empresa: "",
    estado: "",
  });

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filters.marca, filters.linea, filters.modelo, filters.empresa, filters.estado]);

  const { data, isPending, isError, isFetching } = useMotos(filters, page, perPage);
  const deleteMoto = useDeleteMoto();
  const toggleEstado = useToggleEstadoMoto();

  // ✅ Opciones desde toda la BD (no cambian al paginar)
  const { data: filterOptions } = useMotoFilterOptions();
  const marcaOptions = filterOptions?.marcas ?? [];
  const lineasPorMarca = filterOptions?.lineasPorMarca ?? {};
  const lineaOptions = filters.marca
    ? (lineasPorMarca[filters.marca] ?? [])
    : Object.values(lineasPorMarca).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

  const modeloOptions = filterOptions?.modelos ?? [];
  const empresaOptions = filterOptions?.empresas ?? [];

  const Toast = React.useMemo(
    () =>
      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true,
      }),
    []
  );

  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  const motos = data?.motos ?? [];
  const total = Number(data?.pagination?.total ?? 0) || 0;
  const serverPerPage = Number(data?.pagination?.per_page ?? perPage) || perPage;
  const currentPage = Number(data?.pagination?.current_page ?? page) || page;
  const lastPage = Number(data?.pagination?.last_page ?? Math.max(1, Math.ceil(total / serverPerPage)));

  const visible = motos;

  const openCrear = () =>
    open(<FormularioMotos key="create" />, "Crear moto", {
      size: "5xl",
      position: "center",
    });

  const openEditar = (m: any) =>
    open(
      <FormularioMotos key={`edit-${m.id}`} initialValues={m} mode="edit" />,
      `Editar moto: ${m.marca} ${m.linea}`,
      { size: "5xl", position: "center" }
    );

  const openImpuestos = (m: any) => {
    const initialValues = {
      id: Number(m.id),
      soat: m.soat ?? "",
      matricula_contado: m.matricula_contado ?? "",
      matricula_credito: m.matricula_credito ?? "",
      impuestos: m.impuestos ?? "",
    };
    open(
      <ImpuestosMotosFormulario key={`imp-${m.id}`} initialValues={initialValues} />,
      `Impuestos: ${m.marca ?? ""} ${m.linea ?? ""} ${m.modelo ?? ""}`,
      { size: "3xl", position: "center" }
    );
  };

  const openDescuentos = (m: any) => {
    const initialValues = {
      id: Number(m.id),
      descuento_empresa: m.descuento_empresa ?? "",
      descuento_ensambladora: m.descuento_ensambladora ?? "",
    };
    open(
      <DescuentosMotosFormulario key={`desc-${m.id}`} initialValues={initialValues} />,
      `Descuentos: ${m.marca ?? ""} ${m.linea ?? ""} ${m.modelo ?? ""}`,
      { size: "md", position: "center" }
    );
  };

  const confirmarEliminar = async (id: number, nombre: string) => {
    const ok = await confirmDelete(`¿Seguro que deseas eliminar <b>${nombre}</b>?`, "Eliminar moto");
    if (ok) deleteMoto.mutate(id);
  };

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  // ✅ ahora
  const set = (k: keyof MotoFilters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [k]: v,
      // si cambia la marca, limpia la línea
      ...(k === "marca" ? { linea: "" } : {}),
    }));
  };
  const clearFilters = () => {
    setFilters({ marca: "", linea: "", modelo: "", empresa: "", estado: "" });
  };

  const onToggleEstadoMoto = (m: any) => {
    const id = Number(m.id);
    const actual = Number(m.estado_moto) === 1 ? 1 : 0;
    const nuevo = actual === 1 ? 0 : 1;

    Toast.fire({
      icon: "success",
      title: nuevo === 1 ? "Mostrando: Sí" : "Mostrando: No",
    });

    setTogglingId(id);
    toggleEstado.mutate(id, { onSettled: () => setTogglingId(null) });
  };

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "#", className: "w-12", render: (m) => <span className="text-base-content/50">{m.id}</span> },
    {
      key: "imagen",
      header: "Imagen",
      render: (m) =>
        m.foto ? (
          <img
            src={`${BASE_URL}/${m.foto}`}
            alt={`${m.marca} ${m.linea}`}
            className="h-12 w-16 object-cover rounded-md border"
          />
        ) : (
          <div className="h-12 w-16 bg-base-200 rounded-md" />
        ),
    },
    { key: "marca", header: "Marca", className: "font-medium", render: (m) => m.marca ?? "" },
    { key: "linea", header: "Línea", render: (m) => m.linea ?? "" },
    { key: "cilindraje", header: "Cilindraje", render: (m) => (m.cilindraje != null ? `${m.cilindraje} CC` : "-") },
    { key: "tipo_moto", header: "Tipo", render: (m) => m.tipo_moto ?? "" },
    { key: "modelo", header: "Modelo", render: (m) => m.modelo ?? "" },
    {
      key: "empresa",
      header: "Empresa",
      headerClassName: "hidden md:table-cell",
      className: "hidden md:table-cell",
      render: (m) => m.empresa ?? "",
    },
    {
      key: "subdistribucion",
      header: "Subdistribucion",
      headerClassName: "hidden lg:table-cell",
      className: "hidden lg:table-cell",
      render: (m) => m.subdistribucion ?? "",
    },
    {
      key: "mostrar",
      header: "Mostrar",
      headerClassName: "hidden sm:table-cell",
      className: "hidden sm:table-cell",
      render: (m) => (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={Number(m.estado_moto) === 1}
            disabled={togglingId === Number(m.id)}
            onChange={() => onToggleEstadoMoto(m)}
          />
          <span className="text-xs font-semibold">{Number(m.estado_moto) === 1 ? "Sí" : "No"}</span>
        </div>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      align: "right",
      headerClassName: "pr-6 whitespace-nowrap",
      className: "whitespace-nowrap",
      render: (m) => Number(m.precio_base || 0).toLocaleString(),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      render: (m) => (
        <div className="flex justify-end gap-2">
          <button className="btn btn-sm bg-base-100 btn-circle" onClick={() => openDescuentos(m)} title="Editar descuentos">
            <Percent size="18px" />
          </button>
          <button className="btn btn-sm bg-base-100 btn-circle" onClick={() => openImpuestos(m)} title="Editar impuestos">
            <Banknote size="18px" />
          </button>
          <button className="btn btn-sm bg-base-100 btn-circle" onClick={() => openEditar(m)} title="Editar">
            <Pen size="18px" color="green" />
          </button>
          <button
            className="btn btn-sm bg-base-100 btn-circle"
            onClick={() => confirmarEliminar(Number(m.id), `${m.marca} ${m.linea}`)}
            title="Eliminar"
          >
            <Trash2 size="18px" color="#ef4444" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Módulo de motos"
      toolbar={
        <button className="btn bg-[#2BB352] text-white" onClick={openCrear}>
          Crear Moto
        </button>
      }
      filters={
        <>
          <div className="bg-base-100 rounded-xl border border-base-200 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-base-content">Marca</label>
                <select className="select select-bordered" value={filters.marca ?? ""} onChange={set("marca")}>
                  <option value="">Todas</option>
                  {marcaOptions.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-base-content">Línea</label>
                <select className="select select-bordered" value={filters.linea ?? ""} onChange={set("linea")}>
                  <option value="">Todas</option>
                  {lineaOptions.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-base-content">Modelo</label>
                <select className="select select-bordered" value={filters.modelo ?? ""} onChange={set("modelo")}>
                  <option value="">Todos</option>
                  {modeloOptions.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-base-content">Empresa</label>
                <select className="select select-bordered" value={filters.empresa ?? ""} onChange={set("empresa")}>
                  <option value="">Todas</option>
                  {empresaOptions.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-base-content">Estado</label>
                <select className="select select-bordered" value={filters.estado ?? ""} onChange={set("estado")}>
                  <option value="">Todos</option>
                  <option value="Nueva">Nueva</option>
                  <option value="Usada">Usada</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-base-content/60">
                {isPending ? "Cargando..." : `Resultados: ${total}`}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          </div>

        </>
      }
      tableClassName="min-w-225"
      columns={columns}
      rows={visible}
      rowKey={(m, idx) => m.id ?? idx}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar motos"
      emptyMessage="No hay resultados con esos filtros."
      pagination={{
        page: currentPage,
        totalPages: lastPage,
        totalItems: total,
        pageSize: serverPerPage,
        onPageChange: setPage,
        onPageSizeChange: (v) => {
          setPerPage(v || PAGE_SIZE);
          setPage(1);
        },
        pageSizeOptions: [10, 20, 50],
        isFetching,
      }}
    />
  );
};

export default TablaMotos;
