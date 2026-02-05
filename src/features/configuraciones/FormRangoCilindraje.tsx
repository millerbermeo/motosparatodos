import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";
import {
  useCreateRangoCilindraje,
  useUpdateRangoCilindraje,
  type RangoCilindraje,
} from "../../services/useRangosCilindraje";

type Base = {
  id?: number;
  descripcion: string;
  cilindraje_min: number | null;
  cilindraje_max: number | null;
  soat: number;
  matricula_credito: number;
  matricula_contado: number;
  impuestos: number;
};

type Props =
  | { mode: "create"; initialValues?: undefined }
  | { mode: "edit"; initialValues: RangoCilindraje };

type FormValues = {
  descripcion: string;
  cilindraje_min: number | string | null;
  cilindraje_max: number | string | null;
  soat: number | string;
  matricula_credito: number | string;
  matricula_contado: number | string;
  impuestos: number | string;
};

const toNumberOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const FormRangoCilindraje: React.FC<Props> = ({ mode, initialValues }) => {
  const create = useCreateRangoCilindraje();
  const update = useUpdateRangoCilindraje();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      descripcion: initialValues?.descripcion ?? "",
      cilindraje_min:
        initialValues?.cilindraje_min ?? (initialValues?.cilindraje_min === 0 ? 0 : ""),
      cilindraje_max:
        initialValues?.cilindraje_max ?? (initialValues?.cilindraje_max === 0 ? 0 : ""),
      soat: initialValues?.soat ?? "",
      matricula_credito: initialValues?.matricula_credito ?? "",
      matricula_contado: initialValues?.matricula_contado ?? "",
      impuestos: initialValues?.impuestos ?? "",
    },
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (!initialValues) {
      reset({
        descripcion: "",
        cilindraje_min: "",
        cilindraje_max: "",
        soat: "",
        matricula_credito: "",
        matricula_contado: "",
        impuestos: "",
      });
      return;
    }

    reset({
      descripcion: initialValues.descripcion ?? "",
      cilindraje_min:
        initialValues.cilindraje_min ?? (initialValues.cilindraje_min === 0 ? 0 : ""),
      cilindraje_max:
        initialValues.cilindraje_max ?? (initialValues.cilindraje_max === 0 ? 0 : ""),
      soat: initialValues.soat ?? "",
      matricula_credito: initialValues.matricula_credito ?? "",
      matricula_contado: initialValues.matricula_contado ?? "",
      impuestos: initialValues.impuestos ?? "",
    });
  }, [initialValues, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: Base = {
      descripcion: values.descripcion.trim(),
      cilindraje_min: toNumberOrNull(values.cilindraje_min),
      cilindraje_max: toNumberOrNull(values.cilindraje_max),
      soat: Number(values.soat) || 0,
      matricula_credito: Number(values.matricula_credito) || 0,
      matricula_contado: Number(values.matricula_contado) || 0,
      impuestos: Number(values.impuestos) || 0,
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, total_credito: 0, total_contado: 0, ...payload });
    } else {
      // id lo genera el backend, total_credito/contado los calcula el backend/SELECT
      create.mutate(payload as any);
    }
  };

  const busy = create.isPending || update.isPending;
  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* DESCRIPCIÓN */}
        <FormInput<FormValues>
          name="descripcion"
          label="Descripción"
          control={control}
          disabled={isEdit}
          placeholder='Ej. "Hasta 99 CC", "Motocarros"'
          rules={{
            required: "La descripción es obligatoria",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          }}
        />

        {/* CILINDRAJE MÍNIMO */}
        <FormInput<FormValues>
          name="cilindraje_min"
          label="Cilindraje mínimo (cc)"
          type="number"
          control={control}
          placeholder="Ej. 0"
          disabled={isEdit}
          rules={{
            validate: (v) =>
              v === "" || !Number.isNaN(Number(v)) || "Debe ser un número válido",
          }}
        />

        {/* CILINDRAJE MÁXIMO */}
        <FormInput<FormValues>
          name="cilindraje_max"
          label="Cilindraje máximo (cc)"
          type="number"
          control={control}
          placeholder="Ej. 99"
          disabled={isEdit}
          rules={{
            validate: (v) =>
              v === "" || !Number.isNaN(Number(v)) || "Debe ser un número válido",
          }}
        />

    

        {/* SOAT */}
        <FormInput<FormValues>
          name="soat"
          label="SOAT"
          type="number"
          control={control}
          placeholder="Valor del SOAT"
          rules={{
            validate: (v) =>
              v === "" || Number(v) >= 0 || "Debe ser un número mayor o igual a 0",
          }}
        />

        {/* MATRÍCULA CRÉDITO */}
        <FormInput<FormValues>
          name="matricula_credito"
          label="Matrícula (crédito)"
          type="number"
          control={control}
          placeholder="Valor matrícula crédito"
          rules={{
            validate: (v) =>
              v === "" || Number(v) >= 0 || "Debe ser un número mayor o igual a 0",
          }}
        />

        {/* MATRÍCULA CONTADO */}
        <FormInput<FormValues>
          name="matricula_contado"
          label="Matrícula (contado)"
          type="number"
          control={control}
          placeholder="Valor matrícula contado"
          rules={{
            validate: (v) =>
              v === "" || Number(v) >= 0 || "Debe ser un número mayor o igual a 0",
          }}
        />

        {/* IMPUESTOS */}
        <FormInput<FormValues>
          name="impuestos"
          label="Impuestos"
          type="number"
          control={control}
          placeholder="Valor de impuestos"
          rules={{
            validate: (v) =>
              v === "" || Number(v) >= 0 || "Debe ser un número mayor o igual a 0",
          }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear rango"}
        </button>
      </div>
    </form>
  );
};

export default FormRangoCilindraje;
