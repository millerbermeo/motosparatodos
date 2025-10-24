import React from "react";
import { FileDown, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { useAprobarEntregaFacturacion } from "../../services/solicitudServices";

type Docs = {
  manifiesto_url?: string | null;
  cedula_url?: string | null;
  factura_url?: string | null;
};

type Props = {
  id: string | number;
  docs: Docs;
  loading?: boolean;
  onVolver?: () => void;
  onAprobado?: (id: string | number) => void; // callback opcional
};

const DocumentosSolicitud: React.FC<Props> = ({
  id,
  docs,
  loading = false,
  onVolver,
  onAprobado,
}) => {
  const aprobar = useAprobarEntregaFacturacion();

  const abrir = (url?: string | null) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const onAceptar = async () => {
    const res = await Swal.fire({
      icon: "warning",
      title: "¿Está seguro?",
      text: "El negocio será aprobado para su entrega",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No, ¡cancelar!",
      reverseButtons: true,
      confirmButtonColor: "#10B981", // emerald-500
      cancelButtonColor: "#EF4444",  // red-500
    });
    if (!res.isConfirmed) return;

    aprobar.mutate(
      { id },
      {
        onSuccess: async (resp) => {
          await Swal.fire({
            icon: "success",
            title: "Aprobado",
            text:
              (Array.isArray(resp?.message) ? resp.message.join("\n") : resp?.message) ??
              "La entrega fue aprobada correctamente.",
            timer: 1400,
            showConfirmButton: false,
          });
          onAprobado?.(id);
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-center text-lg md:text-xl font-bold text-slate-800">
          Documentos de la solicitud
        </h3>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <DownloadButton
          label="Descargar manifiesto"
          onClick={() => abrir(docs.manifiesto_url)}
          disabled={loading || !docs.manifiesto_url}
          hint={!docs.manifiesto_url ? "No disponible" : undefined}
        />
        <DownloadButton
          label="Descargar cédula"
          onClick={() => abrir(docs.cedula_url)}
          disabled={loading || !docs.cedula_url}
          hint={!docs.cedula_url ? "No disponible" : undefined}
        />
        <DownloadButton
          label="Descargar factura"
          onClick={() => abrir(docs.factura_url)}
          disabled={loading || !docs.factura_url}
          hint={!docs.factura_url ? "Falta la factura" : undefined}
        />
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2
                     bg-rose-100 text-rose-700 hover:bg-rose-200"
          disabled={loading || aprobar.isPending}
        >
          ← Volver
        </button>

        <button
          type="button"
          onClick={onAceptar}
          disabled={loading || aprobar.isPending}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2
                     bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          title="Aprobar entrega"
        >
          <CheckCircle2 className="w-4 h-4" />
          {aprobar.isPending ? "Aprobando…" : "Aceptar"}
        </button>
      </div>
    </div>
  );
};

export default DocumentosSolicitud;

/* ---------- Botón reutilizable ---------- */
const DownloadButton: React.FC<{
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  hint?: string;
}> = ({ label, disabled, onClick, hint }) => {
  const base =
    "w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 " +
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={base} onClick={onClick} disabled={disabled} title={label}>
        <FileDown className="w-4 h-4" />
        {label}
      </button>
      {disabled && hint ? (
        <span className="text-xs text-slate-500 text-center">{hint}</span>
      ) : null}
    </div>
  );
};
