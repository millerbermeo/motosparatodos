// src/components/garantia/TablaGarantiaExtendida.tsx
import React from "react";
import { useState, useMemo, useEffect } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useGarantiasExt, useGarantiaExtById } from "../../services/garantiaExtServices";
import { useLoaderStore } from "../../store/loader.store";

/* ========= Paginación (mismo helper que cotizaciones) ========= */
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
function getPaginationItems(
  current: number,
  totalPages: number,
  siblingCount = SIBLING_COUNT,
  boundaryCount = BOUNDARY_COUNT
) {
  if (totalPages <= 1) return [1];
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);
  const siblingsStart = Math.max(
    Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
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
const btnEllipsis = "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

/* ======================= Utils ======================= */
const money = (n?: number | null) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
    : "—";

const humanizeDesde = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(String(dateStr).replace(" ", "T"));
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
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  const fmt = new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
};

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
  const items = useMemo(() => getPaginationItems(currentPage, lastPage), [currentPage, lastPage]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), lastPage));

  const start = total === 0 ? 0 : (currentPage - 1) * serverPerPage + 1;
  const end = Math.min(currentPage * serverPerPage, total);

  const cleanFilters = () => {
    setIdDetalle(null);
    setCotizacionId(null);
    setQ("");
    setDesde("");
    setHasta("");
    setPage(1);
    setPerPage(10);
  };

  if (isError) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar garantía extendida
      </div>
    );
  }

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      {/* Filtros */}
      <div className="px-4 pt-4 flex flex-wrap items-center justify-between gap-4 my-3">
        <div className="flex flex-wrap gap-3 flex-1 min-w-[260px]">
          {/* Buscar texto libre */}
          <input
            type="text"
            className="input input-bordered w-full sm:w-[260px]"
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
            className="input input-bordered w-[150px] hidden"
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
            className="input input-bordered w-[170px] hidden"
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
            className="input input-bordered"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="input input-bordered"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setPage(1);
            }}
          />

          <button onClick={cleanFilters} className="btn btn-accent min-w-[150px]">
            Limpiar Filtros
          </button>
        </div>

        {/* Paginación / filas */}
        <div className="flex flex-wrap items-center gap-3 min-w-[220px] justify-end">
          <label className="text-xs opacity-70">Filas:</label>
          <select
            className="select select-accent select-sm select-bordered w-20"
            value={serverPerPage}
            onChange={(e) => {
              const v = Number(e.target.value) || 10;
              setPerPage(v);
              setPage(1);
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {isFetching && <span className="loading loading-spinner loading-xs" />}
        </div>
      </div>

      {/* Tabla */}
      <div className="relative overflow-x-auto max-w-full px-4">
        <table className="table table-zebra table-pin-rows min-w-[1200px]">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th>ID</th>
              <th>Cotización</th>
              {/* <th>ID Cotización</th> */}
              <th>Cliente</th>
              <th>Cédula</th>
              <th>Celular</th>
              <th>Email</th>
              <th>Moto A</th>
              <th>GE A</th>
              <th>Meses A</th>
              <th>Valor A</th>
              <th>Moto B</th>
              <th>GE B</th>
              <th>Meses B</th>
              <th>Valor B</th>
              <th>Actualizado</th>
            </tr>
          </thead>
          <tbody className="[&>tr:hover]:bg-base-200/40">
            {rows.map((r: any) => (
              <tr key={r.id} className="transition-colors">
                <td className="text-sm text-base-content/70">{r.id}</td>
                <td className="text-sm text-base-content/70">
                  <div className="flex gap-2">
                    {/* Si tienes ruta de cotización, enlázala */}
                    {r.cotizacion_id && (
                      <Link to={`/cotizaciones/${r.cotizacion_id}`} className="btn btn-sm bg-white btn-circle" title="Ver cotización">
                        <div className="text-info">
                          <Eye size="18px" />
                        </div>
                      </Link>
                    )}
                  </div>
                </td>
                {/* <td className="text-sm text-base-content/70">{r.cotizacion_id ?? "—"}</td> */}
                <td className="font-medium">{r.cliente_nombre ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.cliente_cedula ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.cliente_celular ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.cliente_email ?? "—"}</td>

                <td className="text-sm text-base-content/70">{r.moto_a ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.garantia_extendida_a ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.meses_a ?? "—"}</td>
                <td className="text-sm text-base-content/70">{money(r.valor_a)}</td>

                <td className="text-sm text-base-content/70">{r.moto_b ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.garantia_extendida_b ?? "—"}</td>
                <td className="text-sm text-base-content/70">{r.meses_b ?? "—"}</td>
                <td className="text-sm text-base-content/70">{money(r.valor_b)}</td>

                <td className="text-sm text-base-content/70">
                  {humanizeDesde(r.actualizado_en)} · {formatFechaLarga(r.actualizado_en)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={16} className="text-center py-8 text-base-content/60">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">Mostrando {start}–{end} de {total}</span>

        {!isDetail && (
          <div className="flex items-center gap-2">
            <button className={btnGhost} onClick={goPrev} disabled={currentPage === 1}>
              «
            </button>
            {items.map((it, i) =>
              it === "..." ? (
                <span key={`e-${i}`} className={btnEllipsis}>…</span>
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
        )}
      </div>
    </div>
  );
};

export default TablaGarantiaExtendida;
