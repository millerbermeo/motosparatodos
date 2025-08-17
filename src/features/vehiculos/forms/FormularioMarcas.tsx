// src/components/marcas/FormularioMarcas.tsx
import React from "react";
import { useCreateMarca, useUpdateMarca } from "../../../services/marcasServices";

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: { id: number; marca: string }; mode: "edit" };

const FormularioMarcas: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const [marca, setMarca] = React.useState(initialValues?.marca ?? "");
  const create = useCreateMarca();
  const update = useUpdateMarca();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "edit" && initialValues) {
      update.mutate({ id: initialValues.id, marca });
    } else {
      create.mutate({ marca });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="form-control w-full">
        <span className="label-text">Marca</span>
        <input
          className="input input-bordered w-full"
          placeholder="Ej. Honda"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          required
        />
      </label>

      <div className="flex justify-end gap-2">
        <button className="btn btn-primary" type="submit" disabled={create.isPending || update.isPending}>
          {mode === "edit" ? "Guardar cambios" : "Crear marca"}
        </button>
      </div>
    </form>
  );
};

export default FormularioMarcas;
