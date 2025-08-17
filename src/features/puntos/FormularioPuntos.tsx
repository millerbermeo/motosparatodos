import React from "react";
import { useCreatePunto, useUpdatePunto } from "../../services/puntosServices";
import { useEmpresas } from "../../services/empresasServices";
import type { Punto } from "../../shared/types/puntos";

type Props =
  | { initialValues?: undefined; mode?: "create" }
  | { initialValues: Punto; mode: "edit" };

const FormularioPuntos: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const [empresaId, setEmpresaId] = React.useState<number>(initialValues?.empresa_id ?? 0);
  const [nombrePunto, setNombrePunto] = React.useState(initialValues?.nombre_punto ?? "");
  const [telefono, setTelefono] = React.useState(initialValues?.telefono ?? "");
  const [correo, setCorreo] = React.useState(initialValues?.correo ?? "");
  const [direccion, setDireccion] = React.useState(initialValues?.direccion ?? "");

  const create = useCreatePunto();
  const update = useUpdatePunto();
  const { data: empresas, isPending: loadingEmpresas } = useEmpresas();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const base = {
      empresa_id: Number(empresaId),
      nombre_punto: nombrePunto.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      direccion: direccion.trim(),
    };

    if (mode === "edit" && initialValues?.id != null) {
      update.mutate({ id: Number(initialValues.id), ...base });

    } else {
      create.mutate(base);
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Empresa */}
        <label className="form-control w-full">
          <span className="label-text">Empresa</span>
          <select
            className="select select-bordered w-full"
            value={empresaId || ""}
            onChange={(e) => setEmpresaId(Number(e.target.value))}
            required
            disabled={loadingEmpresas}
          >
            <option value="" disabled>
              {loadingEmpresas ? "Cargando empresas..." : "Seleccione una empresa"}
            </option>
            {empresas?.map((empr) => (
              <option key={empr.id} value={empr.id}>
                {empr.nombre_empresa}
              </option>
            ))}
          </select>
        </label>

        {/* Nombre del punto */}
        <label className="form-control w-full">
          <span className="label-text">Nombre del punto</span>
          <input
            className="input input-bordered w-full"
            value={nombrePunto}
            onChange={(e) => setNombrePunto(e.target.value)}
            required
          />
        </label>

        {/* Teléfono */}
        <label className="form-control w-full">
          <span className="label-text">Teléfono</span>
          <input
            className="input input-bordered w-full"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </label>

        {/* Correo */}
        <label className="form-control w-full">
          <span className="label-text">Correo</span>
          <input
            type="email"
            className="input input-bordered w-full"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>

        {/* Dirección (2 columnas) */}
        <label className="form-control md:col-span-2">
          <span className="label-text">Dirección</span>
          <input
            className="input input-bordered w-full"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </label>
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
