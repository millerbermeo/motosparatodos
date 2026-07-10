// src/features/actas/components/FirmaView.tsx
import React from "react";
import { Download, PenLine } from "lucide-react";
import { toAbsoluteUrlOrUndefined } from "../../../utils/files";

const FirmaView: React.FC<{ firma_url: string | null }> = ({ firma_url }) => {
  const url = toAbsoluteUrlOrUndefined(firma_url);
  if (!url) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-base-200 border border-base-300 text-sm text-base-content/60">
        <PenLine className="w-4 h-4 opacity-70" />
        <span>Sin firma registrada</span>
      </div>
    );
  }
  return (
    <div className="inline-flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-base-200/80 border border-base-300 shadow-sm w-full sm:w-auto">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
        Firma del cliente
      </span>
      <div className="bg-base-100 rounded-xl border border-base-300 p-2 relative">
        {/* Botón de descarga de la firma */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download="firma-cliente.png"
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-base-100/90 border border-base-300 px-2 py-1 text-[11px] text-base-content shadow-sm hover:bg-base-200"
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

export default FirmaView;
