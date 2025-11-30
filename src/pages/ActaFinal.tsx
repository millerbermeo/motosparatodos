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
  Download,
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

/* =======================
   Firma
   ======================= */

const FirmaView: React.FC<{ firma_url: string | null }> = ({ firma_url }) => {
  const url = buildImageUrl(firma_url || undefined);
  if (!url) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
        <PenLine className="w-4 h-4 opacity-70" />
        <span>Sin firma registrada</span>
      </div>
    );
  }
  return (
    <div className="inline-flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm w-full sm:w-auto">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Firma del cliente
      </span>
      <div className="bg-white rounded-xl border border-slate-200 p-2 relative">
        {/* Botón de descarga de la firma */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download="firma-cliente.png"
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download className="w-3 h-3" />
          <span>Descargar</span>
        </a>

        <img
          src={url}
          alt="Firma del cliente"
          className="max-h-32 object-contain"
        />
      </div>
    </div>
  );
};

/* =======================
   Grid de fotos
   ======================= */

const FotosGrid: React.FC<{ fotos: string[] }> = ({ fotos }) => {
  const handleDownloadAll = () => {
    fotos.forEach((f) => {
      const url = buildImageUrl(f);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  if (!fotos || fotos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3">
        <FileImage className="w-4 h-4 opacity-70" />
        <span>No hay fotos registradas para este acta.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Botón para descargar todas las fotos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-xs text-slate-500">
          Total de fotos:{" "}
          <span className="font-semibold text-slate-700">{fotos.length}</span>
        </p>
        <button
          type="button"
          onClick={handleDownloadAll}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 text-xs font-medium hover:bg-emerald-100 transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Descargar todas</span>
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((f, i) => {
          const url = buildImageUrl(f);
          return (
            <article
              key={`${f}-${i}`}
              className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
            >
              {url ? (
                <>
                  {/* Botón de descarga individual */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`foto-${i + 1}.jpg`}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-50 z-10"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar</span>
                  </a>

                  <figure className="w-full h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  </figure>
                </>
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-xs text-slate-400 bg-slate-50">
                  Foto no disponible
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-[11px] font-medium text-slate-500">
                  Foto #{i + 1}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

/* =======================
   Componente principal
   ======================= */

const ActaFinal: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const id_factura = id ? Number(id) : undefined;

  const {
    data: listResp,
    isLoading,
    error,
  } = useActas({
    factura: id_factura,
    limit: 50,
  });

  const actas: ActaEntrega[] = listResp?.data ?? [];
  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  /* ===== Estados especiales ===== */

  if (!id_factura || id_factura <= 0) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg w-full rounded-2xl border border-rose-200 bg-white shadow-lg px-5 py-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-1" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-rose-600">
              Parámetro de factura inválido
            </h2>
            <p className="text-sm text-slate-600">
              Falta el parámetro{" "}
              <code className="bg-slate-100 px-1.5 rounded">id</code> en la URL.
              Debe ser{" "}
              <code className="bg-slate-100 px-1.5 rounded">
                /actas/final/:id
              </code>{" "}
              donde <strong>id</strong> es el <strong>id_factura</strong>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg w-full rounded-2xl border border-amber-200 bg-amber-50 shadow-lg px-5 py-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-amber-700">
              Error al cargar actas
            </h2>
            <p className="text-sm text-amber-800">
              Hubo un problema cargando las actas de entrega para la factura{" "}
              <span className="font-semibold">#{id_factura}</span>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!isLoading && actas.length === 0) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg w-full rounded-2xl border border-sky-200 bg-white shadow-lg px-5 py-4 flex gap-3">
          <FileText className="w-5 h-5 text-sky-500 mt-1" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-sky-700">
              Sin actas registradas
            </h2>
            <p className="text-sm text-slate-600">
              No se encontraron actas de entrega para la factura{" "}
              <span className="font-semibold">#{id_factura}</span>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ===== Vista principal ===== */

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      {/* Header / volver */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-9xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-semibold text-slate-900 leading-tight">
                Actas de entrega
              </h1>
              <p className="text-xs text-slate-500">
                Factura asociada:{" "}
                <span className="font-semibold text-slate-800">
                  #{id_factura}
                </span>{" "}
                · {actas.length} acta
                {actas.length !== 1 && "s"} registrada
                {actas.length !== 1 && "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink
              to={`/solicitudes/facturacion/${id}`}
              label="Volver a facturación"
              direction="back"
            />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Listado de actas en forma de tarjetas */}
        <section className="space-y-5">
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center gap-3">
              <span className="loading loading-spinner loading-sm text-emerald-600" />
              <span className="text-sm text-slate-600">
                Cargando actas de entrega…
              </span>
            </div>
          )}

          {!isLoading &&
            actas.map((acta, idx) => (
              <article
                key={acta.id_acta}
                className="relative rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Barra lateral de estado */}
                <div
                  className={`absolute inset-y-0 left-0 w-1.5 ${
                    acta.estado === "cerrada"
                      ? "bg-emerald-500"
                      : "bg-amber-400"
                  }`}
                />
                <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 py-5">
                  {/* Encabezado del acta */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-9 w-9 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base md:text-lg font-semibold tracking-tight text-slate-900">
                            Acta de entrega #{acta.id_acta}
                          </h2>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                            #{idx + 1} de {actas.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Factura vinculada:{" "}
                          <span className="font-semibold text-slate-800">
                            #{acta.id_factura || "—"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarDays className="w-4 h-4 opacity-70" />
                        <span className="text-xs sm:text-sm">
                          Fecha de entrega:{" "}
                          <span className="font-medium text-slate-800">
                            {fmtFecha(acta.fecha_entrega)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {acta.estado === "cerrada" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="text-xs text-slate-500">Estado:</span>
                        <span
                          className={`badge ${estadoBadgeClass(
                            acta.estado
                          )} text-xs px-3 py-1 border`}
                        >
                          {acta.estado === "borrador" ? "Borrador" : "Cerrada"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="border-t border-dashed border-slate-200 my-3" />

                  {/* Responsables / observaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {/* Responsable */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <UserRound className="w-4 h-4 text-emerald-700" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Responsable de la entrega
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm">
                        <div className="text-[11px] uppercase font-semibold tracking-wide text-slate-500 mb-1">
                          Nombre del responsable
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {acta.responsable || "—"}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mt-1 text-xs text-slate-500">
                        <PenLine className="w-4 h-4 mt-0.5 opacity-70" />
                        <span>
                          Esta persona certifica la entrega del vehículo y/o
                          equipos de acuerdo con las condiciones pactadas.
                        </span>
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-sky-700" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Observaciones de la entrega
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 shadow-sm min-h-[80px]">
                        {acta.observaciones &&
                        acta.observaciones.trim() !== "" ? (
                          <p className="whitespace-pre-wrap text-sm text-slate-800">
                            {acta.observaciones}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Sin observaciones registradas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Firma + Fotos en layout vertical con mejor fondo */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] gap-6">
                    {/* Firma */}
                    <div className="bg-slate-900/5 rounded-2xl p-4 border border-slate-200/80">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-slate-500" />
                        Firma del cliente
                      </h3>
                      <FirmaView firma_url={acta.firma_url} />
                    </div>

                    {/* Fotos */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center">
                          <FileImage className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Registro fotográfico
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Evidencia visual del estado del vehículo/equipos al
                            momento de la entrega.
                          </p>
                        </div>
                      </div>

                      <FotosGrid fotos={acta.fotos || []} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </main>
  );
};

export default ActaFinal;
