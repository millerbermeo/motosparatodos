// src/components/solicitudes/SolicitudFormulario.tsx
import React, { useState } from "react";
import { useSubirFirma } from "../../../services/documentosServices";
import { useParams } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";
import Swal from "sweetalert2";

const SolicitudFormulario: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  // Wizard (Zustand)
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const isFirst = useWizardStore((s) => s.isFirst);

  // Código de crédito desde la URL
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  // Mutación para subir firma
  const subirFirma = useSubirFirma();
  const isUploading = subirFirma.isPending;

  const handleUpload = () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Archivo requerido",
        text: "Por favor selecciona un archivo primero",
      });
      return;
    }
    if (!codigo_credito) {
      Swal.fire({
        icon: "error",
        title: "Código de crédito no encontrado",
        text: "No se encontró el código de crédito en la URL.",
      });
      return;
    }

    subirFirma.mutate(
      { codigo_credito, firma: file },
      {
        onSuccess: () => {
          Swal.fire({
            icon: "success",
            title: "Firma subida correctamente",
            text: "La firma fue adjuntada con éxito",
            timer: 2000,
            showConfirmButton: false,
          });
          next();
        },
        onError: (err: any) => {
          console.error("Error al subir la firma:", err);
          Swal.fire({
            icon: "error",
            title: "Error al subir la firma",
            text: "Ocurrió un problema al subir la firma. Inténtalo de nuevo.",
          });
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sección 1: Descargar PDF */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">1. Descargar solicitud</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/solicitud.pdf"; // ajusta si tu endpoint es otro
            link.download = "solicitud.pdf";
            link.click();
            Swal.fire({
              icon: "info",
              title: "Solicitud descargada",
              text: "Revisa tu carpeta de descargas.",
              timer: 2000,
              showConfirmButton: false,
            });
          }}
        >
          📥 Descargar solicitud
        </button>
      </div>

      {/* Sección 2: Adjuntar firmas (opcional) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">2. Adjuntar firmas (opcional)</h2>

        <input
          type="file"
          accept="application/pdf,image/*"
          className="file-input file-input-bordered w-full max-w-full"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={isUploading}
        />
        {file && (
          <div className="text-sm opacity-70">
            Archivo seleccionado: <span className="font-medium">{file.name}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="btn btn-primary disabled:opacity-50"
          >
            {isUploading ? "Subiendo..." : "📤 Subir firma"}
          </button>

          {/* ✅ Avanzar sin subir (firma opcional) */}
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => {
              Swal.fire({
                icon: "info",
                title: "Continuar sin subir",
                text: "Avanzarás al siguiente paso sin subir la firma.",
                showConfirmButton: false,
                timer: 1500,
              });
              next();
            }}
            disabled={isUploading}
          >
            Continuar sin subir
          </button>
        </div>
      </div>

      {/* Controles de paso */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={prev}
          disabled={isFirst || isUploading}
        >
          ← Anterior
        </button>
        <div />
      </div>
    </div>
  );
};

export default SolicitudFormulario;
