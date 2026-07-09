// src/features/formatos/components/FormatoCard.tsx
import React from "react";
import { Download, Trash2 } from "lucide-react";
import CopyButton from "../../../shared/components/CopyButton";
import { toAbsoluteUrl, getFileExtension } from "../../../utils/files";
import { getOfficeViewerUrl } from "../../../utils/officeViewer";
import FormatoTypeIcon from "./FormatoTypeIcon";
import type { UiFormato } from "../formatos.types";

const FormatoCard: React.FC<{
  formato: UiFormato;
  onDownload: (f: UiFormato) => void;
  onDelete: (f: UiFormato) => void;
}> = ({ formato, onDownload, onDelete }) => {
  const abs = toAbsoluteUrl(formato.ruta) ?? "";
  const ext = getFileExtension(abs);
  const viewer = getOfficeViewerUrl(abs);

  return (
    <article className="card bg-base-200 border border-base-300 hover:shadow-md transition-shadow relative">
      <button
        onClick={() => onDelete(formato)}
        className="btn btn-circle btn-ghost absolute right-2 top-2"
        title="Eliminar formato"
        aria-label={`Eliminar ${formato.title}`}
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="card-body">
        <div className="flex items-start gap-3">
          <span className="inline-flex p-2 rounded-lg bg-primary/10 shrink-0">
            <FormatoTypeIcon ext={ext} className="w-6 h-6 text-primary" />
          </span>
          <div className="flex-1">
            <h2 className="card-title text-base leading-snug wrap-break-words">
              {formato.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
              {formato.size && <span className="badge badge-ghost">{formato.size}</span>}
              {formato.date && <span className="badge badge-ghost">{formato.date}</span>}
              <span className="badge badge-outline">{ext ? ext.toUpperCase() : "FILE"}</span>
            </div>
          </div>
        </div>

        <div className="card-actions justify-between pt-4">
          <button
            onClick={() => onDownload(formato)}
            className="btn btn-success btn-sm"
            aria-label={`Descargar ${formato.title}`}
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>

          <div className="flex items-center gap-2">
            <a
              href={viewer}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              aria-label={`Ver ${formato.title}`}
            >
              Ver
            </a>
            <CopyButton text={abs} label="Copiar enlace" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default FormatoCard;
