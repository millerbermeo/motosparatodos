// src/features/actas/components/FotosGrid.tsx
import React from "react";
import { Download, FileImage } from "lucide-react";
import { toAbsoluteUrlOrUndefined } from "../../../utils/files";

const FotosGrid: React.FC<{ fotos: string[] }> = ({ fotos }) => {
  const handleDownloadAll = () => {
    fotos.forEach((f) => {
      const url = toAbsoluteUrlOrUndefined(f);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  if (!fotos || fotos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-base-content/60 bg-base-200 border border-dashed border-base-300 rounded-xl px-4 py-3">
        <FileImage className="w-4 h-4 opacity-70" />
        <span>No hay fotos registradas para este acta.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Botón para descargar todas las fotos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-xs text-base-content/60">
          Total de fotos:{" "}
          <span className="font-semibold text-base-content">{fotos.length}</span>
        </p>
        <button
          type="button"
          onClick={handleDownloadAll}
          className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success border border-success/30 px-3 py-1.5 text-xs font-medium hover:bg-success/10 transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Descargar todas</span>
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((f, i) => {
          const url = toAbsoluteUrlOrUndefined(f);
          return (
            <article
              key={`${f}-${i}`}
              className="group relative rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden hover:shadow-md hover:border-base-300 transition-all"
            >
              {url ? (
                <>
                  {/* Botón de descarga individual */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`foto-${i + 1}.jpg`}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-base-100/90 border border-base-300 px-2 py-1 text-[11px] text-base-content shadow-sm hover:bg-base-200 z-10"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar</span>
                  </a>

                  <figure className="w-full h-40 bg-base-200 overflow-hidden">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  </figure>
                </>
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-xs text-base-content/50 bg-base-200">
                  Foto no disponible
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-[11px] font-medium text-base-content/60">
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

export default FotosGrid;
