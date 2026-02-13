import React, { useEffect, useMemo, useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import Swal from "sweetalert2";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect } from "../../../shared/components/FormSelect";
import { useRegistrarSolicitudFacturacion2 } from "../../../services/solicitudServices";

export type FormValues = {
  documentos: "Si" | "No";
  distribuidora?: string;
  reciboPago?: string;
  descuentoAut?: string;
  saldoContraentrega?: string;

  cedulaFile?: FileList;
  manifiestoFile?: FileList;
  cartaFile?: FileList;

  // ✅ nuevo
  otrosDocumentosFile?: FileList;

  observaciones: string;
};

const DOC_OPTS = [
  { value: "Si", label: "Si" },
  { value: "No", label: "No" },
];

type Totales = {
  tot_valor_moto: number;
  cn_bruto: number;
  cn_iva: number;
  cn_total: number;

  accesorios_bruto: number;
  accesorios_iva: number;
  accesorios_total: number;

  soatNum: number;
  matriculaNum: number;
  impuestosNum: number;

  tot_seguros_accesorios: number;
  totalGeneralNum: number;
};

type SolicitudDataMin = {
  cotizacion_id?: number | string;
  nombre_cliente?: string;
  numero_documento?: string;
  telefono?: string;
  email?: string;
  motocicleta?: string;
  modelo?: string;
  numero_motor?: string;
  numero_chasis?: string;
  color?: string;
  placa?: string;
  codigo?: string;
  idPrimaria?: string | number;
};

type Props = {
  // RHF
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  errors: FieldErrors<FormValues>;
  isSubmitting: boolean;

  // ✅ YA NO se recibe onSubmit desde la page (se registra acá)

  // Variables/estado que vienen de la page
  docValue: "Si" | "No";
  esCreditoTercerosCot: boolean;

  // (opcionales si el padre los manda)
  cartaFiles?: FileList;
  manifiestoFiles?: FileList;
  cedulaFiles?: FileList;
  otrosDocumentosFiles?: FileList;

  // select distribuidoras
  DIST_OPTS: Array<{ value: string; label: string }>;
  loadingDists: boolean;

  // botones
  onBack: () => void;

  // ✅ NUEVO: todo lo necesario para registrar desde aquí
  codigo: string;
  solicitudData: SolicitudDataMin;
  distSlugMap: Map<string, { id: number; nombre: string }>;
  userRol?: string;
  navigateTo: (path: string) => void;
  totales: Totales;
};

function filesToArray(files?: FileList) {
  return files ? Array.from(files) : [];
}

function isImage(file: File) {
  return /^image\/(png|jpe?g)$/i.test(file.type);
}

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

type FilePreview = { file: File; url: string };

function useFileListPreviews(files?: FileList) {
  const arr = useMemo(() => filesToArray(files), [files]);
  const [items, setItems] = useState<FilePreview[]>([]);

  useEffect(() => {
    if (!arr.length) {
      setItems([]);
      return;
    }

    const next = arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems(next);

    return () => {
      next.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [arr]);

  return items;
}

function useFilesPreviews(files: File[]) {
  const [items, setItems] = useState<FilePreview[]>([]);

  useEffect(() => {
    if (!files.length) {
      setItems([]);
      return;
    }

    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems(next);

    return () => {
      next.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, [files]);

  return items;
}

type UploadBlockProps = {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  input: React.ReactNode;
  // ✅ debajo del input
  below?: React.ReactNode;
};

const UploadBlock: React.FC<UploadBlockProps> = ({
  label,
  required,
  helper,
  error,
  input,
  below,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4">
      <div>
        <p className="font-medium text-slate-800">
          {label} {required ? <span className="text-error">*</span> : null}
        </p>
        {helper ? (
          <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
        ) : null}
      </div>

      <div className="mt-3">{input}</div>

      {error ? <p className="text-xs text-error mt-2">{error}</p> : null}

      {below ? <div className="mt-3">{below}</div> : null}
    </div>
  );
};

const NormalPreviewList: React.FC<{ items: FilePreview[] }> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-700">
        Archivos seleccionados ({items.length})
      </p>

      <div className="grid grid-cols-1 gap-3">
        {items.map(({ file, url }) => (
          <div
            key={fileKey(file)}
            className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
          >
            <div className="px-3 py-2 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-700 truncate">{file.name}</p>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>

            {isImage(file) ? (
              <div className="bg-white border-t border-slate-200">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full object-contain max-h-56"
                />
              </div>
            ) : isPdf(file) ? (
              <div className="px-3 py-3 text-[11px] text-slate-500 border-t border-slate-200">
                PDF cargado (vista previa pequeña en “Otros”, aquí solo nombre).
              </div>
            ) : (
              <div className="px-3 py-3 text-[11px] text-slate-500 border-t border-slate-200">
                Sin vista previa para este archivo.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SmallOthersGrid: React.FC<{
  items: FilePreview[];
  onRemove: (file: File) => void;
  onClear: () => void;
}> = ({ items, onRemove, onClear }) => {
  if (!items.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-700">
          Otros documentos ({items.length})
        </p>
        <button
          type="button"
          className="text-xs text-slate-600 underline"
          onClick={onClear}
        >
          Limpiar
        </button>
      </div>

      {/* ✅ pequeños todos juntos */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ file, url }) => (
          <div
            key={fileKey(file)}
            className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            title={file.name}
          >
            <div className="px-2 py-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-700 truncate">{file.name}</p>
              <button
                type="button"
                className="text-[11px] text-red-600"
                onClick={() => onRemove(file)}
              >
                ✕
              </button>
            </div>

            {isImage(file) ? (
              <div className="bg-white border-t border-slate-200">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full object-cover h-24"
                />
              </div>
            ) : isPdf(file) ? (
              <div className="bg-white border-t border-slate-200 h-24 flex items-center justify-center">
                <span className="text-[11px] text-slate-600 px-2 text-center">
                  PDF
                </span>
              </div>
            ) : (
              <div className="bg-white border-t border-slate-200 h-24 flex items-center justify-center">
                <span className="text-[11px] text-slate-600 px-2 text-center">
                  Archivo
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SolicitarFacturacionForm: React.FC<Props> = ({
  control,
  register,
  handleSubmit,
  errors,
  isSubmitting,

  docValue,
  esCreditoTercerosCot,

  // si el padre los manda (opcionales)
  cartaFiles,
  manifiestoFiles,
  cedulaFiles,
  otrosDocumentosFiles,

  DIST_OPTS,
  loadingDists,

  onBack,

  // ✅ nuevos props para registrar acá
  codigo,
  solicitudData,
  distSlugMap,
  userRol,
  navigateTo,
  totales,
}) => {
  const { mutate: registrarSolicitud, isPending } =
    useRegistrarSolicitudFacturacion2({
      endpoint: "/crear_solicitud_facturacion.php",
    });

  // ✅ watchers para re-render al escoger archivos
  const watchedCarta = useWatch({ control, name: "cartaFile" });
  const watchedManifiesto = useWatch({ control, name: "manifiestoFile" });
  const watchedCedula = useWatch({ control, name: "cedulaFile" });
  const watchedOtros = useWatch({ control, name: "otrosDocumentosFile" });

  // ✅ fuente final por input (props si llegan, o watch si no)
  const cartaFinal = cartaFiles ?? watchedCarta;
  const manifiestoFinal = manifiestoFiles ?? watchedManifiesto;
  const cedulaFinal = cedulaFiles ?? watchedCedula;

  // ✅ previews por input (debajo de cada input)
  const cartaPreviews = useFileListPreviews(cartaFinal);
  const manifiestoPreviews = useFileListPreviews(manifiestoFinal);
  const cedulaPreviews = useFileListPreviews(cedulaFinal);

  // ✅ OTROS: acumulación real (se van sumando)
  const [otrosDocs, setOtrosDocs] = useState<File[]>([]);

  // si llegan del padre, los incorporamos (sin duplicar)
  useEffect(() => {
    const arr = filesToArray(otrosDocumentosFiles ?? undefined);
    if (!arr.length) return;

    setOtrosDocs((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      arr.forEach((f) => map.set(fileKey(f), f));
      return Array.from(map.values());
    });
  }, [otrosDocumentosFiles]);

  const addOtrosDocs = (incoming?: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const newFiles = Array.from(incoming);

    setOtrosDocs((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      newFiles.forEach((f) => map.set(fileKey(f), f));
      return Array.from(map.values());
    });
  };

  const removeOtro = (file: File) => {
    setOtrosDocs((prev) => prev.filter((f) => fileKey(f) !== fileKey(file)));
  };

  const clearOtros = () => setOtrosDocs([]);

  const otrosPreviews = useFilesPreviews(otrosDocs);

  // register para otros con onChange custom
  const otrosReg = register("otrosDocumentosFile");

  // ✅ SUBMIT ACÁ (ya no viene de la page)
  const onSubmitInternal = async (values: FormValues) => {
    const tipoSolicitud = esCreditoTercerosCot
      ? "Credito de Terceros"
      : "Contado";

    // Resolver nombre e ID reales desde el slug seleccionado
    const dist = values.distribuidora
      ? distSlugMap.get(values.distribuidora)
      : undefined;
    const distNombre = dist?.nombre ?? "";
    const distId = dist?.id ?? "";

    const fd = new FormData();

    fd.append("id_cotizacion", String(solicitudData.cotizacion_id ?? ""));
    fd.append("agencia", "Motos");
    fd.append("distribuidora", distNombre);
    fd.append("distribuidora_id", String(distId));
    fd.append("codigo_solicitud", codigo || "");
    fd.append("codigo_credito", "");
    fd.append("nombre_cliente", solicitudData.nombre_cliente || "");
    fd.append("tipo_solicitud", tipoSolicitud);
    fd.append("numero_recibo", values.reciboPago || "");
    fd.append("resibo_pago", values.reciboPago || "");
    fd.append("facturador", "Sin facturador");
    fd.append("autorizado", values.documentos === "Si" ? "Si" : "No");
    fd.append("facturado", "No");
    fd.append("entrega_autorizada", "No");
    fd.append("observaciones", values.observaciones || "");
    fd.append("is_act", "2");
    fd.append("descuento_solicitado_a", values.descuentoAut || "0");
    fd.append("saldo_contraentrega_a", values.saldoContraentrega || "0");

    if (values.cedulaFile?.[0]) fd.append("cedula", values.cedulaFile[0]);
    if (values.manifiestoFile?.[0])
      fd.append("manifiesto", values.manifiestoFile[0]);
    if (values.cartaFile?.[0]) fd.append("carta", values.cartaFile[0]);

    // ✅ OTROS DOCUMENTOS (acumulados)
    // Nota: si tu backend usa otra key, cámbiala aquí.
    // Opción común en PHP: otros_documentos[] para múltiples.
    otrosDocs.forEach((f) => fd.append("otros_documentos[]", f));

    // Extras de la solicitud/cotización
    fd.append("codigo_origen_facturacion", codigo || "");
    fd.append("numero_documento", solicitudData.numero_documento || "");
    fd.append("telefono", solicitudData.telefono || "");
    fd.append("email", solicitudData.email || "");
    fd.append("motocicleta", solicitudData.motocicleta || "");
    fd.append("modelo", solicitudData.modelo || "");
    fd.append("numero_motor", solicitudData.numero_motor || "");
    fd.append("numero_chasis", solicitudData.numero_chasis || "");
    fd.append("color", solicitudData.color || "");
    fd.append("placa", solicitudData.placa || "");

    // Valores calculados desde la cotización
    fd.append("cn_valor_moto", String(totales.tot_valor_moto ?? 0));
    fd.append("cn_valor_bruto", String(totales.cn_bruto ?? 0));
    fd.append("cn_iva", String(totales.cn_iva ?? 0));
    fd.append("cn_total", String(totales.cn_total ?? 0));

    fd.append("acc_valor_bruto", String(totales.accesorios_bruto ?? 0));
    fd.append("acc_iva", String(totales.accesorios_iva ?? 0));
    fd.append("acc_total", String(totales.accesorios_total ?? 0));

    fd.append("tot_valor_moto", String(totales.tot_valor_moto ?? 0));
    fd.append("tot_soat", String(totales.soatNum ?? 0));
    fd.append("tot_matricula", String(totales.matriculaNum ?? 0));
    fd.append("tot_impuestos", String(totales.impuestosNum ?? 0));
    fd.append(
      "tot_seguros_accesorios",
      String(totales.tot_seguros_accesorios ?? 0)
    );
    fd.append("tot_general", String(totales.totalGeneralNum ?? 0));

    registrarSolicitud(fd, {
      onSuccess: (resp: any) => {
        const texto = Array.isArray(resp?.message)
          ? resp.message.join("\n")
          : resp?.message ||
            "Solicitud de facturación registrada correctamente";

        Swal.fire({
          icon: "success",
          title: "Solicitud registrada",
          text: texto,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          const isAdmin =
            userRol === "Administrador" ||
            userRol === "Lider_marca" ||
            userRol === "Lider_punto";

          navigateTo(isAdmin ? "/solicitudes" : "/cotizaciones");
        });
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.details ||
          "No se pudo registrar la solicitud.";
        Swal.fire({ icon: "error", title: "Error", text: msg });
      },
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-md p-4 md:p-6 lg:p-7">
      <div className="mb-6 text-center space-y-1">
        <h3 className="text-lg md:text-xl font-semibold text-slate-900">
          Solicitud de facturación
        </h3>
        <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
          Diligencia los siguientes campos para generar la solicitud de
          facturación de esta cotización. Los campos marcados con{" "}
          <span className="text-error">*</span> son obligatorios.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Columna izquierda */}
          <div className="space-y-4">
            {/* Documentos */}
            <div className="space-y-1">
              <FormSelect<FormValues>
                name="documentos"
                label="Documentos"
                control={control}
                options={DOC_OPTS}
                rules={{ required: "Requerido" }}
              />
              <p className="text-[11px] text-slate-500">
                Indica si se entregan todos los documentos requeridos para la
                facturación.
              </p>
            </div>

            {/* Recibo de pago */}
            <FormInput
              name="reciboPago"
              label="Recibo de pago"
              control={control}
              placeholder="Digite el número de recibo de pago"
              rules={{
                required: "Requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                maxLength: { value: 40, message: "Máximo 40 caracteres" },
              }}
            />

            {/* Saldo contraentrega */}
            <div className="space-y-1">
              <FormInput
                name="saldoContraentrega"
                label="Saldo contraentrega"
                control={control}
                placeholder="0"
                rules={{
                  validate: (v) => {
                    const str = typeof v === "string" ? v : "";
                    return (
                      !str || /^\d+$/.test(str.trim()) || "Solo números enteros"
                    );
                  },
                }}
              />
              <p className="text-[11px] text-slate-500">
                Si aplica, indica el valor pendiente que el cliente cancelará al
                momento de la entrega.
              </p>
            </div>

            {/* Carta crédito terceros */}
            {esCreditoTercerosCot && (
              <UploadBlock
                label="Carta de Aprobación del crédito"
                required
                helper="Adjunta carta (PDF o imagen). Debajo verás cada archivo."
                error={errors.cartaFile?.message as string | undefined}
                input={
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={`file-input file-input-bordered w-full bg-slate-50 ${
                      errors.cartaFile ? "file-input-error" : ""
                    }`}
                    {...register("cartaFile", {
                      validate: (files) =>
                        !esCreditoTercerosCot ||
                        (files && files.length > 0) ||
                        "Requerido cuando es crédito de terceros",
                    })}
                  />
                }
                below={<NormalPreviewList items={cartaPreviews} />}
              />
            )}

            {/* Manifiesto (opcional) */}
            <UploadBlock
              label="Manifiesto"
              helper="Opcional. Debajo verás cada archivo."
              error={errors.manifiestoFile?.message as string | undefined}
              input={
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`file-input file-input-bordered w-full bg-slate-50 ${
                    errors.manifiestoFile ? "file-input-error" : ""
                  }`}
                  {...register("manifiestoFile")} // ✅ opcional
                />
              }
              below={<NormalPreviewList items={manifiestoPreviews} />}
            />

            {/* Observaciones */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4">
              <label className="label px-0">
                <span className="label-text font-medium text-slate-700">
                  Observaciones <span className="text-error">*</span>
                </span>
              </label>
              <textarea
                className={`textarea w-full textarea-bordered bg-slate-50 min-h-28 ${
                  errors.observaciones ? "textarea-error" : ""
                }`}
                placeholder="Incluye observaciones relevantes para el área de facturación"
                {...register("observaciones", {
                  required: "Requerido",
                  minLength: { value: 5, message: "Mínimo 5 caracteres" },
                })}
              />
              {errors.observaciones && (
                <p className="text-xs text-error mt-1">
                  {errors.observaciones.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            {/* Distribuidora */}
            <div className="space-y-1">
              <FormSelect<FormValues>
                name="distribuidora"
                label="Distribuidora"
                control={control}
                options={DIST_OPTS}
                disabled={loadingDists}
                loading={loadingDists}
              />
              {loadingDists && (
                <p className="text-xs text-slate-500">
                  Cargando distribuidoras…
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Selecciona la distribuidora asociada a esta venta, si aplica.
              </p>
            </div>

            {/* Descuento a autorizar */}
            <div className="space-y-1">
              <FormInput
                name="descuentoAut"
                label="Descuento a autorizar"
                control={control}
                placeholder="0"
                rules={{
                  validate: (v) => {
                    const str = typeof v === "string" ? v : "";
                    return (
                      !str || /^\d+$/.test(str.trim()) || "Solo números enteros"
                    );
                  },
                }}
              />
              <p className="text-[11px] text-slate-500">
                Si existe un descuento especial, especifícalo aquí para registro
                de facturación.
              </p>
            </div>

            {/* Cédula */}
            <UploadBlock
              label="Copia de la cédula"
              required={docValue === "Si"}
              helper="Debajo verás cada archivo."
              error={errors.cedulaFile?.message as string | undefined}
              input={
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`file-input file-input-bordered w-full bg-slate-50 ${
                    errors.cedulaFile ? "file-input-error" : ""
                  }`}
                  {...register("cedulaFile", {
                    validate: (files) =>
                      docValue === "No" ||
                      (files && files.length > 0) ||
                      "Requerido",
                  })}
                />
              }
              below={<NormalPreviewList items={cedulaPreviews} />}
            />

            {/* ✅ Otros documentos: todos juntos pequeños debajo del input */}
            <UploadBlock
              label="Otros documentos"
              helper="Opcional. Puedes subir muchos y se acumulan. Abajo se verán todos juntos en pequeño."
              error={errors.otrosDocumentosFile?.message as string | undefined}
              input={
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`file-input file-input-bordered w-full bg-slate-50 ${
                    errors.otrosDocumentosFile ? "file-input-error" : ""
                  }`}
                  name={otrosReg.name}
                  ref={otrosReg.ref}
                  onBlur={otrosReg.onBlur}
                  onChange={(e) => {
                    // RHF (mantiene el último FileList)
                    otrosReg.onChange(e);

                    // ✅ acumulación real (esto es lo que enviamos al backend)
                    addOtrosDocs(e.target.files);

                    // ✅ permite volver a seleccionar el mismo archivo luego
                    e.currentTarget.value = "";
                  }}
                />
              }
              below={
                <SmallOthersGrid
                  items={otrosPreviews}
                  onRemove={removeOtro}
                  onClear={clearOtros}
                />
              }
            />

            {/* (Opcional) info del último FileList de RHF */}
            {watchedOtros?.length ? (
              <p className="text-[11px] text-slate-500">
                Última selección: {watchedOtros.length} archivo(s).
              </p>
            ) : null}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-slate-100 mt-2 pt-4">
          <button
            type="button"
            className="btn btn-ghost md:btn-outline order-2 md:order-1"
            onClick={onBack}
          >
            ← Volver
          </button>
          <button
            type="submit"
            className="btn btn-success bg-emerald-600 hover:bg-emerald-700 border-none text-white px-6 order-1 md:order-2"
            disabled={isSubmitting || isPending || loadingDists}
          >
            {isSubmitting || isPending
              ? "Procesando…"
              : "✓ Enviar solicitud de facturación"}
          </button>
        </div>
      </form>
    </section>
  );
};
