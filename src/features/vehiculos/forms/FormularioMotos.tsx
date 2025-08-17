// src/components/motos/FormularioMotos.tsx
import React from "react";
import { useCreateMoto, useUpdateMoto } from "../../../services/motosServices";
import { useMarcas } from "../../../services/marcasServices";
import { useLineas } from "../../../services/lineasMarcasServices";

type Base = { id?: number; marca: string; linea: string; modelo: string; estado: string; precio_base: number; descrip: string; imagen?: string; };
type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Base & { id: number }; mode: "edit" };

const FormularioMotos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const [marca, setMarca] = React.useState(initialValues?.marca ?? "");
  const [linea, setLinea] = React.useState(initialValues?.linea ?? "");
  const [modelo, setModelo] = React.useState(initialValues?.modelo ?? "");
  const [estado, setEstado] = React.useState(initialValues?.estado ?? "Nueva");
  const [precioBase, setPrecioBase] = React.useState<number>(initialValues?.precio_base ?? 0);
  const [descrip, setDescrip] = React.useState(initialValues?.descrip ?? "");
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialValues?.imagen ?? null);

  const create = useCreateMoto();
  const update = useUpdateMoto();
  const { data: marcas, isPending: loadingMarcas } = useMarcas();
  const { data: lineas, isPending: loadingLineas } = useLineas();

  // filtra líneas según marca seleccionada (si prefieres todas, elimina este filtro)
  const lineasFiltradas = React.useMemo(() => {
    if (!lineas) return [];
    if (!marca) return lineas;
    return lineas.filter((l) => l.marca === marca);
  }, [lineas, marca]);

  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      marca,
      linea,
      modelo,
      estado,
      precio_base: Number(precioBase),
      descrip,
      imagen: file ?? null,
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: initialValues.id, ...payload, nuevaImagen: file ?? null } as any);
    } else {
      create.mutate(payload as any);
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Marca */}
        <label className="form-control w-full">
          <span className="label-text">Marca</span>
          <select
            className="select select-bordered w-full"
            value={marca}
            onChange={(e) => { setMarca(e.target.value); setLinea(""); }}
            required
            disabled={loadingMarcas}
          >
            <option value="" disabled>
              {loadingMarcas ? "Cargando marcas..." : "Seleccione una marca"}
            </option>
            {marcas?.map((m) => (
              <option key={m.id} value={m.marca}>{m.marca}</option>
            ))}
          </select>
        </label>

        {/* Línea */}
        <label className="form-control w-full">
          <span className="label-text">Línea</span>
          <select
            className="select select-bordered w-full"
            value={linea}
            onChange={(e) => setLinea(e.target.value)}
            required
            disabled={loadingLineas || !marca}
          >
            <option value="" disabled>
              {loadingLineas ? "Cargando líneas..." : (marca ? "Seleccione una línea" : "Seleccione una marca primero")}
            </option>
            {lineasFiltradas?.map((l) => (
              <option key={l.id} value={l.linea}>{l.linea}</option>
            ))}
          </select>
        </label>

        {/* Modelo */}
        <label className="form-control w-full">
          <span className="label-text">Modelo</span>
          <input
            className="input input-bordered w-full"
            placeholder="Ej. 500R3234"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            required
          />
        </label>

        {/* Estado */}
        <label className="form-control w-full">
          <span className="label-text">Estado</span>
          <select
            className="select select-bordered w-full"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
          >
            <option value="Nueva">Nueva</option>
            <option value="Usada">Usada</option>
          </select>
        </label>

        {/* Precio */}
        <label className="form-control w-full">
          <span className="label-text">Precio base</span>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full"
            placeholder="15000"
            value={precioBase}
            onChange={(e) => setPrecioBase(Number(e.target.value))}
            required
          />
        </label>

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
              <img src={preview} alt="Preview" className="h-24 rounded-md object-cover" />
            </div>
          )}
        </label>

        {/* Descripción (ocupa 2 columnas) */}
        <label className="form-control md:col-span-2">
          <span className="label-text">Descripción</span>
          <textarea
            className="textarea textarea-bordered min-h-24"
            placeholder="Motocicleta deportiva"
            value={descrip}
            onChange={(e) => setDescrip(e.target.value)}
            required
          />
        </label>
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
