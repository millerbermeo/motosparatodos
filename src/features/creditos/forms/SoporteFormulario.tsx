// src/components/solicitudes/SoporteFormulario.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { useSubirFormatos, useCreditoConDocumentos } from "../../../services/documentosServices";
import { useParams, useNavigate } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";
import { Loader2, FileText } from "lucide-react";
import { useActualizarEstadoCredito } from "../../../services/creditosServices";
import { ACCEPT_ATTR } from "../../../utils/fileValidation";
import { toAbsoluteUrl } from "../../../utils/files";
import { FileUpload } from "../../../shared/components/FileUpload";

type Props = { maxSizeMB?: number };

const SoporteFormulario: React.FC<Props> = () => {
  const [selected, setSelected] = useState<File[]>([]);

  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");
  const navigate = useNavigate();
  const redirectTo = `/creditos/detalle/${codigoFromUrl}`;

  const prev = useWizardStore(s => s.prev);
  const isFirst = useWizardStore(s => s.isFirst);
  const readOnly = useWizardStore(s => s.readOnly);
  const bloqueaRevision = useWizardStore(s => s.bloqueaRevision);


  const { mutateAsync: actualizarEstado } = useActualizarEstadoCredito();

  const subirFormatos = useSubirFormatos();
  const { data, isLoading, refetch } = useCreditoConDocumentos(codigo_credito);




  // 🔹 Construir URL correcta usando el helper centralizado (BASE_URL)
  const buildUrl = (path: string) => toAbsoluteUrl(path) ?? "";

  const handleManualUpload = () => {
    if (readOnly) return;
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
    if (bloqueaRevision) return;
    Swal.fire({
      icon: "warning",
      title: "¿Deseas registrar este proceso?",
      text: "Al finalizar, el crédito pasará a estado 'Revision'.",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    }).then(async (res) => {
      if (!res.isConfirmed) return;

      try {
        Swal.fire({
          title: "Actualizando...",
          text: "Enviando crédito a revisión",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        // ✅ aquí mandas el estado desde el frontend
        await actualizarEstado({
          codigo_credito,
          payload: { estado: "Revision" },
        });

        Swal.fire({
          icon: "success",
          title: "Proceso registrado ✅",
          text: "Crédito enviado a revisión. Redirigiendo...",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate(redirectTo);
        });
      } catch (err: any) {
        console.error(err);
        const raw =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "No fue posible actualizar el estado";
        const arr = Array.isArray(raw) ? raw : [raw];

        Swal.fire({
          icon: "error",
          title: "Error",
          html: arr.join("<br/>"),
        }).then(() => {
          navigate(redirectTo);
        });
      }
    });
  };

  const isUploading = subirFormatos.isPending;

  return (
    <div className="space-y-6">
      <h3 className="text-center text-xl font-bold text-base-content">
        Adjuntar Soportes del Crédito
      </h3>

      <FileUpload
        files={selected}
        onFilesChange={setSelected}
        multiple
        maxFiles={20}
        accept={ACCEPT_ATTR}
        disabled={isUploading || readOnly}
        helperText="Arrastra y suelta tus archivos aquí o haz clic para seleccionar"
      />

      <div>
        <h4 className="font-semibold mb-3">📑 Soportes registrados</h4>

        {isLoading ? (
          <div className="text-base-content/50 flex items-center gap-2">
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
                  className="p-4 bg-base-100 rounded-xl border border-success shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="text-info" />

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-info hover:underline text-sm"
                    >
                      {url}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-base-content/60 italic">
            No hay soportes registrados.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {!readOnly && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={prev}
            disabled={isFirst || isUploading}
          >
            ← Anterior
          </button>
        )}

        <div className="flex gap-2 ml-auto">
          {!readOnly && (
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
          )}

          <button
            data-wizard-save
            type="button"
            className="btn btn-success"
            onClick={readOnly || bloqueaRevision ? () => navigate(redirectTo) : handleRegisterAndFinish}
            disabled={isUploading}
          >
            {readOnly || bloqueaRevision ? "Ver detalle del crédito" : "Continuar y pasar a revisión →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoporteFormulario;