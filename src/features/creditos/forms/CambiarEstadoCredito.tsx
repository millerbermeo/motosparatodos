// src/components/creditos/CambiarEstadoCredito.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import Swal from "sweetalert2";
import { useCambiarEstadoCredito } from "../../../services/creditosServices";
import { useAuthStore } from "../../../store/auth.store";
import type { PlanPagosInput } from "../pdf/PlanPagosPDF";
import PlanPagosPDF from "../pdf/PlanPagosPDF";
import { useNavigate } from "react-router-dom";

type Props = { codigo_credito: string | number, data?: any; };

type CambiarEstadoValues = {
  estado: "Pendiente" | "Aprobado" | "No viable" | "";
  comentario: string;
  // archivos locales del form
  formato_referenciacion?: File | null;
  datacredito_deudor1?: File | null;
};

const optionsEstado: SelectOption[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobado", label: "Aprobado" },
  { value: "No viable", label: "No viable" },
];

const CambiarEstadoCredito: React.FC<Props> = ({ codigo_credito, data }) => {
  const cambiar = useCambiarEstadoCredito();
  const { user } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<CambiarEstadoValues>({
    defaultValues: { estado: "" as any, comentario: "" },
    mode: "onBlur",
  });

  const navigate = useNavigate();


  const isAprobado = watch("estado") === "Aprobado";

  const onSubmit = async (values: CambiarEstadoValues) => {
    const nombre_usuario = user?.name ?? "Usuario";
    const rol_usuario = user?.rol ?? "Usuario";

    // Confirmación
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
        // 👉 pasar archivos al hook (si no es Aprobado irán como null/undefined y no se adjuntan)
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

    navigate("/solicitudes"); // 👈 Navegar a la ruta de Solicitud

  };

  console.log("data del credito", data)


  // ====== Armar input para el PDF ======
  const inputPDF: PlanPagosInput = {
    codigo: codigo_credito,
    ciudad: "Cali",
    cliente: {
      nombre: `${data?.informacion_personal?.primer_nombre ?? ""
        } ${data?.informacion_personal?.segundo_nombre ?? ""} ${data?.informacion_personal?.primer_apellido ?? ""
        } ${data?.informacion_personal?.segundo_apellido ?? ""}`.replace(/\s+/g, " ").trim(),
      documento: data?.informacion_personal?.numero_documento ?? "",
      direccion: data?.informacion_personal?.direccion_residencia ?? "",
      telefono: data?.informacion_personal?.celular ?? "",
    },
    producto: {
      nombre: data?.credito?.producto ?? data?.moto?.modelo ?? "Motocicleta",
      valor: Number(data?.credito?.valor_producto ?? data?.moto?.valorMotocicleta ?? 0),
    },
    credito: {
      cuotaInicial: Number(data?.credito?.cuota_inicial ?? data?.moto?.cuotaInicial ?? 0),
      plazoMeses: Number(data?.credito?.plazo_meses ?? data?.moto?.numeroCuotas ?? 1),
      // Defaults si no viene la tasa:
      tasaMensual: 0.0196,
      tasaAnual: 0.2352,
      fechaInicio: new Date(),
      fechaEntrega: data?.credito?.fecha_entrega ?? null,
    },
  };


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
            rules={{ required: "El formato de referenciación es obligatorio" }}
            render={({ field, fieldState }) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Formato de referenciación *</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                />
                {fieldState.error && (
                  <span className="text-error text-xs mt-1">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />

          <Controller
            name="datacredito_deudor1"
            control={control}
            rules={{ required: "El Datacrédito del deudor 1 es obligatorio" }}
            render={({ field, fieldState }) => (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Datacrédito deudor 1 *</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                />
                {fieldState.error && (
                  <span className="text-error text-xs mt-1">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />

          <div>
            <PlanPagosPDF input={inputPDF} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" type="button" onClick={() => window.history.back()}>
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
