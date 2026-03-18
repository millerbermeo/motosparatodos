import React from "react";
import { FileText, Download } from "lucide-react";

export type DocItem = {
  name: string;     // Texto mostrado
  file?: string;    // Nombre exacto del archivo en /public
  url?: string;     // URL absoluta o relativa del backend
};

type Props = {
  title?: string;
  docs?: DocItem[];
  className?: string;
};

export const DEFAULT_DOCS: DocItem[] = [
  {
    name: "GARANTIA EXTENDIDA Y COMPLEMENTARIA FIRMA CON RC - CREDITOS",
    file: "GARANTIA  EXTENDIDA Y COMPLEMENTARIA FIRMA CON RC - CREDITOS.docx",
  },
  {
    name: "Paquete Crediticio Cepresta",
    file: "Paquete Crediticio Cepresta.docx",
  },
  {
    name: "paquete_credito_MxT (1)",
    file: "paquete_credito_MxT (1).docx",
  },
];

const handleDownload = (doc: DocItem) => {
  let href = "";

  if (doc.url) {
    href = doc.url;
  } else if (doc.file) {
    href = `/${encodeURI(doc.file)}`;
  } else {
    return;
  }

  const a = document.createElement("a");
  a.href = href;
  a.download = doc.file || doc.name;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const DocumentosFacturacionCards: React.FC<Props> = ({
  title = "Documentos",
  docs = DEFAULT_DOCS,
  className = "",
}) => {
  const docsValidos = (docs || []).filter((d) => !!d?.file || !!d?.url);

  if (!docsValidos.length) return null;

  return (
    <section
      className={`card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl ${className}`}
    >
      <div className="card-body">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5" />
          <h2 className="card-title text-lg">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {docsValidos.map((d, idx) => (
            <button
              key={`${d.file || d.url || d.name}-${idx}`}
              type="button"
              onClick={() => handleDownload(d)}
              className="group w-full text-left rounded-xl border border-base-300/60 bg-white cursor-pointer hover:bg-[#3498DB]/20 transition p-4"
              title="Descargar documento"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#3498DB]/10 p-2 border border-[#3498DB]/20">
                  <FileText className="w-6 h-6 text-[#3498DB]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {d.name}
                  </div>

                  <div className="text-xs opacity-70 mt-1 truncate">
                    {d.file || d.url}
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 text-sm text-[#3498DB] group-hover:underline">
                    <Download className="w-4 h-4" />
                    Descargar
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};