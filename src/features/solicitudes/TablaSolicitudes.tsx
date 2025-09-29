// src/components/solicitudes/TablaSolicitudes.tsx
import React from "react";
import { useSolicitudesFacturacion, type SolicitudFacturacion } from "../../services/solicitudServices";
// import { useAuthStore } from "../../store/auth.store";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useLoaderStore } from "../../store/loader.store";

const PAGE_SIZE = 10;
const SIBLING_COUNT = 1;
const BOUNDARY_COUNT = 1;

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);
function getPaginationItems(current: number, totalPages: number, siblingCount = SIBLING_COUNT, boundaryCount = BOUNDARY_COUNT) {
  if (totalPages <= 1) return [1];
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);
  const siblingsStart = Math.max(Math.min(current - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2);
  const siblingsEnd = Math.min(Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2), endPages.length > 0 ? endPages[0] - 2 : totalPages - 1);
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
const btnActive = `${btnBase} btn-primary text-primary-content`;
const btnEllipsis = "btn btn-xs rounded-xl min-w-8 h-8 px-3 bg-base-200 text-base-content/60 pointer-events-none";

const BadgeSiNo: React.FC<{ v: boolean }> = ({ v }) => (
  <span className={`badge ${v ? "badge-success" : "badge-ghost"}`}>{v ? "Sí" : "No"}</span>
);

const TablaSolicitudes: React.FC = () => {
  // Puedes pasar filtros aquí si quieres: useSolicitudesFacturacion({ agencia: "NORTE" })
  const { data, isLoading, isError, refetch } = useSolicitudesFacturacion();
  const solicitudes = data ?? [];

  const [page, setPage] = React.useState(1);
  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(solicitudes.length / PAGE_SIZE)),
    [solicitudes.length]
  );
  React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, solicitudes.length);
  const visible = solicitudes.slice(start, end);
  const items = getPaginationItems(page, totalPages);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isLoading) {
      show();   // 👈 activa el overlay global
    } else {
      hide();   // 👈 lo oculta
    }
  }, [isLoading, show, hide]);


  if (isError) return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
      Error al cargar solicitudes. <button className="btn btn-xs ml-2" onClick={() => refetch()}>Reintentar</button>
    </div>
  );


  const buildDetallePath = (s: SolicitudFacturacion) => {
    // Soportar ambas convenciones de nombre por si aún no actualizaste tipos:
    const codigoCredito = (s as any).codigoCredito ?? (s as any).codigo_credito;
    const idCotizacion = (s as any).idCotizacion ?? (s as any).id_cotizacion;

    const hasCodigo = codigoCredito !== null && codigoCredito !== undefined && String(codigoCredito).trim() !== "";
    const hasCoti = idCotizacion !== null && idCotizacion !== undefined && String(idCotizacion).trim() !== "";

    if (hasCodigo) {
      return `/creditos/detalle/facturar-credito/${encodeURIComponent(String(codigoCredito))}`;
    }
    if (hasCoti) {
      return `/creditos/detalle/facturar-solicitud/${encodeURIComponent(String(idCotizacion))}`;
    }
    return null; // sin identificadores válidos
  };



  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap my-3">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Solicitudes de facturación
        </h3>
        {/* Aquí podrías poner filtros rápidos (agencia, autorizado, etc.) */}
      </div>

      <div className="relative overflow-x-auto max-w-full px-4">
        <table className="table table-zebra table-pin-rows min-w-[1000px]">
          <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-white bg-[#3498DB]">
              <th className="w-12">#</th>
              <th>Acciones</th>
              <th>Código</th>
              <th>Cliente</th>
              <th>Agencia</th>
              <th>Tipo</th>
              <th className="hidden lg:table-cell">Recibo</th>
              <th className="hidden lg:table-cell">Facturador</th>
              <th>Autorizado</th>
              <th className="hidden sm:table-cell">Facturado</th>
              <th className="hidden sm:table-cell">Entrega</th>
              <th className="hidden md:table-cell">Creación</th>
              <th className="hidden md:table-cell">Actualizado</th>
            </tr>
          </thead>

          <tbody className="[&>tr:hover]:bg-base-200/40">
            {visible.map((s: SolicitudFacturacion) => (
              <tr key={s.id} className="transition-colors">
                <th className="text-base-content/50">{s.id}</th>
                {/* {useAuthStore.getState().user?.rol === "Administrador" && c.estado != 'Aprobado' && ( */}
                <td>
                  {(() => {
                    const to = buildDetallePath(s);
                    return to ? (
                      <Link to={to}>
                        <button
                          className="btn btn-sm text-warning bg-white btn-circle"
                          title="Editar Estado"
                        >
                          <Pencil size="18px" />
                        </button>
                      </Link>
                    ) : (
                      <button
                        className="btn btn-sm btn-disabled bg-white btn-circle"
                        title="Sin identificador"
                        disabled
                      >
                        <Pencil size="18px" />
                      </button>
                    );
                  })()}
                </td>

                {/* )} */}
                <td className="font-medium whitespace-nowrap">{s.codigo}</td>
                <td className="whitespace-nowrap">{s.cliente}</td>
                <td className="whitespace-nowrap">{s.agencia}</td>
                <td className="whitespace-nowrap">{s.tipo}</td>
                <td className="hidden lg:table-cell">{s.numeroRecibo ?? "—"}</td>
                <td className="hidden lg:table-cell">{s.facturador ?? "—"}</td>
                <td><BadgeSiNo v={s.autorizado} /></td>
                <td className="hidden sm:table-cell"><BadgeSiNo v={s.facturado} /></td>
                <td className="hidden sm:table-cell"><BadgeSiNo v={s.entregaAutorizada} /></td>
                <td className="hidden md:table-cell whitespace-nowrap">{s.fechaCreacion}</td>
                <td className="hidden md:table-cell whitespace-nowrap">{s.actualizado}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">
          Mostrando {solicitudes.length === 0 ? 0 : start + 1}–{end} de {solicitudes.length}
        </span>
        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={goPrev} disabled={page === 1}>«</button>
          {items.map((it, i) => it === "..." ? (
            <span key={`e-${i}`} className={btnEllipsis}>…</span>
          ) : (
            <button key={`p-${it}`} className={it === page ? btnActive : btnGhost} onClick={() => goTo(Number(it))}>
              {it}
            </button>
          ))}
          <button className={btnGhost} onClick={goNext} disabled={page === totalPages}>»</button>
        </div>
      </div>
    </div>
  );
};

export default TablaSolicitudes;
