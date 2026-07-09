// src/components/garantia/TablaGarantiaExtendida.tsx
import React from "react";
import { useState, useMemo, useEffect } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useGarantiasExt, useGarantiaExtById } from "../../services/garantiaExtServices";
import { useLoaderStore } from "../../store/loader.store";
import { fmtFecha, timeAgo } from "../../utils/date";
import { fmtCOP as money } from "../../utils/money";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";

/* ======================= Utils ======================= */
const humanizeDesde = timeAgo;

const formatFechaLarga = (dateStr?: string | null) => fmtFecha(dateStr) || "—";

/* =================== Componente =================== */
const TablaGarantiaExtendida: React.FC = () => {
  // server pagination + filtros
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [idDetalle, setIdDetalle] = useState<number | null>(null); // ver un registro puntual
  const [cotizacionId, setCotizacionId] = useState<number | null>(null);
  const [q, setQ] = useState<string>("");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");

  // Query principal (lista) O detalle por ID
  const listQuery = useGarantiasExt(page, perPage, {
    q,
    cotizacionId: cotizacionId ?? undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
  });
  const detailQuery = useGarantiaExtById(idDetalle ?? undefined);

  const isDetail = Boolean(idDetalle);
  const { show, hide } = useLoaderStore();

  const isLoading = isDetail ? detailQuery.isLoading : listQuery.isLoading;
  const isError = isDetail ? detailQuery.isError : listQuery.isError;
  const isFetching = isDetail ? detailQuery.isFetching : listQuery.isFetching;

  useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  const rows = useMemo(() => {
    if (isDetail) {
      const r = detailQuery.data?.data;
      return r ? [r] : [];
    }
    return (listQuery.data?.data as any[]) ?? [];
  }, [isDetail, detailQuery.data, listQuery.data]);

  const total = isDetail ? rows.length : Number(listQuery.data?.pagination?.total ?? rows.length ?? 0) || 0;
  const serverPerPage = isDetail ? rows.length : Number(listQuery.data?.pagination?.per_page ?? perPage) || perPage;
  const currentPage = isDetail ? 1 : Number(listQuery.data?.pagination?.current_page ?? page) || page;
  const lastPage = isDetail ? 1 : Math.max(1, Number(listQuery.data?.pagination?.last_page ?? Math.ceil(total / serverPerPage)));

  const cleanFilters = () => {
    setIdDetalle(null);
    setCotizacionId(null);
    setQ("");
    setDesde("");
    setHasta("");
    setPage(1);
    setPerPage(10);
  };

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "ID", className: "text-sm text-base-content/70", render: (r) => r.id },
    {
      key: "cotizacion",
      header: "Cotización",
      className: "text-sm text-base-content/70",
      render: (r) => (
        <div className="flex gap-2">
          {r.cotizacion_id && (
            <Link to={`/cotizaciones/${r.cotizacion_id}`} className="btn btn-sm bg-base-100 btn-circle" title="Ver cotización">
              <div className="text-info">
                <Eye size="18px" />
              </div>
            </Link>
          )}
        </div>
      ),
    },
    { key: "cliente", header: "Cliente", className: "font-medium", render: (r) => r.cliente_nombre ?? "—" },
    { key: "cedula", header: "Cédula", className: "text-sm text-base-content/70", render: (r) => r.cliente_cedula ?? "—" },
    { key: "celular", header: "Celular", className: "text-sm text-base-content/70", render: (r) => r.cliente_celular ?? "—" },
    { key: "email", header: "Email", className: "text-sm text-base-content/70", render: (r) => r.cliente_email ?? "—" },
    { key: "moto_a", header: "Moto A", className: "text-sm text-base-content/70", render: (r) => r.moto_a ?? "—" },
    { key: "ge_a", header: "GE A", className: "text-sm text-base-content/70", render: (r) => r.garantia_extendida_a ?? "—" },
    { key: "meses_a", header: "Meses A", className: "text-sm text-base-content/70", render: (r) => r.meses_a ?? "—" },
    { key: "valor_a", header: "Valor A", className: "text-sm text-base-content/70", render: (r) => money(r.valor_a) },
    { key: "moto_b", header: "Moto B", className: "text-sm text-base-content/70", render: (r) => r.moto_b ?? "—" },
    { key: "ge_b", header: "GE B", className: "text-sm text-base-content/70", render: (r) => r.garantia_extendida_b ?? "—" },
    { key: "meses_b", header: "Meses B", className: "text-sm text-base-content/70", render: (r) => r.meses_b ?? "—" },
    { key: "valor_b", header: "Valor B", className: "text-sm text-base-content/70", render: (r) => money(r.valor_b) },
    {
      key: "actualizado",
      header: "Actualizado",
      className: "text-sm text-base-content/70",
      render: (r) => (
        <>
          {humanizeDesde(r.actualizado_en)} · {formatFechaLarga(r.actualizado_en)}
        </>
      ),
    },
  ];

  return (
    <DataTable
      filters={
        <div className="pt-4 my-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:flex-1 lg:min-w-0">
            {/* Buscar texto libre */}
            <input
              type="text"
              className="input input-bordered w-full sm:w-auto sm:flex-1 sm:min-w-52 sm:max-w-[18rem]"
              placeholder="Buscar por cliente, cédula, moto, email…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />

            {/* Filtro por ID garantía (detalle) */}
            <input
              type="number"
              className="input input-bordered w-37.5 hidden"
              placeholder="ID garantía"
              value={idDetalle ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                setIdDetalle(v === "" ? null : Number(v));
              }}
            />

            {/* Filtro por ID de cotización */}
            <input
              type="number"
              className="input input-bordered w-42.5 hidden"
              placeholder="ID cotización"
              value={cotizacionId ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                setCotizacionId(v === "" ? null : Number(v));
                setPage(1);
              }}
            />

            {/* Rango de fechas (columna `fecha`) */}
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                setPage(1);
              }}
            />
            <input
              type="date"
              className="input input-bordered w-full sm:w-auto"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                setPage(1);
              }}
            />

            <button onClick={cleanFilters} className="btn btn-accent w-full sm:w-auto sm:min-w-36">
              Limpiar Filtros
            </button>
          </div>
        </div>
      }
      tableClassName="min-w-300"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Error al cargar garantía y seguros"
      emptyMessage="Sin resultados"
      pagination={{
        page: currentPage,
        totalPages: lastPage,
        totalItems: total,
        pageSize: serverPerPage,
        onPageChange: setPage,
        onPageSizeChange: (v) => {
          setPerPage(v || 10);
          setPage(1);
        },
        pageSizeOptions: [10, 20, 50],
        isFetching,
        hideControls: isDetail,
      }}
    />
  );
};

export default TablaGarantiaExtendida;
