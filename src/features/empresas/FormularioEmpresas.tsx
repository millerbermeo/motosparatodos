// src/components/empresas/FormularioEmpresas.tsx
import React from "react";
import { useForm } from "react-hook-form";
import {
  useCreateEmpresa,
  useUpdateEmpresa,
} from "../../services/empresasServices";
import type { Empresa } from "../../shared/types/empresas";
import { FormInput } from "../../shared/components/FormInput";

type Base = {
  id?: number;
  nombre_empresa: string;
  nit_empresa: string;
  correo_garantias: string;
  telefono_garantias: string;
  correo_siniestros: string;
  telefono_siniestros: string;
  direccion_siniestros: string;
  slogan_empresa?: string | null;
  sitio_web?: string | null;
  imagen?: string | null; // filename/url actual
};

type EmpresaFormValues = Omit<Empresa, "id" | "imagen"> & {
  imagen?: File | null;
};

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Base & { id: number }; mode: "edit" };

const FormularioEmpresas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateEmpresa();
  const update = useUpdateEmpresa();

  // Archivo/preview fuera de RHF (como en motos)
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EmpresaFormValues>({
    defaultValues: {
      nombre_empresa: initialValues?.nombre_empresa ?? "",
      nit_empresa: initialValues?.nit_empresa ?? "",
      correo_garantias: initialValues?.correo_garantias ?? "",
      telefono_garantias: initialValues?.telefono_garantias ?? "",
      correo_siniestros: initialValues?.correo_siniestros ?? "",
      telefono_siniestros: initialValues?.telefono_siniestros ?? "",
      direccion_siniestros: initialValues?.direccion_siniestros ?? "",
      slogan_empresa: initialValues?.slogan_empresa ?? "",
      sitio_web: initialValues?.sitio_web ?? "",
      imagen: null,
    },
    mode: "onBlur",
  });

  // Rehidratar cuando cambien props (igual que en motos)
  React.useEffect(() => {
    reset({
      nombre_empresa: initialValues?.nombre_empresa ?? "",
      nit_empresa: initialValues?.nit_empresa ?? "",
      correo_garantias: initialValues?.correo_garantias ?? "",
      telefono_garantias: initialValues?.telefono_garantias ?? "",
      correo_siniestros: initialValues?.correo_siniestros ?? "",
      telefono_siniestros: initialValues?.telefono_siniestros ?? "",
      direccion_siniestros: initialValues?.direccion_siniestros ?? "",
      slogan_empresa: initialValues?.slogan_empresa ?? "",
      sitio_web: initialValues?.sitio_web ?? "",
      imagen: null,
    });
    setFile(null);
    setPreview(initialValues?.imagen ?? null);
  }, [initialValues, mode, reset]);

  // preview de imagen
  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSubmit = (values: EmpresaFormValues) => {
    const payload: EmpresaFormValues = {
      nombre_empresa: values.nombre_empresa.trim(),
      nit_empresa: values.nit_empresa.trim(),
      correo_garantias: values.correo_garantias.trim(),
      telefono_garantias: values.telefono_garantias.trim(),
      correo_siniestros: values.correo_siniestros.trim(),
      telefono_siniestros: values.telefono_siniestros.trim(),
      direccion_siniestros: values.direccion_siniestros.trim(),
      slogan_empresa: (values.slogan_empresa ?? "").trim(),
      sitio_web: (values.sitio_web ?? "").trim(),
      imagen: file ?? null,
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, ...payload, nuevaImagen: file ?? null } as any);
    } else {
      create.mutate(payload as any);
    }
  };

  const busy = isSubmitting || create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nombre empresa */}
        <FormInput<EmpresaFormValues>
          name="nombre_empresa"
          label="Nombre de la empresa"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
        />

        {/* NIT */}
        <FormInput<EmpresaFormValues>
          name="nit_empresa"
          label="NIT"
          control={control}
          rules={{ required: "El NIT es obligatorio" }}
        />

        {/* Correo garantías */}
        <FormInput<EmpresaFormValues>
          name="correo_garantias"
          label="Correo (garantías)"
          control={control}
          type="email"
          rules={{
            required: "El correo de garantías es obligatorio",
            pattern: { value: /\S+@\S+\.\S+/, message: "Correo inválido" },
          }}
        />

        {/* Tel garantías */}
        <FormInput<EmpresaFormValues>
          name="telefono_garantias"
          label="Teléfono (garantías)"
          control={control}
          rules={{ required: "El teléfono es obligatorio" }}
        />

        {/* Correo siniestros */}
        <FormInput<EmpresaFormValues>
          name="correo_siniestros"
          label="Correo (siniestros)"
          control={control}
          type="email"
          rules={{
            required: "El correo de siniestros es obligatorio",
            pattern: { value: /\S+@\S+\.\S+/, message: "Correo inválido" },
          }}
        />

        {/* Tel siniestros */}
        <FormInput<EmpresaFormValues>
          name="telefono_siniestros"
          label="Teléfono (siniestros)"
          control={control}
          rules={{ required: "El teléfono es obligatorio" }}
        />

        {/* Dirección siniestros */}
        <div className="md:col-span-2">
          <FormInput<EmpresaFormValues>
            name="direccion_siniestros"
            label="Dirección (siniestros)"
            control={control}
            rules={{ required: "La dirección es obligatoria" }}
          />
        </div>

        {/* Slogan */}
        <FormInput<EmpresaFormValues>
          name="slogan_empresa"
          label="Slogan (opcional)"
          control={control}
        />

        {/* Sitio web */}
        <FormInput<EmpresaFormValues>
          name="sitio_web"
          label="Sitio web (opcional)"
          control={control}
          type="url"
          rules={{
            pattern: {
              value:
                /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=.]*)?$/,
              message: "URL inválida",
            },
          }}
        />

        {/* Imagen (NO RHF) */}
        <label className="form-control w-full">
          <span className="label-text">Logo / Imagen (opcional)</span>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="h-24 rounded-md object-cover" />
            </div>
          )}
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear empresa"}
        </button>
      </div>
    </form>
  );
};

export default FormularioEmpresas;
