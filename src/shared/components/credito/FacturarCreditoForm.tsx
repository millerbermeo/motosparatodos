import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegistrarSolicitudFacturacion } from "../../../services/solicitudServices";
import { useAuthStore } from "../../../store/auth.store";

const AGENCIAS = ["Sucursal Norte", "Sucursal Centro", "Sucursal Sur"];

type Props = {
  codigoCredito: string;
  idCotizacion?: string;
  clienteNombre: string;

  distribuidorasActivas: any[];
  loadingDistribuidoras: boolean;
  errorDistribuidoras: unknown;
};

// -------------------- Helpers de archivos / preview --------------------
function isImage(file: File) {
  return /^image\/(png|jpe?g)$/i.test(file.type);
}

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

type FilePreview = { file: File; url: string };

function useFilesPreviews(files: File[]) {
  const [items, setItems] = useState<FilePreview[]>([]);

  useEffect(() => {
    if (!files.length) {
      setItems([]);
      return;
    }

    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems(next);

    return () => {
      next.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [files]);

  return items;
}

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {label} {required ? <span className="text-rose-600">*</span> : null}
          </p>
          {helper ? (
            <p className="mt-1 text-[11px] text-slate-500 leading-4">{helper}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3">{children}</div>

      {error ? <p className="text-xs text-rose-600 mt-2">{error}</p> : null}

      {below ? <div className="mt-3">{below}</div> : null}
    </div>
  );
};

const PreviewCard: React.FC<{ item: FilePreview; onRemove?: () => void }> = ({
  item,
  onRemove,
}) => {
  const { file, url } = item;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
      title={file.name}
    >
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-700 truncate">{file.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {(file.size / 1024).toFixed(0)} KB
          </span>
          {onRemove ? (
            <button
              type="button"
              className="text-[11px] text-rose-600"
              onClick={onRemove}
              aria-label="Quitar archivo"
              title="Quitar"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {isImage(file) ? (
        <div className="bg-white border-t border-slate-200">
          <img src={url} alt={file.name} className="w-full object-contain max-h-56" />
        </div>
      ) : isPdf(file) ? (
        <div className="bg-white border-t border-slate-200 px-3 py-4 text-[11px] text-slate-600">
          PDF cargado (sin vista previa aquí). Se enviará al guardar.
        </div>
      ) : (
        <div className="bg-white border-t border-slate-200 px-3 py-4 text-[11px] text-slate-600">
          Archivo cargado (sin vista previa). Se enviará al guardar.
        </div>
      )}
    </div>
  );
};

const SmallOthersGrid: React.FC<{
  items: FilePreview[];
  onRemove: (file: File) => void;
  onClear: () => void;
}> = ({ items, onRemove, onClear }) => {
  if (!items.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">
          Otros documentos ({items.length})
        </p>
        <button
          type="button"
          className="text-xs text-slate-600 underline"
          onClick={onClear}
        >
          Limpiar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ file, url }) => (
          <div
            key={fileKey(file)}
            className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
            title={file.name}
          >
            <div className="px-2 py-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-700 truncate">{file.name}</p>
              <button
                type="button"
                className="text-[11px] text-rose-600"
                onClick={() => onRemove(file)}
                aria-label="Quitar documento"
                title="Quitar"
              >
                ✕
              </button>
            </div>

            {isImage(file) ? (
              <div className="bg-white border-t border-slate-200">
                <img src={url} alt={file.name} className="w-full object-cover h-24" />
              </div>
            ) : isPdf(file) ? (
              <div className="bg-white border-t border-slate-200 h-24 flex items-center justify-center">
                <span className="text-[11px] text-slate-600 px-2 text-center">
                  PDF
                </span>
              </div>
            ) : (
              <div className="bg-white border-t border-slate-200 h-24 flex items-center justify-center">
                <span className="text-[11px] text-slate-600 px-2 text-center">
                  Archivo
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
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
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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

  // previews
  const cedulaPreviews = useFilesPreviews(cedulaFiles);
  const manifiestoPreviews = useFilesPreviews(manifiestoFiles);
  const otrosPreviews = useFilesPreviews(otrosDocs);

  // helpers otros
  const addOtrosDocs = (incoming?: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const newFiles = Array.from(incoming);

    setOtrosDocs((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      newFiles.forEach((f) => map.set(fileKey(f), f));
      return Array.from(map.values());
    });
  };

  const removeOtro = (file: File) => {
    setOtrosDocs((prev) => prev.filter((f) => fileKey(f) !== fileKey(file)));
  };

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

      registrarSolicitud(fd, {
        onSuccess: () => {
          const isAdmin =
            user?.rol === "Administrador" ||
            user?.rol === "Lider_credito_cartera" ||
            user?.rol === "Aux_cartera";

          if (isAdmin) navigate("/solicitudes");
          else navigate(`/creditos/detalle/facturar-credito/${codigoCredito}`);
        },
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
      navigate,
      user?.rol,
      distribuidoraSeleccionada,
    ]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-md p-4 md:p-6 lg:p-7">
      <div className="mb-6 text-center space-y-1">
        <h3 className="text-lg md:text-xl font-semibold text-slate-900">
          Solicitud de facturación (Crédito)
        </h3>
        <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
          Completa los datos para registrar la solicitud. Los campos marcados con{" "}
          <span className="text-rose-600">*</span> son obligatorios.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Columna izquierda */}
          <div className="space-y-4">
            {/* Distribuidora (OPCIONAL) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700">
                Distribuidora (opcional)
              </label>
              <select
                className="mt-2 select select-bordered w-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
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
                <p className="mt-2 text-xs text-slate-500">
                  Cargando distribuidoras…
                </p>
              ) : null}
              {!!errorDistribuidoras ? (
                <p className="mt-2 text-xs text-rose-600">
                  No se pudieron cargar distribuidoras.
                </p>
              ) : null}

              <p className="mt-2 text-[11px] text-slate-500">
                Si no aplica, puedes dejar este campo vacío.
              </p>
            </div>

            {/* Recibo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700">
                Recibo de pago N° <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="mt-2 input input-bordered w-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="Digite el número de recibo de pago"
                value={numeroRecibo}
                onChange={(e) => setNumeroRecibo(e.target.value)}
                required
              />
            </div>

            {/* Observaciones */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700">
                Observaciones <span className="text-rose-600">*</span>
              </label>
              <textarea
                className="mt-2 textarea textarea-bordered w-full bg-slate-50 min-h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
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
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="file-input file-input-bordered w-full bg-slate-50"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setCedulaFiles(file ? [file] : []);
                }}
                required
              />

              {cedulaPreviews.length ? (
                <div className="mt-3 space-y-3">
                  {cedulaPreviews.map((p) => (
                    <PreviewCard
                      key={fileKey(p.file)}
                      item={p}
                      onRemove={() => setCedulaFiles([])}
                    />
                  ))}
                </div>
              ) : null}
            </UploadBlock>

            {/* Manifiesto (opcional) */}
            <UploadBlock
              label="Manifiesto"
              helper="Opcional. Puedes adjuntarlo (PDF o imagen)."
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="file-input file-input-bordered w-full bg-slate-50"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setManifiestoFiles(file ? [file] : []);
                }}
              />

              {manifiestoPreviews.length ? (
                <div className="mt-3 space-y-3">
                  {manifiestoPreviews.map((p) => (
                    <PreviewCard
                      key={fileKey(p.file)}
                      item={p}
                      onRemove={() => setManifiestoFiles([])}
                    />
                  ))}
                </div>
              ) : null}
            </UploadBlock>

            {/* Otros documentos */}
            <UploadBlock
              label="Otros documentos"
              helper="Opcional. Puedes subir muchos y se acumulan. Abajo se verán todos juntos."
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="file-input file-input-bordered w-full bg-slate-50"
                onChange={(e) => {
                  addOtrosDocs(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              <div className="mt-3">
                <SmallOthersGrid
                  items={otrosPreviews}
                  onRemove={removeOtro}
                  onClear={clearOtros}
                />
              </div>
            </UploadBlock>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <Link to={`/creditos/detalle/${codigoCredito}`}>
            <button
              type="button"
              className="btn btn-ghost md:btn-outline text-slate-700"
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
