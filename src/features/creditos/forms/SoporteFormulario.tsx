// src/components/solicitudes/SoporteFormulario.tsx
import React from "react";

type Props = {
  maxFiles?: number;      // default 20
  maxSizeMB?: number;     // default 2
  onUpload?: (files: File[]) => Promise<void> | void; // conéctalo a tu API
};

const SoporteFormulario: React.FC<Props> = ({
  maxFiles = 20,
  maxSizeMB = 2,
  onUpload,
}) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = () => inputRef.current?.click();

  const validateAndAdd = (incoming: FileList | File[]) => {
    const errs: string[] = [];
    const current = [...files];

    Array.from(incoming).forEach((f) => {
      if (current.length >= maxFiles) {
        errs.push(`Se alcanzó el máximo de ${maxFiles} archivos.`);
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        errs.push(`"${f.name}" supera ${maxSizeMB} MB.`);
        return;
      }
      // Evitar duplicados por nombre+tamaño
      const dup = current.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
      if (dup) return;
      current.push(f);
    });

    setErrors(errs);
    setFiles(current);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) validateAndAdd(e.target.files);
    e.target.value = ""; // permite volver a elegir el mismo archivo
  };

  // Drag & Drop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) validateAndAdd(e.dataTransfer.files);
  };

  const removeAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const clearAll = () => {
    setFiles([]);
    setErrors([]);
  };

  const handleUpload = async () => {
    try {
      setBusy(true);
      if (onUpload) await onUpload(files);
      // si tu API devuelve éxito, limpia la selección:
      // clearAll();
      console.log("Archivos a subir:", files);
    } catch (e) {
      console.error(e);
      setErrors([`Ocurrió un error al subir los archivos.`]);
    } finally {
      setBusy(false);
    }
  };

  // helpers
  const prettySize = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

  const isImage = (f: File) => f.type.startsWith("image/");
  const isPdf = (f: File) => f.type === "application/pdf";

  const grid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  return (
    <div className="space-y-4">
      <h3 className="text-center text-lg font-semibold">
        Adjunte los soportes del crédito <span className="font-normal">(Opcional)</span>
      </h3>

      <div className="alert bg-blue-50 text-blue-700 px-4 py-3 rounded">
        Adjunte hasta <b>{maxFiles}</b> archivos. Cada uno ≤ <b>{maxSizeMB} MB</b>.
        Si adjuntas soportes nuevos, reemplazarán los anteriores.
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed rounded-xl p-6 text-center transition hover:bg-base-100"
      >
        <p className="mb-3">Arrastra y suelta aquí, o</p>
        <button type="button" onClick={openPicker} className="btn btn-info text-white">
          📁 Buscar…
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 text-red-700 p-3 rounded">
          {errors.map((e, i) => (
            <div key={i}>• {e}</div>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className={grid}>
        {files.map((f, idx) => {
          const url = isImage(f) ? URL.createObjectURL(f) : undefined;
          return (
            <div key={`${f.name}-${idx}`} className="rounded-xl shadow-sm border p-3 flex flex-col gap-2">
              {/* Miniatura */}
              <div className="aspect-[4/3] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
                {isImage(f) ? (
                  <img src={url} alt={f.name} className="object-cover w-full h-full" onLoad={() => url && URL.revokeObjectURL(url)} />
                ) : isPdf(f) ? (
                  <a
                    href={URL.createObjectURL(f)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver PDF
                  </a>
                ) : (
                  <div className="text-slate-500 text-sm">Archivo</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="text-xs text-slate-500">{prettySize(f.size)}</div>
                <div className="truncate font-medium" title={f.name}>{f.name}</div>
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => removeAt(idx)}
                >
                  Quitar
                </button>
                {isPdf(f) && (
                  <a
                    href={URL.createObjectURL(f)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Abrir
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={!files.length}>
          Limpiar selección
        </button>
        <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={!files.length || busy}>
          {busy ? "Subiendo..." : "Subir soportes"}
        </button>
      </div>
    </div>
  );
};

export default SoporteFormulario;
