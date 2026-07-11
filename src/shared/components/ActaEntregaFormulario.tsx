// src/features/entregas/ActaEntregaFormulario.tsx
import React, { useMemo, useState } from "react";
import { useModalStore } from "../../store/modalStore";
import { useAuthStore } from "../../store/auth.store";
import Swal from "sweetalert2";
import { PenLine, CheckCircle2 } from "lucide-react";
import { useRegistrarActaEntrega } from "../../services/solicitudServices"; // ajusta el path exacto
import { alert } from "../../utils/alerts";
import { FileUpload } from "./FileUpload";

type EstadoActa = "borrador" | "cerrada";

type Props = {
  id_factura: number;
  responsableDefault?: string;
  onSuccess?: (id_acta?: number) => void;
};

const toMySQLDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const ActaEntregaFormulario: React.FC<Props> = ({
  id_factura,
  responsableDefault,
  onSuccess,
}) => {
  const close = useModalStore((s) => s.close);
  const user = useAuthStore((s) => s.user);

  // responsable oculto
  const responsable = useMemo(
    () => user?.name || user?.username || responsableDefault || "",
    [user?.name, user?.username, responsableDefault]
  );

  // fecha/hora ocultas
  const [fechaEntrega] = useState<string>(() => toMySQLDateTime(new Date()));
  const estado: EstadoActa = "cerrada";

  const [observaciones, setObservaciones] = useState("");
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // ⬅️ Hook correcto
  const { mutate: registrarActa, isPending } = useRegistrarActaEntrega();

  const puedeEnviar = useMemo(() => {
    if (!id_factura || !fechaEntrega || !responsable) return false;
    return !!firmaFile && files.length >= 1;
  }, [id_factura, fechaEntrega, responsable, firmaFile, files.length]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar || isPending) return;

    if (!responsable) {
      await Swal.fire({
        icon: "warning",
        title: "Sin responsable",
        text: "No se encontró un responsable para el acta.",
      });
      return;
    }

    const ok = await alert.confirm({
      title: "¿Registrar acta de entrega?",
      html: `Se registrará el acta de la <b>factura #${id_factura}</b> con la firma del cliente y ${files.length} foto(s). El acta quedará <b>cerrada</b>.`,
      confirmText: "Sí, registrar",
    });
    if (!ok) return;

    const fd = new FormData();
    fd.append("id_factura", String(id_factura));
    fd.append("fecha_entrega", fechaEntrega);
    fd.append("responsable", responsable);
    fd.append("estado", estado);      // 'cerrada'
    fd.append("cerrar_acta", "1");

    if (observaciones) fd.append("observaciones", observaciones);
    if (firmaFile) fd.append("firma_file", firmaFile);
    files.forEach((f) => fd.append("fotos[]", f));
    fd.append("_multipart", "1");

    // si quieres que registrar_acta también actualice por cotización:
    // fd.append("id_cotizacion", String(id_cotizacion));

registrarActa(fd, {
  onSuccess: (resp) => {
    const idActaNum =
      resp?.id_acta !== undefined
        ? Number(resp.id_acta)
        : undefined;

    onSuccess?.(
      idActaNum !== undefined && !Number.isNaN(idActaNum)
        ? idActaNum
        : undefined
    );

    close(); // cierro el modal

    // Espera a que se vea el alert de éxito (timer 1600ms) antes de recargar
    setTimeout(() => window.location.reload(), 1700);
  },
});

  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {/* Header */}
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-emerald-900">
            Acta de entrega
          </h3>
          <p className="text-xs text-success/80">
            Adjunta la firma del cliente y las fotos de soporte.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-600/10 text-success border border-success/30 px-3 py-1 text-xs font-medium">
          Factura #{id_factura}
        </span>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="fecha_entrega" value={fechaEntrega} />
      <input type="hidden" name="responsable" value={responsable} />
      <input type="hidden" name="cerrar_acta" value="1" />
      <input type="hidden" name="estado" value="cerrada" />

      {/* Observaciones */}
      <label className="block">
        <span className="text-sm font-medium text-base-content">
          Observaciones
        </span>
        <textarea
          className="mt-1 w-full rounded-xl bg-base-200 border border-base-300 focus:border-emerald-400 p-3 focus:ring-emerald-300"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas de la entrega (opcional)"
        />
      </label>

      {/* Firma */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-base-content inline-flex items-center gap-1.5">
            <PenLine className="w-4 h-4 text-emerald-600" />
            Firma del cliente <span className="text-error">*</span>
          </span>
          {firmaFile && (
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Firma cargada
            </span>
          )}
        </div>

        <FileUpload
          files={firmaFile ? [firmaFile] : []}
          onFilesChange={(fs) => setFirmaFile(fs[0] ?? null)}
          accept="image/*,.png,.jpg,.jpeg,.webp"
          helperText="JPG, PNG, WEBP · máx. 1.5 MB"
        />

        {!firmaFile && (
          <p className="text-xs text-error mt-1">* Requerida para registrar el acta.</p>
        )}
        <p className="text-xs text-base-content/60 mt-1">
          El acta se cerrará automáticamente al guardar.
        </p>
      </div>

      {/* Fotos */}
      <div className="rounded-2xl border-2 border-dashed border-base-300 p-5 bg-base-200">
        <p className="text-sm font-medium text-base-content text-center mb-3">
          Fotos de soporte
        </p>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          multiple
          maxFiles={20}
          accept="image/*,.png,.jpg,.jpeg,.webp"
          helperText="JPG, PNG, WEBP · puedes seleccionar varias"
        />

        {files.length < 1 && (
          <p className="mt-2 text-xs text-error">
            * Se requiere al menos una foto para registrar el acta.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="btn btn-sm bg-base-200 border-base-300"
          onClick={close}
          disabled={isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-sm text-white ${
            puedeEnviar
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-emerald-300 cursor-not-allowed"
          }`}
          disabled={!puedeEnviar || isPending}
        >
          {isPending ? "Guardando…" : "Registrar entrega"}
        </button>
      </div>
    </form>
  );
};

export default ActaEntregaFormulario;
