import React from "react";
import { Eye, Pen, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useCreditoById } from "../../services/creditosServices";
import { useCreditos } from "../../services/creditosServices"; // <— nuevo hook
import { useAuthStore } from "../../store/auth.store";
import SelectCreditos from "./SelectCreditos";
import { useLoaderStore } from "../../store/loader.store";
import { fmtFecha, timeAgo } from "../../utils/date";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";
import { PAGE_SIZE } from "../../constants/pagination";

// list_creditos.php pagina y filtra por estado en servidor. Catálogo fijo
// (no se deriva de la página cargada) para que el select siempre muestre todas las opciones.
const ESTADOS_CREDITO = [
    "Incompleto",
    "Pendiente",
    "Revision",
    "Aprobado",
    "En Facturación",
    "Facturado",
    "No viable",
];

const moneyCOP = (n: number) => `${Number(n || 0).toLocaleString()} COP`;

const badgeNum = (v?: number | string | null) => {
    const n = Number(v);
    const cls = n === 1 ? "badge-success" : "badge-ghost";
    const text = n === 1 ? "Sí" : "No";
    return <span className={`badge ${cls}`}>{text}</span>;
};

const badgeEstado = (estado?: string) => {
  const e = (estado || "").toLowerCase();

  let cls = "badge-ghost";

  if (e.includes("aprob")) cls = "badge-success";
  else if (e.includes("revision") || e.includes("revisión")) cls = "badge-accent";
  else if (e.includes("incompleto")) cls = "badge-warning";
  else if (e.includes("viable") && e.includes("no")) cls = "badge-error";
  else if (e.includes("en factura")) cls = "badge-primary";
  else if (e.includes("factur")) cls = "badge-info";

  return <span className={`badge ${cls} whitespace-nowrap`}>{estado ?? "-"}</span>;
};

const timeAgoCredito = (iso?: string) =>
    timeAgo(iso, { emptyFallback: "-", invalidFallback: (raw) => raw });

const TablaCreditos: React.FC = () => {
    // ---- estado ----
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(PAGE_SIZE);
    const [estadoFilter, setEstadoFilter] = React.useState<string>("");
    const [creditoId, setCreditoId] = React.useState<number | null>(null);

    // ---- queries ----
    const oneQry = useCreditoById(creditoId);                       // detalle por id
    const listQry = useCreditos(page, perPage, estadoFilter || undefined); // página actual (server-side, filtrada por estado)

    const isDetail = Boolean(creditoId);

    const serverItems = listQry.data?.items ?? [];
    const listLoading = listQry.isLoading;
    const oneLoading = oneQry.isLoading;

    const isLoading = isDetail ? oneLoading : listLoading;
    const isError = isDetail ? oneQry.isError : listQry.isError;

    // Para detalle, mostramos solo ese registro como array de 1
    const visible = isDetail
        ? (oneQry.data ? [oneQry.data] : [])
        : serverItems;

    // vuelve a la página 1 cada vez que cambia el filtro, el tamaño de página o el modo detalle
    React.useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estadoFilter, perPage, isDetail]);

    const cleanFilters = () => {
        setCreditoId(null);
        setEstadoFilter("");
        setPage(1);
        setPerPage(PAGE_SIZE);
    };

    const { show, hide } = useLoaderStore();

    React.useEffect(() => {
        if (isLoading) {
            show();   // 👈 muestra overlay
        } else {
            hide();   // 👈 lo oculta
        }
    }, [isLoading, show, hide]);

    const total = Number(listQry.data?.pagination?.total ?? 0) || 0;
    const currentPage = Number(listQry.data?.pagination?.current_page ?? page) || page;
    const lastPage = Number(listQry.data?.pagination?.last_page ?? 1) || 1;

    const columns: DataTableColumn<any>[] = [
        { key: "id", header: "Id", render: (c) => c.id || "-" },
        {
            key: "acciones",
            header: "Acciones",
            headerClassName: "text-center",
            className: "flex h-full pt-5 items-end gap-3",
            render: (c) => (
                <>
                    {(
                        useAuthStore.getState().user?.rol === "Administrador" ||
                        useAuthStore.getState().user?.rol === "Lider_marca" ||
                        useAuthStore.getState().user?.rol === "Lider_punto"
                    ) && c.estado !== "Aprobado" && c.estado !== "Facturado" && (
                            <Link to={`/creditos/detalle/${c.codigo_credito}`} onClick={() => show()}>
                                <button className="btn btn-sm text-warning bg-base-100 btn-circle" title="Editar Estado">
                                    <Pencil size="18px" />
                                </button>
                            </Link>
                        )}

                    <Link to={`/creditos/detalle/${c.codigo_credito}`} onClick={() => show()}>
                        <button className="btn btn-sm text-success bg-base-100 btn-circle" title="Ver">
                            <Eye size="18px" />
                        </button>
                    </Link>
                    {useAuthStore.getState().user?.rol === "Asesor" && c.estado !== "Facturado" && (
                        <Link to={`/creditos/registrar/${c.codigo_credito}`}>
                            <button className="btn btn-sm text-warning bg-base-100 btn-circle" title="Editar">
                                <Pen size="18px" />
                            </button>
                        </Link>
                    )}
                </>
            ),
        },
        {
            key: "cotizacion",
            header: "Cotización",
            headerClassName: "text-center",
            className: "text-center",
            render: (c) =>
                c.cotizacion_id ? (
                    <Link to={`/cotizaciones/${c.cotizacion_id}`} onClick={() => show()}>
                        <button className="btn btn-sm text-info bg-base-100 btn-circle" title="Ver cotización">
                            <Eye size="18px" />
                        </button>
                    </Link>
                ) : (
                    <span className="text-base-content/40">—</span>
                ),
        },
        { key: "asesor", header: "Asesor", className: "font-medium", render: (c) => c.asesor || "-" },
        { key: "codigo_credito", header: "Código del crédito", render: (c) => c.codigo_credito || "-" },
        { key: "nombre_cliente", header: "Nombre cliente", render: (c) => c.nombre_cliente || "-" },
        { key: "cedula_cliente", header: "Cédula cliente", render: (c) => c.cedula_cliente || "-" },
        { key: "producto", header: "Producto", headerClassName: "min-w-80", render: (c) => c.producto || "-" },
        { key: "valor_producto", header: "Valor producto", className: "whitespace-nowrap", render: (c) => moneyCOP(c.valor_producto) },
        { key: "plazo_meses", header: "Plazo(meses)", align: "center", render: (c) => c.plazo_meses ?? "-" },
        { key: "estado", header: "Estado", render: (c) => badgeEstado(c.estado) },
        { key: "credito_cerrado", header: "Credito Cerrado", render: (c) => badgeNum(c.credito_cerrado) },
        {
            key: "actualizado",
            header: "Actualizado",
            className: "whitespace-nowrap text-sm text-base-content/70",
            render: (c) => (
                <>
                    {timeAgoCredito(c.actualizado)}{c.actualizado ? ` · ${fmtFecha(c.actualizado)}` : ""}
                </>
            ),
        },
    ];

    return (
        <DataTable
            filters={
                <div className="pt-4 my-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:flex-1 lg:min-w-0">
                        {/* Selector que setea el ID → modo detalle */}
                        <SelectCreditos onSelect={(id) => { setCreditoId(id ?? null); }} />

                        {/* Filtro por estado (server-side) */}
                        {!isDetail && (
                            <select
                                className="select select-md select-bordered w-full sm:w-auto sm:flex-1 sm:min-w-44 sm:max-w-56"
                                value={estadoFilter}
                                onChange={(e) => { setEstadoFilter(e.target.value); }}
                            >
                                <option value="">Estado</option>
                                {ESTADOS_CREDITO.map((e) => <option key={e} value={e}>{e}</option>)}
                            </select>
                        )}

                        <button onClick={cleanFilters} className="btn btn-accent w-full sm:w-auto sm:min-w-36">
                            Limpiar Filtros
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                        {useAuthStore.getState().user?.rol === "Asesor" && (
                            <Link to="/creditos/crear-cotizaciones-credito?tipo=credibike">
                                <button className="btn bg-[#2BB352] text-white">Crear Crédito</button>
                            </Link>
                        )}
                    </div>
                </div>
            }
            tableClassName="min-w-275"
            columns={columns}
            rows={visible}
            rowKey={(c) => c.id}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Error al cargar créditos"
            emptyMessage="Sin resultados"
            pagination={
                isDetail
                    ? undefined
                    : {
                          page: currentPage,
                          totalPages: lastPage,
                          totalItems: total,
                          pageSize: perPage,
                          onPageChange: setPage,
                          onPageSizeChange: (v) => {
                              setPerPage(Number(v) || PAGE_SIZE);
                              setPage(1);
                          },
                          pageSizeOptions: [10, 25, 50],
                          isFetching: listQry.isFetching,
                      }
            }
        />
    );
};

export default TablaCreditos;
