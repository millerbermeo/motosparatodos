// src/components/creditos/CerrarCreditoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { useCerrarCredito } from "../../../services/creditosServices";
import Swal from "sweetalert2";

export type CerrarCreditoValues = {
  cerrar_credito: boolean;
  color: string;
  capacidad: string;     // Ej: "125 c.c."
  numero_motor: string;
  numero_chasis: string;
  placa: string;
};

type Props = {
  codigo_credito: string | number;
};

const CerrarCreditoFormulario: React.FC<Props> = ({ codigo_credito }) => {
  const cerrar = useCerrarCredito();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<CerrarCreditoValues>({
    defaultValues: {
      cerrar_credito: true,
      color: "",
      capacidad: "",
      numero_motor: "",
      numero_chasis: "",
      placa: "",
    },
    mode: "onBlur",
  });

  const enabled = watch("cerrar_credito");

  const onSubmit = async (values: CerrarCreditoValues) => {
    // Normalización rápida
    const payload = {
      numero_chasis: values.numero_chasis.trim().toUpperCase() || null,
      numero_motor: values.numero_motor.trim().toUpperCase() || null,
      placa: values.placa.trim().toUpperCase() || null,
      color: values.color.trim().toUpperCase() || null,
      capacidad: values.capacidad.replace(/\s+/g, " ").trim() || null,
    };

    await Swal.fire({
      title: "¿Guardar cierre de crédito?",
      html: `
        <div style="text-align:left;font-size:13px;line-height:1.35">
          <b>Código:</b> ${String(codigo_credito)}<br/>
          <b>Chasis:</b> ${payload.numero_chasis ?? "(vacío)"}<br/>
          <b>Motor:</b> ${payload.numero_motor ?? "(vacío)"}<br/>
          <b>Placa:</b> ${payload.placa ?? "(vacío)"}<br/>
          <b>Color:</b> ${payload.color ?? "(vacío)"}<br/>
          <b>Capacidad:</b> ${payload.capacidad ?? "(vacío)"}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          // usa mutateAsync para esperar dentro del modal
          await cerrar.mutateAsync({
            codigo_credito,
            payload,
          });
        } catch (err: any) {
          Swal.showValidationMessage(
            err?.response?.data?.message || "No se pudo actualizar"
          );
          throw err;
        }
      },
    });
    // El hook ya muestra swal de éxito/errores; no hace falta más aquí.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Encabezado + checkbox habilitador */}
      <div className="flex items-center justify-between border-b border-success pb-2">
        <label className="label cursor-pointer gap-2">
          <input
          disabled
            type="checkbox"
            className="checkbox checkbox-success"
            checked={enabled}
            onChange={(e) =>
              setValue("cerrar_credito", e.target.checked, { shouldValidate: true })
            }
          />
          <span className="label-text font-medium">Cerrar crédito</span>
        </label>

        <div className="text-xs text-neutral-600">
          Código: <span className="font-mono">{String(codigo_credito)}</span>
        </div>
      </div>

      <div className={`overflow-hidden ${enabled ? 'h-auto' : 'h-0'}`}>
        <div className={`grid grid-cols-1 md:grid-cols-2 overflow-hidden gap-3 p-1`}>
          <FormInput<CerrarCreditoValues>
            name="color"
            label="Color*"
            control={control}
            placeholder="Color de la motocicleta"
            disabled={!enabled}
            rules={
              enabled
                ? { required: "El color es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } }
                : undefined
            }
          />

          <FormInput<CerrarCreditoValues>
            name="capacidad"
            label="Capacidad*"
            control={control}
            placeholder="Capacidad (125 c.c., 99 c.c....)"
            disabled={!enabled}
            rules={
              enabled
                ? {
                  required: "La capacidad es obligatoria",
                  pattern: { value: /^\d{2,4}(\s*c\.?c\.?)?$/i, message: "Usa números y opcional 'c.c.' (ej: 125 c.c.)" },
                }
                : undefined
            }
          />

          <FormInput<CerrarCreditoValues>
            name="numero_motor"
            label="Número de motor*"
            control={control}
            placeholder="Número de motor"
            disabled={!enabled}
            rules={
              enabled
                ? {
                  required: "El número de motor es obligatorio",
                  pattern: { value: /^[A-Z0-9-]{5,}$/i, message: "Solo letras, números o guiones (mín. 5)" },
                }
                : undefined
            }
          />

          <FormInput<CerrarCreditoValues>
            name="numero_chasis"
            label="Número de chasis*"
            control={control}
            placeholder="Número de chasis"
            disabled={!enabled}
            rules={
              enabled
                ? {
                  required: "El número de chasis es obligatorio",
                  pattern: { value: /^[A-Z0-9-]{5,}$/i, message: "Solo letras, números o guiones (mín. 5)" },
                }
                : undefined
            }
          />

          <div className="md:col-span-2">
            <FormInput<CerrarCreditoValues>
              name="placa"
              label="Placa"
              control={control}
              placeholder="Placa"
              disabled={!enabled}
              rules={
                enabled
                  ? {
                    validate: (value: string | boolean) => {
                      const v = typeof value === "string" ? value.trim() : "";
                      if (!v) return true;
                      return /^[A-Z0-9-]{5,8}$/i.test(v) || "Formato de placa inválido";
                    },
                  }
                  : undefined
              }
            />
          </div>


        </div>

        <div className="flex justify-end w-full gap-2 pt-2">
          <button
            className="btn btn-ghost"
            type="button"
            // onClick={() => window.history.back()}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!enabled || isSubmitting || cerrar.isPending}
          >
            Guardar cierre
          </button>
        </div>
      </div>


    </form>
  );
};

export default CerrarCreditoFormulario;
