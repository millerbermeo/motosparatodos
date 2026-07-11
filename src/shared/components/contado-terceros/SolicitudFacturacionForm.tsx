import React, { useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { useController } from "react-hook-form";
import Swal from "sweetalert2";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect } from "../../../shared/components/FormSelect";
import { FileUpload } from "../../../shared/components/FileUpload";
import { useRegistrarSolicitudFacturacion2 } from "../../../services/solicitudServices";
import { HeaderSolicitud } from "../solicitar-facturacion/HeaderSolicitud";
import { filesToFileList } from "../../../utils/fileValidation";
import { alert } from "../../../utils/alerts";
import { unformatNumber } from "../../../utils/money";

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
    <div className="rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
      <div>
        <p className="font-medium text-base-content">
          {label} {required ? <span className="text-error">*</span> : null}
        </p>
        {helper ? (
          <p className="mt-1 text-[11px] text-base-content/60">{helper}</p>
        ) : null}
      </div>

      <div className="mt-3">{input}</div>

      {error ? <p className="text-xs text-error mt-2">{error}</p> : null}

      {below ? <div className="mt-3">{below}</div> : null}
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

  // ✅ campos de archivo controlados (mismo `control` del form del padre)
  const cartaCtrl = useController({
    name: "cartaFile",
    control,
    rules: {
      validate: (files) =>
        !esCreditoTercerosCot ||
        (files && files.length > 0) ||
        "Requerido cuando es crédito de terceros",
    },
  });
  const manifiestoCtrl = useController({ name: "manifiestoFile", control });
  const cedulaCtrl = useController({
    name: "cedulaFile",
    control,
    rules: {
      validate: (files) =>
        docValue === "No" || (files && files.length > 0) || "Requerido",
    },
  });

  // ✅ OTROS: acumulación real (se van sumando), lo maneja FileUpload en modo múltiple
  const [otrosDocs, setOtrosDocs] = useState<File[]>([]);
  const clearOtros = () => setOtrosDocs([]);

  // ✅ SUBMIT ACÁ (ya no viene de la page)
  const onSubmitInternal = async (values: FormValues) => {
    const tipoSolicitud = esCreditoTercerosCot
      ? "Credito de Terceros"
      : "Contado";

    const ok = await alert.confirm({
      title: "¿Solicitar facturación?",
      html: `Se creará la solicitud de facturación (<b>${tipoSolicitud}</b>) para esta cotización. ¿Deseas continuar?`,
      confirmText: "Sí, solicitar",
    });
    if (!ok) return;

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
    fd.append("descuento_solicitado_a", unformatNumber(values.descuentoAut, { allowDecimals: false }) || "0");
    fd.append("saldo_contraentrega_a", unformatNumber(values.saldoContraentrega, { allowDecimals: false }) || "0");

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
          : resp?.message || "Solicitud de facturación registrada correctamente";

        Swal.fire({
          icon: "success",
          title: "✓ Solicitud registrada",
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
        const data = err?.response?.data;
        const status = err?.response?.status;

        // ── 409: cotización ya tiene solicitud de facturación ─────────────
        if (status === 409 || data?.errno === 1062) {
          Swal.fire({
            icon: "warning",
            title: "Solicitud ya registrada",
            text: data?.error ?? "Esta cotización ya fue enviada a facturación.",
            confirmButtonText: "Entendido",
            allowOutsideClick: true, // permite cerrar haciendo clic afuera
          }).then(() => {
            window.location.reload();
          });

          return;
        }
        // ── 422: campo / archivo obligatorio faltante ─────────────────────
        if (status === 422) {
          Swal.fire({
            icon: "error",
            title: "Datos incompletos",
            text: data?.error ?? "Faltan campos o archivos obligatorios.",
            confirmButtonText: "Revisar",
          });
          return;
        }

        // ── 500 / cualquier otro error ────────────────────────────────────
        Swal.fire({
          icon: "error",
          title: "Error al registrar",
          text: data?.error ?? "No se pudo registrar la solicitud. Intenta de nuevo.",
          confirmButtonText: "Cerrar",
        });
      },
    });

  };

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 shadow-md p-4 md:p-6 lg:p-7">

      <HeaderSolicitud tipo="contado" />

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
              <p className="text-[11px] text-base-content/60">
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
                formatThousands
                rules={{
                  validate: (v) => {
                    const str = unformatNumber(
                      typeof v === "string" ? v : "",
                      { allowDecimals: false }
                    );
                    return (
                      !str || /^\d+$/.test(str) || "Solo números enteros"
                    );
                  },
                }}
              />
              <p className="text-[11px] text-base-content/60">
                Si aplica, indica el valor pendiente que el cliente cancelará al
                momento de la entrega.
              </p>
            </div>

            {/* Carta crédito terceros */}
            {esCreditoTercerosCot && (
              <UploadBlock
                label="Carta de Aprobación del crédito"
                required
                helper="Adjunta carta (PDF o imagen)."
                error={errors.cartaFile?.message as string | undefined}
                input={
                  <FileUpload
                    files={cartaCtrl.field.value ? Array.from(cartaCtrl.field.value as FileList) : []}
                    onFilesChange={(files) => cartaCtrl.field.onChange(filesToFileList(files))}
                    multiple
                    maxFiles={10}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                }
              />
            )}

            {/* Manifiesto (opcional) */}
            <UploadBlock
              label="Manifiesto"
              helper="Opcional."
              error={errors.manifiestoFile?.message as string | undefined}
              input={
                <FileUpload
                  files={manifiestoCtrl.field.value ? Array.from(manifiestoCtrl.field.value as FileList) : []}
                  onFilesChange={(files) => manifiestoCtrl.field.onChange(filesToFileList(files))}
                  multiple
                  maxFiles={10}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              }
            />

            {/* Observaciones */}
            <div className="rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
              <label className="label px-0">
                <span className="label-text font-medium text-base-content">
                  Observaciones <span className="text-error">*</span>
                </span>
              </label>
              <textarea
                className={`textarea w-full textarea-bordered bg-base-200 min-h-28 ${errors.observaciones ? "textarea-error" : ""
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
                <p className="text-xs text-base-content/60">
                  Cargando distribuidoras…
                </p>
              )}
              <p className="text-[11px] text-base-content/60">
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
                formatThousands
                rules={{
                  validate: (v) => {
                    const str = unformatNumber(
                      typeof v === "string" ? v : "",
                      { allowDecimals: false }
                    );
                    return (
                      !str || /^\d+$/.test(str) || "Solo números enteros"
                    );
                  },
                }}
              />
              <p className="text-[11px] text-base-content/60">
                Si existe un descuento especial, especifícalo aquí para registro
                de facturación.
              </p>
            </div>

            {/* Cédula */}
            <UploadBlock
              label="Copia de la cédula"
              required={docValue === "Si"}
              helper="Adjunta la cédula (PDF o imagen)."
              error={errors.cedulaFile?.message as string | undefined}
              input={
                <FileUpload
                  files={cedulaCtrl.field.value ? Array.from(cedulaCtrl.field.value as FileList) : []}
                  onFilesChange={(files) => cedulaCtrl.field.onChange(filesToFileList(files))}
                  multiple
                  maxFiles={10}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              }
            />

            {/* ✅ Otros documentos: se acumulan al seleccionar */}
            <UploadBlock
              label="Otros documentos"
              helper="Opcional. Puedes subir muchos y se acumulan."
              input={
                <div className="space-y-2">
                  <FileUpload
                    files={otrosDocs}
                    onFilesChange={setOtrosDocs}
                    multiple
                    maxFiles={20}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {otrosDocs.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-base-content/70 underline"
                      onClick={clearOtros}
                    >
                      Limpiar todos
                    </button>
                  )}
                </div>
              }
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-base-200 mt-2 pt-4">
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
