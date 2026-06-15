// src/components/creditos/CambiarEstadoCredito.tsx
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import Swal from "sweetalert2";
import { useCambiarEstadoCredito } from "../../../services/creditosServices";
import { useAuthStore } from "../../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { FileText, X as XIcon } from "lucide-react";
import { BASE_URL } from "../../../utils/url";
import { validateFileInput, ACCEPT_ATTR } from "../../../utils/fileValidation";

const BaseUrl = BASE_URL;

const buildDocUrl = (filename?: string): string | undefined => {
  if (!filename) return undefined;
  const path = filename.startsWith("docs_creditos/") ? filename : `docs_creditos/${filename}`;
  return `${BaseUrl.replace(/\/+$/, "")}/${path}`;
};

// Tabla en pantalla
import TablaAmortizacionCredito from "../TablaAmortizacionCredito";

// PDF
import { PDFDownloadLink } from "@react-pdf/renderer";
import TablaAmortizacionPDFDoc from "../pdf/TablaAmortizacionPDFDoc";
import { resolverTasaSeguroVidaDecimal } from "../../../shared/components/credito/creditoDirecto.utils";

type Props = { codigo_credito: string | number; data?: any };

type CambiarEstadoValues = {
  estado: "Pendiente" | "Aprobado" | "No viable" | "";
  comentario: string;
  formato_referenciacion?: File | null;
  datacredito_deudor1?: File | null;
};

const optionsEstado: SelectOption[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobado", label: "Aprobado" },
  { value: "No viable", label: "No viable" },
];

const buildNombreCliente = (info?: any): string => {
  if (!info) return "";
  return `${info?.primer_nombre ?? ""} ${info?.segundo_nombre ?? ""} ${info?.primer_apellido ?? ""
    } ${info?.segundo_apellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
};

const CambiarEstadoCredito: React.FC<Props> = ({ codigo_credito, data }) => {
  const cambiar = useCambiarEstadoCredito();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [clearedRef, setClearedRef] = useState(false);
  const [clearedDc, setClearedDc] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<CambiarEstadoValues>({
    defaultValues: { estado: "" as any, comentario: "" },
    mode: "onBlur",
  });


  const isAprobado = watch("estado") === "Aprobado";

  const existingRef = data?.credito?.formato_referencia as string | undefined;
  const existingDc = data?.credito?.formato_datacredito as string | undefined;
  const showExistingRef = !!existingRef && !clearedRef;
  const showExistingDc = !!existingDc && !clearedDc;

  const onSubmit = async (values: CambiarEstadoValues) => {
    const nombre_usuario = user?.name ?? "Usuario";
    const rol_usuario = user?.rol ?? "Usuario";

    const res = await Swal.fire({
      title: "¿Confirmar cambio de estado?",
      html: `
        <div style="text-align:left;font-size:13px;line-height:1.35">
          <b>Código:</b> ${String(codigo_credito)}<br/>
          <b>Estado:</b> ${values.estado}<br/>
          <b>Comentario:</b><br/>${values.comentario || "(sin comentario)"}<br/>
          <b>Usuario:</b> ${nombre_usuario} (${rol_usuario})
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });
    if (!res.isConfirmed) return;

    await cambiar.mutateAsync({
      codigo_credito,
      payload: {
        estado: values.estado,
        comentario: values.comentario.trim(),
        nombre_usuario,
        rol_usuario,
        formato_referenciacion: values.formato_referenciacion ?? null,
        datacredito_deudor1: values.datacredito_deudor1 ?? null,
      },
    });

    Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: "El estado del crédito fue actualizado correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/creditos");
  };


  // ====== DATA PARA LA TABLA DE AMORTIZACIÓN (PANTALLA) ======
  const creditoTabla = useMemo(() => {
    if (!data) return null;

    return {
      valor_producto: Number(
        data?.credito?.valor_producto ??
        data?.moto?.valorMotocicleta ??
        0
      ) - Number(data?.credito?.garantia_extendida_valor ?? 0),
      cuota_inicial: Number(
        data?.credito?.cuota_inicial ??
        data?.moto?.cuotaInicial ??
        0
      ),
      plazo_meses: Number(
        data?.credito?.plazo_meses ??
        data?.moto?.numeroCuotas ??
        0
      ),
      soat: data?.credito?.soat ?? data?.moto?.soat ?? 0,
      matricula: data?.credito?.matricula ?? data?.moto?.matricula ?? 0,
      impuestos: data?.credito?.impuestos ?? 0,
      accesorios_total:
        data?.credito?.accesorios_total ??
        data?.moto?.accesorios_total ??
        0,
      precio_seguros:
        data?.credito?.precio_seguros ??
        data?.seguro?.total ??
        0,
      garantia_extendida_valor:
        data?.credito?.garantia_extendida_valor ?? 0,
    };
  }, [data]);

  // Fecha para la tabla (mes/año de las cuotas en la UI)
  const fechaCreacionTabla = useMemo(() => {
    const raw =
      data?.credito?.fecha_inicial ??
      data?.credito?.fecha_creacion ??
      null;
    return raw ? String(raw) : undefined;
  }, [data]);

  // ====== DATA PARA EL PDF (TablaAmortizacionPDFDoc) ======
  const clienteInfo = useMemo(
    () => ({
      nombre: buildNombreCliente(data?.informacion_personal),
      documento: data?.informacion_personal?.numero_documento ?? "",
      direccion: data?.informacion_personal?.direccion_residencia ?? "",
      telefono: data?.informacion_personal?.celular ?? "",
    }),
    [data]
  );

  const { productoCot, cedulaCot } = useMemo(() => {
    const cot = data?.cotizacion;
    const suf = (cot?.moto_seleccionada ?? 1) === 2 ? "b" : "a";
    return {
      productoCot: [cot?.[`marca_${suf}`], cot?.[`linea_${suf}`]].filter(Boolean).join(" ") || undefined,
      cedulaCot: cot?.cedula ?? clienteInfo.documento ?? undefined,
    };
  }, [data, clienteInfo.documento]);

  // const empresaInfo = useMemo(
  //   () => ({
  //     nombre: data?.empresa?.nombre ?? "Mi empresa",
  //     ciudad: data?.empresa?.ciudad ?? "Cali",
  //     nit: data?.empresa?.nit ?? "",
  //   }),
  //   [data]
  // );

  const tasaMensualPorcentaje = useMemo(() => {
    const raw =
      data?.credito?.tasa_mensual ??
      data?.credito?.tasaMensual ??
      data?.credito?.tasa_mensual_porcentaje ??
      data?.cotizacion?.tasa_financiacion; // viene en la cotización
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
    return 1.96;
  }, [data]);

  const fechaPlan = useMemo(() => {
    const raw =
      data?.credito?.fecha_inicial ??
      data?.credito?.fecha_creacion ??
      null;
    return raw ? String(raw) : undefined;
  }, [data]);



  // console.log(data.credito.cotizacion_id)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between border-b border-info pb-2">
        <div className="text-sm font-semibold">Cambiar estado</div>
        <div className="text-xs text-neutral-600">
          Código: <span className="font-mono">{String(codigo_credito)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormSelect<CambiarEstadoValues>
          name="estado"
          label="Estado *"
          control={control}
          options={optionsEstado}
          placeholder="Seleccione..."
          rules={{ required: "El estado es obligatorio" }}
        />

        <FormInput<CambiarEstadoValues>
          name="comentario"
          label="Comentario *"
          control={control}
          placeholder="Describa el motivo del cambio"
          rules={{
            required: "El comentario es obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          }}
          className="md:col-span-1 mt-6"
        />
      </div>

      {/* Campos EXTRAS solo para Aprobado */}
      {isAprobado && (
        <div className="grid grid-cols-1 gap-3">
          <Controller
            name="formato_referenciacion"
            control={control}
            rules={{ required: !showExistingRef ? "El formato de referenciación es obligatorio" : false }}
            render={({ field, fieldState }) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Formato de referenciación {!showExistingRef && "*"}</span>
                </label>
                <input
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    if (!validateFileInput(e)) return field.onChange(null);
                    field.onChange(e.target.files?.[0] ?? null);
                  }}
                />
                {fieldState.error && (
                  <span className="text-error text-xs mt-1">
                    {fieldState.error.message}
                  </span>
                )}
                {showExistingRef && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                    <FileText className="w-4 h-4 text-green-600 shrink-0" />
                    <a
                      href={buildDocUrl(existingRef)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-green-700 hover:underline text-xs"
                    >
                      {existingRef}
                    </a>
                    <button
                      type="button"
                      onClick={() => setClearedRef(true)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                      title="Quitar documento existente"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="datacredito_deudor1"
            control={control}
            rules={{ required: !showExistingDc ? "El Datacrédito del deudor 1 es obligatorio" : false }}
            render={({ field, fieldState }) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Datacrédito deudor 1 {!showExistingDc && "*"}</span>
                </label>
                <input
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    if (!validateFileInput(e)) return field.onChange(null);
                    field.onChange(e.target.files?.[0] ?? null);
                  }}
                />
                {fieldState.error && (
                  <span className="text-error text-xs mt-1">
                    {fieldState.error.message}
                  </span>
                )}
                {showExistingDc && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                    <FileText className="w-4 h-4 text-green-600 shrink-0" />
                    <a
                      href={buildDocUrl(existingDc)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-green-700 hover:underline text-xs"
                    >
                      {existingDc}
                    </a>
                    <button
                      type="button"
                      onClick={() => setClearedDc(true)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                      title="Quitar documento existente"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          {/* 👇 COLLAPSE DAISYUI CON TABLA + BOTÓN DESCARGAR PDF */}
          {creditoTabla && (
            <div className="mt-4">
              <div
                tabIndex={0}
                className="collapse bg-base-100 border-base-300 border rounded-box"
              >
                <div className="collapse-title font-semibold flex items-center justify-between">
                  <span>Tabla de amortización del crédito</span>

                  {/* Botón para descargar PDF */}
                  <PDFDownloadLink
                    document={
                      <TablaAmortizacionPDFDoc
                        credito={creditoTabla}
                        tasaMensualPorcentaje={tasaMensualPorcentaje}
                        tasaGarantiaPorcentaje={Number(data?.cotizacion?.tasa_garantia ?? 1.5)}
                        tasaSeguroVidaDecimal={resolverTasaSeguroVidaDecimal(data?.cotizacion?.porcentaje_seguro_vida)}
                        empresa={{
                          nombre: 'VERIFICARTE AAA S.A.S',
                          ciudad: 'Cali',
                          nit: '901155548-8',
                        }}
                        cliente={clienteInfo}
                        producto={productoCot}
                        codigoPlan={String(codigo_credito)}
                        fechaPlan={fechaPlan}
                      />
                    }
                    fileName={`tabla-amortizacion-${codigo_credito}.pdf`}
                  >
                    {({ loading }) => (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        {loading ? "Generando PDF..." : "Descargar PDF"}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="collapse-content text-sm">
                  <TablaAmortizacionCredito
                    credito={creditoTabla}
                    fechaCreacion={fechaCreacionTabla}
                    cotizacionId={data.credito.cotizacion_id}
                    nombreCliente={clienteInfo.nombre}
                    cedula={cedulaCot}
                    direccion={clienteInfo.direccion}
                    telefono={clienteInfo.telefono}
                    producto={productoCot}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
        <button
          className="btn btn-warning"
          type="submit"
          disabled={isSubmitting || cambiar.isPending}
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default CambiarEstadoCredito;
