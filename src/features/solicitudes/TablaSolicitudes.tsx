// src/components/solicitudes/TablaSolicitudes.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  useSolicitudesFacturacion,
  type SolicitudFacturacion,
} from "../../services/solicitudServices";
import { useLoaderStore } from "../../store/loader.store";
import SelectCotizaciones from "../cotizaciones/SelectCotizaciones";
import { fmtFecha } from "../../utils/date";
import { DataTable } from "../../shared/components/datatable/DataTable";
import type { DataTableColumn } from "../../shared/components/datatable/types";

const normalizarTexto = (v: unknown): string =>
  typeof v === "string" ? v.trim().toLowerCase() : "";

const BadgeTipoPago: React.FC<{ v: unknown }> = ({ v }) => {
  const t = normalizarTexto(v);
  let classes = "badge badge-sm";
  let label = typeof v === "string" && v.trim() ? v : "—";

  switch (t) {
    case "contado":
      classes += " badge-success";
      break;
    case "crédito de terceros":
    case "credito de terceros":
      classes += " badge-warning";
      break;
    case "crédito directo":
    case "credito directo":
      classes += " badge-info";
      break;
    default:
      classes += " badge-ghost";
      break;
  }

  return <span className={classes}>{label}</span>;
};

const coerceBool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.trim().toLowerCase() === "si";
  if (typeof v === "number") return v === 1;
  return false;
};

const BadgeSiNo: React.FC<{ v: boolean | string | number }> = ({ v }) => {
  const ok = coerceBool(v);
  return (
    <span className={`badge ${ok ? "badge-success" : "badge-ghost"}`}>
      {ok ? "Sí" : "No"}
    </span>
  );
};

const humanizeDesde = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "justo ahora";

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hrs > 0) return `hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  if (min > 0) return `hace ${min} minuto${min > 1 ? "s" : ""}`;
  return "justo ahora";
};

const formatFechaLarga = (dateStr?: string | null) => fmtFecha(dateStr) || "—";

const TablaSolicitudes: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const [search, setSearch] = React.useState("");
  const [searchInput] = React.useState("");

  const [tipoSolicitud, setTipoSolicitud] = React.useState("");
  const [estado] = React.useState("");
  const [fechaDesde, setFechaDesde] = React.useState("");
  const [fechaHasta, setFechaHasta] = React.useState("");
  const [idCotizacion, setIdCotizacion] = React.useState("");

  const filters = React.useMemo(
    () => ({
      search: search || undefined,
      tipo_solicitud: tipoSolicitud || undefined,
      estado: estado || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      id_cotizacion: idCotizacion ? Number(idCotizacion) : undefined,
    }),
    [search, tipoSolicitud, estado, fechaDesde, fechaHasta, idCotizacion]
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useSolicitudesFacturacion(page, perPage, filters);

  const rows = data?.data ?? [];
  const total = Number(data?.pagination?.total ?? 0);
  const currentPage = Number(data?.pagination?.current_page ?? page);
  const serverPerPage = Number(data?.pagination?.per_page ?? perPage);
  const lastPage = Number(data?.pagination?.last_page ?? 1);

  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    isLoading ? show() : hide();
  }, [isLoading, show, hide]);

  const buildDetallePath = (s: SolicitudFacturacion) => {
    const idCoti = s.id_cotizacion ?? s.cotizacionId;
    if (idCoti === null || idCoti === undefined || String(idCoti).trim() === "") {
      return null;
    }
    return `/solicitudes/facturacion/${encodeURIComponent(String(idCoti))}`;
  };

  const onSubmitBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const limpiarFiltros = () => {
    setPage(1);
    setPerPage(10);
    setSearch("");
    setTipoSolicitud("");
    setFechaDesde("");
    setFechaHasta("");
    setIdCotizacion("");
  };

  React.useEffect(() => {
    setPage(1);
  }, [tipoSolicitud, estado, fechaDesde, fechaHasta, idCotizacion]);

  const columns: DataTableColumn<SolicitudFacturacion>[] = [
    { key: "id", header: "#", render: (s) => <span className="text-base-content/50">{s.id}</span> },
    {
      key: "facturacion",
      header: "Facturación",
      render: (s) => {
        const to = buildDetallePath(s);
        return to ? (
          <Link to={to}>
            <button className="btn btn-sm text-warning bg-base-100 btn-circle" title="Ver detalles">
              <Eye size="18px" />
            </button>
          </Link>
        ) : (
          <span className="text-base-content/30 select-none">—</span>
        );
      },
    },
    {
      key: "cotizacion",
      header: "Cotización",
      align: "center",
      render: (s) => {
        const idCoti = s.id_cotizacion ?? s.cotizacionId;
        const has = idCoti !== null && idCoti !== undefined && String(idCoti).trim() !== "";
        return has ? (
          <Link to={`/cotizaciones/${encodeURIComponent(String(idCoti))}`} onClick={() => show()}>
            <button className="btn btn-sm text-info bg-base-100 btn-circle" title="Ver cotización">
              <Eye size="18px" />
            </button>
          </Link>
        ) : (
          <span className="text-base-content/30 select-none">—</span>
        );
      },
    },
    { key: "codigo", header: "Código solicitud", className: "font-medium whitespace-nowrap", render: (s) => s.codigo || "—" },
    { key: "cliente", header: "Cliente solicitud", className: "whitespace-nowrap", render: (s) => s.cliente || "—" },
    { key: "cedula", header: "Cédula cotización", className: "whitespace-nowrap", render: (s) => s.cotizacionCedula || "—" },
    { key: "agencia", header: "Agencia", className: "whitespace-nowrap", render: (s) => s.agencia || "—" },
    { key: "tipo", header: "Tipo", className: "whitespace-nowrap", render: (s) => <BadgeTipoPago v={s.tipo} /> },
    { key: "recibo", header: "Recibo", className: "whitespace-nowrap", render: (s) => s.numeroRecibo || "—" },
    { key: "facturador", header: "Facturador", className: "whitespace-nowrap", render: (s) => s.facturador || "—" },
    { key: "autorizado", header: "Autorizado", render: (s) => <BadgeSiNo v={s.autorizado} /> },
    { key: "facturado", header: "Facturado", render: (s) => <BadgeSiNo v={s.facturado} /> },
    { key: "entrega", header: "Entrega", render: (s) => <BadgeSiNo v={s.entregaAutorizada} /> },
    {
      key: "marca_modelo",
      header: "Marca / modelo",
      className: "whitespace-nowrap",
      render: (s) => [s.marcaA, s.lineaA].filter(Boolean).join(" ") || "—",
    },
    { key: "creacion", header: "Creación solicitud", className: "whitespace-nowrap", render: (s) => formatFechaLarga(s.fechaCreacion) },
    {
      key: "actualizado",
      header: "Actualizado",
      className: "whitespace-nowrap text-sm text-base-content/70",
      render: (s) => (
        <>
          {humanizeDesde(s.actualizado)} · {formatFechaLarga(s.actualizado)}
        </>
      ),
    },
  ];

  return (
    <DataTable
      className="overflow-hidden"
      filters={
        <div className="pt-4 pb-2">
          <div className="rounded-2xl border border-base-300 bg-base-100 md:p-5">
            <form onSubmit={onSubmitBuscar}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-end">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="label pb-1">
                    <span className="label-text text-sm text-base-content/70">Buscar Cliente</span>
                  </label>
                  <div className="w-full">
                    <SelectCotizaciones
                      className="w-full min-w-0"
                      onSelect={(id) => {
                        setIdCotizacion(id ? String(id) : "");
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="label pb-1">
                    <span className="label-text text-xs text-base-content/70 md:text-sm">Codigo cotización</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="Ej: 275"
                    value={idCotizacion}
                    onChange={(e) => setIdCotizacion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label pb-1">
                    <span className="label-text text-sm text-base-content/70">Tipo de solicitud</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={tipoSolicitud}
                    onChange={(e) => setTipoSolicitud(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Contado">Contado</option>
                    <option value="Crédito de terceros">Crédito de terceros</option>
                    <option value="Crédito directo">Crédito directo</option>
                  </select>
                </div>

                <div>
                  <label className="label pb-1">
                    <span className="label-text text-sm text-base-content/70">Fecha desde</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label pb-1">
                    <span className="label-text text-sm text-base-content/70">Fecha hasta</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button onClick={limpiarFiltros} className="btn btn-outline btn-accent flex-1" type="button">
                      Limpiar
                    </button>

                    <button type="submit" className="btn btn-warning flex-1">
                      Buscar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
      tableClassName="min-w-375"
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        <>
          Error al cargar solicitudes.
          <button className="btn btn-xs ml-2" onClick={() => refetch()}>
            Reintentar
          </button>
        </>
      }
      emptyMessage="No se encontraron solicitudes con esos filtros."
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
        isFetching,
      }}
    />
  );
};

export default TablaSolicitudes;
