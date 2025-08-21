// src/pages/Formatos.tsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useFormatos, useCreateFormato, useDeleteFormato } from "../services/formatosServices";

type UiFormato = {
  id: number | string;
  title: string; // name
  ruta: string;  // docs_formatos/archivo.docx
  size?: string;
  date?: string;
};

// === Helpers URL/Visor ===
const backendBase = "https://tuclick.vozipcolombia.net.co/motos/back/";

const toAbsoluteUrl = (ruta: string) =>
  /^https?:\/\//i.test(ruta) ? ruta : `${backendBase}${ruta.replace(/^\/+/, "")}`;

const getExt = (file: string) => {
  const q = file.split("?")[0];
  const dot = q.lastIndexOf(".");
  return dot >= 0 ? q.slice(dot + 1).toLowerCase() : "";
};

const getViewerUrl = (absoluteUrl: string, ext: string) => {
  if (["doc", "docx", "xlsx", "pptx"].includes(ext)) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  }
  return absoluteUrl;
};

const Formatos: React.FC = () => {
  // ====== Data ======
  const { data, isLoading, isError, refetch } = useFormatos();
  const createFormato = useCreateFormato();
  const deleteFormato = useDeleteFormato();

  // Adaptación del array (ya viene del hook como array)
  const formatos: UiFormato[] = (data ?? []).map((f: any) => ({
    id: f.id,
    title: f.name,
    ruta: f.ruta,
    size: f.size,
    date: f.date ?? f.created_at,
  }));

  // ====== Local UI state ======
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [copied, setCopied] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const visibleAlert = useMemo(
    () => formatos.find((f) => f.id === downloadingId)?.title,
    [downloadingId, formatos]
  );

  // ====== Actions ======
  const startDownload = (f: UiFormato) => {
    setDownloadingId(f.id);
    const abs = toAbsoluteUrl(f.ruta);
    const a = document.createElement("a");
    a.href = abs;
    a.download = "";
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setDownloadingId((prev) => (prev === f.id ? null : prev)), 3000);
  };

  const copyLink = async (f: UiFormato) => {
    await navigator.clipboard.writeText(toAbsoluteUrl(f.ruta));
    setCopied(f.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingresa el nombre y selecciona un archivo." });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: "¿Registrar formato?",
      html: `<div style="text-align:left">
               <p><b>Nombre:</b> ${name}</p>
               <p><b>Archivo:</b> ${file.name}</p>
             </div>`,
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    createFormato.mutate(
      { name, documento: file },
      {
        onSuccess: () => {
          setName("");
          setFile(null);
          const el = document.getElementById("file-input") as HTMLInputElement | null;
          if (el) el.value = "";
        },
      }
    );
  };

  const handleDelete = async (item: UiFormato) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar formato?",
      html: `<div style="text-align:left">
               <p>Se eliminará <b>${item.title}</b>.</p>
             </div>`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    deleteFormato.mutate(Number(item.id));
  };

  // ====== Render ======
  return (
    <main className="w-full min-h-screen bg-base-100" aria-labelledby="formatos-title">
      {/* HERO */}
      <section className="w-full bg-gradient-to-b from-base-200 via-base-200 to-base-100">
        <div className="px-4 md:px-8 py-10 md:py-14">
          <div className="hero-content w-full flex-col items-stretch gap-6">
            <div className="w-full">
              <h1 id="formatos-title" className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Formatos
              </h1>
              <p className="mt-3 text-base md:text-lg opacity-80">
                Visualiza, descarga, sube nuevos formatos y elimínalos con confirmación.
              </p>
            </div>

            {/* FORM UPLOAD */}
            <form
              onSubmit={handleCreate}
              className="w-full bg-base-100 border border-base-300 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-end"
            >
              <div className="form-control w-full md:max-w-sm">
                <label className="label"><span className="label-text">Nombre del formato</span></label>
                <input
                  type="text"
                  placeholder="Ej. CONTRATO DE DACIÓN EN PAGO"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-control w-full md:max-w-md">
                <label className="label"><span className="label-text">Archivo</span></label>
                <input
                  id="file-input"
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  accept=".doc,.docx,.pdf,.xlsx,.pptx"
                />
              </div>
              <button
                type="submit"
                className={`btn btn-primary md:self-end ${createFormato.isPending ? "btn-disabled" : ""}`}
              >
                {createFormato.isPending ? <span className="loading loading-spinner mr-2" /> : null}
                Registrar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section className="w-full px-4 md:px-8 pb-16">
        {isLoading && (
          <div className="flex items-center gap-2 opacity-70">
            <span className="loading loading-spinner" /> Cargando formatos…
          </div>
        )}
        {isError && (
          <div className="alert alert-error">
            <span>Hubo un error cargando los formatos.</span>
            <button className="btn btn-sm" onClick={() => refetch()}>Reintentar</button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
            {formatos.map((f) => {
              const abs = toAbsoluteUrl(f.ruta);
              const ext = getExt(abs);
              const viewer = getViewerUrl(abs, ext);
              const isDoc = ["doc", "docx"].includes(ext);

              return (
                <article key={f.id} className="card bg-base-200 border border-base-300 hover:shadow-md transition-shadow relative">
                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleDelete(f)}
                    className="btn btn-circle btn-ghost absolute right-2 top-2"
                    title="Eliminar formato"
                    aria-label={`Eliminar ${f.title}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <div className="card-body">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex p-2 rounded-lg bg-primary/10 shrink-0">
                        {isDoc ? <WordIcon className="w-6 h-6 text-primary" /> : <FileIcon className="w-6 h-6 text-primary" />}
                      </span>
                      <div className="flex-1">
                        <h2 className="card-title text-base leading-snug break-words">{f.title}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
                          {f.size && <span className="badge badge-ghost">{f.size}</span>}
                          {f.date && <span className="badge badge-ghost">{f.date}</span>}
                          <span className="badge badge-outline">{ext ? ext.toUpperCase() : "FILE"}</span>
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
                          {copied === f.id ? "¡Copiado!" : "Copiar enlace"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {formatos.length === 0 && (
              <div className="col-span-full text-sm opacity-70">
                No hay formatos aún. Sube el primero con el formulario arriba.
              </div>
            )}
          </div>
        )}
      </section>

      {/* TOAST de descarga */}
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

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7H3a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm-1 6a1 1 0 1 1 2 0v8a1 1 0 1 1-2 0V9Zm6 0a1 1 0 1 1 2 0v8a1 1 0 1 1-2 0V9Z" />
  </svg>
);

export default Formatos;
