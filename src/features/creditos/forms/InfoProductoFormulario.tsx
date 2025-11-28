// src/components/solicitudes/InfoProductoFormulario.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../../shared/components/FormInput";
import { FormSelect } from "../../../shared/components/FormSelect";
import { useActualizarCredito, useCredito } from "../../../services/creditosServices";
import { useParams } from "react-router-dom";
import { useWizardStore } from "../../../store/wizardStore";

import { TablaAmortizacionCredito } from "../../../features/creditos/TablaAmortizacionCredito"; // 👈 sin .tsx

import { unformatNumber } from "../../../shared/components/moneyUtils";

/** String con puntos/comas/etc. → número en PESOS (entero) */
const toNumberPesos = (v: unknown): number => {
  if (v == null) return 0;
  const digits = unformatNumber(String(v));
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

type ProductoValues = {
  producto: string;
  // 👇 este tipo puede terminar siendo número, string o incluso un option object
  plazoCuotas: any;
  valorMoto: number | string;
  cuotaInicial: number | string;
  comentario?: string;
};



// 🔧 NUEVO: función robusta para sacar el número de cuotas
const getPlazoCuotasNumber = (v: unknown): number => {
  // Si viene un option { value, label }
  if (v && typeof v === "object" && "value" in (v as any)) {
    const raw = (v as any).value;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  // Si viene string/number plano
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Opciones de plazo (en meses)
const PLAZO_OPTIONS = [
  { value: 12, label: "12 cuotas" },
  { value: 24, label: "24 cuotas" },
  { value: 36, label: "36 cuotas" },
];

const buildProducto = (c: any): string => {
  if (typeof c?.producto === "string" && c.producto.trim())
    return c.producto.trim();
  const marca = (c?.marca ?? "").toString().trim();
  const linea = (c?.linea ?? "").toString().trim();
  const modelo = (c?.modelo ?? "").toString().trim();
  return [marca, linea, modelo].filter(Boolean).join(" - ");
};

const InfoProductoFormulario: React.FC = () => {
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const isFirst = useWizardStore((s) => s.isFirst);

  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  const { control, handleSubmit, setValue, watch } = useForm<ProductoValues>({
    mode: "onBlur",
    defaultValues: {
      producto: "",
      valorMoto: "0",
      plazoCuotas: 12, // 👈 valor por defecto como número
      cuotaInicial: "0",
      comentario: "",
    },
  });

  const actualizarCredito = useActualizarCredito();
  const isSaving = actualizarCredito.isPending;

  const { data, isLoading, isError } = useCredito(
    { codigo_credito },
    !!codigo_credito
  );

  const creditoBackend =
    data?.success && data.creditos?.length ? data.creditos[0] : null;

  React.useEffect(() => {
    if (!creditoBackend) return;
    const c = creditoBackend;

    setValue("producto", buildProducto(c), { shouldDirty: false });
    setValue("valorMoto", String(c?.valor_producto ?? "0"), {
      shouldDirty: false,
    });

    // 👇 Si el backend trae plazo, lo ponemos como número
    setValue("plazoCuotas", Number(c?.plazo_meses ?? 12), {
      shouldDirty: false,
    });

    setValue("cuotaInicial", String(c?.cuota_inicial ?? "0"), {
      shouldDirty: false,
    });
    setValue("comentario", c?.comentario ?? "", { shouldDirty: false });
  }, [creditoBackend, setValue]);

  const onSubmit = (v: ProductoValues) => {
    // 🔧 Usamos siempre la función robusta para sacar el número de meses
    const plazo_meses = getPlazoCuotasNumber(v.plazoCuotas);

    const payload = {
      plazo_meses: plazo_meses || undefined, // si queda 0, se manda undefined
      // Backend en PESOS
      cuota_inicial: toNumberPesos(v.cuotaInicial) || 0,
      comentario: (v.comentario?.trim() ?? "") || null,
    };

    actualizarCredito.mutate(
      { codigo_credito, payload },
      {
        onSuccess: () => {
          setValue("plazoCuotas", payload.plazo_meses ?? 0, {
            shouldDirty: false,
          });
          setValue("cuotaInicial", String(payload.cuota_inicial ?? 0), {
            shouldDirty: false,
          });
          setValue("comentario", payload.comentario ?? "", {
            shouldDirty: false,
          });
          next();
        },
      }
    );
  };

  // 👇 Ojo: ahora usamos getPlazoCuotasNumber, no toNumber
  const plazoCuotasWatch = watch("plazoCuotas");
  const cuotaInicialWatch = watch("cuotaInicial");

  const plazoParaTabla = getPlazoCuotasNumber(plazoCuotasWatch);
  const cuotaInicialParaTabla = toNumberPesos(cuotaInicialWatch);

  // 👇 Aquí armamos el objeto que consume TablaAmortizacionCredito
  const creditoParaTabla =
    creditoBackend && plazoParaTabla > 0
      ? {
          valor_producto: Number(creditoBackend.valor_producto) || 0,
          cuota_inicial: cuotaInicialParaTabla,
          plazo_meses: plazoParaTabla,
          soat: creditoBackend.soat ?? "0",
          matricula: creditoBackend.matricula ?? "0",
          impuestos: creditoBackend.impuestos ?? "0",
          accesorios_total: creditoBackend.accesorios_total ?? "0",
          precio_seguros: creditoBackend.precio_seguros ?? "0",
          garantia_extendida_valor:
            creditoBackend.garantia_extendida_valor ?? "0",
        }
      : null;

  const fechaCreacionCredito = creditoBackend?.fecha_creacion ?? undefined;

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3";

  if (!codigo_credito) {
    return (
      <div className="alert alert-error">
        No se encontró el código del crédito en la URL.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="badge text-xl badge-success text-white mb-3">
          Solicitud de crédito - Información del producto
        </div>

        {isLoading && (
          <div className="text-sm opacity-70">Cargando crédito…</div>
        )}
        {isError && (
          <div className="text-sm text-error">
            No se pudo cargar el crédito.
          </div>
        )}

        <div className={grid}>
          <FormInput
            name="producto"
            label="Producto"
            control={control}
            disabled
            placeholder="—"
          />

          <FormInput
            name="valorMoto"
            label="Valor de la moto"
            type="number"
            control={control}
            disabled
            placeholder="0"
            formatThousands
          />

          <FormSelect
            name="plazoCuotas"
            label="Plazo (Cuotas)"
            control={control}
            options={PLAZO_OPTIONS}
            rules={{
              required: "La cantidad de cuotas es obligatoria",
            }}
          />

          <FormInput
            name="cuotaInicial"
            label="Cuota inicial"
            type="number"
            control={control}
            placeholder="0"
            formatThousands
            rules={{
              required: "Requerido",
              validate: (v) => toNumberPesos(v) >= 0 || "Debe ser >= 0",
            }}
          />
        </div>

        <div>
          <FormInput
            name="comentario"
            label="Comentario"
            control={control}
            placeholder="Ingrese el comentario de crédito"
            className="min-h-28"
            rules={{
              required: "La descripción es obligatoria",
              minLength: {
                value: 5,
                message: "Debe tener al menos 5 caracteres",
              },
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={prev}
            disabled={isFirst || isSaving}
            title={
              isFirst
                ? "Ya estás en el primer paso"
                : "Ir al paso anterior"
            }
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
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

      {creditoParaTabla && (
        <div className="mt-8">
          <TablaAmortizacionCredito
            credito={creditoParaTabla}
            fechaCreacion={fechaCreacionCredito}
          />
        </div>
      )}
    </>
  );
};

export default InfoProductoFormulario;
