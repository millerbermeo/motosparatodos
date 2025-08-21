import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { useUpdateDescuentosMoto } from "../../../services/motosServices";

type Props = {
  initialValues: {
    id: number;
    descuento_empresa?: string | number | null;
    descuento_ensambladora?: string | number | null;
  };
};

// helpers (mismos del de Impuestos)
type AnyVal = string | number | null | undefined;
const toStr = (v: AnyVal) => (v == null ? "" : typeof v === "number" ? String(v) : v);
const digitsOnly = (v: AnyVal) => toStr(v).replace(/\D/g, "");
const formatThousands = (v: AnyVal) => {
  const digits = digitsOnly(v);
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};
const sanitize = digitsOnly;

type DescuentosFormValues = {
  id: number;
  descuento_empresa?: string;        // opcional
  descuento_ensambladora?: string;   // opcional
};

const DescuentosMotosFormulario: React.FC<Props> = ({ initialValues }) => {
  const update = useUpdateDescuentosMoto();

  const { control, handleSubmit, reset, register, setValue, watch, formState: { isSubmitting } } =
    useForm<DescuentosFormValues>({
      defaultValues: {
        id: initialValues.id,
        descuento_empresa: formatThousands(initialValues.descuento_empresa),
        descuento_ensambladora: formatThousands(initialValues.descuento_ensambladora),
      },
      mode: "onBlur",
    });

  React.useEffect(() => {
    reset({
      id: initialValues.id,
      descuento_empresa: formatThousands(initialValues.descuento_empresa),
      descuento_ensambladora: formatThousands(initialValues.descuento_ensambladora),
    });
  }, [initialValues, reset]);

  // formateo en vivo (solo visual)
  React.useEffect(() => {
    const moneyFields: (keyof DescuentosFormValues)[] = [
      "descuento_empresa",
      "descuento_ensambladora",
    ];
    const sub = watch((val, info) => {
      const name = info?.name as keyof DescuentosFormValues | undefined;
      if (!name || !moneyFields.includes(name)) return;
      const current = (val?.[name] as AnyVal) ?? "";
      const formatted = formatThousands(current);
      if (formatted !== toStr(current)) {
        setValue(name, formatted as any, { shouldDirty: true, shouldValidate: false });
      }
    });
    return () => sub?.unsubscribe?.();
  }, [watch, setValue]);

  const onSubmit = (values: DescuentosFormValues) => {
    const payload: any = { id: values.id };
    if (values.descuento_empresa && sanitize(values.descuento_empresa)) {
      payload.descuento_empresa = sanitize(values.descuento_empresa);
    }
    if (values.descuento_ensambladora && sanitize(values.descuento_ensambladora)) {
      payload.descuento_ensambladora = sanitize(values.descuento_ensambladora);
    }
    update.mutate(payload);
  };

  const busy = isSubmitting || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id")} />

      <FormInput<DescuentosFormValues>
        name="descuento_empresa"
        label="Descuento empresa (opcional)"
        control={control}
        placeholder="Ej. 500.000"
        // ❗ sin required; valida solo si hay algo
        type="number"
      />

      <FormInput<DescuentosFormValues>
        name="descuento_ensambladora"
        label="Descuento ensambladora (opcional)"
        control={control}
        placeholder="Ej. 80.000"
        type="number"
      />

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
};

export default DescuentosMotosFormulario;
