// components/FormInput.tsx
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { useId } from "react";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>; // ← cambio aquí
  label: string;
  control: Control<T>;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>; // ← y aquí
  disabled?: boolean;
  className?: string;
};

export function FormInput<T extends FieldValues>({
  name,
  label,
  control,
  type = "text",
  placeholder,
  rules,
  disabled,
  className = "",
}: FormInputProps<T>) {
  const id = useId();

  console.log(placeholder)
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
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

            <input
              id={id}
              type={type}
              placeholder={label}
              disabled={disabled}
              className={[
                "w-full bg-transparent outline-none border-none",
                "px-3 pt-6 pb-2 text-base",
                "rounded-lg",
              ].join(" ")}
              {...field}
              value={field.value ?? ""}
            />
          </div>

          {fieldState.error?.message ? (
            <p className="mt-1 text-sm text-error">
              {String(fieldState.error.message)}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
