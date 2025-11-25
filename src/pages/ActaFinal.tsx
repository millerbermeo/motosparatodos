// src/pages/ActaFinal.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useActas, type ActaEntrega } from "../services/hooksActas";
import ButtonLink from "../shared/components/ButtonLink";
import {
  FileText,
  CalendarDays,
  UserRound,
  FileImage,
  CheckCircle2,
  AlertCircle,
  PenLine,
} from "lucide-react";
import { useLoaderStore } from "../store/loader.store";

const BaseUrl =
  import.meta.env.VITE_API_URL ??
  "http://tuclick.vozipcolombia.net.co/motos/back";

/* =======================
   Helpers
   ======================= */

const fmtFecha = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const buildImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const root = (BaseUrl || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");
  return `${root}/${rel}`;
};

const estadoBadgeClass = (estado: ActaEntrega["estado"]) => {
  switch (estado) {
    case "cerrada":
      return "badge-success";
    case "borrador":
    default:
      return "badge-ghost";
  }
};

/* Mini componente para la firma */
const FirmaView: React.FC<{ firma_url: string | null }> = ({ firma_url }) => {
  const url = buildImageUrl(firma_url || undefined);
  if (!url) {
    return <span className="text-sm opacity-70">Sin firma registrada</span>;
  }
  return (
    <div className="border rounded-xl p-3 bg-base-100 inline-flex flex-col items-center gap-2">
      <span className="text-xs uppercase opacity-60">Firma</span>
      <img
        src={url}
        alt="Firma del cliente"
        className="max-h-32 object-contain"
      />
    </div>
  );
};

/* Grid de fotos en forma de tarjetas */
const FotosGrid: React.FC<{ fotos: string[] }> = ({ fotos }) => {
  if (!fotos || fotos.length === 0) {
    return (
      <div className="text-sm opacity-70">
        No hay fotos registradas para este acta.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {fotos.map((f, i) => {
        const url = buildImageUrl(f);
        return (
          <article
            key={`${f}-${i}`}
            className="card bg-base-100 border border-base-300/60 shadow-sm overflow-hidden"
          >
            {url ? (
              <figure className="w-full h-40 bg-base-200">
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </figure>
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-xs opacity-60">
                Foto no disponible
              </div>
            )}
            <div className="card-body py-2 px-3">
              <p className="text-xs opacity-70">Foto #{i + 1}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

/* =======================
   Componente principal
   ======================= */

const ActaFinal: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // id de la URL se interpreta como id_factura
  const id_factura = id ? Number(id) : undefined;

  const {
    data: listResp,
    isLoading,
    error,
  } = useActas({
    factura: id_factura, // 🔥 filtro por id_factura
    limit: 50,
  });

  const actas: ActaEntrega[] = listResp?.data ?? [];

  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  if (!id_factura || id_factura <= 0) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <span>
            Falta el parámetro <code>id</code> en la URL. Debe ser{" "}
            <code>/actas/final/:id</code> donde <code>id</code> es el{" "}
            <strong>id_factura</strong>.
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-lg">
          <span>
            Hubo un problema cargando las actas para la factura #{id_factura}.
          </span>
        </div>
      </main>
    );
  }

  if (!isLoading && actas.length === 0) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="alert alert-info max-w-lg">
          <span>
            No se encontraron actas de entrega para la factura #{id_factura}.
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen px-4 md:px-6 pb-6">
      {/* Header / volver */}
      <section className="w-full mb-4 pt-4 flex items-center justify-between gap-2">
        <ButtonLink to={`/solicitudes/facturacion/${id}`} label="Volver a actas" direction="back" />
        <div className="text-sm opacity-70">
          Factura asociada:{" "}
          <span className="font-semibold">#{id_factura}</span>
        </div>
      </section>

      {/* Listado de actas en forma de tarjetas */}
      <section className="space-y-6">
        {isLoading && (
          <div className="card bg-white border border-base-300/60 shadow-sm rounded-2xl">
            <div className="card-body">
              <span className="loading loading-spinner loading-sm mr-2" />
              Cargando actas de entrega…
            </div>
          </div>
        )}

        {!isLoading &&
          actas.map((acta) => (
            <article
              key={acta.id_acta}
              className="card bg-white border border-base-300/60 shadow-sm rounded-2xl"
            >
              <div className="card-body">
                {/* Encabezado del acta */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <h1 className="text-lg md:text-xl font-bold tracking-tight">
                        Acta de entrega #{acta.id_acta}
                      </h1>
                      <p className="text-xs opacity-70">
                        id_factura:{" "}
                        <span className="font-semibold">
                          #{acta.id_factura || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 opacity-70" />
                      <span className="opacity-70">Fecha de entrega:</span>
                      <span className="font-medium">
                        {fmtFecha(acta.fecha_entrega)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {acta.estado === "cerrada" ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      )}
                      <span className="opacity-70">Estado:</span>
                      <span
                        className={`badge ${estadoBadgeClass(acta.estado)}`}
                      >
                        {acta.estado === "borrador" ? "Borrador" : "Cerrada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Responsables / observaciones en tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {/* Responsable */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-5 h-5" />
                      <h2 className="text-base font-semibold">Responsable</h2>
                    </div>

                    <div className="card bg-base-100 border border-base-300/60 rounded-xl shadow-sm">
                      <div className="card-body py-3 px-4">
                        <div className="text-xs opacity-70 mb-1">Nombre</div>
                        <div className="font-medium text-sm">
                          {acta.responsable || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                      <PenLine className="w-4 h-4" />
                      <span>
                        Confirma la entrega del vehículo/equipos según los
                        términos acordados.
                      </span>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <h2 className="text-base font-semibold">Observaciones</h2>
                    </div>

                    <div className="card bg-base-100 border border-base-300/60 rounded-xl shadow-sm">
                      <div className="card-body py-3 px-4 min-h-[80px]">
                        {acta.observaciones &&
                        acta.observaciones.trim() !== "" ? (
                          <p className="whitespace-pre-wrap text-sm">
                            {acta.observaciones}
                          </p>
                        ) : (
                          <p className="text-sm opacity-70">
                            Sin observaciones.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Firma */}
                <div className="mt-6">
                  <h2 className="text-base font-semibold mb-2">Firma</h2>
                  <FirmaView firma_url={acta.firma_url} />
                </div>

                {/* Fotos */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileImage className="w-5 h-5" />
                    <h2 className="card-title text-lg">Registro fotográfico</h2>
                  </div>

                  <FotosGrid fotos={acta.fotos || []} />
                </div>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
};

export default ActaFinal;
