import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useRegistrarSolicitudFacturacion } from "../../../services/solicitudServices";
import { HeaderSolicitud } from "../solicitar-facturacion/HeaderSolicitud";
import { FileUpload } from "../FileUpload";

const AGENCIAS = ["Sucursal Norte", "Sucursal Centro", "Sucursal Sur"];

type Props = {
  codigoCredito: string;
  idCotizacion?: string;
  clienteNombre: string;

  distribuidorasActivas: any[];
  loadingDistribuidoras: boolean;
  errorDistribuidoras: unknown;
};

// -------------------- UI blocks --------------------
const UploadBlock: React.FC<{
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  below?: React.ReactNode;
}> = ({ label, required, helper, error, children, below }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-base-content">
            {label} {required ? <span className="text-error">*</span> : null}
          </p>
          {helper ? (
            <p className="mt-1 text-[11px] text-base-content/60 leading-4">{helper}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3">{children}</div>

      {error ? <p className="text-xs text-error mt-2">{error}</p> : null}

      {below ? <div className="mt-3">{below}</div> : null}
    </div>
  );
};

// -------------------- Component --------------------
const FacturarCreditoForm: React.FC<Props> = ({
  codigoCredito,
  idCotizacion,
  clienteNombre,
  distribuidorasActivas,
  loadingDistribuidoras,
  errorDistribuidoras,
}) => {
  const { mutate: registrarSolicitud, isPending } =
    useRegistrarSolicitudFacturacion();

  // estado del form
  const [distribuidoraId, setDistribuidoraId] = useState("");
  const [numeroRecibo, setNumeroRecibo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // ✅ Cédula / Manifiesto como File[] (para preview)
  const [cedulaFiles, setCedulaFiles] = useState<File[]>([]);
  const [manifiestoFiles, setManifiestoFiles] = useState<File[]>([]); // opcional

  // ✅ OTROS: acumulación real
  const [otrosDocs, setOtrosDocs] = useState<File[]>([]);

  const loggedUserName =
    (window as any)?.auth?.user?.name ||
    (window as any)?.user?.name ||
    "Usuario";

  // ✅ puede ser undefined (distribuidora opcional)
  const distribuidoraSeleccionada = useMemo(
    () =>
      distribuidorasActivas.find((d: any) => String(d.id) === distribuidoraId),
    [distribuidorasActivas, distribuidoraId]
  );

  const clearOtros = () => setOtrosDocs([]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!numeroRecibo.trim()) {
        alert("Debe ingresar el número de recibo.");
        return;
      }
      if (!cedulaFiles.length) {
        alert("Debe adjuntar la cédula.");
        return;
      }

      const agenciaRandom = AGENCIAS[Math.floor(Math.random() * AGENCIAS.length)];
      const codigo4 = String(Math.floor(1000 + Math.random() * 9000));

      const fd = new FormData();
      fd.append("agencia", agenciaRandom);

      // ✅ distribuidora opcional (si no hay, manda vacío)
      fd.append("distribuidora", distribuidoraSeleccionada?.nombre ?? "");
      fd.append("distribuidora_id", String(distribuidoraSeleccionada?.id ?? ""));

      fd.append("codigo_solicitud", codigo4);
      fd.append("codigo_credito", codigoCredito);
      if (idCotizacion) fd.append("id_cotizacion", idCotizacion);

      fd.append("nombre_cliente", clienteNombre);
      fd.append("tipo_solicitud", "Crédito directo");
      fd.append("numero_recibo", numeroRecibo);
      fd.append("resibo_pago", "");
      fd.append("facturador", loggedUserName);
      fd.append("autorizado", "Si");
      fd.append("facturado", "No");
      fd.append("entrega_autorizada", "No");
      fd.append("observaciones", observaciones);

      // adjuntos
      fd.append("cedula", cedulaFiles[0]);
      if (manifiestoFiles[0]) fd.append("manifiesto", manifiestoFiles[0]); // ✅ opcional

      // otros documentos múltiples
      otrosDocs.forEach((f) => fd.append("otros_documentos[]", f));

      Swal.fire({
        icon: "warning",
        title: "¿Enviar solicitud de facturación?",
        text: `Se registrará la solicitud de facturación para el crédito ${codigoCredito}.`,
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
      }).then((res) => {
        if (!res.isConfirmed) return;

        registrarSolicitud(fd, {
          onSuccess: () => {
            window.location.reload();
          },
        });
      });
    },
    [
      numeroRecibo,
      cedulaFiles,
      manifiestoFiles,
      otrosDocs,
      codigoCredito,
      idCotizacion,
      clienteNombre,
      loggedUserName,
      observaciones,
      registrarSolicitud,
      distribuidoraSeleccionada,
    ]
  );

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 shadow-md p-4 md:p-6 lg:p-7">

      <HeaderSolicitud tipo="credito" />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Columna izquierda */}
          <div className="space-y-4">
            {/* Distribuidora (OPCIONAL) */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-base-content">
                Distribuidora (opcional)
              </label>
              <select
                className="mt-2 select select-bordered w-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                value={distribuidoraId}
                onChange={(e) => setDistribuidoraId(e.target.value)}
                disabled={loadingDistribuidoras || !!errorDistribuidoras}
              >
                <option value="">Seleccione…</option>
                {distribuidorasActivas.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>

              {loadingDistribuidoras ? (
                <p className="mt-2 text-xs text-base-content/60">
                  Cargando distribuidoras…
                </p>
              ) : null}
              {!!errorDistribuidoras ? (
                <p className="mt-2 text-xs text-error">
                  No se pudieron cargar distribuidoras.
                </p>
              ) : null}

              <p className="mt-2 text-[11px] text-base-content/60">
                Si no aplica, puedes dejar este campo vacío.
              </p>
            </div>

            {/* Recibo */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-base-content">
                Recibo de pago N° <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="mt-2 input input-bordered w-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="Digite el número de recibo de pago"
                value={numeroRecibo}
                onChange={(e) => setNumeroRecibo(e.target.value)}
                required
              />
            </div>

            {/* Observaciones */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-base-content">
                Observaciones <span className="text-error">*</span>
              </label>
              <textarea
                className="mt-2 textarea textarea-bordered w-full bg-base-200 min-h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="Observaciones para facturación"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            {/* Cédula */}
            <UploadBlock
              label="Copia de la cédula"
              required
              helper="Adjunta la cédula (PDF o imagen). Debajo verás la vista previa."
            >
              <FileUpload
                files={cedulaFiles}
                onFilesChange={setCedulaFiles}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </UploadBlock>

            {/* Manifiesto (opcional) */}
            <UploadBlock
              label="Manifiesto"
              helper="Opcional. Puedes adjuntarlo (PDF o imagen)."
            >
              <FileUpload
                files={manifiestoFiles}
                onFilesChange={setManifiestoFiles}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </UploadBlock>

            {/* Otros documentos */}
            <UploadBlock
              label="Otros documentos"
              helper="Opcional. Puedes subir muchos y se acumulan."
            >
              <FileUpload
                files={otrosDocs}
                onFilesChange={setOtrosDocs}
                multiple
                maxFiles={20}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {otrosDocs.length > 0 && (
                <button
                  type="button"
                  className="mt-2 text-xs text-base-content/70 underline"
                  onClick={clearOtros}
                >
                  Limpiar todos
                </button>
              )}
            </UploadBlock>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-base-200 pt-4">
          <Link to={`/creditos/detalle/${codigoCredito}`}>
            <button
              type="button"
              className="btn btn-ghost md:btn-outline text-base-content"
            >
              ← Volver
            </button>
          </Link>

          <button
            type="submit"
            disabled={isPending || loadingDistribuidoras || !!errorDistribuidoras}
            className="btn btn-success bg-emerald-600 hover:bg-emerald-700 border-none text-white px-6"
          >
            {isPending ? "Enviando…" : "✓ Aceptar"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FacturarCreditoForm;
