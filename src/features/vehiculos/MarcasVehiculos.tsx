// LineasMarcasFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";

type FormValues = {
  nombre: string;
};

const LineasMarcasFormulario: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: "",
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
