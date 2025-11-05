// src/features/entregas/ActaEntregaFormulario.tsx
import React, { useMemo, useState, useCallback, useRef } from "react";
import { useModalStore } from "../../store/modalStore";
import { useAuthStore } from "../../store/auth.store";
import Swal from "sweetalert2";

/* Tipos locales (sin importar hooks externos) */
type EstadoActa = "borrador" | "cerrada";

type Props = {
  id_factura: number;
  responsableDefault?: string;  // fallback si no hay usuario en el store
  onSuccess?: (id_acta: number) => void;
};

/* Utils locales */
const toMySQLDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

const ActaEntregaFormulario: React.FC<Props> = ({ id_factura, responsableDefault, onSuccess }) => {
  const close = useModalStore((s) => s.close);
  const user = useAuthStore((s) => s.user);

  /* Responsable desde el contexto */
  const responsable = useMemo(
    () => user?.name || user?.username || responsableDefault || "",
    [user?.name, user?.username, responsableDefault]
  );

  /* Estado del formulario */
  const [fechaEntrega, setFechaEntrega] = useState<string>(() => toMySQLDateTime(new Date()));
  const [observaciones, setObservaciones] = useState<string>("");
  const [cerrarActa, setCerrarActa] = useState<boolean>(true);

  /* Firma (imagen) */
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [firmaPreview, setFirmaPreview] = useState<string | null>(null);

  /* Fotos (múltiples) */
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  /* Simulación envío */
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  /* Validaciones */
  const puedeEnviar = useMemo(() => {
    if (!id_factura || !fechaEntrega || !responsable) return false;
    if (cerrarActa) {
      return !!firmaFile && files.length >= 1;
    }
    return true;
  }, [id_factura, fechaEntrega, responsable, cerrarActa, firmaFile, files.length]);

  /* Handlers firma */
  const onFirmaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFirmaFile(f);
    setFirmaPreview(f ? await readAsDataURL(f) : null);
  };

  /* Handlers fotos (input y drag&drop) */
  const dropRef = useRef<HTMLDivElement | null>(null);

  const onFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      /image\/|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(f.type || f.name)
    );
    if (dropped.length === 0) return;

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

  /* Submit SIMULADO (sin hooks ni requests) */
  const onSubmit = async () => {
    if (!puedeEnviar || submitting) return;

    try {
      setSubmitting(true);
      setProgress(10);

      // Armamos el FormData solo para simular lo que se enviaría
      const fd = new FormData();
      fd.append("id_factura", String(id_factura));
      fd.append("fecha_entrega", fechaEntrega);
      fd.append("responsable", responsable);
      fd.append("estado", (cerrarActa ? "cerrada" : "borrador") as EstadoActa);
      if (observaciones) fd.append("observaciones", observaciones);
      if (firmaFile) fd.append("firma_file", firmaFile);
      files.forEach((f) => fd.append("fotos[]", f));
      fd.append("_multipart", "1");

      // Progreso ficticio
      await new Promise<void>((resolve) => {
        let p = 10;
        const t = setInterval(() => {
          p = Math.min(95, p + Math.ceil(Math.random() * 18));
          setProgress(p);
          if (p >= 95) {
            clearInterval(t);
            resolve();
          }
        }, 120);
      });

      // Pausa final para “respuesta”
      await new Promise((r) => setTimeout(r, 600));
      setProgress(100);

      const fakeId = Date.now();
      await Swal.fire({
        icon: "success",
        title: cerrarActa ? "Entrega registrada" : "Acta en borrador",
        timer: 1400,
        showConfirmButton: false,
      });

      onSuccess?.(fakeId);
      close();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo registrar el acta (simulado)." });
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  /* UI */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emerald-900">Acta de entrega</h3>
          <p className="text-xs text-emerald-800/80">Adjunta la firma del cliente y las fotos de soporte.</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-600/10 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-medium">
          Factura #{id_factura}
        </span>
      </div>

      {/* Fecha + Responsable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fecha y hora de entrega</span>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border-slate-300 focus:border-emerald-400 focus:ring-emerald-300"
            value={fechaEntrega.replace(" ", "T").slice(0, 16)}
            onChange={(e) => {
              const [d, t] = e.target.value.split("T");
              setFechaEntrega(`${d} ${t}:00`);
            }}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Responsable</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border-slate-300 bg-slate-100"
            value={responsable}
            readOnly
          />
          <span className="text-[11px] text-slate-500">Se toma del usuario logueado.</span>
        </label>
      </div>

      {/* Observaciones */}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Observaciones</span>
        <textarea
          className="mt-1 w-full rounded-xl border-slate-300 focus:border-emerald-400 focus:ring-emerald-300"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas de la entrega (opcional)"
        />
      </label>

      {/* Firma del cliente (imagen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Firma del cliente (imagen)</span>
          <input
            type="file"
            accept="image/*,.png,.jpg,.jpeg,.webp"
            className="mt-1 w-full rounded-xl border-slate-300 focus:border-emerald-400 focus:ring-emerald-300"
            onChange={onFirmaChange}
          />
          {firmaFile && (
            <div className="mt-3 flex items-center gap-3">
              {firmaPreview ? (
                <img
                  src={firmaPreview}
                  alt="Firma"
                  className="h-16 w-28 object-contain rounded-lg border border-slate-200 bg-white"
                />
              ) : null}
              <div className="text-xs text-slate-600">
                <div><b>{firmaFile.name}</b></div>
                <div>{formatBytes(firmaFile.size)}</div>
                <button
                  type="button"
                  className="mt-1 text-rose-600 hover:underline"
                  onClick={() => { setFirmaFile(null); setFirmaPreview(null); }}
                >
                  Quitar firma
                </button>
              </div>
            </div>
          )}
          {cerrarActa && !firmaFile && (
            <p className="text-xs text-rose-600 mt-1">* Requerida para cerrar el acta.</p>
          )}
        </label>

        <label className="inline-flex items-center gap-2 md:mt-7">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            checked={cerrarActa}
            onChange={(e) => setCerrarActa(e.target.checked)}
          />
          <span className="text-sm text-slate-700">Cerrar acta al enviar (estado = "cerrada")</span>
        </label>
      </div>

      {/* Zona drag & drop de fotos */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="rounded-2xl border-2 border-dashed border-slate-300 p-5 bg-slate-50 hover:bg-slate-100 transition ring-0"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-700">Arrastra y suelta fotos aquí</p>
          <p className="text-xs text-slate-500">o</p>
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
          <p className="mt-2 text-[11px] text-slate-500">
            Formatos: JPG, PNG, WEBP. {files.length > 0 ? `${files.length} seleccionadas.` : "Puedes seleccionar varias."}
          </p>
        </div>

        {/* Previews */}
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="relative group rounded-xl border border-slate-200 bg-white p-2">
                {previews[i] ? (
                  <img src={previews[i]} alt={f.name} className="h-28 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-28 w-full rounded-lg bg-slate-100" />
                )}
                <div className="mt-2 text-[11px] text-slate-600 truncate">{f.name}</div>
                <div className="text-[10px] text-slate-400">{formatBytes(f.size)}</div>
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

        {cerrarActa && files.length < 1 && (
          <p className="mt-2 text-xs text-rose-600">* Para cerrar el acta se requiere al menos una foto.</p>
        )}
      </div>

      {/* Progreso simulado */}
      {submitting && (
        <div className="w-full">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">{progress}%</div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="btn btn-sm bg-slate-100 border-slate-200" onClick={close} disabled={submitting}>
          Cancelar
        </button>
        <button
          className={`btn btn-sm text-white ${puedeEnviar ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-300 cursor-not-allowed"}`}
          onClick={onSubmit}
          disabled={!puedeEnviar || submitting}
        >
          {submitting ? "Guardando…" : cerrarActa ? "Registrar entrega" : "Guardar borrador"}
        </button>
      </div>
    </div>
  );
};

export default ActaEntregaFormulario;
