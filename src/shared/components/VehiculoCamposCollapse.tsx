import React from "react";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";
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

type VehiculoCamposForm = {
  numero_motor: string;
  numero_chasis: string;
  color: string;
  placa: string;
  observacion_final: string;

  beneficiario_nombre: string;
  beneficiario_cedula: string;
  beneficiario_parentesco: string;
};

export const VehiculoCamposCollapse: React.FC<Props> = ({
  idCotizacion,
  tipo,
  titulo,
}) => {
  const enabled = Boolean(idCotizacion) && Boolean(tipo);

  const { data, isLoading, isError } = useVehiculoCampos(
    { tipo, idCotizacion },
    { enabled }
  );

  const { mutate: guardar, isPending } = useActualizarVehiculoCampos();

  const label =
    titulo ??
    (tipo === 1
      ? "Datos vehículo (Créditos)"
      : "Datos vehículo (Solicitar estado facturación)");

  // ✅ HOOKS SIEMPRE ARRIBA (NUNCA después de un return)
  const { control, handleSubmit, reset } = useForm<VehiculoCamposForm>({
    defaultValues: {
      numero_motor: "",
      numero_chasis: "",
      color: "",
      placa: "",
      observacion_final: "",
      beneficiario_nombre: "",
      beneficiario_cedula: "",
      beneficiario_parentesco: "",
    },
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (!data) return;

    reset({
      numero_motor: data.numero_motor ?? "",
      numero_chasis: data.numero_chasis ?? "",
      color: data.color ?? "",
      placa: data.placa ?? "",
      observacion_final: data.observacion_final ?? "",
      beneficiario_nombre: (data as any).beneficiario_nombre ?? "",
      beneficiario_cedula: (data as any).beneficiario_cedula ?? "",
      beneficiario_parentesco: (data as any).beneficiario_parentesco ?? "",
    });
  }, [data, reset]);

  const onSubmit = (values: VehiculoCamposForm) => {
    if (!enabled) return;

    guardar({
      tipo,
      id_cotizacion: idCotizacion,

      numero_motor: values.numero_motor,
      numero_chasis: values.numero_chasis,
      color: values.color,
      placa: values.placa,
      observacion_final: values.observacion_final,

      beneficiario_nombre: values.beneficiario_nombre,
      beneficiario_cedula: values.beneficiario_cedula,
      beneficiario_parentesco: values.beneficiario_parentesco,
    } as any);
  };

  // ✅ AHORA sí: renders condicionales DESPUÉS de los hooks
  if (!enabled) return null;

  // Si quieres ocultarlo cuando no existe registro (pero sin romper hooks):
  if (!isLoading && !isError && !data) return null;

  return (
    <div className="card border bg-[#F1FCF6] mt-5 border-base-300/60 shadow-sm rounded-2xl">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg font-semibold">{label}</div>
          {isLoading && <span className="loading loading-spinner loading-xs" />}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput<VehiculoCamposForm>
              name="numero_motor"
              label="Número motor"
              control={control}
              disabled={isPending}
              className="bg-white"
            />

            <FormInput<VehiculoCamposForm>
              name="numero_chasis"
              label="Número chasis"
              control={control}
              disabled={isPending}
              className="bg-white"
            />

            <FormInput<VehiculoCamposForm>
              name="color"
              label="Color"
              control={control}
              disabled={isPending}
              className="bg-white"
            />

            <FormInput<VehiculoCamposForm>
              name="placa"
              label="Placa"
              control={control}
              disabled={isPending}
              className="bg-white"
            />

            <div className="md:col-span-2">
              <FormInput<VehiculoCamposForm>
                name="observacion_final"
                label="Observación final"
                control={control}
                disabled={isPending}
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold opacity-70 mb-2">
              Beneficiario (Seguro de vida)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <FormInput<VehiculoCamposForm>
                  name="beneficiario_nombre"
                  label="Nombre del beneficiario"
                  control={control}
                  disabled={isPending}
                  className="bg-white"
                />
              </div>

              <FormInput<VehiculoCamposForm>
                name="beneficiario_cedula"
                label="Cédula del beneficiario"
                control={control}
                disabled={isPending}
                className="bg-white"
              />

              <FormInput<VehiculoCamposForm>
                name="beneficiario_parentesco"
                label="Parentesco"
                control={control}
                disabled={isPending}
                placeholder="Ej: Hijo, Esposa, Madre..."
                className="bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="btn btn-success btn-sm"
              type="submit"
              disabled={isPending}
            >
              <Save className="w-4 h-4" />
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
