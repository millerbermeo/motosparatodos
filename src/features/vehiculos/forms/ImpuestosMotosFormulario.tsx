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


// ==== Helpers tolerantes (evita error string | number) ====
type AnyVal = string | number | null | undefined;

const toStr = (v: AnyVal) => (v == null ? "" : typeof v === "number" ? String(v) : v);

/**
 * Limpia el input dejando solo números y un separador decimal.
 * Devuelve SIEMPRE formato backend: decimal con punto (.)
 *
 * Soporta:
 * - "1.234,56" -> "1234.56"
 * - "1234,56"  -> "1234.56"
 * - "1234.56"  -> "1234.56"
 * - "1.234.567"-> "1234567"
 */
const sanitizeMoneyInput = (v: AnyVal) => {
  let s = toStr(v).trim();

  // deja solo dígitos, punto y coma
  s = s.replace(/[^\d.,]/g, "");

  const hasDot = s.includes(".");
  const hasComma = s.includes(",");

  if (hasDot && hasComma) {
    // asumimos formato ES: '.' miles y ',' decimal
    s = s.replace(/\./g, ""); // quita miles
    s = s.replace(/,/g, "."); // decimal -> punto
  } else if (hasComma && !hasDot) {
    // "1234,56" -> "1234.56"
    s = s.replace(/,/g, ".");
  } else {
    // solo puntos o solo dígitos:
    // si tiene varios puntos, probablemente eran miles: "1.234.567"
    const parts = s.split(".");
    if (parts.length > 2) {
      s = parts.join("");
    }
  }

  // dejar solo un punto decimal
  const parts2 = s.split(".");
  if (parts2.length > 2) {
    s = parts2[0] + "." + parts2.slice(1).join("");
  }

  // máximo 2 decimales
  const [intPartRaw, decPartRaw] = s.split(".");
  const intPart = (intPartRaw ?? "").replace(/^0+(?=\d)/, "") || "0";

  if (decPartRaw != null) {
    const decPart = decPartRaw.slice(0, 2);
    // si decimales quedó vacío (ej: "12.") lo devolvemos sin punto
    return decPart.length ? `${intPart}.${decPart}` : intPart;
  }

  return intPart === "0" && s === "" ? "" : intPart; // permite vacío si el usuario borra
};

/**
 * Formatea para mostrar con miles "." y decimal "," (estilo ES/CO).
 * Recibe valor como venga (backend o usuario).
 */
const formatMoneyES = (v: AnyVal) => {
  const clean = sanitizeMoneyInput(v);
  if (!clean) return "";

  const [intPart, decPart] = clean.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return decPart != null && decPart.length > 0
    ? `${withThousands},${decPart}`
    : withThousands;
};

// Lo que se envía al backend (decimal con punto)
const sanitizeForBackend = sanitizeMoneyInput;

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
      soat: formatMoneyES(initialValues.soat),
      matricula_contado: formatMoneyES(initialValues.matricula_contado),
      matricula_credito: formatMoneyES(initialValues.matricula_credito),
      impuestos: formatMoneyES(initialValues.impuestos),
    },
    mode: "onBlur",
  });

  // Rehidrata si cambian las props (y formatea)
  React.useEffect(() => {
    reset({
      id: initialValues.id,
      soat: formatMoneyES(initialValues.soat),
      matricula_contado: formatMoneyES(initialValues.matricula_contado),
      matricula_credito: formatMoneyES(initialValues.matricula_credito),
      impuestos: formatMoneyES(initialValues.impuestos),
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
      const formatted = formatMoneyES(current);

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
      soat: sanitizeForBackend(values.soat),
      matricula_contado: sanitizeForBackend(values.matricula_contado),
      matricula_credito: sanitizeForBackend(values.matricula_credito),
      impuestos: sanitizeForBackend(values.impuestos),
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
        disabled
        control={control}
        placeholder="Ej. 458.000,50"
        rules={{
          required: "El SOAT es obligatorio",
          validate: (v: string | number) => {
            const clean = sanitizeMoneyInput(v);
            return clean && !isNaN(Number(clean))
              ? true
              : "Solo números (puedes usar , o . en decimales)";
          },
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="matricula_contado"
        label="Matrícula (contado)"
          disabled
        control={control}
        placeholder="Ej. 4.548.000,50"
        rules={{
          required: "La matrícula (contado) es obligatoria",
          validate: (v: string | number) => {
            const clean = sanitizeMoneyInput(v);
            return clean && !isNaN(Number(clean))
              ? true
              : "Solo números (puedes usar , o . en decimales)";
          },
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="matricula_credito"
        label="Matrícula (crédito)"
          disabled
        control={control}
        placeholder="Ej. 4.538.000,50"
        rules={{
          required: "La matrícula (crédito) es obligatoria",
          validate: (v: string | number) => {
            const clean = sanitizeMoneyInput(v);
            return clean && !isNaN(Number(clean))
              ? true
              : "Solo números (puedes usar , o . en decimales)";
          },
        }}
      />

      <FormInput<ImpuestosFormValues>
        name="impuestos"
        label="Impuestos"
        control={control}
          disabled
        placeholder="Ej. 150.000,50"
        rules={{
          required: "Los impuestos son obligatorios",
          validate: (v: string | number) => {
            const clean = sanitizeMoneyInput(v);
            return clean && !isNaN(Number(clean))
              ? true
              : "Solo números (puedes usar , o . en decimales)";
          },
        }}
      />

      <div className="flex justify-end gap-2">
        <button className="btn hidden btn-primary" type="submit" disabled={busy}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
};

export default ImpuestosMotosFormulario;
