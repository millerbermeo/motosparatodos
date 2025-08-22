// src/components/solicitudes/InfoProductoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect, type SelectOption } from "../../../shared/components/FormSelect";
import { useActualizarCredito } from "../../../services/creditosServices";
import { useParams } from "react-router-dom";
import { useCredito } from "../../../services/creditosServices"; // si tu hook está aquí
import { useWizardStore } from "../../../store/wizardStore";


type ProductoValues = {
  /** Solo lectura, viene del backend como string "Marca - Línea - Modelo" o similar */
  producto: string;
  /** Solo lectura */
  valorMoto: number | string;

  /** Editables */
  plazoCuotas: number | string;
  cuotaInicial: number | string;
  comentario?: string;
};

const plazosOptions: SelectOption[] = [6, 12, 18, 24, 36, 48, 60].map((p) => ({
  value: String(p),
  label: String(p),
}));

const toNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : 0;
};

// Arma el string "Marca - Línea - Modelo" si vienen campos sueltos
const buildProducto = (c: any): string => {
  if (typeof c?.producto === "string" && c.producto.trim()) return c.producto.trim();
  const marca = (c?.marca ?? "").toString().trim();
  const linea = (c?.linea ?? "").toString().trim();
  const modelo = (c?.modelo ?? "").toString().trim();
  return [marca, linea, modelo].filter(Boolean).join(" - ");
};

const InfoProductoFormulario: React.FC = () => {

      // Wizard (Zustand)
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const isFirst = useWizardStore((s) => s.isFirst);

  // 1) Tomar el código desde la URL
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  // 2) RHF
  const { control, handleSubmit, setValue, reset } = useForm<ProductoValues>({
    mode: "onBlur",
    defaultValues: {
      producto: "",
      valorMoto: 0,
      plazoCuotas: 6,
      cuotaInicial: 0,
      comentario: "",
    },
  });

  const actualizarCredito = useActualizarCredito();
  const isSaving = actualizarCredito.isPending;

  // 3) Traer el crédito
  const { data, isLoading, isError } = useCredito({ codigo_credito }, !!codigo_credito);

  // 4) Mapear data -> setValue (listar con setValue, no reset)
  React.useEffect(() => {
    if (!data?.success || !data?.creditos?.length) return;
    const c = data.creditos[0];

    setValue("producto", buildProducto(c), { shouldDirty: false });
    setValue("valorMoto", c?.valor_producto ?? 0, { shouldDirty: false });
    setValue("plazoCuotas", c?.plazo_meses ?? 6, { shouldDirty: false });
    setValue("cuotaInicial", c?.cuota_inicial ?? 0, { shouldDirty: false });
    setValue("comentario", c?.comentario ?? "", { shouldDirty: false });
  }, [data, setValue]);

  // 5) Guardar (solo actualiza los 3 campos)
  const onSubmit = (v: ProductoValues) => {
    const payload = {
      plazo_meses: toNumber(v.plazoCuotas) || undefined,
      cuota_inicial: toNumber(v.cuotaInicial) || 0,
      comentario: (v.comentario?.trim() ?? "") || null,
    };
    actualizarCredito.mutate(
      { codigo_credito, payload },
      {
        onSuccess: () => {
          // reflejar los confirmados sin marcar dirty
          setValue("plazoCuotas", payload.plazo_meses ?? 0, { shouldDirty: false });
          setValue("cuotaInicial", payload.cuota_inicial ?? 0, { shouldDirty: false });
          setValue("comentario", payload.comentario ?? "", { shouldDirty: false });
            next();
        },
      }
    );
  };

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3";

  if (!codigo_credito) {
    return <div className="alert alert-error">No se encontró el código del crédito en la URL.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="badge text-xl badge-success text-white mb-3">
        Solicitud de crédito - Información del producto
      </div>

      {/* Estados simples */}
      {isLoading && <div className="text-sm opacity-70">Cargando crédito…</div>}
      {isError && <div className="text-sm text-error">No se pudo cargar el crédito.</div>}
      

      <div className={grid}>
        {/* Solo lectura en un solo campo */}
        <FormInput name="producto" label="Producto" control={control} disabled placeholder="—" />
        <FormInput name="valorMoto" label="Valor de la moto" type="number" control={control} disabled placeholder="0" />

        {/* Editables */}
        <FormSelect
          name="plazoCuotas"
          label="Plazo (Cuotas)"
          control={control}
          options={plazosOptions}
          rules={{
            required: "Seleccione el plazo",
            setValueAs: (v: unknown) => String(v),
          }}
        />
        <FormInput
          name="cuotaInicial"
          label="Cuota inicial"
          type="number"
          control={control}
          placeholder="0"
          rules={{
            required: "Requerido",
            setValueAs: (v: unknown) => toNumber(v),
          }}
        />
      </div>

      {/* Comentario */}
      <div>
        <FormInput
          name="comentario"
          label="Comentario"
          control={control}
          placeholder="Ingrese el comentario de crédito"
          className="min-h-28"
        />
      </div>

{/* Controles del paso */}
      <div className="flex items-center justify-between gap-2">
        {/* ← Anterior: no sale del paso si es el primero o si está guardando */}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={prev}
          disabled={isFirst || isSaving}
          title={isFirst ? "Ya estás en el primer paso" : "Ir al paso anterior"}
        >
          ← Anterior
        </button>

        <div className="flex gap-2">
          <button
            type="reset"
            className="btn btn-ghost"
            disabled={isSaving}
            onClick={() =>
              reset({
                producto: data?.creditos?.[0] ? buildProducto(data.creditos[0]) : "",
                valorMoto: data?.creditos?.[0]?.valor_producto ?? 0,
                plazoCuotas: data?.creditos?.[0]?.plazo_meses ?? 6,
                cuotaInicial: data?.creditos?.[0]?.cuota_inicial ?? 0,
                comentario: data?.creditos?.[0]?.comentario ?? "",
              })
            }
          >
            Limpiar
          </button>

          {/* Guardar → avanza solo si éxito */}
          <button
            type="submit"
            className="btn btn-warning"
            disabled={isSaving}
            title="Guardar cambios (avanza solo si se guarda correctamente)"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default InfoProductoFormulario;
