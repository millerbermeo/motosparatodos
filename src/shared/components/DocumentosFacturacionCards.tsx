import React from "react";
import { FileText, Download } from "lucide-react";

type DocItem = {
  name: string;     // Texto mostrado
  file: string;     // Nombre exacto del archivo en /public
};

type Props = {
  title?: string;
  docs?: DocItem[];
  className?: string;
};

const DEFAULT_DOCS: DocItem[] = [
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

const downloadFromPublic = (file: string) => {
  const href = `/${encodeURI(file)}`; // importante por espacios y caracteres
  const a = document.createElement("a");
  a.href = href;
  a.download = file; // fuerza descarga (si el navegador lo permite)
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const DocumentosFacturacionCards: React.FC<Props> = ({
  title = "Documentos",
  docs = DEFAULT_DOCS,
  className = "",
}) => {
  if (!docs?.length) return null;

  return (
    <section className={`card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl ${className}`}>
      <div className="card-body">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5" />
          <h2 className="card-title text-lg">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {docs.map((d) => (
            <button
              key={d.file}
              type="button"
              onClick={() => downloadFromPublic(d.file)}
              className="group w-full text-left rounded-xl border border-base-300/60 bg-white cursor-pointer hover:bg-[#3498DB]/20 transition p-4"
              title="Descargar documento"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#3498DB]/10 p-2 border border-[#3498DB]/20">
                  <FileText className="w-6 h-6 text-[#3498DB]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{d.name}</div>
                  <div className="text-xs opacity-70 mt-1 truncate">{d.file}</div>

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
