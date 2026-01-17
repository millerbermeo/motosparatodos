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
import Swal from "sweetalert2";

// 🔹 hooks de rango
import {
  useRangoPorCilindraje,
  useRangoMotocarro,
  type RangoCilindraje,
} from "../../../services/useRangosCilindraje";

type Base = {
  id?: number;
  marca: string;
  linea: string;
  modelo: string;
  estado: string;
  precio_base: number;
  descrip: string;
  imagen?: string;

  empresa?: string; // nombre (lo que ya existía)
  subdistribucion?: string; // nombre (lo que ya existía)

  // 🔹 NUEVO — IDs reales para edición
  id_empresa?: number;
  id_distribuidora?: number;
};

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Base & { id: number }; mode: "edit" };

type MotoFormValues = {
  marca: string;
  linea: string;
  modelo: string;
  estado: "Nueva" | "Usada";
  precio_base: number | string; // ✅ lo dejamos así para permitir el formato
  descrip: string;
  empresa: string;
  subdistribucion?: string;
  id_empresa?: number | string;
  id_distribuidora?: number | string;
};

const FormularioMotos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateMoto();
  const update = useUpdateMoto();
  const { data: marcas, isPending: loadingMarcas } = useMarcas();
  const { data: lineas, isPending: loadingLineas } = useLineas();
  const { data: empresas, isPending: loadingEmpresas } = useEmpresasSelect();
  const { data: subdistribs, isPending: loadingSubd } = useSubDistribucion();

  // archivo y preview se manejan fuera de RHF (file inputs no controlados)
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

  // 🔹 para cálculo de rango SOLO en create
  const [cilindrajeBusqueda, setCilindrajeBusqueda] = React.useState<number | null>(null);
  const [esMotocarro, setEsMotocarro] = React.useState(false);

  // ===== helper para dinero (igual idea que en cotizaciones) =====
  const unformatNumber = React.useCallback((v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return "";
    return String(v).replace(/[^\d-]/g, "");
  }, []);

  const toNumberSafe = React.useCallback(
    (v: string | number | null | undefined): number => {
      const raw = unformatNumber(v);
      return raw ? Number(raw) : 0;
    },
    [unformatNumber]
  );

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
      // ✅ guardamos como string para que el FormInput formatee sin problemas
      precio_base:
        initialValues?.precio_base != null ? String(initialValues.precio_base) : "0",
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
    },
    mode: "onBlur",
  });

  const limpiarFormulario = React.useCallback(() => {
    reset({
      marca: "",
      linea: "",
      modelo: "",
      estado: "Nueva",
      precio_base: "0",
      descrip: "",
      empresa: "",
      subdistribucion: "",
    });

    setFile(null);
    setPreview(null);

    // también reinicia variables del rango (por si el usuario crea otra moto)
    setCilindrajeBusqueda(null);
    setEsMotocarro(false);
  }, [reset]);

  // cuando cambien los props, rehidrata el form
  React.useEffect(() => {
    reset({
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
      modelo: initialValues?.modelo ?? "",
      estado: (initialValues?.estado as "Nueva" | "Usada") ?? "Nueva",
      precio_base:
        initialValues?.precio_base != null ? String(initialValues.precio_base) : "0",
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
    });
    setFile(null);
    setPreview(initialValues?.imagen ?? null);
  }, [initialValues, mode, reset]);

  const selectedMarca = watch("marca");
  const selectedLineaNombre = watch("linea");

  // filtra líneas según marca seleccionada
  const lineasFiltradas = React.useMemo(() => {
    if (!lineas) return [];
    if (!selectedMarca) return lineas;
    return lineas.filter((l: any) => l.marca === selectedMarca);
  }, [lineas, selectedMarca]);

  // ✅ FIX: Solo resetear línea cuando el usuario CAMBIA marca en CREATE.
  // En EDIT no debemos borrar la línea del registro.
  React.useEffect(() => {
    if (mode === "create") {
      setValue("linea", "");
    } else {
      // en edit, si viene initialValues.linea, asegúrate de mantenerla
      if (initialValues?.linea) {
        setValue("linea", initialValues.linea);
      }
    }
  }, [selectedMarca, setValue, mode, initialValues?.linea]);

  // preview de imagen
  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 🔹 calcular cilindraje / motocarro al seleccionar línea (solo create)
  React.useEffect(() => {
    if (mode !== "create") {
      setCilindrajeBusqueda(null);
      setEsMotocarro(false);
      return;
    }

    if (!selectedLineaNombre || !lineas) {
      setCilindrajeBusqueda(null);
      setEsMotocarro(false);
      return;
    }

    const lineaObj = (lineas as any[]).find((l) => l.linea === selectedLineaNombre);
    if (!lineaObj) {
      setCilindrajeBusqueda(null);
      setEsMotocarro(false);
      return;
    }

    // detectar motocarro por nombre / campos
    const lineaLower = String(lineaObj.linea ?? "").toLowerCase();
    const descLower = String(lineaObj.descripcion ?? "").toLowerCase();
    const isMotocarro =
      lineaLower.includes("motocarro") ||
      descLower.includes("motocarro") ||
      lineaLower.includes("motocarros") ||
      descLower.includes("motocarros") ||
      lineaObj.tipo === "Motocarro" ||
      Boolean(lineaObj.es_motocarro);

    setEsMotocarro(isMotocarro);

    if (isMotocarro) {
      console.log("[MOTOS] Línea detectada como Motocarro:", lineaObj);
      setCilindrajeBusqueda(null);
      return;
    }

    const cilindraje =
      lineaObj.cilindraje !== null &&
      lineaObj.cilindraje !== undefined &&
      lineaObj.cilindraje !== ""
        ? Number(lineaObj.cilindraje)
        : 124;

    console.log("[MOTOS] Línea seleccionada:", lineaObj);
    console.log("[MOTOS] Cilindraje calculado para búsqueda:", cilindraje);

    setCilindrajeBusqueda(cilindraje);
  }, [selectedLineaNombre, lineas, mode]);

  // 🔹 hooks de rango (solo activos en create)
  const rangoPorCilindrajeQuery = useRangoPorCilindraje(
    cilindrajeBusqueda,
    mode === "create" && !esMotocarro && cilindrajeBusqueda !== null
  );

  const rangoMotocarroQuery = useRangoMotocarro(mode === "create" && esMotocarro);

  const rangoSeleccionado: RangoCilindraje | null =
    mode === "create"
      ? esMotocarro
        ? rangoMotocarroQuery.data ?? null
        : rangoPorCilindrajeQuery.data ?? null
      : null;

  // 🔹 LOG para ver siempre qué devuelve el hook
  React.useEffect(() => {
    if (mode !== "create") return;

    console.log("[MOTOS] Estado búsqueda rango:", {
      esMotocarro,
      cilindrajeBusqueda,
      rangoPorCilindraje: rangoPorCilindrajeQuery.data,
      rangoMotocarro: rangoMotocarroQuery.data,
      rangoSeleccionado,
    });
  }, [
    mode,
    esMotocarro,
    cilindrajeBusqueda,
    rangoPorCilindrajeQuery.data,
    rangoMotocarroQuery.data,
    rangoSeleccionado,
  ]);

  const mostrarError = (err: any, fallback: string) => {
    const raw =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback;

    const arr = Array.isArray(raw) ? raw : [raw];

    Swal.fire({
      icon: "error",
      title: "Error",
      html: arr.join("<br/>"),
    });
  };

  const onSubmit = (values: MotoFormValues) => {
    // 🔹 buscamos la empresa seleccionada para obtener su id
    const empresaSeleccionada = (empresas as any[])?.find(
      (e: any) => (e.nombre_empresa ?? e.nombre) === values.empresa
    );

    // 🔹 buscamos la subdistribución seleccionada para obtener su id (si viene como objeto)
    const subdistribSeleccionada = (subdistribs as any[])?.find(
      (s: any) => (s.nombre ?? s) === values.subdistribucion
    );

    // 🔹 Armamos un objeto con los datos del rango SOLO en create
    let rangoPayload: {
      soat?: string;
      matricula_contado?: string;
      matricula_credito?: string;
      impuestos?: string;
    } = {};

    if (mode === "create" && rangoSeleccionado) {
      rangoPayload = {
        soat: String(rangoSeleccionado.soat ?? 0),
        matricula_contado: String(rangoSeleccionado.matricula_contado ?? 0),
        matricula_credito: String(rangoSeleccionado.matricula_credito ?? 0),
        impuestos: String(rangoSeleccionado.impuestos ?? 0),
      };
    }

    const payload = {
      marca: values.marca,
      linea: values.linea,
      modelo: values.modelo,
      estado: values.estado,
      // ✅ ahora soporta formato (1.000.000) sin romper
      precio_base: toNumberSafe(values.precio_base),
      descrip: values.descrip,
      imagen: file ?? null,

      empresa: values.empresa,
      id_empresa: empresaSeleccionada ? Number(empresaSeleccionada.id) : null,

      subdistribucion: values.subdistribucion || null,
      id_distribuidora:
        subdistribSeleccionada && subdistribSeleccionada.id != null
          ? Number(subdistribSeleccionada.id)
          : null,

      ...(mode === "create" ? rangoPayload : {}),
    };

    console.log("[MOTOS] onSubmit - rangoSeleccionado:", rangoSeleccionado);
    console.log("[MOTOS] onSubmit - payload enviado:", payload);

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate(
        { id: initialValues.id, ...payload, nuevaImagen: file ?? null } as any,
        {
          onSuccess: () => {
            limpiarFormulario();
          },
          onError: (err) => {
            mostrarError(err, "Error al actualizar la moto");
          },
        }
      );
    } else {
      create.mutate(payload as any, {
        onSuccess: () => {
          limpiarFormulario();
        },
        onError: (err) => {
          mostrarError(err, "Error al crear la moto");
        },
      });
    }
  };

  const busy =
    create.isPending ||
    update.isPending ||
    (mode === "create" &&
      (rangoPorCilindrajeQuery.isLoading || rangoMotocarroQuery.isLoading));

  const marcaOptions: SelectOption[] =
    marcas?.map((m: any) => ({ value: m.marca, label: m.marca })) ?? [];

  const lineaOptions: SelectOption[] =
    lineasFiltradas?.map((l: any) => ({ value: l.linea, label: l.linea })) ?? [];

  const empresaOptions: SelectOption[] =
    empresas?.map((e: any) => ({
      value: e.nombre_empresa ?? e.nombre,
      label: e.nombre_empresa ?? e.nombre,
    })) ?? [];

  const subdistribOptions: SelectOption[] =
    subdistribs?.map((s: any) => ({
      value: s.nombre ?? s,
      label: s.nombre ?? s,
    })) ?? [];

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

        {/* Precio base (✅ con formato de miles) */}
        <FormInput<MotoFormValues>
          name="precio_base"
          label="Precio base"
          control={control}
          className="mt-6"
          type="number"
          placeholder="0"
          formatThousands
          rules={{
            required: "El precio base es obligatorio",
            validate: (v) =>
              toNumberSafe(v) >= 0 || "El precio debe ser un número mayor o igual a 0",
            // ✅ evitar NaN cuando viene "1.000.000"
            setValueAs: (v) => (v === "" ? "" : String(v)),
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

        {/* Imagen */}
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

        {/* Descripción */}
        <div className="md:col-span-2">
          <FormInput<MotoFormValues>
            name="descrip"
            label="Descripción"
            control={control}
            placeholder="Motocicleta deportiva"
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
