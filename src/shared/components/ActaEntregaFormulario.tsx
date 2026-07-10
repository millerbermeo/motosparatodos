// src/features/entregas/ActaEntregaFormulario.tsx
import React, { useMemo, useState, useCallback, useRef } from "react";
import { useModalStore } from "../../store/modalStore";
import { useAuthStore } from "../../store/auth.store";
import Swal from "sweetalert2";
import { PenLine, UploadCloud, CheckCircle2, X } from "lucide-react";
import { useRegistrarActaEntrega } from "../../services/solicitudServices"; // ajusta el path exacto
import { validateFileInput, validateFile } from "../../utils/fileValidation";
import { alert } from "../../utils/alerts";

type EstadoActa = "borrador" | "cerrada";

type Props = {
  id_factura: number;
  responsableDefault?: string;
  onSuccess?: (id_acta?: number) => void;
};

const toMySQLDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const ActaEntregaFormulario: React.FC<Props> = ({
  id_factura,
  responsableDefault,
  onSuccess,
}) => {
  const close = useModalStore((s) => s.close);
  const user = useAuthStore((s) => s.user);

  // responsable oculto
  const responsable = useMemo(
    () => user?.name || user?.username || responsableDefault || "",
    [user?.name, user?.username, responsableDefault]
  );

  // fecha/hora ocultas
  const [fechaEntrega] = useState<string>(() => toMySQLDateTime(new Date()));
  const estado: EstadoActa = "cerrada";

  const [observaciones, setObservaciones] = useState("");
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [firmaPreview, setFirmaPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // ⬅️ Hook correcto
  const { mutate: registrarActa, isPending } = useRegistrarActaEntrega();

  const puedeEnviar = useMemo(() => {
    if (!id_factura || !fechaEntrega || !responsable) return false;
    return !!firmaFile && files.length >= 1;
  }, [id_factura, fechaEntrega, responsable, firmaFile, files.length]);

  const onFirmaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateFileInput(e)) {
      setFirmaFile(null);
      setFirmaPreview(null);
      return;
    }
    const f = e.target.files?.[0] ?? null;
    setFirmaFile(f);
    setFirmaPreview(f ? await readAsDataURL(f) : null);
  };

  const onFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateFileInput(e)) return;
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => [...prev, ...arr]);
    const newPreviews = await Promise.all(arr.map((f) => readAsDataURL(f)));
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.currentTarget.value = "";
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files || []).filter(
      (f) =>
        /image\/|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(f.type || f.name) &&
        validateFile(f).ok // tipo permitido + tamaño <= 1.5 MB
    );
    if (!dropped.length) return;

    setFiles((prev) => [...prev, ...dropped]);
    const newPrev = await Promise.all(dropped.map((f) => readAsDataURL(f)));
    setPreviews((prev) => [...prev, ...newPrev]);
    dropRef.current?.classList.remove("ring-emerald-400");
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add("ring-emerald-400");
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove("ring-emerald-400");
  };

  const removeFoto = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar || isPending) return;

    if (!responsable) {
      await Swal.fire({
        icon: "warning",
        title: "Sin responsable",
        text: "No se encontró un responsable para el acta.",
      });
      return;
    }

    const ok = await alert.confirm({
      title: "¿Registrar acta de entrega?",
      html: `Se registrará el acta de la <b>factura #${id_factura}</b> con la firma del cliente y ${files.length} foto(s). El acta quedará <b>cerrada</b>.`,
      confirmText: "Sí, registrar",
    });
    if (!ok) return;

    const fd = new FormData();
    fd.append("id_factura", String(id_factura));
    fd.append("fecha_entrega", fechaEntrega);
    fd.append("responsable", responsable);
    fd.append("estado", estado);      // 'cerrada'
    fd.append("cerrar_acta", "1");

    if (observaciones) fd.append("observaciones", observaciones);
    if (firmaFile) fd.append("firma_file", firmaFile);
    files.forEach((f) => fd.append("fotos[]", f));
    fd.append("_multipart", "1");

    // si quieres que registrar_acta también actualice por cotización:
    // fd.append("id_cotizacion", String(id_cotizacion));

registrarActa(fd, {
  onSuccess: (resp) => {
    const idActaNum =
      resp?.id_acta !== undefined
        ? Number(resp.id_acta)
        : undefined;

    onSuccess?.(
      idActaNum !== undefined && !Number.isNaN(idActaNum)
        ? idActaNum
        : undefined
    );

    close(); // cierro el modal

    // Espera a que se vea el alert de éxito (timer 1600ms) antes de recargar
    setTimeout(() => window.location.reload(), 1700);
  },
});

  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {/* Header */}
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emerald-900">
            Acta de entrega
          </h3>
          <p className="text-xs text-success/80">
            Adjunta la firma del cliente y las fotos de soporte.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-600/10 text-success border border-success/30 px-3 py-1 text-xs font-medium">
          Factura #{id_factura}
        </span>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="fecha_entrega" value={fechaEntrega} />
      <input type="hidden" name="responsable" value={responsable} />
      <input type="hidden" name="cerrar_acta" value="1" />
      <input type="hidden" name="estado" value="cerrada" />

      {/* Observaciones */}
      <label className="block">
        <span className="text-sm font-medium text-base-content">
          Observaciones
        </span>
        <textarea
          className="mt-1 w-full rounded-xl bg-base-200 border border-base-300 focus:border-emerald-400 p-3 focus:ring-emerald-300"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas de la entrega (opcional)"
        />
      </label>

      {/* Firma */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-base-content inline-flex items-center gap-1.5">
            <PenLine className="w-4 h-4 text-emerald-600" />
            Firma del cliente <span className="text-error">*</span>
          </span>
          {firmaFile && (
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Firma cargada
            </span>
          )}
        </div>

        {!firmaFile ? (
          /* Estado vacío: contenedor claro e informativo */
          <label
            className={`flex flex-col items-center justify-center text-center gap-2 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition
              border-emerald-300 bg-success/5 hover:bg-success/10 hover:border-emerald-400`}
          >
            <input
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={onFirmaChange}
            />
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-base-content">
              Subir imagen de la firma del cliente
            </p>
            <p className="text-xs text-base-content/60">
              Haz clic para seleccionar una imagen (JPG, PNG, WEBP · máx. 1.5 MB)
            </p>
            <span className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium">
              Seleccionar firma
            </span>
          </label>
        ) : (
          /* Estado cargado: preview + datos + quitar */
          <div className="flex items-center gap-4 rounded-2xl border border-success/30 bg-success/5 p-4">
            {firmaPreview && (
              <img
                src={firmaPreview}
                alt="Firma del cliente"
                className="h-20 w-36 object-contain rounded-lg border border-base-300 bg-base-100"
              />
            )}
            <div className="min-w-0 flex-1 text-xs text-base-content/70">
              <div className="font-medium text-base-content truncate">{firmaFile.name}</div>
              <div>{formatBytes(firmaFile.size)}</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-error hover:bg-error/10 text-xs font-medium"
              onClick={() => { setFirmaFile(null); setFirmaPreview(null); }}
            >
              <X className="w-3.5 h-3.5" /> Quitar
            </button>
          </div>
        )}

        {!firmaFile && (
          <p className="text-xs text-error mt-1">* Requerida para registrar el acta.</p>
        )}
        <p className="text-xs text-base-content/60 mt-1">
          El acta se cerrará automáticamente al guardar.
        </p>
      </div>

      {/* Fotos */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="rounded-2xl border-2 border-dashed border-base-300 p-5 bg-base-200 hover:bg-base-200 transition ring-0"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-base-content">
            Arrastra y suelta fotos aquí
          </p>
          <p className="text-xs text-base-content/60">o</p>
          <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
            <input
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp"
              multiple
              className="hidden"
              onChange={onFotosChange}
            />
            Seleccionar archivos
          </label>
          <p className="mt-2 text-[11px] text-base-content/60">
            Formatos: JPG, PNG, WEBP.{" "}
            {files.length > 0
              ? `${files.length} seleccionadas.`
              : "Puedes seleccionar varias."}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="relative group rounded-xl border border-base-300 bg-base-100 p-2"
              >
                {previews[i] ? (
                  <img
                    src={previews[i]}
                    alt={f.name}
                    className="h-28 w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-28 w-full rounded-lg bg-base-200" />
                )}
                <div className="mt-2 text-[11px] text-base-content/70 truncate">
                  {f.name}
                </div>
                <div className="text-[10px] text-base-content/50">
                  {formatBytes(f.size)}
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 px-2 py-1 text-[10px] rounded bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition"
                  onClick={() => removeFoto(i)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length < 1 && (
          <p className="mt-2 text-xs text-error">
            * Se requiere al menos una foto para registrar el acta.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="btn btn-sm bg-base-200 border-base-300"
          onClick={close}
          disabled={isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-sm text-white ${
            puedeEnviar
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-emerald-300 cursor-not-allowed"
          }`}
          disabled={!puedeEnviar || isPending}
        >
          {isPending ? "Guardando…" : "Registrar entrega"}
        </button>
      </div>
    </form>
  );
};

export default ActaEntregaFormulario;
