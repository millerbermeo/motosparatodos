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
          <div className={["w-full", className].join(" ")}>
            {/* Label en flujo normal: nunca se solapa y hace wrap */}
            <label
              htmlFor={id}
              className="block mb-1 text-sm font-medium text-base-content/80"
            >
              {label}
              {rules?.required ? <span className="text-error"> *</span> : null}
            </label>

            <div
              className={[
                "relative rounded-lg py-2 shadow-sm bg-base-200",
                "focus-within:ring-2 focus-within:ring-primary/40",
                "transition-[box-shadow,ring] duration-150",
                disabled ? "opacity-60" : "",
                errorMsg ? "ring-1 ring-error" : "",
              ].join(" ")}
            >
              <select
                id={id}
                disabled={disabled || loading}
                className={[
                  "w-full bg-transparent outline-none border-none",
                  "px-3 py-2 text-base rounded-lg appearance-none",
                  "pr-10", // espacio para el ícono del caret
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

              {/* Caret del select */}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 text-base-content/60"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
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
