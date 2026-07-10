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
import { useClientPagination } from "../../shared/hooks/useClientPagination";

const DEFAULT_PAGE_SIZE = 10;
// list_creditos.php no soporta filtrar por estado/texto en servidor: traemos todo
// de una vez (hoy ~125 registros) y filtramos+paginamos en cliente, igual que
// TablaMarcas/TablaEmpresas. Tope generoso para cubrir crecimiento del dataset.
const ALL_CREDITOS_PAGE_SIZE = 5000;

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
    const [q, setQ] = React.useState("");
    const [estadoFilter, setEstadoFilter] = React.useState<string>("");
    const [creditoId, setCreditoId] = React.useState<number | null>(null);

    // ---- queries ----
    const oneQry = useCreditoById(creditoId);                    // detalle por id
    const listQry = useCreditos(1, ALL_CREDITOS_PAGE_SIZE);       // todos los créditos

    const isDetail = Boolean(creditoId);

    // Dataset visible:
    const serverItems = listQry.data?.items ?? [];
    const listLoading = listQry.isLoading;
    const oneLoading = oneQry.isLoading;

    const isLoading = isDetail ? oneLoading : listLoading;
    const isError = isDetail ? oneQry.isError : listQry.isError;

    // Para detalle, mostramos solo ese registro como array de 1
    const baseData = isDetail
        ? (oneQry.data ? [oneQry.data] : [])
        : serverItems;

    // Filtros client-side sobre el dataset completo (no solo la página actual)
    const creditosFiltrados = React.useMemo(() => {
        if (isDetail) return baseData;
        const term = q.trim().toLowerCase();
        return baseData.filter((c: any) => {
            const estadoOK = !estadoFilter || c.estado === estadoFilter;
            if (!estadoOK) return false;
            if (!term) return true;
            return [c.asesor, c.codigo_credito, c.nombre_cliente, c.producto, c.estado, c.analista]
                .join(" ").toLowerCase().includes(term);
        });
    }, [isDetail, baseData, q, estadoFilter]);

    // Estados (solo en lista)
    const estados = React.useMemo(() => {
        if (isDetail) return [];
        const set = new Set<string>();
        // estados fijos garantizados aunque no estén en el dataset actual
        set.add("En Facturación");
        (serverItems ?? []).forEach((c: any) => c?.estado && set.add(c.estado));
        return Array.from(set).sort();
    }, [serverItems, isDetail]);

    // Paginación (en cliente, sobre el resultado ya filtrado):
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        totalItems,
        pageItems,
    } = useClientPagination(creditosFiltrados, DEFAULT_PAGE_SIZE);

    // vuelve a la página 1 cada vez que cambia el filtro o el modo detalle
    React.useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, estadoFilter, isDetail]);

    const cleanFilters = () => {
        setCreditoId(null);
        setEstadoFilter("");
        setQ("");
        setPage(1);
        setPageSize(DEFAULT_PAGE_SIZE);
    };

    const { show, hide } = useLoaderStore();


    React.useEffect(() => {
        if (isLoading) {
            show();   // 👈 muestra overlay
        } else {
            hide();   // 👈 lo oculta
        }
    }, [isLoading, show, hide]);

    const visible = isDetail ? creditosFiltrados : pageItems;

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

                        {/* Filtro por estado (cliente, sobre el dataset completo) */}
                        {!isDetail && (
                            <select
                                className="select select-md select-bordered w-full sm:w-auto sm:flex-1 sm:min-w-44 sm:max-w-56"
                                value={estadoFilter}
                                onChange={(e) => { setEstadoFilter(e.target.value); }}
                            >
                                <option value="">Estado</option>
                                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
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
                          page,
                          totalPages,
                          totalItems,
                          pageSize,
                          onPageChange: setPage,
                          onPageSizeChange: (v) => setPageSize(Number(v)),
                          pageSizeOptions: [10, 25, 50],
                      }
            }
        />
    );
};

export default TablaCreditos;
