// MotosFormulario.tsx
import React, { useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";

type Opcion = { id: string; nombre: string };

// --- Datos estáticos (puedes extraerlos a un archivo de "consts") ---
const marcas: Opcion[] = [
  { id: "1", nombre: "Yamaha" },
  { id: "2", nombre: "Honda" },
  { id: "3", nombre: "Suzuki" },
  { id: "4", nombre: "Kawasaki" },
  { id: "5", nombre: "Ducati" },
];

const lineasPorMarca: Record<string, Opcion[]> = {
  "1": [
    { id: "y-1", nombre: "YZF-R3" },
    { id: "y-2", nombre: "FZ 2.0" },
  ],
  "2": [
    { id: "h-1", nombre: "WAVE 110S" },
    { id: "h-2", nombre: "CB 125F" },
  ],
  "3": [
    { id: "s-1", nombre: "Gixxer 150" },
    { id: "s-2", nombre: "V-Strom 250" },
  ],
  "4": [
    { id: "k-1", nombre: "Ninja 400" },
    { id: "k-2", nombre: "Z400" },
  ],
  "5": [
    { id: "d-1", nombre: "Monster" },
    { id: "d-2", nombre: "Scrambler" },
  ],
};

const empresas: Opcion[] = [
  { id: "em-1", nombre: "Empresa A" },
  { id: "em-2", nombre: "Empresa B" },
  { id: "em-3", nombre: "Empresa C" },
];

const subdistribuciones: Opcion[] = [
  { id: "", nombre: "— Sin subdistribución —" },
  { id: "sd-1", nombre: "Subdist. Norte" },
  { id: "sd-2", nombre: "Subdist. Centro" },
  { id: "sd-3", nombre: "Subdist. Sur" },
];

// Años de modelo (en CO “modelo” suele ser año)
const yearOptions = (() => {
  const ahora = new Date().getFullYear(); // 2025 actualmente
  const desde = 2000;
  const arr: number[] = [];
  for (let y = ahora; y >= desde; y--) arr.push(y);
  return arr;
})();

// --- Tipado del formulario ---
type FormValues = {
  marcaId: string;         // obligatorio
  lineaId: string;         // obligatorio (depende de marca)
  modelo: string;          // obligatorio (año)
  precioBase: number;      // obligatorio (> 0)
  empresaId: string;       // obligatorio
  subdistribucionId?: string; // opcional
  imagen?: FileList;       // opcional (<= 1 MB)
};

const MotosFormulario: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      marcaId: "",
      lineaId: "",
      modelo: "",
      precioBase: undefined as unknown as number,
      empresaId: "",
      subdistribucionId: "",
      imagen: undefined,
    },
  });

  // Dependencia Línea ← Marca
  const marcaSeleccionada = useWatch({ control, name: "marcaId" });
  const lineasDisponibles = useMemo<Opcion[]>(() => {
    const lista = lineasPorMarca[marcaSeleccionada] ?? [];
    // si cambió la marca, limpia la línea
    setValue("lineaId", "");
    return lista;
  }, [marcaSeleccionada, setValue]);

  // Preview de imagen opcional
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    // Sanitizar payload (no mandes FileList si no hay archivo)
    const payload = {
      ...data,
      precioBase: Number(data.precioBase),
      imagen: data.imagen?.[0] ?? undefined,
    };

    // Ejemplo: construir FormData si vas a subir imagen
    // const fd = new FormData();
    // Object.entries(payload).forEach(([k, v]) => {
    //   if (v !== undefined && v !== null) {
    //     if (k === "imagen" && v instanceof File) fd.append(k, v);
    //     else fd.append(k, String(v));
    //   }
    // });

    console.log("payload listo:", payload);
    // await api.motos.create(fd);
  };

  const validarImagen = (files?: FileList) => {
    if (!files || files.length === 0) return true; // opcional
    const file = files[0];
    const maxBytes = 1 * 1024 * 1024; // 1 MB
    if (file.size > maxBytes) return "La imagen supera 1 MB";
    return true;
  };

  const onImagenChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-4"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Marca (select) */}
        <Controller
          name="marcaId"
          control={control}
          rules={{ required: "El campo marca es obligatorio" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label
                  htmlFor="marcaId"
                  className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
                >
                  Marca <span className="text-error">*</span>
                </label>
                <select
                  id="marcaId"
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  aria-invalid={!!fieldState.error || undefined}
                  {...field}
                >
                  <option value="" disabled>
                    Selecciona una marca
                  </option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {fieldState.error?.message && (
                <p className="mt-1 text-sm text-error">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        {/* Línea (select dependiente) */}
        <Controller
          name="lineaId"
          control={control}
          rules={{
            required: "El campo línea es obligatorio",
            validate: (v) =>
              (lineasDisponibles.length > 0 && !!v) ||
              "Selecciona una marca para ver líneas disponibles",
          }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label
                  htmlFor="lineaId"
                  className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
                >
                  Línea <span className="text-error">*</span>
                </label>
                <select
                  id="lineaId"
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  aria-invalid={!!fieldState.error || undefined}
                  disabled={!marcaSeleccionada}
                  {...field}
                >
                  <option value="" disabled>
                    {marcaSeleccionada ? "Selecciona una línea" : "Selecciona una marca primero"}
                  </option>
                  {lineasDisponibles.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {fieldState.error?.message && (
                <p className="mt-1 text-sm text-error">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        {/* Modelo (año) */}
        <Controller
          name="modelo"
          control={control}
          rules={{ required: "El campo modelo es obligatorio" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label
                  htmlFor="modelo"
                  className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
                >
                  Modelo <span className="text-error">*</span>
                </label>
                <select
                  id="modelo"
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  aria-invalid={!!fieldState.error || undefined}
                  {...field}
                >
                  <option value="" disabled>
                    Selecciona el año
                  </option>
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {fieldState.error?.message && (
                <p className="mt-1 text-sm text-error">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        {/* Precio base (COP, > 0) */}
        <FormInput<FormValues>
          name="precioBase"
          label="Precio base (COP)"
          type="number"
          control={control}
          rules={{
            required: "El precio base es obligatorio",
            min: { value: 1, message: "Debe ser mayor a 0" },
            validate: (v) => (Number(v) > 0 ? true : "Debe ser un monto válido"),
            valueAsNumber: true as unknown as undefined, // react-hook-form acepta esta prop en register; en FormInput asegúrate de propagarla
          }}
        />

        {/* Empresa (select) */}
        <Controller
          name="empresaId"
          control={control}
          rules={{ required: "El campo empresa es obligatorio" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label
                  htmlFor="empresaId"
                  className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
                >
                  Empresa <span className="text-error">*</span>
                </label>
                <select
                  id="empresaId"
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  aria-invalid={!!fieldState.error || undefined}
                  {...field}
                >
                  <option value="" disabled>
                    Selecciona una empresa
                  </option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {fieldState.error?.message && (
                <p className="mt-1 text-sm text-error">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        {/* Subdistribución (opcional) */}
        <Controller
          name="subdistribucionId"
          control={control}
          render={({ field }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label
                  htmlFor="subdistribucionId"
                  className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none"
                >
                  Subdistribución (opcional)
                </label>
                <select
                  id="subdistribucionId"
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  {...field}
                >
                  {subdistribuciones.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        />

        {/* Imagen (opcional, ≤ 1 MB) */}
        <div className="md:col-span-2">
          <div
            className={[
              "relative bg-base-200 rounded-2xl shadow-sm",
              "focus-within:ring-2 focus-within:ring-primary/40",
              "transition-[box-shadow,ring] duration-150",
              "p-3",
            ].join(" ")}
          >
            <label
              htmlFor="imagen"
              className="block text-xs text-base-content/60 mb-1"
            >
              Imagen (opcional, máx 1 MB)
            </label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              {...register("imagen", {
                validate: (files) => validarImagen(files),
                onChange: onImagenChange,
              })}
            />
            {errors.imagen && (
              <p className="mt-1 text-sm text-error">
                {String(errors.imagen.message)}
              </p>
            )}

            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Previsualización"
                  className="h-24 w-24 object-cover rounded-xl border border-base-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botón */}
        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Guardando..." : "Crear moto"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MotosFormulario;
