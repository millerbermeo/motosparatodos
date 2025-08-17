// src/components/motos/forms/ImpuestosMotosFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { useUpdateImpuestosMoto } from "../../../services/motosServices";

type Impuestos = {
  id: number;
  soat: string;
  matricula_contado: string;
  matricula_credito: string;
  impuestos: string;
};

type Props = { initialValues: Impuestos };

type ImpuestosFormValues = {
  id: number;
  soat: string;
  matricula_contado: string;
  matricula_credito: string;
  impuestos: string;
};

const onlyDigitsMsg = "Solo números";

// ==== Helpers tolerantes (evita error string | number) ====
type AnyVal = string | number | null | undefined;

const toStr = (v: AnyVal) => (v == null ? "" : typeof v === "number" ? String(v) : v);
const digitsOnly = (v: AnyVal) => toStr(v).replace(/\D/g, "");

const formatThousands = (v: AnyVal) => {
  const digits = digitsOnly(v);
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

// Lo que se envía al backend (solo dígitos)
const sanitize = digitsOnly;

const ImpuestosMotosFormulario: React.FC<Props> = ({ initialValues }) => {
  const update = useUpdateImpuestosMoto();

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ImpuestosFormValues>({
    defaultValues: {
      id: initialValues.id,
      // Pre-formatea lo que venga del backend
      soat: formatThousands(initialValues.soat),
      matricula_contado: formatThousands(initialValues.matricula_contado),
      matricula_credito: formatThousands(initialValues.matricula_credito),
      impuestos: formatThousands(initialValues.impuestos),
    },
    mode: "onBlur",
  });

  // Rehidrata si cambian las props (y formatea)
  React.useEffect(() => {
    reset({
      id: initialValues.id,
      soat: formatThousands(initialValues.soat),
      matricula_contado: formatThousands(initialValues.matricula_contado),
      matricula_credito: formatThousands(initialValues.matricula_credito),
      impuestos: formatThousands(initialValues.impuestos),
    });
  }, [initialValues, reset]);

  // Formatea en vivo mientras el usuario escribe (solo visual)
  React.useEffect(() => {
    const moneyFields: (keyof ImpuestosFormValues)[] = [
      "soat",
      "matricula_contado",
      "matricula_credito",
      "impuestos",
    ];

    const sub = watch((val, info) => {
      const name = info?.name as keyof ImpuestosFormValues | undefined;
      if (!name || !moneyFields.includes(name)) return;
      const current = (val?.[name] as AnyVal) ?? "";
      const formatted = formatThousands(current);
      if (formatted !== toStr(current)) {
        // evita loops: setea solo si cambió
        setValue(name, formatted as ImpuestosFormValues[typeof name], {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    });

    return () => sub?.unsubscribe?.();
  }, [watch, setValue]);

  const onSubmit = (values: ImpuestosFormValues) => {
    update.mutate({
      id: values.id,
      soat: sanitize(values.soat),
      matricula_contado: sanitize(values.matricula_contado),
      matricula_credito: sanitize(values.matricula_credito),
      impuestos: sanitize(values.impuestos),
    });
  };

  const busy = isSubmitting || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ID oculto */}
      <input type="hidden" {...register("id")} />

      <FormInput<ImpuestosFormValues>
        name="soat"
        label="SOAT"
        control={control}
        placeholder="Ej. 458.000"
        rules={{
          required: "El SOAT es obligatorio",
          // valida sobre la versión sanitizada (permite puntos visuales)
          validate: (v: string | number) => (!!digitsOnly(v) ? true : onlyDigitsMsg),
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="matricula_contado"
        label="Matrícula (contado)"
        control={control}
        placeholder="Ej. 4.548.000"
        rules={{
          required: "La matrícula (contado) es obligatoria",
          validate: (v: string | number) => (!!digitsOnly(v) ? true : onlyDigitsMsg),
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="matricula_credito"
        label="Matrícula (crédito)"
        control={control}
        placeholder="Ej. 4.538.000"
        rules={{
          required: "La matrícula (crédito) es obligatoria",
          validate: (v: string | number) => (!!digitsOnly(v) ? true : onlyDigitsMsg),
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="impuestos"
        label="Impuestos"
        control={control}
        placeholder="Ej. 4.548.000"
        rules={{
          required: "Los impuestos son obligatorios",
          validate: (v: string | number) => (!!digitsOnly(v) ? true : onlyDigitsMsg),
        }}
      />

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
};

export default ImpuestosMotosFormulario;
