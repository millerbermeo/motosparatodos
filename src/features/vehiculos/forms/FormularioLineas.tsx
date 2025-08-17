// src/components/lineas/FormularioLineas.tsx
import React from "react";
import { useCreateLinea, useUpdateLinea } from "../../../services/lineasMarcasServices";
import { useMarcas } from "../../../services/marcasServices"; // 👈 importa el hook de marcas

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: { id: number; marca: string; linea: string }; mode: "edit" };

const FormularioLineas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const [marca, setMarca] = React.useState(initialValues?.marca ?? "");
  const [linea, setLinea] = React.useState(initialValues?.linea ?? "");

  const create = useCreateLinea();
  const update = useUpdateLinea();
  const { data: marcas, isLoading: loadingMarcas } = useMarcas(); // 👈 traemos las marcas disponibles

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "edit" && initialValues) {
      update.mutate({ id: initialValues.id, marca, linea });
    } else {
      create.mutate({ marca, linea });
    }
  };

  const isLoading = create.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* SELECT DE MARCAS */}
        <label className="form-control w-full">
          <span className="label-text">Marca</span>
          <select
            className="select select-bordered w-full"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            required
            disabled={loadingMarcas}
          >
            <option value="" disabled>
              {loadingMarcas ? "Cargando marcas..." : "Seleccione una marca"}
            </option>
            {marcas?.map((m) => (
              <option key={m.id} value={m.marca}>
                {m.marca}
              </option>
            ))}
          </select>
        </label>

        {/* INPUT DE LÍNEA */}
        <label className="form-control w-full">
          <span className="label-text">Línea</span>
          <input
            className="input input-bordered w-full"
            placeholder="Ej. CBR 500R"
            value={linea}
            onChange={(e) => setLinea(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {mode === "edit" ? "Guardar cambios" : "Crear línea"}
        </button>
      </div>
    </form>
  );
};

export default FormularioLineas;
