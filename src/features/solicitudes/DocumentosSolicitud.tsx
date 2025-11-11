import React from "react";
import { FileDown, CheckCircle2 } from "lucide-react";
// import Swal from "sweetalert2"; // 👈 ELIMINADO
// import { useAprobarEntregaFacturacion } from "../../services/solicitudServices"; // 👈 ELIMINADO
import { useModalStore } from "../../store/modalStore";
import ActaEntregaFormulario from "../../shared/components/ActaEntregaFormulario";

type Docs = {
  manifiesto_url?: string | null;
  cedula_url?: string | null;
  factura_url?: string | null;
};

type Props = {
  id: string | number;
  id_factura: number;
  responsableDefault?: string;
  docs: Docs;
  loading?: boolean;
  onVolver?: () => void;
  onAprobado?: (id: string | number) => void; // callback opcional
  estadoCotizacion?: string; // 👈 NUEVO: estado actual de la cotización
};

// Backend base (env o fallback fijo)
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://tuclick.vozipcolombia.net.co/motos/back";

const resolveUrl = (url?: string | null): string | null => {
  if (!url) return null;
  // Si ya es absoluta, la usamos tal cual
  if (/^https?:\/\//i.test(url)) return url;
  // Si es relativa, la pegamos al backend
  const base = API_BASE.replace(/\/+$/, "");
  const path = url.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const DocumentosSolicitud: React.FC<Props> = ({
  id,
  id_factura,
  responsableDefault,
  docs,
  loading = false,
  onVolver,
  onAprobado,
  estadoCotizacion,
}) => {
  const open = useModalStore((s) => s.open);

  const abrir = (url?: string | null) => {
    const finalUrl = resolveUrl(url);
    if (!finalUrl) return;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  // ✅ Nuevo flujo:
  // 1) Clic en "Aceptar" -> abre modal global con el formulario del acta
  // 2) El componente 'ActaEntregaFormulario' se encarga de guardar y actualizar estados.
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

  // 👇 Si la cotización está en "Facturado", NO mostramos el botón Aceptar
  const isFacturado =
    estadoCotizacion &&
    estadoCotizacion.toString().toLowerCase() === "facturado";

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
          disabled={loading}
        >
          ← Volver
        </button>

        {/* Solo mostramos "Aceptar" si NO está facturado */}
        {!isFacturado && (
          <button
            type="button"
            onClick={onAceptar}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2
                       bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Aprobar entrega"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aceptar
          </button>
        )}
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
      <button
        type="button"
        className={base}
        onClick={onClick}
        disabled={disabled}
        title={label}
      >
        <FileDown className="w-4 h-4" />
        {label}
      </button>
      {disabled && hint ? (
        <span className="text-xs text-slate-500 text-center">{hint}</span>
      ) : null}
    </div>
  );
};
