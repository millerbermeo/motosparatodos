// src/components/puntos/FormularioPuntos.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useCreatePunto, useUpdatePunto } from "../../services/puntosServices";
import { useEmpresas } from "../../services/empresasServices";
import type { Punto } from "../../shared/types/puntos";
import { FormInput } from "../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../shared/components/FormSelect";

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Punto; mode: "edit" };

// Para acoplar con FormSelect (value:string): guardamos empresa_id como string y luego lo convertimos en submit
type PuntoFormValues = {
  empresa_id: string; // id como string para el select
  nombre_punto: string;
  telefono: string;
  correo: string;
  direccion: string;
};

const FormularioPuntos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreatePunto();
  const update = useUpdatePunto();
  const { data: empresas, isPending: loadingEmpresas } = useEmpresas();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PuntoFormValues>({
    defaultValues: {
      empresa_id: initialValues?.empresa_id != null ? String(initialValues.empresa_id) : "",
      nombre_punto: initialValues?.nombre_punto ?? "",
      telefono: initialValues?.telefono ?? "",
      correo: initialValues?.correo ?? "",
      direccion: initialValues?.direccion ?? "",
    },
    mode: "onBlur",
  });

  // Rehidratar cuando cambien los props, evitando que queden valores pegados
  React.useEffect(() => {
    reset({
      empresa_id: initialValues?.empresa_id != null ? String(initialValues.empresa_id) : "",
      nombre_punto: initialValues?.nombre_punto ?? "",
      telefono: initialValues?.telefono ?? "",
      correo: initialValues?.correo ?? "",
      direccion: initialValues?.direccion ?? "",
    });
  }, [initialValues, mode, reset]);

  const empresaOptions: SelectOption[] =
    empresas?.map((e) => ({ value: String(e.id), label: e.nombre_empresa })) ?? [];

  const onSubmit = (values: PuntoFormValues) => {
    const base = {
      empresa_id: Number(values.empresa_id),
      nombre_punto: values.nombre_punto.trim(),
      telefono: values.telefono.trim(),
      correo: values.correo.trim(),
      direccion: values.direccion.trim(),
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: Number(initialValues.id), ...base });
    } else {
      create.mutate(base);
    }
  };

  const busy = isSubmitting || create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Empresa (FormSelect) */}
        <FormSelect<PuntoFormValues>
          name="empresa_id"
          label="Empresa"
          control={control}
          options={empresaOptions}
          placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccione una empresa"}
          disabled={loadingEmpresas}
          rules={{ required: "La empresa es obligatoria" }}
        />

        {/* Nombre del punto */}
        <FormInput<PuntoFormValues>
          name="nombre_punto"
          label="Nombre del punto"
          control={control}
          rules={{ required: "El nombre del punto es obligatorio" }}
        />

        {/* Teléfono */}
        <FormInput<PuntoFormValues>
          name="telefono"
          label="Teléfono"
          control={control}
          rules={{ required: "El teléfono es obligatorio" }}
        />

        {/* Correo */}
        <FormInput<PuntoFormValues>
          name="correo"
          label="Correo"
          control={control}
          type="email"
          rules={{
            required: "El correo es obligatorio",
            pattern: { value: /\S+@\S+\.\S+/, message: "Correo inválido" },
          }}
        />

        {/* Dirección (2 columnas) */}
        <div className="md:col-span-2">
          <FormInput<PuntoFormValues>
            name="direccion"
            label="Dirección"
            control={control}
            rules={{ required: "La dirección es obligatoria" }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear punto"}
        </button>
      </div>
    </form>
  );
};

export default FormularioPuntos;
