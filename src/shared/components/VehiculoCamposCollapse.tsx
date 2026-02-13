import React from "react";
import { Save } from "lucide-react";
import {
  useVehiculoCampos,
  useActualizarVehiculoCampos,
  type VehiculoTipo,
} from "../../services/vehiculoCamposService";

type Props = {
  idCotizacion: string | number;
  tipo: VehiculoTipo; // 1 creditos | 2 solicitar_estado_facturacion
  titulo?: string;
};

export const VehiculoCamposCollapse: React.FC<Props> = ({
  idCotizacion,
  tipo,
  titulo,
}) => {
  const { data, isLoading } = useVehiculoCampos(
    { tipo, idCotizacion },
    { enabled: !!idCotizacion && !!tipo }
  );

  const { mutate: guardar, isPending } = useActualizarVehiculoCampos();

  const [form, setForm] = React.useState({
    numero_motor: "",
    numero_chasis: "",
    color: "",
    placa: "",
    observacion_final: "",
  });

  React.useEffect(() => {
    if (!data) return;
    setForm({
      numero_motor: data.numero_motor ?? "",
      numero_chasis: data.numero_chasis ?? "",
      color: data.color ?? "",
      placa: data.placa ?? "",
      observacion_final: data.observacion_final ?? "",
    });
  }, [data?.id]);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSave = () => {
    guardar({
      tipo,
      id_cotizacion: idCotizacion,
      numero_motor: form.numero_motor,
      numero_chasis: form.numero_chasis,
      color: form.color,
      placa: form.placa,
      observacion_final: form.observacion_final,
    });
  };

  const label =
    titulo ??
    (tipo === 1
      ? "Datos vehículo (Créditos)"
      : "Datos vehículo (Solicitar estado facturación)");

  // ✅ NO mostrar nada si no hay registro
  if (!isLoading && !data) {
    return null;
  }

  return (
    <div className="card bg-base-100 border mt-5 border-base-300/60 shadow-sm rounded-2xl">
      <div className="card-body">
        <div className="collapse collapse-arrow bg-base-200 rounded-xl">
          <input type="checkbox" />

          <div className="collapse-title text-lg font-semibold flex items-center gap-2">
            {label}
            {isLoading && <span className="loading loading-spinner loading-xs" />}
          </div>

          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="label">
                  <span className="label-text">Número motor</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={form.numero_motor}
                  onChange={onChange("numero_motor")}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Número chasis</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={form.numero_chasis}
                  onChange={onChange("numero_chasis")}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Color</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={form.color}
                  onChange={onChange("color")}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Placa</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={form.placa}
                  onChange={onChange("placa")}
                  disabled={isPending}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">Observación final</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-[90px]"
                  value={form.observacion_final}
                  onChange={onChange("observacion_final")}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="btn btn-success btn-sm"
                onClick={onSave}
                disabled={isPending}
              >
                <Save className="w-4 h-4" />
                {isPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
