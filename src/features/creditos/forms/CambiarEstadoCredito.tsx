// src/components/creditos/CambiarEstadoCredito.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import Swal from "sweetalert2";
import { useCambiarEstadoCredito } from "../../../services/creditosServices";
import { useAuthStore } from "../../../store/auth.store";

type Props = { codigo_credito: string | number };

type CambiarEstadoValues = {
  estado: "Pendiente" | "Aprobado" | "No viable" | "";
  comentario: string;
};

const optionsEstado: SelectOption[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobado", label: "Aprobado" },
  { value: "No viable", label: "No viable" }, // ← valor consistente
];

const CambiarEstadoCredito: React.FC<Props> = ({ codigo_credito }) => {
  const cambiar = useCambiarEstadoCredito();
  const { user } = useAuthStore(); // ← trae name y rol

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CambiarEstadoValues>({
    defaultValues: { estado: "" as any, comentario: "" },
    mode: "onBlur",
  });

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
      },
    });
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
          rules={{ required: "El comentario es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } }}
          className="md:col-span-1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" type="button" onClick={() => window.history.back()}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting || cambiar.isPending}>
          Guardar
        </button>
      </div>
    </form>
  );
};

export default CambiarEstadoCredito;
