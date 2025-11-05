import React from "react";
import { FileDown, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { useAprobarEntregaFacturacion } from "../../services/solicitudServices";
import { useModalStore } from "../../store/modalStore";
import ActaEntregaFormulario from "../../shared/components/ActaEntregaFormulario";

type Docs = {
  manifiesto_url?: string | null;
  cedula_url?: string | null;
  factura_url?: string | null;
};

type Props = {
  id: string | number;
  id_factura: number;                // 👈 NUEVO: lo necesitamos para el acta
  responsableDefault?: string;       // 👈 opcional: para autollenar responsable en el acta
  docs: Docs;
  loading?: boolean;
  onVolver?: () => void;
  onAprobado?: (id: string | number) => void; // callback opcional
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/+$/, "") || "";

const DocumentosSolicitud: React.FC<Props> = ({
  id,
  id_factura,
  responsableDefault,
  docs,
  loading = false,
  onVolver,
  onAprobado,
}) => {
  const aprobar = useAprobarEntregaFacturacion();
  const open = useModalStore((s) => s.open);

  const abrir = (url?: string | null) => {
    if (url) window.open(`${API_BASE}/${url}`, "_blank", "noopener,noreferrer");
  };

  // ✅ Nuevo flujo:
  // 1) Clic en "Aceptar" -> abre modal global con el formulario del acta
  // 2) Al guardar el acta (onSuccess) -> ejecuta aprobar.mutate({ id }) y muestra alert de éxito
  const onAceptar = async () => {
    if (!id_factura || Number(id_factura) <= 0) {
      await Swal.fire({
        icon: "warning",
        title: "Falta id_factura",
        text: "No se encontró el id de la factura para registrar el acta.",
      });
      return;
    }

    open(
      <ActaEntregaFormulario
        key={`acta-${id_factura}`}
        id_factura={Number(id_factura)}
        responsableDefault={responsableDefault}
        onSuccess={async () => {
          // Cuando el acta se crea correctamente, aprobamos la entrega
          aprobar.mutate(
            { id },
            {
              onSuccess: async (resp) => {
                await Swal.fire({
                  icon: "success",
                  title: "Entrega aprobada",
                  text:
                    (Array.isArray(resp?.message)
                      ? resp.message.join("\n")
                      : (resp as any)?.message) ??
                    "La entrega fue aprobada correctamente.",
                  timer: 1400,
                  showConfirmButton: false,
                });
                onAprobado?.(id);
              },
              onError: async (err: any) => {
                const msg =
                  (Array.isArray(err?.response?.data?.message)
                    ? err?.response?.data?.message.join("\n")
                    : err?.response?.data?.error || err?.response?.data?.message) ||
                  "Error al aprobar la entrega";
                await Swal.fire({ icon: "error", title: "Error", text: String(msg) });
              },
            }
          );
        }}
      />,
      // Título del modal
      "Acta de entrega",
      // Opciones del modal global
      { size: "5xl", position: "center" }
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
