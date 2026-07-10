// FormInput.tsx
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { useId, useRef, useLayoutEffect, useState } from "react";
import { formatThousands as fmt, unformatNumber } from "../../utils/money";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T, any, T>;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  className?: string;
  /** 👉 Si true, enmascara con puntos de miles mientras escribe (COP sin decimales) */
  formatThousands?: boolean;
  /** 👉 Si true, renderiza un <textarea> (permite salto de línea con Enter) */
  multiline?: boolean;
  rows?: number;
  /** 👉 Se llama además del onBlur de react-hook-form (ej. disparar una búsqueda al perder foco) */
  onBlur?: () => void;
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
  formatThousands = false,
  multiline = false,
  rows = 4,
  onBlur: onBlurExtra,
}: FormInputProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 👇 Hack anti-autofill (Chrome/Safari): inicia readonly y se habilita al enfocar
  const [ro, setRo] = useState(true);

  // (simple) estrategia de caret: lo enviamos al final cuando se enmascara
  // Si necesitas caret preciso, te paso versión avanzada.
  useLayoutEffect(() => {
    if (!formatThousands) return;
    const el = inputRef.current;
    if (!el) return;
    // mueve el caret al final tras cada render de valor
    const len = el.value.length;
    el.setSelectionRange(len, len);
  });

  const inputType = formatThousands ? "text" : type; // evita type="number" con máscara

  return (
    <Controller<T, Path<T>>
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const valueStr = field.value ?? "";
        const display = formatThousands ? fmt(unformatNumber(valueStr)) : valueStr;

        return (
          <div className="w-full">
            <div
              className={[
                "relative bg-base-300/70 rounded-lg shadow-sm",
                "focus-within:ring-2 focus-within:ring-neutral-content",
                "transition-[box-shadow,ring] duration-150",
                disabled ? "opacity-90" : "",
                className,
              ].join(" ")}
            >
              <label
                htmlFor={id}
                className="absolute left-3 top-2 text-xs text-base-content pointer-events-none select-none"
              >
                {label}
                {rules?.required ? <span className="text-error"> *</span> : null}
              </label>

              {multiline ? (
                <textarea
                  id={id}
                  ref={field.ref}
                  rows={rows}
                  placeholder={label ?? placeholder}
                  disabled={disabled}
                  name={field.name}
                  className={[
                    "w-full bg-transparent outline-none border-none resize-y",
                    "px-3 pt-6 pb-2 text-base",
                    "rounded-lg",
                  ].join(" ")}
                  value={display}
                  onChange={field.onChange}
                  onBlur={() => {
                    field.onBlur();
                    onBlurExtra?.();
                  }}
                />
              ) : (
                <input
                  id={id}
                  ref={(el) => {
                    inputRef.current = el;
                    // RHF ref
                    field.ref(el);
                  }}
                  type={inputType}
                  inputMode={formatThousands ? "numeric" : undefined}
                  placeholder={label ?? placeholder}
                  disabled={disabled}

                  // 👇 evita autocompletado / sugerencias (Chrome a veces ignora "off")
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}

                  // 👇 opcional (a veces ayuda): que el name sea el del field
                  name={field.name}

                  // 👇 "modo nuclear": bloquea autofill al montar y lo habilita al enfocar
                  readOnly={ro}
                  onFocus={() => setRo(false)}

                  className={[
                    "w-full bg-transparent outline-none border-none",
                    "px-3 pt-6 pb-2 text-base",
                    "rounded-lg",
                  ].join(" ")}
                  value={display}
                  onChange={(e) => {
                    if (!formatThousands) {
                      field.onChange(e);
                      return;
                    }
                    const digits = unformatNumber(e.target.value);
                    const formatted = fmt(digits);
                    field.onChange(formatted); // guardamos formateado en el form
                  }}
                  onBlur={() => {
                    field.onBlur();
                    onBlurExtra?.();
                  }}
                />
              )}
            </div>

            {fieldState.error?.message ? (
              <p className="mt-1 text-sm text-error">{String(fieldState.error.message)}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
