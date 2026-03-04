// src/components/solicitudes/SoporteFormulario.tsx
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { useSubirFormatos, useCreditoConDocumentos } from "../../../services/documentosServices";
import { useParams, useNavigate } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";
import { Loader2, UploadCloud, FileText } from "lucide-react";

type Props = { maxSizeMB?: number };

const SoporteFormulario: React.FC<Props> = ({ maxSizeMB = 2 }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");
  const navigate = useNavigate();
  const redirectTo = `/creditos/detalle/${codigoFromUrl}`;

  const prev = useWizardStore(s => s.prev);
  const isFirst = useWizardStore(s => s.isFirst);

  const subirFormatos = useSubirFormatos();
  const { data, isLoading, refetch } = useCreditoConDocumentos(codigo_credito);

  const openPicker = () => inputRef.current?.click();

  // 🔹 Construir URL correcta usando VITE_API_URL
  const buildUrl = (path: string) => {
    if (!path) return "";

    // si ya es URL completa no tocarla
    if (path.startsWith("http")) return path;

    const base = import.meta.env.VITE_API_URL;

    if (!base) return path;

    const cleanBase = base.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${cleanBase}${cleanPath}`;
  };

  const validateOnly = (incoming: FileList | File[]) => {
    const errs: string[] = [];
    const validFiles: File[] = [];

    Array.from(incoming).forEach((f) => {
      if (f.size > maxSizeMB * 1024 * 1024) {
        errs.push(`"${f.name}" supera ${maxSizeMB} MB.`);
        return;
      }
      validFiles.push(f);
    });

    setErrors(errs);

    if (validFiles.length) {
      setSelected(prev => [...prev, ...validFiles]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) validateOnly(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) validateOnly(e.dataTransfer.files);
  };

  const handleManualUpload = () => {
    if (!codigo_credito) {
      Swal.fire({ icon: "error", title: "Código de crédito no encontrado" });
      return;
    }

    if (!selected.length) {
      Swal.fire({
        icon: "warning",
        title: "Sin archivos seleccionados",
        text: "Agrega al menos un archivo.",
      });
      return;
    }

    Swal.fire({
      icon: "question",
      title: "¿Subir soportes?",
      text: `Se subirán ${selected.length} archivo(s) al crédito ${codigo_credito}.`,
      confirmButtonText: "Sí, subir",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(res => {
      if (!res.isConfirmed) return;

      subirFormatos.mutate(
        { codigo_credito, documentos: selected },
        {
          onSuccess: async () => {
            await refetch();
            setSelected([]);

            Swal.fire({
              icon: "success",
              title: "Soportes subidos",
              timer: 1600,
              showConfirmButton: false,
            });
          },
          onError: (err: any) => {
            console.error(err);

            Swal.fire({
              icon: "error",
              title: "Error al subir",
              text: "No fue posible subir los soportes. Intenta de nuevo.",
            });
          },
        }
      );
    });
  };

  const handleRegisterAndFinish = () => {
    Swal.fire({
      icon: "warning",
      title: "¿Deseas registrar este proceso?",
      text: "Puedes adjuntar más soportes luego si lo necesitas.",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (!res.isConfirmed) return;

      Swal.fire({
        icon: "success",
        title: "Proceso registrado",
        text: "Serás redirigido a la vista de resumen.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(redirectTo);
      });
    });
  };

  const isUploading = subirFormatos.isPending;

  return (
    <div className="space-y-6">
      <h3 className="text-center text-xl font-bold text-gray-800">
        Adjuntar Soportes del Crédito
      </h3>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 
                   rounded-2xl p-8 text-center cursor-pointer transition-all"
        onClick={openPicker}
      >
        <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />

        <p className="text-gray-600">
          Arrastra y suelta tus archivos aquí o{" "}
          <span className="text-blue-600 font-semibold">
            haz clic para seleccionar
          </span>
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg shadow-sm">
          {errors.map((e, i) => (
            <div key={i}> {e}</div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-3">
          <div className="font-semibold mb-2">
            Archivos seleccionados (pendientes de subir):
          </div>

          <ul className="list-disc ml-5 text-sm">
            {selected.map((f, i) => (
              <li key={i} className="truncate">
                ({i + 1}) {f.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-3">📑 Soportes registrados</h4>

        {isLoading ? (
          <div className="text-gray-400 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando soportes...
          </div>
        ) : data?.soportes?.length ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.soportes.map((s: string, i: number) => {
              const url = buildUrl(s);

              return (
                <div
                  key={i}
                  className="p-4 bg-white rounded-xl border border-success shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="text-blue-500" />

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-blue-600 hover:underline text-sm"
                    >
                      {url}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No hay soportes registrados.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={prev}
          disabled={isFirst || isUploading}
        >
          ← Anterior
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleManualUpload}
            disabled={isUploading || selected.length === 0}
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Subiendo…
              </span>
            ) : (
              "📤 Subir soportes"
            )}
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={handleRegisterAndFinish}
            disabled={isUploading}
          >
            Registrar y finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoporteFormulario;