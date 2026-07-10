// src/pages/Formatos.tsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useFormatos, useCreateFormato, useDeleteFormato } from "../services/formatosServices";
import { toAbsoluteUrl } from "../utils/files";
import { confirmDelete } from "../utils/confirmDelete";
import FormatoCard from "../features/formatos/components/FormatoCard";
import FormatoUploadForm from "../features/formatos/components/FormatoUploadForm";
import DownloadToast from "../features/formatos/components/DownloadToast";
import type { UiFormato } from "../features/formatos/formatos.types";

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
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const visibleAlert = useMemo(
    () => formatos.find((f) => f.id === downloadingId)?.title,
    [downloadingId, formatos]
  );

  // ====== Actions ======
  const startDownload = (f: UiFormato) => {
    setDownloadingId(f.id);
    const abs = toAbsoluteUrl(f.ruta) ?? "";
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
    const ok = await confirmDelete(
      `<div style="text-align:left">
               <p>Se eliminará <b>${item.title}</b>.</p>
             </div>`,
      "¿Eliminar formato?",
      { confirmButtonColor: "#3085d6" }
    );
    if (!ok) return;

    deleteFormato.mutate(Number(item.id));
  };

  // ====== Render ======
  return (
    <main className="w-full min-h-screen bg-base-100" aria-labelledby="formatos-title">
      {/* HERO */}
      <section className="w-full bg-linear-to-b from-base-200 via-base-200 to-base-100">
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

            <FormatoUploadForm
              name={name}
              onNameChange={setName}
              file={file}
              onFileChange={setFile}
              onSubmit={handleCreate}
              isPending={createFormato.isPending}
            />
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
            {formatos.map((f) => (
              <FormatoCard
                key={f.id}
                formato={f}
                onDownload={startDownload}
                onDelete={handleDelete}
              />
            ))}

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
        <DownloadToast title={visibleAlert} onClose={() => setDownloadingId(null)} />
      )}
    </main>
  );
};

export default Formatos;
