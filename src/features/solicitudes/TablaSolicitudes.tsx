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

const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationItems(
  current: number,
  totalPages: number,
  siblingCount = SIBLING_COUNT,
  boundaryCount = BOUNDARY_COUNT
) {
  if (totalPages <= 1) return [1];
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );
  const siblingsStart = Math.max(
    Math.min(
      current - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? Number(endPages[0]) - 2 : totalPages - 1
  );

  const items: (number | "...")[] = [];
  items.push(...startPages);

  if (siblingsStart > boundaryCount + 2) items.push("...");
  else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < totalPages - boundaryCount - 1) items.push("...");
  else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);

  items.push(...endPages);
  return items.filter((v, i, a) => a.indexOf(v) === i);
}

const btnBase = "btn btn-xs rounded-xl min-w-8 h-8 px-3 font-medium shadow-none border-0";
const btnGhost = `${btnBase} btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300`;
const btnActive = `${btnBase} bg-[#3498DB] text-primary-content`;
const btnEllipsis =
  "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

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

// const cotizacionEstadoBadge = (estado?: string | null) => {
//   const t = (estado ?? "").trim().toLowerCase();

//   if (!t || t === "sin estado") return "badge-ghost";
//   if (t.includes("facturado")) return "badge-success";
//   if (t.includes("facturación")) return "badge-info";
//   if (t.includes("alto interés")) return "badge-warning";
//   if (t.includes("continúa interesado")) return "badge-warning";
//   if (t.includes("sin interés")) return "badge-error";
//   if (t.includes("solicitar crédito")) return "badge-info";

//   return "badge-ghost";
// };

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

const formatFechaLarga = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
};

const TablaSolicitudes: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const [tipoSolicitud, setTipoSolicitud] = React.useState("");
  const [estado, setEstado] = React.useState("");
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

  const items = React.useMemo(
    () => getPaginationItems(currentPage, lastPage),
    [currentPage, lastPage]
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

  const { show, hide } = useLoaderStore();
  React.useEffect(() => {
    isLoading ? show() : hide();
  }, [isLoading, show, hide]);

  const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
  const end = Math.min(currentPage * serverPerPage, total);

  const buildDetallePath = (s: SolicitudFacturacion) => {
    const idCoti = s.id_cotizacion ?? s.cotizacionId;
    if (idCoti === null || idCoti === undefined || String(idCoti).trim() === "") {
      return null;
    }
    return `/solicitudes/facturacion/${encodeURIComponent(String(idCoti))}`;
  };

  const aplicarBusqueda = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onSubmitBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    aplicarBusqueda();
  };

  const limpiarFiltros = () => {
    setPage(1);
    setPerPage(10);
    setSearch("");
    setSearchInput("");
    setTipoSolicitud("");
    setEstado("");
    setFechaDesde("");
    setFechaHasta("");
    setIdCotizacion("");
  };

  React.useEffect(() => {
    setPage(1);
  }, [tipoSolicitud, estado, fechaDesde, fechaHasta, idCotizacion]);

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar solicitudes.
        <button className="btn btn-xs ml-2" onClick={() => refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl overflow-hidden">


      <div className="px-4 pt-4 pb-2">
        <div className="rounded-2xl border border-base-300 bg-base-100 md:p-5">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 border-b border-base-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            {/* <div className="min-w-0">
        <h3 className="text-base font-semibold text-base-content md:text-lg">
          Solicitudes de facturación
        </h3>
      </div> */}


          </div>

          {/* Filtros */}
          <form onSubmit={onSubmitBuscar}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
              {/* <div className="2xl:col-span-3">
          <label className="label pb-1">
            <span className="label-text text-sm text-base-content/70">
              Buscar por nombre o cédula
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ej: Paola, 123456789, Andrea..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div> */}

              <div className="2xl:col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-sm text-base-content/70">
                    Buscar Cliente
                  </span>
                </label>
                <div className="w-full">
                  <SelectCotizaciones
                    onSelect={(id) => {
                      setIdCotizacion(id ? String(id) : "");
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="label pb-1">
                  <span className="label-text text-xs text-base-content/70 md:text-sm">
                    Codigo cotización
                  </span>
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
                  <span className="label-text text-sm text-base-content/70">
                    Tipo de solicitud
                  </span>
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

              {/* <div className="2xl:col-span-2">
          <label className="label pb-1">
            <span className="label-text text-sm text-base-content/70">
              Estado de cotización
            </span>
          </label>
          <select
            className="select select-bordered w-full"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Sin estado">Sin revisar</option>
            <option value="Sin interés">Sin interés</option>
            <option value="Continúa interesado">Continúa interesado</option>
            <option value="Alto interés">Alto interés</option>
            <option value="Solicitar crédito">Solicitar crédito</option>
            <option value="Solicitar facturación">Solicitar facturación</option>
            <option value="En facturación">En facturación</option>
            <option value="Facturado">Facturado</option>
          </select>
        </div> */}

              <div>
                <label className="label pb-1">
                  <span className="label-text text-sm text-base-content/70">
                    Fecha desde
                  </span>
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
                  <span className="label-text text-sm text-base-content/70">
                    Fecha hasta
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>


              <div>
                <label className="label pb-1">
                  <span className="label-text text-sm text-base-content/70">
                    Filas
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <select
                    className="select select-bordered w-full"
                    value={serverPerPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value) || 10);
                      setPage(1);
                    }}
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  {isFetching && <span className="loading loading-spinner loading-sm" />}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={limpiarFiltros}
                    className="btn btn-outline btn-accent flex-1"
                    type="button"
                  >
                    Limpiar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-warning flex-1"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="relative overflow-x-auto max-w-full px-4 pb-2">
        <table className="table table-zebra table-pin-rows min-w-375">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th>#</th>
              <th>Acciones</th>
              <th>Código solicitud</th>
              {/* <th>ID cotización</th> */}
              <th>Cliente solicitud</th>
              <th>Cédula cotización</th>
              <th>Agencia</th>
              <th>Tipo</th>
              {/* <th>Estado cotización</th> */}
              {/* <th>Celular</th> */}
              <th>Recibo</th>
              <th>Facturador</th>
              <th>Autorizado</th>
              <th>Facturado</th>
              <th>Entrega</th>
              <th>Marca / modelo</th>
              <th>Creación solicitud</th>
              <th>Actualizado</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {rows.map((s) => (
              <tr key={s.id} className="transition-colors">
                <th className="text-base-content/50">{s.id}</th>

                <td>
                  {(() => {
                    const to = buildDetallePath(s);
                    return to ? (
                      <Link to={to}>
                        <button
                          className="btn btn-sm text-warning bg-white btn-circle"
                          title="Ver detalles"
                        >
                          <Eye size="18px" />
                        </button>
                      </Link>
                    ) : (
                      <span className="text-base-content/30 select-none">—</span>
                    );
                  })()}
                </td>

                <td className="font-medium whitespace-nowrap">{s.codigo || "—"}</td>
                {/* <td className="whitespace-nowrap">{s.id_cotizacion ?? s.cotizacionId ?? "—"}</td> */}
                <td className="whitespace-nowrap">{s.cliente || "—"}</td>
                <td className="whitespace-nowrap">{s.cotizacionCedula || "—"}</td>
                <td className="whitespace-nowrap">{s.agencia || "—"}</td>

                <td className="whitespace-nowrap">
                  <BadgeTipoPago v={s.tipo} />
                </td>

                {/* <td className="whitespace-nowrap">
                  <span className={`badge ${cotizacionEstadoBadge(s.cotizacionEstado)}`}>
                    {s.cotizacionEstado || "Sin revisar"}
                  </span>
                </td> */}

                {/* <td className="whitespace-nowrap">{s.cotizacionCelular || "—"}</td> */}
                <td className="whitespace-nowrap">{s.numeroRecibo || "—"}</td>
                <td className="whitespace-nowrap">{s.facturador || "—"}</td>
                <td><BadgeSiNo v={s.autorizado} /></td>
                <td><BadgeSiNo v={s.facturado} /></td>
                <td><BadgeSiNo v={s.entregaAutorizada} /></td>

                <td className="whitespace-nowrap">
                  {[s.marcaA, s.lineaA].filter(Boolean).join(" ") || "—"}
                </td>

                <td className="whitespace-nowrap">
                  {formatFechaLarga(s.fechaCreacion)}
                </td>

                <td className="whitespace-nowrap text-sm text-base-content/70">
                  {humanizeDesde(s.actualizado)} · {formatFechaLarga(s.actualizado)}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={18} className="text-center py-8 text-base-content/50">
                  No se encontraron solicitudes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {start}–{end} de {total}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
            «
          </button>

          {items.map((it, i) =>
            it === "..." ? (
              <span key={`e-${i}`} className={btnEllipsis}>
                …
              </span>
            ) : (
              <button
                key={`p-${it}`}
                className={Number(it) === currentPage ? btnActive : btnGhost}
                onClick={() => goTo(Number(it))}
              >
                {it}
              </button>
            )
          )}

          <button className={btnGhost} onClick={goNext} disabled={currentPage === lastPage}>
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaSolicitudes;