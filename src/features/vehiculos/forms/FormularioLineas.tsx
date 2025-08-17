import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { useCreateLinea, useUpdateLinea } from "../../../services/lineasMarcasServices";
import { useMarcas } from "../../../services/marcasServices";

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: { id: number; marca: string; linea: string }; mode: "edit" };

type LineaFormValues = {
  marca: string;
  linea: string;
};

const FormularioLineas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateLinea();
  const update = useUpdateLinea();
  const { data: marcas, isPending: loadingMarcas } = useMarcas();

  const { control, handleSubmit, reset } = useForm<LineaFormValues>({
    defaultValues: {
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
    },
    mode: "onBlur",
  });

  // 👉 Rehidrata cuando cambian props (evita “datos pegados”)
  React.useEffect(() => {
    reset({
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
    });
  }, [initialValues, mode, reset]);

  const marcaOptions: SelectOption[] =
    marcas?.map((m: any) => ({ value: m.marca, label: m.marca })) ?? [];

  const onSubmit = (values: LineaFormValues) => {
    const payload = { marca: values.marca, linea: values.linea };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, ...payload });
    } else {
      create.mutate(payload);
      // Si quieres limpiar al crear:
      // reset({ marca: "", linea: "" });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Marca (FormSelect) */}
        <FormSelect<LineaFormValues>
          name="marca"
          label="Marca"
          control={control}
          options={marcaOptions}
          placeholder={loadingMarcas ? "Cargando marcas..." : "Seleccione una marca"}
          disabled={loadingMarcas}
          rules={{ required: "La marca es obligatoria" }}
        />

        {/* Línea (FormInput) */}
        <FormInput<LineaFormValues>
          name="linea"
          label="Línea"
          control={control}
          placeholder="Ej. CBR 500R"
          rules={{
            required: "La línea es obligatoria",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear línea"}
        </button>
      </div>
    </form>
  );
};

export default FormularioLineas;
