// src/shared/components/FileUpload.tsx
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileType2,
  File as FileIcon,
  X,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  validateFile,
  ACCEPT_ATTR,
  MAX_FILE_SIZE_LABEL,
} from "../../utils/fileValidation";

const MIN_LOADING_MS = 1000;

type FileKind = "image" | "video" | "pdf" | "word" | "excel" | "ppt" | "other";

const getFileKind = (file: File): FileKind => {
  const type = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.includes("word") || ["doc", "docx"].includes(ext)) return "word";
  if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (type.includes("presentation") || ["ppt", "pptx"].includes(ext)) return "ppt";
  return "other";
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const FileKindIcon: React.FC<{ kind: FileKind; className?: string }> = ({ kind, className }) => {
  switch (kind) {
    case "pdf":
      return <FileText className={className} />;
    case "word":
      return <FileType2 className={className} />;
    case "excel":
    case "ppt":
      return <FileSpreadsheet className={className} />;
    default:
      return <FileIcon className={className} />;
  }
};

/** Genera y limpia object URLs solo para los archivos que se pueden previsualizar (imagen/video). */
const useObjectUrls = (files: File[]) => {
  const cacheRef = useRef<Map<File, string>>(new Map());

  return useMemo(() => {
    const cache = cacheRef.current;
    const next = new Map<File, string>();

    files.forEach((file) => {
      const kind = getFileKind(file);
      if (kind !== "image" && kind !== "video") return;
      const existing = cache.get(file);
      next.set(file, existing ?? URL.createObjectURL(file));
    });

    // libera las urls de archivos que ya no están
    cache.forEach((url, file) => {
      if (!next.has(file)) URL.revokeObjectURL(url);
    });

    cacheRef.current = next;
    return next;
  }, [files]);
};

export interface FileUploadProps {
  /** Archivos seleccionados (controlado por el padre) */
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Permite seleccionar más de un archivo */
  multiple?: boolean;
  /** Máximo de archivos permitidos (por defecto 1 si multiple=false, 5 si multiple=true) */
  maxFiles?: number;
  /** Atributo accept del input nativo (por defecto: tipos globales permitidos) */
  accept?: string;
  disabled?: boolean;
  /** Muestra estado de carga (ej. mientras se sube al backend) */
  loading?: boolean;
  label?: string;
  helperText?: string;
  /** Error controlado externamente (ej. respuesta del backend) */
  error?: string | null;
  /** Progreso real de subida (0-100). Si no se pasa, se anima una barra indeterminada. */
  progress?: number;
  className?: string;
  id?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  multiple = false,
  maxFiles,
  accept = ACCEPT_ATTR,
  disabled = false,
  loading = false,
  label,
  helperText,
  error,
  progress,
  className = "",
  id,
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // La animación de carga se sostiene un mínimo de 1s aunque la subida real
  // termine antes, para que no se sienta como un parpadeo.
  const [visualLoading, setVisualLoading] = useState(loading);
  const loadingStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      loadingStartedAt.current = Date.now();
      setVisualLoading(true);
      return;
    }

    const startedAt = loadingStartedAt.current;
    if (startedAt == null) {
      setVisualLoading(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
    const timer = window.setTimeout(() => {
      setVisualLoading(false);
      loadingStartedAt.current = null;
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const effectiveMaxFiles = maxFiles ?? (multiple ? 5 : 1);
  const previewUrls = useObjectUrls(files);
  const isInteractive = !disabled && !visualLoading;
  const hasRealProgress = visualLoading && typeof progress === "number" && !Number.isNaN(progress);
  const clampedProgress = hasRealProgress ? Math.min(100, Math.max(0, progress as number)) : null;

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  };

  const rejectWithMessage = (message: string) => {
    setLocalError(message);
    triggerShake();
  };

  const handleIncomingFiles = (incoming: FileList | File[]) => {
    if (!isInteractive) return;
    setLocalError(null);

    const list = Array.from(incoming);
    if (list.length === 0) return;

    const candidates = multiple ? list : list.slice(0, 1);
    const room = effectiveMaxFiles - (multiple ? files.length : 0);

    if (multiple && room <= 0) {
      rejectWithMessage(`Ya alcanzaste el máximo de ${effectiveMaxFiles} archivos.`);
      return;
    }

    const accepted: File[] = [];
    for (const file of candidates.slice(0, Math.max(room, candidates.length))) {
      const { ok } = validateFile(file);
      if (!ok) {
        // validateFile ya muestra el motivo (tipo/tamaño) vía SweetAlert2
        triggerShake();
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    onFilesChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  };

  const openDialog = () => {
    if (!isInteractive) return;
    inputRef.current?.click();
  };

  const handleRemove = (target: File, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInteractive) return;
    onFilesChange(files.filter((f) => f !== target));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isInteractive) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (!isInteractive) return;
    handleIncomingFiles(e.dataTransfer.files);
  };

  const showError = error ?? localError;
  const helperId = `${inputId}-helper`;
  const canAddMore = multiple ? files.length < effectiveMaxFiles : files.length === 0;

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-base-content">
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={!isInteractive}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleIncomingFiles(e.target.files);
          e.target.value = ""; // permite re-seleccionar el mismo archivo
        }}
      />

      {canAddMore && (
        <div
          role="button"
          tabIndex={isInteractive ? 0 : -1}
          aria-disabled={!isInteractive}
          aria-describedby={helperId}
          onClick={openDialog}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openDialog();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={[
            "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center outline-none transition-all duration-200",
            disabled
              ? "cursor-not-allowed border-base-300 bg-base-200/40 opacity-60"
              : "cursor-pointer bg-base-200/50",
            !disabled && !visualLoading && isDragging
              ? "scale-[1.01] border-primary bg-primary/5 shadow-md"
              : "",
            !disabled && !visualLoading && !isDragging
              ? "border-base-300 hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              : "",
            showError ? "border-error/60 bg-error/5" : "",
            shake ? "animate-[fu-shake_0.4s_ease-in-out]" : "",
          ].join(" ")}
        >
          {visualLoading ? (
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="relative h-9 w-9 animate-spin text-primary" />
            </span>
          ) : (
            <UploadCloud
              className={[
                "h-9 w-9 transition-transform duration-200",
                isDragging ? "-translate-y-0.5 text-primary" : "text-base-content/50 group-hover:text-primary",
              ].join(" ")}
            />
          )}

          <div className="space-y-0.5">
            <p className="text-sm font-medium text-base-content">
              {visualLoading
                ? `Subiendo archivo… ${hasRealProgress ? `${clampedProgress}%` : ""}`
                : isDragging ? "Suelta el archivo aquí" : (
                <>
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-primary underline underline-offset-2">haz clic para buscar</span>
                </>
              )}
            </p>
            <p id={helperId} className="text-xs text-base-content/50">
              {helperText ?? `PDF, Word, Excel o imagen · máx. ${MAX_FILE_SIZE_LABEL}`}
            </p>
          </div>

          {visualLoading ? (
            <span className="absolute inset-x-6 bottom-3 h-1 overflow-hidden rounded-full bg-base-300">
              <span
                className={[
                  "block h-full rounded-full bg-primary",
                  hasRealProgress
                    ? "transition-[width] duration-200 ease-out"
                    : "w-1/3 animate-[fu-progress_1s_ease-in-out_infinite]",
                ].join(" ")}
                style={hasRealProgress ? { width: `${clampedProgress}%` } : undefined}
              />
            </span>
          ) : null}
        </div>
      )}

      {showError ? (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {showError}
        </p>
      ) : null}

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, idx) => {
            const kind = getFileKind(file);
            const previewUrl = previewUrls.get(file);

            return (
              <li
                key={`${file.name}-${file.lastModified}-${idx}`}
                className="animate-[fu-pop_0.25s_ease-out] relative overflow-hidden flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-sm"
              >
                <div
                  className={[
                    "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-200",
                    visualLoading ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  {kind === "image" && previewUrl ? (
                    <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
                  ) : kind === "video" && previewUrl ? (
                    <video src={previewUrl} muted className="h-full w-full object-cover" />
                  ) : (
                    <FileKindIcon kind={kind} className="h-6 w-6 text-base-content/50" />
                  )}
                  {visualLoading ? <div className="absolute inset-0 bg-base-100/40" /> : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-base-content" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {visualLoading ? `Subiendo…${hasRealProgress ? ` ${clampedProgress}%` : ""}` : formatBytes(file.size)}
                  </p>
                </div>

                {visualLoading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    {!multiple && isInteractive ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDialog();
                        }}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Reemplazar archivo"
                        aria-label="Reemplazar archivo"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(file, e)}
                      disabled={!isInteractive}
                      className="btn btn-ghost btn-xs btn-circle text-error disabled:opacity-40"
                      title="Quitar archivo"
                      aria-label="Quitar archivo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {visualLoading ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-base-300">
                    <span
                      className={[
                        "block h-full bg-primary",
                        hasRealProgress
                          ? "transition-[width] duration-200 ease-out"
                          : "w-1/3 animate-[fu-progress_1s_ease-in-out_infinite]",
                      ].join(" ")}
                      style={hasRealProgress ? { width: `${clampedProgress}%` } : undefined}
                    />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
