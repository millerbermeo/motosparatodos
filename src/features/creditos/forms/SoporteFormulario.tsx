import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { useSubirFormatos, useCreditoConDocumentos } from "../../../services/documentosServices";
import { useParams } from "react-router-dom";
import { Loader2, UploadCloud, FileText, Trash2 } from "lucide-react"; // librería de íconos

type Props = {
  maxSizeMB?: number;
};

const SoporteFormulario: React.FC<Props> = ({ maxSizeMB = 2 }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  // hooks API
  const subirFormatos = useSubirFormatos();
  const { data, isLoading } = useCreditoConDocumentos(codigo_credito);

  const openPicker = () => inputRef.current?.click();

  const validateAndUpload = (incoming: FileList | File[]) => {
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

    if (validFiles.length > 0) {
      subirFormatos.mutate(
        { codigo_credito, documentos: validFiles },
        {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "Soportes subidos",
              timer: 1500,
              showConfirmButton: false,
            });
          },
        }
      );
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) validateAndUpload(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) validateAndUpload(e.dataTransfer.files);
  };

  const handleDelete = (filePath: string) => {
    Swal.fire({
      icon: "warning",
      title: "Eliminar soporte",
      text: `¿Seguro que deseas eliminar ${filePath}?`,
      confirmButtonText: "Ok",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-center text-xl font-bold text-gray-800">
        Adjuntar Soportes del Crédito
      </h3>

      {/* Dropzone */}
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
          <span className="text-blue-600 font-semibold">haz clic para seleccionar</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg shadow-sm">
          {errors.map((e, i) => (
            <div key={i}>⚠ {e}</div>
          ))}
        </div>
      )}

      {/* Lista de soportes */}
      <div>
        <h4 className="font-semibold mb-3">📑 Soportes registrados</h4>
        {isLoading ? (
          <div className="animate-pulse text-gray-400 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando soportes...
          </div>
        ) : data?.soportes?.length ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.soportes.map((s, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl border border-success shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-blue-500" />
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-blue-600 hover:underline text-sm"
                  >
                    {s}
                  </a>
                </div>
                <button
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                  onClick={() => handleDelete(s)}
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay soportes registrados.</p>
        )}
      </div>
    </div>
  );
};

export default SoporteFormulario;
