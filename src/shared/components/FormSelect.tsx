// FormSelect.tsx
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { useId } from "react";

export type SelectOption = { value: string | number; label: string; disabled?: boolean };

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T, any, T>;   // 👈 3 genéricos
  options: SelectOption[];
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
};

export function FormSelect<T extends FieldValues>({
  name,
  label,
  control,
  options,
  rules,
  placeholder = "Selecciona una opción",
  disabled,
  className = "",
  loading = false,
}: FormSelectProps<T>) {
  const id = useId();

  return (
    <Controller<T, Path<T>>
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorMsg = fieldState.error?.message
          ? String(fieldState.error.message)
          : undefined;

        return (
          <div className="w-full">
            <div
              className={[
                "relative bg-base-200 rounded-lg shadow-sm",
                "focus-within:ring-2 focus-within:ring-primary/40",
                "transition-[box-shadow,ring] duration-150",
                disabled ? "opacity-60" : "",
                className,
              ].join(" ")}
            >
              <label
                htmlFor={id}
                className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
              >
                {label}
                {rules?.required ? <span className="text-error"> *</span> : null}
              </label>

              <select
                id={id}
                disabled={disabled || loading}
                className={[
                  "w-full bg-transparent outline-none border-none",
                  "px-3 pt-6 pb-2 text-base",
                  "rounded-lg appearance-none",
                  errorMsg ? "ring-1 ring-error" : "",
                ].join(" ")}
                aria-invalid={!!errorMsg}
                aria-describedby={errorMsg ? `${id}-error` : undefined}
                {...field}
                value={field.value ?? ""}
              >
                <option value="" disabled>
                  {loading ? "Cargando…" : placeholder}
                </option>
                {options.map((opt) => (
                  <option key={`${opt.value}`} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg ? (
              <p id={`${id}-error`} className="mt-1 text-sm text-error">
                {errorMsg}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
