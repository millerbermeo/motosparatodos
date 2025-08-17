// src/pages/Formatos.tsx
import React, { useMemo, useState } from 'react';

type Formato = {
  id: string;
  title: string;
  // IMPORTANT: poner aquí el nombre EXACTO del archivo como está en el servidor (si ya viene con %20, %cc%81, etc. déjalo así)
  file: string; // e.g. "CONTRATO%20DE%20DACIO%cc%81N%20EN%20PAGO.docx"
  size?: string;
  date?: string;
};

const baseUrl = 'https://tuclick.vozipcolombia.net.co/motos/back/archivos/';

// helper: devuelve url absoluta
const getFileUrl = (file: string) => `${baseUrl}${file}`;

// helper: extrae extensión
const getExt = (file: string) => {
  const q = file.split('?')[0];
  const dot = q.lastIndexOf('.');
  return dot >= 0 ? q.slice(dot + 1).toLowerCase() : '';
};

// para DOCX usamos el visor de Office online
const getViewerUrl = (absoluteUrl: string, ext: string) => {
  if (ext === 'docx' || ext === 'doc' || ext === 'xlsx' || ext === 'pptx') {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  }
  // PDFs u otros: abrir directo
  return absoluteUrl;
};

const formatos: Formato[] = [
  {
    id: 'dacion',
    title: 'CONTRATO DE DACIÓN EN PAGO',
    file: 'CONTRATO%20DE%20DACIO%cc%81N%20EN%20PAGO.docx',
    size: '45 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'aplicacion',
    title: 'Formato Aplicación & Traslados',
    file: 'Formato%20Aplicacion%20&amp;%20Traslados.docx',
    size: '20 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'autorizacion',
    title: 'Formato Carta Autorización Entrega',
    file: 'Formato%20Carta%20Autorizacion%20Entrega.docx',
    size: '20 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'responsabilidad',
    title: 'Formato Carta Responsabilidad trámite de matrícula',
    file: 'Formato%20Carta%20Responsabilidad%20tramite%20de%20matricula.docx',
    size: '16 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'entrega-voluntaria',
    title: 'Formato Entrega Voluntaria Motocicleta',
    file: 'Formato%20Entrega%20Voluntaria%20Motocicleta.docx',
    size: '18 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'anticipo',
    title: 'Formato Solicitud Anticipo Actividad Comercial',
    file: 'Formato%20Solicitud%20Anticipo%20Actividad%20Comercial.docx',
    size: '18 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'devolucion',
    title: 'Formato Solicitud Devolución de Dineros',
    file: 'Formato%20Solicitud%20Devol%20Dineros.docx',
    size: '20 KB',
    date: '2025-08-17 20:10',
  },
  {
    id: 'gastos',
    title: 'Gastos de Viaje Legalización v0',
    file: 'Gastos%20de%20Viaje%20Legalizacion%20v0.xls',
    size: '59 KB',
    date: '2025-08-17 20:10',
  },
];


const Formatos: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const visibleAlert = useMemo(
    () => formatos.find(f => f.id === downloadingId)?.title,
    [downloadingId]
  );

  const startDownload = (f: Formato) => {
    setDownloadingId(f.id);
    const url = getFileUrl(f.file);

    const a = document.createElement('a');
    a.href = url;
    a.download = ''; // sugiere descarga manteniendo el nombre del servidor
    a.rel = 'noopener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => setDownloadingId(prev => (prev === f.id ? null : prev)), 3500);
  };

  const copyLink = async (f: Formato) => {
    await navigator.clipboard.writeText(getFileUrl(f.file));
    setCopied(f.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="w-full min-h-screen bg-base-100" aria-labelledby="formatos-title">
      {/* HERO */}
      <section className="w-full bg-gradient-to-b from-base-200 via-base-200 to-base-100">
        <div className="px-4 md:px-8 py-10 md:py-14">
          <div className="hero-content w-full flex-col items-stretch gap-6">
            <div className="w-full">
              <h1 id="formatos-title" className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Formatos descargables
              </h1>
              <p className="mt-3 text-base md:text-lg opacity-80">
                Abra para visualizar o descargue el archivo original. Los documentos .docx se
                visualizan con Office Online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="w-full px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
          {formatos.map((f) => {
            const abs = getFileUrl(f.file);
            const ext = getExt(f.file);
            const viewer = getViewerUrl(abs, ext);
            const isDoc = ext === 'doc' || ext === 'docx';

            return (
              <article key={f.id} className="card bg-base-100 border border-base-300/60 hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex p-2 rounded-lg bg-primary/10 shrink-0">
                      {isDoc ? <WordIcon className="w-6 h-6 text-primary" /> : <FileIcon className="w-6 h-6 text-primary" />}
                    </span>
                    <div className="flex-1">
                      <h2 className="card-title text-base leading-snug">{f.title}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
                        {f.size && <span className="badge badge-ghost">{f.size}</span>}
                        {f.date && <span className="badge badge-ghost">{f.date}</span>}
                        <span className="badge badge-outline">{isDoc ? 'DOCX' : ext.toUpperCase() || 'FILE'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-between pt-4">
                    <button
                      onClick={() => startDownload(f)}
                      className="btn btn-success btn-sm"
                      aria-label={`Descargar ${f.title}`}
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Descargar
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={viewer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        aria-label={`Ver ${f.title}`}
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => copyLink(f)}
                        className="btn btn-ghost btn-sm"
                        aria-live="polite"
                      >
                        {copied === f.id ? '¡Copiado!' : 'Copiar enlace'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* TOAST */}
      {visibleAlert && (
        <div className="toast toast-end z-50">
          <div className="alert shadow-lg bg-base-100 border border-base-300/60">
            <span className="loading loading-spinner loading-md" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Descargando…</h3>
              <p className="text-sm opacity-80 line-clamp-1">{visibleAlert}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setDownloadingId(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

/* ====== Íconos ====== */
const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity=".2" />
    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h3" />
  </svg>
);

const WordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
    <path d="M28 4h8l8 8v28a4 4 0 0 1-4 4H28z" opacity=".15" />
    <path d="M28 4v12h12M8 10h16v28H8z" opacity=".2" />
    <path d="M12 18h4l2 10 2-10h4l2 10 2-10h4" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 3a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 8.707 11.293L11 13.586V4a1 1 0 0 1 1-1Z" />
    <path d="M4 19a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
  </svg>
);

export default Formatos;
