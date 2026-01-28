import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../shared/components/FormSelect";
import {
  useCreateConfigPlazo,
  useUpdateConfigPlazo,
  type ConfigPlazo,
} from "../../services/configuracionPlazoService";

type Base = {
  id?: number;
  codigo: string;        // 👈 NUEVO
  servicio: string;
  plazo_meses: number;
  tipo_valor: string;
  valor: number;
};

type Props =
  | { mode: "create"; initialValues?: undefined }
  | { mode: "edit"; initialValues: ConfigPlazo };

type ConfigFormValues = {
  codigo: string;                // 👈 NUEVO
  servicio: string;
  plazo_meses: number | string;
  tipo_valor: "%" | "$";
  valor: number | string;
};

const FormConfiguracion: React.FC<Props> = ({ mode, initialValues }) => {
  const create = useCreateConfigPlazo();
  const update = useUpdateConfigPlazo();

  const { control, handleSubmit, reset } = useForm<ConfigFormValues>({
    defaultValues: {
      codigo: initialValues?.codigo ?? "",
      servicio: initialValues?.servicio ?? "",
      plazo_meses: initialValues?.plazo_meses ?? "",
      tipo_valor: (initialValues?.tipo_valor as "%" | "$") ?? "%",
      valor: initialValues?.valor ?? "",
    },
    mode: "onBlur",
  });

  React.useEffect(() => {
    reset({
      codigo: initialValues?.codigo ?? "",
      servicio: initialValues?.servicio ?? "",
      plazo_meses: initialValues?.plazo_meses ?? "",
      tipo_valor: (initialValues?.tipo_valor as "%" | "$") ?? "%",
      valor: initialValues?.valor ?? "",
    });
  }, [initialValues, reset]);

  const onSubmit = (values: ConfigFormValues) => {
    const payload: Base = {
      codigo: values.codigo.trim(),
      servicio: values.servicio,
      plazo_meses: Number(values.plazo_meses) || 0,
      tipo_valor: values.tipo_valor,
      valor: Number(values.valor) || 0,
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, ...payload });
    } else {
      // id lo genera el backend
      create.mutate(payload as any);
    }
  };

  const busy = create.isPending || update.isPending;

  const tipoValorOptions: SelectOption[] = [
    { value: "%", label: "Porcentaje (%)" },
    { value: "$", label: "Valor fijo ($)" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* CÓDIGO */}
        <FormInput<ConfigFormValues>
          name="codigo"
          label="Código"
          control={control}
          placeholder="Ej. GPS_12, GAR_EXT_24"
          disabled={mode === "edit"} // 👈 bloqueado en edición
          rules={
            mode === "create"
              ? {
                  required: "El código es obligatorio",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                }
              : undefined
          }
        />

        {/* SERVICIO */}
        <FormInput<ConfigFormValues>
          name="servicio"
          label="Servicio"
          control={control}
          placeholder="GARANTIA EXTENDIDA, GPS, etc."
          rules={{ required: "El servicio es obligatorio" }}
        />

        {/* PLAZO */}
        <FormInput<ConfigFormValues>
          name="plazo_meses"
          label="Plazo (meses)"
          type="number"
          control={control}
   />
        

        {/* TIPO VALOR */}
        <FormSelect<ConfigFormValues>
          name="tipo_valor"
          label="Tipo de valor"
          control={control}
          options={tipoValorOptions}
          rules={{ required: "El tipo de valor es obligatorio" }}
        />

        {/* VALOR */}
        <FormInput<ConfigFormValues>
          name="valor"
          label="Valor"
          type="number"
          control={control}
          placeholder="Ej. 18.5 o 500000"
          rules={{
            required: "El valor es obligatorio",
            validate: (v) =>
              !Number.isNaN(Number(v)) || "Debe ser un número válido",
          }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear configuración"}
        </button>
      </div>
    </form>
  );
};

export default FormConfiguracion;
