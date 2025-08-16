// LineasMarcasFormulario.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";

type FormValues = {
  nombre: string;
  marcaId: string;
};

// Lista estática de marcas de moto
const marcasMoto = [
  { id: "1", nombre: "Yamaha" },
  { id: "2", nombre: "Honda" },
  { id: "3", nombre: "Suzuki" },
  { id: "4", nombre: "Kawasaki" },
  { id: "5", nombre: "Ducati" },
];

const LineasMarcasFormulario: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: "",
      marcaId: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("payload:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4"
    >
      {/* Campo: Nombre */}
      <FormInput<FormValues>
        name="nombre"
        label="Nombre de la línea de marca"
        control={control}
        rules={{ required: "El nombre es obligatorio" }}
      />

      {/* Select de marcas de moto */}
      <Controller
        name="marcaId"
        control={control}
        rules={{ required: "Debes seleccionar una marca" }}
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
                Marca de moto <span className="text-error">*</span>
              </label>
              <select
                id="marcaId"
                className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                {...field}
              >
                <option value="">Seleccione una marca</option>
                {marcasMoto.map((m) => (
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

      {/* Botón */}
      <div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Crear línea de marca"}
        </button>
      </div>
    </form>
  );
};

export default LineasMarcasFormulario;
