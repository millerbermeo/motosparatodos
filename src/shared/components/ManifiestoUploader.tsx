import React from "react";
import Swal from "sweetalert2";
import { UploadCloud, RefreshCw } from "lucide-react";
import { useSubirManifiestoSolicitud } from "../../services/solicitudServices";
import { ACCEPT_ATTR } from "../../utils/fileValidation";
import { FileUpload } from "./FileUpload";

type Props = {
  idSolicitud?: number;
  idCotizacion: string | number;
  manifiestoUrlFinal?: string | null;
  onUploaded?: () => void;
  className?: string;
};

const ManifiestoUploader: React.FC<Props> = ({
  idSolicitud,
  idCotizacion,
  manifiestoUrlFinal,
  onUploaded,
  className = "",
}) => {
  const { mutate: subirManifiesto, isPending } = useSubirManifiestoSolicitud();
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

    const maxMB = 10;
    if (f.size > maxMB * 1024 * 1024) {
      Swal.fire("Archivo muy grande", `Máximo ${maxMB}MB.`, "warning");
      return false;
    }
    return true;
  };

  const onUpload = async () => {
    // ✅ Si tu backend ACTUALIZA por id_cotizacion, NO bloquees por idSolicitud
    if (!idCotizacion || String(idCotizacion).trim() === "") {
      Swal.fire(
        "Sin cotización",
        "No se encontró el ID de la cotización para adjuntar el manifiesto.",
        "warning"
      );
      return;
    }

    if (!file) {
      Swal.fire(
        "Archivo requerido",
        "Selecciona el manifiesto antes de enviar.",
        "info"
      );
      return;
    }

    if (!validar(file)) return;

    if (manifiestoUrlFinal) {
      const r = await Swal.fire({
        icon: "question",
        title: "¿Reemplazar manifiesto?",
        text: "Ya existe un manifiesto. Si continúas, se actualizará por el nuevo archivo.",
        showCancelButton: true,
        confirmButtonText: "Sí, reemplazar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d97706",
      });
      if (!r.isConfirmed) return;
    }

    const fd = new FormData();

    // ✅ Backend recomendado: actualizar por id_cotizacion
    fd.append("id_cotizacion", String(idCotizacion));

    // ✅ Si tu endpoint también acepta id (opcional), lo mandamos si existe
    if (idSolicitud) fd.append("id", String(idSolicitud));

    // ✅ CLAVE: el nombre debe ser EXACTO: "manifiesto"
    fd.append("manifiesto", file);

    // ✅ Debug real (para ver que sí va un File)

    subirManifiesto(fd, {
      onSuccess: () => {
        setFile(null);
        onUploaded?.();
      },
    });
  };

  const titulo = manifiestoUrlFinal ? "Reemplazar manifiesto:" : "Cargar manifiesto:";

  return (
    <div
      className={`mt-4 pt-3 bg-warning/10 p-3 rounded-2xl border border-warning/30 space-y-2 ${className}`}
    >
      <div className="text-xs font-semibold text-warning">{titulo}</div>

      {manifiestoUrlFinal && (
        <div className="text-xs text-base-content">
          Manifiesto actual:{" "}
          <a
            href={manifiestoUrlFinal}
            target="_blank"
            rel="noreferrer"
            className="underline text-warning font-medium"
          >
            Ver archivo
          </a>
        </div>
      )}

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
          className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white border-amber-600 self-start"
        >
          {manifiestoUrlFinal ? <RefreshCw className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
          {isPending ? "Subiendo…" : manifiestoUrlFinal ? "Reemplazar" : "Subir manifiesto"}
        </button>
      </div>
    </div>
  );
};

export default ManifiestoUploader;
