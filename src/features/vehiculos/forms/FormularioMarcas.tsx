import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { useCreateMarca, useUpdateMarca } from "../../../services/marcasServices";

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: { id: number; marca: string }; mode: "edit" };

type MarcaFormValues = {
  marca: string;
};

const FormularioMarcas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateMarca();
  const update = useUpdateMarca();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<MarcaFormValues>({
    defaultValues: {
      marca: initialValues?.marca ?? "",
    },
    mode: "onBlur",
  });

  // 👉 Rehidrata el formulario cuando cambian las props (evita “datos pegados”)
  React.useEffect(() => {
    reset({ marca: initialValues?.marca ?? "" });
  }, [initialValues, mode, reset]);

  const onSubmit = (values: MarcaFormValues) => {
    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, marca: values.marca });
    } else {
      create.mutate({ marca: values.marca });
      // Si quieres limpiar al crear:
      // reset({ marca: "" });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput<MarcaFormValues>
        name="marca"
        label="Marca"
        control={control}
        placeholder="Ej. Honda"
        rules={{
          required: "La marca es obligatoria",
          minLength: { value: 2, message: "Mínimo 2 caracteres" },
        }}
      />

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear marca"}
        </button>
      </div>
    </form>
  );
};

export default FormularioMarcas;
