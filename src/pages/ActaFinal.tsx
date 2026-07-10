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
import { fmtFecha } from "../utils/date";
import FirmaView from "../features/actas/components/FirmaView";
import FotosGrid from "../features/actas/components/FotosGrid";
import EstadoVacio from "../features/actas/components/EstadoVacio";

/* =======================
   Helpers
   ======================= */

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
      <EstadoVacio variant="error" titulo="Parámetro de factura inválido">
        Falta el parámetro{" "}
        <code className="bg-base-200 px-1.5 rounded">id</code> en la URL.
        Debe ser{" "}
        <code className="bg-base-200 px-1.5 rounded">/actas/final/:id</code>{" "}
        donde <strong>id</strong> es el <strong>id_factura</strong>.
      </EstadoVacio>
    );
  }

  if (error) {
    return (
      <EstadoVacio variant="warning" titulo="Error al cargar actas">
        Hubo un problema cargando las actas de entrega para la factura{" "}
        <span className="font-semibold">#{id_factura}</span>.
      </EstadoVacio>
    );
  }

  if (!isLoading && actas.length === 0) {
    return (
      <EstadoVacio variant="info" titulo="Sin actas registradas">
        No se encontraron actas de entrega para la factura{" "}
        <span className="font-semibold">#{id_factura}</span>.
      </EstadoVacio>
    );
  }

  /* ===== Vista principal ===== */

  return (
    <main className="w-full min-h-screen bg-linear-to-b from-base-200 via-base-200 to-base-100">
      {/* Header / volver */}
      <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur border-b border-base-300">
        <div className="max-w-9xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 border border-success/30 shadow-sm">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-semibold text-base-content leading-tight">
                Actas de entrega
              </h1>
              <p className="text-xs text-base-content/60">
                Factura asociada:{" "}
                <span className="font-semibold text-base-content">
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
      <div className="max-w-9xl mx-auto px-4 md:px-6 py-6">
        {/* Listado de actas en forma de tarjetas */}
        <section className="space-y-5">
          {isLoading && (
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <span className="loading loading-spinner loading-sm text-success" />
              <span className="text-sm text-base-content/70">
                Cargando actas de entrega…
              </span>
            </div>
          )}

          {!isLoading &&
            actas.map((acta, idx) => (
              <article
                key={acta.id_acta}
                className="relative rounded-3xl border border-base-300 bg-base-100 shadow-sm hover:shadow-lg hover:border-base-300 transition-all overflow-hidden"
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
                      <div className="mt-0.5 h-9 w-9 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-base-content" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base md:text-lg font-semibold tracking-tight text-base-content">
                            Acta de entrega #{acta.id_acta}
                          </h2>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-base-200 text-base-content/70 font-medium border border-base-300">
                            #{idx + 1} de {actas.length}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">
                          Factura vinculada:{" "}
                          <span className="font-semibold text-base-content">
                            #{acta.id_factura || "—"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                      <div className="flex items-center gap-2 text-base-content/70">
                        <CalendarDays className="w-4 h-4 opacity-70" />
                        <span className="text-xs sm:text-sm">
                          Fecha de entrega:{" "}
                          <span className="font-medium text-base-content">
                            {fmtFecha(acta.fecha_entrega) || "—"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {acta.estado === "cerrada" ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        )}
                        <span className="text-xs text-base-content/60">Estado:</span>
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
                  <div className="border-t border-dashed border-base-300 my-3" />

                  {/* Responsables / observaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {/* Responsable */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                          <UserRound className="w-4 h-4 text-success" />
                        </div>
                        <h3 className="text-sm font-semibold text-base-content">
                          Responsable de la entrega
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-base-200 border border-base-300 px-4 py-3 shadow-sm">
                        <div className="text-[11px] uppercase font-semibold tracking-wide text-base-content/60 mb-1">
                          Nombre del responsable
                        </div>
                        <div className="text-sm font-medium text-base-content">
                          {acta.responsable || "—"}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mt-1 text-xs text-base-content/60">
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
                        <div className="h-8 w-8 rounded-xl bg-info/10 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-info" />
                        </div>
                        <h3 className="text-sm font-semibold text-base-content">
                          Observaciones de la entrega
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-base-200 border border-base-300 px-4 py-3 shadow-sm min-h-20">
                        {acta.observaciones &&
                        acta.observaciones.trim() !== "" ? (
                          <p className="whitespace-pre-wrap text-sm text-base-content">
                            {acta.observaciones}
                          </p>
                        ) : (
                          <p className="text-sm text-base-content/60">
                            Sin observaciones registradas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Firma + Fotos en layout vertical con mejor fondo */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] gap-6">
                    {/* Firma */}
                    <div className="bg-base-content/5 rounded-2xl p-4 border border-base-300/80">
                      <h3 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-base-content/60" />
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
                          <h3 className="text-sm font-semibold text-base-content">
                            Registro fotográfico
                          </h3>
                          <p className="text-[11px] text-base-content/60">
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
