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
  useRangoElectrica,
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

  empresa?: string;
  subdistribucion?: string;

  id_empresa?: number;
  id_distribuidora?: number;

  tipo_moto?: "Moto" | "Motocarro" | "Electrica";
};

const tipoMotoOptions: SelectOption[] = [
  { value: "Moto", label: "Moto" },
  { value: "Motocarro", label: "Motocarro" },
  { value: "Electrica", label: "Eléctrica" },
];

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Base & { id: number }; mode: "edit" };

type MotoFormValues = {
  marca: string;
  linea: string;
  modelo: string;
  estado: "Nueva" | "Usada";
  precio_base: number | string;
  descrip: string;
  empresa: string;
  subdistribucion?: string;
  id_empresa?: number | string;
  id_distribuidora?: number | string;
  tipo_moto?: "Moto" | "Motocarro" | "Electrica";
};

/* =========================
   Helpers
========================= */

// ✅ 1) CONVERSIÓN PARA BUSCAR (backend recibe ENTEROS)
const cilindrajeEnteroParaBusqueda = (raw: number): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 99; // 99.9 conceptual
  if (n <= 99) return 99;                       // 99.9 conceptual
  if (n <= 124) return 124;                     // 124.9 conceptual
  if (n <= 199) return 199;                     // 199.9 conceptual
  return 201;                                   // >=200 => rango mayor (>=201)
};

// ✅ 2) Visual: interpretar lo que devuelve backend
const normalizarCilindrajeMaxVisual = (max: number | null): number | null => {
  if (max === null || max === undefined) return null;
  const n = Number(max);
  if (!Number.isFinite(n)) return null;

  if (n === 99) return 99.9;
  if (n === 124) return 124.9;
  if (n === 200) return 199.9;

  return n;
};

// ✅ helper para dinero
const unformatNumber = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[^\d-]/g, "");
};

const toNumberSafe = (v: string | number | null | undefined): number => {
  const raw = unformatNumber(v);
  return raw ? Number(raw) : 0;
};

// ✅ compresión de imagen a máximo ~70KB
const MAX_IMAGE_BYTES = 70 * 1024;

async function compressImageToMax70KB(inputFile: File): Promise<File> {
  if (!inputFile.type.startsWith("image/")) return inputFile;
  if (inputFile.size <= MAX_IMAGE_BYTES) return inputFile;

  const bitmap = await createImageBitmap(inputFile);

  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return inputFile;

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const tryTypes = ["image/webp", "image/jpeg"];
  let bestBlob: Blob | null = null;

  for (const mime of tryTypes) {
    let quality = 0.85;

    while (quality >= 0.35) {
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), mime, quality)
      );

      if (!blob) break;

      if (blob.size <= MAX_IMAGE_BYTES) {
        bestBlob = blob;
        break;
      }

      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;

      quality -= 0.1;
    }

    if (bestBlob && bestBlob.size <= MAX_IMAGE_BYTES) break;
  }

  if (!bestBlob) return inputFile;

  const ext = bestBlob.type === "image/webp" ? "webp" : "jpg";
  const baseName = inputFile.name.replace(/\.[^/.]+$/, "");
  const outName = `${baseName}.${ext}`;

  return new File([bestBlob], outName, { type: bestBlob.type });
}

const norm = (s: any) => String(s ?? "").trim().toLowerCase();

const FormularioMotos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const create = useCreateMoto();
  const update = useUpdateMoto();
  const { data: marcas, isPending: loadingMarcas } = useMarcas();
  const { data: lineas, isPending: loadingLineas } = useLineas();
  const { data: empresas, isPending: loadingEmpresas } = useEmpresasSelect();
  const { data: subdistribs, isPending: loadingSubd } = useSubDistribucion();

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

  // 🔹 ENTERO para búsqueda
  const [cilindrajeBusqueda, setCilindrajeBusqueda] = React.useState<number | null>(null);

  const { control, handleSubmit, setValue, watch, reset } = useForm<MotoFormValues>({
    defaultValues: {
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
      modelo: initialValues?.modelo ?? "",
      estado: (initialValues?.estado as "Nueva" | "Usada") ?? "Nueva",
      precio_base: initialValues?.precio_base != null ? String(initialValues.precio_base) : "0",
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
      tipo_moto: (initialValues as any)?.tipo_moto ?? "Moto",
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
      tipo_moto: "Moto",
    });

    setFile(null);
    setPreview(null);
    setCilindrajeBusqueda(null);
  }, [reset]);

  React.useEffect(() => {
    reset({
      marca: initialValues?.marca ?? "",
      linea: initialValues?.linea ?? "",
      modelo: initialValues?.modelo ?? "",
      estado: (initialValues?.estado as "Nueva" | "Usada") ?? "Nueva",
      precio_base: initialValues?.precio_base != null ? String(initialValues.precio_base) : "0",
      descrip: initialValues?.descrip ?? "",
      empresa: initialValues?.empresa ?? "",
      subdistribucion: initialValues?.subdistribucion ?? "",
      tipo_moto: (initialValues as any)?.tipo_moto ?? "Moto",
    });

    setFile(null);
    setPreview(initialValues?.imagen ?? null);
    setCilindrajeBusqueda(null);
  }, [initialValues, mode, reset]);

  const selectedMarca = watch("marca");
  const selectedLineaNombre = watch("linea");
  const tipoMoto = (watch("tipo_moto") ?? "Moto") as "Moto" | "Motocarro" | "Electrica";

  const lineasFiltradas = React.useMemo(() => {
    if (!lineas) return [];
    if (!selectedMarca) return lineas;
    return (lineas as any[]).filter((l) => l.marca === selectedMarca);
  }, [lineas, selectedMarca]);

  // ✅ en create limpia linea al cambiar marca
  React.useEffect(() => {
    if (mode === "create") {
      setValue("linea", "");
    } else {
      if (initialValues?.linea) setValue("linea", initialValues.linea);
    }
  }, [selectedMarca, setValue, mode, initialValues?.linea]);

  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ✅ calcular cilindraje SOLO si tipo = Moto
  React.useEffect(() => {
    if (mode !== "create") {
      setCilindrajeBusqueda(null);
      return;
    }

    if (tipoMoto === "Motocarro" || tipoMoto === "Electrica") {
      setCilindrajeBusqueda(null);
      return;
    }

    if (!selectedLineaNombre || !lineas) {
      setCilindrajeBusqueda(null);
      return;
    }

    const lineaObj = (lineas as any[]).find((l) => l.linea === selectedLineaNombre);
    if (!lineaObj) {
      setCilindrajeBusqueda(null);
      return;
    }

    const rawCil =
      lineaObj.cilindraje !== null &&
      lineaObj.cilindraje !== undefined &&
      lineaObj.cilindraje !== ""
        ? Number(lineaObj.cilindraje)
        : 124;

    const cilBusqueda = cilindrajeEnteroParaBusqueda(rawCil);
    setCilindrajeBusqueda(cilBusqueda);
  }, [selectedLineaNombre, lineas, mode, tipoMoto]);

  // 🔹 hooks de rango
  const rangoPorCilindrajeQuery = useRangoPorCilindraje(
    cilindrajeBusqueda,
    mode === "create" && tipoMoto === "Moto" && cilindrajeBusqueda !== null
  );
  const rangoMotocarroQuery = useRangoMotocarro(mode === "create" && tipoMoto === "Motocarro");
  const rangoElectricaQuery = useRangoElectrica(mode === "create" && tipoMoto === "Electrica");

  // ✅ rango seleccionado + cilindraje_max visual
  const rangoSeleccionado: RangoCilindraje | null = React.useMemo(() => {
    if (mode !== "create") return null;

    const base =
      tipoMoto === "Motocarro"
        ? rangoMotocarroQuery.data ?? null
        : tipoMoto === "Electrica"
        ? rangoElectricaQuery.data ?? null
        : rangoPorCilindrajeQuery.data ?? null;

    if (!base) return null;

    return { ...base, cilindraje_max: normalizarCilindrajeMaxVisual(base.cilindraje_max) };
  }, [
    mode,
    tipoMoto,
    rangoMotocarroQuery.data,
    rangoElectricaQuery.data,
    rangoPorCilindrajeQuery.data,
  ]);

  const mostrarError = (err: any, fallback: string) => {
    const raw =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback;

    const arr = Array.isArray(raw) ? raw : [raw];
    Swal.fire({ icon: "error", title: "Error", html: arr.join("<br/>") });
  };

  const onSubmit = (values: MotoFormValues) => {
    // ✅ find robusto por nombre (trim/lower)
    const empresaSeleccionada = (empresas as any[])?.find(
      (e: any) => norm(e.nombre_empresa ?? e.nombre) === norm(values.empresa)
    );

    const subdistribSeleccionada = (subdistribs as any[])?.find(
      (s: any) => norm(s.nombre ?? s) === norm(values.subdistribucion)
    );

    // ✅ FIX: en edit, si no matchea el nombre, usamos el id que ya traía la moto
    const idEmpresaFinal =
      empresaSeleccionada?.id != null
        ? Number(empresaSeleccionada.id)
        : initialValues?.id_empresa != null
        ? Number(initialValues.id_empresa)
        : null;

    const idDistribuidoraFinal =
      subdistribSeleccionada?.id != null
        ? Number(subdistribSeleccionada.id)
        : initialValues?.id_distribuidora != null
        ? Number(initialValues.id_distribuidora)
        : null;

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
      tipo_moto: values.tipo_moto ?? null,
      modelo: values.modelo,
      estado: values.estado,
      precio_base: toNumberSafe(values.precio_base),
      descrip: values.descrip,
      imagen: file ?? null,

      empresa: values.empresa,
      id_empresa: idEmpresaFinal,

      subdistribucion: values.subdistribucion || null,
      id_distribuidora: idDistribuidoraFinal,

      ...(mode === "create" ? rangoPayload : {}),
    };

    console.log("[MOTOS] payload enviado:", payload);

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate(
        { id: initialValues.id, ...payload, nuevaImagen: file ?? null } as any,
        {
          onSuccess: () => limpiarFormulario(),
          onError: (err) => mostrarError(err, "Error al actualizar la moto"),
        }
      );
    } else {
      create.mutate(payload as any, {
        onSuccess: () => limpiarFormulario(),
        onError: (err) => mostrarError(err, "Error al crear la moto"),
      });
    }
  };

  const busy =
    create.isPending ||
    update.isPending ||
    (mode === "create" &&
      (rangoPorCilindrajeQuery.isLoading ||
        rangoMotocarroQuery.isLoading ||
        rangoElectricaQuery.isLoading));

  const marcaOptions: SelectOption[] =
    (marcas as any[])?.map((m: any) => ({ value: m.marca, label: m.marca })) ?? [];

  const lineaOptions: SelectOption[] =
    (lineasFiltradas as any[])?.map((l: any) => ({ value: l.linea, label: l.linea })) ?? [];

  const empresaOptions: SelectOption[] =
    (empresas as any[])?.map((e: any) => ({
      value: e.nombre_empresa ?? e.nombre,
      label: e.nombre_empresa ?? e.nombre,
    })) ?? [];

  const subdistribOptions: SelectOption[] =
    (subdistribs as any[])?.map((s: any) => ({
      value: s.nombre ?? s,
      label: s.nombre ?? s,
    })) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormSelect<MotoFormValues>
          name="marca"
          label="Marca"
          control={control}
          options={marcaOptions}
          placeholder={loadingMarcas ? "Cargando marcas..." : "Seleccione una marca"}
          disabled={loadingMarcas}
          rules={{ required: "La marca es obligatoria" }}
        />

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

        <FormInput<MotoFormValues>
          name="modelo"
          label="Modelo"
          className="mt-6"
          control={control}
          placeholder="Ej. 2026"
          rules={{
            required: "El modelo es obligatorio",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          }}
        />

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

        <FormSelect<MotoFormValues>
          name="tipo_moto"
          label="Tipo de moto"
          control={control}
          options={tipoMotoOptions}
          placeholder="Seleccione el tipo"
          rules={{ required: "El tipo de moto es obligatorio" }}
        />

        <FormInput<MotoFormValues>
          name="precio_base"
          label="Precio base"
          control={control}
          className="mt-6"
          type="number"
          placeholder="0"
          formatThousands
          rules={{
            required: "El precio base es obligatoria",
            validate: (v) =>
              toNumberSafe(v) >= 0 || "El precio debe ser un número mayor o igual a 0",
            setValueAs: (v) => (v === "" ? "" : String(v)),
          }}
        />

        <FormSelect<MotoFormValues>
          name="empresa"
          label="Empresa"
          control={control}
          options={empresaOptions}
          placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccione una empresa"}
          disabled={loadingEmpresas}
          rules={{ required: "La empresa es obligatoria" }}
        />

        <FormSelect<MotoFormValues>
          name="subdistribucion"
          label="Subdistribución"
          control={control}
          options={subdistribOptions}
          placeholder={loadingSubd ? "Cargando subdistribuciones..." : "Seleccione una subdistribución"}
          disabled={loadingSubd}
        />

        {/* Imagen (<=70KB) */}
        <label className="form-control w-full">
          <span className="label-text">Imagen</span>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={async (e) => {
              const picked = e.target.files?.[0] ?? null;
              if (!picked) {
                setFile(null);
                return;
              }

              try {
                const compressed = await compressImageToMax70KB(picked);

                if (compressed.size > MAX_IMAGE_BYTES) {
                  Swal.fire({
                    icon: "warning",
                    title: "Imagen muy pesada",
                    text: "No se pudo comprimir a 70KB. Prueba con una imagen más liviana.",
                  });
                }

                setFile(compressed);
                e.target.value = "";
              } catch (err) {
                console.error(err);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "No se pudo procesar la imagen.",
                });
              }
            }}
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="h-24 rounded-md object-cover" />
              {file && (
                <div className="text-xs opacity-70 mt-1">
                  Tamaño: {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          )}
        </label>

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
