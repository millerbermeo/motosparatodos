import React from "react";
import { FileDown, CheckCircle2, UploadCloud } from "lucide-react";
import Swal from "sweetalert2";
import { useModalStore } from "../../store/modalStore";
import ActaEntregaFormulario from "../../shared/components/ActaEntregaFormulario";
import {
  useSubirManifiestoSolicitud,
  useSubirCedulaSolicitud,
} from "../../services/solicitudServices";
import { toAbsoluteUrl } from "../../utils/files";
import { validateFileInput } from "../../utils/fileValidation";

type Docs = {
  manifiesto_url?: string | null;
  cedula_url?: string | null;
  factura_url?: string | null;
  carta_url?: string | null;
  otros_documentos?: (string | null | undefined)[] | null;
};

type Props = {
  id: string | number;
  id_factura: number;
  idSolicitud?: number;
  idCotizacion?: string | number;
  responsableDefault?: string;
  docs: Docs;
  loading?: boolean;
  onVolver?: () => void;
  onAprobado?: (id: string | number) => void;
  onDocumentUploaded?: () => void;
  estadoCotizacion?: string;
  finalizado?: number | boolean | string;
  tiene_factura?: boolean;
};

const resolveUrl = toAbsoluteUrl;

const DocumentosSolicitud: React.FC<Props> = ({
  id,
  id_factura,
  idSolicitud,
  idCotizacion,
  responsableDefault,
  docs,
  loading = false,
  onVolver,
  onAprobado,
  onDocumentUploaded,
  estadoCotizacion,
  finalizado,
  tiene_factura,
}) => {
  const open = useModalStore((s) => s.open);

  const { mutate: subirManifiesto, isPending: subManifiesto } = useSubirManifiestoSolicitud();
  const { mutate: subirCedula, isPending: subCedula } = useSubirCedulaSolicitud();

  const manifiestoRef = React.useRef<HTMLInputElement>(null);
  const cedulaRef = React.useRef<HTMLInputElement>(null);
  const [manifiestoFile, setManifiestoFile] = React.useState<File | null>(null);
  const [cedulaFile, setCedulaFile] = React.useState<File | null>(null);

  const abrir = (url?: string | null) => {
    const finalUrl = resolveUrl(url);
    if (!finalUrl) return;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  console.log(estadoCotizacion)
  const estaFinalizado =
    finalizado === 1 || finalizado === "1" || finalizado === true;

  const puedeMostrarEntrega = !!tiene_factura && !estaFinalizado;

  const otrosDocs = (docs.otros_documentos ?? []).filter(Boolean).map(String);

  const validarArchivo = (f: File): boolean => {
    const okType =
      f.type === "application/pdf" ||
      f.type.startsWith("image/") ||
      f.name.toLowerCase().endsWith(".pdf");
    if (!okType) {
      Swal.fire("Archivo inválido", "Solo se permiten PDF o imágenes.", "warning");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      Swal.fire("Archivo muy grande", "El archivo no puede superar los 10MB.", "warning");
      return false;
    }
    return true;
  };

  const handleSubirManifiesto = async () => {
    if (!manifiestoFile) {
      Swal.fire("Archivo requerido", "Selecciona el manifiesto antes de continuar.", "info");
      return;
    }
    if (!validarArchivo(manifiestoFile)) return;

    const confirm = await Swal.fire({
      icon: "question",
      title: "¿Subir manifiesto?",
      text: `Se adjuntará el archivo "${manifiestoFile.name}" como manifiesto de esta solicitud.`,
      showCancelButton: true,
      confirmButtonText: "Sí, subir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });
    if (!confirm.isConfirmed) return;

    const fd = new FormData();
    fd.append("id_cotizacion", String(idCotizacion));
    if (idSolicitud) fd.append("id", String(idSolicitud));
    fd.append("manifiesto", manifiestoFile);

    subirManifiesto(fd, {
      onSuccess: () => {
        setManifiestoFile(null);
        if (manifiestoRef.current) manifiestoRef.current.value = "";
        onDocumentUploaded?.();
      },
    });
  };

  const handleSubirCedula = async () => {
    if (!cedulaFile) {
      Swal.fire("Archivo requerido", "Selecciona la cédula antes de continuar.", "info");
      return;
    }
    if (!validarArchivo(cedulaFile)) return;

    const confirm = await Swal.fire({
      icon: "question",
      title: "¿Subir cédula?",
      text: `Se adjuntará el archivo "${cedulaFile.name}" como cédula de esta solicitud.`,
      showCancelButton: true,
      confirmButtonText: "Sí, subir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });
    if (!confirm.isConfirmed) return;

    const fd = new FormData();
    fd.append("id_cotizacion", String(idCotizacion));
    if (idSolicitud) fd.append("id", String(idSolicitud));
    fd.append("cedula", cedulaFile);

    subirCedula(fd, {
      onSuccess: () => {
        setCedulaFile(null);
        if (cedulaRef.current) cedulaRef.current.value = "";
        onDocumentUploaded?.();
      },
    });
  };

  const puedeSubir = !!idSolicitud && !!idCotizacion;

  const onAceptar = () => {
    open(
      <ActaEntregaFormulario
        key={`acta-${id_factura}`}
        id_factura={Number(id_factura)}
        responsableDefault={responsableDefault}
        onSuccess={() => {
          onAprobado?.(id);
        }}
      />,
      "Acta de entrega",
      { size: "5xl", position: "center" }
    );
  };


  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-base-300">
        <h3 className="text-center text-lg md:text-xl font-bold text-base-content">
          Documentos de la solicitud
        </h3>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Manifiesto */}
        {docs.manifiesto_url ? (
          <DownloadButton
            label="Descargar manifiesto"
            onClick={() => abrir(docs.manifiesto_url)}
            disabled={loading}
          />
        ) : puedeSubir ? (
          <UploadCard
            label="Manifiesto"
            fieldName="manifiesto"
            file={manifiestoFile}
            inputRef={manifiestoRef}
            isPending={subManifiesto}
            onFileChange={(f) => setManifiestoFile(f)}
            onUpload={handleSubirManifiesto}
          />
        ) : (
          <DownloadButton
            label="Descargar manifiesto"
            onClick={undefined}
            disabled
            hint="No disponible"
          />
        )}

        {/* Cédula */}
        {docs.cedula_url ? (
          <DownloadButton
            label="Descargar cédula"
            onClick={() => abrir(docs.cedula_url)}
            disabled={loading}
          />
        ) : puedeSubir ? (
          <UploadCard
            label="Cédula"
            fieldName="cedula"
            file={cedulaFile}
            inputRef={cedulaRef}
            isPending={subCedula}
            onFileChange={(f) => setCedulaFile(f)}
            onUpload={handleSubirCedula}
          />
        ) : (
          <DownloadButton
            label="Descargar cédula"
            onClick={undefined}
            disabled
            hint="No disponible"
          />
        )}

        {/* Carta: solo si existe */}
        {docs.carta_url && (
          <DownloadButton
            label="Descargar carta de aprobación"
            onClick={() => abrir(docs.carta_url)}
            disabled={loading}
          />
        )}

        <DownloadButton
          label="Descargar factura"
          onClick={() => abrir(docs.factura_url)}
          disabled={loading || !docs.factura_url}
          hint={!docs.factura_url ? "Falta la factura" : undefined}
        />

        {/* Otros documentos */}
        {otrosDocs.length > 0 ? (
          otrosDocs.map((u, idx) => (
            <DownloadButton
              key={`${u}-${idx}`}
              label={`Descargar otro documento #${idx + 1}`}
              onClick={() => abrir(u)}
              disabled={loading}
            />
          ))
        ) : (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2
                         bg-base-200 text-base-content/50 border border-base-300 cursor-not-allowed"
              disabled
            >
              <FileDown className="w-4 h-4" />
              Otros documentos
            </button>
            <span className="text-xs text-base-content/60 text-center">No disponibles</span>
          </div>
        )}
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-base-300 bg-base-200">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2
                     bg-error/10 text-error hover:bg-rose-200"
          disabled={loading}
        >
          ← Volver
        </button>

        {puedeMostrarEntrega && (
          <button
            type="button"
            onClick={onAceptar}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2
                       bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Realizar entrega
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentosSolicitud;

/* ---------- Botón de descarga ---------- */
const DownloadButton: React.FC<{
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  hint?: string;
}> = ({ label, disabled, onClick, hint }) => {
  const base =
    "w-full inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg px-4 py-2 " +
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={base} onClick={onClick} disabled={disabled} title={label}>
        <FileDown className="w-4 h-4" />
        {label}
      </button>
      {disabled && hint ? (
        <span className="text-xs text-base-content/60 text-center">{hint}</span>
      ) : null}
    </div>
  );
};

/* ---------- Tarjeta de carga ---------- */
const UploadCard: React.FC<{
  label: string;
  fieldName: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement>;
  isPending: boolean;
  onFileChange: (f: File | null) => void;
  onUpload: () => void;
}> = ({ label, file, inputRef, isPending, onFileChange, onUpload }) => (
  <div className="flex flex-col gap-2 rounded-lg border border-dashed border-blue-300 bg-info/10 p-3">
    <span className="text-xs font-semibold text-info">{label} — no disponible</span>
    <input
      ref={inputRef}
      type="file"
      accept=".pdf,image/*"
      disabled={isPending}
      onChange={(e) => {
        if (!validateFileInput(e)) return onFileChange(null);
        onFileChange(e.target.files?.[0] ?? null);
      }}
      className="block w-full text-xs text-base-content/70
        file:mr-2 file:py-1 file:px-2 file:rounded file:border-0
        file:text-xs file:font-semibold file:bg-base-100 file:text-base-content
        hover:file:bg-base-200"
    />
    {file && (
      <span className="text-[11px] text-base-content/60 truncate">
        {file.name}
      </span>
    )}
    <button
      type="button"
      onClick={onUpload}
      disabled={isPending || !file}
      className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs
                 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <UploadCloud className="w-3 h-3" />
      {isPending ? "Subiendo…" : `Subir ${label.toLowerCase()}`}
    </button>
  </div>
);
