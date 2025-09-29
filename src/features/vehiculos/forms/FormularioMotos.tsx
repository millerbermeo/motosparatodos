// src/components/motos/FormularioMotos.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { useCreateMoto, useUpdateMoto } from "../../../services/motosServices";
import { useMarcas } from "../../../services/marcasServices";
import { useLineas } from "../../../services/lineasMarcasServices";
import { useEmpresasSelect } from "../../../services/empresasServices";
import { useSubDistribucion } from "../../../services/distribucionesServices";

type Base = {
  id?: number;
  marca: string;
  linea: string;
  modelo: string;
  estado: string;
  precio_base: number;
  descrip: string;
  imagen?: string;
  empresa?: string;          // nombre
  subdistribucion?: string;  // nombre


};

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Base & { id: number }; mode: "edit" };

type MotoFormValues = {
  marca: string;
  linea: string;
  modelo: string;
  estado: "Nueva" | "Usada";
  precio_base: number | string; // RHF trabaja con string en inputs number, lo normalizamos en submit
  descrip: string;
  empresa: string;          // nombre
  subdistribucion?: string;  // nombre
};

const FormularioMotos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateMoto();
  const update = useUpdateMoto();
  const { data: marcas, isPending: loadingMarcas } = useMarcas();
  const { data: lineas, isPending: loadingLineas } = useLineas();
  // Datos para los nuevos selects
  const { data: empresas, isPending: loadingEmpresas } = useEmpresasSelect();
  const { data: subdistribs, isPending: loadingSubd } = useSubDistribucion();


  // archivo y preview se manejan fuera de RHF (file inputs no controlados)
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<MotoFormValues>({
    defaultValues: {
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
      modelo: initialValues?.modelo ?? "",
      estado: (initialValues?.estado as "Nueva" | "Usada") ?? "Nueva",
      precio_base: initialValues?.precio_base ?? 0,
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
    },
    mode: "onBlur",
  });

  // cuando cambien los props, rehidrata el form
  React.useEffect(() => {
    reset({
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
      modelo: initialValues?.modelo ?? "",
      estado: (initialValues?.estado as "Nueva" | "Usada") ?? "Nueva",
      precio_base: initialValues?.precio_base ?? 0,
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
    });
    setFile(null);
    setPreview(initialValues?.imagen ?? null);
  }, [initialValues, mode, reset]);

  const selectedMarca = watch("marca");

  // filtra líneas según marca seleccionada
  const lineasFiltradas = React.useMemo(() => {
    if (!lineas) return [];
    if (!selectedMarca) return lineas;
    return lineas.filter((l: any) => l.marca === selectedMarca);
  }, [lineas, selectedMarca]);

  // cuando cambia marca, resetear línea
  React.useEffect(() => {
    setValue("linea", "");
  }, [selectedMarca, setValue]);

  // preview de imagen
  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSubmit = (values: MotoFormValues) => {
    const payload = {
      marca: values.marca,
      linea: values.linea,
      modelo: values.modelo,
      estado: values.estado,
      precio_base: Number(values.precio_base) || 0,
      descrip: values.descrip,
      imagen: file ?? null,

      // 👇 ahora solo enviamos nombres
      empresa: values.empresa,
      subdistribucion: values.subdistribucion || null, // si viene vacío lo mandas como null
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, ...payload, nuevaImagen: file ?? null } as any);
    } else {
      create.mutate(payload as any);
    }
  };

  const busy = create.isPending || update.isPending;

  const marcaOptions: SelectOption[] =
    marcas?.map((m: any) => ({ value: m.marca, label: m.marca })) ?? [];

  const lineaOptions: SelectOption[] =
    lineasFiltradas?.map((l: any) => ({ value: l.linea, label: l.linea })) ?? [];


  const empresaOptions: SelectOption[] =
    empresas?.map((e: any) => ({ value: e.nombre, label: e.nombre })) ?? [];

  const subdistribOptions: SelectOption[] =
    subdistribs?.map((s: string) => ({ value: s, label: s })) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Marca */}
        <FormSelect<MotoFormValues>
          name="marca"
          label="Marca"
          control={control}
          options={marcaOptions}
          placeholder={loadingMarcas ? "Cargando marcas..." : "Seleccione una marca"}
          disabled={loadingMarcas}
          rules={{ required: "La marca es obligatoria" }}
        />

        {/* Línea */}
        <FormSelect<MotoFormValues>
          name="linea"
          label="Línea"
          control={control}
          options={lineaOptions}
          placeholder={
            loadingLineas
              ? "Cargando líneas..."
              : selectedMarca
                ? "Seleccione una línea"
                : "Seleccione una marca primero"
          }
          disabled={loadingLineas || !selectedMarca}
          rules={{ required: "La línea es obligatoria" }}
        />

        {/* Modelo */}
        <FormInput<MotoFormValues>
          name="modelo"
          label="Modelo"
          className="mt-6"
          control={control}
          placeholder="Ej. 500R3234"
          rules={{
            required: "El modelo es obligatorio",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          }}
        />

        {/* Estado */}
        <FormSelect<MotoFormValues>
          name="estado"
          label="Estado"
          control={control}
          options={[
            { value: "Nueva", label: "Nueva" },
            { value: "Usada", label: "Usada" },
          ]}
          rules={{ required: "El estado es obligatorio" }}
        />

        {/* Precio base */}
        <FormInput<MotoFormValues>
          name="precio_base"
          label="Precio base"
          control={control}
            className="mt-6"
          type="number"
          placeholder="15000"
          rules={{
            required: "El precio base es obligatorio",
            validate: (v) =>
              Number(v) >= 0 || "El precio debe ser un número mayor o igual a 0",
          }}
        />


        {/* Empresa */}
        <FormSelect<MotoFormValues>
          name="empresa"
          label="Empresa"
          control={control}
          options={empresaOptions}
          placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccione una empresa"}
          disabled={loadingEmpresas}
          rules={{ required: "La empresa es obligatoria" }}
        />

        {/* Subdistribución */}
        <FormSelect<MotoFormValues>
          name="subdistribucion"
          label="Subdistribución"
          control={control}
          options={subdistribOptions}
          placeholder={loadingSubd ? "Cargando subdistribuciones..." : "Seleccione una subdistribución"}
          disabled={loadingSubd}
        />


        {/* Imagen (NO se toca, igual que en tu código original) */}
        <label className="form-control w-full">
          <span className="label-text">Imagen</span>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="h-24 rounded-md object-cover"
              />
            </div>
          )}
        </label>

        {/* Descripción (ocupa 2 columnas) */}
        <div className="md:col-span-2">
          <FormInput<MotoFormValues>
            name="descrip"
            label="Descripción"
            control={control}
            // Usamos un textarea nativo para multi-línea: tu FormInput renderiza <input/>.
            // Si prefieres textarea estilado, puedes crear un FormTextarea similar a FormInput.
            placeholder="Motocicleta deportiva"
            // rules={{ required: "La descripción es obligatoria" }}
            // Hack simple: usa type=text y dale espacio; para mejor UX, crea FormTextarea.
            className="min-h-24"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "edit" ? "Guardar cambios" : "Crear moto"}
        </button>
      </div>
    </form>
  );
};

export default FormularioMotos;
