import React from "react";
import Swal from "sweetalert2";
import { UploadCloud } from "lucide-react";
import { useSubirCedulaSolicitud } from "../../services/solicitudServices";
import { ACCEPT_ATTR } from "../../utils/fileValidation";
import { FileUpload } from "./FileUpload";

type Props = {
  idSolicitud?: number;
  idCotizacion: string | number;
  onUploaded?: () => void;
  className?: string;
};

const CedulaUploader: React.FC<Props> = ({
  idSolicitud,
  idCotizacion,
  onUploaded,
  className = "",
}) => {
  const { mutate: subirCedula, isPending } = useSubirCedulaSolicitud();
  const [file, setFile] = React.useState<File | null>(null);

  const validar = (f: File) => {
    const okType =
      f.type === "application/pdf" ||
      f.type.startsWith("image/") ||
      f.name.toLowerCase().endsWith(".pdf");

    if (!okType) {
      Swal.fire("Archivo inválido", "Solo PDF o imágenes.", "warning");
      return false;
    }

    if (f.size > 10 * 1024 * 1024) {
      Swal.fire("Archivo muy grande", "Máximo 10MB.", "warning");
      return false;
    }

    return true;
  };

  const onUpload = () => {
    if (!idCotizacion || String(idCotizacion).trim() === "") {
      Swal.fire(
        "Sin cotización",
        "No se encontró el ID de la cotización para adjuntar la cédula.",
        "warning"
      );
      return;
    }

    if (!file) {
      Swal.fire("Archivo requerido", "Selecciona la cédula antes de enviar.", "info");
      return;
    }

    if (!validar(file)) return;

    const fd = new FormData();
    fd.append("id_cotizacion", String(idCotizacion));
    if (idSolicitud) fd.append("id", String(idSolicitud));
    fd.append("cedula", file);

    subirCedula(fd, {
      onSuccess: () => {
        setFile(null);
        onUploaded?.();
      },
    });
  };

  return (
    <div
      className={`mt-4 pt-3 bg-info/10 p-3 rounded-2xl border border-info/30 space-y-2 ${className}`}
    >
      <div className="text-xs font-semibold text-info">Cargar copia de cédula:</div>

      <div className="flex flex-col gap-2">
        <FileUpload
          files={file ? [file] : []}
          onFilesChange={(files) => setFile(files[0] ?? null)}
          loading={isPending}
          accept={ACCEPT_ATTR}
        />

        <button
          type="button"
          onClick={onUpload}
          disabled={isPending || !file}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-blue-600 self-start"
        >
          <UploadCloud className="w-4 h-4" />
          {isPending ? "Subiendo…" : "Subir cédula"}
        </button>
      </div>
    </div>
  );
};

export default CedulaUploader;
